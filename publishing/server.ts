import express from "express";
console.log("SERVER.TS STARTING...");
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { MercadoPagoConfig, Preference } from "mercadopago";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

let __dirname = "";
try {
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  __dirname = process.cwd();
}

const app = express();
const PORT = 3000;

app.use(compression());
app.use(cors());
app.use(express.json());

// --- RATE LIMITING ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// --- LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- MERCADO PAGO CONFIG ---
let mpClient: any;
try {
  mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "TEST-YOUR-ACCESS-TOKEN",
  });
  console.log("MercadoPago client initialized");
} catch (e) {
  console.error("Failed to initialize MercadoPago client:", e);
}

// --- UALÁ CONFIG ---
const UALA_AUTH_URL = "https://auth.ualabis.com.ar/auth/token";
const UALA_API_URL = "https://api.ualabis.com.ar/checkout";
const ualaConfig = {
  userName: process.env.UALA_USERNAME,
  clientId: process.env.UALA_CLIENT_ID,
  clientSecret: process.env.UALA_CLIENT_SECRET,
};

async function getUalaToken() {
  if (!ualaConfig.userName || !ualaConfig.clientId || !ualaConfig.clientSecret) {
    console.warn("Ualá credentials missing in environment variables");
    return null;
  }
  try {
    console.log(`Fetching Ualá token for user: ${ualaConfig.userName}`);
    const response = await axios.post(UALA_AUTH_URL, {
      user_name: ualaConfig.userName,
      client_id: ualaConfig.clientId,
      client_secret: ualaConfig.clientSecret,
      grant_type: "client_credentials",
    });
    console.log("Ualá token fetched successfully");
    return response.data.access_token;
  } catch (error: any) {
    console.error("Error getting Ualá token:", error?.response?.data || error.message);
    return null;
  }
}

// --- API ROUTES ---

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
});

// Get all orders (for Migration only, returns empty array now)
app.get("/api/pedidos", (req, res) => {
  res.json([]);
});

// Create a new order payment link
app.post("/api/pedidos", async (req, res) => {
  const orderData = req.body;
  
  const newOrder = {
    ...orderData,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "Nuevo",
    paymentStatus: "Pendiente de pago",
  };

  // If payment method is Mercado Pago or Ualá, generate payment link
  let paymentUrl = null;

  try {
    console.log(`Processing payment for method: ${orderData.paymentMethod}`);
    
    if (orderData.paymentMethod === "Mercado Pago (Transferencia)") {
      if (mpClient) {
        const preference = new Preference(mpClient);
        
        // Calculate a safe unit price
        const totalQuantity = orderData.items.reduce((acc: number, i: any) => acc + i.quantity, 0);
        const unitPrice = totalQuantity > 0 ? Math.round((orderData.total / totalQuantity) * 100) / 100 : 0;

        if (unitPrice <= 0) {
          throw new Error("El monto total debe ser mayor a 0 para generar un link de pago");
        }

        const baseUrl = process.env.APP_URL || "http://localhost:3000";
        console.log(`Using baseUrl for MP: ${baseUrl}`);

        const preferenceData = {
          body: {
            items: orderData.items.map((item: any) => ({
              id: item.productId,
              title: item.name || `Producto ${item.productId}`,
              quantity: item.quantity,
              unit_price: unitPrice,
              currency_id: "ARS"
            })),
            back_urls: {
              success: `${baseUrl}/carrito?status=success&orderId=${newOrder.id}`,
              failure: `${baseUrl}/carrito?status=failure&orderId=${newOrder.id}`,
              pending: `${baseUrl}/carrito?status=pending&orderId=${newOrder.id}`,
            },
            auto_return: "approved",
            notification_url: baseUrl.startsWith('https') ? `${baseUrl}/api/webhooks/mercadopago` : undefined,
            external_reference: newOrder.id,
          },
        };

        const response = await preference.create(preferenceData);
        paymentUrl = response.init_point;
        newOrder.externalPaymentId = response.id;
        console.log(`MP Preference created: ${response.id}, init_point: ${paymentUrl}`);
      } else {
        console.warn("MercadoPago client not initialized, using mock URL");
        paymentUrl = "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock";
      }
    } else if (orderData.paymentMethod === "Ualá (Tarjeta)") {
      const token = await getUalaToken();
      const baseUrl = process.env.APP_URL || "http://localhost:3000";
      
      if (token) {
        try {
          const ualaResponse = await axios.post(UALA_API_URL, {
            amount: orderData.total,
            description: `Pedido ${newOrder.id}`,
            callback_url: `${baseUrl}/carrito?status=success&orderId=${newOrder.id}`,
            notification_url: `${baseUrl}/api/webhooks/uala`,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          paymentUrl = ualaResponse.data.checkoutLink;
          newOrder.externalPaymentId = ualaResponse.data.uuid;
          console.log(`Ualá checkout created: ${paymentUrl}`);
        } catch (ualaError: any) {
          console.error("Error creating Ualá checkout:", ualaError?.response?.data || ualaError.message);
          // Fallback to a better mock or error
          paymentUrl = `https://checkout.ualabis.com.ar/checkout/${newOrder.id}`;
        }
      } else {
        console.warn("Ualá token not available, using fallback URL");
        paymentUrl = `https://checkout.ualabis.com.ar/checkout/${newOrder.id}`;
      }
      newOrder.externalPaymentId = `UALA-${newOrder.id}`;
    } else {
      // For Efectivo or other manual methods
      paymentUrl = null;
      newOrder.externalPaymentId = `MANUAL-${newOrder.id}`;
      console.log(`Manual payment method, no redirect needed.`);
    }
    
    res.status(201).json({ order: newOrder, paymentUrl });
  } catch (error: any) {
    console.error("Error in /api/pedidos:", error?.message || error);
    if (error?.response?.data) {
      console.error("External API Error Data:", JSON.stringify(error.response.data));
    }
    // Return a 400 error so the frontend catch block is triggered
    res.status(400).json({ 
      error: "Error al procesar el pedido", 
      message: error?.message || "Ocurrió un error inesperado al generar el pago",
      details: error?.response?.data
    });
  }
});

// Webhook for Mercado Pago
app.post("/api/webhooks/mercadopago", async (req, res) => {
  const { type, data } = req.body;
  
  if (type === "payment") {
    const paymentId = data.id;
    // In a real app, you'd fetch payment details from MP to verify
    // const payment = await new Payment(mpClient).get({ id: paymentId });
    // if (payment.status === 'approved') { ... }
    
    // For demo, we'll assume it's approved if we get the webhook
    // and we'd need the external_reference to find the order
  }
  
  res.status(200).send("OK");
});

// --- ERROR HANDLING ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, ".."),
      configFile: path.join(__dirname, "vite.config.ts"),
    });
    app.use(vite.middlewares);
  } else if (process.env.VERCEL !== "1") {
    app.use(express.static(path.join(__dirname, "..", "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
    });
  }

  // Only listen if not running on Vercel
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`APP_URL: ${process.env.APP_URL}`);
    });
  }
}

startServer();

// Export the Express API for Vercel
export default app;
