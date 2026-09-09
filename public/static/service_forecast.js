
let serviceChart = null;
let weeklyChart = null;

async function loadOptions() {
  const r = await fetch("/api/options");
  const d = await r.json();
  const s = document.getElementById("serviceSelect");
  s.innerHTML = d.services.map(x => `<option value="${x}">${x}</option>`).join("");
  return d.services[0];
}

async function loadNextWeekServiceForecast() {
  const response = await fetch("/api/next_week_service_forecast");
  const data = await response.json();

  if (serviceChart) serviceChart.destroy();

  const serviceCanvas =
    document.getElementById("nextWeekServiceChart");

  const serviceLabels =
    data.map(x => x.service);

  const serviceValues =
    data.map(x => Number(x.request_count));


  /* ==========================================
    SMART Y AXIS

    2  → 4
    5  → 7
    10 → 12
  ========================================== */

  const highestValue =
    Math.max(...serviceValues, 0);

  const serviceYAxisMax =
    Math.max(
      4,
      Math.ceil(highestValue) + 2
    );


  /* ==========================================
    8 DIFFERENT SERVICE COLORS
  ========================================== */

  const serviceColors = [
    "#2f6fed",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#6366f1"
  ];

  const serviceBorderColors = [
    "#2f6fed",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#6366f1"
  ];


  /* ==========================================
    LINE DATA
    Same service forecast values
  ========================================== */

  const lineValues =
    serviceValues;


  /* ==========================================
    CREATE MIXED CHART
  ========================================== */

  serviceChart = new Chart(serviceCanvas, {

    type: "bar",

    data: {

      labels:
        serviceLabels,

      datasets: [

        /* =====================================
          BAR CHART
          ===================================== */

        {

          type: "bar",

          label:
            "Predicted 7-day requests",

          data:
            serviceValues,

          backgroundColor:
            serviceValues.map(
              (_, index) =>
                serviceColors[
                  index % serviceColors.length
                ]
            ),

          borderColor:
            serviceValues.map(
              (_, index) =>
                serviceBorderColors[
                  index % serviceBorderColors.length
                ]
            ),

          borderWidth:
            1,

          borderRadius:
            7,

          borderSkipped:
            false,

          maxBarThickness:
            52,

          order:
            2
        },


        /* =====================================
          SMOOTH LINE
          ===================================== */

        {

          type: "line",

          label:
            "Demand trend",

          data:
            lineValues,

          borderColor:
            "#ffffff",

          backgroundColor:
            "transparent",

          borderWidth:
            3,

          /*
          * Screenshot-like smooth tension
          */

          tension:
            0.42,

          cubicInterpolationMode:
            "monotone",

          fill:
            false,

          pointRadius:
            5,

          pointHoverRadius:
            10,

          pointHitRadius:
            15,

          pointBackgroundColor:
            "#ffffff",

          pointBorderColor:
            "#2f6fed",

          pointBorderWidth:
            3,

          pointHoverBackgroundColor:
            "#2f6fed",

          pointHoverBorderColor:
            "#ffffff",

          pointHoverBorderWidth:
            3,

          borderCapStyle:
            "round",

          borderJoinStyle:
            "round",

          order:
            1
        }
      ]
    },


    /* ==========================================
      OPTIONS
    ========================================== */

    options: {

      responsive:
        true,

      maintainAspectRatio:
        false,

      interaction: {

        mode:
          "index",

        intersect:
          false
      },


      /* ========================================
        ANIMATION
        ======================================== */

      animation: {

        duration:
          1200,

        easing:
          "easeOutCubic",

        delay: function(context) {

          if (
            context.type === "data"
          ) {

            /*
            * Bars appear one-by-one
            */

            if (
              context.datasetIndex === 0
            ) {

              return (
                context.dataIndex * 180
              );
            }


            /*
            * Line follows the bars
            */

            if (
              context.datasetIndex === 1
            ) {

              return (
                500 +
                context.dataIndex * 220
              );
            }
          }

          return 0;
        }
      },


      /* ========================================
        DATASET ANIMATIONS
      ======================================== */

      animations: {

        y: {

          duration:
            1000,

          easing:
            "easeOutCubic"
        },

        opacity: {

          duration:
            700,

          easing:
            "easeOutQuart"
        }
      },


      /* ========================================
        HOVER ANIMATION
      ======================================== */

      transitions: {

        active: {

          animation: {

            duration:
              250,

            easing:
              "easeOutCubic"
          }
        }
      },


      /* ========================================
        PLUGINS
      ======================================== */

      plugins: {

        legend: {

          display:
            true,

          position:
            "bottom",

          labels: {

            color:
              "#8f9bb0",

            usePointStyle:
              true,

            pointStyle:
              "circle",

            padding:
              20,

            boxWidth:
              8,

            boxHeight:
              8,

            font: {

              family:
                "DM Sans",

              size:
                11,

              weight:
                "500"
            }
          }
        },


        tooltip: {

          enabled:
            true,

          backgroundColor:
            "#0d1523",

          titleColor:
            "#ffffff",

          bodyColor:
            "#a5afc0",

          borderColor:
            "rgba(47,111,237,.4)",

          borderWidth:
            1,

          cornerRadius:
            9,

          padding:
            13,

          displayColors:
            true,

          callbacks: {

            label: function(context) {

              if (
                context.datasetIndex === 0
              ) {

                return (
                  ` Predicted Requests: ${context.parsed.y}`
                );

              }

              return (
                ` Demand Trend: ${context.parsed.y}`
              );
            }
          }
        }
      },


      /* ========================================
        SCALES
      ======================================== */

      scales: {

        x: {

          grid: {

            display:
              false
          },

          border: {

            display:
              false
          },

          ticks: {

            color:
              "#697589",

            padding:
              8,

            font: {

              family:
                "DM Sans",

              size:
                10
            }
          },

          title: {

            display:
              true,

            text:
              "Service",

            color:
              "#697589",

            font: {

              family:
                "DM Sans",

              size:
                11,

              weight:
                "500"
            }
          }
        },


        y: {

          beginAtZero:
            true,

          /*
          * IMPORTANT
          *
          * 2 → 4
          * 5 → 7
          * 10 → 12
          */

          max:
            serviceYAxisMax,

          ticks: {

            color:
              "#697589",

            precision:
              0,

            padding:
              8,

            stepSize:
              serviceYAxisMax <= 10
                ? 1
                : undefined,

            font: {

              family:
                "DM Sans",

              size:
                10
            }
          },

          grid: {

            color:
              "rgba(255,255,255,.045)"
          },

          border: {

            display:
              false
          },

          title: {

            display:
              true,

            text:
              "Predicted Requests",

            color:
              "#697589",

            font: {

              family:
                "DM Sans",

              size:
                11,

              weight:
                "500"
            }
          }
        }
      }
    }
  });
}

