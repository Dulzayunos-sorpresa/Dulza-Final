import { Order, Product, PaymentMethod } from '../types';

export class PrinterService {
  static async printOrder(order: Order, products: Product[]) {
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
              max-width: 72mm; /* Standard for 80mm, will shrink for 58mm */
              margin: 0 auto;
              padding: 3mm;
              color: #000;
              background: #fff;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
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

    // Wait for images and fonts to load
    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    }, 800);
  }
}
