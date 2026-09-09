const channel = "BroadcastChannel" in window ? new BroadcastChannel("nabhi-live") : null;
const rows = [...document.querySelectorAll(".match-row")];
const mode = sessionStorage.getItem("nabhiMode") || "asap";
const service = sessionStorage.getItem("nabhiService") || "Home Service";
const problem = sessionStorage.getItem("nabhiDescription") || "Customer needs help with a home service.";
const coords = JSON.parse(sessionStorage.getItem("nabhiLocationCoords") || "{\"latitude\":28.7041,\"longitude\":77.1025}");
const request = {
    id: `NB-${Date.now()}`,
    service,
    problem,
    customerName: "Ananya",
    customerAddress: sessionStorage.getItem("nabhiLocation") || "Current location",
    customer: {
        name: "Ananya",
        address: sessionStorage.getItem("nabhiLocation") || "Current location",
        location: { lat: Number(coords.latitude), lng: Number(coords.longitude) }
    },
    estimate: "₹448",
    distance: "Nearby",
    bookingType: mode
};

let requestSent = false;
let workerFound = false;

function markStep(index) {
    const status = rows[index]?.querySelector(".status");
    if (status) {
        status.textContent = "✓";
        status.style.color = "#3c9967";
    }
}

function sendRequest() {
    if (requestSent) return;
    requestSent = true;
    localStorage.setItem("nabhiWorkerRequest", JSON.stringify({ request, sentAt: Date.now() }));
    channel?.postMessage({ type: "booking-request", request });
    setTimeout(() => channel?.postMessage({ type: "booking-request", request }), 300);
}

function handlePresence(presence) {
    if (!presence?.available || workerFound) return;
    workerFound = true;
    markStep(1);
    setTimeout(() => {
        markStep(2);
        sendRequest();
        markStep(3);
    }, 500);
}

function handleAccepted(booking) {
    if (!booking || booking.id !== request.id) return;
    localStorage.setItem("nabhiActiveBooking", JSON.stringify(booking));
    localStorage.setItem("nabhiBookingStatus", "assigned");
    location.href = `customer-tracking.html?booking=${encodeURIComponent(booking.id)}`;
}

channel?.addEventListener("message", event => {
    const message = event.data || {};
    if (message.type === "worker-presence") handlePresence(message);
    if (message.type === "worker-accepted") handleAccepted(message.booking);
});

try {
    handlePresence(JSON.parse(localStorage.getItem("nabhiWorkerPresence") || "null"));
} catch (_) {}

rows.forEach((_, index) => setTimeout(() => markStep(index), 650 + index * 450));
setTimeout(() => {
    if (!requestSent) channel?.postMessage({ type: "worker-discover" });
}, 900);

document.getElementById("continueReview")?.addEventListener("click", () => {
    location.href = "review-booking.html";
});
