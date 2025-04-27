require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Backend-safe Supabase client (no localStorage, no browser-only options)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = {
  supabase,
};
