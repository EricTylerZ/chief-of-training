
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const rawSlug = req.query.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  if (!slug) return res.status(400).json({ error: "slug required" });

  if (req.method === "GET") {
    const { data: quest, error } = await supabase
      .from("training_quests")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error || !quest) return res.status(404).json({ error: "Quest not found" });

    // Get steps
    const { data: steps } = await supabase
      .from("training_steps")
      .select("id, quest_id, order_index, step_type, title, content, next_step_id, branches, merit_points")
      .eq("quest_id", quest.id)
      .order("order_index", { ascending: true });

    // Check for progress if person_slug cookie/header exists
    const personSlug = req.headers["x-person-slug"];
    let progress = null;
    if (personSlug) {
      const { data } = await supabase
        .from("training_progress")
        .select("*")
        .eq("person_slug", personSlug)
        .eq("quest_id", quest.id)
        .single();
      progress = data;
    }

    return res.json({ quest, steps: steps || [], progress });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
