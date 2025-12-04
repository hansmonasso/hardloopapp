'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface RunCardProps {
  run: any
  currentUserId: string | undefined
  isCompactView?: boolean // NIEUW: Optionele prop
}

export default function RunCard({ run, currentUserId, isCompactView = false }: RunCardProps) {
  const router = useRouter()
  const [participants, setParticipants] = useState<any[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // NIEUW: Voor het uitklappen

  const isOrganizer = currentUserId === run.organizer_id

  useEffect(() => {
    fetchParticipants()
  }, [])

  async function fetchParticipants() {
    const { data } = await supabase.from('participants').select('user_id, profiles(full_name)').eq('run_id', run.id)
    if (data) {
      setParticipants(data)
      setIsJoined(data.some((p: any) => p.user_id === currentUserId))
    }
  }

  const hasOtherParticipants = participants.some(p => p.user_id !== run.organizer_id)

  async function toggleParticipation() {
    if (!currentUserId) return alert('Je moet ingelogd zijn!')
    setLoading(true)
    if (isJoined) {
      await supabase.from('participants').delete().eq('run_id', run.id).eq('user_id', currentUserId)
    } else {
      await supabase.from('participants').insert({ run_id: run.id, user_id: currentUserId })
    }
    await fetchParticipants()
    setLoading(false)
  }

  async function deleteRun() {
    if (!confirm('Weet je zeker dat je dit loopje wilt verwijderen?')) return
    const { error } = await supabase.from('runs').delete().eq('id', run.id)
    if (!error) router.refresh()
  }

  const formatDatum = (datumString: string, short = false) => {
    const datum = new Date(datumString)
    if (short) {
        // Formaat voor compact: "Za 06 dec"
        return datum.toLocaleDateString('nl-NL', { weekday: 'short', day: '2-digit', month: 'short' })
    }
    return datum.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  }
  
  const formatTijd = (datumString: string) => {
      return new Date(datumString).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  }

  const isRace = run.is_race
  const cardBorderClass = isRace 
    ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/10' 
    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'

  const distanceDisplay = (isRace && run.race_distances) 
    ? run.race_distances.replace(/,/g, ' /').replace(/\./g, ',')
    : run.distance_km.toString().replace('.', ',')

  // --- COMPACTE WEERGAVE ---
  if (isCompactView) {
    return (
        <div className={`${cardBorderClass} border rounded-lg transition overflow-hidden`}>
            {/* De Balk (Klikbaar) */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    {/* Datum blokje */}
                    <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 min-w-[60px]">
                        <span className="text-xs font-bold uppercase text-gray-500">{formatDatum(run.start_time, true).split(' ')[0]}</span>
                        <span className="text-lg font-black leading-none">{new Date(run.start_time).getDate()}</span>
                    </div>

                    <div className="flex flex-col truncate">
                        <div className="flex items-center gap-2">
                            {isRace && <span className="text-xs">🏆</span>}
                            <span className="font-bold truncate text-gray-900 dark:text-gray-100">
                                {run.title || run.location}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500 truncate flex items-center gap-2">
                            ⏰ {formatTijd(run.start_time)} 
                            {run.title && <span>• 📍 {run.location}</span>}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 pl-2 flex-shrink-0">
                    <div className="text-right">
                        <span className="block font-bold text-gray-900 dark:text-gray-100">{distanceDisplay} km</span>
                        {isJoined && <span className="text-[10px] text-green-600 font-bold block bg-green-100 dark:bg-green-900 px-1 rounded">DEELNEMER</span>}
                    </div>
                    {/* Pijltje icoon */}
                    <svg 
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Uitgeklapte Content */}
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-black/20">
                    {/* Details in het kort */}
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                        {!isRace && <p className="mb-1">⚡ Pace: {run.pace_min} - {run.pace_max} min/km</p>}
                        <p>👤 Org: {isOrganizer ? 'Jijzelf' : (run.organizer?.full_name || 'Onbekend')}</p>
                        {run.description && <p className="italic mt-2 text-gray-500">"{run.description}"</p>}
                    </div>

                    {/* Actieknoppen voor beheerder */}
                    {isOrganizer && !hasOtherParticipants && (
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => router.push(`/runs/edit/${run.id}`)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Aanpassen</button>
                            <button onClick={deleteRun} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Verwijderen</button>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        {/* Deelnemers */}
                        <div className="flex flex-wrap gap-1">
                            {participants.length > 0 ? participants.map((p) => (
                                <span key={p.user_id} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                    {p.profiles?.full_name}
                                </span>
                            )) : <span className="text-xs text-gray-400">Nog geen lopers</span>}
                        </div>

                        {/* Actieknoppen Deelname */}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={toggleParticipation}
                                disabled={loading}
                                className={`text-sm px-4 py-2 rounded-lg font-bold flex-1 sm:flex-none ${isJoined ? 'bg-red-100 text-red-600' : 'bg-black text-white dark:bg-white dark:text-black'}`}
                            >
                                {loading ? '...' : (isJoined ? 'Afmelden' : 'Meedoen')}
                            </button>
                            {isRace && run.external_link && (
                                <a href={run.external_link} target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500">Info ↗</a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
  }

  // --- STANDAARD WEERGAVE (De 'oude' kaart) ---
  return (
    <div className={`${cardBorderClass} border-2 p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col h-full relative group`}>
      {isRace && <div className="absolute -top-3 left-6 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">🏆 WEDSTRIJD</div>}
      
      {isOrganizer && !hasOtherParticipants && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button onClick={() => router.push(`/runs/edit/${run.id}`)} className="text-gray-400 hover:text-blue-600 p-2 bg-white/80 rounded-full border shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
          <button onClick={deleteRun} className="text-gray-400 hover:text-red-600 p-2 bg-white/80 rounded-full border shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
        </div>
      )}

      <div className="mb-2 pr-16 mt-2">
        <p className={`${isRace ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600'} font-bold uppercase text-xs tracking-wide`}>{formatDatum(run.start_time)}</p>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="pr-4 break-words w-2/3">
            {run.title ? (
                <><h3 className="text-xl font-bold leading-tight">{run.title}</h3><p className="text-sm text-gray-500 mt-1 flex items-center gap-1">📍 {run.location}</p></>
            ) : <h3 className="text-xl font-bold">{run.location}</h3>}
        </div>
        
        <div className="text-right flex-shrink-0 bg-white dark:bg-black/20 px-3 py-2 rounded-lg border border-black/5">
            <span className={`block font-black leading-none ${isRace ? 'text-xl' : 'text-3xl'}`}>
                {distanceDisplay}
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">km</span>
        </div>
      </div>
      
      <div className="space-y-3 text-gray-600 dark:text-gray-300 mb-6 flex-grow border-t border-black/5 pt-4">
        {!isRace && <p className="flex items-center gap-2"><span className="text-lg">⚡</span> <span className="text-sm font-medium">Pace: {run.pace_min} - {run.pace_max} min/km</span></p>}
        <p className="flex items-center gap-2 text-sm"><span className="text-lg">👤</span> <span>Org: <span className="font-semibold">{isOrganizer ? 'Jijzelf' : (run.organizer?.full_name || 'Onbekend')}</span></span></p>
        {run.description && <p className="text-sm italic mt-2 text-gray-500 bg-white/50 p-3 rounded-lg">"{run.description}"</p>}
        
        <div className="mt-2">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Wie gaan er mee? ({participants.length})</p>
            {participants.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {participants.map((p) => (
                        <span key={p.user_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {p.profiles?.full_name || 'Onbekend'}
                        </span>
                    ))}
                </div>
            ) : <p className="text-xs text-gray-400 italic">Nog geen aanmeldingen uit de groep</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={toggleParticipation} disabled={loading} className={`w-full border-2 font-bold py-3 rounded-xl transition shadow-sm ${isJoined ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}`}>{loading ? 'Bezig...' : (isJoined ? 'Ik ga toch niet mee' : 'Ik ga mee!')}</button>
        {isRace && run.external_link && <a href={run.external_link} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2">Inschrijven / Info <span className="text-lg">↗</span></a>}
      </div>
    </div>
  )
}