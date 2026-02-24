import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://bglkexoypjbhxucrktuy.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbGtleG95cGpiaHh1Y3JrdHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTM5NzQsImV4cCI6MjA4NzI4OTk3NH0.AWkpHasR39iFoUcRga64qDwGR46qf8wDcfBIC_RiHIg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
