'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import StockHeader from '@/components/dashboard/StockHeader'
import TabBar from '@/components/dashboard/TabBar'
import OverviewTab from '@/components/dashboard/tabs/OverviewTab'
import FundamentalsTab from '@/components/dashboard/tabs/FundamentalsTab'
import PeerTab from '@/components/dashboard/tabs/PeerTab'
import HistoricalTab from '@/components/dashboard/tabs/HistoricalTab'
import VerdictTab from '@/components/dashboard/tabs/VerdictTab'
import type { StockDetail, IndustryGroup, FundamentalsControls } from '@/lib/types'

export type TabId = 'overview' | 'fundamentals' | 'peer' | 'historical' | 'verdict'

const DEFAULT_CONTROLS: FundamentalsControls = {
  statement: 'consolidated',
  period: 'annual',
  range: '7Y',
}

export default function DashboardPage() {
  const [industries, setIndustries] = useState<IndustryGroup[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [stockData, setStockData] = useState<StockDetail | null>(null)
  const [peersData, setPeersData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [controls, setControls] = useState<FundamentalsControls>(DEFAULT_CONTROLS)
  const [loadingIndustries, setLoadingIndustries] = useState(true)
  const [loadingStock, setLoadingStock] = useState(false)

  // Load sidebar industries
  useEffect(() => {
    fetch('/api/industries')
      .then(r => r.json())
      .then(data => {
        setIndustries(data)
        // Auto-select first stock
        if (data[0]?.stocks?.[0]) {
          const first = data[0].stocks[0]
          setSelectedSymbol(first.nse_code || String(first.id))
        }
      })
      .finally(() => setLoadingIndustries(false))
  }, [])

  // Load stock detail when symbol changes
  useEffect(() => {
    if (!selectedSymbol) return
    setLoadingStock(true)
    setStockData(null)
    setPeersData(null)

    Promise.all([
      fetch(`/api/stock/${selectedSymbol}`).then(r => r.json()),
      fetch(`/api/peers?symbol=${selectedSymbol}`).then(r => r.json()),
    ])
      .then(([stock, peers]) => {
        setStockData(stock)
        setPeersData(peers)
      })
      .finally(() => setLoadingStock(false))
  }, [selectedSymbol])

  const handleSelectStock = useCallback((symbol: string) => {
    setSelectedSymbol(symbol)
    setActiveTab('overview')
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          industries={industries}
          loading={loadingIndustries}
          selectedSymbol={selectedSymbol}
          onSelectStock={handleSelectStock}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <StockHeader stock={stockData} loading={loadingStock} />
          <TabBar activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex-1 overflow-y-auto bg-gray-100">
            {activeTab === 'overview'      && <OverviewTab      stock={stockData} loading={loadingStock} />}
            {activeTab === 'fundamentals'  && <FundamentalsTab  stock={stockData} loading={loadingStock} controls={controls} onControlsChange={setControls} />}
            {activeTab === 'peer'          && <PeerTab          stock={stockData} peers={peersData} loading={loadingStock} />}
            {activeTab === 'historical'    && <HistoricalTab    stock={stockData} loading={loadingStock} />}
            {activeTab === 'verdict'       && <VerdictTab       stock={stockData} loading={loadingStock} />}
          </div>
        </div>
      </div>
    </div>
  )
}
