'use client'

import { useState } from 'react'
import RunCard from './RunCard'
import Link from 'next/link'

interface RunOverviewProps {
  runs: any[]
  user: any
}

export default function RunOverview({ runs, user }: RunOverviewProps) {
  // Filter statussen
  const [filterLocation, setFilterLocation] = useState('')
  const [filterMinDist, setFilterMinDist] = useState('')
  const [filterMaxDist, setFilterMaxDist] = useState('')
  // NIEUW: Datum filters
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  
  // De filter logica
  const filteredRuns = runs.filter(run => {
    // We pakken even alleen de datum (YYYY-MM-DD) van het loopje om makkelijk te vergelijken
    // new Date(run.start_time) maakt er een datum object van
    // toISOString().split('T')[0] pakt het eerste stukje: "2023-12-05"
    const runDate = new Date(run.start_time).toISOString().split('T')[0]

    // 1. Locatie filter (hoofdletterongevoelig)
    if (filterLocation && !run.location.toLowerCase().includes(filterLocation.toLowerCase())) {
      return false
    }

    // 2. Afstand filter (minimaal)
    if (filterMinDist && run.distance_km < parseFloat(filterMinDist)) {
      return false
    }

    // 3. Afstand filter (maximaal)
    if (filterMaxDist && run.distance_km > parseFloat(filterMaxDist)) {
      return false
    }

    // 4. NIEUW: Datum Vanaf
    if (filterStartDate && runDate < filterStartDate) {
        return false
    }

    // 5. NIEUW: Datum Tot
    if (filterEndDate && runDate > filterEndDate) {
        return false
    }

    return true
  })

  // Functie om alle filters te resetten
  const clearFilters = () => {
    setFilterLocation('')
    setFilterMinDist('')
    setFilterMaxDist('')
    setFilterStartDate('')
    setFilterEndDate('')
  }

  // Check of er filters actief zijn
  const hasFilters = filterLocation || filterMinDist || filterMaxDist || filterStartDate || filterEndDate

  return (
    <div className="w-full">
      {user ? (
        <>
          {/* De Knoppen */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
             <Link 
              href="/profile" 
              className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center"
            >
              Mijn Profiel
            </Link>
            <Link 
              href="/runs/create" 
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:opacity-80 transition flex items-center justify-center"
            >
              + Nieuw Loopje
            </Link>
          </div>

          {/* HET FILTER BLOK */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-8 max-w-5xl mx-auto">
            <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-gray-500">Vind een loopje</h3>
            
            {/* Grid aangepast: op grote schermen 5 kolommen naast elkaar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Zoek op Plaats */}
              <div className="lg:col-span-1">
                <input 
                  type="text" 
                  placeholder="Zoek plaats..." 
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>

              {/* Datum Vanaf */}
              <div>
                <input 
                  type="date" 
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500"
                  title="Vanaf datum"
                />
              </div>

              {/* Datum Tot */}
              <div>
                <input 
                  type="date" 
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-500"
                  title="Tot datum"
                />
              </div>

              {/* Min Km */}
              <div>
                 <input 
                  type="number" 
                  placeholder="Min km" 
                  value={filterMinDist}
                  onChange={(e) => setFilterMinDist(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>

              {/* Max Km */}
              <div>
                 <input 
                  type="number" 
                  placeholder="Max km" 
                  value={filterMaxDist}
                  onChange={(e) => setFilterMaxDist(e.target.value)}
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>
            </div>
            
            {/* Reset knopje */}
            {hasFilters && (
                <button 
                    onClick={clearFilters}
                    className="text-xs text-blue-500 mt-2 underline"
                >
                    Filters wissen
                </button>
            )}
          </div>

          {/* De Lijst met Loopjes */}
          <div className="w-full text-left">
            <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">
                Beschikbare Loopjes ({filteredRuns.length})
            </h2>
            
            {filteredRuns.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredRuns.map((run: any) => (
                  <RunCard 
                      key={run.id} 
                      run={run} 
                      currentUserId={user.id} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">
                Geen loopjes gevonden met deze filters.
              </p>
            )}
          </div>
        </>
      ) : (
        // Niet ingelogd scherm
        <div className="flex flex-col items-center">
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mb-4 text-center">
              Meld je aan, vind een maatje en ga samen hardlopen.
              Geen kosten, gewoon rennen.
            </p>
            <Link 
              href="/login" 
              className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-medium hover:opacity-80 transition"
            >
              Starten
            </Link>
        </div>
      )}
    </div>
  )
}