/**
 * PersonaContext — lightweight user persona store.
 *
 * Persists the current persona to localStorage so it survives page refreshes.
 * Defaults to "analyst" when no stored value exists.
 *
 * No persona-selection UI is exposed in this module.  The context is designed
 * to be configured programmatically or via a future settings surface.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Persona } from "../../shared/skills/persona";

const STORAGE_KEY = "secops:persona";
const DEFAULT_PERSONA: Persona = "analyst";
const VALID_PERSONAS: Persona[] = ["analyst", "manager", "compliance", "operator"];

function readStoredPersona(): Persona {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (VALID_PERSONAS as string[]).includes(stored)) {
      return stored as Persona;
    }
  } catch {
    // localStorage unavailable (SSR, private browsing, etc.)
  }
  return DEFAULT_PERSONA;
}

interface PersonaContextType {
  persona: Persona;
  setPersona: (p: Persona) => void;
}

const PersonaCtx = createContext<PersonaContextType>({
  persona: DEFAULT_PERSONA,
  setPersona: () => {},
});

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(readStoredPersona);

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      // ignore write failures
    }
  }, []);

  return (
    <PersonaCtx.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaCtx.Provider>
  );
}

export function usePersona(): PersonaContextType {
  return useContext(PersonaCtx);
}
