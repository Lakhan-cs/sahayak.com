const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const state = {
  profile: null,
  dashboard: null,
  earnings: [
    12400, 15800, 18100, 17200, 22500, 19800, 24100, 32400, 27600, 25200, 29100,
    31650,
  ],
};

function showView(view) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#view-" + view)?.classList.add("active");
  $$(".nav-item").forEach((n) =>
    n.classList.toggle("active", n.dataset.view === view),
  );
  $("#sidebar")?.classList.remove("open");
  if (view === "earnings") renderChart();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$$("[data-view]").forEach((el) =>
  el.addEventListener("click", () => showView(el.dataset.view)),
);

function clock() {
  const d = new Date();
  $("#clock").textContent = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  $("#topDate").textContent = d.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const h = d.getHours(),
    n = state.profile?.name?.split(" ")[0] || "Worker";
  $("#greeting").textContent =
    (h < 12
      ? "Good morning, "
      : h < 17
        ? "Good afternoon, "
        : "Good evening, ") +
    n +
    ".";
}
setInterval(clock, 1000);
clock();

function hydrateWorkerFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem("nabhi_user") || "{}");
    if (!saved || saved.role !== "worker") return;
    const firstName =
      String(saved.name || "Worker")
        .trim()
        .split(/\s+/)[0] || "Worker";
    $("#topName").textContent = firstName;
    $("#sidebarName").textContent = saved.name || "Worker";
    $("#profileName").textContent = saved.name || "Worker";
    $("#topAvatar").textContent = (saved.name || "W")[0].toUpperCase();
    $("#sidebarAvatar").textContent = (saved.name || "W")[0].toUpperCase();
    $("#bigAvatar").textContent = (saved.name || "W")[0].toUpperCase();
    $("#sidebarWork").textContent = saved.fieldOfWork || "Service Worker";
    $("#topWork").textContent = saved.fieldOfWork || "Service Worker";
    $("#profileWork").textContent = [
      saved.fieldOfWork || "Service Worker",
      saved.experience ? `${saved.experience} years experience` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  } catch (_) {}
}

async function load() {
  if (!localStorage.getItem("nabhi_access_token")) {
    location.href = "login.html";
    return;
  }
  hydrateWorkerFromStorage();
  try {
    const [profile, dashboard] = await Promise.all([
      workerAPI.getProfile(),
      workerAPI.getDashboard(),
    ]);
    state.profile = profile;
    state.dashboard = dashboard;
    $("#topName").textContent = profile.name.split(" ")[0];
    $("#topWork").textContent =
      (profile.work || "").split(" · ")[0] || "Worker";
    $("#topAvatar").textContent = profile.initial;
    $("#sidebarAvatar").textContent = profile.initial;
    $("#sidebarName").textContent = profile.name;
    $("#sidebarWork").textContent =
      (profile.work || "").split(" · ")[0] || "Worker";
    $("#bigAvatar").textContent = profile.initial;
    $("#profileName").textContent = profile.name;
    $("#profileWork").textContent = profile.work;
    $("#profileDescription").textContent = profile.description;
    $("#profileCompletion").textContent = profile.completion + "%";
    $("#rating").innerHTML = profile.rating + "<span>/5</span>";
    $("#monthEarnings").textContent =
      "₹" + dashboard.earnings.toLocaleString("en-IN");
    $("#jobsCount").textContent = dashboard.jobs;
    const savedDemoAvailability = localStorage.getItem("nabhiWorkerAvailable");
    $("#availabilityToggle").checked =
      savedDemoAvailability === null
        ? dashboard.availability
        : savedDemoAvailability === "true";
    updateAvailability();
    tellCustomerWorkerIsHere();
    restoreSavedRequest?.();
    clock();
  } catch (e) {
    toast("Dashboard data could not be loaded.");
  }
}
function updateAvailability() {
  const on = $("#availabilityToggle").checked;
  $("#availabilityState").textContent = on ? "AVAILABLE" : "OFFLINE";
  $("#availabilityCopy").textContent = on
    ? "You're available for work. Sahayak can send you relevant jobs."
    : "You're currently offline. Turn availability on when you're ready to take jobs.";
}
$("#availabilityToggle").addEventListener("change", async (e) => {
  updateAvailability();
  tellCustomerWorkerIsHere();
  localStorage.setItem("nabhiWorkerAvailable", String(e.target.checked));
  try {
    await workerAPI.setAvailability(e.target.checked);
    toast(
      e.target.checked
        ? "You're now available for work."
        : "You're now offline.",
    );
  } catch {
    toast(
      e.target.checked
        ? "Available for the demo. Server sync is unavailable."
        : "Offline for the demo. Server sync is unavailable.",
    );
  }
});

