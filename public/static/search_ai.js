/* =========================================================
    SAHAYAK — AI SERVICE SEARCH
   Works on homepage.html and customerhomepage.html
========================================================= */

const SERVICE_ALIASES = {
  "home cleaning": "Home Cleaning",
  cleaning: "Home Cleaning",
  cleaner: "Home Cleaning",
  cleaners: "Cleaners",
  electrical: "Electrical",
  electrician: "Electrician",
  "electrical repair": "Electrical",
  plumbing: "Plumbing",
  plumber: "Plumbing",
  plumbers: "Plumbing",
  "plumbing service": "Plumbing",
  painting: "Painting",
  painter: "Painter",
  gardening: "Gardening",
  gardener: "Gardening",
  gardeners: "Gardeners",
  carpentry: "Carpentry",
  carpenter: "Carpentry",
  "ac repair": "AC Repair",
  "air conditioner": "AC Repair",
  "air conditioning": "AC Repair",
  "pest control": "Pest Control",
  "appliance repair": "Appliance Repair",
  "moving help": "Moving Help",
  driver: "Drivers",
  drivers: "Drivers",
  driving: "Drivers",
  cooking: "Cooking",
  cook: "Cooking",
  "tech help": "Tech help",
  "technical support": "Tech help",
};

function cleanServiceName(service) {
  const raw = String(service || "").trim();
  const key = raw.toLowerCase();

  return SERVICE_ALIASES[key] || raw;
}

function serviceCategory(service) {
  const value = String(service || "").toLowerCase();

  if (/clean|housekeeping|hygiene/.test(value)) return "cleaning";
  if (/electric|wiring|switch|socket/.test(value)) return "electrical";
  if (/plumb|pipe|leak|tap|drain/.test(value)) return "plumbing";
  if (/paint|wall|interior/.test(value)) return "painting";
  if (/garden|plant|lawn|outdoor/.test(value)) return "gardening";
  if (/carpent|furniture|woodwork/.test(value)) return "carpentry";
  if (/ac repair|air conditioner|air conditioning|cooling/.test(value))
    return "ac";
  if (/pest|insect|termite|cockroach/.test(value)) return "pest";
  if (/appliance|washing machine|refrigerator|fridge|microwave/.test(value))
    return "appliance";
  if (/moving|shifting|packing/.test(value)) return "moving";
  if (/driver|driving|cab/.test(value)) return "driving";
  if (/cook|cooking|food/.test(value)) return "cooking";
  if (/tech|computer|laptop|software/.test(value)) return "tech";

  return value.trim();
}

function servicesMatch(first, second) {
  return serviceCategory(first) === serviceCategory(second);
}

