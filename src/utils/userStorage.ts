import { supabase } from '../config/supabase';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms),
    ),
  ]);
}

const AUTH_TIMEOUT = 12000;

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const { data: { session } } = await withTimeout(
      supabase.auth.getSession(),
      AUTH_TIMEOUT,
    );
    if (!session?.user) return null;

    const { data: profile } = await withTimeout(
      supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', session.user.id)
        .single(),
      AUTH_TIMEOUT,
    );

    if (profile) {
      return {
        id: session.user.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };
    }

    return {
      id: session.user.id,
      name: session.user.user_metadata?.name ?? '',
      email: session.user.email ?? '',
      phone: session.user.user_metadata?.phone ?? '',
    };
  } catch {
    return null;
  }
}

export async function signUpUser(
  email: string,
  password: string,
  name: string,
  phone: string,
): Promise<{ user: StoredUser | null; error: string | null; needsConfirmation?: boolean }> {
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      }),
      AUTH_TIMEOUT,
    );

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Sign up failed' };

    if (!data.session) {
      return { user: null, error: null, needsConfirmation: true };
    }

    return {
      user: { id: data.user.id, name, email, phone },
      error: null,
    };
  } catch (e: any) {
    const msg = e?.message === 'Request timed out'
      ? 'Request timed out. Check your connection.'
      : (e?.message ?? 'Network error');
    return { user: null, error: msg };
  }
}

export async function signInUser(
  email: string,
  password: string,
): Promise<{ user: StoredUser | null; error: string | null }> {
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      AUTH_TIMEOUT,
    );

    if (error) return { user: null, error: error.message };
    if (!data.user || !data.session) return { user: null, error: 'Sign in failed' };

    const userId = data.user.id;
    const fallbackUser: StoredUser = {
      id: userId,
      name: data.user.user_metadata?.name ?? '',
      email: data.user.email ?? email,
      phone: data.user.user_metadata?.phone ?? '',
    };

    try {
      const { data: profile } = await withTimeout(
        supabase
          .from('profiles')
          .select('name, email, phone')
          .eq('id', userId)
          .single(),
        5000,
      );

      if (profile) {
        return {
          user: { id: userId, name: profile.name, email: profile.email, phone: profile.phone },
          error: null,
        };
      }
    } catch {}

    return { user: fallbackUser, error: null };
  } catch (e: any) {
    const msg = e?.message === 'Request timed out'
      ? 'Request timed out. Check your connection.'
      : (e?.message ?? 'Network error');
    return { user: null, error: msg };
  }
}

export async function clearStoredUser(): Promise<void> {
  await supabase.auth.signOut();
}
