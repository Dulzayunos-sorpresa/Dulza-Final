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
const UALA_API_URL = "https://api.ualabis.com.ar"; // Production URL
const UALA_STAGING_URL = "https://api.stage.ualabis.com.ar"; // Staging URL
const ualaConfig = {
  userName: process.env.UALA_USERNAME || "test_user",
  clientId: process.env.UALA_CLIENT_ID || "test_client_id",
  clientSecret: process.env.UALA_CLIENT_SECRET || "test_client_secret",
};

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
    status: "Pendiente",
    paymentStatus: "Pendiente de pago",
  };

  // If payment method is Mercado Pago or Ualá, generate payment link
  let paymentUrl = null;

  try {
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

        const response = await preference.create({
          body: {
            items: orderData.items.map((item: any) => ({
              id: item.productId,
              title: `Producto ${item.productId}`,
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
            notification_url: `${baseUrl}/api/webhooks/mercadopago`,
            external_reference: newOrder.id,
          },
        });
        paymentUrl = response.init_point;
        newOrder.externalPaymentId = response.id;
      } else {
        console.warn("MercadoPago client not initialized, using mock URL");
        paymentUrl = "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock";
      }
    } else if (orderData.paymentMethod === "Ualá (Tarjeta)") {
      paymentUrl = `https://checkout.ualabis.com.ar/checkout/${newOrder.id}`;
      newOrder.externalPaymentId = `UALA-${newOrder.id}`;
    } else if (orderData.paymentMethod === "Pagos Internacionales (PayPal o Western Union)") {
      // Manual payment, no URL needed
      paymentUrl = null;
      newOrder.externalPaymentId = `INTL-${newOrder.id}`;
    }
    
    res.status(201).json({ order: newOrder, paymentUrl });
  } catch (error: any) {
    console.error("Error creating payment details:", error?.message || error);
    if (error?.response?.data) {
      console.error("Mercado Pago Error Data:", JSON.stringify(error.response.data));
    }
    res.status(201).json({ order: newOrder, paymentUrl: null, error: error?.message || "Error al generar link de pago" });
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
      root: __dirname,
      configFile: path.join(__dirname, "vite.config.ts"),
    });
    app.use(vite.middlewares);
  } else if (process.env.VERCEL !== "1") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
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
