'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'

export default function ProfilePage() {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('') // Om het e-mailadres te tonen

  // Vertaalhulp voor specifieke teksten in dit bestand
  const trans = (nl: string, en: string, de: string) => {
      if (lang === 'en') return en;
      if (lang === 'de') return de;
      return nl;
  }

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }
    
    // Altijd het e-mailadres van de login tonen
    setEmail(user.email || trans('Geen email', 'No email', 'Keine E-Mail'))

    // Haal bestaande data op (als die er is)
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, city')
      .eq('id', user.id)
      .single()

    if (data) {
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setCity(data.city || '')
    }
    setLoading(false)
  }

  async function updateProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const updates = {
      id: user.id,
      full_name: fullName,
      phone: phone,
      city: city,
      email: user.email, 
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      setMessage(trans('Fout: ' + error.message, 'Error: ' + error.message, 'Fehler: ' + error.message))
    } else {
      setMessage(trans('Profiel bijgewerkt! Je kunt nu loopjes aanmaken.', 'Profile updated! You can now create runs.', 'Profil aktualisiert! Sie können nun Läufe erstellen.'))
    }
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center">{trans('Laden...', 'Loading...', 'Wird geladen...')}</div>

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">{t.nav_profile}</h1>
        
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          
          {/* E-mail (read-only) */}
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
             <label className="block text-sm font-medium mb-1">{trans('E-mail (Inlog)', 'E-mail (Login)', 'E-Mail (Anmeldung)')}</label>
             <p className="font-bold text-lg text-gray-700 dark:text-gray-300">{email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{trans('Naam', 'Name', 'Name')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder={trans('Je voor- en achternaam', 'Your first and last name', 'Ihr Vor- und Nachname')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{trans('Woonplaats', 'City', 'Wohnort')}</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder={trans('Waar start je meestal?', 'Where do you usually start?', 'Wo starten Sie normalerweise?')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{trans('Telefoonnummer', 'Phone number', 'Telefonnummer')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="06-12345678"
            />
          </div>

          <button
            onClick={updateProfile}
            disabled={loading}
            className="mt-4 bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition"
          >
            {loading ? trans('Opslaan...', 'Saving...', 'Wird gespeichert...') : trans('Opslaan', 'Save', 'Speichern')}
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-blue-600">{message}</p>
          )}
          
          <button onClick={() => router.push('/')} className="text-sm text-gray-500 underline mt-2">
            {trans('Terug naar home', 'Back to home', 'Zurück zur Startseite')}
          </button>
        </div>
      </div>
    </div>
  )
}