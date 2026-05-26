"use client";

import { useEffect, useMemo, useState } from "react";
import { PYQUEST_LEVELS } from "@/data/mock-levels";
import { PyquestProgress } from "@/types/pyquest";
import { PracticeHeader } from "@/components/practice/practice-header";
import { ModuleSidebar } from "@/components/practice/module-sidebar";
import { EditorPanel } from "@/components/practice/editor-panel";
import { ConsolePanel } from "@/components/practice/console-panel";
import { FeedbackToast } from "@/components/practice/feedback-toast";

// Clave única para persistir progreso en el navegador.
const STORAGE_KEY = "pyquest_data";

// Estado inicial por defecto del progreso.
const INITIAL_PROGRESS: PyquestProgress = {
  xp: 0,
  lives: 3,
  unlockedLevelId: 1,
};

export function PracticeWorkspace() {
  // Guardamos el progreso general del usuario.
  const [progress, setProgress] = useState<PyquestProgress>(INITIAL_PROGRESS);
  // Guardamos el nivel actual seleccionado.
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  // Guardamos el texto del editor.
  const [code, setCode] = useState("");
  // Guardamos el texto de la consola visual.
  const [consoleOutput, setConsoleOutput] = useState("> Escribe tu solución y presiona Evaluar"
  );
  // Guardamos visibilidad del toast.
  const [showToast, setShowToast] = useState(false);
  // Guardamos tipo de toast.
  const [toastType, setToastType] = useState<"success" | "error">("success");
  // Guardamos mensaje del toast.
  const [toastMessage, setToastMessage] = useState("");

  // Obtenemos el nivel activo según el id seleccionado.
  const activeLevel = useMemo(
    () => PYQUEST_LEVELS.find((level) => level.id === selectedLevelId) ?? PYQUEST_LEVELS[0],
    [selectedLevelId]
  );

  // Cargamos progreso guardado al abrir la página.
  useEffect(() => {
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (!rawData) {
      return;
    }

    try {
      const parsedData = JSON.parse(rawData) as PyquestProgress;
      setProgress(parsedData);
      setSelectedLevelId(parsedData.unlockedLevelId);
    } catch {
      setProgress(INITIAL_PROGRESS);
    }
  }, []);

  // Guardamos progreso cada vez que cambie.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Ocultamos el toast automáticamente después de un tiempo.
  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowToast(false);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [showToast]);

  // Esta función intenta detectar un error básico para dar feedback simple.
  const detectBasicError = (userCode: string) => {
    if (!userCode.includes("=")) {
      return "Parece que te falta el signo igual (=).";
    }

    if (activeLevel.topic === "if" && !userCode.includes(":")) {
      return "Parece que te faltan los dos puntos (:) al final.";
    }

    if (activeLevel.topic === "for" && !userCode.includes("in")) {
      return "Recuerda usar la palabra in en el bucle for.";
    }

    if (activeLevel.topic === "def" && !userCode.includes("(")) {
      return "La función necesita paréntesis para los parámetros.";
    }

    return activeLevel.errorTips[0];
  };

  // Esta función valida la respuesta actual y actualiza XP/vidas/desbloqueo.
  const handleEvaluate = () => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      setConsoleOutput("> Debes escribir algo en el editor antes de evaluar.");
      setToastType("error");
      setToastMessage("Primero escribe una respuesta en el editor.");
      setShowToast(true);
      return;
    }

    const isCorrect = activeLevel.expectedPattern.test(cleanCode);

    if (isCorrect) {
      const nextUnlock = Math.min(
        Math.max(progress.unlockedLevelId, activeLevel.id + 1),
        PYQUEST_LEVELS.length
      );

      setProgress((previous) => ({
        xp: previous.xp + 15,
        lives: previous.lives,
        unlockedLevelId: nextUnlock,
      }));

      setConsoleOutput(`> ${activeLevel.successMessage}`);
      setToastType("success");
      setToastMessage(activeLevel.successMessage);
      setShowToast(true);
      return;
    }

    setProgress((previous) => ({
      xp: previous.xp,
      lives: Math.max(previous.lives - 1, 0),
      unlockedLevelId: previous.unlockedLevelId,
    }));

    const errorMessage = detectBasicError(cleanCode);
    setConsoleOutput(`> Error: ${errorMessage}`);
    setToastType("error");
    setToastMessage(errorMessage);
    setShowToast(true);
  };

  // Esta función limpia el editor y la consola vuelve al estado inicial.
  const handleClear = () => {
    setCode("");
    setConsoleOutput("> Editor limpiado. Escribe una nueva solución.");
  };

  // Esta función reinicia por completo el progreso local.
  const handleResetProgress = () => {
    setProgress(INITIAL_PROGRESS);
    setSelectedLevelId(1);
    setCode("");
    setConsoleOutput("> Progreso reiniciado. Vuelve a empezar desde el nivel 1.");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROGRESS));
  };

  // Esta función cambia de módulo si está desbloqueado.
  const handleSelectLevel = (levelId: number) => {
    if (levelId > progress.unlockedLevelId) {
      return;
    }

    setSelectedLevelId(levelId);
    setCode("");
    setConsoleOutput(`> Módulo ${levelId} cargado. Lee la instrucción y responde.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header principal */}
      <PracticeHeader
        xp={progress.xp}
        lives={progress.lives}
        currentLevel={activeLevel.id}
        totalLevels={PYQUEST_LEVELS.length}
      />

      {/* Área principal con layout responsive */}
      <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        {/* Sidebar de módulos */}
        <ModuleSidebar
          levels={PYQUEST_LEVELS}
          unlockedLevelId={progress.unlockedLevelId}
          selectedLevelId={selectedLevelId}
          onSelectLevel={handleSelectLevel}
        />

        {/* Zona de editor y consola */}
        <div className="space-y-4">
          <EditorPanel level={activeLevel} code={code} onCodeChange={setCode} />
          <ConsolePanel
            output={consoleOutput}
            onEvaluate={handleEvaluate}
            onClear={handleClear}
            onResetProgress={handleResetProgress}
          />
        </div>
      </main>

      {/* Toast de feedback simple */}
      <FeedbackToast visible={showToast} type={toastType} message={toastMessage} />
    </div>
  );
}
