/**
 * TimeTravelContext — Global Time Travel State
 * ==============================================
 *
 * Platform-wide Time Travel mode. When active, the entire
 * application becomes read-only and displays historical state.
 *
 * Any module can check `isTimeTravelActive` to gate write actions.
 */

import React, { createContext, useContext, useState, useCallback } from "react";

interface TimeTravelState {
  isActive: boolean;
  date: string; // ISO date string
  formattedDate: string;
  activate: (dateStr: string) => void;
  deactivate: () => void;
  togglePicker: () => void;
  isPickerOpen: boolean;
  closePicker: () => void;
}

const TimeTravelContext = createContext<TimeTravelState>({
  isActive: false,
  date: "",
  formattedDate: "",
  activate: () => {},
  deactivate: () => {},
  togglePicker: () => {},
  isPickerOpen: false,
  closePicker: () => {},
});

export function TimeTravelProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [date, setDate] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const activate = useCallback((dateStr: string) => {
    if (dateStr) {
      setDate(dateStr);
      setIsActive(true);
      setIsPickerOpen(false);
    }
  }, []);

  const deactivate = useCallback(() => {
    setIsActive(false);
    setDate("");
  }, []);

  const togglePicker = useCallback(() => {
    setIsPickerOpen((prev) => !prev);
  }, []);

  const closePicker = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  return (
    <TimeTravelContext.Provider
      value={{ isActive, date, formattedDate, activate, deactivate, togglePicker, isPickerOpen, closePicker }}
    >
      {children}
    </TimeTravelContext.Provider>
  );
}

export function useTimeTravel() {
  return useContext(TimeTravelContext);
}
