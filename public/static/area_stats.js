
let areaChart = null;

async function loadOptions() {
  const r = await fetch("/api/options");
  const d = await r.json();
  const s = document.getElementById("areaSelect");
  s.innerHTML = d.areas.map(x => `<option value="${x}">${x}</option>`).join("");
  return d.areas[0];
}

async function loadAreaDemand(area) {
  const response = await fetch(`/api/area_stats?area=${encodeURIComponent(area)}`);
  const data = await response.json();
  if (!response.ok) return;

  document.getElementById("lastWeek").textContent = data.last_week;
  document.getElementById("thisWeek").textContent = data.this_week;
  document.getElementById("nextWeek").textContent = data.next_week;
  document.getElementById("growthRate").textContent = data.growth_rate + "%";

 if (areaChart) areaChart.destroy();

const areaCanvas = document.getElementById("areaDemandChart");

const areaLabels = data.weekly.map(x => x.week);
const areaValues = data.weekly.map(x => Number(x.request_count));

const highestValue = Math.max(...areaValues, 0);
const areaYAxisMax = Math.max(4, Math.ceil(highestValue) + 2);

// Smooth trend line
const trendValues = areaValues.map((value, index) => {
  const start = Math.max(0, index - 1);
  const end = Math.min(areaValues.length - 1, index + 1);

  const nearbyValues = areaValues.slice(start, end + 1);

  const average =
    nearbyValues.reduce((sum, item) => sum + item, 0) /
    nearbyValues.length;

  return Number(average.toFixed(2));
});

const ctx = areaCanvas.getContext("2d");

const gradient = ctx.createLinearGradient(0, 0, 0, 380);
gradient.addColorStop(0, "rgba(47,111,237,0.35)");
gradient.addColorStop(0.55, "rgba(47,111,237,0.12)");
gradient.addColorStop(1, "rgba(47,111,237,0.01)");

areaChart = new Chart(areaCanvas, {
  type: "line",

  data: {
    labels: areaLabels,

    datasets: [
      {
        label: `${area} Weekly Requests`,
        data: areaValues,

        borderColor: "#2f6fed",
        backgroundColor: gradient,

        borderWidth: 3,
        fill: true,

        tension: 0.4,

        pointRadius: 5,
        pointHoverRadius: 8,

        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#2f6fed",
        pointBorderWidth: 3,

        pointHoverBackgroundColor: "#2f6fed",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3
      },

      {
        label: "Demand Trend",
        data: trendValues,

        borderColor: "#a855f7",
        borderWidth: 2,

        borderDash: [7, 6],

        pointRadius: 0,
        pointHoverRadius: 5,

        fill: false,

        tension: 0.4
      }
    ]
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

        titleFont: {
          size: 13,
          weight: "600"
        },

        bodyFont: {
          size: 12
        },

        displayColors: true,

        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },

    scales: {
      y: {
        beginAtZero: true,
        max: areaYAxisMax,

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
          text: "Week"
        }
      }
    },

    animation: {
      duration: 1800,
      easing: "easeOutQuart",

      delay: function(context) {
        if (context.type === "data") {

          // Main demand line appears first
          if (context.datasetIndex === 0) {
            return context.dataIndex * 180;
          }

          // Trend line appears slightly after
          if (context.datasetIndex === 1) {
            return 700 + context.dataIndex * 140;
          }
        }

        return 0;
      }
    },

    animations: {
      y: {
        duration: 1300,
        easing: "easeOutCubic"
      },

      x: {
        duration: 1000,
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
          duration: 250,
          easing: "easeOutCubic"
        }
      }
    }
  }
});
}

(async function(){
  const first = await loadOptions();
  document.getElementById("areaSelect").addEventListener("change", e => loadAreaDemand(e.target.value));
  if (first) loadAreaDemand(first);
})();
