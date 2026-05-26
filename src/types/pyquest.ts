// Este tipo representa un nivel de práctica dentro de PyQuest.
export interface PyquestLevel {
  // Id único del nivel.
  id: number;
  // Título corto para mostrar en tarjetas y panel lateral.
  title: string;
  // Tema principal del nivel.
  topic: string;
  // Instrucción principal que debe completar el usuario.
  instruction: string;
  // Ejemplo rápido para guiar al usuario.
  example: string;
  // Texto de ayuda dentro del editor.
  placeholder: string;
  // Expresión regular para validar la respuesta del usuario.
  expectedPattern: RegExp;
  // Mensaje de éxito cuando la respuesta es correcta.
  successMessage: string;
  // Lista de ayudas de error para mostrar feedback básico.
  errorTips: string[];
}

// Este tipo representa el estado global simple del progreso.
export interface PyquestProgress {
  // Experiencia acumulada por respuestas correctas.
  xp: number;
  // Vidas restantes para el usuario.
  lives: number;
  // Último nivel desbloqueado.
  unlockedLevelId: number;
}
