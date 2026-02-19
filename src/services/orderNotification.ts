import { ORDER_NOTIFY_ENDPOINT } from '../config';
import { formatPrice } from '../utils/formatPrice';

export type OrderDetails = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { name: string; price: number }[];
  total: number;
  address: string;
  notes: string;
};

export async function notifyAdminOfOrder(order: OrderDetails): Promise<boolean> {
  if (ORDER_NOTIFY_ENDPOINT.includes('YOUR_FORM_ID')) {
    return false;
  }

  const itemsList = order.items
    .map((i) => `- ${i.name}: ${formatPrice(i.price)}`)
    .join('\n');

  const body = JSON.stringify({
    _subject: `[SapJuice] New order ${order.orderId}`,
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    items: itemsList,
    total: formatPrice(order.total),
    address: order.address,
    notes: order.notes,
    message: `New order ${order.orderId} from ${order.customerName} (${order.customerEmail}).\n\nItems:\n${itemsList}\n\nTotal: ${formatPrice(order.total)}\n\nDelivery address: ${order.address}\n\nNotes: ${order.notes}`,
  });

  try {
    const res = await fetch(ORDER_NOTIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}
