'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'

interface RunCardProps {
  run: any
  currentUserId: string | undefined
  isCompactView?: boolean
  isHighlighted?: boolean
}

export default function RunCard({ run, currentUserId, isCompactView = false, isHighlighted = false }: RunCardProps) {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const isOrganizer = currentUserId === run.organizer_id

  useEffect(() => {
    fetchParticipants()
    
    if (isHighlighted) {
        setIsExpanded(true)
        setTimeout(() => {
            cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 500)
    }
  }, [isHighlighted])

  async function fetchParticipants() {
    const { data } = await supabase.from('participants').select('user_id, profiles(full_name)').eq('run_id', run.id)
    if (data) {
      setParticipants(data)
      setIsJoined(data.some((p: any) => p.user_id === currentUserId))
    }
  }

  const hasOtherParticipants = participants.some(p => p.user_id !== run.organizer_id)

  async function toggleParticipation() {
    if (!currentUserId) {
        // Gebruikt de modale pop-up
        setShowLoginModal(true)
        return
    }

    setLoading(true)
    if (isJoined) {
      await supabase.from('participants').delete().eq('run_id', run.id).eq('user_id', currentUserId)
    } else {
      await supabase.from('participants').insert({ run_id: run.id, user_id: currentUserId })
    }
    await fetchParticipants()
    setLoading(false)
  }

  async function deleteRun() {
    if (!confirm(lang === 'de' ? 'Sind Sie sicher, dass Sie diesen Lauf löschen möchten?' : 'Weet je zeker dat je dit loopje wilt verwijderen?')) return
    const { error } = await supabase.from('runs').delete().eq('id', run.id)
    if (!error) router.refresh()
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation() 
    const shareUrl = `${window.location.origin}/share/${run.id}`
    const shareText = run.is_race ? `🏆 Doe mee met ${run.title}!` : `🏃 Ren mee in ${run.location}!`

    if (navigator.share) {
        try { await navigator.share({ title: 'Social Run', text: shareText, url: shareUrl }) } catch (err) {}
    } else {
        navigator.clipboard.writeText(shareUrl)
        alert('Link gekopieerd!')
    }
  }

  const formatDatum = (datumString: string, short = false) => {
    const datum = new Date(datumString)
    if (short) return datum.toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', { weekday: 'short', day: '2-digit', month: 'short' })
    return datum.toLocaleDateString(lang === 'de' ? 'de-DE' : 'nl-NL', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  }
  
  const formatTijd = (datumString: string) => {
      return new Date(datumString).toLocaleTimeString(lang === 'de' ? 'de-DE' : 'nl-NL', { hour: '2-digit', minute: '2-digit' })
  }

  const isRace = run.is_race
  const isWomenOnly = run.women_only
  
  let cardBorderClass = isRace 
    ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/10' 
    : isWomenOnly 
    ? 'border-pink-400 dark:border-pink-600 bg-pink-50/50 dark:bg-pink-900/10' 
    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
  
  if (isHighlighted) {
      cardBorderClass = 'border-blue-500 ring-4 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/20'
  }

  const distanceDisplay = (isRace && run.race_distances) 
    ? run.race_distances.replace(/,/g, ' /').replace(/\./g, ',')
    : run.distance_km.toString().replace('.', ',')

  // MODAL COMPONENT (Binnen de RunCard)
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-gray-200 dark:border-gray-800">
        <p className="mb-6 font-medium text-lg">
          {t.card_join_login_prompt}
        </p>
        <div className="flex justify-around gap-4">
          <button 
            onClick={() => setShowLoginModal(false)} 
            className="px-4 py-2 text-sm rounded-full border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {lang === 'de' ? 'Abbrechen' : 'Nee'}
          </button>
          <button 
            onClick={() => router.push('/login')} 
            className="px-4 py-2 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {lang === 'de' ? 'Anmelden' : 'Ja, inloggen'}
          </button>
        </div>
      </div>
    </div>
  )

  // ... (rest of RunCard component)