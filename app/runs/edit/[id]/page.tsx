'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditRunPage() {
  const router = useRouter()
  const params = useParams()
  const runId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [distance, setDistance] = useState('')
  const [paceMin, setPaceMin] = useState('')
  const [paceMax, setPaceMax] = useState('')
  const [description, setDescription] = useState('')
  
  // NIEUW: De wedstrijd velden ook hier toevoegen
  const [isRace, setIsRace] = useState(false)
  const [title, setTitle] = useState('')
  const [externalLink, setExternalLink] = useState('')

  useEffect(() => {
    loadRunData()
  }, [])

  async function loadRunData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: run, error } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (error || !run) {
      alert('Loopje niet gevonden')
      return router.push('/')
    }

    if (run.organizer_id !== user.id) {
      alert('Jij mag dit niet aanpassen.')
      return router.push('/')
    }

    // Check of er al deelnemers zijn
    const { data: participants } = await supabase
      .from('participants')
      .select('user_id')
      .eq('run_id', runId)
    
    const hasOthers = participants?.some(p => p.user_id !== user.id)
    if (hasOthers) {
      alert('Er zijn al deelnemers, je kunt niet meer aanpassen.')
      return router.push('/')
    }

    // Datum fixen voor input veld
    const d = new Date(run.start_time)
    const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
    
    // Velden vullen met data uit database
    setDate(localIso)
    setLocation(run.location)
    setDistance(run.distance_km)
    setPaceMin(run.pace_min)
    setPaceMax(run.pace_max)
    setDescription(run.description || '')
    
    // NIEUW: Wedstrijd data vullen
    setIsRace(run.is_race || false)
    setTitle(run.title || '')
    setExternalLink(run.external_link || '')

    setLoading(false)
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase
      .from('runs')
      .update({
        start_time: date,
        location: location,
        distance_km: parseFloat(distance),
        pace_min: paceMin,
        pace_max: paceMax,
        description: description,
        // NIEUW: Opslaan
        is_race: isRace,
        title: isRace ? title : null,
        external_link: externalLink
      })
      .eq('id', runId)

    if (updateError) {
      setError('Er ging iets mis: ' + updateError.message)
      setLoading(false)
    } else {
      router.push('/') 
      router.refresh()
    }
  }

  if (loading) return <div className="p-8 text-center">Gegevens ophalen...</div>

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6">Loopje Aanpassen</h1>
        
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          
          {/* NIEUW: Wedstrijd Switch */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <input 
              type="checkbox" 
              id="raceToggle"
              checked={isRace}
              onChange={(e) => setIsRace(e.target.checked)}
              className="w-5 h-5 accent-yellow-500 cursor-pointer"
            />
            <label htmlFor="raceToggle" className="cursor-pointer font-bold select-none flex items-center gap-2">
               🏆 Is dit een officiële wedstrijd?
            </label>
          </div>

          {/* NIEUW: Wedstrijd Velden */}
          {isRace && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
              <div>
                <label className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-500">Naam evenement</label>
                <input
                    type="text"
                    placeholder="Bijv. Zevenheuvelenloop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-black/20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-500">Link naar inschrijving</label>
                <input
                    type="url"
                    placeholder="https://..."
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-black/20"
                />
              </div>
            </div>
          )}

          <hr className="border-gray-100 dark:border-gray-800 my-2" />

          <div>
            <label className="block text-sm font-medium mb-1">Datum & Tijd</label>
            <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Startlocatie</label>
            <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Afstand (km)</label>
            <input type="number" step="0.1" required value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pace van</label>
              <input type="text" value={paceMin} onChange={(e) => setPaceMin(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pace tot</label>
              <input type="text" value={paceMax} onChange={(e) => setPaceMax(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Extra info</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-4 mt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition">
              {loading ? 'Bezig...' : 'Wijzigingen Opslaan'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}