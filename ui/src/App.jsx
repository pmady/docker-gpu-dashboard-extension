import React, { useState, useEffect, useCallback } from 'react'
import GpuCard from './components/GpuCard'
import GpuChart from './components/GpuChart'

const POLL_INTERVAL = 2000
const HISTORY_LENGTH = 60 // 2 minutes of data at 2s intervals

export default function App() {
  const [snapshot, setSnapshot] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  const fetchMetrics = useCallback(async () => {
    try {
      // In Docker Extension context, use the extension API
      // Fallback to direct HTTP for development
      let url = '/gpu/metrics'
      if (window.ddClient) {
        const result = await window.ddClient.extension.vm.service.get('/gpu/metrics')
        setSnapshot(result)
        setConnected(true)
        setError(null)
        addToHistory(result)
        return
      }

      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      setSnapshot(data)
      setConnected(true)
      setError(null)
      addToHistory(data)
    } catch (err) {
      setError(err.message)
      setConnected(false)
    }
  }, [])

  const addToHistory = (snap) => {
    if (!snap || !snap.gpus) return
    setHistory(prev => {
      const entry = {
        time: new Date(snap.timestamp).toLocaleTimeString(),
        ...snap.gpus.reduce((acc, gpu) => {
          acc[`gpu${gpu.index}_util`] = gpu.gpuUtilization
          acc[`gpu${gpu.index}_mem`] = Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100)
          acc[`gpu${gpu.index}_temp`] = gpu.temperature
          acc[`gpu${gpu.index}_power`] = gpu.powerDraw
          return acc
        }, {})
      }
      const updated = [...prev, entry]
      return updated.slice(-HISTORY_LENGTH)
    })
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>GPU Dashboard</h1>
          <span style={{
            ...styles.statusBadge,
            background: connected ? '#00c853' : '#ff1744',
          }}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {snapshot && snapshot.gpus && (
          <p style={styles.subtitle}>
            {snapshot.gpus.length} GPU{snapshot.gpus.length !== 1 ? 's' : ''} detected
            {snapshot.gpus[0]?.driverVersion && ` | Driver ${snapshot.gpus[0].driverVersion}`}
            {snapshot.gpus[0]?.cudaVersion && ` | CUDA ${snapshot.gpus[0].cudaVersion}`}
          </p>
        )}
      </header>

      {error && (
        <div style={styles.errorBanner}>
          Connection error: {error}. Backend may not be running.
        </div>
      )}

      {snapshot?.error && (
        <div style={styles.warnBanner}>
          NVML: {snapshot.error}
        </div>
      )}

      {/* GPU Cards */}
      <div style={styles.cardGrid}>
        {snapshot?.gpus?.map(gpu => (
          <GpuCard key={gpu.index} gpu={gpu} />
        ))}
      </div>

      {/* Charts */}
      {history.length > 1 && snapshot?.gpus && (
        <div style={styles.chartSection}>
          <h2 style={styles.sectionTitle}>Utilization History</h2>
          <GpuChart
            data={history}
            gpuCount={snapshot.gpus.length}
            metricKey="util"
            label="GPU Utilization %"
            color="#4fc3f7"
          />

          <h2 style={styles.sectionTitle}>Memory Usage History</h2>
          <GpuChart
            data={history}
            gpuCount={snapshot.gpus.length}
            metricKey="mem"
            label="Memory Used %"
            color="#81c784"
          />

          <h2 style={styles.sectionTitle}>Temperature History</h2>
          <GpuChart
            data={history}
            gpuCount={snapshot.gpus.length}
            metricKey="temp"
            label="Temperature C"
            color="#ffb74d"
          />

          <h2 style={styles.sectionTitle}>Power Draw History</h2>
          <GpuChart
            data={history}
            gpuCount={snapshot.gpus.length}
            metricKey="power"
            label="Power W"
            color="#ef5350"
          />
        </div>
      )}

      <footer style={styles.footer}>
        <a href="https://github.com/pmady/docker-gpu-dashboard-extension"
           style={styles.link} target="_blank" rel="noopener">
          GitHub
        </a>
        <span style={styles.footerSep}>|</span>
        <span>Built by Pavan Madduri</span>
        <span style={styles.footerSep}>|</span>
        <span>Polls every 2s</span>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px',
    minHeight: '100vh',
    background: '#1a1a2e',
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
  },
  errorBanner: {
    background: '#b71c1c',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  warnBanner: {
    background: '#e65100',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#e0e0e0',
    marginBottom: 12,
    marginTop: 24,
  },
  footer: {
    textAlign: 'center',
    padding: '24px 0',
    fontSize: 13,
    color: '#757575',
    borderTop: '1px solid #2a2a3e',
  },
  link: {
    color: '#4fc3f7',
    textDecoration: 'none',
  },
  footerSep: {
    margin: '0 8px',
  },
}
