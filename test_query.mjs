import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uhaskpproklqfsppejiq.supabase.co";
const supabaseAnonKey = "sb_publishable_zyxFhmjs0Ru1OnUeL0zDXg_XSbOASxF";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Starting product fetch...");
  try {
    const { data: firstPage, count, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("price", { ascending: true })
      .range(0, 999);

    if (countError) throw countError;
    console.log(`First page size: ${firstPage.length}, count: ${count}`);

    let allProducts = [...(firstPage || [])];
    
    if (count && count > 1000) {
      const totalPages = Math.ceil(count / 1000);
      
      for (let page = 1; page < totalPages; page += 2) {
        console.log(`Fetching pages ${page} and ${page+1}...`);
        const promises = [];
        promises.push(
          supabase
            .from("products")
            .select("*")
            .order("price", { ascending: true })
            .range(page * 1000, (page + 1) * 1000 - 1)
        );
        
        if (page + 1 < totalPages) {
          promises.push(
            supabase
              .from("products")
              .select("*")
              .order("price", { ascending: true })
              .range((page + 1) * 1000, (page + 2) * 1000 - 1)
          );
        }
        
        const results = await Promise.all(promises);
        for (const { data, error } of results) {
          if (error) throw error;
          if (data) allProducts = [...allProducts, ...data];
        }
      }
    }
    console.log(`Total fetched: ${allProducts.length}`);
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

test();
