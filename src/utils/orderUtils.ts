import { Order, Product, PaymentMethod } from '../../types';

export const formatOrderToWhatsApp = (order: Order, products: Product[]) => {
  const date = new Date(order.createdAt).toLocaleDateString('es-AR');
  const time = new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  
  let message = `_¡Hola! Te paso el resumen de mi pedido_\n\n`;
  message += `*Pedido:* \`\`\`#${order.id.split('-')[1]?.slice(-4) || order.id}\`\`\`\n`;
  message += `*Tienda:* dulzayunos-sorpresa\n`;
  message += `*Fecha:* ${date} - ${time}hs\n`;
  message += `*Nombre:* ${order.customerName}\n`;
  message += `*Teléfono:* ${order.customerPhone}\n\n`;
  
  message += `*Forma de pago:* ${order.paymentMethod}\n`;
  
  if (order.discountAmount && order.discountAmount > 0) {
    message += `*Cupón:* ${order.couponCode}\n`;
    message += `*Descuento:* -$${order.discountAmount.toLocaleString()}\n`;
  }
  
  message += `*Total:* $${order.total.toLocaleString()}\n\n`;

  if (order.paymentMethod === PaymentMethod.TRANSFERENCIA_MP) {
    message += `► _El cbu se envía una vez recibido el pedido_\n\n`;
  } else if (order.paymentMethod === PaymentMethod.PAGOS_INTERNACIONALES) {
    message += `► _Solicito los datos para el pago internacional_\n\n`;
  }
  
  message += `*Entrega:* ${order.deliveryType === 'PICKUP' ? 'Retiro por el local' : 'Delivery'}\n`;
  
  if (order.deliveryType === 'DELIVERY') {
    if (order.isPrivateNeighborhood) {
      message += `*Barrio Privado:* ${order.neighborhood}\n`;
      message += `*Familia:* ${order.familyName}\n`;
      message += `*Manzana y Lote:* ${order.blockLot}\n`;
      message += `*Casa N⁰:* ${order.houseNumber}\n\n`;
    } else {
      message += `*Dirección:* ${order.deliveryAddress}\n`;
      message += `*Referencia:* ${order.reference || 'Sin referencia'}\n`;
      message += `*Barrio:* ${order.neighborhood || 'No especificado'}\n\n`;
    }
  } else {
    message += `*Dirección:* Nicolas Avellaneda 327\n\n`;
  }
  
  const formattedDeliveryDate = order.deliveryDate.includes('-') 
    ? order.deliveryDate.split('-').reverse().join('/') 
    : order.deliveryDate;

  message += `*📅Fecha de entrega:* ${formattedDeliveryDate}\n`;
  message += `*🕤Horario (aproximados):* ${order.deliveryTime}\n`;
  
  if (order.deliveryType === 'DELIVERY') {
    message += `*🏷️Nombre y apellido de quién recibe:* ${order.recipientName}\n`;
    message += `*📱Teléfono de quién recibe:* ${order.recipientPhone}\n`;
  }

  message += `*📩Tarjeta dedicatoria:* ${order.notes || 'Sin dedicatoria'}\n\n`;
  
  message += `_Mi pedido es_\n\n`;
  
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      message += `*${product.category}*\n`;
      
      // Calculate item options details
      const itemOptionsDetails: string[] = [];
      if (item.selectedOptions && product.options) {
        item.selectedOptions.forEach(selectedOpt => {
          const option = product.options?.find(o => o.id === selectedOpt.optionId);
          if (option) {
            selectedOpt.values.forEach(valName => {
              const val = option.values.find(v => v.name === valName);
              if (val) {
                itemOptionsDetails.push(`${option.name}: ${val.name}${val.price ? ` (+$${val.price.toLocaleString()})` : ''}`);
              }
            });
          }
        });
      }

      message += `${item.quantity}x ${product.name}\n`;
      if (itemOptionsDetails.length > 0) {
        itemOptionsDetails.forEach(opt => {
          message += `  - ${opt}\n`;
        });
      }
    }
  });
  
  message += `\n*TOTAL:* *$${order.total.toLocaleString()}*\n\n`;
  message += `_Espero tu respuesta para confirmar mi pedido_`;
  
  return encodeURIComponent(message);
};
