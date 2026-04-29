(function () {
  "use strict";

  const envUrl = window.STUDYSCOUT_SUPABASE_URL || "";
  const envAnonKey = window.STUDYSCOUT_SUPABASE_ANON_KEY || "";
  const localUrl = window.localStorage.getItem("studyscout.supabase.url") || "";
  const localAnonKey = window.localStorage.getItem("studyscout.supabase.anonKey") || "";

  function isPlaceholder(s) {
    return !s || s.includes("%%");
  }

  const SUPABASE_URL = !isPlaceholder(envUrl) ? envUrl : localUrl;
  const SUPABASE_ANON_KEY = !isPlaceholder(envAnonKey) ? envAnonKey : localAnonKey;
  const hasTemplateValues = isPlaceholder(SUPABASE_URL) || isPlaceholder(SUPABASE_ANON_KEY);

  if (!window.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY || hasTemplateValues) {
    window.studyScoutSupabase = null;
    return;
  }

  window.studyScoutSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
})();
