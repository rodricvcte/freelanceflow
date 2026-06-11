'use client'

import dynamic from 'next/dynamic'

const ValueDoughnutChart = dynamic(() => import('./ValueDoughnutChart'), {
  ssr: false,
  loading: () => (
    <div className="rounded-full bg-gray-50 animate-pulse shrink-0" style={{ width: 170, height: 170 }} />
  ),
})

type Props = {
  labels: string[]
  data: number[]
  colors: string[]
}

export default function DoughnutCard({ labels, data, colors }: Props) {
  return (
    <div className="bg-white rounded-[10px] border border-gray-100 px-4 py-4 h-full flex flex-col">
      <h2 className="text-sm font-medium text-gray-600 mb-3 shrink-0">Valor em negociação</h2>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
        <div className="shrink-0" style={{ width: 170, height: 170 }}>
          <ValueDoughnutChart labels={labels} data={data} colors={colors} />
        </div>
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {labels.map((label, i) => (
            <li key={label} className="flex items-center gap-1.5">
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
