
const safe = (obj, key, fallback = "--") =>
  obj && obj[key] !== undefined ? obj[key] : fallback;

let latestDevices = [];

// ---- Charts ----
function createLineChart(ctx, label, color, fill) {
  return new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [{ label, data: [], borderColor: color, backgroundColor: fill, borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0 }] },
    options: {
      animation: false,
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#9ca3af", autoSkip: true, maxRotation: 0 } },
        y: { ticks: { color: "#9ca3af" }, beginAtZero: true }
      }
    }
  });
}

const cpuChart = createLineChart(
  document.getElementById("cpuChart"),
  "CPU %",
  "rgba(56,189,248,1)",
  "rgba(56,189,248,0.12)"
);
const ramChart = createLineChart(
  document.getElementById("ramChart"),
  "RAM %",
  "rgba(129,140,248,1)",
  "rgba(129,140,248,0.12)"
);
const tempChart = createLineChart(
  document.getElementById("tempChart"),
  "Temp °C",
  "rgba(248,113,113,1)",
  "rgba(248,113,113,0.12)"
);

const netChart = new Chart(document.getElementById("netChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Net Sent",
        data: [],
        borderColor: "rgba(56,189,248,1)",
        backgroundColor: "rgba(56,189,248,0.10)",
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 0
      },
      {
        label: "Net Recv",
        data: [],
        borderColor: "rgba(96,165,250,1)",
        backgroundColor: "rgba(96,165,250,0.10)",
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 0
      }
    ]
  },
  options: {
    animation: false,
    responsive: true,
    plugins: { legend: { labels: { color: "#9ca3af", usePointStyle: true } } },
    scales: {
      x: { ticks: { color: "#9ca3af", autoSkip: true, maxRotation: 0 } },
      y: { ticks: { color: "#9ca3af" }, beginAtZero: true }
    }
  }
});

// ---- Data fetch + render ----
async function fetchDevices() {
  const res = await fetch("/api/devices");
  const data = await res.json();
  latestDevices = data.devices || [];

  const ts = data.timestamp;
  document.getElementById("lastUpdated").textContent =
    new Date(ts * 1000).toLocaleTimeString();

  return latestDevices;
}

function renderTable(devices) {
  const body = document.getElementById("devicesBody");
  body.innerHTML = "";

  const statusFilter = document.getElementById("statusFilter").value;

  devices
    .filter(d => statusFilter === "All" || d.status === statusFilter)
    .forEach(d => {
      const tr = document.createElement("tr");
      const status = d.status || "Online";
      const anomaly = d.anomaly || "Normal";

      tr.innerHTML = `
        <td>${safe(d,"id")}</td>
        <td>${safe(d,"type")}</td>
        <td>${safe(d,"cpu")}</td>
        <td>${safe(d,"ram")}</td>
        <td>${safe(d,"temp")}</td>
        <td>${safe(d,"network_sent")}</td>
        <td>${safe(d,"network_received")}</td>
        <td>
          <span class="status-pill ${status === "High Load" ? "status-high" : "status-online"}">
            <span class="dot"></span>${status}
          </span>
        </td>
        <td>
          <span class="status-pill ${anomaly === "Anomaly" ? "anomaly-alert" : "anomaly-normal"}">
            ${anomaly}
          </span>
        </td>
      `;
      body.appendChild(tr);
    });
}

function pushChartsFromFirst(devices) {
  if (!devices.length) return;
  const d = devices[0];
  const t = new Date().toLocaleTimeString();
  const maxPoints = 25;

  const push = (chart, value) => {
    chart.data.labels.push(t);
    chart.data.datasets[0].data.push(value);
    if (chart.data.labels.length > maxPoints) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update();
  };

  push(cpuChart, Number(d.cpu) || 0);
  push(ramChart, Number(d.ram) || 0);
  push(tempChart, Number(d.temp) || 0);

  netChart.data.labels.push(t);
  netChart.data.datasets[0].data.push(Number(d.network_sent) || 0);
  netChart.data.datasets[1].data.push(Number(d.network_received) || 0);
  if (netChart.data.labels.length > maxPoints) {
    netChart.data.labels.shift();
    netChart.data.datasets[0].data.shift();
    netChart.data.datasets[1].data.shift();
  }
  netChart.update();
}

// CSV export
function exportCsv() {
  if (!latestDevices.length) return;
  const header = [
    "id","type","cpu","ram","temp",
    "network_sent","network_received","status","anomaly"
  ];
  const rows = [header.join(",")];

  latestDevices.forEach(d => {
    rows.push(header.map(h => String(d[h] ?? "").replace(/,/g,"")).join(","));
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "edge_metrics.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// master refresh
async function refreshAll() {
  const devices = await fetchDevices();
  renderTable(devices);
  pushChartsFromFirst(devices);
}

// events
document.getElementById("refreshBtn").addEventListener("click", refreshAll);
document.getElementById("exportBtn").addEventListener("click", exportCsv);
document.getElementById("statusFilter").addEventListener("change", () =>
  renderTable(latestDevices)
);

// auto refresh every 4s
refreshAll();
setInterval(refreshAll, 4000);
