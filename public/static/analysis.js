
let forecastChart = null;
let optionsCache = null;

async function loadOptions() {
  const r = await fetch("/api/options");
  optionsCache = await r.json();
  const area = document.getElementById("area");
  const service = document.getElementById("service");

  area.innerHTML = optionsCache.areas.map(x => `<option value="${x}">${x}</option>`).join("");

  function syncServices() {
    const valid = optionsCache.pairs
      .filter(p => p.area === area.value)
      .map(p => p.service);
    service.innerHTML = valid.map(x => `<option value="${x}">${x}</option>`).join("");
  }

  const pair = optionsCache.pairs[0];
  if (pair) area.value = pair.area;
  syncServices();
}

async function generateForecast() {
  const area = document.getElementById("area").value;
  const service = document.getElementById("service").value;
  const button = document.getElementById("forecastBtn");
  const status = document.getElementById("forecastStatus");

  button.disabled = true;
  button.textContent = "Generating...";
  status.textContent = "Running feature-enriched forecast...";

  try {
    const response = await fetch(`/api/forecast?area=${encodeURIComponent(area)}&service=${encodeURIComponent(service)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Forecast failed");

    if (forecastChart) forecastChart.destroy();

    const forecastCanvas = document.getElementById("forecastChart");
    const forecastValues = data.forecast.map(Number);

    // Y-axis: max value 2 → axis goes to 4
    const highestValue = Math.max(...forecastValues, 0);
    const yAxisMax = Math.max(4, Math.ceil(highestValue) + 2);

    const ctx = forecastCanvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(47,111,237,0.30)");
    gradient.addColorStop(1, "rgba(47,111,237,0.02)");

    forecastChart = new Chart(forecastCanvas, {
      type: "line",

      data: {
        labels: data.dates,

        datasets: [{
          label: `${data.area} - ${data.service} predicted requests`,
          data: forecastValues,

          borderColor: "#2f6fed",
          backgroundColor: gradient,

          borderWidth: 3,
          tension: 0.35,
          fill: true,

          // Point Styling
          pointStyle: "circle",
          pointRadius: 6,
          pointHoverRadius: 10,

          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#2f6fed",
          pointBorderWidth: 3,

          pointHoverBackgroundColor: "#2f6fed",
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 3
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          mode: "index",
          intersect: false
        },

        plugins: {
          legend: {
            display: true,

            labels: {
              usePointStyle: true,
              padding: 18
            }
          },

          tooltip: {
            backgroundColor: "rgba(10,15,28,0.95)",
            padding: 12,

            callbacks: {
              label: function(context) {
                return ` Predicted Requests: ${context.parsed.y}`;
              }
            }
          }
        },

        scales: {
          y: {
            beginAtZero: true,

            // IMPORTANT
            max: yAxisMax,

            ticks: {
              precision: 0,
              stepSize: 1
            },

            grid: {
              color: "rgba(255,255,255,0.07)"
            },

            title: {
              display: true,
              text: "Requests"
            }
          },

          x: {
            grid: {
              color: "rgba(255,255,255,0.04)"
            },

            title: {
              display: true,
              text: "Date"
            }
          }
        },

        // Strong Chart.js animation
        animation: {
          duration: 1800,
          easing: "easeOutQuart",

          delay: function(context) {
            if (context.type === "data") {
              return context.dataIndex * 180;
            }

            return 0;
          }
        },

        animations: {
          y: {
            duration: 1400,
            easing: "easeOutCubic"
          },

          opacity: {
            duration: 900,
            easing: "easeOutQuart"
          }
        },

        transitions: {
          active: {
            animation: {
              duration: 300,
              easing: "easeOutCubic"
            }
          }
        }
      }
    });

    document.getElementById("totalForecast").textContent = data.total_forecast;
    // document.getElementById("peakDemand").textContent = data.peak_demand;
    document.getElementById("current_available_workers").textContent = data.current_available_workers;
    document.getElementById("required_Workers").textContent = data.requiredWorkers;
    document.getElementById("capacity_Gap").textContent = data.capacityGap;
    document.getElementById("modelBadge").textContent = data.model;
    // document.getElementById("featureList").textContent = data.features.join(" • ");
    status.textContent = `Forecast generated. Validation MAE: ${data.validation_mae ?? "n/a"}.`;
  } catch (e) {
    status.textContent = `Error: ${e.message}`;
  } finally {
    button.disabled = false;
    button.textContent = "Generate Forecast";
  }
}

(async function(){
  await loadOptions();
  document.getElementById("forecastBtn").addEventListener("click", generateForecast);
  generateForecast();
})();
