import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envContent = fs.readFileSync(".env", "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env["VITE_SUPABASE_URL"];

// ⚠️  Utilise la SERVICE ROLE KEY pour contourner les RLS policies
// Tu dois l'ajouter dans ton .env ou la mettre directement ici
const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"] ?? env["VITE_SUPABASE_SERVICE_ROLE_KEY"];

if (!serviceKey) {
  console.error("❌ Clé service_role introuvable.");
  console.log("Ajoute SUPABASE_SERVICE_ROLE_KEY dans ton fichier .env");
  console.log("(Tu la trouves dans Supabase > Project Settings > API > service_role)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 👇 Mets ici l'email de ton compte admin
const ADMIN_EMAIL = process.argv[2];

if (!ADMIN_EMAIL) {
  console.error("❌ Usage: npx tsx set_admin.ts <email>");
  console.error("   Ex:    npx tsx set_admin.ts tigriinnemarys@gmail.com");
  process.exit(1);
}

async function setAdmin() {
  console.log(`\n🔧 Mise à jour du rôle admin pour: ${ADMIN_EMAIL}\n`);

  const { data, error } = await supabase
    .from("affiliates")
    .update({ role: "admin" })
    .eq("email", ADMIN_EMAIL)
    .select("id, name, email, role");

  if (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error(`❌ Aucun affilié trouvé avec l'email: ${ADMIN_EMAIL}`);
    process.exit(1);
  }

  console.log("✅ Rôle mis à jour avec succès !");
  console.log(`   Compte: ${data[0].name} (${data[0].email})`);
  console.log(`   Rôle:   ${data[0].role}`);
  console.log("\n🎉 Reconnecte-toi pour accéder au panneau admin (/admin)");

  process.exit(0);
}

setAdmin();
