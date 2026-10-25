// Bubylift ↔ Strava bridge (Supabase Edge Function, Deno).
// Puente Bubylift ↔ Strava. Deploy: supabase functions deploy strava --no-verify-jwt
// Secrets: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, APP_URL (https://bubymed.github.io/bubylift/)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const env = (k: string) => Deno.env.get(k) ?? "";
const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const CORS = {
  "Access-Control-Allow-Origin": env("APP_URL").replace(/\/$/, "").replace(/^(https?:\/\/[^/]+).*$/, "$1"),
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function userOf(req: Request): Promise<string | null> {
  const tok = (req.headers.get("authorization") ?? "").replace(/^Bearer /i, "");
  if (!tok) return null;
  const { data, error } = await admin.auth.getUser(tok);
  return error || !data.user ? null : data.user.id;
}
async function tokens(uid: string) {
  const { data } = await admin.from("strava_tokens").select("*").eq("user_id", uid).maybeSingle();
  if (!data) return null;
  if (data.expires_at - 60 > Math.floor(Date.now() / 1000)) return data;
  const r = await fetch("https://www.strava.com/oauth/token", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: env("STRAVA_CLIENT_ID"), client_secret: env("STRAVA_CLIENT_SECRET"), grant_type: "refresh_token", refresh_token: data.refresh }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  const row = { user_id: uid, athlete_id: data.athlete_id, access: j.access_token, refresh: j.refresh_token, expires_at: j.expires_at, updated_at: new Date().toISOString() };
  await admin.from("strava_tokens").upsert(row);
  return row;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url), a = url.searchParams.get("a") ?? "";
  const app = env("APP_URL") || "/";

  // Strava sends the person back here after they approve / Strava devuelve aquí a la persona
  if (a === "callback") {
    const code = url.searchParams.get("code"), state = url.searchParams.get("state") ?? "";
    const { data: st } = await admin.from("strava_state").select("*").eq("state", state).maybeSingle();
    await admin.from("strava_state").delete().eq("state", state);
    const fresh = st && Date.now() - new Date(st.created_at).getTime() < 15 * 60 * 1000;
    if (!code || !fresh || url.searchParams.get("error")) return Response.redirect(app + "#strava=no", 302);
    const r = await fetch("https://www.strava.com/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: env("STRAVA_CLIENT_ID"), client_secret: env("STRAVA_CLIENT_SECRET"), code, grant_type: "authorization_code" }),
    });
    if (!r.ok) return Response.redirect(app + "#strava=no", 302);
    const j = await r.json();
    await admin.from("strava_tokens").upsert({ user_id: st!.user_id, athlete_id: j.athlete?.id ?? null, access: j.access_token, refresh: j.refresh_token, expires_at: j.expires_at, updated_at: new Date().toISOString() });
    return Response.redirect(app + "#strava=ok", 302);
  }

  const uid = await userOf(req);
  if (!uid) return json({ error: "auth" }, 401);

  if (a === "status") {
    const { data } = await admin.from("strava_tokens").select("user_id").eq("user_id", uid).maybeSingle();
    return json({ connected: !!data });
  }
  if (a === "start") {
    const state = crypto.randomUUID().replace(/-/g, "");
    await admin.from("strava_state").insert({ state, user_id: uid });
    const cb = `${env("SUPABASE_URL")}/functions/v1/strava?a=callback`;
    const q = new URLSearchParams({ client_id: env("STRAVA_CLIENT_ID"), redirect_uri: cb, response_type: "code", approval_prompt: "auto", scope: "read,activity:read_all", state });
    return json({ url: "https://www.strava.com/oauth/authorize?" + q });
  }
  if (a === "disconnect") {
    const t = await tokens(uid);
    if (t) await fetch("https://www.strava.com/oauth/deauthorize", { method: "POST", headers: { Authorization: "Bearer " + t.access } }).catch(() => {});
    await admin.from("strava_tokens").delete().eq("user_id", uid);
    return json({ ok: true });
  }
  if (a === "activity") {
    // Find the activity that overlaps a time window and return only the numbers Bubylift shows.
    // Busca la actividad que coincide con el horario y devuelve solo los números que muestra Bubylift.
    const b = await req.json().catch(() => ({}));
    const from = Math.floor(Number(b.from)), to = Math.floor(Number(b.to));
    if (!isFinite(from) || !isFinite(to) || to <= from || to - from > 86400) return json({ error: "range" }, 400);
    const t = await tokens(uid);
    if (!t) return json({ error: "not_connected" }, 409);
    const lr = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${from - 7200}&before=${to + 7200}&per_page=20`, { headers: { Authorization: "Bearer " + t.access } });
    if (lr.status === 401) return json({ error: "not_connected" }, 409);
    if (!lr.ok) return json({ error: "strava" }, 502);
    const list = await lr.json();
    let best: any = null, bo = 0;
    for (const x of list) {
      const s = Date.parse(x.start_date) / 1000, e = s + (x.elapsed_time || 0);
      const ov = Math.min(e, to) - Math.max(s, from);
      if (ov > bo) { bo = ov; best = x; }
    }
    if (!best || bo < 300) return json({ found: false });
    const dr = await fetch(`https://www.strava.com/api/v3/activities/${best.id}`, { headers: { Authorization: "Bearer " + t.access } });
    const d = dr.ok ? await dr.json() : best;
    return json({ found: true, id: best.id, avg_hr: d.average_heartrate ?? null, max_hr: d.max_heartrate ?? null, kcal: d.calories ?? null, seconds: d.elapsed_time ?? null });
  }
  if (a === "recent") {
    // New activities since a moment, with the numbers Bubylift shows (max 15, newest first).
    // Actividades nuevas desde un momento, con los números que muestra Bubylift (máx. 15, la más reciente primero).
    const b = await req.json().catch(() => ({}));
    const after = Math.floor(Number(b.after));
    const now = Math.floor(Date.now() / 1000);
    if (!isFinite(after) || after < now - 60 * 86400 || after > now) return json({ error: "range" }, 400);
    const t = await tokens(uid);
    if (!t) return json({ error: "not_connected" }, 409);
    const lr = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=15`, { headers: { Authorization: "Bearer " + t.access } });
    if (lr.status === 401) return json({ error: "not_connected" }, 409);
    if (!lr.ok) return json({ error: "strava" }, 502);
    const list = (await lr.json()) as any[];
    const out: unknown[] = [];
    for (const x of list.slice(0, 15)) {
      let d: any = x;
      const dr = await fetch(`https://www.strava.com/api/v3/activities/${x.id}`, { headers: { Authorization: "Bearer " + t.access } });
      if (dr.ok) d = await dr.json();
      out.push({
        id: String(x.id), start: Math.floor(Date.parse(x.start_date) / 1000), seconds: d.elapsed_time ?? x.elapsed_time ?? 0,
        name: String(x.name ?? "").slice(0, 80), type: String(x.sport_type ?? x.type ?? "").slice(0, 30),
        avg_hr: d.average_heartrate ?? null, max_hr: d.max_heartrate ?? null, kcal: d.calories ?? null,
      });
    }
    return json({ activities: out });
  }
  return json({ error: "unknown" }, 404);
});
