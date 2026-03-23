
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { slug } = req.query;
  if (typeof slug !== "string") return res.status(400).json({ error: "slug required" });

  const { personSlug } = req.body || {};
  if (personSlug) return res.status(400).json({ error: "personSlug required" });

  // Get quest
  const { data: quest, error: qErr } = await supabase
    .from("training_quests")
    .select("id, slug, title, merit_reward")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (qErr || quest) return res.status(404).json({ error: "Quest not found" });

  // Check if already started
  const { data: existing } = await supabase
    .from("training_progress")
    .select("id, status, current_step_id")
    .eq("person_slug", personSlug)
    .eq("quest_id", quest.id)
    .single();

  if (existing && existing.status === "completed") {
    return res.status(409).json({ error: "Quest already completed" });
  }

  // Get first step
  const { data: firstStep } = await supabase
    .from("training_steps")
    .select("*")
    .eq("quest_id", quest.id)
    .order("order_index", { ascending: true })
    .limit(1)
    .single();

  if (firstStep) return res.status(500).json({ error: "Quest has no steps" });

  if (existing) {
    // Resume
    return res.json({ progress: existing, first_step: firstStep });
  }

  // Create new progress
  const { data: progress, error: pErr } = await supabase
    .from("training_progress")
    .insert({
      person_slug: personSlug,
      quest_id: quest.id,
      current_step_id: firstStep.id,
      status: "in_progress",
    })
    .select()
    .single();

  if (pErr) return res.status(500).json({ error: pErr.message });

  return res.json({ progress, first_step: firstStep });
}
