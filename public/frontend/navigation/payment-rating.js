const booking = JSON.parse(localStorage.getItem("nabhiActiveBooking") || "null");
const $ = id => document.getElementById(id);
let selectedRating = 0;

$("serviceName").textContent = booking?.service || sessionStorage.getItem("nabhiService") || "Home service";
$("workerName").textContent = booking?.worker?.name || "Rahul Sharma";
$("serviceAmount").textContent = booking?.estimate || "₹448";

$("ratingStars").addEventListener("click", event => {
    const button = event.target.closest("button[data-rating]");
    if (!button) return;
    selectedRating = Number(button.dataset.rating);
    $("ratingStars").querySelectorAll("button").forEach(star => star.classList.toggle("selected", Number(star.dataset.rating) <= selectedRating));
});

$("payButton").addEventListener("click", () => {
    localStorage.setItem("nabhiPaymentStatus", "paid");
    localStorage.setItem("nabhiPaymentMethod", $("paymentMethod").value);
    $("paymentStatus").textContent = "Paid";
    $("paymentStatusMessage").textContent = "Payment confirmed for this demo.";
    $("payButton").disabled = true;
});

$("submitRating").addEventListener("click", () => {
    if (!selectedRating) {
        $("ratingStatus").textContent = "Choose a star rating first.";
        $("ratingStatus").style.color = "#b45b36";
        return;
    }
    localStorage.setItem("nabhiRating", JSON.stringify({ rating: selectedRating, feedback: $("feedback").value.trim(), submittedAt: Date.now() }));
    $("ratingStatus").textContent = "Thanks. Your feedback has been recorded.";
    $("submitRating").disabled = true;
});
