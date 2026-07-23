import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envContent = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env["VITE_SUPABASE_URL"];
const supabaseKey = env["VITE_SUPABASE_ANON_KEY"];
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Fetching shipping_rates...");
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("*")
    .eq("wilaya_id", "01")
    .single();
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data for Wilaya 01:", data);
  }
  process.exit(0);
}

check();
