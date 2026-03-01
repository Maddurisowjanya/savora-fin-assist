import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bbjbkrhqtlckcwbzttem.supabase.co';
const supabaseAnonKey = 'sb_publishable_m7AxUAXpmt9G8fcZI3ghTA_vtgnvCt1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
