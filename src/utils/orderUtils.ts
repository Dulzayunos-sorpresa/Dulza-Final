import { Order, Product, PaymentMethod, TransferAccount } from '@/types';

export const formatOrderToWhatsApp = (order: Order, products: Product[], transferAccounts: TransferAccount[] = []) => {
  const date = new Date(order.createdAt).toLocaleDateString('es-AR');
  const time = new Date(order.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  
  let message = `_¡Hola! Te paso el resumen de mi pedido_\n\n`;
  message += `*Pedido:* \`\`\`#${order.id.split('-')[1]?.slice(-4) || order.id}\`\`\`\n`;
  message += `*Tienda:* dulzayunos-sorpresa\n`;
  message += `*Fecha:* ${date} - ${time}hs\n`;
  message += `*Nombre:* ${order.customerName}\n`;
  message += `*Teléfono:* ${order.customerPhone}\n\n`;
  
  const paymentMethodLabel = {
    [PaymentMethod.TRANSFERENCIA]: 'Transferencia Bancaria',
    [PaymentMethod.TRANSFERENCIA_MP]: 'Mercado Pago (Automático)',
    [PaymentMethod.TARJETA_UALA]: 'Tarjeta (Ualá)',
    [PaymentMethod.EFECTIVO]: 'Efectivo',
    [PaymentMethod.PAGOS_INTERNACIONALES]: 'Internacional (PayPal/Western)'
  }[order.paymentMethod] || order.paymentMethod;

  message += `*Forma de pago:* ${paymentMethodLabel}\n`;
  
  if (order.paymentMethod === PaymentMethod.TRANSFERENCIA && order.transferAccountId) {
    const account = transferAccounts.find(a => a.id === order.transferAccountId);
    if (account) {
      message += `*Banco:* ${account.bankName}\n`;
      message += `*Titular:* ${account.accountHolder}\n`;
      message += `*${account.type}:* ${account.cbu}\n`;
      message += `*Alias:* ${account.alias}\n`;
    }
  }

  if (order.discountAmount && order.discountAmount > 0) {
    message += `*Cupón:* ${order.couponCode}\n`;
    message += `*Descuento:* -$${order.discountAmount.toLocaleString()}\n`;
  }
  
  message += `*Total:* $${(order.total || 0).toLocaleString()}\n\n`;

  if (order.paymentMethod === PaymentMethod.TRANSFERENCIA_MP) {
    message += `► _Pago realizado vía Mercado Pago_\n\n`;
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
          const option = product.options?.find(o => o.id === selectedOpt.optionId || o.name === selectedOpt.optionId);
          if (option) {
            selectedOpt.values.forEach(valIdOrName => {
              const val = option.values.find(v => v.id === valIdOrName || v.name === valIdOrName);
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
  
  message += `\n*TOTAL:* *$${(order.total || 0).toLocaleString()}*\n\n`;
  message += `_Espero tu respuesta para confirmar mi pedido_`;
  
  return message;
};
