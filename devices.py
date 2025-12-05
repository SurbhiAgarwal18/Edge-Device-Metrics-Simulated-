
import random
import time

DEVICE_TYPES = ["gateway", "sensor", "camera", "controller"]


def generate_devices(num_devices: int = 5):
    """Return list of simulated edge devices + timestamp."""
    devices = []

    base_recv = 29_800_000.0
    base_sent = 3_440_000.0

    for i in range(1, num_devices + 1):
        dev_type = DEVICE_TYPES[i % len(DEVICE_TYPES)]

        cpu = round(random.uniform(5, 95), 2)
        ram = round(random.uniform(5, 95), 2)
        temp = round(random.uniform(30, 85), 2)
        net_sent = round(base_sent + random.uniform(-300_000, 300_000), 2)
        net_recv = round(base_recv + random.uniform(-300_000, 300_000), 2)

        high_load = cpu > 80 or ram > 85 or temp > 75

        devices.append(
            {
                "id": f"edge-device-{i}",
                "type": dev_type,
                "cpu": cpu,
                "ram": ram,
                "temp": temp,
                "network_sent": net_sent,
                "network_received": net_recv,
                "status": "High Load" if high_load else "Online",
                "anomaly": "Anomaly" if high_load else "Normal",
            }
        )

    return devices, int(time.time())
