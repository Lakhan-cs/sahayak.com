const booking = JSON.parse(localStorage.getItem("nabhiActiveBooking") || "null");
const params = new URLSearchParams(location.search);
const $ = id => document.getElementById(id);

$("serviceName").textContent = booking?.service || sessionStorage.getItem("nabhiService") || "Home service";
$("customerName").textContent = booking?.customer?.name || "Ananya";
$("customerAddress").textContent = booking?.customer?.address || "Gurgaon, Haryana";
$("serviceAmount").textContent = booking?.estimate || "₹448";

$("backToNavigation").addEventListener("click", () => {
    location.href = `worker-navigation.html?booking=${encodeURIComponent(booking?.id || params.get("booking") || "demo")}`;
});

$("completionForm").addEventListener("submit", event => {
    event.preventDefault();
    const note = $("completionNote").value.trim();
    localStorage.setItem("nabhiBookingStatus", "completed");
    localStorage.setItem("nabhiCompletionNote", note);
    localStorage.setItem("nabhiWorkerCompletedAt", new Date().toISOString());
    localStorage.setItem("nabhiWorkerCompletionNotice", JSON.stringify({ bookingId: booking?.id || params.get("booking") || "demo", completedAt: Date.now() }));
    $("completionStatus").textContent = "Job completed. The customer can now finish payment and rating.";
    event.currentTarget.querySelector("button[type=submit]").disabled = true;
});