async function loadWeeklyServiceDemand(service) {
  const response = await fetch(`/api/get_weekly_service_demand?service=${encodeURIComponent(service)}`);
  const data = await response.json();
  if (weeklyChart) weeklyChart.destroy();

  const weeklyCanvas = document.getElementById("weeklyServiceChart");

  const weeklyLabels = data.map(x => x.week);
  const weeklyValues = data.map(x => Number(x.request_count));

  const weeklyMaxValue = Math.max(...weeklyValues, 0);
  const weeklyYAxisMax = Math.max(
    4,
    Math.ceil(weeklyMaxValue) + 2
  );

  // Moving-average trend
  const weeklyTrend = weeklyValues.map((value, index) => {
    const start = Math.max(0, index - 1);
    const end = Math.min(weeklyValues.length - 1, index + 1);

    const nearbyValues = weeklyValues.slice(start, end + 1);

    const average =
      nearbyValues.reduce((sum, item) => sum + item, 0) /
      nearbyValues.length;

    return Number(average.toFixed(2));
  });

  const ctx = weeklyCanvas.getContext("2d");

  const weeklyGradient = ctx.createLinearGradient(0, 0, 0, 400);

  weeklyGradient.addColorStop(
    0,
    "rgba(107,138,253,0.75)"
  );

  weeklyGradient.addColorStop(
    1,
    "rgba(107,138,253,0.18)"
  );


  /* =====================================================
    PROGRESSIVE LINE WITH EASING
    Based on Chart.js Progressive Line With Easing
    ===================================================== */

  const totalDuration = 5000;

  // Same easing idea as Chart.js sample:
  // easeOutQuad
  const easing = (t) => {
    return t * (2 - t);
  };

  const pointCount = weeklyTrend.length;

  const duration = (index) => {
    if (pointCount === 0) return 0;

    return (
      easing(index / pointCount) *
      totalDuration /
      pointCount
    );
  };

  const delay = (index) => {
    if (pointCount === 0) return 0;

    return (
      easing(index / pointCount) *
      totalDuration
    );
  };


  /*
    Previous point Y position.

    First point starts from the bottom of the chart.
    Every next point starts from the previous point.
  */
  const previousY = (context) => {

    if (context.dataIndex === 0) {

      return context.chart.scales.y.getPixelForValue(0);

    }

    const meta =
      context.chart.getDatasetMeta(context.datasetIndex);

    const previousPoint =
      meta.data[context.dataIndex - 1];

    if (!previousPoint) {
      return context.chart.scales.y.getPixelForValue(0);
    }

    return previousPoint.getProps(["y"], true).y;
  };


  /* Progressive animation configuration */

  const progressiveAnimation = {

    x: {

      type: "number",

      easing: "linear",

      duration: (context) => {
        return duration(context.dataIndex);
      },

      from: NaN,

      delay: (context) => {

        if (
          context.type !== "data" ||
          context.xStarted
        ) {
          return 0;
        }

        context.xStarted = true;

        return delay(context.dataIndex);
      }
    },

    y: {

      type: "number",

      easing: "linear",

      duration: (context) => {
        return duration(context.dataIndex);
      },

      from: previousY,

      delay: (context) => {

        if (
          context.type !== "data" ||
          context.yStarted
        ) {
          return 0;
        }

        context.yStarted = true;

        return delay(context.dataIndex);
      }
    }
  };


  /* =====================================================
    CHART
    ===================================================== */

  weeklyChart = new Chart(weeklyCanvas, {

    type: "bar",

    data: {

      labels: weeklyLabels,

      datasets: [

        /* -------------------------------
          BAR DATA
          ------------------------------- */

        {
          type: "bar",

          label: `${service} weekly requests`,

          data: weeklyValues,

          backgroundColor: weeklyGradient,

          borderColor: "#6b8afd",

          borderWidth: 1,

          borderRadius: 7,

          borderSkipped: false,

          // Bars appear progressively
          animation: {

            duration: 700,

            easing: "easeOutCubic",

            delay: (context) => {

              if (context.type !== "data") {
                return 0;
              }

              return context.dataIndex * 120;
            }
          }
        },


        /* -------------------------------
          PROGRESSIVE TREND LINE
          ------------------------------- */

        {
          type: "line",

          label: "Demand Trend",

          data: weeklyTrend,

          borderColor: "#a855f7",

          borderWidth: 3,

          borderDash: [7, 6],

          tension: 0.35,

          fill: false,

          pointRadius: 5,

          pointHoverRadius: 9,

          pointBackgroundColor: "#ffffff",

          pointBorderColor: "#a855f7",

          pointBorderWidth: 2,

          pointHoverBackgroundColor: "#a855f7",

          pointHoverBorderColor: "#ffffff",

          pointHoverBorderWidth: 3,

          // IMPORTANT:
          // Progressive Line With Easing animation
          animations: progressiveAnimation
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

          backgroundColor:
            "rgba(10,15,28,0.95)",

          padding: 12,

          callbacks: {

            label: function(context) {

              if (context.datasetIndex === 0) {

                return ` Weekly Requests: ${context.parsed.y}`;

              }

              return ` Trend: ${context.parsed.y}`;
            }
          }
        }
      },


      scales: {

        y: {

          beginAtZero: true,

          // 2 → 4
          max: weeklyYAxisMax,

          ticks: {

            precision: 0,

            stepSize: 1
          },

          grid: {

            color:
              "rgba(255,255,255,0.07)"
          },

          title: {

            display: true,

            text: "Requests"
          }
        },


        x: {

          grid: {

            color:
              "rgba(255,255,255,0.04)"
          },

          title: {

            display: true,

            text: "Week"
          }
        }
      },


      interaction: {

        intersect: false
      }
    }
  });
}

(async function(){
  const first = await loadOptions();
  document.getElementById("serviceSelect").addEventListener("change", e => loadWeeklyServiceDemand(e.target.value));
  await loadNextWeekServiceForecast();
  if (first) await loadWeeklyServiceDemand(first);
})();
