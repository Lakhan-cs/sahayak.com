const service = sessionStorage.getItem("nabhiService") || "Home Service";
const asap = document.getElementById("asapChoice");
const later = document.getElementById("laterChoice");
const panel = document.getElementById("schedulePanel");
const date = document.getElementById("date");
const timeSelect = document.getElementById("timeSelect");
const timeGrid = document.getElementById("timeGrid");
const timingSummary = document.getElementById("timingSummary");
const locationName = document.getElementById("locationName");
const locationStatus = document.getElementById("locationStatus");
let mode = "asap";
let locationText = sessionStorage.getItem("nabhiLocation") || "Current location";
let locationCoords = {
    latitude: Number(sessionStorage.getItem("nabhiLatitude")),
    longitude: Number(sessionStorage.getItem("nabhiLongitude"))
};

document.getElementById("serviceSummary").textContent = service;

const slots = ["10:00 AM", "11:30 AM", "1:00 PM", "3:30 PM", "5:00 PM", "6:30 PM"];
slots.forEach(slot => {
    const b = document.createElement("button"); b.className = "time-btn"; b.textContent = slot;
    b.onclick = () => {
        document.querySelectorAll(".time-btn").forEach(x => x.classList.remove("selected"));
        b.classList.add("selected"); timeSelect.value = slot; updateSummary();
    };
    timeGrid.appendChild(b);
});

const today = new Date();
date.min = today.toISOString().split("T")[0];
date.value = today.toISOString().split("T")[0];

function setMode(next) {
    mode = next;
    asap.classList.toggle("selected", mode === "asap");
    later.classList.toggle("selected", mode === "later");
    panel.classList.toggle("active", mode === "later");
    updateSummary();
}
asap.onclick = () => setMode("asap");
later.onclick = () => setMode("later");

function updateSummary() {
    if (mode === "asap") timingSummary.textContent = "ASAP · Best available worker";
    else timingSummary.textContent = (date.value || "Select date") + " · " + (timeSelect.value || "Select time");
}
date.onchange = updateSummary;
timeSelect.onchange = () => {
    document.querySelectorAll(".time-btn").forEach(b => b.classList.toggle("selected", b.textContent === timeSelect.value));
    updateSummary();
};

function detectLocation() {
    locationName.textContent = "Detecting your current location…";
    locationStatus.textContent = "● Finding location";
    if (!navigator.geolocation) {
        locationName.textContent = locationText; locationStatus.textContent = "● Location unavailable"; return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await r.json(), a = data.address || {};
            const area = a.suburb || a.neighbourhood || a.city_district || a.town || a.village || a.city || "Current location";
            const city = a.city || a.town || a.municipality || "";
            locationText = city && area !== city ? `${area}, ${city}` : area;
            locationCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            sessionStorage.setItem("nabhiLatitude", String(pos.coords.latitude));
            sessionStorage.setItem("nabhiLongitude", String(pos.coords.longitude));
        } catch { locationText = "Current location"; }
        locationName.textContent = locationText; locationStatus.textContent = "● Current location";
        sessionStorage.setItem("nabhiLocation", locationText);
    }, () => {
        locationName.textContent = locationText;
        locationStatus.textContent = "● Location permission unavailable";
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 });
}
detectLocation();
document.getElementById("changeLocation").onclick = detectLocation;

document.getElementById("findBtn").onclick = () => {
    if (mode === "later" && (!date.value || !timeSelect.value)) {
        if (!date.value) date.focus(); else timeSelect.focus(); return;
    }
    sessionStorage.setItem("nabhiMode", mode);
    sessionStorage.setItem("nabhiDate", date.value);
    sessionStorage.setItem("nabhiTime", timeSelect.value);
    sessionStorage.setItem("nabhiLocation", locationText);
    location.href = "worker-match.html";
};