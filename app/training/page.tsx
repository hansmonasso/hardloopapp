'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'

export default function TrainingPage() {
  const { t, lang } = useLanguage()
  const [min5k, setMin5k] = useState('25')
  const [sec5k, setSec5k] = useState('00')
  const [activePlan, setActivePlan] = useState('5k')
  
  const getPace = (factor: number) => {
    const totalSeconds = (parseInt(min5k || '0') * 60) + parseInt(sec5k || '0')
    if (totalSeconds === 0) return "00:00"
    
    const pace5k = totalSeconds / 5
    const targetPaceSeconds = pace5k * factor
    
    const m = Math.floor(targetPaceSeconds / 60)
    const s = Math.floor(targetPaceSeconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Vertalingen voor dynamische teksten
  const trans = (key: string, nl: string, en: string, de: string) => {
      if (lang === 'en') return en;
      if (lang === 'de') return de;
      return nl;
  }

  const plans = {
    '5k': {
        title: trans('5k_title', "Start to Run (0 naar 5km)", "Start to Run (0 to 5km)", "Starten mit Laufen (0 bis 5km)"),
        description: trans('5k_desc', "In 8 weken van de bank naar een onafgebroken 5 kilometer.", "From zero to a continuous 5km run in 8 weeks.", "In 8 Wochen vom Sofa zu 5 Kilometern am Stück."),
        weeks: [
            { id: 1, desc: trans('w1_desc', "Wennen aan bewegen", "Getting used to movement", "An die Bewegung gewöhnen"), sessions: [
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w1_d1', "8x (1 min joggen, 2 min wandelen)", "8x (1 min jog, 2 min walk)", "8x (1 min laufen, 2 min gehen)"), pace: trans('pace_easy', "Rustig", "Easy", "Ruhig") },
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w1_d2', "6x (2 min joggen, 2 min wandelen)", "6x (2 min jog, 2 min walk)", "6x (2 min laufen, 2 min gehen)"), pace: trans('pace_easy', "Rustig", "Easy", "Ruhig") },
                { type: trans('type_walk', "Duurloopje", "Endurance Walk", "Dauerlauf"), detail: trans('w1_d3', "15 min stevig doorwandelen", "15 min brisk walking", "15 min zügiges Gehen"), pace: trans('pace_walk', "Wandel", "Walk", "Geh-Tempo") }
            ]},
            { id: 2, desc: trans('w2_desc', "De eerste stapjes", "The first steps", "Die ersten Schritte"), sessions: [
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w2_d1', "5x (3 min joggen, 3 min wandelen)", "5x (3 min jog, 3 min walk)", "5x (3 min laufen, 3 min gehen)"), pace: trans('pace_easy', "Rustig", "Easy", "Ruhig") },
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w2_d2', "4x (4 min joggen, 3 min wandelen)", "4x (4 min jog, 3 min walk)", "4x (4 min laufen, 3 min gehen)"), pace: trans('pace_easy', "Rustig", "Easy", "Ruhig") },
                { type: trans('type_endurance', "Duurloopje", "Endurance Run", "Dauerlauf"), detail: trans('w2_d3', "20 min afwisselend jog/wandel", "20 min alternating jog/walk", "20 min abwechselnd laufen/gehen"), pace: trans('pace_self', "Eigen inzicht", "Self-paced", "Eigeneinschätzung") }
            ]},
            { id: 3, desc: trans('w3_desc', "Langere blokken", "Longer blocks", "Längere Blöcke"), sessions: [
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w3_d1', "4x (5 min joggen, 2 min wandelen)", "4x (5 min jog, 2 min walk)", "4x (5 min laufen, 2 min gehen)"), pace: trans('pace_easy', "Rustig", "Easy", "Ruhig") },
                { type: "Wandelen/Joggen", detail: trans('w3_d2', "3x (6 min joggen, 3 min wandelen)", "3x (6 min jog, 3 min walk)", "3x (6 min laufen, 3 min gehen)"), pace: trans('pace_easy', "Rustig", "Easy", "Ruhig") },
                { type: trans('type_endurance', "Duurloopje", "Endurance Run", "Dauerlauf"), detail: trans('w3_d3', "25 min afwisselend", "25 min alternating", "25 min abwechselnd"), pace: trans('pace_easy', "Rustig", "Easy", "Ruhig") }
            ]},
            { id: 4, desc: trans('w4_desc', "Halverwege!", "Halfway there!", "Halbzeit!"), sessions: [
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w4_d1', "3x (7 min joggen, 2 min wandelen)", "3x (7 min jog, 2 min walk)", "3x (7 min laufen, 2 min gehen)"), pace: getPace(1.4) },
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w4_d2', "2x (8 min joggen, 3 min wandelen)", "2x (8 min jog, 3 min walk)", "2x (8 min laufen, 3 min gehen)"), pace: getPace(1.4) },
                { type: trans('type_endurance', "Duurloopje", "Endurance Run", "Dauerlauf"), detail: trans('w4_d3', "15 min joggen aan één stuk", "15 min continuous jog", "15 min durchgehend laufen"), pace: getPace(1.5) }
            ]},
            { id: 5, desc: trans('w5_desc', "10 minuten grens", "10 minute barrier", "10 Minuten Grenze"), sessions: [
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w5_d1', "2x (10 min joggen, 3 min wandelen)", "2x (10 min jog, 3 min walk)", "2x (10 min laufen, 3 min gehen)"), pace: getPace(1.35) },
                { type: trans('type_jog', "Wandelen/Joggen", "Walk/Jog", "Gehen/Laufen"), detail: trans('w5_d2', "3x (8 min joggen, 2 min wandelen)", "3x (8 min jog, 2 min walk)", "3x (8 min laufen, 2 min gehen)"), pace: getPace(1.35) },
                { type: trans('type_endurance', "Duurloopje", "Endurance Run", "Dauerlauf"), detail: trans('w5_d3', "20 min joggen (wandelpauze mag)", "20 min jog (walk break optional)", "20 min laufen (Gehpause optional)"), pace: getPace(1.45) }
            ]},
            { id: 6, desc: trans('w6_desc', "Kilometers maken", "Making Kilometers", "Kilometer sammeln"), sessions: [
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('w6_d1', "15 min joggen, 2 min wandel, 10 min joggen", "15 min jog, 2 min walk, 10 min jog", "15 min laufen, 2 min gehen, 10 min laufen"), pace: getPace(1.3) },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('w6_d2', "20 min joggen aaneen", "20 min continuous jog", "20 min durchgehend laufen"), pace: getPace(1.3) },
                { type: "Duurloop", detail: trans('w6_d3', "3 km rustig", "3 km easy", "3 km ruhig"), pace: getPace(1.4) }
            ]},
            { id: 7, desc: trans('w7_desc', "Bijna daar", "Almost there", "Fast geschafft"), sessions: [
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('w7_d1', "25 min joggen aaneen", "25 min continuous jog", "25 min durchgehend laufen"), pace: getPace(1.3) },
                { type: trans('type_interval', "Interval", "Interval", "Intervall"), detail: trans('w7_d2', "5x 2 min vlot, 2 min rustig", "5x 2 min fast, 2 min slow", "5x 2 min zügig, 2 min ruhig"), pace: getPace(1.1) },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('w7_d3', "4 km rustig", "4 km easy", "4 km ruhig"), pace: getPace(1.35) }
            ]},
            { id: 8, desc: trans('w8_desc', "De Finale", "The Final Race", "Das Finale"), sessions: [
                { type: trans('type_recovery', "Herstel", "Recovery", "Erholung"), detail: trans('w8_d1', "20 min loslopen", "20 min light jog", "20 min locker laufen"), pace: getPace(1.3) },
                { type: trans('type_boost', "Prikkel", "Boost", "Antritt"), detail: trans('w8_d2', "2 km joggen, 5 min wandelen", "2 km jog, 5 min walk", "2 km laufen, 5 min gehen"), pace: getPace(1.2) },
                { type: trans('type_race', "WEDSTRIJD", "RACE", "WETTKAMPF"), detail: trans('w8_d3', "5 KM AANEEN!", "5 KM CONTINUOUS!", "5 KM DURCHGEHEND!"), pace: getPace(1.0) }
            ]},
        ]
    },
    '10k': {
        title: trans('10k_title', "Door naar de 10km", "Moving on to 10km", "Weiter zum 10 km Lauf"),
        description: trans('10k_desc', "Voor lopers die de 5km al onder de knie hebben.", "For runners who have already mastered the 5km.", "Für Läufer, die 5 km bereits beherrschen."),
        weeks: [
            { id: 1, desc: trans('10k_w1_desc', "Volume opbouwen", "Building Volume", "Volumen aufbauen"), sessions: [
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w1_d1', "5 km rustig", "5 km easy", "5 km ruhig"), pace: getPace(1.35) },
                { type: trans('type_interval', "Interval", "Interval", "Intervall"), detail: trans('10k_w1_d2', "6x 400m snel (2 min rust)", "6x 400m fast (2 min rest)", "6x 400m schnell (2 min Pause)"), pace: getPace(0.95) },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w1_d3', "6 km rustig", "6 km easy", "6 km ruhig"), pace: getPace(1.35) }
            ]},
            { id: 2, desc: trans('10k_w2_desc', "Snelheid maken", "Gaining Speed", "Geschwindigkeit aufbauen"), sessions: [
                { type: trans('type_recovery', "Herstel", "Recovery", "Erholung"), detail: trans('10k_w2_d1', "4 km heel rustig", "4 km very easy", "4 km sehr ruhig"), pace: getPace(1.45) },
                { type: trans('type_tempo', "Tempo", "Tempo", "Tempo"), detail: trans('10k_w2_d2', "3 km op tempo", "3 km at tempo pace", "3 km im Tempo"), pace: getPace(1.10) },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w2_d3', "7 km rustig", "7 km easy", "7 km ruhig"), pace: getPace(1.35) }
            ]},
            { id: 3, desc: trans('10k_w3_desc', "Uithoudingsvermogen", "Stamina", "Ausdauer"), sessions: [
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w3_d1', "6 km rustig", "6 km easy", "6 km ruhig"), pace: getPace(1.35) },
                { type: trans('type_interval', "Interval", "Interval", "Intervall"), detail: trans('10k_w3_d2', "4x 800m snel (3 min rust)", "4x 800m fast (3 min rest)", "4x 800m schnell (3 min Pause)"), pace: getPace(0.95) },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w3_d3', "8 km rustig", "8 km easy", "8 km ruhig"), pace: getPace(1.35) }
            ]},
            { id: 4, desc: trans('10k_w4_desc', "Herstelweek", "Recovery Week", "Erholungswoche"), sessions: [
                { type: trans('type_recovery', "Herstel", "Recovery", "Erholung"), detail: trans('10k_w4_d1', "5 km rustig", "5 km easy", "5 km ruhig"), pace: getPace(1.45) },
                { type: "Fartlek", detail: trans('10k_w4_d2', "30 min met versnellingen", "30 min with accelerations", "30 min mit Beschleunigungen"), pace: trans('pace_feel', "Op gevoel", "By Feel", "Gefühl") },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w4_d3', "6 km rustig", "6 km easy", "6 km ruhig"), pace: getPace(1.40) }
            ]},
            { id: 5, desc: trans('10k_w5_desc', "Lange Duur", "Long Endurance", "Lange Ausdauer"), sessions: [
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w5_d1', "7 km rustig", "7 km easy", "7 km ruhig"), pace: getPace(1.35) },
                { type: trans('type_tempo', "Tempo", "Tempo", "Tempo"), detail: trans('10k_w5_d2', "4 km op tempo", "4 km at tempo pace", "4 km im Tempo"), pace: getPace(1.10) },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w5_d3', "9 km rustig", "9 km easy", "9 km ruhig"), pace: getPace(1.35) }
            ]},
            { id: 6, desc: trans('10k_w6_desc', "Zware Interval", "Heavy Interval", "Schwere Intervalle"), sessions: [
                { type: trans('type_recovery', "Herstel", "Recovery", "Erholung"), detail: trans('10k_w6_d1', "5 km rustig", "5 km easy", "5 km ruhig"), pace: getPace(1.45) },
                { type: trans('type_interval', "Interval", "Interval", "Intervall"), detail: trans('10k_w6_d2', "5x 1km (3 min rust)", "5x 1km (3 min rest)", "5x 1km (3 min Pause)"), pace: getPace(1.02) },
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w6_d3', "8 km rustig", "8 km easy", "8 km ruhig"), pace: getPace(1.35) }
            ]},
            { id: 7, desc: trans('10k_w7_desc', "Taperen", "Tapering", "Tapering"), sessions: [
                { type: trans('type_endurance', "Duurloop", "Endurance Run", "Dauerlauf"), detail: trans('10k_w7_d1', "6 km rustig", "6 km easy", "6 km ruhig"), pace: getPace(1.35) },
                { type: trans('type_boost', "Prikkel", "Boost", "Antritt"), detail: trans('10k_w7_d2', "3 km met 3 versnellingen", "3 km with 3 accelerations", "3 km mit 3 Beschleunigungen"), pace: getPace(1.15) },
                { type: trans('type_recovery', "Herstel", "Recovery", "Erholung"), detail: trans('10k_w7_d3', "4 km heel rustig", "4 km very easy", "4 km sehr ruhig"), pace: getPace(1.45) }
            ]},
             { id: 8, desc: trans('10k_w8_desc', "De Finale", "The Final Race", "Das Finale"), sessions: [
                { type: trans('type_recovery', "Loslopen", "Light Run", "Lockeres Laufen"), detail: trans('10k_w8_d1', "20 min heel rustig", "20 min very easy", "20 min sehr ruhig"), pace: getPace(1.40) },
                { type: trans('type_rest', "Rust", "Rest", "Ruhe"), detail: trans('10k_w8_d2', "Rustdag of wandelen", "Rest day or walk", "Ruhetag oder Spaziergang"), pace: "-" }, 
                { type: trans('type_race', "WEDSTRIJD", "RACE", "WETTKAMPF"), detail: trans('10k_w8_d3', "10 KM KNALLEN!", "10 KM HARD!", "10 KM VOLLGAS!"), pace: getPace(1.05) }
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
            <h1 className="text-3xl font-bold">📅 {lang === 'de' ? 'Trainingspläne' : (lang === 'en' ? 'Training Plans' : 'Trainingsschema\'s')}</h1>
            <Link href="/" className="text-sm underline text-gray-500 hover:text-black dark:hover:text-white">{trans('back_home', 'Terug naar home', 'Back to home', 'Zurück zur Startseite')}</Link>
        </div>

        {/* INPUT SECTIE - HET UNIEKE ELEMENT */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 mb-8">
            <h2 className="font-bold text-lg mb-2 text-blue-900 dark:text-blue-100">⚙️ {trans('personalize_title', 'Personaliseer je schema', 'Personalize your plan', 'Passen Sie Ihren Plan an')}</h2>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                {trans('personalize_desc', 'Vul je huidige 5km tijd in. Wij rekenen uit hoe hard je moet lopen tijdens de trainingen.', 'Enter your current 5k time. We calculate your required training pace.', 'Geben Sie Ihre aktuelle 5-km-Zeit ein. Wir berechnen Ihr erforderliches Trainingstempo.')}
            </p>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{trans('current_5k', 'Mijn 5km tijd:', 'My 5k time:', 'Meine 5km Zeit:')}</span>
                <input type="number" value={min5k} onChange={(e) => setMin5k(e.target.value)} className="w-16 p-2 rounded border text-center" placeholder="25" />
                <span className="font-bold">:</span>
                <input type="number" value={sec5k} onChange={(e) => setSec5k(e.target.value)} className="w-16 p-2 rounded border text-center" placeholder="00" />
            </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-1">
            <button onClick={() => setActivePlan('5k')} className={`pb-2 px-4 font-bold transition ${activePlan === '5k' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>0 {trans('to', 'naar', 'to', 'bis')} 5 km</button>
            <button onClick={() => setActivePlan('10k')} className={`pb-2 px-4 font-bold transition ${activePlan === '10k' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>5 {trans('to', 'naar', 'to', 'bis')} 10 km</button>
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
                            <h3 className="font-bold text-lg">{trans('week', 'Week', 'Week', 'Woche')} {week.id}</h3>
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
                                            ${session.type.includes('Duur') || session.type.includes('Endurance') || session.type.includes('Dauer') ? 'bg-green-100 text-green-600' : ''}
                                            ${session.type.includes('Interval') || session.type.includes('Intervall') ? 'bg-red-100 text-red-600' : ''}
                                            ${session.type.includes('Wandel') || session.type.includes('Walk') || session.type.includes('Geh-') ? 'bg-yellow-100 text-yellow-600' : ''}
                                            ${session.type.includes('Tempo') ? 'bg-orange-100 text-orange-600' : ''}
                                            ${session.type.includes('WEDSTRIJD') || session.type.includes('RACE') || session.type.includes('WETTKAMPF') ? 'bg-purple-100 text-purple-600' : ''}
                                            ${session.type.includes('Herstel') || session.type.includes('Recovery') || session.type.includes('Erholung') ? 'bg-gray-100 text-gray-600' : ''}
                                            ${session.type.includes('Rust') || session.type.includes('Rest') || session.type.includes('Ruhe') ? 'bg-gray-100 text-gray-600' : ''}
                                            ${!session.type.match(/Duur|Endurance|Dauer|Interval|Wandel|Walk|Geh-|Tempo|WEDSTRIJD|RACE|WETTKAMPF|Herstel|Recovery|Erholung|Rust|Rest|Ruhe/) ? 'bg-gray-100 text-gray-600' : ''}
                                        `}>
                                            {(session.type.includes('Duur') || session.type.includes('Endurance') || session.type.includes('Dauer')) && '🐢'}
                                            {(session.type.includes('Interval') || session.type.includes('Intervall')) && '🐇'}
                                            {(session.type.includes('Wandel') || session.type.includes('Walk') || session.type.includes('Geh-')) && '🚶'}
                                            {(session.type.includes('Tempo')) && '⚡'}
                                            {(session.type.includes('WEDSTRIJD') || session.type.includes('RACE') || session.type.includes('WETTKAMPF')) && '🏆'}
                                            {session.type.includes('Herstel') && '🛌'}
                                            {session.type.includes('Rust') && '☕'}
                                            {!(session.type.includes('Duur') || session.type.includes('Endurance') || session.type.includes('Dauer') || session.type.includes('Interval') || session.type.includes('Wandel') || session.type.includes('Walk') || session.type.includes('Geh-') || session.type.includes('Tempo') || session.type.includes('WEDSTRIJD') || session.type.includes('RACE') || session.type.includes('WETTKAMPF') || session.type.includes('Herstel') || session.type.includes('Recovery') || session.type.includes('Erholung') || session.type.includes('Rust') || session.type.includes('Rest') || session.type.includes('Ruhe')) && '👟'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{session.type}</p>
                                            <p className="text-gray-600 dark:text-gray-300">{session.detail}</p>
                                        </div>
                                    </div>
                                    
                                    {/* HET PERSOONLIJKE ELEMENT: DE PACE */}
                                    <div className="text-right pl-4 border-l border-gray-100 dark:border-gray-800 min-w-[100px]">
                                        <span className="block text-xs text-gray-400 uppercase font-bold">{trans('pace', 'Tempo', 'Pace', 'Tempo')}</span>
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