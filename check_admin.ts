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
  console.log("=== Vérification des affiliés avec leur rôle ===\n");

  const { data: affiliates, error } = await supabase
    .from("affiliates")
    .select("id, name, email, role")
    .order("joined", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Erreur:", error.message);
    console.log("\n⚠️  Si l'erreur mentionne 'column role does not exist', la colonne n'existe pas dans Supabase.");
    process.exit(1);
  }

  if (!affiliates || affiliates.length === 0) {
    console.log("Aucun affilié trouvé dans la table.");
    process.exit(0);
  }

  console.log("Affiliés trouvés :");
  affiliates.forEach((a: any) => {
    const marker = a.role === "admin" ? " ✅ ADMIN" : "";
    console.log(`  - ${a.email} | role: ${a.role ?? "(null/vide)"}${marker}`);
  });

  const admins = affiliates.filter((a: any) => a.role === "admin");
  console.log(`\n📊 Total: ${affiliates.length} affilié(s), dont ${admins.length} admin(s)`);

  process.exit(0);
}

check();
