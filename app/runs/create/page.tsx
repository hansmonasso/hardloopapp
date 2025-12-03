'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateRunPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [date, setDate] = useState('')
  
  // We splitsen locatie nu in tweeën voor de invoer
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  
  const [distance, setDistance] = useState('')
  const [paceMin, setPaceMin] = useState('')
  const [paceMax, setPaceMax] = useState('')
  const [description, setDescription] = useState('')

  // Check of het adres bestaat via OpenStreetMap
  async function validateAddress(cityInput: string, streetInput: string) {
    try {
      // We zoeken op de combinatie van straat en stad
      const query = `${streetInput}, ${cityInput}`
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=nl&format=json&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        // Gevonden! We returnen de netjes geformatteerde naam die OSM ons geeft
        // Of we returnen true, en gebruiken onze eigen opmaak.
        // Laten we simpelweg true returnen als het bestaat.
        return true
      }
      return false
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

    // 1. VALIDATIE: Check of het adres echt bestaat
    const isValid = await validateAddress(city, street)
    
    if (!isValid) {
      setError(`We konden het adres '${street}' in '${city}' niet vinden. Controleer de spelling of probeer een straat in de buurt.`)
      setLoading(false)
      return
    }

    // 2. We combineren Straat + Stad voor in de database
    // Dit zorgt dat je filters op de homepage blijven werken!
    const fullLocationString = `${street}, ${city}`

    const { error: insertError } = await supabase.from('runs').insert({
      organizer_id: user.id,
      start_time: date,
      location: fullLocationString, // Opslaan als "Markt 1, Aalten"
      distance_km: parseFloat(distance),
      pace_min: paceMin,
      pace_max: paceMax,
      description: description
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

          {/* NIEUWE OPZET LOCATIE */}
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
          <p className="text-xs text-gray-500 -mt-2">
            * We controleren of dit adres echt bestaat.
          </p>

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
              <label className="block text-sm font-medium mb-1">Pace van (min/km)</label>
              <input
                type="text"
                placeholder="5:00"
                value={paceMin}
                onChange={(e) => setPaceMin(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pace tot (min/km)</label>
              <input
                type="text"
                placeholder="5:30"
                value={paceMax}
                onChange={(e) => setPaceMax(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Extra info (Bijv. verzamelplek)</label>
            <textarea
              rows={3}
              placeholder="We verzamelen bij het bankje voor de kerk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                ⚠️ {error}
            </div>
          )}

          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition"
            >
              {loading ? 'Adres checken...' : 'Loopje Aanmaken'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Annuleren
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}