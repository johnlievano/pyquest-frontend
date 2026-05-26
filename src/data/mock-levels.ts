import { PyquestLevel } from "@/types/pyquest";

// Este arreglo contiene los niveles de práctica del MVP.
export const PYQUEST_LEVELS: PyquestLevel[] = [
  {
    id: 1,
    title: "Variables",
    topic: "variables",
    instruction:
      "Crea una variable llamada nombre y asígnale un texto con tu nombre.",
    example: 'nombre = "Ana"',
    placeholder: 'Escribe algo como: nombre = "Tu nombre"',
    expectedPattern: /^[a-zA-Z_]\w*\s*=\s*(["']).+\1$/,
    successMessage: "¡Perfecto! Creaste una variable de texto correctamente.",
    errorTips: [
      "Recuerda usar el signo igual (=) para asignar el valor.",
      "Para un texto debes usar comillas simples o dobles.",
      "La variable no debe empezar con número.",
    ],
  },
  {
    id: 2,
    title: "Condicionales",
    topic: "if",
    instruction:
      "Escribe un if que compare edad >= 18 y termine con dos puntos.",
    example: "if edad >= 18:",
    placeholder: "Escribe algo como: if edad >= 18:",
    expectedPattern: /^if\s+[a-zA-Z_]\w*\s*(==|!=|>=|<=|>|<)\s*[a-zA-Z0-9_\"']+\s*:\s*$/,
    successMessage: "¡Bien! Tu condicional tiene estructura válida.",
    errorTips: [
      "Un if en Python debe terminar en dos puntos (:).",
      "Debes usar un operador de comparación como == o >=.",
      "Empieza la línea con la palabra if.",
    ],
  },
  {
    id: 3,
    title: "Bucles",
    topic: "for",
    instruction:
      "Escribe un bucle for que recorra range(5) y termine con dos puntos.",
    example: "for i in range(5):",
    placeholder: "Escribe algo como: for i in range(5):",
    expectedPattern: /^for\s+[a-zA-Z_]\w*\s+in\s+range\(\d+\)\s*:\s*$/,
    successMessage: "¡Excelente! Tu bucle for está bien planteado.",
    errorTips: [
      "Un for básico usa la estructura: for variable in range(n):",
      "No olvides la palabra in.",
      "No olvides el : al final.",
    ],
  },
  {
    id: 4,
    title: "Funciones",
    topic: "def",
    instruction:
      "Crea una función llamada saludar que reciba un parámetro nombre.",
    example: "def saludar(nombre):",
    placeholder: "Escribe algo como: def saludar(nombre):",
    expectedPattern: /^def\s+[a-zA-Z_]\w*\s*\(\s*[a-zA-Z_]\w*\s*\)\s*:\s*$/,
    successMessage: "¡Muy bien! Definiste una función correctamente.",
    errorTips: [
      "Una función empieza con la palabra def.",
      "La función debe llevar paréntesis, aunque solo tenga un parámetro.",
      "Recuerda los dos puntos (:) al final.",
    ],
  },
];
