'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Dit zorgt dat hij na het klikken terugkomt op jouw site
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage('Er ging iets mis: ' + error.message)
    } else {
      setMessage('Check je email voor de inloglink!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Inloggen</h2>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email adres</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="jouw@email.nl"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition disabled:opacity-50"
          >
            {loading ? 'Bezig met versturen...' : 'Stuur Magic Link'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-center text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}