package main

import (
	"fmt"
	"math/rand"
	"time"
)

// collectNVML reads GPU metrics via NVML.
// On systems without GPUs this returns an error; the frontend falls back to mock data.
//
// NOTE: This is the stub implementation. To build with real NVML:
//   1. Install nvidia-container-toolkit
//   2. Replace this file with nvml_real.go using go-nvml bindings
//   3. Build with CGO_ENABLED=1
func collectNVML() ([]GPUMetrics, error) {
	return nil, fmt.Errorf("NVML not available — set MOCK_GPU=true for demo mode")
}

// mockGPUData generates realistic-looking GPU metrics for demo and development.
func mockGPUData() []GPUMetrics {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	gpus := []GPUMetrics{
		{
			Index:             0,
			Name:              "NVIDIA A100-SXM4-80GB",
			UUID:              "GPU-12345678-abcd-1234-abcd-123456789abc",
			Temperature:       55 + r.Uint32()%20,
			PowerDraw:         200 + r.Uint32()%150,
			PowerLimit:        400,
			GPUUtilization:    30 + r.Uint32()%65,
			MemoryUtilization: 25 + r.Uint32()%60,
			MemoryUsed:        uint64(20+r.Intn(55)) * 1024 * 1024 * 1024,
			MemoryTotal:       80 * 1024 * 1024 * 1024,
			FanSpeed:          0, // A100 doesn't have fans
			DriverVersion:     "550.54.15",
			CUDAVersion:       "12.4",
		},
		{
			Index:             1,
			Name:              "NVIDIA A100-SXM4-80GB",
			UUID:              "GPU-87654321-dcba-4321-dcba-cba987654321",
			Temperature:       52 + r.Uint32()%18,
			PowerDraw:         180 + r.Uint32()%160,
			PowerLimit:        400,
			GPUUtilization:    20 + r.Uint32()%70,
			MemoryUtilization: 15 + r.Uint32()%65,
			MemoryUsed:        uint64(10+r.Intn(60)) * 1024 * 1024 * 1024,
			MemoryTotal:       80 * 1024 * 1024 * 1024,
			FanSpeed:          0,
			DriverVersion:     "550.54.15",
			CUDAVersion:       "12.4",
		},
	}
	return gpus
}
