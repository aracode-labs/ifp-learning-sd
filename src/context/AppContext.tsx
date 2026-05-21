import React, { createContext, useContext, useState } from 'react';

export interface AppContextType {
  selectedGrade: number | null;
  selectedSemester: number | null;
  selectedSubject: string | null;
  selectedTopic: string | null;
  setSelectedGrade: (grade: number) => void;
  setSemester: (semester: number) => void;
  setSelectedSubject: (subjectId: string) => void;
  setSelectedTopic: (topicId: string) => void;
  resetSelection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSemester, setSemester] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const resetSelection = () => {
    setSelectedGrade(null);
    setSemester(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
  };

  return (
    <AppContext.Provider
      value={{
        selectedGrade,
        selectedSemester,
        selectedSubject,
        selectedTopic,
        setSelectedGrade,
        setSemester,
        setSelectedSubject,
        setSelectedTopic,
        resetSelection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
