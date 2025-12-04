'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

const STANDARD_DISTANCES = [5, 10, 15, 21.1, 25, 30, 42.2]

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
  
  const [isRace, setIsRace] = useState(false)
  const [title, setTitle] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [selectedDistances, setSelectedDistances] = useState<number[]>([])

  useEffect(() => {
    loadRunData()
  }, [])

  async function loadRunData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: run, error } = await supabase.from('runs').select('*').eq('id', runId).single()

    if (error || !run) { alert('Loopje niet gevonden'); return router.push('/') }
    if (run.organizer_id !== user.id) { alert('Geen rechten'); return router.push('/') }

    // Check deelnemers
    const { data: participants } = await supabase.from('participants').select('user_id').eq('run_id', runId)
    if (participants?.some(p => p.user_id !== user.id)) {
      alert('Er zijn al deelnemers, aanpassen niet meer mogelijk.')
      return router.push('/')
    }

    const d = new Date(run.start_time)
    const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
    
    setDate(localIso)
    setLocation(run.location)
    setDistance(run.distance_km)
    setPaceMin(run.pace_min || '')
    setPaceMax(run.pace_max || '')
    setDescription(run.description || '')
    setIsRace(run.is_race || false)
    setTitle(run.title || '')
    setExternalLink(run.external_link || '')
    
    if (run.race_distances) {
        const dists = run.race_distances.split(',').map((d:string) => parseFloat(d))
        setSelectedDistances(dists)
    }

    setLoading(false)
  }

  const toggleDistance = (dist: number) => {
    if (selectedDistances.includes(dist)) {
      setSelectedDistances(selectedDistances.filter(d => d !== dist))
    } else {
      setSelectedDistances([...selectedDistances, dist].sort((a, b) => a - b))
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    let finalDistanceKm = 0
    let finalRaceDistances = null

    if (isRace) {
        if (selectedDistances.length === 0) {
            setError("Kies een afstand")
            setLoading(false)
            return
        }
        finalDistanceKm = selectedDistances[0]
        finalRaceDistances = selectedDistances.join(', ')
    } else {
        finalDistanceKm = parseFloat(distance)
    }

    const { error: updateError } = await supabase
      .from('runs')
      .update({
        start_time: date,
        location: location,
        distance_km: finalDistanceKm,
        race_distances: finalRaceDistances,
        pace_min: isRace ? null : paceMin,
        pace_max: isRace ? null : paceMax,
        description: description,
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

  if (loading) return <div className="p-8 text-center">Laden...</div>

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6">Loopje Aanpassen</h1>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <input type="checkbox" checked={isRace} onChange={(e) => setIsRace(e.target.checked)} className="w-5 h-5 accent-yellow-500 cursor-pointer" />
            <label className="font-bold cursor-pointer">🏆 Is dit een officiële wedstrijd?</label>
          </div>

          {isRace && (
            <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
              <div>
                <label className="block text-sm font-bold mb-1">Naam evenement</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Afstanden</label>
                <div className="grid grid-cols-4 gap-2">
                    {STANDARD_DISTANCES.map((dist) => (
                        <div key={dist} onClick={() => toggleDistance(dist)} className={`cursor-pointer text-center py-2 px-1 rounded border text-sm font-medium transition ${selectedDistances.includes(dist) ? 'bg-yellow-400 border-yellow-500 text-black' : 'bg-white border-yellow-200 hover:bg-yellow-100'}`}>
                            {dist.toString().replace('.', ',')} km
                        </div>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Link</label>
                <input type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)} className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Datum & Tijd</label>
            <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Startlocatie</label>
            <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300" />
          </div>

          {!isRace && (
            <>
                <div>
                    <label className="block text-sm font-medium mb-1">Afstand (km)</label>
                    <input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Pace van</label><input type="text" value={paceMin} onChange={(e) => setPaceMin(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300" /></div>
                    <div><label className="block text-sm font-medium mb-1">Pace tot</label><input type="text" value={paceMax} onChange={(e) => setPaceMax(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300" /></div>
                </div>
            </>
          )}

          <div><label className="block text-sm font-medium mb-1">Extra info</label><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300" /></div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-4 mt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white p-3 rounded-lg font-bold hover:opacity-80">{loading ? 'Bezig...' : 'Opslaan'}</button>
            <button type="button" onClick={() => router.back()} className="px-4 py-3 border rounded-lg">Annuleren</button>
          </div>
        </form>
      </div>
    </div>
  )
}