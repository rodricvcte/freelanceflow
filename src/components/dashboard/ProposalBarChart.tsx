'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

type Props = { labels: string[]; data: number[] }

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (item) => ` ${item.parsed.y} proposta${item.parsed.y !== 1 ? 's' : ''}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 11 }, color: '#9CA3AF' },
    },
    y: { display: false, grid: { display: false }, min: 0 },
  },
}

export default function ProposalBarChart({ labels, data }: Props) {
  return (
    <Bar
      data={{
        labels,
        datasets: [{
          data,
          backgroundColor: '#1D9E75',
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 40,
        }],
      }}
      options={options}
    />
  )
}
