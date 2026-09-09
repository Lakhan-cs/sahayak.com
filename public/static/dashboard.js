
(async function(){
  try {
    const r = await fetch("/api/summary");
    const d = await r.json();
    document.getElementById("totalRequests").textContent = d.total_requests.toLocaleString();
    document.getElementById("completed_requests").textContent = d.completed_requests;
    document.getElementById("cancelled_requests").textContent = d.cancelled_requests;
    document.getElementById("geography").textContent = d.geography;
    document.getElementById("services").textContent = d.services;
    document.getElementById("areas").textContent = d.areas;
    document.getElementById("topService").textContent = d.top_service;
    document.getElementById("topServiceRequests").textContent = d.top_service_requests.toLocaleString() + " requests";
    document.getElementById("topArea").textContent = d.top_area;
    document.getElementById("topAreaRequests").textContent = d.top_area_requests.toLocaleString() + " requests";
    document.getElementById("dateRange").textContent = `${d.first_date} → ${d.last_date}`;
  } catch(e) {
    console.error(e);
  }
})();
