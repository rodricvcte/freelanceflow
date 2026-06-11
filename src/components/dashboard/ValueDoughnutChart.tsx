'use client'

import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip)

type Props = {
  labels: string[]
  data: number[]
  colors: string[]
}

export default function ValueDoughnutChart({ labels, data, colors }: Props) {
  const total = data.reduce((s, v) => s + v, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-gray-400">Sem propostas com valor</p>
      </div>
    )
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ctx.parsed)}`,
        },
      },
    },
  }

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4,
        }],
      }}
      options={options}
    />
  )
}
