# Edge Device Metrics Dashboard

A comprehensive monitoring solution for edge devices using Flask, Prometheus, and Grafana. This project simulates metrics from Kubernetes edge devices and provides real-time visualization through a custom dashboard and embedded Grafana panels.

## Features

- **Real-time Monitoring**: Track CPU, RAM, temperature, and network metrics
- **Custom Dashboard**: Interactive web interface with live charts
- **Prometheus Integration**: Time-series data collection and storage
- **Grafana Visualization**: Professional monitoring dashboards
- **Alert System**: Configurable alerts for high resource usage
- **Data Export**: CSV export functionality
- **Docker Support**: Easy deployment with Docker Compose
- **Kubernetes Ready**: K8s deployment manifests included

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Flask Exporter  │───▶│   Prometheus     │          │
│  │  Port: 5000      │    │   Port: 9090     │          │
│  │  - Dashboard     │    │   - Scrapes /    │          │
│  │  - API           │    │     metrics      │          │
│  │  - Metrics       │    │   - Stores data  │          │
│  └──────────────────┘    └──────────────────┘          │
│           │                       │                      │
│           │              ┌────────▼──────────┐          │
│           │              │     Grafana       │          │
│           │              │     Port: 3000    │          │
│           │              │   - Visualizes    │          │
│           │              │   - Dashboards    │          │
│           │              └───────────────────┘          │
│           │                       │                      │
└───────────┼───────────────────────┼──────────────────────┘
            │                       │
            ▼                       ▼
      Browser Access          Browser Access
   localhost:5000           localhost:3000
```

## Tech Stack

- **Backend**: Python 3.11, Flask
- **Metrics**: Prometheus Client
- **Monitoring**: Prometheus, Grafana
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (optional)

## Project Structure

```
edge_metrics_ojt_final/
├── exporter.py              # Flask application (main server)
├── devices.py               # Device data generator
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Multi-container setup
├── prometheus.yml          # Prometheus configuration
├── alert_rules.yml         # Alert definitions
├── grafana-dashboard.json  # Pre-configured Grafana dashboard
├── static/
│   ├── index.html         # Dashboard UI
│   ├── dashboard.js       # Frontend logic
│   └── style.css          # Styling
└── k8s/                   # Kubernetes manifests
    ├── exporter-deployment.yaml
    ├── prometheus-deployment.yaml
    ├── grafana-deployment.yaml
    └── README.md
```

## Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Python 3.11+ (for local development)
- 8GB RAM recommended

## Quick Start

### 1. Clone the Repository

```bash
cd edge_metrics_ojt_final
```

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- Flask Exporter on port 5000
- Prometheus on port 9090
- Grafana on port 3000

### 3. Access the Dashboard

Open your browser and navigate to:

- **Main Dashboard**: http://localhost:5000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000

### 4. Configure Grafana (First Time Only)

1. Go to http://localhost:3000
2. Login with default credentials:
   - Username: `admin`
   - Password: `admin`
3. Add Prometheus data source:
   - Go to Configuration → Data Sources
   - Click "Add data source"
   - Select "Prometheus"
   - URL: `http://prometheus:9090`
   - Click "Save & Test"
4. Import dashboard:
   - Go to Dashboards → Import
   - Upload `grafana-dashboard.json`
   - Select Prometheus data source
   - Click "Import"

## API Endpoints

### Flask Exporter (Port 5000)

- `GET /` - Main dashboard UI
- `GET /api/devices` - JSON data of all devices
- `GET /metrics` - Prometheus metrics endpoint

### Example API Response

```json
{
  "devices": [
    {
      "id": "edge-device-1",
      "type": "sensor",
      "cpu": 45.23,
      "ram": 62.15,
      "temp": 55.8,
      "network_sent": 3440000.0,
      "network_received": 29800000.0,
      "status": "Online",
      "anomaly": "Normal"
    }
  ],
  "timestamp": 1733315400
}
```

## Metrics Exposed

The exporter exposes the following Prometheus metrics:

- `edge_device_cpu_usage_percent` - CPU usage percentage
- `edge_device_ram_usage_percent` - RAM usage percentage
- `edge_device_temperature_celsius` - Device temperature
- `edge_device_network_sent_bytes` - Network bytes sent
- `edge_device_network_received_bytes` - Network bytes received
- `edge_device_anomaly_flag` - Anomaly detection (1=Anomaly, 0=Normal)

All metrics include labels: `device_id` and `type`

## Alerts

Configured alerts in Prometheus:

- **HighEdgeCPU**: Triggers when CPU > 80% for 1 minute

View alerts at: http://localhost:9090/alerts

## Dashboard Features

### Main Dashboard (localhost:5000)

1. **Device Table**
   - Real-time device metrics
   - Status indicators (Online/High Load)
   - Anomaly detection
   - Filter by status

2. **Live Charts**
   - CPU Usage Over Time
   - RAM Usage Over Time
   - Temperature Over Time
   - Network Sent/Received

3. **Controls**
   - Refresh Data button
   - Export to CSV
   - Status filter
   - Auto-refresh every 4 seconds

4. **Embedded Grafana**
   - Professional monitoring dashboard
   - Historical data visualization

## Development

### Run Locally (Without Docker)

```bash
# Install dependencies
pip install -r requirements.txt

# Run the exporter
python exporter.py

# Access at http://localhost:5000
```

### Build Docker Image

```bash
docker build -t edge-metrics-exporter:latest .
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f exporter
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

## Kubernetes Deployment

For Kubernetes deployment instructions, see [k8s/README.md](k8s/README.md)

Quick deploy:

```bash
# Build and load image
docker build -t edge-metrics-exporter:latest .
minikube image load edge-metrics-exporter:latest

# Deploy
kubectl apply -f k8s/

# Access services
minikube service exporter --url
minikube service prometheus --url
minikube service grafana --url
```

## Troubleshooting

### Grafana Not Loading in Iframe

If Grafana shows login screen in iframe:
1. Check environment variables in `docker-compose.yml`
2. Ensure `GF_AUTH_ANONYMOUS_ENABLED=true` is set
3. Restart containers: `docker-compose restart grafana`

### No Data in Prometheus

1. Check if exporter is running: `docker-compose ps`
2. Verify metrics endpoint: http://localhost:5000/metrics
3. Check Prometheus targets: http://localhost:9090/targets
4. Ensure target status is "UP"

### Containers Not Starting

```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Configuration

### Change Scrape Interval

Edit `prometheus.yml`:

```yaml
global:
  scrape_interval: 10s  # Change from 5s to 10s
```

### Modify Alert Rules

Edit `alert_rules.yml`:

```yaml
- alert: HighEdgeCPU
  expr: edge_device_cpu_usage_percent > 90  # Change threshold
  for: 2m  # Change duration
```

### Adjust Auto-Refresh Rate

Edit `static/dashboard.js`:

```javascript
setInterval(refreshAll, 5000);  // Change from 4000ms to 5000ms
```

## Stop Services

```bash
# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything (including volumes)
docker-compose down -v
```

## License

This project is created for educational purposes (OJT Project).

## Author

Created as part of On-the-Job Training (OJT) project for edge device monitoring.

## Support

For issues or questions, please check the troubleshooting section or review the logs.
