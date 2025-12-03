import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  // 1. Check op de server of de gebruiker is ingelogd
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
             // Server components mogen geen cookies zetten, maar we moeten de methode wel definiëren
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center font-sans">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-5xl font-bold tracking-tight">Hardloop Groep</h1>
        
        {user ? (
          // DIT ZIE JE ALS JE INGELOGD BENT
          <>
            <p className="text-xl text-green-600 font-medium">
              Welkom terug!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
               <Link 
                href="/profile" 
                className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-medium hover:opacity-80 transition"
              >
                Mijn Profiel
              </Link>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:opacity-80 transition">
                + Nieuw Loopje
              </button>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Beschikbare Loopjes</h2>
              <p className="text-gray-500">Nog geen loopjes gepland...</p>
            </div>
          </>
        ) : (
          // DIT ZIE JE ALS JE NIET BENT INGELOGD
          <>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md">
              Meld je aan, vind een maatje en ga samen hardlopen.
              Geen kosten, gewoon rennen.
            </p>
            <div className="flex gap-4 mt-4">
              <Link 
                href="/login" 
                className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full font-medium hover:opacity-80 transition"
              >
                Starten
              </Link>
              <button className="border border-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                Bekijk Loopjes
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}