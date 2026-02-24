import { supabase } from '../config/supabase';

export type PastOrder = {
  orderId: string;
  items: { id: string; name: string; price: number }[];
  total: number;
  address: string;
  placedAt: string;
  status: string;
  pointsEarned?: number;
  pointsUsed?: number;
};

export async function getOrderHistory(): Promise<PastOrder[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      order_id,
      total,
      address,
      placed_at,
      status,
      points_earned,
      points_used,
      order_items (juice_id, juice_name, price)
    `)
    .eq('user_id', session.user.id)
    .order('placed_at', { ascending: false });

  if (error || !orders) return [];

  return orders.map((o: any) => ({
    orderId: o.order_id,
    total: o.total,
    address: o.address,
    placedAt: o.placed_at,
    status: o.status,
    pointsEarned: o.points_earned,
    pointsUsed: o.points_used,
    items: (o.order_items ?? []).map((i: any) => ({
      id: i.juice_id,
      name: i.juice_name,
      price: i.price,
    })),
  }));
}

export async function saveOrder(
  order: Omit<PastOrder, 'placedAt' | 'status'>,
): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: inserted, error } = await supabase
    .from('orders')
    .insert({
      user_id: session.user.id,
      order_id: order.orderId,
      total: order.total,
      address: order.address,
      points_earned: order.pointsEarned ?? 0,
      points_used: order.pointsUsed ?? 0,
      status: 'placed',
    })
    .select('id')
    .single();

  if (error || !inserted) return null;

  const itemRows = order.items.map((item) => ({
    order_id: inserted.id,
    juice_id: item.id,
    juice_name: item.name,
    price: item.price,
  }));

  await supabase.from('order_items').insert(itemRows);

  return inserted.id;
}
