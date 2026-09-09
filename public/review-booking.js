const service = sessionStorage.getItem("nabhiService") || "Home Service";
const desc = sessionStorage.getItem("nabhiDescription") || "No description added.";
const mode = sessionStorage.getItem("nabhiMode") || "asap";
const date = sessionStorage.getItem("nabhiDate") || "";
const time = sessionStorage.getItem("nabhiTime") || "";
const locationText = sessionStorage.getItem("nabhiLocation") || "Current location";
const count = sessionStorage.getItem("nabhiImageCount") || "0";

document.getElementById("service").textContent = service;
document.getElementById("description").textContent = desc;
document.getElementById("photoText").textContent = count === "0" ? "No photos added" : `${count} photo${count === "1" ? "" : "s"} attached`;
document.getElementById("schedule").textContent = mode === "asap" ? "ASAP · Best available worker" : `${date} · ${time}`;
document.getElementById("location").textContent = locationText;

document.getElementById("confirmBtn").onclick = async () => {
    const btn = document.getElementById("confirmBtn");
    const latitude = Number(sessionStorage.getItem("nabhiLatitude"));
    const longitude = Number(sessionStorage.getItem("nabhiLongitude"));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        alert("Please allow location access before confirming the booking.");
        return;
    }

    const scheduledDate = mode === "scheduled" && date && time
        ? new Date(`${date} ${time}`).toISOString()
        : null;

    try {
        btn.disabled = true;
        btn.textContent = "Creating booking…";

        const token = localStorage.getItem("nabhi_access_token");
        if (!token) throw new Error("Please login before creating a booking.");

        const response = await fetch("/api/bookings", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                service,
                problemDescription: desc,
                bookingType: mode === "later" ? "scheduled" : "asap",
                scheduledDate,
                latitude,
                longitude
            })
        });

        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
            const refreshed = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
            if (refreshed.ok) {
                const refreshData = await refreshed.json();
                if (refreshData.accessToken) {
                    localStorage.setItem("nabhi_access_token", refreshData.accessToken);
                    return document.getElementById("confirmBtn").click();
                }
            }
        }
        if (!response.ok) throw new Error(data.message || "Could not create booking.");

        sessionStorage.setItem("nabhiBookingId", String(data.booking?._id || ""));
        sessionStorage.setItem("nabhiBookingStatus", data.booking?.status || "pending");
        location.href = "booking-confirmed.html";
    } catch (err) {
        alert(err.message);
        btn.disabled = false;
        btn.textContent = "Confirm booking";
    }
};
