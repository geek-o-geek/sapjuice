import { supabase } from '../config/supabase';

export async function getSavedAddress(userId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('saved_address')
      .eq('id', userId)
      .single();

    return data?.saved_address ?? null;
  } catch {
    return null;
  }
}

export async function saveAddress(userId: string, address: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ saved_address: address.trim() })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}

export async function clearSavedAddress(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ saved_address: null })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}
