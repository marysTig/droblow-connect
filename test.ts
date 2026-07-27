import { supabase } from "./src/lib/supabase";

async function run() {
  const { data, error } = await supabase.from("affiliates").select("*").limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
  
  if (data && data.length > 0) {
    const id = data[0].id;
    const { error: updateError } = await supabase.from("affiliates").update({ phone: "123456" }).eq("id", id);
    console.log("Update Error:", updateError);
  }
}

run();
