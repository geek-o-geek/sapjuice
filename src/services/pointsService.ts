import { supabase } from '../config/supabase';

export async function getPointsBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('points_balance')
    .eq('id', userId)
    .single();

  if (error || !data) return 0;
  return data.points_balance;
}

export async function creditPoints(userId: string, amount: number): Promise<number> {
  const current = await getPointsBalance(userId);
  const updated = current + amount;
  await supabase
    .from('profiles')
    .update({ points_balance: updated })
    .eq('id', userId);
  return updated;
}

export async function deductPoints(userId: string, amount: number): Promise<number> {
  const current = await getPointsBalance(userId);
  const updated = Math.max(0, current - amount);
  await supabase
    .from('profiles')
    .update({ points_balance: updated })
    .eq('id', userId);
  return updated;
}

/** 1 point per 10 rupees spent */
export function calculateEarnedPoints(orderTotal: number): number {
  return Math.floor(orderTotal / 10);
}

/** Max redeemable = min(balance, 50% of subtotal) */
export function calculateMaxRedeemable(balance: number, subtotal: number): number {
  return Math.min(balance, Math.floor(subtotal / 2));
}
