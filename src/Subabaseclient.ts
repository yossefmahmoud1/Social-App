import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://wbjlzflrxyacrebwdffi.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseKey);
