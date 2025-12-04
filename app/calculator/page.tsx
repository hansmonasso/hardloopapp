'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CalculatorPage() {
  const [birthYear, setBirthYear] = useState('')
  const [weight, setWeight] = useState('')
  const [restingHR, setRestingHR] = useState('') // NIEUW: Rusthartslag
  const [gender, setGender] = useState('man')
  const [min5k, setMin5k] = useState('')
  const [sec5k, setSec5k] = useState('')
  const [results, setResults] = useState<any>(null)

  const TARGET_DISTANCES = [10, 15, 21.1, 25, 30, 42.195]

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = Math.floor(totalSeconds % 60)
    const m = mins.toString().padStart(2, '0')
    const s = secs.toString().padStart(2, '0')
    if (hrs > 0) return `${hrs}:${m}:${s}`
    return `${mins}:${s}`
  }

  const formatPace = (totalSeconds: number, dist: number) => {
    const secondsPerKm = totalSeconds / dist
    const mins = Math.floor(secondsPerKm / 60)
    const secs = Math.floor(secondsPerKm % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const predictTime = (seconds5k: number, dist: number) => {
    return seconds5k * Math.pow((dist / 5), 1.06)
  }

  const calculateVO2Max = (seconds5k: number) => {
    if (seconds5k === 0) return 0
    const minutes = seconds5k / 60
    const velocity = 5000 / minutes 
    const vo2 = (-4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity) / 
                (0.8 + 0.1894393 * Math.exp(-0.012778 * minutes) + 0.2989558 * Math.exp(-0.1932605 * minutes))
    return Math.round(vo2 * 10) / 10 
  }

  const calculate = (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalSeconds5k = (parseInt(min5k || '0') * 60) + parseInt(sec5k || '0')
    if (totalSeconds5k === 0) return alert("Vul een geldige 5km tijd in")
    
    const currentWeight = parseFloat(weight)
    const age = new Date().getFullYear() - parseInt(birthYear)
    const rhr = restingHR ? parseInt(restingHR) : null // Rusthartslag

    // 1. Race Voorspellingen
    const predictions = TARGET_DISTANCES.map(dist => {
        const time = predictTime(totalSeconds5k, dist)
        return {
            dist: dist,
            time: formatTime(time),
            pace: formatPace(time, dist)
        }
    })

    // 2. VO2 Max
    const vo2max = calculateVO2Max(totalSeconds5k)

    // 3. Gewicht Analyse
    const weightRows = []
    for (let change = -5; change <= 5; change++) {
        if (change === 0) continue; 
        const newWeight = currentWeight + change
        const factor = Math.pow(newWeight / currentWeight, 0.732)
        const new5k = totalSeconds5k * factor
        const newHM = predictTime(new5k, 21.1)
        const newM = predictTime(new5k, 42.195)
        const curHM = predictTime(totalSeconds5k, 21.1)
        const curM = predictTime(totalSeconds5k, 42.195)

        weightRows.push({
            change,
            newWeight,
            diff5k: formatTime(Math.abs(totalSeconds5k - new5k)),
            diffHM: formatTime(Math.abs(curHM - newHM)),
            diffM: formatTime(Math.abs(curM - newM)),
            faster: change < 0 
        })
    }

    // 4. Leeftijdspotentieel
    let ageFactor = 1
    if (age > 28) { 
        const yearsPastPeak = age - 28
        ageFactor = 1 + (yearsPastPeak * 0.006) 
    }
    const potential5k = totalSeconds5k / ageFactor
    const potentialHM = predictTime(potential5k, 21.1)
    const potentialM = predictTime(potential5k, 42.195)

    // 5. NIEUW: Hartslag Zones
    const maxHR = 220 - age
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
            // Karvonen Formule: ((Max - Rust) * %) + Rust
            const reserve = maxHR - rhr
            minBPM = Math.round((reserve * z.minPct) + rhr)
            maxBPM = Math.round((reserve * z.maxPct) + rhr)
        } else {
            // Standaard Formule: Max * %
            minBPM = Math.round(maxHR * z.minPct)
            maxBPM = Math.round(maxHR * z.maxPct)
        }
        return { ...z, range: `${minBPM} - ${maxBPM}` }
    })

    setResults({
        predictions,
        vo2max,
        weightRows,
        ageAnalysis: {
            currentAge: age,
            potential5k: formatTime(potential5k),
            potentialHM: formatTime(potentialHM),
            potentialM: formatTime(potentialM),
            isPastPeak: age > 28
        },
        heartRate: {
            maxHR,
            rhr,
            zones: trainingZones
        }
    })
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">🏃 Race Calculator</h1>
            <Link href="/" className="text-sm underline text-gray-500 hover:text-black dark:hover:text-white">Terug naar home</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* INPUT KOLOM */}
            <div className="lg:col-span-4">
                <form onSubmit={calculate} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4 sticky top-4">
                    <h2 className="font-bold text-lg mb-4">Jouw gegevens</h2>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Geslacht</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 rounded border bg-transparent">
                            <option value="man">Man</option>
                            <option value="vrouw">Vrouw</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Geboortejaar</label>
                            <input required type="number" placeholder="1990" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className="w-full p-2 rounded border bg-transparent" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Gewicht (kg)</label>
                            <input required type="number" placeholder="75" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 rounded border bg-transparent" />
                        </div>
                    </div>

                    {/* NIEUW: Rusthartslag Input */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Rusthartslag (Optioneel)</label>
                        <input 
                            type="number" 
                            placeholder="Bijv. 55 (Leeg laten = Standaard)" 
                            value={restingHR} 
                            onChange={(e) => setRestingHR(e.target.value)} 
                            className="w-full p-2 rounded border bg-transparent" 
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Nodig voor Karvonen formule</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Jouw snelste 5 km</label>
                        <div className="flex gap-2 items-center">
                            <input required type="number" placeholder="25" value={min5k} onChange={(e) => setMin5k(e.target.value)} className="w-full p-2 rounded border bg-transparent text-center font-mono" />
                            <span className="font-bold">:</span>
                            <input required type="number" placeholder="00" value={sec5k} onChange={(e) => setSec5k(e.target.value)} className="w-full p-2 rounded border bg-transparent text-center font-mono" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Minuten : Seconden</p>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mt-4">
                        Bereken Tijden
                    </button>
                </form>
            </div>

            {/* RESULTATEN KOLOM */}
            <div className="lg:col-span-8 space-y-6">
                {!results ? (
                    <div className="h-full flex items-center justify-center text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 min-h-[300px]">
                        Vul je gegevens in om de voorspelling te zien.
                    </div>
                ) : (
                    <>  
                        {/* VO2 MAX KAART */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg opacity-90">Jouw Geschatte VO2max</h3>
                                <p className="text-sm opacity-75">Gebaseerd op je 5km tijd</p>
                            </div>
                            <div className="text-5xl font-black tracking-tighter">{results.vo2max}</div>
                        </div>

                        {/* NIEUW: HARTSLAG ZONES */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 border-b border-red-100 dark:border-red-800 flex justify-between items-center">
                                <h3 className="font-bold text-red-800 dark:text-red-200">❤️ Trainingszones</h3>
                                <span className="text-xs text-red-600 dark:text-red-300 font-mono">
                                    Max HR: {results.heartRate.maxHR} {results.heartRate.rhr ? `(Rust: ${results.heartRate.rhr})` : ''}
                                </span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 uppercase text-xs border-b dark:border-gray-800">
                                    <tr>
                                        <th className="px-4 py-2">Zone</th>
                                        <th className="px-4 py-2">Hartslag (bpm)</th>
                                        <th className="px-4 py-2 hidden sm:table-cell">Omschrijving</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {results.heartRate.zones.map((zone: any) => (
                                        <tr key={zone.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-2 font-bold">{zone.name}</td>
                                            <td className="px-4 py-2 font-mono font-bold text-red-600 dark:text-red-400">{zone.range}</td>
                                            <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">{zone.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* TABEL 1: PROGNOSES */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">⏱️ Verwachte Eindtijden</h3>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 uppercase text-xs border-b dark:border-gray-800">
                                    <tr>
                                        <th className="px-4 py-2">Afstand</th>
                                        <th className="px-4 py-2">Eindtijd</th>
                                        <th className="px-4 py-2">Pace</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {results.predictions.map((row: any) => (
                                        <tr key={row.dist} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-2 font-medium">{row.dist === 42.195 ? 'Marathon' : row.dist === 21.1 ? 'Halve Marathon' : row.dist + ' km'}</td>
                                            <td className="px-4 py-2 font-bold font-mono">{row.time}</td>
                                            <td className="px-4 py-2 text-gray-500 font-mono">{row.pace}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* TABEL 2: GEWICHT (NU PER KILO) */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">⚖️ Effect van Gewicht</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-gray-500 uppercase text-xs border-b dark:border-gray-800">
                                        <tr>
                                            <th className="px-4 py-2">Wijziging</th>
                                            <th className="px-4 py-2">Gewicht</th>
                                            <th className="px-4 py-2">5 km</th>
                                            <th className="px-4 py-2">Halve M.</th>
                                            <th className="px-4 py-2">Marathon</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {results.weightRows.map((row: any) => (
                                            <tr key={row.change} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className={`px-4 py-2 font-bold ${row.faster ? 'text-green-600' : 'text-red-600'}`}>
                                                    {row.change > 0 ? `+${row.change}` : row.change} kg
                                                </td>
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

                        {/* TABEL 3: LEEFTIJD (UITGEBREID) */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">🎂 Leeftijdspotentieel</h3>
                            {results.ageAnalysis.isPastPeak ? (
                                <>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        Je bent nu <strong>{results.ageAnalysis.currentAge}</strong>. 
                                        Als je dit fitnessniveau had op je piek-leeftijd (ca. 28 jaar), liep je waarschijnlijk:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-100 dark:border-yellow-800/30 text-center">
                                            <span className="block text-xs uppercase text-yellow-800 dark:text-yellow-600 font-bold mb-1">5 km</span>
                                            <span className="font-mono font-bold text-lg text-yellow-700 dark:text-yellow-500">{results.ageAnalysis.potential5k}</span>
                                        </div>
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-100 dark:border-yellow-800/30 text-center">
                                            <span className="block text-xs uppercase text-yellow-800 dark:text-yellow-600 font-bold mb-1">Halve M.</span>
                                            <span className="font-mono font-bold text-lg text-yellow-700 dark:text-yellow-500">{results.ageAnalysis.potentialHM}</span>
                                        </div>
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-100 dark:border-yellow-800/30 text-center">
                                            <span className="block text-xs uppercase text-yellow-800 dark:text-yellow-600 font-bold mb-1">Marathon</span>
                                            <span className="font-mono font-bold text-lg text-yellow-700 dark:text-yellow-500">{results.ageAnalysis.potentialM}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-green-600">
                                    Je bent <strong>{results.ageAnalysis.currentAge}</strong>. Je zit in je fysieke piekaren! Geniet ervan en ga voor dat PR.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}