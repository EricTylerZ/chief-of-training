
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Read auth cookie from request
  const cookies = req.headers.cookie || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { cookie: cookies } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Get profile with merit ID
  const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || "");
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, merit_id, person_slug")
    .eq("id", user.id)
    .single();

  if (profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  return res.json({
    meritId: profile.merit_id,
    fullName: profile.full_name,
    email: profile.email,
    personSlug: profile.person_slug,
  });
}
