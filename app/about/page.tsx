import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold">ℹ️ Over Social Run</h1>
            <Link href="/" className="text-sm underline text-gray-500 hover:text-black dark:hover:text-white">Terug naar home</Link>
        </div>

        {/* Intro */}
        <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4 leading-tight">
                Samen hardlopen.<br/>
                <span className="text-blue-600">Zonder gedoe.</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                Weg met de rommelige lijstjes in WhatsApp. Social Run is de simpelste manier om je loopje te plannen, te delen en lopers te verzamelen.
            </p>
        </div>

        {/* De 3 Stappen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            {/* Stap 1 */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition text-center">
                <div className="text-5xl mb-4">🗓️</div>
                <h3 className="font-bold text-xl mb-2">1. Plan je loopje</h3>
                <p className="text-sm text-gray-500">
                    Prik een datum, kies een locatie en geef aan wat je gaat doen. Een rustige 5km of een pittige interval? Jij bent de baas.
                </p>
            </div>

            {/* Stap 2 */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAIR</div>
                <div className="text-5xl mb-4">📲</div>
                <h3 className="font-bold text-xl mb-2">2. Deel op Socials</h3>
                <p className="text-sm text-gray-500">
                    Klaar? Deel je loopje direct via WhatsApp, Instagram of X. Vrienden zien meteen waar en wanneer ze moeten staan.
                </p>
            </div>

            {/* Stap 3 */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition text-center">
                <div className="text-5xl mb-4">👟</div>
                <h3 className="font-bold text-xl mb-2">3. Loop samen</h3>
                <p className="text-sm text-gray-500">
                    Andere lopers melden zich met één klik aan. Jij ziet precies wie er komt opdagen. Geen verrassingen bij de start.
                </p>
            </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-8 md:p-12 mb-12">
            <h3 className="text-2xl font-bold mb-6 text-center text-blue-900 dark:text-blue-100">Waarom Social Run?</h3>
            <ul className="space-y-4 max-w-lg mx-auto">
                <li className="flex items-center gap-3">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Geen account nodig om te kijken</span>
                </li>
                <li className="flex items-center gap-3">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Handige race-calculator & trainingsschema's</span>
                </li>
                <li className="flex items-center gap-3">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Altijd gratis voor de community</span>
                </li>
                <li className="flex items-center gap-3">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">Powered by <strong>Team Monasso</strong></span>
                </li>
            </ul>
        </div>

        {/* Call to Action */}
        <div className="text-center">
            <p className="text-gray-500 mb-6 font-medium">Klaar om te starten?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                    href="/login" 
                    className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition shadow-lg"
                >
                    Maak een account
                </Link>
                <Link 
                    href="/" 
                    className="bg-white border border-gray-300 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition"
                >
                    Bekijk loopjes
                </Link>
            </div>
        </div>

      </div>
    </div>
  )
}