'use client'

import { useState } from 'react'
import RunCard from './RunCard'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface RunOverviewProps {
  runs: any[]
  user: any
}

export default function RunOverview({ runs, user }: RunOverviewProps) {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('run_id')

  // Filter States
  const [filterLocation, setFilterLocation] = useState('')
  const [filterProvince, setFilterProvince] = useState('') // Nu een select value
  const [filterMinDist, setFilterMinDist] = useState('')
  const [filterMaxDist, setFilterMaxDist] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  
  // Toggle States
  const [filterOnlyRaces, setFilterOnlyRaces] = useState(false)
  const [showHistorical, setShowHistorical] = useState(false)
  const [isCompactView, setIsCompactView] = useState(false)
  
  // NIEUW: Bereken unieke provincies uit de data
  // We pakken alle provincies, filteren de lege eruit, en maken ze uniek met Set
  const uniqueProvinces = Array.from(new Set(runs.map(r => r.province).filter(Boolean))).sort()

  const filteredRuns = runs.filter(run => {
    if (run.id === highlightId) return true;

    const runDateObj = new Date(run.start_time)
    const now = new Date()
    const runDateString = runDateObj.toISOString().split('T')[0]

    if (!showHistorical && runDateObj < now) return false
    if (filterLocation && !run.location.toLowerCase().includes(filterLocation.toLowerCase())) return false
    
    // AANGEPAST: Provincie filter is nu exact matchen (uit dropdown)
    if (filterProvince && run.province !== filterProvince) return false

    if (filterMinDist && run.distance_km < parseFloat(filterMinDist)) return false
    if (filterMaxDist && run.distance_km > parseFloat(filterMaxDist)) return false
    if (filterStartDate && runDateString < filterStartDate) return false
    if (filterEndDate && runDateString > filterEndDate) return false
    if (filterOnlyRaces && !run.is_race) return false

    return true
  })

  const clearFilters = () => {
    setFilterLocation(''); setFilterProvince(''); setFilterMinDist(''); setFilterMaxDist(''); 
    setFilterStartDate(''); setFilterEndDate(''); setFilterOnlyRaces(false); 
    setShowHistorical(false);
  }

  const hasFilters = filterLocation || filterProvince || filterMinDist || filterMaxDist || filterStartDate || filterEndDate || filterOnlyRaces || showHistorical

  return (
    <div className="w-full">
      
      {/* KNOPPEN BALK */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 flex-wrap">
         {user ? (
            <>
                <Link href="/profile" className="bg-black text-white dark:bg-white dark:text-black px-5 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center">Mijn Profiel</Link>
                <Link href="/runs/create" className="bg-blue-600 text-white px-5 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center">+ Nieuw Loopje</Link>
            </>
         ) : (
            <Link href="/login" className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Inloggen / Registreren</Link>
         )}
         
         <Link href="/calculator" className="bg-white border border-gray-300 text-black px-5 py-3 rounded-full font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"><span>🧮</span> Calculator</Link>
         <Link href="/training" className="bg-white border border-gray-300 text-black px-5 py-3 rounded-full font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"><span>📅</span> Schema's</Link>
         <Link href="/about" className="bg-white border border-gray-300 text-black w-12 h-12 rounded-full font-medium hover:bg-gray-50 transition flex items-center justify-center" title="Hoe werkt het?">ℹ️</Link>
      </div>

      {/* FILTER BLOK */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8 max-w-6xl mx-auto">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-gray-500">Vind een loopje</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          <div className="lg:col-span-1"><input type="text" placeholder="Plaats..." value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" /></div>
          
          {/* NIEUW: Provincie Dropdown */}
          <div className="lg:col-span-1">
            <select 
                value={filterProvince} 
                onChange={(e) => setFilterProvince(e.target.value)} 
                className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
            >
                <option value="">Alle provincies</option>
                {uniqueProvinces.map((prov: any) => (
                    <option key={prov} value={prov}>{prov}</option>
                ))}
            </select>
          </div>
          
          <div><input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500" /></div>
          <div><input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500" /></div>
          <div><input type="number" placeholder="Min km" value={filterMinDist} onChange={(e) => setFilterMinDist(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" /></div>
          <div><input type="number" placeholder="Max km" value={filterMaxDist} onChange={(e) => setFilterMaxDist(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" /></div>
          
          <div className="flex flex-col justify-center gap-1 h-full py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-700 dark:text-gray-300"><input type="checkbox" checked={filterOnlyRaces} onChange={(e) => setFilterOnlyRaces(e.target.checked)} className="w-4 h-4 accent-yellow-500" /> Wedstrijden</label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-500 dark:text-gray-400"><input type="checkbox" checked={showHistorical} onChange={(e) => setShowHistorical(e.target.checked)} className="w-4 h-4 accent-gray-500" /> Historie</label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-blue-600 dark:text-blue-400"><input type="checkbox" checked={isCompactView} onChange={(e) => setIsCompactView(e.target.checked)} className="w-4 h-4 accent-blue-600" /> Compact</label>
          </div>
        </div>
        
        {hasFilters && <button onClick={clearFilters} className="text-xs text-blue-500 mt-2 underline">Filters wissen</button>}
      </div>

      {/* LIJST */}
      <div className="w-full text-left">
        <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">{showHistorical ? 'Alle Loopjes' : 'Aankomende Loopjes'} ({filteredRuns.length})</h2>
        {filteredRuns.length > 0 ? (
          <div className={isCompactView ? "flex flex-col gap-3" : "grid gap-6 md:grid-cols-2"}>
            {filteredRuns.map((run: any) => (
              <RunCard key={run.id} run={run} currentUserId={user?.id} isCompactView={isCompactView} isHighlighted={run.id === highlightId} />
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-10">Geen loopjes gevonden.</p>}
      </div>
    </div>
  )
}