// dashboard.js — CDT Pipeline Dashboard

// -- Services definition --
const SERVICES = [
  {
    id:        "bivme",
    healthUrl: "/biv-me/lab/api",
    openUrl:   "/biv-me/lab/",
    method:    "GET",
  },
  {
    id:        "cobiveco",
    healthUrl: "/matlab/",
    openUrl:   "/matlab/",
    method:    "HEAD",
  },
  {
    id:        "torso",
    healthUrl: null,
    openUrl:   null,
  },
  {
    id:        "cdt",
    healthUrl: "/cdt-framework/api",
    openUrl:   "/cdt-framework/lab/",
    method:    "GET",
  },
  {
    id:        "opencarp",
    healthUrl: "/glance/",
    openUrl:   "/glance/",
    method:    "HEAD",
  },
];

// -- Health check functions --
async function checkService(svc) {
  const dot      = document.getElementById(`dot-${svc.id}`);
  const label    = document.getElementById(`status-${svc.id}`);
  const openBtn  = document.getElementById(`open-${svc.id}`);

  // if external services not monitorable
  if (!svc.healthUrl) {
    dot.className      = "dot external";
    label.textContent  = "external";
    if (openBtn) openBtn.disabled = true;
    return;
  }

  dot.className     = "dot checking";
  label.textContent = "Verifying...";

  try {
    const res = await fetch(svc.healthUrl, {
      method: svc.method ?? "GET",
      signal: AbortSignal.timeout(4000),
    });
    // 200 OK or redirect 301/302 = active service
    const ok = res.ok || res.status === 301 || res.status === 302;
    dot.className     = ok ? "dot online"  : "dot error";
    label.textContent = ok ? "online"      : `HTTP ${res.status}`;
    if (openBtn) openBtn.disabled = !ok;
  } catch (e) {
    dot.className     = e.name === "TimeoutError" ? "dot timeout" : "dot offline";
    label.textContent = e.name === "TimeoutError" ? "timeout"     : "offline";
    if (openBtn) openBtn.disabled = true;
  }
}

// -- Pipeline steps highlight on mouseover --
function initPipelineSteps() {
  const steps = document.querySelectorAll(".step");
  const cards = document.querySelectorAll(".service-card");

  steps.forEach((step, i) => {
    step.addEventListener("mouseenter", () => {
      cards.forEach(c => c.classList.remove("highlighted"));
      const target = document.querySelector(`.service-card[data-step="${i + 1}"]`);
      if (target) target.classList.add("highlighted");
    });
    step.addEventListener("mouseleave", () => {
      cards.forEach(c => c.classList.remove("highlighted"));
    });
  });
}

// -- Dark / light mode toggle --
function initTheme() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const root   = document.documentElement;
  let theme    = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const sunSvg  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const moonSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (toggle) toggle.innerHTML = t === "dark" ? sunSvg : moonSvg;
  }

  applyTheme(theme);
  if (toggle) {
    toggle.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme(theme);
    });
  }
}

// -- Manual refresh of status -- 
function refreshAll() {
  SERVICES.forEach(s => checkService(s));
  const ts = document.getElementById("last-refresh");
  if (ts) ts.textContent = new Date().toLocaleTimeString("it-IT");
}

// -- Init --
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPipelineSteps();
  refreshAll();

  // set auto polling every 30 s
  setInterval(refreshAll, 30_000);

  // manual refresh button
  const btn = document.getElementById("btn-refresh");
  if (btn) btn.addEventListener("click", () => { refreshAll(); });
});
