import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import RunOverview from './components/RunOverview'

export default async function Home() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { data: runs } = await supabase
    .from('runs')
    .select('*, organizer:profiles(full_name)')
    .order('start_time', { ascending: true })

  return (
    <div className="min-h-screen p-8 flex flex-col items-center font-sans">
      <main className="flex flex-col gap-8 items-center text-center w-full max-w-5xl">
        
        {/* De Titel */}
        <div className="mt-10 mb-4">
            <h1 className="text-5xl font-bold tracking-tight text-black dark:text-white">
            Social Run
            </h1>
            <p className="text-lg text-gray-500 font-medium mt-2 uppercase tracking-widest">
            powered by team Monasso
            </p>
        </div>
        
        {/* Het overzicht met filters en knoppen */}
        <RunOverview runs={runs || []} user={user} />
      </main>
    </div>
  );
}