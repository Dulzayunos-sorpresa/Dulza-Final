import { Order, Product, PaymentMethod, TransferAccount } from '@/types';

export const formatOrderToWhatsApp = (order: Order, products: Product[], transferAccounts: TransferAccount[] = []) => {
  const formattedDeliveryDate = order.deliveryDate.includes('-') 
    ? order.deliveryDate.split('-').reverse().join('/') 
    : order.deliveryDate;

  const subtotal = order.items.reduce((acc, item) => {
    const p = products.find(prod => prod.id === item.productId);
    return acc + (p?.price || 0) * item.quantity;
  }, 0);

  let message = `*Pedido:* \`\`\`#${order.id.slice(-4).toUpperCase()} / ${order.id.toUpperCase()}\`\`\`\n`;
  message += `*Nombre:* ${order.customerName}\n`;
  message += `*Teléfono:* ${order.customerPhone}\n\n`;
  
  const paymentMethodLabel = {
    [PaymentMethod.TRANSFERENCIA]: 'TRANSFERENCIA bancaria o transferencia de MercadoPago',
    [PaymentMethod.TRANSFERENCIA_MP]: 'Mercado Pago (Automático)',
    [PaymentMethod.TARJETA_UALA]: 'Tarjeta (Ualá)',
    [PaymentMethod.EFECTIVO]: 'Efectivo',
    [PaymentMethod.PAGOS_INTERNACIONALES]: 'Internacional (PayPal/Western)'
  }[order.paymentMethod] || order.paymentMethod;

  message += `*Forma de pago:* ${paymentMethodLabel}\n\n`;
  
  message += `*Entrega:* ${order.deliveryType === 'PICKUP' ? 'Retiro por el local' : 'Delivery'}\n`;
  
  if (order.deliveryType === 'DELIVERY') {
    if (order.isPrivateNeighborhood) {
      message += `*Barrio Privado:* ${order.neighborhood}\n`;
      message += `*Familia:* ${order.familyName}\n`;
      message += `*Manzana y Lote:* ${order.blockLot}\n`;
      message += `*Casa N⁰:* ${order.houseNumber}\n`;
    } else {
      message += `*Dirección:* ${order.deliveryAddress}\n`;
      message += `*Referencia:* ${order.reference || 'Sin referencia'}\n`;
    }
  } else {
    message += `*Dirección:* Nicolas Avellaneda 327\n`;
  }
  
  message += `\n*📅Fecha de entrega:* ${formattedDeliveryDate}\n`;
  message += `*🕤Horario (aproximados):* ${order.deliveryTime}\n`;
  
  if (order.deliveryType === 'DELIVERY') {
    message += `*🏷️Nombre y apellido de quién recibe:* ${order.recipientName || order.customerName}\n`;
    message += `*📱Teléfono de quién recibe:* ${order.recipientPhone || order.customerPhone}\n`;
  }

  message += `*📩Tarjeta dedicatoria:* ${order.notes || 'Sin dedicatoria'}\n`;
  if (order.neighborhood) {
    message += `*Barrio:* ${order.neighborhood}\n`;
  }
  
  message += `\n_Mi pedido es_\n\n`;
  
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      message += `*${product.category}*\n`;
      message += `${item.quantity}x ${product.name}: $${((product.price || 0) * item.quantity).toLocaleString('es-AR')}\n`;
      
      if (item.selectedOptions && product.options) {
        item.selectedOptions.forEach(selectedOpt => {
          const option = product.options?.find(o => o.id === selectedOpt.optionId || o.name === selectedOpt.optionId);
          if (option) {
            selectedOpt.values.forEach(valIdOrName => {
              const val = option.values.find(v => v.id === valIdOrName || v.name === valIdOrName);
              if (val) {
                message += `  - ${option.name}: ${val.name}${val.price ? ` (+$${val.price.toLocaleString('es-AR')})` : ''}\n`;
              }
            });
          }
        });
      }
    }
  });
  
  message += `\nSubtotal: $${subtotal.toLocaleString('es-AR')}\n`;
  if (order.discountAmount && order.discountAmount > 0) {
    message += `Descuento: -$${order.discountAmount.toLocaleString('es-AR')}\n`;
  }
  if (order.shippingCost) {
    message += `Costo de envío: +$${order.shippingCost.toLocaleString('es-AR')}\n`;
  }
  
  message += `*TOTAL:* *$${(order.total || 0).toLocaleString('es-AR')}*`;
  
  return message;
};
