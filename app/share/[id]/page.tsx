import { redirect } from 'next/navigation'

// Deze pagina vangt de bezoeker op en stuurt hem direct door naar de homepage
// met de juiste focus op het kaartje.
export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // De 'redirect' functie doet het zware werk
  redirect(`/?run_id=${id}`)
}