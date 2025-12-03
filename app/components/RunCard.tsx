'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface RunCardProps {
  run: any
  currentUserId: string | undefined
}

export default function RunCard({ run, currentUserId }: RunCardProps) {
  const router = useRouter()
  const [participants, setParticipants] = useState<any[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOrganizer = currentUserId === run.organizer_id

  useEffect(() => {
    fetchParticipants()
  }, [])

  async function fetchParticipants() {
    const { data } = await supabase
      .from('participants')
      .select('user_id, profiles(full_name)')
      .eq('run_id', run.id)

    if (data) {
      setParticipants(data)
      const amIParticipating = data.some((p: any) => p.user_id === currentUserId)
      setIsJoined(amIParticipating)
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

    const { error } = await supabase
      .from('runs')
      .delete()
      .eq('id', run.id)

    if (error) {
      alert('Kon niet verwijderen: ' + error.message)
    } else {
      router.refresh()
    }
  }

  const formatDatum = (datumString: string) => {
    const datum = new Date(datumString)
    return datum.toLocaleDateString('nl-NL', {
      weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col h-full relative group">
      
      {/* ACTIE KNOPPEN: Rechtsboven (Absolute positie) */}
      {/* Ze staan nu vrij, want de afstand is verplaatst */}
      {isOrganizer && !hasOtherParticipants && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button 
            onClick={() => router.push(`/runs/edit/${run.id}`)}
            className="text-gray-400 hover:text-blue-600 transition p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800"
            title="Aanpassen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>

          <button 
            onClick={deleteRun}
            className="text-gray-400 hover:text-red-600 transition p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800"
            title="Verwijder loopje"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      )}

      {/* HEADER: Datum */}
      <div className="mb-2 pr-16"> {/* pr-16 zorgt dat tekst niet onder de knoppen schiet */}
        <p className="text-blue-600 font-bold uppercase text-xs tracking-wide">
          {formatDatum(run.start_time)}
        </p>
      </div>

      {/* TITEL & AFSTAND: Nu prominent naast elkaar */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold pr-4 break-words w-2/3">
            {run.location}
        </h3>
        
        {/* De afstand: Groot en vet */}
        <div className="text-right flex-shrink-0 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
            <span className="block text-3xl font-black text-gray-900 dark:text-white leading-none">
                {run.distance_km}
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                km
            </span>
        </div>
      </div>
      
      {/* DETAILS */}
      <div className="space-y-3 text-gray-600 dark:text-gray-300 mb-6 flex-grow border-t border-gray-100 dark:border-gray-800 pt-4">
        <p className="flex items-center gap-2">
          <span className="text-lg">⚡</span> 
          <span className="text-sm font-medium">Pace: {run.pace_min} - {run.pace_max} min/km</span>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <span className="text-lg">👤</span> 
          <span>Org: <span className="font-semibold">{isOrganizer ? 'Jijzelf' : (run.organizer?.full_name || 'Onbekend')}</span></span>
        </p>
        {run.description && (
          <p className="text-sm italic mt-2 text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            "{run.description}"
          </p>
        )}
        
        {/* DEELNEMERS */}
        <div className="mt-2">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                Deelnemers ({participants.length})
            </p>
            {participants.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {participants.map((p) => (
                        <span key={p.user_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {p.profiles?.full_name || 'Onbekend'}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">Nog geen aanmeldingen</p>
            )}
        </div>
      </div>

      {/* KNOP */}
      <button 
        onClick={toggleParticipation}
        disabled={loading}
        className={`w-full border-2 font-bold py-3 rounded-xl transition shadow-sm ${
            isJoined 
            ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600' 
            : 'border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
        }`}
      >
        {loading ? 'Bezig...' : (isJoined ? 'Ik kan toch niet mee' : 'Ik doe mee!')}
      </button>
    </div>
  )
}