$("#locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    $("#locationValue").textContent = "Location unavailable";
    return;
  }
  $("#locationValue").textContent = "Updating location…";
  navigator.geolocation.getCurrentPosition(
    (p) => {
      $("#locationValue").textContent =
        `Location detected · ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`;
      toast("Location updated.");
    },
    () => {
      $("#locationValue").textContent = "Location permission needed";
      toast("Allow location access to update it.");
    },
  );
});

function renderChart() {
  const range = Number($("#rangeSelect").value),
    data = state.earnings.slice(-range);
  const svg = $("#earningsChart"),
    labels = $("#chartLabels");
  svg.innerHTML = "";
  labels.innerHTML = "";
  const max = Math.max(...data) * 1.12,
    min = 0,
    w = 1000,
    h = 300,
    pad = 25;
  const pts = data.map((v, i) => ({
    x: pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2),
    y: h - pad - (v / max) * (h - pad * 2),
  }));
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    const y = h - pad - t * (h - pad * 2);
    svg.insertAdjacentHTML(
      "beforeend",
      `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="rgba(27,18,48,.09)" stroke-width="1"/>`,
    );
  });
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${h - pad} ${poly} ${pts.at(-1).x},${h - pad}`;
  svg.insertAdjacentHTML(
    "beforeend",
    `<polygon points="${area}" fill="rgba(110,47,217,.08)"/><polyline points="${poly}" fill="none" stroke="#6e2fd9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
  pts.forEach((p) =>
    svg.insertAdjacentHTML(
      "beforeend",
      `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#f7f1e7" stroke="#6e2fd9" stroke-width="3"/>`,
    ),
  );
  const names = [
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
  ];
  data.forEach((_, i) =>
    labels.insertAdjacentHTML(
      "beforeend",
      `<span>${names[(12 - range + i) % 12]}</span>`,
    ),
  );
  $("#chartTitle").textContent =
    $("#rangeSelect").selectedOptions[0].textContent;
  $("#earningsTotal").textContent =
    "₹" + data.reduce((a, b) => a + b, 0).toLocaleString("en-IN");
}
$("#rangeSelect").addEventListener("change", renderChart);

function openProfile() {
  $("#profileModal").classList.add("open");
}
$("#editProfileBtn").addEventListener("click", openProfile);
$("#closeModal").addEventListener("click", () =>
  $("#profileModal").classList.remove("open"),
);
$("#cancelEdit").addEventListener("click", () =>
  $("#profileModal").classList.remove("open"),
);
$("#saveProfile").addEventListener("click", async () => {
  const data = {
    name: $("#editName").value.trim(),
    work: $("#editWork").value.trim(),
    description: $("#editDescription").value.trim(),
  };
  try {
    await workerAPI.updateProfile(data);
    Object.assign(state.profile, data);
    $("#profileName").textContent = data.name;
    $("#profileWork").textContent = data.work;
    $("#profileDescription").textContent = data.description;
    const initial = data.name[0].toUpperCase();
    $("#topName").textContent = data.name.split(" ")[0];
    $("#topWork").textContent = (data.work || "").split(" · ")[0] || "Worker";
    $("#topAvatar").textContent = initial;
    $("#sidebarAvatar").textContent = initial;
    $("#sidebarName").textContent = data.name;
    $("#sidebarWork").textContent =
      (data.work || "").split(" · ")[0] || "Worker";
    $("#bigAvatar").textContent = initial;
    $("#profileModal").classList.remove("open");
    toast("Profile updated.");
  } catch {
    toast("Profile could not be updated.");
  }
});
$("#menuBtn").addEventListener("click", () =>
  $("#sidebar").classList.toggle("open"),
);

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}
load();
renderChart();

/* Account avatar dropdown */
const accountBtn = $("#accountBtn");
const accountMenu = $("#accountMenu");
function closeAccountMenu() {
  if (!accountMenu) return;
  accountMenu.hidden = true;
  accountBtn?.setAttribute("aria-expanded", "false");
}
function toggleAccountMenu() {
  if (!accountMenu) return;
  accountMenu.hidden = !accountMenu.hidden;
  accountBtn?.setAttribute("aria-expanded", String(!accountMenu.hidden));
}
accountBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAccountMenu();
});
accountMenu?.addEventListener("click", (e) => {
  const item = e.target.closest("button[data-view]");
  if (item) {
    showView(item.dataset.view);
    closeAccountMenu();
  }
});
document.addEventListener("click", (e) => {
  if (accountMenu && !e.target.closest(".account-menu-wrap"))
    closeAccountMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAccountMenu();
});

