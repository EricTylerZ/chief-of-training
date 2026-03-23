
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { data: quests, error } = await supabase
    .from("training_quests")
    .select("id, slug, title, description, icon, tier, category, merit_reward, steps_count, estimated_minutes, active")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ quests: quests || [] });
}
