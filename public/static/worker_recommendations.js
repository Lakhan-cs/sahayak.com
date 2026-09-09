
async function loadOptions() {
  const r = await fetch("/api/options");
  const d = await r.json();
  const area = document.getElementById("workerArea");
  const service = document.getElementById("workerService");
  area.innerHTML = d.areas.map(x => `<option>${x}</option>`).join("");

  function syncServices() {
    const valid = d.pairs.filter(p => p.area === area.value).map(p => p.service);
    service.innerHTML = valid.map(x => `<option>${x}</option>`).join("");
  }

  const pair = d.pairs[0];
  if (pair) area.value = pair.area;
  syncServices();

  area.addEventListener("change", syncServices);
}

async function recommend() {
  const area = document.getElementById("workerArea").value;
  const service = document.getElementById("workerService").value;
  const r = await fetch(`/api/worker_recommendations?area=${encodeURIComponent(area)}&service=${encodeURIComponent(service)}`);
  const d = await r.json();
  if (!r.ok) {
    document.getElementById("recommendations").textContent = d.error || "No data";
    return;
  }

  document.getElementById("workerForecast").textContent = d.forecast_next_7_days;
  document.getElementById("workerRequired").textContent = d.required_workers;
  document.getElementById("workerAvailable").textContent = d.current_available;
  document.getElementById("workerGap").textContent = d.capacity_gap;

  const rows = d.recommendations.map(x => `
    <tr>
      <td><strong>${x.provider_label}</strong></td>
      <td class="score">${x.score}</td>
      <td>${x.rating}</td>
      <td>${x.experience_years}</td>
      <td>${x.verification_status}</td>
      <td>${x.availability_hours} h</td>
      <td>${x.completion_rate}%</td>
      <td>${x.cancellation_rate}%</td>
      <td>${x.capacity_status}</td>
    </tr>`).join("");

  document.getElementById("recommendations").innerHTML = `
    <table class="rec-table">
      <thead><tr>
        <th>Provider</th><th>Score</th><th>Rating</th><th>Experience</th>
        <th>Verification</th><th>Availability</th><th>Completion</th>
        <th>Cancellation</th><th>Capacity</th>
      </tr></thead>
      <tbody>${rows || "<tr><td colspan='9'>No provider records found.</td></tr>"}</tbody>
    </table>`;
}

(async function(){
  await loadOptions();
  document.getElementById("recommendBtn").addEventListener("click", recommend);
  recommend();
})();
