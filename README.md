# Docker GPU Dashboard Extension

Real-time NVIDIA GPU metrics directly in Docker Desktop. Monitor GPU utilization, memory usage, temperature, and power draw without leaving your IDE.

![GPU Dashboard Screenshot](screenshots/dashboard.png)

## Features

- **Real-time monitoring** — 2-second polling for all NVIDIA GPUs on the host
- **Per-GPU metrics** — utilization, memory, temperature, power, fan speed
- **Historical charts** — 2-minute rolling graphs for all metrics
- **Color-coded alerts** — green/yellow/red thresholds for quick visual scanning
- **Mock mode** — develop and demo without GPU hardware
- **Zero configuration** — detects GPUs automatically via NVML

## Installation

```bash
docker extension install pmady/docker-gpu-dashboard-extension:latest
```

Or build from source:

```bash
make install
```

## Requirements

- Docker Desktop 4.30+
- NVIDIA GPU with drivers installed (or use mock mode for development)
- NVIDIA Container Toolkit (for real GPU metrics)

## Development

### Quick start with mock data (no GPU needed)

```bash
# Install frontend dependencies
make ui-deps

# Run backend in mock mode
make backend-mock

# In another terminal, start frontend dev server
cd ui && npm run dev

# Enable hot reload in Docker Desktop
make dev
```

### Build the extension

```bash
make build
```

### Validate

```bash
make validate
```

## Architecture

```
Docker Desktop ←→ Extension UI (React + Recharts)
                      ↕
                Extension Backend (Go)
                      ↕
                NVML Library → GPU 0, GPU 1, ...
```

- **Frontend:** React 18 + Recharts for live charts, Vite for bundling
- **Backend:** Go HTTP server on Unix socket, polls NVML every 2 seconds
- **Communication:** Docker Extension API (`ddClient.extension.vm.service`)

## Metrics Collected

| Metric | Source | Unit |
|--------|--------|------|
| GPU Utilization | `nvml.DeviceGetUtilizationRates()` | % |
| Memory Used/Total | `nvml.DeviceGetMemoryInfo()` | bytes |
| Memory Controller Utilization | `nvml.DeviceGetUtilizationRates()` | % |
| Temperature | `nvml.DeviceGetTemperature()` | Celsius |
| Power Draw | `nvml.DeviceGetPowerUsage()` | Watts |
| Power Limit | `nvml.DeviceGetEnforcedPowerLimit()` | Watts |
| Fan Speed | `nvml.DeviceGetFanSpeed()` | % |
| Driver Version | `nvml.SystemGetDriverVersion()` | string |

## Related Projects

- [keda-gpu-scaler](https://github.com/pmady/keda-gpu-scaler) — KEDA external scaler for GPU autoscaling
- [otel-gpu-receiver](https://github.com/pmady/otel-gpu-receiver) — OpenTelemetry collector receiver for GPU metrics

## Contributing

Contributions welcome! Please open an issue or PR.

## License

Apache 2.0

---

*Built by [Pavan Madduri](https://github.com/pmady) — Senior Cloud Platform Engineer, CNCF Golden Kubestronaut*
