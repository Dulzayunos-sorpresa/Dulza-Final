import { Order, Product, PaymentMethod } from '../types';

export interface PrinterConfig {
  vendorId: number;
  productId: number;
  paperSize: '58mm' | '80mm';
}

export class PrinterService {
  private static readonly CONFIG_KEY = 'thermal_printer_config';

  static getStoredConfig(): PrinterConfig | null {
    const stored = localStorage.getItem(this.CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  static setStoredConfig(config: PrinterConfig) {
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
  }

  static async printOrder(order: Order, products: Product[]) {
    const config = this.getStoredConfig();
    
    if (config && config.vendorId && config.productId) {
      try {
        await this.printViaUSB(order, products, config);
        return;
      } catch (error: any) {
        console.error('USB Printing failed:', error);
        const retry = confirm(`Error al imprimir por USB: ${error.message || 'Error desconocido'}.\n\n¿Deseas intentar imprimir usando el diálogo del navegador?`);
        if (!retry) return;
      }
    }

    this.printViaBrowser(order, products);
  }

  private static async printViaUSB(order: Order, products: Product[], config: PrinterConfig) {
    let device: USBDevice | undefined;
    
    try {
      const devices = await navigator.usb.getDevices();
      device = devices.find(d => d.vendorId === config.vendorId && d.productId === config.productId);

      if (!device) {
        device = await navigator.usb.requestDevice({
          filters: [{ vendorId: config.vendorId, productId: config.productId }]
        });
      }

      if (!device) throw new Error('No se seleccionó ninguna impresora.');

      await device.open();
      
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      
      const interfaceNum = 0; 
      await device.claimInterface(interfaceNum);

      const endpoint = device.configuration?.interfaces[interfaceNum].alternate.endpoints.find(
        e => e.direction === 'out' && e.type === 'bulk'
      );

      if (!endpoint) {
        throw new Error('No se encontró el canal de salida (bulk out endpoint) en la impresora.');
      }

      const encoder = new TextEncoder();
      const esc = '\x1B';
      const gs = '\x1D';
      
      const init = esc + '@';
      const center = esc + 'a' + '\x01';
      const left = esc + 'a' + '\x00';
      const boldOn = esc + 'E' + '\x01';
      const boldOff = esc + 'E' + '\x00';
      const doubleSize = gs + '!' + '\x11';
      const normalSize = gs + '!' + '\x00';
      const cut = esc + 'i';

      // Calculations
      const subtotal = order.items.reduce((acc, item) => {
        const p = products.find(prod => prod.id === item.productId);
        return acc + (p?.price || 0) * item.quantity;
      }, 0);
      const surcharge = order.paymentMethod === PaymentMethod.TARJETA_UALA ? Math.round(subtotal * 0.15) : 0;

      let data = init;
      
      // Header
      data += center + boldOn + doubleSize + "DULZAYUNOS\n" + normalSize + boldOff;
      data += "Pedido #" + order.id.slice(-6) + "\n";
      data += new Date(order.createdAt).toLocaleString('es-AR') + "\n\n";
      
      // Customer Info
      data += left + boldOn + "CLIENTE:\n" + boldOff;
      data += order.customerName + "\n";
      data += order.customerPhone + "\n";
      data += "Pago: " + order.paymentMethod + "\n\n";

      // Delivery Info
      data += boldOn + "ENTREGA:\n" + boldOff;
      data += (order.deliveryType === 'PICKUP' ? 'Retiro en Local' : 'Delivery') + "\n";
      data += (order.deliveryAddress || 'No especificada') + "\n";
      data += "Fecha: " + order.deliveryDate + "\n";
      data += "Hora: " + (order.deliveryTime || 'N/A') + "\n\n";

      if (order.recipientName) {
        data += boldOn + "RECIBE:\n" + boldOff;
        data += order.recipientName + "\n";
        data += "Tel: " + (order.recipientPhone || 'N/A') + "\n\n";
      }

      if (order.notes) {
        data += boldOn + "DEDICATORIA:\n" + boldOff;
        data += "\"" + order.notes + "\"\n\n";
      }

      data += boldOn + "DETALLE:\n" + boldOff;
      order.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId);
        data += item.quantity + "x " + (p?.name || 'Producto') + "\n";
        if (item.selectedOptions) {
          item.selectedOptions.forEach(opt => {
            data += "  - " + opt.values.join(', ') + "\n";
          });
        }
      });

      // Totals
      data += "\n" + left;
      data += "Subtotal: $" + subtotal.toLocaleString('es-AR') + "\n";
      if (order.discountAmount) {
        data += "Descuento: -$" + order.discountAmount.toLocaleString('es-AR') + "\n";
      }
      if (order.shippingCost) {
        data += "Envio: +$" + order.shippingCost.toLocaleString('es-AR') + "\n";
      }
      if (surcharge > 0) {
        data += "Recargo: +$" + surcharge.toLocaleString('es-AR') + "\n";
      }
      data += boldOn + "TOTAL: $" + order.total.toLocaleString('es-AR') + boldOff + "\n";
      data += "\n\n\n\n" + cut;

      const bytes = encoder.encode(data);
      await device.transferOut(endpoint.endpointNumber, bytes);
      await device.close();
    } catch (err: any) {
      if (device && device.opened) {
        await device.close();
      }
      throw err;
    }
  }

  private static printViaBrowser(order: Order, products: Product[]) {
    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.top = '-1000px';
    printWindow.style.left = '-1000px';
    document.body.appendChild(printWindow);

    const doc = printWindow.contentWindow?.document;
    if (!doc) return;

    const subtotal = order.items.reduce((acc, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return acc + (p?.price || 0) * item.quantity;
    }, 0);

    const surcharge = order.paymentMethod === PaymentMethod.TARJETA_UALA ? Math.round(subtotal * 0.15) : 0;
    
    const formattedDeliveryDate = order.deliveryDate.includes('-') 
      ? order.deliveryDate.split('-').reverse().join('/') 
      : order.deliveryDate;

    const content = `
      <html>
        <head>
          <style>
            @page {
              margin: 0;
              size: auto;
            }
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.3;
              width: 100%;
              max-width: 72mm;
              margin: 0 auto;
              padding: 3mm;
              color: #000;
              background: #fff;
            }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .hr { border-top: 1px dashed #000; margin: 6px 0; }
            .item { margin-bottom: 6px; }
            .item-category { font-weight: bold; text-decoration: underline; margin-bottom: 1px; font-size: 11px; }
            .item-header { display: flex; justify-content: space-between; align-items: flex-start; }
            .item-name { flex: 1; padding-right: 5px; }
            .item-price { white-space: nowrap; }
            .item-options { font-size: 10px; margin-left: 8px; color: #444; font-style: italic; }
            .section { margin-bottom: 10px; }
            .total-row { display: flex; justify-content: space-between; margin-top: 3px; }
            .grand-total { font-size: 16px; margin-top: 6px; border-top: 1px solid #000; padding-top: 6px; }
            .highlight { background-color: #f0f0f0; padding: 1px 3px; border-radius: 2px; }
            .order-id { font-family: monospace; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="section">
            <div class="bold order-id">Pedido: #${order.id.slice(-6)}</div>
            <div style="font-size: 10px; color: #666;">ID: ${order.id}</div>
            <div>Tienda: dulzayunos-sorpresa</div>
            <div>Fecha: ${new Date(order.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}hs</div>
            <div class="hr"></div>
            <div>Nombre: <span class="bold">${order.customerName}</span></div>
            <div>Teléfono: ${order.customerPhone}</div>
            <div>Forma de pago: <span class="bold">${order.paymentMethod}</span></div>
          </div>

          <div class="hr"></div>

          <div class="section">
            <div class="bold">Entrega: <span class="highlight">${order.deliveryType === 'PICKUP' ? 'Retiro en Local' : 'Delivery'}</span></div>
            ${order.deliveryType === 'DELIVERY' ? `
              <div>Dirección: <span class="bold highlight">${order.deliveryAddress || 'No especificada'}</span></div>
              ${order.reference ? `<div>Ref: <span class="highlight">${order.reference}</span></div>` : ''}
              ${order.neighborhood ? `<div>Barrio: <span class="bold">${order.neighborhood}</span></div>` : ''}
            ` : `
              <div>Retira por: <span class="bold">Nicolas Avellaneda 327</span></div>
            `}
            <div>Fecha: <span class="bold highlight">${formattedDeliveryDate}</span></div>
            <div>Horario: <span class="bold highlight">${order.deliveryTime || 'No especificado'}</span></div>
            
            ${order.recipientName ? `
              <div style="margin-top: 4px; border-top: 1px dotted #eee; padding-top: 4px;">
                <div>Recibe: <span class="bold">${order.recipientName}</span></div>
                <div>Tel: ${order.recipientPhone}</div>
              </div>
            ` : ''}
            
            ${order.notes ? `
              <div style="margin-top: 6px; padding: 4px; border: 1px solid #000; font-style: italic;">
                <div class="bold" style="font-size: 10px; text-decoration: underline;">TARJETA DEDICATORIA:</div>
                "${order.notes}"
              </div>
            ` : ''}
          </div>

          <div class="hr"></div>

          <div class="section">
            <div class="bold text-center" style="font-size: 11px; margin-bottom: 5px;">DETALLE DEL PEDIDO</div>
            ${order.items.map(item => {
              const p = products.find(prod => prod.id === item.productId);
              return `
                <div class="item">
                  <div class="item-category">${p?.category || 'Producto'}</div>
                  <div class="item-header">
                    <span class="item-name">${item.quantity}x ${p?.name || 'Producto'}</span>
                    <span class="item-price">$${((p?.price || 0) * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                  ${item.selectedOptions?.map(opt => {
                    const optionName = p?.options?.find(o => o.id === opt.optionId || o.name === opt.optionId)?.name || opt.optionId;
                    return `
                      <div class="item-options">${optionName}: ${opt.values.join(', ')}</div>
                    `;
                  }).join('') || ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="hr"></div>

          <div class="section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${subtotal.toLocaleString('es-AR')}</span>
            </div>
            ${order.discountAmount ? `
              <div class="total-row">
                <span>Descuento:</span>
                <span>-$${order.discountAmount.toLocaleString('es-AR')}</span>
              </div>
            ` : ''}
            ${order.shippingCost ? `
              <div class="total-row">
                <span>Costo de envío:</span>
                <span>+$${order.shippingCost.toLocaleString('es-AR')}</span>
              </div>
            ` : ''}
            ${surcharge > 0 ? `
              <div class="total-row">
                <span>Recargo medio pago:</span>
                <span>+$${surcharge.toLocaleString('es-AR')}</span>
              </div>
            ` : ''}
            <div class="total-row bold grand-total">
              <span>TOTAL:</span>
              <span>$${order.total.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div class="text-center" style="margin-top: 30px; font-size: 11px; border-top: 1px dashed #ccc; padding-top: 10px;">
            ¡Gracias por elegir Dulzayunos!
            <br>www.dulzayunos.com.ar
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(content);
    doc.close();

    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    }, 800);
  }
}
