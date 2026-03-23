import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../_supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { data: quests, error } = await supabase
    .from("training_quests")
    .select("id, slug, title, description, icon, tier, category, merit_reward, steps_count, estimated_minutes, active")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ quests: quests || [] });
}
