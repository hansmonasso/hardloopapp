import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";

// De font wordt hier nog wel geimporteerd, maar we gebruiken de variabele NIET in de body
const inter = Inter({ subsets: ["latin"] }); 

export const metadata: Metadata = {
  title: "Social Run - Team Monasso",
  description: "Samen hardlopen, powered by team Monasso",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      {/* DEZE REGEL IS DE FIX: We gebruiken GEEN {inter.className} meer, 
          waardoor de hash-mismatch stopt. We gebruiken een simpele font-klasse.
      */}
      <body 
        className={`antialiased min-h-screen flex flex-col relative overflow-x-hidden font-sans`}
        suppressHydrationWarning={true} 
      >
        <LanguageProvider>

            {/* ACHTERGROND GRAPHIC: De Emoji Methode */}
            <div className="fixed -bottom-20 -right-20 pointer-events-none z-0 opacity-5 select-none overflow-hidden">
                <span className="text-[300px] md:text-[500px] leading-none grayscale brightness-0 dark:invert">
                🏃
                </span>
            </div>

            <div className="flex-grow z-10 relative">
                {children}
            </div>

            <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 text-center z-10 relative mt-auto">
            <div className="flex flex-col gap-6">
                <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Sponsor
                </p>
                <a 
                    href="https://www.sisalvloerkleden.nl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-blue-600 hover:text-blue-800 transition"
                >
                    www.sisalvloerkleden.nl
                </a>
                <p className="text-xs text-gray-500 mt-1">sisal vloerkleden op maat!</p>
                </div>
                <div>
                <a 
                    href="mailto:hansmonasso@gmail.com?subject=Feedback Social Run"
                    className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 underline decoration-dotted underline-offset-4"
                >
                    Heb je tips of ideeën? Mail Hans
                </a>
                </div>
            </div>
            </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}