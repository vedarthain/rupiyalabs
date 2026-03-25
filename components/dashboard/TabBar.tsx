'use client'
import type { TabId } from '@/app/dashboard/page'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'peer',         label: 'Peer comparison' },
  { id: 'historical',   label: 'Historical' },
  { id: 'verdict',      label: 'Verdict' },
]

interface Props {
  activeTab: TabId
  onChange: (tab: TabId) => void
}

export default function TabBar({ activeTab, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-3 flex items-center flex-shrink-0">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`text-[10px] px-3 py-[9px] border-b-2 -mb-[1px] whitespace-nowrap transition-colors font-sans
            ${activeTab === tab.id
              ? 'text-emerald-600 border-b-emerald-500 font-medium'
              : 'text-gray-400 border-b-transparent hover:text-gray-600'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
