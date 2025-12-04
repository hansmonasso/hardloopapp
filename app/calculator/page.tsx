'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CalculatorPage() {
  const [birthYear, setBirthYear] = useState('')
  const [weight, setWeight] = useState('')
  const [gender, setGender] = useState('man')
  
  // Huidige Vorm
  const [min5k, setMin5k] = useState('')
  const [sec5k, setSec5k] = useState('')
  
  // Hartslag
  const [restingHR, setRestingHR] = useState('') 
  const [maxHRInput, setMaxHRInput] = useState('')

  // Weer
  const [temp, setTemp] = useState('15') 

  // Reverse Calculator
  const [targetDist, setTargetDist] = useState('42.195')
  const [targetHrs, setTargetHrs] = useState('')
  const [targetMins, setTargetMins] = useState('')

  const [results, setResults] = useState<any>(null)
  const [reverseResults, setReverseResults] = useState<any>(null)

  const TARGET_DISTANCES = [5, 10, 15, 21.1, 25, 30, 42.195]

  // --- FORMATTERS ---
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = Math.floor(totalSeconds % 60)
    const m = mins.toString().padStart(2, '0')
    const s = secs.toString().padStart(2, '0')
    if (hrs > 0) return `${hrs}:${m}:${s}`
    return `${mins}:${s}`
  }

  const formatPace = (secondsPerKm: number) => {
    const mins = Math.floor(secondsPerKm / 60)
    const secs = Math.floor(secondsPerKm % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // --- REKENKERN ---
  const predictTime = (baseSeconds: number, baseDist: number, targetDist: number) => {
    return baseSeconds * Math.pow((targetDist / baseDist), 1.06)
  }

  const calculateVO2Max = (seconds5k: number) => {
    if (seconds5k === 0) return 0
    const minutes = seconds5k / 60
    const velocity = 5000 / minutes 
    const vo2 = (-4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity) / 
                (0.8 + 0.1894393 * Math.exp(-0.012778 * minutes) + 0.2989558 * Math.exp(-0.1932605 * minutes))
    return Math.round(vo2 * 10) / 10 
  }

  const getWeatherFactor = (degrees: number) => {
    const ideal = 12
    if (degrees <= ideal) return 1
    const diff = degrees - ideal
    return 1 + (diff * 0.003) 
  }

  // --- HOOFD BEREKENING ---
  const calculate = (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalSeconds5k = (parseInt(min5k || '0') * 60) + parseInt(sec5k || '0')
    if (totalSeconds5k === 0) return alert("Vul een geldige 5km tijd in")
    
    const currentWeight = parseFloat(weight)
    const age = new Date().getFullYear() - parseInt(birthYear)
    const weatherFactor = getWeatherFactor(parseFloat(temp))

    // 1. Race Voorspellingen
    const predictions = TARGET_DISTANCES.map(dist => {
        let time = predictTime(totalSeconds5k, 5, dist)
        time = time * weatherFactor
        return {
            dist: dist,
            time: formatTime(time),
            pace: formatPace(time / dist)
        }
    })

    // 2. Trainingstempo's
    const pace5k = totalSeconds5k / 5 
    const trainingPaces = [
        { name: 'Herstel (Easy)', desc: 'Rustig, kletstempo', pace: formatPace(pace5k * 1.35) },
        { name: 'Duurloop (Long)', desc: 'Comfortabel', pace: formatPace(pace5k * 1.25) },
        { name: 'Marathon Tempo', desc: 'Stabiel', pace: formatPace(pace5k * 1.15) },
        { name: 'Drempel (Threshold)', desc: 'Comfortabel hard', pace: formatPace(pace5k * 1.08) },
        { name: 'Interval (VO2max)', desc: '1km of 4min herhalingen', pace: formatPace(pace5k * 0.95) },
        { name: 'Repetities (Speed)', desc: '200m/400m sprints', pace: formatPace(pace5k * 0.88) },
    ]

    // 3. Energie (De Chocolade Index)
    const kcalPerKm = currentWeight * 1.036
    const snacks = TARGET_DISTANCES.map(dist => {
        const totalKcal = Math.round(dist * kcalPerKm)
        // 100g chocolade = ~540 kcal
        const chocolade = (totalKcal / 540).toFixed(1) 
        // 1 banaan = ~100 kcal
        const bananen = (totalKcal / 100).toFixed(1) 
        return { dist, totalKcal, chocolade, bananen }
    }).filter(s => s.dist === 10 || s.dist === 21.1 || s.dist === 42.195) 

    // 4. Overig
    const vo2max = calculateVO2Max(totalSeconds5k)
    const rhr = restingHR ? parseInt(restingHR) : null 
    const maxHR = maxHRInput ? parseInt(maxHRInput) : (220 - age)
    
    // Gewicht
    const weightRows = []
    for (let change = -5; change <= 5; change++) {
        if (change === 0) continue; 
        const newWeight = currentWeight + change
        const factor = Math.pow(newWeight / currentWeight, 0.732)
        const new5k = totalSeconds5k * factor
        const newHM = predictTime(new5k, 5, 21.1)
        const newM = predictTime(new5k, 5, 42.195)
        
        const curHM = predictTime(totalSeconds5k, 5, 21.1)
        const curM = predictTime(totalSeconds5k, 5, 42.195)

        weightRows.push({
            change,
            newWeight,
            diff5k: formatTime(Math.abs(totalSeconds5k - new5k)),
            diffHM: formatTime(Math.abs(curHM - newHM)),
            diffM: formatTime(Math.abs(curM - newM)),
            faster: change < 0 
        })
    }

    // Hartslag Zones
    const zoneDefinitions = [
        { name: 'Z1 (Herstel)', minPct: 0.50, maxPct: 0.60, desc: 'Warming up, cooling down' },
        { name: 'Z2 (Duur)', minPct: 0.60, maxPct: 0.70, desc: 'Rustig, vetverbranding' },
        { name: 'Z3 (Aerobe)', minPct: 0.70, maxPct: 0.80, desc: 'Gemiddeld, werken aan conditie' },
        { name: 'Z4 (Drempel)', minPct: 0.80, maxPct: 0.90, desc: 'Zwaar, anaeroob drempel' },
        { name: 'Z5 (Maximaal)', minPct: 0.90, maxPct: 1.00, desc: 'Sprint, intervallen, uitputting' },
    ]

    const trainingZones = zoneDefinitions.map(z => {
        let minBPM, maxBPM
        if (rhr) {
            const reserve = maxHR - rhr
            minBPM = Math.round((reserve * z.minPct) + rhr)
            maxBPM = Math.round((reserve * z.maxPct) + rhr)
        } else {
            minBPM = Math.round(maxHR * z.minPct)
            maxBPM = Math.round(maxHR * z.maxPct)
        }
        return { ...z, range: `${minBPM} - ${maxBPM}` }
    })

    setResults({
        predictions,
        trainingPaces,
        snacks,
        vo2max,
        weightRows,
        heartRate: { maxHR, rhr, zones: trainingZones }
    })
  }

  // --- REVERSE CALCULATOR ---
  const calculateReverse = () => {
    const targetSec = (parseInt(targetHrs || '0') * 3600) + (parseInt(targetMins || '0') * 60)
    if (targetSec === 0) return
    const dist = parseFloat(targetDist)
    const req5kSeconds = targetSec / Math.pow((dist / 5), 1.06)
    
    setReverseResults({
        req5k: formatTime(req5kSeconds),
        reqPace: formatPace(req5kSeconds / 5), 
        targetPace: formatPace(targetSec / dist) 
    })
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">🏃 Race Calculator</h1>
            <Link href="/" className="text-sm underline text-gray-500 hover:text-black dark:hover:text-white">Terug naar home</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* INPUT KOLOM */}
            <div className="lg:col-span-4 space-y-6">
                <form onSubmit={calculate} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                    <h2 className="font-bold text-lg mb-4">Jouw Profiel</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Geb. Jaar</label><input required type="number" placeholder="1990" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className="w-full p-2 rounded border bg-transparent" /></div>
                        <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Gewicht (kg)</label><input required type="number" placeholder="75" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 rounded border bg-transparent" /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Rust Hartslag</label><input type="number" placeholder="Optioneel" value={restingHR} onChange={(e) => setRestingHR(e.target.value)} className="w-full p-2 rounded border bg-transparent text-sm" /></div>
                        <div><label className="block text-xs font-bold uppercase text-gray-500 mb-1">Max Hartslag</label><input type="number" placeholder="Optioneel" value={maxHRInput} onChange={(e) => setMaxHRInput(e.target.value)} className="w-full p-2 rounded border bg-transparent text-sm" /></div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Huidige 5 km tijd</label>
                        <div className="flex gap-2 items-center">
                            <input required type="number" placeholder="25" value={min5k} onChange={(e) => setMin5k(e.target.value)} className="w-full p-2 rounded border bg-transparent text-center font-mono" />
                            <span className="font-bold">:</span>
                            <input required type="number" placeholder="00" value={sec5k} onChange={(e) => setSec5k(e.target.value)} className="w-full p-2 rounded border bg-transparent text-center font-mono" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1 flex justify-between">
                            <span>Verwachte Temperatuur</span>
                            <span className="text-blue-600">{temp}°C</span>
                        </label>
                        <input type="range" min="0" max="35" step="1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <p className="text-[10px] text-gray-400 mt-1">Hitte maakt je langzamer (boven 12°C)</p>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4">Bereken Alles</button>
                </form>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">🎯 Doelen Steller</h3>
                    <div className="space-y-3">
                        <select value={targetDist} onChange={(e) => setTargetDist(e.target.value)} className="w-full p-2 rounded border bg-white dark:bg-black/20 text-sm">
                            <option value="10">10 kilometer</option>
                            <option value="21.1">Halve Marathon</option>
                            <option value="42.195">Marathon</option>
                        </select>
                        <div className="flex gap-2 items-center">
                            <input type="number" placeholder="Uur" value={targetHrs} onChange={(e) => setTargetHrs(e.target.value)} className="w-full p-2 rounded border bg-white dark:bg-black/20 text-center font-mono text-sm" />
                            <span className="font-bold">:</span>
                            <input type="number" placeholder="Min" value={targetMins} onChange={(e) => setTargetMins(e.target.value)} className="w-full p-2 rounded border bg-white dark:bg-black/20 text-center font-mono text-sm" />
                        </div>
                        <button onClick={calculateReverse} className="w-full bg-black text-white dark:bg-white dark:text-black py-2 rounded text-sm font-bold">Bereken Vereiste 5km</button>
                    </div>
                    {reverseResults && (
                        <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm">
                            <p className="mb-1 font-bold text-yellow-800 dark:text-yellow-500">Om dit te halen moet je:</p>
                            <ul className="list-disc ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                                <li>Een 5km kunnen lopen in <strong>{reverseResults.req5k}</strong></li>
                                <li>Tempo doel: <strong>{reverseResults.targetPace}</strong> min/km</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* RESULTATEN KOLOM */}
            <div className="lg:col-span-8 space-y-6">
                {!results ? (
                    <div className="h-full flex items-center justify-center text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 min-h-[300px]">Vul je gegevens in om de uitgebreide analyse te zien.</div>
                ) : (
                    <>  
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
                            <div><h3 className="font-bold text-lg opacity-90">Jouw Geschatte VO2max</h3><p className="text-sm opacity-75">Gebaseerd op je 5km tijd</p></div>
                            <div className="text-5xl font-black tracking-tighter">{results.vo2max}</div>
                        </div>

                        {/* HARTSLAG ZONES */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 border-b border-red-100 dark:border-red-800 flex justify-between items-center">
                                <h3 className="font-bold text-red-800 dark:text-red-200">❤️ Trainingszones</h3>
                                <span className="text-xs text-red-600 dark:text-red-300 font-mono">Max HR: {results.heartRate.maxHR} {results.heartRate.rhr ? `(Rust: ${results.heartRate.rhr})` : ''}</span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 uppercase text-xs border-b dark:border-gray-800"><tr><th className="px-4 py-2">Zone</th><th className="px-4 py-2">Hartslag (bpm)</th><th className="px-4 py-2 hidden sm:table-cell">Omschrijving</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{results.heartRate.zones.map((zone: any) => (<tr key={zone.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-2 font-bold">{zone.name}</td><td className="px-4 py-2 font-mono font-bold text-red-600 dark:text-red-400">{zone.range}</td><td className="px-4 py-2 text-gray-500 hidden sm:table-cell">{zone.desc}</td></tr>))}</tbody>
                            </table>
                        </div>

                        {/* TRAININGSTEMPO'S */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 border-b border-green-100 dark:border-green-800">
                                <h3 className="font-bold text-green-800 dark:text-green-200">🐢🚀 Jouw Trainingstempo's</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
                                {results.trainingPaces.map((tp: any) => (<div key={tp.name} className="p-4 text-center"><p className="text-xs font-bold uppercase text-gray-400 mb-1">{tp.name}</p><p className="text-2xl font-black text-gray-900 dark:text-white mb-1">{tp.pace}</p><p className="text-xs text-gray-500">{tp.desc}</p></div>))}
                            </div>
                        </div>

                        {/* PROGNOSES */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">⏱️ Verwachte Eindtijden</h3>
                                {parseFloat(temp) > 12 && <span className="text-xs text-red-500 font-bold flex items-center">🔥 Aangepast voor {temp}°C</span>}
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 uppercase text-xs border-b dark:border-gray-800"><tr><th className="px-4 py-2">Afstand</th><th className="px-4 py-2">Eindtijd</th><th className="px-4 py-2">Pace</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{results.predictions.map((row: any) => (<tr key={row.dist} className="hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="px-4 py-2 font-medium">{row.dist === 42.195 ? 'Marathon' : row.dist === 21.1 ? 'Halve Marathon' : row.dist + ' km'}</td><td className="px-4 py-2 font-bold font-mono">{row.time}</td><td className="px-4 py-2 text-gray-500 font-mono">{row.pace}</td></tr>))}</tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* GEWICHT */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">⚖️ Effect van Gewicht</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-gray-500 uppercase text-xs border-b dark:border-gray-800"><tr><th className="px-4 py-2">+/-</th><th className="px-4 py-2">Gewicht</th><th className="px-4 py-2">5 km</th><th className="px-4 py-2">HM</th><th className="px-4 py-2">M</th></tr></thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {results.weightRows.map((row: any) => (
                                                <tr key={row.change} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className={`px-4 py-2 font-bold ${row.faster ? 'text-green-600' : 'text-red-600'}`}>{row.change > 0 ? `+${row.change}` : row.change}</td>
                                                    <td className="px-4 py-2 text-gray-500">{Math.round(row.newWeight)} kg</td>
                                                    <td className="px-4 py-2 font-mono text-xs">{row.faster ? '-' : '+'}{row.diff5k}</td>
                                                    <td className="px-4 py-2 font-mono text-xs">{row.faster ? '-' : '+'}{row.diffHM}</td>
                                                    <td className="px-4 py-2 font-mono text-xs">{row.faster ? '-' : '+'}{row.diffM}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ENERGIE (CHOCOLADE) */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">🍔 Energieverbruik</h3>
                                <div className="space-y-4">
                                    {results.snacks.map((s: any) => (
                                        <div key={s.dist} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                                            <div>
                                                <p className="font-bold text-sm">{s.dist === 42.195 ? 'Marathon' : s.dist === 21.1 ? 'Halve M.' : s.dist + ' km'}</p>
                                                <p className="text-xs text-gray-500">{s.totalKcal} kcal</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-amber-800 dark:text-amber-600">{s.chocolade} x 100g chocolade</span>
                                                <span className="text-xs text-yellow-600">of {s.bananen} bananen</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}