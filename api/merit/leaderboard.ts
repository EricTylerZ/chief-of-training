import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../_supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const { data, error } = await supabase
    .from("merit_leaderboard")
    .select("slug, name, ring, balance")
    .order("balance", { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ leaderboard: data || [] });
}
