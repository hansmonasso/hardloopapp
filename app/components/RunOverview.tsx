'use client'

import { useState } from 'react'
import RunCard from './RunCard'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'

interface RunOverviewProps {
  runs: any[]
  user: any
}

export default function RunOverview({ runs, user }: RunOverviewProps) {
  const { t, lang, setLang } = useLanguage()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('run_id')

  // Filter States
  const [filterLocation, setFilterLocation] = useState('')
  const [filterProvince, setFilterProvince] = useState('')
  const [filterMinDist, setFilterMinDist] = useState('')
  const [filterMaxDist, setFilterMaxDist] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  
  // Toggle States
  const [filterOnlyRaces, setFilterOnlyRaces] = useState(false)
  const [filterOnlySocial, setFilterOnlySocial] = useState(false)
  const [filterWomenOnly, setFilterWomenOnly] = useState(false) 
  const [showHistorical, setShowHistorical] = useState(false)
  const [isCompactView, setIsCompactView] = useState(false)
  
  // Haal unieke provincies uit de data voor de dropdown
  const uniqueProvinces = Array.from(new Set(runs.map(r => r.province).filter(Boolean))).sort()

  const filteredRuns = runs.filter(run => {
    if (run.id === highlightId) return true;

    const runDateObj = new Date(run.start_time)
    const now = new Date()
    const runDateString = runDateObj.toISOString().split('T')[0]

    // 1. Algemene Filters
    if (!showHistorical && runDateObj < now) return false
    if (filterLocation && !run.location.toLowerCase().includes(filterLocation.toLowerCase())) return false
    if (filterProvince && run.province !== filterProvince) return false
    if (filterMinDist && run.distance_km < parseFloat(filterMinDist)) return false
    if (filterMaxDist && run.distance_km > parseFloat(filterMaxDist)) return false
    if (filterStartDate && runDateString < filterStartDate) return false
    if (filterEndDate && runDateString > filterEndDate) return false
    
    // 2. Type Filters
    const isRace = run.is_race
    
    if (filterOnlyRaces && !isRace) return false;
    if (filterOnlySocial && isRace) return false;

    // 3. VROUWEN ONLY LOGICA
    if (filterWomenOnly && !run.women_only) return false; 

    return true
  })

  const clearFilters = () => {
    setFilterLocation(''); setFilterProvince(''); setFilterMinDist(''); setFilterMaxDist(''); 
    setFilterStartDate(''); setFilterEndDate(''); setFilterOnlyRaces(false); 
    setFilterOnlySocial(false);
    setFilterWomenOnly(false); // Resetten
    setShowHistorical(false);
  }

  const hasFilters = filterLocation || filterProvince || filterMinDist || filterMaxDist || filterStartDate || filterEndDate || filterOnlyRaces || filterOnlySocial || filterWomenOnly || showHistorical

  return (
    <div className="w-full">
      
      {/* TAAL SCHAKELAAR - VLAGGETJES */}
      <div className="flex justify-end gap-4 mb-4 text-2xl">
        <button onClick={() => setLang('nl')} className={`transition hover:scale-110 ${lang === 'nl' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`} title="Nederlands">🇳🇱</button>
        <button onClick={() => setLang('de')} className={`transition hover:scale-110 ${lang === 'de' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`} title="Deutsch">🇩🇪</button>
        <button onClick={() => setLang('en')} className={`transition hover:scale-110 ${lang === 'en' ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`} title="English">🇬🇧</button>
      </div>

      {/* KNOPPEN BALK */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 flex-wrap">
         {user ? (
            <>
                <Link href="/profile" className="bg-black text-white dark:bg-white dark:text-black px-5 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center">
                    {t.nav_profile}
                </Link>
                <Link href="/runs/create" className="bg-blue-600 text-white px-5 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center">
                    {t.nav_new_run}
                </Link>
            </>
         ) : (
            <Link href="/login" className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                {t.login_btn}
            </Link>
         )}
         
         {/* Tools Knoppen */}
         <Link href="/calculator" className="bg-white border border-gray-300 text-black px-5 py-3 rounded-full font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <span>🧮</span> {t.nav_calc}
         </Link>
         <Link href="/training" className="bg-white border border-gray-300 text-black px-5 py-3 rounded-full font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <span>📅</span> {t.nav_schema}
         </Link>
         <Link href="/about" className="bg-white border border-gray-300 text-black w-12 h-12 rounded-full font-medium hover:bg-gray-50 transition flex items-center justify-center" title={t.nav_info}>
            ℹ️
         </Link>
      </div>

      {/* FILTER BLOK */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8 max-w-6xl mx-auto">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-gray-500">{t.filter_title}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          <div className="lg:col-span-1">
            <input type="text" placeholder={t.filter_placeholder_city} value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
          </div>
          
          <div className="lg:col-span-1">
            <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
                <option value="">{t.filter_all_provinces}</option>
                {uniqueProvinces.map((prov: any) => (
                    <option key={prov} value={prov}>{prov}</option>
                ))}
            </select>
          </div>
          
          <div><input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500" /></div>
          <div><input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500" /></div>
          <div><input type="number" placeholder="Min km" value={filterMinDist} onChange={(e) => setFilterMinDist(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" /></div>
          <div><input type="number" placeholder="Max km" value={filterMaxDist} onChange={(e) => setFilterMaxDist(e.target.value)} className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" /></div>
          
          {/* CHECKBOXES - DE GROEP FILTERS */}
          <div className="flex flex-col justify-center gap-1 h-full py-1">
              {/* Alleen Sociaal */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={filterOnlySocial} onChange={(e) => setFilterOnlySocial(e.target.checked)} className="w-4 h-4 accent-blue-500" /> 
                {lang === 'de' ? 'Nur Sozial' : (lang === 'en' ? 'Only Social' : 'Alleen Sociaal')}
              </label>

              {/* Alleen Wedstrijden */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={filterOnlyRaces} onChange={(e) => setFilterOnlyRaces(e.target.checked)} className="w-4 h-4 accent-yellow-500" /> 
                {t.filter_only_races}
              </label>

              {/* Alleen Vrouwen (NIEUW) */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-pink-600 dark:text-pink-400">
                <input type="checkbox" checked={filterWomenOnly} onChange={(e) => setFilterWomenOnly(e.target.checked)} className="w-4 h-4 accent-pink-500" /> 
                {lang === 'de' ? 'Nur Frauen' : (lang === 'en' ? 'Women Only' : 'Alleen Vrouwen')}
              </label>
              
              {/* Toon Historie */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-500 dark:text-gray-400">
                <input type="checkbox" checked={showHistorical} onChange={(e) => setShowHistorical(e.target.checked)} className="w-4 h-4 accent-gray-500" /> 
                {t.filter_history}
              </label>

              {/* Compacte Lijst */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-blue-600 dark:text-blue-400">
                <input type="checkbox" checked={isCompactView} onChange={(e) => setIsCompactView(e.target.checked)} className="w-4 h-4 accent-blue-600" /> 
                {t.filter_compact}
              </label>
          </div>
        </div>
        
        {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-blue-500 mt-2 underline">
                {t.filter_reset}
            </button>
        )}
      </div>

      {/* LIJST */}
      <div className="w-full text-left">
        <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">
            {showHistorical ? t.list_header_history : t.list_header_future} ({filteredRuns.length})
        </h2>
        
        {filteredRuns.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredRuns.map((run: any) => (
              <RunCard 
                  key={run.id} 
                  run={run} 
                  currentUserId={user?.id}
                  isCompactView={isCompactView}
                  isHighlighted={run.id === highlightId}
              />
            ))}
          </div>
        ) : (
            <p className="text-gray-500 text-center py-10">{t.list_empty}</p>
        )}
      </div>
    </div>
  )
}