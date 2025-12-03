'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

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
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      setMessage('Fout: ' + error.message)
    } else {
      setMessage('Profiel bijgewerkt! Je kunt nu loopjes aanmaken.')
    }
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center">Laden...</div>

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Jouw Profiel</h1>
        
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div>
            <label className="block text-sm font-medium mb-1">Naam</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="Je voor- en achternaam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Woonplaats</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="Waar start je meestal?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefoonnummer</label>
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
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-blue-600">{message}</p>
          )}
          
          <button onClick={() => router.push('/')} className="text-sm text-gray-500 underline mt-2">
            Terug naar home
          </button>
        </div>
      </div>
    </div>
  )
}