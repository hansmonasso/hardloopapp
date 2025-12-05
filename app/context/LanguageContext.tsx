'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- DEEL 1: DE VERTALINGEN (Alles is hier) ---
export type Language = 'nl' | 'en' | 'de';

export const translations = {
  nl: {
    nav_profile: "Mijn Profiel",
    nav_new_run: "+ Nieuw Loopje",
    nav_calc: "Calculator",
    nav_schema: "Schema's",
    nav_info: "Info",
    login_btn: "Inloggen / Registreren",
    
    filter_title: "Vind een loopje",
    filter_placeholder_city: "Plaats...",
    filter_placeholder_prov: "Provincie/Regio",
    filter_only_races: "Alleen Wedstrijden",
    filter_history: "Toon ook historie",
    filter_compact: "Compacte lijst",
    filter_reset: "Filters wissen",
    filter_all_provinces: "Alle provincies",
    
    list_header_future: "Aankomende Loopjes",
    list_header_history: "Alle Loopjes",
    list_empty: "Geen loopjes gevonden.",
    
    card_join: "Ik ga mee!",
    card_leave: "Ik ga toch niet mee",
    card_participants: "Wie gaan er mee?",
    card_no_participants: "Nog geen aanmeldingen uit de groep",
    card_organized_by: "Org:",
    card_you: "Jijzelf",
    card_participant_label: "DEELNEMER",
    card_edit: "Aanpassen",
    card_delete: "Verwijderen",
    card_join_login_prompt: "Om je aan te melden moet je even inloggen. Wil je naar de inlogpagina?",
    
    race_badge: "WEDSTRIJD",
    race_info_btn: "Inschrijven / Info",
  },
  en: {
    nav_profile: "My Profile",
    nav_new_run: "+ New Run",
    nav_calc: "Calculator",
    nav_schema: "Plans",
    nav_info: "Info",
    login_btn: "Login / Register",
    
    filter_title: "Find a run",
    filter_placeholder_city: "City...",
    filter_placeholder_prov: "Region/State",
    filter_only_races: "Races Only",
    filter_history: "Show History",
    filter_compact: "Compact View",
    filter_reset: "Clear filters",
    filter_all_provinces: "All regions",
    
    list_header_future: "Upcoming Runs",
    list_header_history: "All Runs",
    list_empty: "No runs found.",
    
    card_join: "I'm joining!",
    card_leave: "I'm out",
    card_participants: "Who's joining?",
    card_no_participants: "No runners yet",
    card_organized_by: "Host:",
    card_you: "You",
    card_participant_label: "JOINED",
    card_edit: "Edit",
    card_delete: "Delete",
    card_join_login_prompt: "You need to log in to join this run. Go to the login page?",

    race_badge: "RACE",
    race_info_btn: "Register / Info",
  },
  de: {
    nav_profile: "Mein Profil",
    nav_new_run: "+ Neuer Lauf",
    nav_calc: "Rechner",
    nav_schema: "Pläne",
    nav_info: "Info",
    login_btn: "Anmelden / Registrieren",
    
    filter_title: "Lauf finden",
    filter_placeholder_city: "Stadt...",
    filter_placeholder_prov: "Bundesland",
    filter_only_races: "Nur Wettkämpfe",
    filter_history: "Verlauf anzeigen",
    filter_compact: "Kompaktansicht",
    filter_reset: "Filter löschen",
    filter_all_provinces: "Alle Regionen",
    
    list_header_future: "Kommende Läufe",
    list_header_history: "Alle Läufe",
    list_empty: "Keine Läufe gefunden.",
    
    card_join: "Ich bin dabei!",
    card_leave: "Ich bin raus",
    card_participants: "Wer läuft mit?",
    card_no_participants: "Noch keine Läufer",
    card_organized_by: "Org:",
    card_you: "Du",
    card_participant_label: "TEILNEHMER",
    card_edit: "Bearbeiten",
    card_delete: "Löschen",
    card_join_login_prompt: "Sie müssen sich anmelden, um teilzunehmen. Möchten Sie zur Anmeldeseite gehen?",
    
    race_badge: "WETTKAMPF",
    race_info_btn: "Anmeldung / Info",
  }
};

// --- DEEL 2: DE LOGICA ---

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['nl'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('nl');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('socialrun_lang') as Language : null;
    if (saved && (saved === 'nl' || saved === 'en' || saved === 'de')) {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('socialrun_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}