import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

export const getClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_KEY || "";
  return createClient(supabaseUrl, supabaseKey);
};
