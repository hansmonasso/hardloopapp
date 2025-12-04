'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TrainingPage() {
  // --- STATE ---
  const [min5k, setMin5k] = useState('25') // Standaard 25 min
  const [sec5k, setSec5k] = useState('00')
  const [activePlan, setActivePlan] = useState('5k') // '5k' of '10k'
  
  // --- LOGICA ---
  // Hulpfunctie: Bereken tempo in min/km
  const getPace = (factor: number) => {
    const totalSeconds = (parseInt(min5k || '0') * 60) + parseInt(sec5k || '0')
    if (totalSeconds === 0) return "00:00"
    
    // Bereken target pace per km
    // Formule: Huidige 5k pace * factor
    // Factor > 1 is langzamer (duurloop), < 1 is sneller (interval)
    const pace5k = totalSeconds / 5
    const targetPaceSeconds = pace5k * factor
    
    const m = Math.floor(targetPaceSeconds / 60)
    const s = Math.floor(targetPaceSeconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // --- DE SCHEMA'S (DATA) ---
  // Hier kun je later makkelijk weken aan toevoegen
  const plans = {
    '5k': {
        title: "Start to Run (0 naar 5km)",
        description: "In 8 weken van de bank naar een onafgebroken 5 kilometer.",
        weeks: [
            { id: 1, desc: "Wennen aan bewegen", sessions: [
                { type: "Wandelen/Joggen", detail: "8x (1 min joggen, 2 min wandelen)", pace: "Rustig" },
                { type: "Wandelen/Joggen", detail: "6x (2 min joggen, 2 min wandelen)", pace: "Rustig" },
                { type: "Duurloopje", detail: "15 min stevig doorwandelen", pace: "Wandel" }
            ]},
            { id: 2, desc: "De eerste stapjes", sessions: [
                { type: "Wandelen/Joggen", detail: "5x (3 min joggen, 2 min wandelen)", pace: "Rustig" },
                { type: "Wandelen/Joggen", detail: "4x (4 min joggen, 2 min wandelen)", pace: "Rustig" },
                { type: "Duurloopje", detail: "20 min afwisselend jog/wandel", pace: "Eigen inzicht" }
            ]},
            // ... je kunt dit zelf uitbreiden ...
            { id: 8, desc: "De Finale", sessions: [
                { type: "Herstel", detail: "20 min joggen", pace: getPace(1.3) },
                { type: "Prikkel", detail: "2 km joggen, 5 min wandelen", pace: getPace(1.2) },
                { type: "WEDSTRIJD", detail: "5 KM AANEEN!", pace: getPace(1.0) } // Wedstrijdtempo
            ]},
        ]
    },
    '10k': {
        title: "Door naar de 10km",
        description: "Voor lopers die de 5km al onder de knie hebben.",
        weeks: [
            { id: 1, desc: "Volume opbouwen", sessions: [
                { type: "Duurloop", detail: "5 km rustig", pace: getPace(1.35) }, // Easy pace
                { type: "Interval", detail: "6x 400m snel (2 min rust)", pace: getPace(0.95) }, // Interval pace
                { type: "Duurloop", detail: "7 km rustig", pace: getPace(1.35) }
            ]},
            { id: 2, desc: "Snelheid maken", sessions: [
                { type: "Herstel", detail: "4 km heel rustig", pace: getPace(1.45) },
                { type: "Tempo", detail: "3 km op tempo", pace: getPace(1.10) }, // Tempo run
                { type: "Duurloop", detail: "8 km rustig", pace: getPace(1.35) }
            ]},
             // ... etc ...
             { id: 8, desc: "Taper & Race", sessions: [
                { type: "Loslopen", detail: "30 min heel rustig", pace: getPace(1.40) },
                { type: "Prikkel", detail: "2 km wedstrijdtempo", pace: getPace(1.05) }, 
                { type: "WEDSTRIJD", detail: "10 KM KNALLEN!", pace: getPace(1.05) } // 10k is iets langzamer dan 5k pace
            ]},
        ]
    }
  }

  // @ts-ignore
  const currentPlan = plans[activePlan]

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">📅 Trainingsschema's</h1>
            <Link href="/" className="text-sm underline text-gray-500 hover:text-black dark:hover:text-white">Terug naar home</Link>
        </div>

        {/* INPUT SECTIE - HET UNIEKE ELEMENT */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-8">
            <h2 className="font-bold text-lg mb-2 text-blue-900 dark:text-blue-100">⚙️ Personaliseer je schema</h2>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Vul je huidige 5km tijd in. Wij rekenen uit hoe hard je moet lopen tijdens de trainingen.
            </p>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Mijn 5km tijd:</span>
                <input type="number" value={min5k} onChange={(e) => setMin5k(e.target.value)} className="w-16 p-2 rounded border text-center" placeholder="25" />
                <span className="font-bold">:</span>
                <input type="number" value={sec5k} onChange={(e) => setSec5k(e.target.value)} className="w-16 p-2 rounded border text-center" placeholder="00" />
            </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-1">
            <button 
                onClick={() => setActivePlan('5k')}
                className={`pb-2 px-4 font-bold transition ${activePlan === '5k' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
                0 naar 5 km
            </button>
            <button 
                onClick={() => setActivePlan('10k')}
                className={`pb-2 px-4 font-bold transition ${activePlan === '10k' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
                5 naar 10 km
            </button>
        </div>

        {/* HET SCHEMA */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4">
                <h2 className="text-2xl font-black">{currentPlan.title}</h2>
                <p className="text-gray-500">{currentPlan.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {currentPlan.weeks.map((week: any) => (
                    <div key={week.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        {/* Week Header */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Week {week.id}</h3>
                            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 bg-white dark:bg-black/20 px-2 py-1 rounded">
                                {week.desc}
                            </span>
                        </div>
                        
                        {/* Sessies */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {week.sessions.map((session: any, idx: number) => (
                                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icoontje op basis van type */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl
                                            ${session.type.includes('Duur') ? 'bg-green-100 text-green-600' : ''}
                                            ${session.type.includes('Interval') ? 'bg-red-100 text-red-600' : ''}
                                            ${session.type.includes('Wandel') ? 'bg-yellow-100 text-yellow-600' : ''}
                                            ${session.type.includes('Tempo') ? 'bg-orange-100 text-orange-600' : ''}
                                            ${session.type.includes('WEDSTRIJD') ? 'bg-purple-100 text-purple-600' : ''}
                                            ${!session.type.match(/Duur|Interval|Wandel|Tempo|WEDSTRIJD/) ? 'bg-gray-100 text-gray-600' : ''}
                                        `}>
                                            {session.type.includes('Duur') && '🐢'}
                                            {session.type.includes('Interval') && '🐇'}
                                            {session.type.includes('Wandel') && '🚶'}
                                            {session.type.includes('Tempo') && '⚡'}
                                            {session.type.includes('WEDSTRIJD') && '🏆'}
                                            {!session.type.match(/Duur|Interval|Wandel|Tempo|WEDSTRIJD/) && '👟'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{session.type}</p>
                                            <p className="text-gray-600 dark:text-gray-300">{session.detail}</p>
                                        </div>
                                    </div>
                                    
                                    {/* HET PERSOONLIJKE ELEMENT: DE PACE */}
                                    <div className="text-right pl-4 border-l border-gray-100 dark:border-gray-800 min-w-[100px]">
                                        <span className="block text-xs text-gray-400 uppercase font-bold">Tempo</span>
                                        <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                                            {session.pace}
                                        </span>
                                        {session.pace.includes(':') && <span className="text-xs text-gray-400"> min/km</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  )
}