(function () {
  "use strict";

  const supabase = window.studyScoutSupabase;
  const msg = document.getElementById("auth-message");
  const formSignin = document.getElementById("form-signin");
  const formSignup = document.getElementById("form-signup");
  const heading = document.getElementById("login-heading");
  const lede = document.getElementById("login-lede");
  const switchSignupWrap = document.getElementById("switch-to-signup-wrap");
  const switchSigninWrap = document.getElementById("switch-to-signin-wrap");
  const googleBtn = document.getElementById("google-signin-btn");

  function setMessage(text) {
    if (msg) msg.textContent = text || "";
  }

  function oauthRedirectUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function showMode(signup) {
    if (signup) {
      formSignin.hidden = true;
      formSignup.hidden = false;
      heading.textContent = "Create account";
      lede.textContent = "Sign up with email or Google. You can rate spots after you confirm your email if required.";
      switchSignupWrap.hidden = true;
      switchSigninWrap.hidden = false;
      history.replaceState(null, "", "#signup");
    } else {
      formSignin.hidden = false;
      formSignup.hidden = true;
      heading.textContent = "Sign in";
      lede.textContent = "Use your email or Google to access your account.";
      switchSignupWrap.hidden = false;
      switchSigninWrap.hidden = true;
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  async function redirectIfSession() {
    if (!supabase) {
      setMessage("Add your Supabase URL and anon key (see README).");
      if (googleBtn) googleBtn.disabled = true;
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      window.location.replace("index.html");
    }
  }

  async function init() {
    await redirectIfSession();

    if (window.location.hash === "#signup") {
      showMode(true);
    }

    document.getElementById("show-signup").addEventListener("click", () => showMode(true));
    document.getElementById("show-signin").addEventListener("click", () => showMode(false));

    window.addEventListener("hashchange", () => {
      showMode(window.location.hash === "#signup");
    });

    if (googleBtn) {
      googleBtn.addEventListener("click", async () => {
        if (!supabase) {
          setMessage("Supabase is not configured on this page. Paste your URL and anon key in both pages, or run in the console: localStorage.setItem(\"studyscout.supabase.url\", \"YOUR_URL\"); localStorage.setItem(\"studyscout.supabase.anonKey\", \"YOUR_ANON_KEY\"); then reload.");
          return;
        }
        setMessage("Redirecting to Google…");
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: oauthRedirectUrl(),
          },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        if (data?.url) {
          window.location.assign(data.url);
        }
      });
    }

    if (formSignin && supabase) {
      formSignin.addEventListener("submit", async (e) => {
        e.preventDefault();
        setMessage("Signing in…");
        const email = document.getElementById("signin-email").value.trim();
        const password = document.getElementById("signin-password").value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }
        window.location.href = "index.html";
      });
    }

    if (formSignup && supabase) {
      formSignup.addEventListener("submit", async (e) => {
        e.preventDefault();
        setMessage("Creating account…");
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage("Check your email to confirm your account if confirmation is enabled, then sign in.");
      });
    }
  }

  init();
})();
