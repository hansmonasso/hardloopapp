'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../context/LanguageContext'

const STANDARD_DISTANCES = [5, 10, 15, 21.1, 25, 30, 42.2]

export default function CreateRunPage() {
  const { t, lang } = useLanguage()
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
  const [isWomenOnly, setIsWomenOnly] = useState(false) 

  async function validateAddress(cityInput: string, streetInput: string): Promise<string | null> {
    try {
      const query = `${streetInput}, ${cityInput}`
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=nl,de&format=json&limit=1&addressdetails=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const prov = data[0].address.state || data[0].address.province || ''
        return prov
      }
      return null
    } catch (e) {
      console.error(e)
      return null
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
    
    if (!user) { 
        setError(lang === 'de' ? 'Sie müssen angemeldet sein.' : 'Je moet ingelogd zijn.'); 
        setLoading(false); 
        return;
    }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()

    if (!profile) {
        if(confirm(lang === 'de' ? 'Ihr Profil wurde nicht gefunden. Möchten Sie zur Profilseite gehen, um Ihre Daten zu speichern?' : 'Je profiel is niet gevonden. Wil je naar de profielpagina om je gegevens op te slaan?')) {
            router.push('/profile');
        }
        setError(lang === 'de' ? 'FEHLER: Profil nicht gefunden. Speichern Sie zuerst Ihre Daten.' : 'FOUT: Profiel niet gevonden. Sla eerst je gegevens op.');
        setLoading(false);
        return;
    }


    const foundProvince = await validateAddress(city, street)
    
    if (foundProvince === null) { 
        setError(lang === 'de' ? 'Adresse nicht gefunden (NL oder DE).' : 'Adres niet gevonden (in NL of DE).'); 
        setLoading(false); 
        return 
    }

    // De oplossing: Verwijder de tijdszone correctie en gebruik de onbewerkte string van de input.
    // De 'date' state bevat de lokale tijdstring ('YYYY-MM-DDTHH:MM') die perfect is 
    // voor een PostgreSQL 'timestamp without time zone' kolom.
    const finalDateString = date; 
    // Zorg ervoor dat de database kolom 'start_time' is ingesteld als 'timestamp without time zone'.


    let finalDistanceKm = 0
    let finalRaceDistances = null

    if (isRace) {
        if (selectedDistances.length === 0) {
            setError(lang === 'de' ? 'Wählen Sie mindestens eine Distanz.' : 'Selecteer minimaal één afstand.')
            setLoading(false); 
            return;
        }
        finalDistanceKm = selectedDistances[0]
        finalRaceDistances = selectedDistances.join(', ')
    } else {
        finalDistanceKm = parseFloat(distance)
    }

    const { error: insertError } = await supabase.from('runs').insert({
      organizer_id: user.id,
      // Gebruik nu de onbewerkte lokale datum/tijd string
      start_time: finalDateString, 
      location: `${street}, ${city}`,
      province: foundProvince,
      distance_km: finalDistanceKm, 
      race_distances: finalRaceDistances,
      pace_min: isRace ? null : paceMin,
      pace_max: isRace ? null : paceMax,
      description: description,
      is_race: isRace,
      title: isRace ? title : null,
      external_link: externalLink,
      women_only: isWomenOnly,
    })

    if (insertError) {
      setError(lang === 'de' ? 'Fehler beim Speichern: ' + insertError.message : 'Er ging iets mis: ' + insertError.message)
      setLoading(false)
    } else {
      router.push('/') 
      router.refresh()
    }
  }

  const raceTitle = isRace ? (lang === 'de' ? 'Wettkampf erstellen' : 'Wedstrijd Aanmaken') : (lang === 'de' ? 'Lauf erstellen' : 'Loopje Aanmaken')

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-6">{raceTitle}</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          
          {/* TOGGLES */}
          <div className="flex flex-col gap-3">
              {/* WEDSTRIJD TOGGLE */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <input type="checkbox" id="raceToggle" checked={isRace} onChange={(e) => setIsRace(e.target.checked)} className="w-5 h-5 accent-yellow-500 cursor-pointer" />
                <label htmlFor="raceToggle" className="cursor-pointer font-bold select-none flex items-center gap-2">🏆 {lang === 'de' ? 'Ist dies ein offizieller Wettkampf?' : 'Is dit een officiële wedstrijd?'}</label>
              </div>

              {/* WOMEN ONLY TOGGLE */}
              <div className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-100 dark:border-pink-800/30">
                <input type="checkbox" id="womenOnlyToggle" checked={isWomenOnly} onChange={(e) => setIsWomenOnly(e.target.checked)} className="w-5 h-5 accent-pink-500 cursor-pointer" />
                <label htmlFor="womenOnlyToggle" className="cursor-pointer font-bold select-none flex items-center gap-2 text-pink-700 dark:text-pink-300">
                  🚺 {lang === 'de' ? 'Nur für Frauen' : (lang === 'en' ? 'Women Only Run' : 'Alleen voor vrouwen')}
                </label>
              </div>
          </div>


          {isRace && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
              <div><label className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-500">{lang === 'de' ? 'Name des Events' : 'Naam evenement'}</label><input type="text" placeholder={lang === 'de' ? 'z.B. Berlin Marathon' : 'Bijv. Zevenheuvelenloop'} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-black/20" /></div>
              <div>
                <label className="block text-sm font-bold mb-2 text-yellow-800 dark:text-yellow-500">{lang === 'de' ? 'Wählen Sie Distanzen' : 'Kies afstanden'} ({lang === 'de' ? 'mehrere möglich' : 'meerdere mogelijk'})</label>
                <div className="grid grid-cols-4 gap-2">
                    {STANDARD_DISTANCES.map((dist) => (
                        <div key={dist} onClick={() => toggleDistance(dist)} className={`cursor-pointer text-center py-2 px-1 rounded border text-sm font-medium transition ${selectedDistances.includes(dist) ? 'bg-yellow-400 border-yellow-500 text-black' : 'bg-white dark:bg-black/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100'}`}>
                            {dist.toString().replace('.', ',')} km
                        </div>
                    ))}
                </div>
              </div>
              <div><label className="block text-sm font-bold mb-1 text-yellow-800 dark:text-yellow-500">{lang === 'de' ? 'Link zur Anmeldung' : 'Link'}</label><input type="url" placeholder="https://..." value={externalLink} onChange={(e) => setExternalLink(e.target.value)} className="w-full p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-black/20" /></div>
            </div>
          )}

          <hr className="border-gray-100 dark:border-gray-800 my-2" />

          <div><label className="block text-sm font-medium mb-1">{lang === 'de' ? 'Datum & Uhrzeit' : 'Datum & Tijd'}</label><input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" /></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === 'de' ? 'Stadt / Dorf' : 'Stad / Dorp'}</label><input type="text" required placeholder="Aalten" value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === 'de' ? 'Straße & Hausnummer' : 'Straat & Nr'}</label><input type="text" required placeholder="Markt 1" value={street} onChange={(e) => setStreet(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" /></div>
          </div>

          {!isRace && (
            <>
              <div><label className="block text-sm font-medium mb-1">{lang === 'de' ? 'Distanz (km)' : 'Afstand (km)'}</label><input type="number" step="0.1" required={!isRace} placeholder="5.0" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">{lang === 'de' ? 'Tempo von' : 'Pace van'}</label><input type="text" placeholder="5:00" value={paceMin} onChange={(e) => setPaceMin(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" /></div>
                <div><label className="block text-sm font-medium mb-1">{lang === 'de' ? 'Tempo bis' : 'Pace tot'}</label><input type="text" placeholder="5:30" value={paceMax} onChange={(e) => setPaceMax(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" /></div>
              </div>
            </>
          )}

          <div><label className="block text-sm font-medium mb-1">{lang === 'de' ? 'Zusätzliche Infos' : 'Extra info'}</label><textarea rows={3} placeholder={lang === 'de' ? 'Treffpunkt bei...' : 'Verzamelen bij...'} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent" /></div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

          <div className="flex gap-4 mt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition">{loading ? (lang === 'de' ? 'Adresse prüfen...' : 'Adres checken...') : raceTitle}</button>
            <button type="button" onClick={() => router.back()} className="px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">{lang === 'de' ? 'Abbrechen' : 'Annuleren'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}