async function runAIServiceSearch(inputElement, resultElement) {
  if (!inputElement || !resultElement) return;

  const text = inputElement.value.trim();

  if (!text) {
    resultElement.innerHTML = `
            <div class="ai-result">
                <p>Please describe the service you need.</p>
            </div>
        `;
    resultElement.classList.add("active");
    return;
  }

  resultElement.innerHTML = `
        <div class="ai-result ai-result-loading">
            <strong>Understanding your requirement...</strong>
        </div>
    `;
  resultElement.classList.add("active");

  try {
    const response = await fetch("/api/understand", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to understand the requirement.");
    }

    const service = cleanServiceName(data.service);
    const issue = data.issue || text;
    const confidence = Number(data.confidence);
    const confidenceText = Number.isFinite(confidence)
      ? `${(confidence * 100).toFixed(1)}%`
      : "—";

    resultElement.innerHTML = `
            <div class="ai-result">
                <div class="ai-result-title">Requirement understood</div>

                <p>
                    <strong>Service:</strong> ${escapeHTML(service)}
                </p>

                <p>
                    <strong>Issue:</strong> ${escapeHTML(issue)}
                </p>

                <p class="ai-result-confidence">
                    <strong>Confidence:</strong> ${confidenceText}
                </p>

                <button
                    type="button"
                    class="ai-view-service"
                    data-service="${escapeAttribute(service)}">
                    View ${escapeHTML(service)}
                    <span aria-hidden="true">→</span>
                </button>
            </div>
        `;

    const button = resultElement.querySelector(".ai-view-service");

    if (button) {
      button.addEventListener("click", () => {
        selectService(button.dataset.service);
      });
    }
  } catch (error) {
    resultElement.innerHTML = `
            <div class="ai-result">
                <strong>AI search unavailable</strong>
                <p>Please try again or choose a service below.</p>
            </div>
        `;

    console.error("AI service search error:", error);
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

/* =========================================================
   SELECT SERVICE
========================================================= */

function selectService(service) {
  const selectedService = cleanServiceName(service);

  sessionStorage.setItem("nabhiService", selectedService);

  /* -----------------------------------------------------
       CUSTOMER PAGE
       AI result -> normal service request flow
    ----------------------------------------------------- */

  if (document.getElementById("serviceSearch")) {
    sessionStorage.removeItem("nabhiDescription");
    sessionStorage.removeItem("nabhiImageCount");
    sessionStorage.removeItem("nabhiMode");
    sessionStorage.removeItem("nabhiDate");
    sessionStorage.removeItem("nabhiTime");

    window.location.href = `service-request.html?service=${encodeURIComponent(selectedService)}`;

    return;
  }

  /* -----------------------------------------------------
       PUBLIC HOMEPAGE
       AI result -> Popular Services section
       + highlight the detected service
    ----------------------------------------------------- */

  const servicesSection = document.getElementById("services");

  const cards = document.querySelectorAll("#serviceGrid .service-card");

  let targetCard = null;

  cards.forEach((card) => {
    const cardName =
      card.dataset.service || card.querySelector("p")?.textContent || "";

    if (servicesMatch(cardName, selectedService)) {
      targetCard = card;
    }
  });

  if (servicesSection) {
    servicesSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // homepage.js can reveal the remaining cards when needed.
  const allCards = document.querySelectorAll("#serviceGrid .service-card");

  allCards.forEach((card) => card.classList.remove("ai-selected-service"));

  if (!targetCard || targetCard.hidden) {
    const viewAll = document.querySelector(".view-all");

    if (viewAll && viewAll.textContent.toLowerCase().includes("view all")) {
      viewAll.click();
    }

    setTimeout(() => {
      highlightHomepageService(selectedService);
    }, 180);
  } else {
    highlightCard(targetCard);
  }
}

function highlightHomepageService(service) {
  const cards = document.querySelectorAll("#serviceGrid .service-card");

  let found = false;

  cards.forEach((card) => {
    const name =
      card.dataset.service || card.querySelector("p")?.textContent || "";

    if (servicesMatch(name, service)) {
      highlightCard(card);
      found = true;
    }
  });

  if (!found) {
    console.warn("AI service not found in homepage cards:", service);
  }
}

function highlightCard(card) {
  if (!card) return;

  card.classList.add("ai-selected-service");

  card.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
}

/* =========================================================
   HOMEPAGE AI SEARCH
========================================================= */

function setupHomepageSearch() {
  const input = document.getElementById("searchInput");

  const result = document.getElementById("result");

  if (!input || !result) return;

  const button = input.closest(".ai-search")?.querySelector("button");

  if (button) {
    button.addEventListener("click", () => {
      runAIServiceSearch(input, result);
    });
  }

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runAIServiceSearch(input, result);
    }
  });
}

/* =========================================================
   CUSTOMER HOMEPAGE AI SEARCH
========================================================= */

function setupCustomerSearch() {
  const input = document.getElementById("serviceSearch");

  const result = document.getElementById("searchResults");

  const button = document.getElementById("searchButton");

  if (!input || !result) return;

  // Prevent the old local search handler from showing suggestions.
  if (button) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      runAIServiceSearch(input, result);
    });
  }

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runAIServiceSearch(input, result);
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-container")) {
      result.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupHomepageSearch();
  setupCustomerSearch();
});

// Keep available for existing inline integrations.
window.searchService = () => {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("result");
  return runAIServiceSearch(input, result);
};

window.selectService = selectService;
