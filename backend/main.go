package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"sync"
	"time"
)

// GPUMetrics holds per-device metrics from NVML.
type GPUMetrics struct {
	Index             int     `json:"index"`
	Name              string  `json:"name"`
	UUID              string  `json:"uuid"`
	Temperature       uint32  `json:"temperature"`
	PowerDraw         uint32  `json:"powerDraw"`
	PowerLimit        uint32  `json:"powerLimit"`
	GPUUtilization    uint32  `json:"gpuUtilization"`
	MemoryUtilization uint32  `json:"memoryUtilization"`
	MemoryUsed        uint64  `json:"memoryUsed"`
	MemoryTotal       uint64  `json:"memoryTotal"`
	FanSpeed          uint32  `json:"fanSpeed"`
	DriverVersion     string  `json:"driverVersion"`
	CUDAVersion       string  `json:"cudaVersion"`
}

// Snapshot holds all GPU data at a point in time.
type Snapshot struct {
	Timestamp string       `json:"timestamp"`
	GPUs      []GPUMetrics `json:"gpus"`
	Error     string       `json:"error,omitempty"`
}

var (
	latestSnapshot Snapshot
	snapshotMu     sync.RWMutex
	useMock        bool
)

func main() {
	socketPath := "/run/guest-services/backend.sock"
	if p := os.Getenv("SOCKET_PATH"); p != "" {
		socketPath = p
	}

	if os.Getenv("MOCK_GPU") == "true" || os.Getenv("MOCK_GPU") == "1" {
		useMock = true
		log.Println("Running in mock mode — generating fake GPU data")
	}

	// remove stale socket
	os.Remove(socketPath)

	go pollGPUs()

	mux := http.NewServeMux()
	mux.HandleFunc("/gpu/metrics", handleMetrics)
	mux.HandleFunc("/gpu/health", handleHealth)

	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		log.Fatalf("failed to listen on %s: %v", socketPath, err)
	}
	defer listener.Close()

	log.Printf("GPU Dashboard backend listening on %s", socketPath)
	if err := http.Serve(listener, mux); err != nil {
		log.Fatalf("http server error: %v", err)
	}
}

func handleMetrics(w http.ResponseWriter, r *http.Request) {
	snapshotMu.RLock()
	defer snapshotMu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(latestSnapshot)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"status":"ok","mock":%v}`, useMock)
}

func pollGPUs() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	// initial poll
	collect()

	for range ticker.C {
		collect()
	}
}

func collect() {
	var snap Snapshot
	snap.Timestamp = time.Now().UTC().Format(time.RFC3339)

	if useMock {
		snap.GPUs = mockGPUData()
	} else {
		gpus, err := collectNVML()
		if err != nil {
			snap.Error = err.Error()
			log.Printf("NVML collection error: %v", err)
		} else {
			snap.GPUs = gpus
		}
	}

	snapshotMu.Lock()
	latestSnapshot = snap
	snapshotMu.Unlock()
}
