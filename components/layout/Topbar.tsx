'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Topbar() {
  const path = usePathname()

  return (
    <div className="h-11 bg-white border-b border-gray-200 flex items-center px-4 gap-2 flex-shrink-0 z-10">
      <div className="text-[13px] font-semibold text-gray-900">
        Fundamental<span className="text-emerald-600">.</span>
      </div>

      <div className="flex gap-1 ml-3">
        <Link
          href="/dashboard"
          className={`text-[11px] px-3 py-[5px] rounded-md transition-colors ${
            path === '/dashboard'
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/screener"
          className={`text-[11px] px-3 py-[5px] rounded-md transition-colors ${
            path === '/screener'
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Screener
        </Link>
      </div>

      <div className="ml-auto flex gap-2 items-center">
        <span className="text-[10px] px-2 py-[2px] rounded-full bg-gray-100 text-gray-500 border border-gray-200 font-mono">
          1,302 stocks
        </span>
        <span className="text-[10px] px-2 py-[2px] rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
          ● Live
        </span>
      </div>
    </div>
  )
}
