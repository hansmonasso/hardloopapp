'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'

export default function LoginPage() {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' of 'code'
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Hulpfunctie voor vertaling van fouten
  const translateError = (key: string) => {
    switch (key) {
      case 'code_send_error':
        return lang === 'de' ? 'Fehler beim Senden des Codes. Überprüfen Sie Ihre E-Mail.' : (lang === 'en' ? 'Error sending code. Check your email.' : 'Fout bij het versturen van de code. Controleer je mailadres.')
      case 'verify_error':
        return lang === 'de' ? 'Falsche Code oder abgelaufen. Bitte erneut versuchen.' : (lang === 'en' ? 'Wrong code or expired. Please try again.' : 'Foute code of verlopen. Probeer het opnieuw.')
      case 'email_label':
        return lang === 'de' ? 'E-Mail Adresse' : (lang === 'en' ? 'Email Address' : 'Email adres')
      case 'code_label':
        return lang === 'de' ? 'Ihr Anmeldecode' : (lang === 'en' ? 'Your Login Code' : 'Jouw Inlogcode')
      case 'code_sent_to':
        return lang === 'de' ? `Wir haben einen Code an ${email} gesendet.` : (lang === 'en' ? `We sent a code to ${email}.` : `We hebben een code gestuurd naar ${email}.`)
      case 'send_btn':
        return lang === 'de' ? 'Code senden' : (lang === 'en' ? 'Send Code' : 'Stuur code')
      case 'verify_btn':
        return lang === 'de' ? 'Code überprüfen' : (lang === 'en' ? 'Verify Code' : 'Verifieer Code')
      case 'back_btn':
        return lang === 'de' ? 'Zurück / Andere E-Mail' : (lang === 'en' ? 'Back / Different Email' : 'Terug / Ander emailadres')
      default:
        return 'Er ging iets mis.'
    }
  }


  // Stap 1: Code aanvragen
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      setMessage(translateError('code_send_error'))
      setLoading(false)
    } else {
      setStep('code')
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
      setMessage(translateError('verify_error'))
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const submitBtnText = loading 
    ? (lang === 'de' ? 'Bezig...' : 'Bezig...') 
    : (step === 'email' ? translateError('send_btn') : translateError('verify_btn'))

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-20">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
            {step === 'email' ? t.login_btn : (lang === 'de' ? 'Code eingeben' : 'Code invullen')}
        </h2>
        
        {step === 'email' ? (
            // STAP 1: EMAIL
            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{translateError('email_label')}</label>
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
                {submitBtnText}
              </button>
            </form>
        ) : (
            // STAP 2: CODE
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-800 dark:text-blue-200 mb-2">
                {translateError('code_sent_to')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{translateError('code_label')}</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="12345678" 
                  maxLength={8} 
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white dark:bg-white dark:text-black p-3 rounded-lg font-bold hover:opacity-80 transition disabled:opacity-50"
              >
                {submitBtnText}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="text-sm text-gray-500 underline mt-2"
              >
                {translateError('back_btn')}
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