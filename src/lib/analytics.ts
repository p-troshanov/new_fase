import { supabase } from "@/integrations/supabase/client";

/**
 * Persistent per-browser session id (30 days) for grouping funnel events.
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "newface:sid";
  let sid = window.localStorage.getItem(key);
  if (!sid) {
    sid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(key, sid);
  }
  return sid;
}

/**
 * Fire-and-forget analytics event. Never throws.
 *
 * Events we track:
 *   - view:*             page/component viewed
 *   - click:*            CTA clicked (offer, upsell, magnet, etc.)
 *   - quiz:step          quiz progression
 *   - quiz:complete      quiz finished
 *   - lead:submitted     lead form success
 *   - checkout:start     buy button clicked
 */
export function trackEvent(
  event: string,
  meta?: Record<string, unknown>,
  source?: string,
): void {
  if (typeof window === "undefined") return;
  try {
    void supabase
      .from("funnel_events")
      .insert({
        event: event.slice(0, 80),
        path: window.location.pathname.slice(0, 200),
        session_id: getSessionId(),
        source: source?.slice(0, 80) ?? null,
        meta: (meta ?? null) as never,
      })
      .then(() => undefined);
  } catch {
    // silent
  }
}
