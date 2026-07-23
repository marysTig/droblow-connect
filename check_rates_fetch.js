const fs = require("fs");

const envContent = fs.readFileSync(".env", "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const url = env["VITE_SUPABASE_URL"] + "/rest/v1/shipping_rates?select=*&limit=1";
const key = env["VITE_SUPABASE_ANON_KEY"];

fetch(url, {
  headers: {
    apikey: key,
    Authorization: "Bearer " + key,
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => console.error(err));
