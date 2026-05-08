import React from 'react'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(1)} GB`
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(0)} MB`
}

function getColor(value, warn, crit) {
  if (value >= crit) return '#ef5350'
  if (value >= warn) return '#ffb74d'
  return '#4fc3f7'
}

function MetricBar({ label, value, max, unit, warnAt, critAt }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const color = getColor(pct, warnAt || 70, critAt || 90)

  return (
    <div style={styles.metricRow}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.barContainer}>
        <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
      </div>
      <div style={styles.metricValue}>
        {typeof value === 'number' && max > 1000
          ? `${formatBytes(value)} / ${formatBytes(max)}`
          : `${value}${unit}`
        }
      </div>
    </div>
  )
}

export default function GpuCard({ gpu }) {
  const memPct = gpu.memoryTotal > 0
    ? Math.round((gpu.memoryUsed / gpu.memoryTotal) * 100)
    : 0

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.gpuIndex}>GPU {gpu.index}</span>
        <span style={styles.gpuName}>{gpu.name}</span>
      </div>

      <div style={styles.metricsGrid}>
        <MetricBar
          label="GPU Utilization"
          value={gpu.gpuUtilization}
          max={100}
          unit="%"
          warnAt={70}
          critAt={90}
        />
        <MetricBar
          label="Memory"
          value={gpu.memoryUsed}
          max={gpu.memoryTotal}
          unit=""
          warnAt={75}
          critAt={90}
        />
        <MetricBar
          label="Temperature"
          value={gpu.temperature}
          max={100}
          unit=" C"
          warnAt={75}
          critAt={85}
        />
        <MetricBar
          label="Power"
          value={gpu.powerDraw}
          max={gpu.powerLimit}
          unit={` / ${gpu.powerLimit} W`}
          warnAt={80}
          critAt={95}
        />
        <MetricBar
          label="Memory Controller"
          value={gpu.memoryUtilization}
          max={100}
          unit="%"
          warnAt={70}
          critAt={90}
        />
      </div>

      <div style={styles.cardFooter}>
        <span>Mem: {memPct}%</span>
        {gpu.fanSpeed > 0 && <span>Fan: {gpu.fanSpeed}%</span>}
        <span style={styles.uuid}>{gpu.uuid?.substring(0, 20)}...</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#16213e',
    borderRadius: 12,
    padding: 20,
    border: '1px solid #2a2a3e',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  gpuIndex: {
    background: '#4fc3f7',
    color: '#1a1a2e',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
  },
  gpuName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#ffffff',
  },
  metricsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  metricLabel: {
    width: 140,
    fontSize: 13,
    color: '#9e9e9e',
    flexShrink: 0,
  },
  barContainer: {
    flex: 1,
    height: 8,
    background: '#2a2a3e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.5s ease, background 0.5s ease',
  },
  metricValue: {
    width: 120,
    textAlign: 'right',
    fontSize: 13,
    color: '#e0e0e0',
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #2a2a3e',
    display: 'flex',
    gap: 16,
    fontSize: 12,
    color: '#757575',
  },
  uuid: {
    marginLeft: 'auto',
    fontFamily: 'monospace',
  },
}
