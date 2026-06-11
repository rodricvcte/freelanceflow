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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2.5">

      {/* Propostas por mês */}
      <div className="bg-white rounded-[10px] border border-gray-100 px-4 py-[14px]">
        <h2 className="text-[12px] font-medium text-gray-500 mb-3">Propostas por mês</h2>
        <div style={{ height: 140 }}>
          <ProposalBarChart labels={barLabels} data={barData} />
        </div>
      </div>

      {/* Valor em negociação */}
      <div className="bg-white rounded-[10px] border border-gray-100 px-4 py-[14px]">
        <h2 className="text-[12px] font-medium text-gray-500 mb-3">Valor em negociação</h2>
        <div className="flex gap-4 items-center" style={{ height: 140 }}>
          <div className="shrink-0" style={{ width: 140, height: 140 }}>
            <ValueDoughnutChart
              labels={doughnutLabels}
              data={doughnutData}
              colors={doughnutColors}
            />
          </div>
          {/* Mini legenda */}
          <ul className="flex flex-col gap-1.5 min-w-0">
            {doughnutLabels.map((label, i) => (
              doughnutData[i] > 0 && (
                <li key={label} className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: doughnutColors[i] }}
                  />
                  <span className="text-[11px] text-gray-500 truncate">{label}</span>
                </li>
              )
            ))}
          </ul>
        </div>
      </div>

    </div>
  )
}
