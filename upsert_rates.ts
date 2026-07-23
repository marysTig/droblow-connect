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

async function run() {
  const fileContent = fs.readFileSync("tarifs_livraison_wilayas.md", "utf-8");
  const lines = fileContent.split("\n");

  const records = [];

  for (const line of lines) {
    const match = line.match(
      /^\|\s*(\d{2})\s*\|\s*.*?\s*\|\s*.*?\s*\|\s*.*?\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/,
    );
    if (match) {
      const wilaya_id = match[1];
      const homeRaw = match[2].trim();
      const deskRaw = match[3].trim();

      const is_available = homeRaw !== "غير متوفر" && deskRaw !== "غير متوفر" && homeRaw !== "—";

      let home_delivery = 0;
      let desk_delivery = 0;

      if (is_available) {
        home_delivery = parseInt(homeRaw.replace(/\D/g, ""), 10) || 0;
        desk_delivery = parseInt(deskRaw.replace(/\D/g, ""), 10) || 0;
      }

      records.push({
        wilaya_id,
        home_delivery,
        desk_delivery,
        is_available,
      });
    }
  }

  const { data, error } = await supabase
    .from("shipping_rates")
    .upsert(records, { onConflict: "wilaya_id" });
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Successfully inserted rows!");
  }
}

run().catch(console.error);
