import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../../../_supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { slug, stepId } = req.query;
  const { personSlug, response } = req.body || {};

  if (!personSlug) return res.status(400).json({ error: "personSlug required" });
  if (typeof slug !== "string" || typeof stepId !== "string") {
    return res.status(400).json({ error: "slug and stepId required" });
  }

  // Get quest
  const { data: quest } = await supabase
    .from("training_quests")
    .select("id, merit_reward")
    .eq("slug", slug)
    .single();

  if (!quest) return res.status(404).json({ error: "Quest not found" });

  // Get current step
  const { data: step } = await supabase
    .from("training_steps")
    .select("*")
    .eq("id", stepId)
    .single();

  if (!step) return res.status(404).json({ error: "Step not found" });

  // Record step completion
  let correct: boolean | null = null;
  if (step.step_type === "quiz" && response?.answer) {
    const options = step.content?.options || [];
    const correctOption = options.find((o: { correct?: boolean }) => o.correct);
    correct = correctOption ? response.answer === correctOption.value : null;
  }

  await supabase.from("training_step_completions").insert({
    person_slug: personSlug,
    step_id: stepId,
    quest_id: quest.id,
    response,
    correct,
  });

  // Award step points
  let pointsAwarded = step.merit_points || 0;
  if (step.step_type === "quiz" && correct) {
    pointsAwarded = Math.max(pointsAwarded, 22); // 22 pts for correct quiz
  }

  // Determine next step
  let nextStepId: string | null = step.next_step_id;

  // Check branches (e.g. quiz incorrect -> different path)
  if (step.branches && Array.isArray(step.branches)) {
    for (const branch of step.branches) {
      if (branch.condition === "incorrect" && correct === false) {
        nextStepId = branch.next_step_id;
        break;
      }
      if (branch.condition === "correct" && correct === true) {
        nextStepId = branch.next_step_id;
        break;
      }
    }
  }

  // Choice steps: the response contains the chosen next_step_id
  if (step.step_type === "choice" && response?.choice) {
    nextStepId = response.choice;
  }

  // Get next step data
  let nextStep = null;
  if (nextStepId) {
    const { data } = await supabase
      .from("training_steps")
      .select("*")
      .eq("id", nextStepId)
      .single();
    nextStep = data;
  }

  const questComplete = !nextStep;

  // Update progress
  const progressUpdate: Record<string, unknown> = {
    current_step_id: nextStepId,
    merit_awarded: pointsAwarded, // Will be summed later
  };

  if (questComplete) {
    progressUpdate.status = "completed";
    progressUpdate.completed_at = new Date().toISOString();

    // Award quest completion points via merit ledger
    const totalMerit = quest.merit_reward;
    await supabase.from("merit_ledger").insert({
      person_slug: personSlug,
      entry_type: "manual_award",
      amount: totalMerit,
      balance_after: 0, // Will be recalculated
      description: `Completed quest: ${slug}`,
      source_project: "chief-of-training",
      idempotency_key: `quest-complete-${quest.id}-${personSlug}`,
    });

    // Recalculate balance
    const { data: allEntries } = await supabase
      .from("merit_ledger")
      .select("amount")
      .eq("person_slug", personSlug);
    const balance = (allEntries || []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    await supabase
      .from("merit_ledger")
      .update({ balance_after: balance })
      .eq("person_slug", personSlug)
      .eq("idempotency_key", `quest-complete-${quest.id}-${personSlug}`);
  }

  await supabase
    .from("training_progress")
    .update(progressUpdate)
    .eq("person_slug", personSlug)
    .eq("quest_id", quest.id);

  return res.json({
    next_step: nextStep,
    points_awarded: pointsAwarded,
    quest_complete: questComplete,
    correct,
  });
}
