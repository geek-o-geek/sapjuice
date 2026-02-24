import { supabase } from '../config/supabase';

export type OrderStatus = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered';

export const ORDER_STATUSES: OrderStatus[] = [
  'placed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  placed: 'Your order has been received',
  preparing: 'Your juices are being freshly pressed',
  out_for_delivery: 'Your rider is on the way',
  delivered: 'Enjoy your fresh juice!',
};

export const PROGRESSION_DELAYS_MS: Record<string, number> = {
  placed: 8_000,
  preparing: 15_000,
  out_for_delivery: 20_000,
};

export async function getOrderStatus(
  orderId: string,
): Promise<{ status: OrderStatus; updatedAt: string } | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('status, updated_at')
    .eq('order_id', orderId)
    .single();

  if (error || !data) return null;
  return { status: data.status as OrderStatus, updatedAt: data.updated_at };
}

export function subscribeToOrder(
  orderId: string,
  callback: (status: OrderStatus) => void,
): () => void {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
          callback(payload.new.status as OrderStatus);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Auto-advance order from "placed" to "preparing" after a short delay.
 * "out_for_delivery" and "delivered" are admin/delivery-driven.
 */
export function simulateOrderProgression(orderId: string): () => void {
  const timer = setTimeout(async () => {
    await supabase
      .from('orders')
      .update({ status: 'preparing' })
      .eq('order_id', orderId);
  }, PROGRESSION_DELAYS_MS.placed ?? 8_000);

  return () => clearTimeout(timer);
}
