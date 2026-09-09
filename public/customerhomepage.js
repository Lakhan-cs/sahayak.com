/* =========================================================
    SAHAYAK CUSTOMER HOME JS
========================================================= */

/* =========================================================
   GREETING
========================================================= */

function updateGreeting() {
  const greeting = document.getElementById("greeting");

  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    greeting.textContent = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting.textContent = "Good afternoon";
  } else {
    greeting.textContent = "Good evening";
  }
}

updateGreeting();

/* =========================================================
   LIVE CLOCK
========================================================= */

const liveClock = document.getElementById("liveClock");

function updateLiveClock() {
  if (!liveClock) {
    return;
  }

  liveClock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

updateLiveClock();
setInterval(updateLiveClock, 1000);

/* =========================================================
   SERVICES
========================================================= */

const services = [
  {
    name: "Home Cleaning",
    description: "Cleaning & hygiene",
    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M4 16h16"/>
                <path d="M6 16V8h12v8"/>
                <path d="M8 8V5h8v3"/>
            </svg>
        `,
  },

  {
    name: "Electrical",
    description: "Repairs & installation",
    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z"/>
            </svg>
        `,
  },

  {
    name: "Plumbing",
    description: "Pipes & repairs",
    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M8 4v7a4 4 0 0 0 8 0V4"/>
                <path d="M6 4h4"/>
                <path d="M14 4h4"/>
                <path d="M12 15v6"/>
            </svg>
        `,
  },

  {
    name: "Painting",
    description: "Walls & interiors",
    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M4 7h16v5H4z"/>
                <path d="M9 12v7"/>
                <path d="M7 19h4"/>
            </svg>
        `,
  },

  {
    name: "Gardening",
    description: "Plants & outdoor work",
    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M12 21V10"/>
                <path d="M12 13C7 13 5 10 5 6c4 0 7 2 7 7Z"/>
                <path d="M12 10c0-4 3-6 7-6 0 4-2 7-7 7"/>
            </svg>
        `,
  },

  {
    name: "Carpentry",
    description: "Furniture & woodwork",
    icon: `
            <svg viewBox="0 0 24 24">
                <path d="m14 6 4 4"/>
                <path d="m5 19 9-9"/>
                <path d="m3 21 2-2"/>
                <path d="m14 6 2-2 4 4-2 2"/>
            </svg>
        `,
  },

  {
    name: "AC Repair",
    description: "Cooling & maintenance",
    icon: `
            <svg viewBox="0 0 24 24">
                <rect x="4" y="6" width="16" height="7" rx="2"/>
                <path d="M7 17h10"/>
                <path d="M8 13v4"/>
                <path d="M16 13v4"/>
            </svg>
        `,
  },

  {
    name: "Pest Control",
    description: "Home protection",
    icon: `
            <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 7V3"/>
                <path d="M12 21v-4"/>
                <path d="m7 9-4-2"/>
                <path d="m17 9 4-2"/>
                <path d="m7 15-4 2"/>
                <path d="m17 15 4 2"/>
            </svg>
        `,
  },

  {
    name: "Appliance Repair",
    description: "Home appliances",
    icon: `
            <svg viewBox="0 0 24 24">
                <rect x="5" y="3" width="14" height="18" rx="2"/>
                <path d="M8 7h8"/>
                <path d="M8 11h8"/>
                <circle cx="12" cy="16" r="2"/>
            </svg>
        `,
  },

  {
    name: "Moving Help",
    description: "Packing & shifting",
    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M3 7h12v11H3z"/>
                <path d="m15 11 3-3h3v10h-6"/>
                <circle cx="7" cy="20" r="2"/>
                <circle cx="18" cy="20" r="2"/>
            </svg>
        `,
  },
];

/* =========================================================
   POPULAR SERVICES
========================================================= */

const serviceGrid = document.getElementById("serviceGrid");

const viewAllServices = document.getElementById("viewAllServices");

let showingAll = false;

function renderServices() {
  const visible = showingAll ? services : services.slice(0, 5);

  serviceGrid.innerHTML = "";

  visible.forEach((service, index) => {
    const card = document.createElement("div");

    card.className = "service-card";

    card.style.animationDelay = `${index * 0.04}s`;

    card.innerHTML = `

            <div class="service-icon">
                ${service.icon}
            </div>

            <strong>
                ${service.name}
            </strong>

            <small>
                ${service.description}
            </small>

        `;

    card.addEventListener("click", () => createServiceRequest(service.name));

    serviceGrid.appendChild(card);
  });

  viewAllServices.innerHTML = showingAll
    ? `
                Show less

                <svg viewBox="0 0 24 24">
                    <path d="M5 12h14"/>
                    <path d="m11 18 6-6-6-6"/>
                </svg>
            `
    : `
                View all services

                <svg viewBox="0 0 24 24">
                    <path d="M5 12h14"/>
                    <path d="m13 6 6 6-6 6"/>
                </svg>
            `;
}

renderServices();

viewAllServices.addEventListener("click", () => {
  showingAll = !showingAll;

  renderServices();
});

/* =========================================================
   RECOMMENDED SERVICES
========================================================= */

const recommendedGrid = document.getElementById("recommendedGrid");

const recommended = [
  {
    name: "Home Cleaning",
    description: "Perfect for your regular home upkeep.",
    rating: "4.8",
    reviews: "128",
    price: "₹399 onwards",

    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M4 16h16"/>
                <path d="M6 16V8h12v8"/>
                <path d="M8 8V5h8v3"/>
            </svg>
        `,
  },

  {
    name: "Electrical Repair",
    description: "Quick help for electrical problems.",
    rating: "4.7",
    reviews: "96",
    price: "₹299 onwards",

    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z"/>
            </svg>
        `,
  },

  {
    name: "Plumbing Service",
    description: "For leaks, pipes and everyday repairs.",
    rating: "4.6",
    reviews: "84",
    price: "₹499 onwards",

    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M8 4v7a4 4 0 0 0 8 0V4"/>
                <path d="M6 4h4"/>
                <path d="M14 4h4"/>
                <path d="M12 15v6"/>
            </svg>
        `,
  },

  {
    name: "Gardening",
    description: "Keep your plants and outdoor space fresh.",
    rating: "4.9",
    reviews: "73",
    price: "₹349 onwards",

    icon: `
            <svg viewBox="0 0 24 24">
                <path d="M12 21V10"/>
                <path d="M12 13C7 13 5 10 5 6c4 0 7 2 7 7Z"/>
                <path d="M12 10c0-4 3-6 7-6 0 4-2 7-7 7"/>
            </svg>
        `,
  },
];

recommended.forEach((service) => {
  const card = document.createElement("div");

  card.className = "recommended-card";

  card.innerHTML = `

        <div class="recommended-image">
            ${service.icon}
        </div>

        <div class="recommended-content">

            <h3>
                ${service.name}
            </h3>

            <p>
                ${service.description}
            </p>

            <div class="recommended-meta">

                <span class="recommended-rating">
                    <strong>★ ${service.rating}</strong>
                    (${service.reviews})
                </span>

                <span class="recommended-price">
                    ${service.price}
                </span>

            </div>

        </div>

    `;

  card.addEventListener("click", () => createServiceRequest(service.name));

  recommendedGrid.appendChild(card);
});

/* =========================================================
   SEARCH

   AI search is handled by static/search_ai.js.
   This page keeps the search elements here so the existing
   service-request flow remains unchanged.
========================================================= */

/* =========================================================
   PROFILE DRAWER
========================================================= */

const profileTrigger = document.getElementById("profileTrigger");

const profileDrawer = document.getElementById("profileDrawer");

const drawerOverlay = document.getElementById("drawerOverlay");

const drawerClose = document.getElementById("drawerClose");

function openDrawer() {
  profileDrawer.classList.add("active");

  drawerOverlay.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  profileDrawer.classList.remove("active");

  drawerOverlay.classList.remove("active");

  document.body.style.overflow = "";
}

profileTrigger.addEventListener("click", openDrawer);

drawerClose.addEventListener("click", closeDrawer);

drawerOverlay.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawer();
  }
});

/* =========================================================
   NOTIFICATION
========================================================= */

document.getElementById("notificationButton").addEventListener("click", () => {
  showToast("You have 2 new notifications");
});

/* =========================================================
   REAL LOCATION
========================================================= */

const locationValue = document.getElementById("locationValue");

const locationStatus = document.getElementById("locationStatus");

const changeLocation = document.getElementById("changeLocation");

const locationCacheKey = "nabhi_location_cache";
const locationDeniedKey = "nabhi_location_denied";

function restoreSavedLocation() {
  try {
    const savedLocation = JSON.parse(
      localStorage.getItem(locationCacheKey) || "null",
    );

    if (!savedLocation?.label) {
      return false;
    }

    locationValue.textContent = savedLocation.label;
    locationStatus.style.background = "#39A96B";
    return true;
  } catch (_) {
    return false;
  }
}

function saveLocation(label, latitude, longitude) {
  localStorage.setItem(
    locationCacheKey,
    JSON.stringify({ label, latitude, longitude }),
  );
}

function updateLocation(position) {
  const latitude = position.coords.latitude;

  const longitude = position.coords.longitude;

  locationStatus.style.background = "#39A96B";

  /*
       Reverse geocoding through
       OpenStreetMap Nominatim.
    */

  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Location lookup failed");
      }

      return response.json();
    })
    .then((data) => {
      const address = data.address || {};

      const area =
        address.suburb ||
        address.neighbourhood ||
        address.city_district ||
        address.town ||
        address.village ||
        address.city ||
        "Current location";

      const city = address.city || address.town || address.municipality || "";

      let locationLabel;

      if (city && area !== city) {
        locationLabel = `${area}, ${city}`;
      } else {
        locationLabel = area;
      }

      locationValue.textContent = locationLabel;
      saveLocation(locationLabel, latitude, longitude);
    })
    .catch(() => {
      const locationLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      locationValue.textContent = locationLabel;
      saveLocation(locationLabel, latitude, longitude);
    });
}

function detectLocation(force = false) {
  if (!force && restoreSavedLocation()) {
    return;
  }

  if (!force && localStorage.getItem(locationDeniedKey) === "true") {
    locationValue.textContent = "Location permission denied";
    locationStatus.style.background = "#C94B4B";
    return;
  }

  if (!navigator.geolocation) {
    locationValue.textContent = "Location unavailable";

    return;
  }

  locationValue.textContent = "Detecting your location...";

  locationStatus.style.background = "#F4A93B";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      updateLocation(position);
    },

    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        localStorage.setItem(locationDeniedKey, "true");

        locationValue.textContent = "Location permission denied";
      } else {
        locationValue.textContent = "Unable to detect location";
      }

      locationStatus.style.background = "#C94B4B";
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    },
  );
}

detectLocation();

changeLocation.addEventListener("click", () => {
  localStorage.removeItem(locationDeniedKey);
  detectLocation(true);
});

function createServiceRequest(serviceName) {
  sessionStorage.setItem("nabhiService", serviceName);
  sessionStorage.removeItem("nabhiDescription");
  sessionStorage.removeItem("nabhiImageCount");
  sessionStorage.removeItem("nabhiMode");
  sessionStorage.removeItem("nabhiDate");
  sessionStorage.removeItem("nabhiTime");
  location.href = `service-request.html?service=${encodeURIComponent(serviceName)}`;
}

document.getElementById("createRequest").addEventListener("click", () => {
  const selected = sessionStorage.getItem("nabhiService");
  if (selected) {
    location.href = `service-request.html?service=${encodeURIComponent(selected)}`;
  } else {
    location.href = "service-request.html";
  }
});

/* =========================================================
   LOGOUT
========================================================= */

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("nabhi_access_token");
  localStorage.removeItem("nabhi_user");
  window.location.href = "login.html";
});

/* =========================================================
   TOAST
========================================================= */

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toastMessage");

let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);

  toastMessage.textContent = message;

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* =========================================================
   NAVBAR ACTIVE HIGHLIGHT
========================================================= */

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});
/* Restore logged-in customer identity when available */
(() => {
  const raw = localStorage.getItem("nabhi_user");
  if (!raw) return;
  try {
    const user = JSON.parse(raw);
    const fullName = (user.name || "Customer").trim();
    const firstName = fullName.split(/\s+/)[0];
    const initials = fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

    document
      .querySelectorAll(".profile-name")
      .forEach((el) => (el.textContent = firstName));
    document
      .querySelectorAll(".profile-avatar, #profile-summary-avatar")
      .forEach((el) => (el.textContent = initials));

    const heroName = document.getElementById("hero-name");
    if (heroName) heroName.textContent = firstName;

    const profileSummaryName = document.getElementById("profile-summary-name");
    if (profileSummaryName) profileSummaryName.textContent = fullName;

    const profileSummaryEmail = document.getElementById(
      "profile-summary-email",
    );
    if (profileSummaryEmail && user.email)
      profileSummaryEmail.textContent = user.email;
  } catch (_) {}
})();

/* =========================================================
   CUSTOMER ACCOUNT WORKSPACE
========================================================= */

const accountModal = document.getElementById("accountModal");
const accountModalBody = document.getElementById("accountModalBody");
const accountModalTitle = document.getElementById("accountModalTitle");

async function customerApi(path, options = {}) {
  const token = localStorage.getItem("nabhi_access_token");
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || "Unable to complete request");
  return data;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("nabhi_user") || "{}");
  } catch (_) {
    return {};
  }
}

function formatBookingDate(value) {
  if (!value) return "ASAP request";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function bookingStatus(status) {
  return String(status || "pending").replace("-", " ");
}

function bookingRows(bookings, compact = false) {
  if (!bookings.length)
    return `<div class="account-empty">No service requests yet. Create one from the homepage.</div>`;
  return bookings
    .map(
      (booking) => `
        <article class="booking-row ${compact ? "compact" : ""}">
            <div class="booking-icon">⌂</div>
            <div class="booking-copy">
                <strong>${booking.service || "Service request"}</strong>
                <span>${formatBookingDate(booking.scheduledDate || booking.createdAt)} · ${bookingStatus(booking.status)}</span>
            </div>
            <span class="booking-pill ${booking.status || "pending"}">${bookingStatus(booking.status)}</span>
        </article>
    `,
    )
    .join("");
}

function openAccountModal(view = "bookings") {
  accountModal.hidden = false;
  document.body.style.overflow = "hidden";
  renderAccountView(view);
}

function closeAccountModal() {
  accountModal.hidden = true;
  document.body.style.overflow = "";
}

async function renderAccountView(view) {
  const user = getStoredUser();
  const headings = {
    edit: "Edit profile",
    track: "Track booking",
    bookings: "My bookings",
    recent: "Recent requests",
    help: "Help & support",
    settings: "Settings",
  };
  accountModalTitle.textContent = headings[view] || "My account";
  accountModalBody.innerHTML = `<div class="account-loading">Loading...</div>`;

  if (view === "edit") {
    accountModalBody.innerHTML = `
            <form class="account-form" id="profileForm">
                <label>Full name<input name="name" value="${user.name || ""}" required minlength="3"></label>
                <label>Email<input value="${user.email || ""}" disabled></label>
                <label>Phone<input name="phone" inputmode="numeric" value="${user.phone || ""}" placeholder="10 digit phone number"></label>
                <label>Address<textarea name="address" rows="3" placeholder="Add your service address">${user.address || ""}</textarea></label>
                <button class="account-primary-button" type="submit">Save profile</button>
            </form>
        `;
    document
      .getElementById("profileForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const button = event.currentTarget.querySelector("button");
        button.disabled = true;
        try {
          const result = await customerApi("/auth/profile", {
            method: "PUT",
            body: JSON.stringify(Object.fromEntries(form.entries())),
          });
          localStorage.setItem("nabhi_user", JSON.stringify(result.user));
          showToast("Profile updated");
          window.location.reload();
        } catch (error) {
          showToast(error.message);
          button.disabled = false;
        }
      });
    return;
  }

  if (view === "help") {
    accountModalBody.innerHTML = `
            <div class="support-intro"><strong>How can we help?</strong><span>Our support team is available for your Sahayak service requests.</span></div>
            <div class="support-list">
                <a href="mailto:support@sahayak.com"><span>✉</span><div><strong>Email support</strong><small>support@sahayak.com</small></div><b>→</b></a>
                <button type="button" data-support-message="We will connect you with a local support representative."><span>?</span><div><strong>Chat with support</strong><small>Get help with a booking</small></div><b>→</b></button>
                <button type="button" data-support-message="Cancellation help is available from My bookings."><span>↻</span><div><strong>Booking help</strong><small>Changes, cancellations and status</small></div><b>→</b></button>
            </div>
        `;
    accountModalBody
      .querySelectorAll("[data-support-message]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          showToast(button.dataset.supportMessage),
        ),
      );
    return;
  }

  if (view === "settings") {
    accountModalBody.innerHTML = `
            <div class="settings-list">
                <label><span><strong>Booking notifications</strong><small>Updates about your service requests</small></span><input type="checkbox" checked></label>
                <label><span><strong>Location access</strong><small>Use your location to find nearby workers</small></span><input type="checkbox" checked></label>
            </div>
            <button class="account-secondary-button" id="clearSearchButton">Clear saved service search</button>
        `;
    document
      .getElementById("clearSearchButton")
      .addEventListener("click", () => {
        sessionStorage.removeItem("nabhiService");
        showToast("Saved search cleared");
      });
    return;
  }

  try {
    const result = await customerApi("/bookings");
    const bookings = result.bookings || [];
    if (view === "track") {
      accountModalBody.innerHTML = bookings.length
        ? `<div class="track-card"><span class="eyebrow">LATEST REQUEST</span>${bookingRows([bookings[0]])}</div><p class="account-note">Your latest request status will update here as a worker responds.</p>`
        : `<div class="account-empty">You have no active booking to track.</div>`;
    } else {
      accountModalBody.innerHTML = `<div class="booking-list">${bookingRows(view === "recent" ? bookings.slice(0, 3) : bookings)}</div>`;
    }
  } catch (error) {
    accountModalBody.innerHTML = `<div class="account-empty">${error.message}. Please log in again.</div>`;
  }
}

document
  .getElementById("accountModalClose")
  .addEventListener("click", closeAccountModal);
document.querySelectorAll("[data-account-view]").forEach((button) =>
  button.addEventListener("click", () => {
    closeDrawer();
    openAccountModal(button.dataset.accountView);
  }),
);
document.getElementById("editProfileButton").addEventListener("click", () => {
  closeDrawer();
  openAccountModal("edit");
});
document.getElementById("settingsButton").addEventListener("click", () => {
  closeDrawer();
  openAccountModal("settings");
});
document.getElementById("recentRequestSeeAll").addEventListener("click", () => {
  closeDrawer();
  openAccountModal("recent");
});
accountModal.addEventListener("click", (event) => {
  if (event.target === accountModal) closeAccountModal();
});

function renderHomepageBookings(bookings) {
  const bookingsGrid = document.getElementById("bookingsGrid");
  if (!bookingsGrid) return;

  const displayBookings = bookings.length
    ? bookings.slice(0, 3).map((booking) => {
        const date = new Date(
          booking.scheduledDate || booking.createdAt || Date.now(),
        );
        return {
          day: date.getDate(),
          month: date
            .toLocaleDateString(undefined, { month: "short" })
            .toUpperCase(),
          status: bookingStatus(booking.status).toUpperCase(),
          statusClass: booking.status === "in-progress" ? "active" : "upcoming",
          service: booking.service || "Service request",
          details: `${formatBookingDate(booking.scheduledDate || booking.createdAt)} · ${bookingStatus(booking.status)}`,
          workerInitial: (booking.worker?.name || "N").charAt(0).toUpperCase(),
          worker: booking.worker?.name || "Sahayak worker",
        };
      })
    : [
        {
          day: "07",
          month: "SEP",
          status: "UPCOMING",
          statusClass: "upcoming",
          service: "AC not cooling",
          details: "4:30 PM · Today · ₹850",
          workerInitial: "R",
          worker: "Rahul S. · AC Repair",
        },
        {
          day: "07",
          month: "SEP",
          status: "IN PROGRESS",
          statusClass: "active",
          service: "Bathroom tap leak",
          details: "12:30 PM · In progress · ₹650",
          workerInitial: "A",
          worker: "Amit K. · Plumbing",
        },
        {
          day: "09",
          month: "SEP",
          status: "UPCOMING",
          statusClass: "upcoming",
          service: "Fan installation",
          details: "10:00 AM · Scheduled · ₹500",
          workerInitial: "S",
          worker: "Suresh P. · Electrical",
        },
      ];

  bookingsGrid.innerHTML = displayBookings
    .map(
      (booking, index) => `
                        <article class="booking-card" style="animation-delay: ${index * 0.06}s;">
                        <div class="booking-date">
                            <strong>${booking.day}</strong>
                            <span>${booking.month}</span>
                        </div>
                        <div>
                            <span class="booking-status ${booking.statusClass}">
                                ${booking.status}
                            </span>
                            <h3>${booking.service}</h3>
                            <p>${booking.details}</p>
                            <div class="booking-worker">
                                <span>${booking.workerInitial}</span>
                                ${booking.worker}
                            </div>
                        </div>
                        <button class="booking-track" type="button">Track this booking →</button>
                    </article>
                `,
    )
    .join("");
}

(async () => {
  const viewAllBookings = document.getElementById("viewAllBookings");
  let bookings = [];

  try {
    const result = await customerApi("/bookings");
    bookings = result.bookings || [];
    renderHomepageBookings(bookings);
  } catch (_) {
    renderHomepageBookings([]);
  }

  if (viewAllBookings) {
    viewAllBookings.addEventListener("click", () =>
      openAccountModal("bookings"),
    );
  }

  const latest = bookings[0];
  if (!latest) return;
  document.getElementById("recentRequestService").textContent =
    latest.service || "Service request";
  document.getElementById("recentRequestStatus").textContent =
    `${formatBookingDate(latest.scheduledDate || latest.createdAt)} · ${bookingStatus(latest.status)}`;
})();
