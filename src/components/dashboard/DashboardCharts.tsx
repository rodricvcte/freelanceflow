'use client'

import dynamic from 'next/dynamic'

const ProposalBarChart = dynamic(() => import('./ProposalBarChart'), {
  ssr: false,
  loading: () => <div className="h-[140px] rounded-lg bg-gray-50 animate-pulse" />,
})

const ValueDoughnutChart = dynamic(() => import('./ValueDoughnutChart'), {
  ssr: false,
  loading: () => <div className="h-[140px] rounded-lg bg-gray-50 animate-pulse" />,
})

export type DashboardChartsProps = {
  barLabels: string[]
  barData: number[]
  doughnutLabels: string[]
  doughnutData: number[]
  doughnutColors: string[]
}

export default function DashboardCharts({
  barLabels,
  barData,
  doughnutLabels,
  doughnutData,
  doughnutColors,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

      {/* Propostas por mês */}
      <div className="bg-white rounded-[10px] border border-gray-100 px-5 py-5">
        <h2 className="text-sm font-medium text-gray-600 mb-4">Propostas por mês</h2>
        <div style={{ height: 160 }}>
          <ProposalBarChart labels={barLabels} data={barData} />
        </div>
      </div>

      {/* Valor em negociação */}
      <div className="bg-white rounded-[10px] border border-gray-100 px-5 py-5">
        <h2 className="text-sm font-medium text-gray-600 mb-4">Valor em negociação</h2>
        <div className="flex gap-5 items-center" style={{ height: 160 }}>
          <div className="shrink-0" style={{ width: 140, height: 140 }}>
            <ValueDoughnutChart
              labels={doughnutLabels}
              data={doughnutData}
              colors={doughnutColors}
            />
          </div>
          {/* Legenda HTML — quadradinhos 10×10 */}
          <ul className="flex flex-col gap-2 min-w-0">
            {doughnutLabels.map((label, i) => (
              <li key={label} className="flex items-center gap-2 min-w-0">
                <span
                  className="shrink-0 rounded-[2px]"
                  style={{ width: 10, height: 10, backgroundColor: doughnutColors[i] }}
                />
                <span className="text-[11px] text-gray-500 truncate">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  )
}
