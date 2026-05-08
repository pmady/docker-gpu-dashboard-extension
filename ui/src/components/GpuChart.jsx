import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const GPU_COLORS = ['#4fc3f7', '#81c784', '#ffb74d', '#ef5350', '#ce93d8', '#90a4ae', '#fff176', '#a1887f']

export default function GpuChart({ data, gpuCount, metricKey, label, color }) {
  if (!data || data.length < 2) return null

  return (
    <div style={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            dataKey="time"
            stroke="#757575"
            fontSize={11}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#757575"
            fontSize={11}
            tickLine={false}
            domain={metricKey === 'power' ? ['auto', 'auto'] : [0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: '#16213e',
              border: '1px solid #2a2a3e',
              borderRadius: 8,
              color: '#e0e0e0',
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#9e9e9e' }}
          />
          {Array.from({ length: gpuCount }, (_, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={`gpu${i}_${metricKey}`}
              name={`GPU ${i}`}
              stroke={GPU_COLORS[i % GPU_COLORS.length]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles = {
  chartWrapper: {
    background: '#16213e',
    borderRadius: 12,
    padding: '16px 12px 8px 0',
    border: '1px solid #2a2a3e',
    marginBottom: 8,
  },
}
