
from flask import Flask, jsonify, send_from_directory, Response
from prometheus_client import Gauge, generate_latest, REGISTRY, CONTENT_TYPE_LATEST
from devices import generate_devices

app = Flask(__name__, static_folder="static")

# Prometheus metrics
cpu_gauge = Gauge(
    "edge_device_cpu_usage_percent",
    "CPU usage of edge device",
    ["device_id", "type"],
)
ram_gauge = Gauge(
    "edge_device_ram_usage_percent",
    "RAM usage of edge device",
    ["device_id", "type"],
)
temp_gauge = Gauge(
    "edge_device_temperature_celsius",
    "Temperature of edge device",
    ["device_id", "type"],
)
sent_gauge = Gauge(
    "edge_device_network_sent_bytes",
    "Network bytes sent",
    ["device_id", "type"],
)
recv_gauge = Gauge(
    "edge_device_network_received_bytes",
    "Network bytes received",
    ["device_id", "type"],
)
anomaly_gauge = Gauge(
    "edge_device_anomaly_flag",
    "1 if anomaly, 0 otherwise",
    ["device_id", "type"],
)


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/api/devices")
def api_devices():
    devices, ts = generate_devices()
    return jsonify({"devices": devices, "timestamp": ts})


@app.route("/metrics")
def metrics():
    # regenerate a fresh snapshot for Prometheus
    devices, _ = generate_devices()

    # update gauges
    for d in devices:
        labels = {"device_id": d["id"], "type": d["type"]}
        cpu_gauge.labels(**labels).set(d["cpu"])
        ram_gauge.labels(**labels).set(d["ram"])
        temp_gauge.labels(**labels).set(d["temp"])
        sent_gauge.labels(**labels).set(d["network_sent"])
        recv_gauge.labels(**labels).set(d["network_received"])
        anomaly_gauge.labels(**labels).set(1 if d["anomaly"] == "Anomaly" else 0)

    data = generate_latest(REGISTRY)
    return Response(data, mimetype=CONTENT_TYPE_LATEST)


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))   # Render gives PORT dynamically
    app.run(host="0.0.0.0", port=port)
