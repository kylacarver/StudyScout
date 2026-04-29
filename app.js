(function () {
  "use strict";

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
      tips: "Expect chatter—bring headphones.",
      busySpike: "lunch",
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
    },
  ];

  const CATEGORY_OPTIONS = [
    "All",
    "Finals grind",
    "Solo studying",
    "Late night",
    "Quiet studying",
    "STEM homework",
    "Group work",
    "Between classes",
    "Food nearby",
    "Low crowd",
  ];

  const NOISE_OPTIONS = ["All", "Quiet", "Mixed", "Loud"];

  const crowdBase = { Low: 28, Medium: 52, High: 78 };

  function getAllSpots() {
    return INITIAL_SPOTS;
  }

  function scoreAverage(spot) {
    return ((spot.outlets + spot.wifi + spot.comfort + spot.productivity) / 4).toFixed(1);
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

    return Math.min(98, Math.max(5, Math.round(p)));
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

  /** @type {{ search: string; category: string; noise: string; busy: string; sort: 'quiet'|'busy'|'score' }} */
  const state = {
    search: "",
    category: "All",
    noise: "All",
    busy: "any",
    sort: "quiet",
  };

  const els = {
    clock: document.getElementById("clock"),
    campusPulse: document.getElementById("campus-pulse"),
    filterSearch: document.getElementById("filter-search"),
    filterCategory: document.getElementById("filter-category"),
    filterNoise: document.getElementById("filter-noise"),
    filterBusy: document.getElementById("filter-busy"),
    sortBtns: document.getElementById("sort-btns"),
    spotGrid: document.getElementById("spot-grid"),
    resultsCount: document.getElementById("results-count"),
    emptyState: document.getElementById("empty-state"),
    resetFilters: document.getElementById("reset-filters"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modal: document.getElementById("modal"),
  };

  function tickClock() {
    const d = new Date();
    els.clock.textContent = d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function fillSelect(select, options) {
    select.innerHTML = options.map((o) => `<option value="${o}">${o}</option>`).join("");
  }

  function getFilteredSorted(spots, now) {
    const q = state.search.trim().toLowerCase();
    let list = spots.filter((spot) => {
      const hay = `${spot.name} ${spot.area} ${spot.description} ${(spot.bestFor || []).join(" ")}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (state.category !== "All") {
        const c = state.category;
        const ok =
          (spot.bestFor && spot.bestFor.includes(c)) ||
          (c === "Food nearby" && spot.foodNearby) ||
          (c === "Late night" && spot.lateNight) ||
          (c === "Low crowd" && spot.crowd === "Low");
        if (!ok) return false;
      }
      if (state.noise !== "All" && spot.noise !== state.noise) return false;
      const p = estimateBusyPercent(spot, now);
      if (state.busy === "calm" && p > 45) return false;
      if (state.busy === "mod" && p > 70) return false;
      return true;
    });

    const busy = (s) => estimateBusyPercent(s, now);
    if (state.sort === "quiet") list = [...list].sort((a, b) => busy(a) - busy(b));
    else if (state.sort === "busy") list = [...list].sort((a, b) => busy(b) - busy(a));
    else list = [...list].sort((a, b) => Number(scoreAverage(b)) - Number(scoreAverage(a)));

    return list;
  }

  function renderCampusPulse(spots, now) {
    if (!spots.length) {
      els.campusPulse.innerHTML = "<p>No spots yet.</p>";
      return;
    }
    const percents = spots.map((s) => estimateBusyPercent(s, now));
    const avg = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
    const label = busyLabel(avg);
    const m = meterClass(avg);
    const sorted = [...spots].sort((a, b) => estimateBusyPercent(a, now) - estimateBusyPercent(b, now));
    const calmest = sorted[0];
    const busiest = sorted[sorted.length - 1];

    els.campusPulse.innerHTML = `
      <h3>Campus pulse</h3>
      <div class="pulse-row">
        <div>
          <div class="pulse-big">${avg}%</div>
          <p style="margin:0;font-weight:700;color:var(--muted);font-size:0.95rem">${label} on average</p>
        </div>
        <div class="pulse-side">
          <span>Calmest pick</span>
          <strong>${escapeHtml(calmest.name)}</strong>
          <span style="margin-top:0.5rem">Busiest pick</span>
          <strong style="color:var(--packed)">${escapeHtml(busiest.name)}</strong>
        </div>
      </div>
      <div class="meter" aria-hidden="true"><div class="meter-fill ${m}" style="width:${avg}%"></div></div>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCards(spots, list, now) {
    els.spotGrid.innerHTML = list
      .map((spot) => {
        const p = estimateBusyPercent(spot, now);
        const mc = meterClass(p);
        const tags = (spot.bestFor || []).slice(0, 2);
        const late = spot.lateNight
          ? '<span class="tag gold" title="Late-night access">Late night</span>'
          : "";
        return `
        <button type="button" class="card" data-id="${spot.id}" aria-label="Open details for ${escapeHtml(spot.name)}">
          <div class="card-top">
            <div>
              <div class="tags">
                <span class="tag">${escapeHtml(spot.type)}</span>
                ${late}
              </div>
              <h3>${escapeHtml(spot.name)}</h3>
              <p class="area">${escapeHtml(spot.area)}</p>
            </div>
            <div class="score-badge" aria-label="Overall score ${scoreAverage(spot)} out of five">
              <span>${scoreAverage(spot)}</span>
              <small>score</small>
            </div>
          </div>
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
            <span>Usual: ${escapeHtml(spot.crowd)}</span>
          </div>
        </button>`;
      })
      .join("");

    els.resultsCount.textContent = `${list.length} of ${spots.length} spots`;
    els.emptyState.hidden = list.length > 0;
    els.spotGrid.hidden = list.length === 0;

    els.spotGrid.querySelectorAll(".card").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        const spot = spots.find((s) => s.id === id);
        if (spot) openModal(spot);
      });
    });
  }

  function openModal(spot) {
    const now = new Date();
    const p = estimateBusyPercent(spot, now);
    const mc = meterClass(p);
    const best = (spot.bestFor || []).map((t) => `<span class="tag" style="margin:0.15rem">${escapeHtml(t)}</span>`).join(" ");

    els.modal.innerHTML = `
      <div class="modal-header">
        <button type="button" class="modal-close" aria-label="Close">&times;</button>
        <span class="tag">${escapeHtml(spot.type)}</span>
        <h2 id="modal-title">${escapeHtml(spot.name)}</h2>
        <p style="margin:0;opacity:0.9;font-size:0.9rem">${escapeHtml(spot.area)}</p>
      </div>
      <div class="modal-body">
        <div class="busy-block" style="margin-top:0">
          <div class="busy-label-row">
            <span>Busyness (estimated)</span>
            <span class="pct">${busyLabel(p)} · ${p}%</span>
          </div>
          <div class="meter"><div class="meter-fill ${mc}" style="width:${p}%"></div></div>
          <p class="small muted" style="margin:0.5rem 0 0">Typical for ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} — not live headcount.</p>
        </div>
        <p>${escapeHtml(spot.description)}</p>
        <div style="margin-bottom:1rem">${best}</div>
        <div class="kv-grid">
          <div class="kv"><span>Noise</span><strong>${escapeHtml(spot.noise)}</strong></div>
          <div class="kv"><span>Usual crowd</span><strong>${escapeHtml(spot.crowd)}</strong></div>
          <div class="kv"><span>Late night</span><strong>${spot.lateNight ? "Yes" : "No"}</strong></div>
          <div class="kv"><span>Food nearby</span><strong>${spot.foodNearby ? "Yes" : "No"}</strong></div>
          <div class="kv"><span>Outlets</span><strong>${spot.outlets}/5</strong></div>
          <div class="kv"><span>WiFi</span><strong>${spot.wifi}/5</strong></div>
          <div class="kv"><span>Comfort</span><strong>${spot.comfort}/5</strong></div>
          <div class="kv"><span>Lock-in</span><strong>${spot.productivity}/5</strong></div>
        </div>
        <div class="tip-box"><strong>Student tip</strong>${escapeHtml(spot.tips || "—")}</div>
      </div>
    `;
    els.modalBackdrop.hidden = false;
    els.modal.querySelector(".modal-close").addEventListener("click", closeModal);
    els.modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    els.modalBackdrop.hidden = true;
    els.modal.innerHTML = "";
  }

  function wireSortButtons() {
    const opts = [
      { id: "quiet", label: "Quietest" },
      { id: "busy", label: "Busiest" },
      { id: "score", label: "Highest score" },
    ];
    els.sortBtns.innerHTML = opts
      .map(
        (o) =>
          `<button type="button" data-sort="${o.id}" aria-pressed="${state.sort === o.id}">${o.label}</button>`,
      )
      .join("");
    els.sortBtns.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        state.sort = /** @type {'quiet'|'busy'|'score'} */ (b.getAttribute("data-sort"));
        wireSortButtons();
        refresh();
      });
    });
  }

  function refresh() {
    const now = new Date();
    tickClock();
    const spots = getAllSpots();
    const list = getFilteredSorted(spots, now);
    renderCampusPulse(spots, now);
    renderCards(spots, list, now);
  }

  function init() {
    fillSelect(els.filterCategory, CATEGORY_OPTIONS);
    fillSelect(els.filterNoise, NOISE_OPTIONS);
    els.filterCategory.value = state.category;
    els.filterNoise.value = state.noise;

    els.filterSearch.addEventListener("input", (e) => {
      state.search = e.target.value;
      refresh();
    });
    els.filterCategory.addEventListener("change", (e) => {
      state.category = e.target.value;
      refresh();
    });
    els.filterNoise.addEventListener("change", (e) => {
      state.noise = e.target.value;
      refresh();
    });
    els.filterBusy.addEventListener("change", (e) => {
      state.busy = e.target.value;
      refresh();
    });

    els.resetFilters.addEventListener("click", () => {
      state.search = "";
      state.category = "All";
      state.noise = "All";
      state.busy = "any";
      els.filterSearch.value = "";
      els.filterCategory.value = "All";
      els.filterNoise.value = "All";
      els.filterBusy.value = "any";
      refresh();
    });

    els.modalBackdrop.addEventListener("click", (e) => {
      if (e.target === els.modalBackdrop) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !els.modalBackdrop.hidden) closeModal();
    });

    wireSortButtons();
    refresh();
    setInterval(refresh, 60_000);
  }

  init();
})();
