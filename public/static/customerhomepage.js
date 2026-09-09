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
========================================================= */

const searchInput = document.getElementById("serviceSearch");

const searchResults = document.getElementById("searchResults");

const searchButton = document.getElementById("searchButton");

function searchServices() {
  const query = searchInput.value.trim().toLowerCase();

  searchResults.innerHTML = "";

  if (!query) {
    searchResults.classList.remove("active");

    return;
  }

  const matches = services.filter((service) =>
    service.name.toLowerCase().includes(query),
  );

  if (!matches.length) {
    searchResults.innerHTML = `
            <div class="search-result">
                <div>
                    <strong>
                        No service found
                    </strong>

                    <span>
                        Try another service
                    </span>
                </div>
            </div>
        `;
  } else {
    matches.forEach((service) => {
      const result = document.createElement("div");

      result.className = "search-result";

      result.innerHTML = `

                <div class="search-result-icon">
                    ${service.icon}
                </div>

                <div>

                    <strong>
                        ${service.name}
                    </strong>

                    <span>
                        ${service.description}
                    </span>

                </div>

            `;

      result.addEventListener("click", () => {
        searchInput.value = service.name;

        searchResults.classList.remove("active");

        createServiceRequest(service.name);
      });

      searchResults.appendChild(result);
    });
  }

  searchResults.classList.add("active");
}

searchInput.addEventListener("input", searchServices);

searchButton.addEventListener("click", searchServices);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchServices();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-container")) {
    searchResults.classList.remove("active");
  }
});

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

let locationWatchId = null;

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

      if (city && area !== city) {
        locationValue.textContent = `${area}, ${city}`;
      } else {
        locationValue.textContent = area;
      }
    })
    .catch(() => {
      locationValue.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    });
}

function detectLocation() {
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

  /*
       Continue watching the user's
       position for updates.
    */

  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
  }

  locationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      updateLocation(position);
    },

    () => {},

    {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 15000,
    },
  );
}

detectLocation();

changeLocation.addEventListener("click", detectLocation);

/* =========================================================
   CREATE REQUEST
========================================================= */

const createRequest = document.getElementById("createRequest");

function createServiceRequest(serviceName) {
  /*
       Next step:

       service-request.html?service=...
    */

  showToast(`${serviceName} selected`);
}

createRequest.addEventListener("click", () => {
  showToast("Service request flow coming next");
});

/* =========================================================
   LOGOUT
========================================================= */

document.getElementById("logoutButton").addEventListener("click", () => {
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