$("#sidebarMore")?.addEventListener("click", () => {
  accountMenu.hidden = false;
  accountBtn?.setAttribute("aria-expanded", "true");
  accountMenu.scrollIntoView({ block: "nearest" });
});

$("#importantLinksBtn")?.addEventListener("click", () => {
  closeAccountMenu();
  toast("Important links will be available here.");
});
$("#languageBtn")?.addEventListener("click", () => {
  closeAccountMenu();
  toast("Language: English");
});
$("#signoutBtn")?.addEventListener("click", async () => {
  closeAccountMenu();
  try {
    if (typeof workerAPI.signOut === "function") await workerAPI.signOut();
  } catch (e) {
    /* backend can be connected later */
  }
  toast("Signed out of Sahayak.");
});

/* Prototype worker matching and navigation handoff. */
const nabhiChannel =
  "BroadcastChannel" in window ? new BroadcastChannel("nabhi-live") : null;
let incomingRequest = null;

function workerIdentity() {
  return {
    name: state.profile?.name || "Rahul Sharma",
    role: (state.profile?.work || "Electrician").split(" · ")[0],
    experience:
      (state.profile?.work || "Electrician · 6 years experience").split(
        " · ",
      )[1] || "6 years experience",
    rating: Number(state.profile?.rating || 4.8),
  };
}

function tellCustomerWorkerIsHere() {
  const presence = {
    type: "worker-presence",
    available: Boolean($("#availabilityToggle")?.checked),
    worker: workerIdentity(),
    sentAt: Date.now(),
  };
  localStorage.setItem("nabhiWorkerPresence", JSON.stringify(presence));
  nabhiChannel?.postMessage(presence);
}

function showIncomingJob(request) {
  if (!$("#availabilityToggle")?.checked || !request) return;
  incomingRequest = request;
  $("#incomingService").textContent = request.service || "Home service";
  $("#incomingProblem").textContent =
    request.problem || "Customer needs help nearby.";
  $("#incomingDistance").textContent = request.distance || "Nearby";
  $("#incomingPayout").textContent = request.estimate || "₹448";
  $("#incomingCustomer").textContent = request.customerName || "Customer";
  $("#incomingJob").hidden = false;
}

function closeIncoming() {
  $("#incomingJob").hidden = true;
  incomingRequest = null;
}

function restoreSavedRequest() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("nabhiWorkerRequest") || "null",
    );
    if (saved?.request) showIncomingJob(saved.request);
  } catch (_) {}
}

$("#acceptJob")?.addEventListener("click", () => {
  if (!incomingRequest) return;
  const coords = JSON.parse(
    sessionStorage.getItem("nabhiWorkerDemoCoords") ||
      localStorage.getItem("nabhiWorkerDemoCoords") ||
      '{"lat":28.6765,"lng":77.1032}',
  );
  const active = {
    ...incomingRequest,
    worker: { ...workerIdentity(), location: coords },
  };
  localStorage.setItem("nabhiActiveBooking", JSON.stringify(active));
  localStorage.setItem("nabhiBookingStatus", "assigned");
  localStorage.setItem("nabhiWorkerAccepted", JSON.stringify(active));
  $("#chatLauncher")?.removeAttribute("hidden");
  nabhiChannel?.postMessage({ type: "worker-accepted", booking: active });
  closeIncoming();
  toast("Job accepted. Customer has been notified.");
  setTimeout(() => {
    location.href = `worker-navigation.html?booking=${encodeURIComponent(active.id)}`;
  }, 700);
});

$("#declineJob")?.addEventListener("click", () => {
  if (incomingRequest)
    nabhiChannel?.postMessage({
      type: "worker-declined",
      bookingId: incomingRequest.id,
    });
  closeIncoming();
});

$("#availabilityToggle")?.addEventListener("change", () => {
  restoreSavedRequest();
  setTimeout(tellCustomerWorkerIsHere, 50);
});
nabhiChannel?.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "worker-discover") tellCustomerWorkerIsHere();
  if (message.type === "booking-request") showIncomingJob(message.request);
});
window.addEventListener("storage", (event) => {
  if (event.key !== "nabhiWorkerRequest" || !event.newValue) return;
  try {
    showIncomingJob(JSON.parse(event.newValue).request);
  } catch (_) {}
});
restoreSavedRequest();
setTimeout(tellCustomerWorkerIsHere, 500);
