'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

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

  // NIEUW: Wedstrijd velden
  const [isRace, setIsRace] = useState(false)
  const [externalLink, setExternalLink] = useState('')

  async function validateAddress(cityInput: string, streetInput: string) {
    try {
      const query = `${streetInput}, ${cityInput}`
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=nl&format=json&limit=1`)
      const data = await response.json()
      return data && data.length > 0
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Je moet ingelogd zijn.')
      setLoading(false)
      return
    }

    const isValid = await validateAddress(city, street)
    if (!isValid) {
      setError(`We konden het adres '${street}' in '${city}' niet vinden.`)
      setLoading(false)
      return
    }

    const fullLocationString = `${street}, ${city}`

    const { error: insertError } = await supabase.from('runs').insert({
      organizer_id: user.id,
      start_time: date,
      location: fullLocationString,
      distance_km: parseFloat(distance),
      pace_min: paceMin,
      pace_max: paceMax,
      description: description,
      is_race: isRace,           // NIEUW
      external_link: externalLink // NIEUW
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

          {/* NIEUW: Link veld (alleen zichtbaar als het een wedstrijd is) */}
          {isRace && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium mb-1">Link naar inschrijving/info</label>
              <input
                type="url"
                placeholder="https://www.zevenheuvelenloop.nl..."
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20"
              />
            </div>
          )}

          <hr className="border-gray-100 dark:border-gray-800 my-2" />

          <div>
            <label className="block text-sm font-medium mb-1">Datum & Tijd</label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stad / Dorp</label>
              <input
                type="text"
                required
                placeholder="Aalten"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Straat & Nr</label>
              <input
                type="text"
                required
                placeholder="Markt 1"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Afstand (km)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="5.0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
            />
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

          <div>
            <label className="block text-sm font-medium mb-1">Extra info</label>
            <textarea
              rows={3}
              placeholder="We verzamelen bij..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
            />
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