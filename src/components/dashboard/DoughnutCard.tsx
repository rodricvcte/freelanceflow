'use client'

import dynamic from 'next/dynamic'

const ValueDoughnutChart = dynamic(() => import('./ValueDoughnutChart'), {
  ssr: false,
  loading: () => (
    <div className="rounded-full bg-gray-50 animate-pulse shrink-0" style={{ width: 130, height: 130 }} />
  ),
})

type Props = {
  labels: string[]
  data: number[]
  colors: string[]
}

export default function DoughnutCard({ labels, data, colors }: Props) {
  return (
    <div className="bg-white rounded-[10px] border border-gray-100 px-4 py-4 h-full">
      <h2 className="text-sm font-medium text-gray-600 mb-3">Valor em negociação</h2>
      <div className="flex gap-5 items-center">
        <div className="shrink-0" style={{ width: 130, height: 130 }}>
          <ValueDoughnutChart labels={labels} data={data} colors={colors} />
        </div>
        <ul className="flex flex-col gap-2">
          {labels.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className="shrink-0 rounded-[1px]"
                style={{ width: 8, height: 8, backgroundColor: colors[i] }}
              />
              <span className="text-[11px] text-gray-500">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
