import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  // Test updating a fake ID to see what schema error we get
  const { data, error } = await supabase
    .from("affiliates")
    .update({ 
      payout_method: "ccp", 
      account_number: "07999999999",
      name: "Test",
      phone: "123",
      wilaya: "Test",
      commune: "Test"
    })
    .eq("id", "8118b3c6-d667-4621-93a6-6714ac18f6cd")
    .select();
    
  console.log("Error details:", JSON.stringify(error, null, 2));
}

testUpdate();
