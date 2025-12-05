'use client'; // **Dit is de cruciale regel!**

import React from 'react';
// Importeer je provider uit de context map
import { LanguageProvider } from "./context/LanguageContext"; // Dit pad is nu relatief aan de providers.tsx

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}