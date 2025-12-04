'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

const STANDARD_DISTANCES = [5, 10, 15, 21.1, 25, 30, 42.2]

export default function CreateRunPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [date, setDate] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  
  const [distance, setDistance] = useState('') 
  const [paceMin, setPaceMin] = useState('')
  const [paceMax, setPaceMax] = useState('')
  const [description, setDescription] = useState('')

  const [isRace, setIsRace] = useState(false)
  const [title, setTitle] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [selectedDistances, setSelectedDistances] = useState<number[]>([])

  // AANGEPAST: Zoekt nu in NL en DE
  async function validateAddress(cityInput: string, streetInput: string) {
    try {
      const query = `${streetInput}, ${cityInput}`
      // Hier is de wijziging: countrycodes=nl,de
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=nl,de&format=json&limit=1`)
      const data = await response.json()
      return data && data.length > 0
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const toggleDistance = (dist: number) => {
    if (selectedDistances.includes(dist)) {
      setSelectedDistances(selectedDistances.filter(d => d !== dist))
    } else {
      setSelectedDistances([...selectedDistances, dist].sort((a, b) => a - b))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Je moet ingelogd zijn.'); setLoading(false); return }

    const isValid = await validateAddress(city, street)
    if (!isValid) { setError(`Adres niet gevonden (in NL of DE).`); setLoading(false); return }

    let finalDistanceKm = 0
    let finalRaceDistances = null

    if (isRace) {
        if (selectedDistances.length === 0) {
            setError("Selecteer minimaal één afstand voor de wedstrijd.")
            setLoading(false)
            return
        }
        finalDistanceKm = selectedDistances[0]
        finalRaceDistances = selectedDistances.join(', ')
    } else {
        finalDistanceKm = parseFloat(distance)
    }

    const { error: insertError } = await supabase.from('runs').insert({
      organizer_id: user.id,
      start_time: date,
      location: `${street}, ${city}`,
      distance_km: finalDistanceKm, 
      race_distances: finalRaceDistances,
      pace_min: isRace ? null : paceMin,
      pace_max: isRace ? null : paceMax,
      description: description,
      is_race: isRace,
      title: isRace ? title : null,
      external_link: externalLink
    })

    if (insertError) {
      setError('Er ging iets mis: ' + insertError.message)
      setLoading(false)
    } else {
      router.push('/') 
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6">Nieuw Loopje Plannen</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <input 
              type="checkbox" id="raceToggle" checked={isRace}
              onChange={(e) => setIsRace(e.target.checked)}
              className="w-5 h-5 accent-yellow-500 cursor-pointer"
            />
            <label htmlFor="raceToggle" className="cursor-pointer font-bold select-none flex items-center gap-2">
               🏆 Is dit een officiële wedstrijd?
            </label>
          </div>

          {isRace && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
              <div>
                <label className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-500">Naam evenement</label>
                <input type="text" placeholder="Bijv. Zevenheuvelenloop" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-black/20" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-800 dark:text-yellow-500">Kies afstanden (meerdere mogelijk)</label>
                <div className="grid grid-cols-4 gap-2">
                    {STANDARD_DISTANCES.map((dist) => (
                        <div 
                            key={dist}
                            onClick={() => toggleDistance(dist)}
                            className={`cursor-pointer text-center py-2 px-1 rounded border text-sm font-medium transition ${
                                selectedDistances.includes(dist)
                                ? 'bg-yellow-400 border-yellow-500 text-black'
                                : 'bg-white dark:bg-black/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100'
                            }`}
                        >
                            {dist.toString().replace('.', ',')} km
                        </div>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-500">Link naar inschrijving</label>
                <input type="url" placeholder="https://..." value={externalLink} onChange={(e) => setExternalLink(e.target.value)} className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-black/20" />
              </div>
            </div>
          )}

          <hr className="border-gray-100 dark:border-gray-800 my-2" />

          <div>
            <label className="block text-sm font-medium mb-1">Datum & Tijd</label>
            <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stad / Dorp</label>
              <input type="text" required placeholder="Aalten" value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Straat & Nr</label>
              <input type="text" required placeholder="Markt 1" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
            </div>
          </div>

          {!isRace && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Afstand (km)</label>
                <input type="number" step="0.1" required={!isRace} placeholder="5.0" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pace van</label>
                  <input type="text" placeholder="5:00" value={paceMin} onChange={(e) => setPaceMin(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pace tot</label>
                  <input type="text" placeholder="5:30" value={paceMax} onChange={(e) => setPaceMax(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Extra info</label>
            <textarea rows={3} placeholder="Verzamelen bij..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

          <div className="flex gap-4 mt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition">
              {loading ? 'Bezig...' : (isRace ? 'Wedstrijd Aanmaken' : 'Loopje Aanmaken')}
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