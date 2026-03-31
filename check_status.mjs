import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
  headers: {
    'apikey': process.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
  }
}).then(res => res.json()).then(data => {
  console.log("SCHEMA DE LGPD_REQUESTS:");
  console.log(JSON.stringify(data.definitions.lgpd_requests.properties.status, null, 2));
}).catch(e => console.error(e));
