import { Order, Product, PaymentMethod } from '../types';

export class PrinterService {
  private static readonly MAX_CHARS = 32;

  static formatLine(text: string, align: 'left' | 'center' | 'right' = 'left'): string {
    if (text.length > this.MAX_CHARS) {
      return text.substring(0, this.MAX_CHARS);
    }

    const spaces = this.MAX_CHARS - text.length;
    if (align === 'center') {
      const leftSpaces = Math.floor(spaces / 2);
      return ' '.repeat(leftSpaces) + text;
    } else if (align === 'right') {
      return ' '.repeat(spaces) + text;
    }
    return text;
  }

  static formatOrder(order: Order, products: Product[]): string {
    let ticket = '';
    ticket += this.formatLine('DULZAYUNOS SORPRESA', 'center') + '\n';
    ticket += this.formatLine('Comanda de Pedido', 'center') + '\n';
    ticket += '-'.repeat(this.MAX_CHARS) + '\n';
    ticket += this.formatLine(`Orden: ${order.id}`) + '\n';
    ticket += this.formatLine(`Fecha: ${new Date(order.createdAt).toLocaleDateString()}`) + '\n';
    ticket += '-'.repeat(this.MAX_CHARS) + '\n';
    ticket += this.formatLine(`TIPO: ${order.deliveryType === 'PICKUP' ? 'RETIRO LOCAL' : 'DELIVERY'}`) + '\n';
    ticket += '-'.repeat(this.MAX_CHARS) + '\n';
    ticket += this.formatLine('CLIENTE:') + '\n';
    ticket += this.formatLine(order.customerName) + '\n';
    ticket += this.formatLine(`Tel: ${order.customerPhone}`) + '\n';
    ticket += '-'.repeat(this.MAX_CHARS) + '\n';
    ticket += this.formatLine('ENTREGA:') + '\n';
    if (order.isPrivateNeighborhood) {
      ticket += this.formatLine(`Barrio: ${order.neighborhood}`) + '\n';
      ticket += this.formatLine(`Fam: ${order.familyName}`) + '\n';
      ticket += this.formatLine(`Mza/Lote: ${order.blockLot}`) + '\n';
      ticket += this.formatLine(`Casa: ${order.houseNumber}`) + '\n';
    } else {
      ticket += this.formatLine(order.deliveryAddress) + '\n';
      if (order.neighborhood) ticket += this.formatLine(`Barrio: ${order.neighborhood}`) + '\n';
    }
    ticket += this.formatLine(`Fecha: ${order.deliveryDate}`) + '\n';
    ticket += this.formatLine(`Hora: ${order.deliveryTime}`) + '\n';
    if (order.recipientName) {
      ticket += this.formatLine('RECIBE:') + '\n';
      ticket += this.formatLine(order.recipientName) + '\n';
      ticket += this.formatLine(`Tel: ${order.recipientPhone}`) + '\n';
    }
    if (order.reference) {
      ticket += this.formatLine('REF:') + '\n';
      ticket += this.formatLine(order.reference) + '\n';
    }
    ticket += '-'.repeat(this.MAX_CHARS) + '\n';
    let paymentText = order.paymentMethod as string || 'No especificado';
    if (order.paymentMethod === PaymentMethod.TARJETA_UALA) paymentText += ' (+15%)';
    ticket += this.formatLine('PAGO: ' + paymentText) + '\n';
    ticket += '-'.repeat(this.MAX_CHARS) + '\n';
    ticket += this.formatLine('PRODUCTOS', 'center') + '\n';
    
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const nameLine = `${item.quantity}x ${product.name}`;
        ticket += this.formatLine(nameLine) + '\n';
        
        if (item.selectedOptions && item.selectedOptions.length > 0) {
          item.selectedOptions.forEach(opt => {
            const optLine = `  - ${opt.values.join(', ')}`;
            ticket += this.formatLine(optLine) + '\n';
          });
        }
      }
    });

    ticket += '-'.repeat(this.MAX_CHARS) + '\n';
    ticket += this.formatLine(`TOTAL: $${order.total.toLocaleString()}`, 'right') + '\n';
    
    if (order.notes) {
      ticket += '-'.repeat(this.MAX_CHARS) + '\n';
      ticket += this.formatLine('NOTAS:') + '\n';
      ticket += this.formatLine(order.notes) + '\n';
    }

    ticket += '\n\n\n'; // Space for cutting
    return ticket;
  }

  static async printOrder(order: Order, products: Product[]) {
    const ticket = this.formatOrder(order, products);
    try {
      // Try Bluetooth first, then USB
      await this.printViaBluetooth(ticket);
    } catch (err) {
      console.warn('Bluetooth print failed, trying USB...');
      await this.printViaUSB(ticket);
    }
  }

  static async printViaBluetooth(content: string) {
    try {
      // @ts-ignore
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      
      // Send in chunks of 20 bytes (standard BLE limit)
      for (let i = 0; i < data.length; i += 20) {
        await characteristic.writeValue(data.slice(i, i + 20));
      }

      await server.disconnect();
      return true;
    } catch (error) {
      console.error('Bluetooth Print Error:', error);
      throw error;
    }
  }

  static async printViaUSB(content: string) {
    try {
      // @ts-ignore
      const device = await navigator.usb.requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      
      await device.transferOut(1, data);
      await device.close();
      return true;
    } catch (error) {
      console.error('USB Print Error:', error);
      throw error;
    }
  }
}
