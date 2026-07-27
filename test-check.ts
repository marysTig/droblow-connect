import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from("affiliates").select("*").eq("id", "8118b3c6-d667-4621-93a6-6714ac18f6cd").single();
  console.log("Profile data:", data);
  console.log("Error:", error);
}

check();
