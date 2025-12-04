'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' of 'code'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Stap 1: Code aanvragen
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      setMessage('Er ging iets mis: ' + error.message)
      setLoading(false)
    } else {
      setStep('code') // Ga naar de volgende stap
      setLoading(false)
    }
  }

  // Stap 2: Code controleren
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error) {
      setMessage('Foute code of verlopen. Probeer het opnieuw.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-20">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
            {step === 'email' ? 'Inloggen' : 'Code invullen'}
        </h2>
        
        {step === 'email' ? (
            // STAP 1: EMAIL
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
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
                {loading ? 'Bezig...' : 'Stuur code'}
              </button>
            </form>
        ) : (
            // STAP 2: CODE (Aangepast naar max 8 tekens)
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-800 dark:text-blue-200 mb-2">
                We hebben een code gestuurd naar <strong>{email}</strong>.
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jouw code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="123456"
                  maxLength={8} // <--- HIER AANGEPAST NAAR 8
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition disabled:opacity-50"
              >
                {loading ? 'Controleren...' : 'Verifieer Code'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="text-sm text-gray-500 underline mt-2"
              >
                Terug / Ander emailadres
              </button>
            </form>
        )}

        {message && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-center text-sm border border-red-100 dark:border-red-800">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}