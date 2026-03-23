
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const { data, error } = await supabase
    .from("merit_leaderboard")
    .select("slug, name, ring, balance")
    .order("balance", { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ leaderboard: data || [] });
}
