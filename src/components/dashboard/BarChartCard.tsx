'use client'

import dynamic from 'next/dynamic'

const ProposalBarChart = dynamic(() => import('./ProposalBarChart'), {
  ssr: false,
  loading: () => <div className="rounded bg-gray-50 animate-pulse" style={{ height: 130 }} />,
})

type Props = { labels: string[]; data: number[] }

export default function BarChartCard({ labels, data }: Props) {
  return (
    <div className="bg-white rounded-[10px] border border-gray-100 px-4 py-4 h-full flex flex-col">
      <h2 className="text-sm font-medium text-gray-600 mb-3 shrink-0">Propostas por mês</h2>
      <div className="flex-1 min-h-0">
        <ProposalBarChart labels={labels} data={data} />
      </div>
    </div>
  )
}
