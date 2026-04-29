(function () {
  "use strict";

  const supabase = window.studyScoutSupabase;
  const INITIAL_SPOTS = [
    {
      id: 1,
      name: "Carrier Library",
      area: "Main Campus",
      type: "Library",
      description:
        "Carrier Library offers multiple study areas, including quieter upper floors and busier lower levels. It is often crowded during exam periods.",
      noise: "Mixed",
      crowd: "High",
      outlets: 4,
      wifi: 5,
      comfort: 4,
      productivity: 5,
      lateNight: false,
      foodNearby: true,
      bestFor: ["Finals grind", "Solo studying", "Late night"],
      tips: "Go upstairs if you need quiet. First floor gets loud fast.",
      busySpike: "weekday_peak",
      phaseSensitivity: 1.35,
      temporarilyClosed: true,
      closedMessage: "Reopening August 2026",
    },
    {
      id: 2,
      name: "Rose Library",
      area: "East Campus",
      type: "Library",
      description: "Rose Library is generally quieter than Carrier and has good natural light. It is a good option for focused study sessions.",
      noise: "Quiet",
      crowd: "Medium",
      outlets: 4,
      wifi: 5,
      comfort: 4,
      productivity: 5,
      lateNight: true,
      foodNearby: true,
      bestFor: ["Quiet studying", "STEM homework", "Long sessions"],
      tips: "Great escape when Carrier feels like a concert.",
      busySpike: "weekday_peak",
      phaseSensitivity: 1.3,
    },
    {
      id: 3,
      name: "Student Success Center",
      area: "Main Campus",
      type: "Student Center",
      description: "The Student Success Center has steady daytime traffic due to nearby tutoring and advising services. It is well suited for studying between classes.",
      noise: "Mixed",
      crowd: "Medium",
      outlets: 3,
      wifi: 5,
      comfort: 3,
      productivity: 4,
      lateNight: false,
      foodNearby: true,
      bestFor: ["Between classes", "Group work", "Daytime studying"],
      tips: "Better for shorter blocks than deep focus.",
      busySpike: "between_classes",
      phaseSensitivity: 1.05,
    },
    {
      id: 4,
      name: "Festival Conference & Student Center",
      area: "East Campus",
      type: "Student Center",
      description: "Festival provides a casual environment with frequent activity and nearby dining. It is better for group work than quiet individual study.",
      noise: "Loud",
      crowd: "Medium",
      outlets: 3,
      wifi: 4,
      comfort: 3,
      productivity: 3,
      lateNight: false,
      foodNearby: true,
      bestFor: ["Group projects", "Food nearby", "Casual work"],
      tips: "Expect chatter-bring headphones.",
      busySpike: "lunch",
      phaseSensitivity: 0.95,
    },
    {
      id: 5,
      name: "EnGeo / King Hall",
      area: "East Campus",
      type: "Academic Building",
      description: "EnGeo and King Hall are typically less crowded and usually have available seating. They are useful alternatives when library spaces are busy.",
      noise: "Quiet",
      crowd: "Low",
      outlets: 3,
      wifi: 4,
      comfort: 3,
      productivity: 4,
      lateNight: false,
      foodNearby: false,
      bestFor: ["Hidden gem", "Quiet studying", "Low crowd"],
      tips: "Not glamorous, but reliably calm.",
      busySpike: "none",
      phaseSensitivity: 0.9,
    },
    {
      id: 6,
      name: "Taylor Down Under / The Union",
      area: "Main Campus",
      type: "Student Center",
      description: "Taylor Down Under in The Union is centrally located and usually active throughout the day. It is convenient for shorter sessions and meeting with classmates.",
      noise: "Mixed",
      crowd: "High",
      outlets: 3,
      wifi: 4,
      comfort: 3,
      productivity: 3,
      lateNight: true,
      foodNearby: true,
      bestFor: ["Between classes", "Food nearby", "Late night"],
      tips: "Good for quick sessions if you can grab a quieter corner.",
      busySpike: "lunch",
      phaseSensitivity: 1,
    },
    {
      id: 7,
      name: "College of Business (CoB)",
      area: "Main Campus",
      type: "Academic Building",
      description: "The College of Business has modern study spaces and generally reliable seating. It is convenient for students with classes on main campus.",
      noise: "Mixed",
      crowd: "Medium",
      outlets: 4,
      wifi: 5,
      comfort: 4,
      productivity: 4,
      lateNight: false,
      foodNearby: false,
      bestFor: ["Between classes", "Solo studying", "STEM homework"],
      tips: "Try upper-floor spaces for better focus.",
      busySpike: "between_classes",
      phaseSensitivity: 1.05,
    },
  ];

  const crowdBase = { Low: 28, Medium: 52, High: 78 };
  const studentAggregates = new Map();
  let currentUser = null;

  const state = { sortBy: "busy", sortDir: "asc" };

  const els = {
    campusPulse: document.getElementById("campus-pulse"),
    sortBy: document.getElementById("sort-by"),
    sortAsc: document.getElementById("sort-asc"),
    sortDesc: document.getElementById("sort-desc"),
    spotGrid: document.getElementById("spot-grid"),
    resultsCount: document.getElementById("results-count"),
    emptyState: document.getElementById("empty-state"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modal: document.getElementById("modal"),
    headerAuthGuest: document.getElementById("header-auth-guest"),
    headerAuthUser: document.getElementById("header-auth-user"),
    headerUserEmail: document.getElementById("header-user-email"),
    logoutBtn: document.getElementById("logout-btn"),
    infoBtn: document.getElementById("info-btn"),
    infoBackdrop: document.getElementById("info-backdrop"),
    infoClose: document.getElementById("info-close"),
  };

  function schoolPhase(now) {
    const month = now.getMonth() + 1;
    const day = now.getDate();
    if ((month === 12 && day >= 1) || (month === 5 && day >= 1 && day <= 15)) return "finals";
    if ((month === 10 && day >= 1 && day <= 25) || (month === 3 && day >= 1 && day <= 31)) return "midterm";
    if (month === 1 || (month === 8 && day >= 20) || month === 9) return "start";
    if (month === 6 || month === 7 || (month === 12 && day >= 18)) return "break";
    return "regular";
  }

  function schoolPhaseWeight(phase) {
    if (phase === "finals") return 1.25;
    if (phase === "midterm") return 1.12;
    if (phase === "start") return 1.05;
    if (phase === "break") return 0.7;
    return 1;
  }

  function estimateBusyPercent(spot, now) {
    const hour = now.getHours();
    const dow = now.getDay();
    const isWeekday = dow >= 1 && dow <= 5;
    const isWeekend = dow === 0 || dow === 6;
    let p = crowdBase[spot.crowd] ?? 50;
    const spike = spot.busySpike || "none";

    if (isWeekday && hour >= 10 && hour <= 16) {
      if (spike === "weekday_peak" || spike === "between_classes") p += 14;
      if (spike === "lunch" && hour >= 11 && hour <= 14) p += 12;
    }
    if (isWeekday && hour >= 17 && hour <= 20 && spike === "evening") p += 10;
    if (isWeekend && hour >= 12 && hour <= 18 && spot.type === "Library") p += 8;
    if (spot.lateNight && (hour >= 22 || hour <= 1)) p += spot.crowd === "High" ? 12 : 6;
    if (isWeekday && hour >= 8 && hour <= 9 && spike === "between_classes") p += 8;
    if (isWeekend && hour >= 9 && hour <= 12 && spot.type === "Library") p -= 6;

    const phase = schoolPhase(now);
    const phaseBump = (schoolPhaseWeight(phase) - 1) * 32 * (spot.phaseSensitivity || 1);
    p += phaseBump;

    return Math.min(98, Math.max(5, Math.round(p)));
  }

  function scoreAverage(spot) {
    return ((spot.outlets + spot.wifi + spot.comfort + spot.productivity) / 4).toFixed(1);
  }

  function busyLabel(p) {
    if (p <= 35) return "Calm";
    if (p <= 65) return "Busy";
    return "Packed";
  }

  function meterClass(p) {
    if (p <= 35) return "calm";
    if (p <= 65) return "busy";
    return "packed";
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatLastUpdated(iso) {
    if (!iso) return "No student updates yet";
    const d = new Date(iso);
    return `Updated ${d.toLocaleString()}`;
  }

  async function getAllSpots() {
    if (!supabase) return INITIAL_SPOTS;
    const { data } = await supabase
      .from("spots")
      .select("id, name, area, spot_type, description, noise, crowd, outlets, wifi, comfort, productivity, late_night, food_nearby, best_for, tips, busy_spike")
      .order("id");
    if (!data || !data.length) return INITIAL_SPOTS;
    return data.map((row) => {
      const spot = {
        id: row.id,
        name: row.name,
        area: row.area,
        type: row.spot_type,
        description: row.description,
        noise: row.noise,
        crowd: row.crowd,
        outlets: row.outlets,
        wifi: row.wifi,
        comfort: row.comfort,
        productivity: row.productivity,
        lateNight: row.late_night,
        foodNearby: row.food_nearby,
        bestFor: row.best_for || [],
        tips: row.tips,
        busySpike: row.busy_spike,
        phaseSensitivity: row.spot_type === "Library" ? 1.3 : 1,
      };
      if (row.id === 1) {
        spot.temporarilyClosed = true;
        spot.closedMessage = "Reopening August 2026";
      }
      return spot;
    });
  }

  async function fetchStudentAggregates() {
    studentAggregates.clear();
    if (!supabase) return;
    const { data } = await supabase.from("spot_student_aggregates").select("*");
    (data || []).forEach((row) => {
      studentAggregates.set(Number(row.spot_id), {
        avg: Number(row.avg_rating || 0).toFixed(1),
        count: Number(row.rating_count || 0),
        lastUpdatedAt: row.last_updated_at || null,
      });
    });
  }

  function noiseRank(spot) {
    if (spot.noise === "Quiet") return 1;
    if (spot.noise === "Mixed") return 2;
    if (spot.noise === "Loud") return 3;
    return 0;
  }

  function studentAvgOrNull(spotId) {
    const stats = studentAggregates.get(Number(spotId));
    if (!stats || !stats.count) return null;
    return Number(stats.avg);
  }

  function sortKey(spot, now, sortBy) {
    if (sortBy === "noise") return noiseRank(spot);
    if (sortBy === "busy") return estimateBusyPercent(spot, now);
    if (sortBy === "our") return Number(scoreAverage(spot));
    if (sortBy === "student") return studentAvgOrNull(spot.id);
    return 0;
  }

  function compareSpots(a, b, now) {
    const ka = sortKey(a, now, state.sortBy);
    const kb = sortKey(b, now, state.sortBy);
    const asc = state.sortDir === "asc";

    if (state.sortBy === "student") {
      if (ka == null && kb == null) return 0;
      if (ka == null) return asc ? 1 : -1;
      if (kb == null) return asc ? -1 : 1;
      const cmp = ka - kb;
      return asc ? cmp : -cmp;
    }

    const cmp = ka - kb;
    return asc ? cmp : -cmp;
  }

  function getFilteredSorted(spots, now) {
    return [...spots].sort((a, b) => compareSpots(a, b, now));
  }

  function getGeneralCampusPulse(now) {
    const hour = now.getHours();
    const dow = now.getDay();
    const isWeekday = dow >= 1 && dow <= 5;
    const isWeekendNight = dow === 5 || dow === 6 || (dow === 0 && hour < 6);

    // Keep evenings consistently active from 6pm-10pm.
    if (hour >= 18 && hour <= 22) return 59;

    // Use weeknight vs weekend-night behavior for overnight hours.
    if (hour >= 23 || hour < 6) {
      return isWeekendNight ? 30 : 22;
    }

    const daytimeProfile = isWeekday
      ? [
          { hour: 6, value: 34 },
          { hour: 7, value: 48 },
          { hour: 10, value: 68 },
          { hour: 14, value: 62 },
        ]
      : [
          { hour: 6, value: 28 },
          { hour: 9, value: 38 },
          { hour: 12, value: 55 },
          { hour: 17, value: 46 },
        ];

    let value = daytimeProfile[0].value;
    for (const point of daytimeProfile) {
      if (hour >= point.hour) value = point.value;
      else break;
    }
    return value;
  }

  function renderCampusPulse(spots, now) {
    if (!spots.length) {
      els.campusPulse.innerHTML = "<p>No spots yet.</p>";
      return;
    }
    const avg = getGeneralCampusPulse(now);
    const sorted = [...spots].sort((a, b) => estimateBusyPercent(a, now) - estimateBusyPercent(b, now));
    els.campusPulse.innerHTML = `
      <h3>Campus pulse</h3>
      <div class="pulse-row">
        <div class="pulse-main">
          <div class="pulse-big">${avg}%</div>
          <p class="pulse-sub">${busyLabel(avg)} on average (${schoolPhase(now)} phase)</p>
        </div>
        <div class="pulse-side">
          <span>Calmest pick</span>
          <strong>${escapeHtml(sorted[0].name)}</strong>
          <span style="margin-top:0.5rem">Busiest pick</span>
          <strong style="color:var(--packed)">${escapeHtml(sorted[sorted.length - 1].name)}</strong>
        </div>
      </div>
      <div class="meter" aria-hidden="true"><div class="meter-fill ${meterClass(avg)}" style="width:${avg}%"></div></div>
    `;
  }

  function studentRatingDisplay(spotId) {
    const stats = studentAggregates.get(Number(spotId));
    if (!stats || !stats.count) return { avg: "N/A", count: 0, updated: "No student updates yet" };
    return { avg: stats.avg, count: stats.count, updated: formatLastUpdated(stats.lastUpdatedAt) };
  }

  function renderSpotCardBody(spot, now) {
    const p = estimateBusyPercent(spot, now);
    const mc = meterClass(p);
    const student = studentRatingDisplay(spot.id);
    const late = spot.lateNight ? '<span class="tag gold" title="Late-night access">Late night</span>' : "";
    return `
          <div class="card-top">
            <div>
              <div class="tags">
                <span class="tag">${escapeHtml(spot.type)}</span>
                ${late}
              </div>
              <h3>${escapeHtml(spot.name)}</h3>
              <p class="area">${escapeHtml(spot.area)}</p>
            </div>
          </div>
          <div class="ratings-row">
            <div class="rating-box">
              <span>Our rating</span>
              <strong>${scoreAverage(spot)}/5</strong>
            </div>
            <div class="rating-box">
              <span>Student rating</span>
              <strong>${student.avg}/5 (${student.count})</strong>
            </div>
          </div>
          <p class="student-rating-meta">${escapeHtml(student.updated)}</p>
          <div class="busy-block">
            <div class="busy-label-row">
              <span style="color:var(--${mc === "calm" ? "calm" : mc === "busy" ? "busy" : "packed"})">${busyLabel(p)}</span>
              <span class="pct">${p}%</span>
            </div>
            <div class="meter"><div class="meter-fill ${mc}" style="width:${p}%"></div></div>
          </div>
          <p class="card-desc">${escapeHtml(spot.description)}</p>
          <div class="card-foot">
            <span>Noise: ${escapeHtml(spot.noise)}</span>
            <span>Usual Activity: ${escapeHtml(spot.crowd)}</span>
          </div>`;
  }

  function renderCards(spots, list, now) {
    els.spotGrid.innerHTML = list
      .map((spot) => {
        const body = renderSpotCardBody(spot, now);
        if (spot.temporarilyClosed) {
          const msg = spot.closedMessage || "Temporarily unavailable";
          return `
        <div class="card card--closed" data-id="${spot.id}" role="group" aria-label="${escapeHtml(spot.name)} — temporarily closed. ${escapeHtml(msg)}" aria-disabled="true">
          <div class="card--closed-dim">${body}</div>
          <div class="card--closed-overlay" aria-hidden="true">
            <span class="card--closed-banner">${escapeHtml(msg)}</span>
          </div>
        </div>`;
        }
        return `
        <button type="button" class="card" data-id="${spot.id}" aria-label="Open details for ${escapeHtml(spot.name)}">
          ${body}
        </button>`;
      })
      .join("");

    els.resultsCount.textContent = `${list.length} of ${spots.length} spots`;
    els.emptyState.hidden = list.length > 0;
    els.spotGrid.hidden = list.length === 0;
    els.spotGrid.querySelectorAll("button.card").forEach((btn) => {
      btn.addEventListener("click", () => {
        const spot = spots.find((s) => s.id === Number(btn.getAttribute("data-id")));
        if (spot) openModal(spot);
      });
    });
  }

  async function upsertStudentRating(spotId) {
    if (!supabase || !currentUser) return;
    const ratingInput = document.getElementById("student-rating-input");
    const reviewInput = document.getElementById("student-review-input");
    const submitStatus = document.getElementById("student-submit-status");
    const rating = Number(ratingInput.value);
    const review = reviewInput.value.trim();
    if (!rating || rating < 1 || rating > 5) {
      submitStatus.textContent = "Choose a rating from 1 to 5.";
      return;
    }
    const { error } = await supabase.from("student_ratings").upsert({
      spot_id: spotId,
      user_id: currentUser.id,
      rating,
      review,
    }, { onConflict: "spot_id,user_id" });
    submitStatus.textContent = error ? error.message : "Saved your rating.";
    await refresh();
    if (!error) {
      const updatedSpot = currentSpots.find((s) => s.id === spotId);
      if (updatedSpot) openModal(updatedSpot);
    }
  }

  let currentSpots = [];
  async function openModal(spot) {
    const now = new Date();
    const p = estimateBusyPercent(spot, now);
    const mc = meterClass(p);
    const student = studentRatingDisplay(spot.id);
    const best = (spot.bestFor || []).map((t) => `<span class="tag" style="margin:0.15rem">${escapeHtml(t)}</span>`).join(" ");

    els.modal.innerHTML = `
      <div class="modal-header">
        <button type="button" class="modal-close" aria-label="Close">&times;</button>
        <span class="tag">${escapeHtml(spot.type)}</span>
        <h2 id="modal-title">${escapeHtml(spot.name)}</h2>
        <p style="margin:0;opacity:0.9;font-size:0.9rem">${escapeHtml(spot.area)}</p>
      </div>
      <div class="modal-body">
        ${
          spot.temporarilyClosed
            ? `<div class="closed-notice"><strong>${escapeHtml(spot.closedMessage || "Temporarily unavailable")}</strong><p class="small muted" style="margin:0.5rem 0 0">Details below are for reference when this spot reopens.</p></div>`
            : ""
        }
        <div class="ratings-row">
          <div class="rating-box"><span>Our rating</span><strong>${scoreAverage(spot)}/5</strong></div>
          <div class="rating-box"><span>Student rating</span><strong>${student.avg}/5 (${student.count})</strong></div>
        </div>
        <p class="student-rating-meta">${escapeHtml(student.updated)}</p>
        <div class="busy-block" style="margin-top:0">
          <div class="busy-label-row">
            <span>Activity (estimated)</span>
            <span class="pct">${busyLabel(p)} · ${p}%</span>
          </div>
          <div class="meter"><div class="meter-fill ${mc}" style="width:${p}%"></div></div>
          <p class="small muted" style="margin:0.5rem 0 0">Estimated from time of day, day of week, and school-year phase (${schoolPhase(now)}).</p>
        </div>
        <p>${escapeHtml(spot.description)}</p>
        <div style="margin-bottom:1rem">${best}</div>
        <div class="kv-grid">
          <div class="kv"><span>Noise</span><strong>${escapeHtml(spot.noise)}</strong></div>
          <div class="kv"><span>Usual Activity</span><strong>${escapeHtml(spot.crowd)}</strong></div>
          <div class="kv"><span>Late night</span><strong>${spot.lateNight ? "Yes" : "No"}</strong></div>
          <div class="kv"><span>Food nearby</span><strong>${spot.foodNearby ? "Yes" : "No"}</strong></div>
          <div class="kv"><span>Outlets</span><strong>${spot.outlets}/5</strong></div>
          <div class="kv"><span>WiFi</span><strong>${spot.wifi}/5</strong></div>
          <div class="kv"><span>Comfort</span><strong>${spot.comfort}/5</strong></div>
          <div class="kv"><span>Lock-in</span><strong>${spot.productivity}/5</strong></div>
        </div>
        <div class="tip-box"><strong>Student tip</strong>${escapeHtml(spot.tips || "-")}</div>
        <div class="student-form">
          ${
            spot.temporarilyClosed
              ? `<p class="small muted">Student ratings are paused until this spot reopens.</p>`
              : currentUser
                ? `
            <label class="field">
              <span class="label">Your rating (1-5)</span>
              <input type="number" id="student-rating-input" min="1" max="5" step="1" required />
            </label>
            <label class="field">
              <span class="label">Your review</span>
              <textarea id="student-review-input" rows="3" maxlength="1000" placeholder="What should students know about this spot?"></textarea>
            </label>
            <button type="button" class="btn primary" id="student-submit-btn">Submit student rating</button>
            <p class="small muted" id="student-submit-status"></p>
          `
                : `<p class="small muted"><a href="login.html">Log in</a> or <a href="login.html#signup">create an account</a> to submit a live student rating and review.</p>`
          }
        </div>
      </div>
    `;
    els.modalBackdrop.hidden = false;
    els.modal.querySelector(".modal-close").addEventListener("click", closeModal);
    const submitBtn = document.getElementById("student-submit-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        upsertStudentRating(spot.id);
      });
    }
    els.modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    els.modalBackdrop.hidden = true;
    els.modal.innerHTML = "";
  }

  function openInfoModal() {
    if (els.infoBackdrop) els.infoBackdrop.hidden = false;
    if (els.infoClose) els.infoClose.focus();
  }

  function closeInfoModal() {
    if (els.infoBackdrop) els.infoBackdrop.hidden = true;
  }

  function wireSortControls() {
    function syncSortOrderUi() {
      if (els.sortAsc) els.sortAsc.setAttribute("aria-pressed", state.sortDir === "asc" ? "true" : "false");
      if (els.sortDesc) els.sortDesc.setAttribute("aria-pressed", state.sortDir === "desc" ? "true" : "false");
    }
    if (els.sortBy) {
      els.sortBy.value = state.sortBy;
      els.sortBy.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        refresh();
      });
    }
    function setOrder(dir) {
      state.sortDir = dir;
      syncSortOrderUi();
      refresh();
    }
    if (els.sortAsc) els.sortAsc.addEventListener("click", () => setOrder("asc"));
    if (els.sortDesc) els.sortDesc.addEventListener("click", () => setOrder("desc"));
    syncSortOrderUi();
  }

  function renderAuthState() {
    if (!els.headerAuthGuest || !els.headerAuthUser) return;
    const header = document.querySelector(".site-header");
    if (header) header.classList.toggle("user-signed-in", Boolean(currentUser));
    if (currentUser) {
      els.headerAuthGuest.hidden = true;
      els.headerAuthGuest.setAttribute("aria-hidden", "true");
      els.headerAuthUser.hidden = false;
      els.headerAuthUser.removeAttribute("aria-hidden");
      if (els.headerUserEmail) {
        els.headerUserEmail.textContent = currentUser.email || currentUser.user_metadata?.email || "";
        els.headerUserEmail.title = els.headerUserEmail.textContent;
      }
      if (els.logoutBtn) els.logoutBtn.hidden = false;
    } else {
      els.headerAuthGuest.hidden = false;
      els.headerAuthGuest.removeAttribute("aria-hidden");
      els.headerAuthUser.hidden = true;
      els.headerAuthUser.setAttribute("aria-hidden", "true");
      if (els.logoutBtn) els.logoutBtn.hidden = true;
    }
  }

  async function refresh() {
    const now = new Date();
    currentSpots = await getAllSpots();
    await fetchStudentAggregates();
    const list = getFilteredSorted(currentSpots, now);
    renderCampusPulse(currentSpots, now);
    renderCards(currentSpots, list, now);
  }

  async function initAuth() {
    renderAuthState();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    currentUser = data.session ? data.session.user : null;
    renderAuthState();

    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser = session ? session.user : null;
      renderAuthState();
      refresh();
    });

    if (els.logoutBtn) {
      els.logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
      });
    }
  }

  function init() {
    if (els.infoBtn) {
      els.infoBtn.addEventListener("click", openInfoModal);
    }
    if (els.infoClose) {
      els.infoClose.addEventListener("click", closeInfoModal);
    }
    if (els.infoBackdrop) {
      els.infoBackdrop.addEventListener("click", (e) => {
        if (e.target === els.infoBackdrop) closeInfoModal();
      });
    }
    els.modalBackdrop.addEventListener("click", (e) => {
      if (e.target === els.modalBackdrop) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !els.modalBackdrop.hidden) closeModal();
      if (e.key === "Escape" && els.infoBackdrop && !els.infoBackdrop.hidden) closeInfoModal();
    });
    wireSortControls();
    initAuth().then(refresh);
    setInterval(refresh, 60000);
  }

  init();
})();
