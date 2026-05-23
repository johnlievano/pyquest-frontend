// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TestCase {
  descripcion: string;
  outputEsperado: string;
  esOculto: boolean;
}

export interface ResultadoValidacion {
  ok: boolean;
  mensaje: string;
}

export interface Ejercicio {
  id: string;
  titulo: string;
  dificultad: 'Principiante' | 'Intermedio' | 'Avanzado';
  xp: number;
  conceptos: string[];
  descripcion: string;
  codigoInicial: string;
  testCases: TestCase[];
  pistas: string[];
  validar: (codigo: string, salida: string) => ResultadoValidacion;
}

export interface Unidad {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
  colorAccent: string;
  colorGlow: string;
  prerequisito?: number;   // id de la unidad anterior requerida
  ejercicios: Ejercicio[];
}

// ─── Helpers de validación ────────────────────────────────────────────────────

function ok(mensaje: string): ResultadoValidacion {
  return { ok: true, mensaje };
}

function err(mensaje: string): ResultadoValidacion {
  return { ok: false, mensaje };
}

function salidaContiene(salida: string, ...fragmentos: string[]): boolean {
  return fragmentos.every(f => salida.includes(f));
}

// ─── UNIDAD 1 — Fundamentos de Python ────────────────────────────────────────

const u1: Unidad = {
  id: 1,
  titulo: 'Fundamentos de Python',
  descripcion: 'Variables, tipos de datos, operadores y f-strings. Los cimientos de todo programa Python.',
  icono: '🛸',
  colorAccent: '#6366f1',
  colorGlow: 'rgba(99,102,241,0.4)',
  ejercicios: [
    {
      id: 'u1e1',
      titulo: 'Hola, Universo',
      dificultad: 'Principiante',
      xp: 50,
      conceptos: ['print', 'strings'],
      descripcion: `**Misión: Tu primer mensaje al cosmos**

Cada gran viaje comienza con un primer paso. El tuyo comienza aquí.

Usa la función \`print()\` para enviar el mensaje exacto al universo:

\`Hola, Universo!\`

**Requisitos:**
- Usa \`print()\` con el texto exacto
- Respeta mayúsculas y el signo de exclamación`,
      codigoInicial: `# Tu primer programa en Python
# Imprime el mensaje exacto: Hola, Universo!

`,
      testCases: [
        { descripcion: 'Imprime el saludo correcto', outputEsperado: 'Hola, Universo!', esOculto: false },
      ],
      pistas: [
        'Usa print() con el texto entre comillas.',
        'El texto debe ser exactamente: Hola, Universo! (con coma y exclamación)',
      ],
      validar: (_c, salida) =>
        salida.trim() === 'Hola, Universo!'
          ? ok('¡Perfecto! Tu señal llegó al universo.')
          : err('El output no coincide. ¿Escribiste exactamente "Hola, Universo!"?'),
    },
    {
      id: 'u1e2',
      titulo: 'Tipos de Datos',
      dificultad: 'Principiante',
      xp: 75,
      conceptos: ['tipos', 'variables', 'type()'],
      descripcion: `**Misión: Identificar materiales de la nave**

Completa las variables reemplazando los \`___\` con los valores correctos.

**Variables a completar:**
- \`nombre\`: string con tu nombre
- \`edad\`: número entero
- \`altura\`: número decimal (float)
- \`activo\`: booleano True/False

Luego imprime cada variable con su tipo usando \`type()\`.`,
      codigoInicial: `# Completa las variables con los tipos correctos
nombre = ___   # str: nombre de persona
edad   = ___   # int: edad en años
altura = ___   # float: altura en metros
activo = ___   # bool: True o False

print(f"Nombre: {nombre} — Tipo: {type(nombre).__name__}")
print(f"Edad: {edad} — Tipo: {type(edad).__name__}")
print(f"Altura: {altura} — Tipo: {type(altura).__name__}")
print(f"Activo: {activo} — Tipo: {type(activo).__name__}")
`,
      testCases: [
        { descripcion: 'nombre es de tipo str', outputEsperado: 'Tipo: str', esOculto: false },
        { descripcion: 'edad es de tipo int', outputEsperado: 'Tipo: int', esOculto: false },
        { descripcion: 'altura es de tipo float', outputEsperado: 'Tipo: float', esOculto: false },
        { descripcion: 'activo es de tipo bool', outputEsperado: 'Tipo: bool', esOculto: false },
      ],
      pistas: [
        'Reemplaza ___ con valores reales: "Carlos", 28, 1.75, True',
        'Los floats necesitan punto decimal: 1.75 no 175',
        'Los booleanos en Python son True o False (con mayúscula)',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Tipo: str', 'Tipo: int', 'Tipo: float', 'Tipo: bool')
          ? ok('¡Excelente! Identificaste todos los tipos correctamente.')
          : err('Revisa que cada variable tenga el tipo correcto y no queden ___ sin reemplazar.'),
    },
    {
      id: 'u1e3',
      titulo: 'Operadores Aritméticos',
      dificultad: 'Principiante',
      xp: 80,
      conceptos: ['aritmética', 'variables', 'operadores'],
      descripcion: `**Misión: Calcular el área de la plataforma de aterrizaje**

La nave necesita calcular el área y perímetro de la plataforma rectangular.

Completa el código para:
- Calcular el **área**: base × altura
- Calcular el **perímetro**: 2 × (base + altura)
- Verificar si el área es mayor que 50`,
      codigoInicial: `base    = 12
altura  = 5

area      = ___  # base × altura
perimetro = ___  # 2 × (base + altura)

print(f"Área: {area}")
print(f"Perímetro: {perimetro}")
print(f"¿Es el área mayor que 50? {___}")
`,
      testCases: [
        { descripcion: 'Área calculada correctamente (60)', outputEsperado: 'Área: 60', esOculto: false },
        { descripcion: 'Perímetro calculado correctamente (34)', outputEsperado: 'Perímetro: 34', esOculto: false },
        { descripcion: 'Comparación booleana correcta', outputEsperado: '¿Es el área mayor que 50? True', esOculto: false },
      ],
      pistas: [
        'Área = base * altura',
        'Perímetro = 2 * (base + altura)',
        'La comparación es simplemente: area > 50',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Área: 60', 'Perímetro: 34', 'True')
          ? ok('¡Cálculos perfectos! La plataforma está lista.')
          : err('Revisa las fórmulas. Área = base × altura, Perímetro = 2×(base+altura).'),
    },
    {
      id: 'u1e4',
      titulo: 'F-Strings Avanzados',
      dificultad: 'Intermedio',
      xp: 100,
      conceptos: ['f-strings', 'formato', ':.2f'],
      descripcion: `**Misión: Ficha de astronauta**

Genera la ficha de astronauta usando f-strings con formato.

**Requisitos:**
- Las horas decimales deben mostrarse con \`:.2f\`
- Calcula los días dividiendo horas entre 24
- Usa el formato exacto del output esperado`,
      codigoInicial: `nombre      = "Valentina"
nivel       = "Comandante"
edad        = 30
mision      = "Órbita Lunar"
horas_vuelo = 1247.3

dias = ___  # horas_vuelo / 24

print("=== FICHA DE ASTRONAUTA ===")
print(f"Nombre: {nombre} | Nivel: {nivel}")
print(f"Edad: {edad} años | Misión: {mision}")
print(f"Horas de vuelo: {horas_vuelo:.0f} (≈ {___} días)")
print("===========================")
`,
      testCases: [
        { descripcion: 'Encabezado correcto', outputEsperado: '=== FICHA DE ASTRONAUTA ===', esOculto: false },
        { descripcion: 'Días con 2 decimales', outputEsperado: '51.96 días', esOculto: false },
      ],
      pistas: [
        'dias = horas_vuelo / 24',
        'Usa {dias:.2f} para 2 decimales',
        'horas_vuelo:.0f elimina los decimales',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, '=== FICHA DE ASTRONAUTA ===', '51.96')
          ? ok('¡Ficha generada con formato perfecto!')
          : err('Asegúrate de usar :.2f para los días y que el formato coincida.'),
    },
    {
      id: 'u1e5',
      titulo: 'Input y Cálculos',
      dificultad: 'Principiante',
      xp: 90,
      conceptos: ['input', 'int()', 'f-strings'],
      descripcion: `**Misión: Calculadora de edad galáctica**

Completa el programa que calcula la edad de un astronauta a partir de su nombre y año de nacimiento.

- Lee el nombre e imprímelo en el saludo
- Calcula la edad: \`2024 - anio_nacimiento\`
- Muestra el año de nacimiento`,
      codigoInicial: `nombre          = "Luna"
anio_nacimiento = 2000

edad = ___  # 2024 - anio_nacimiento

print(f"¡Hola, {nombre}!")
print(f"Tienes aproximadamente {___} años.")
print(f"Naciste en el año {___}.")
`,
      testCases: [
        { descripcion: 'Saludo con nombre', outputEsperado: '¡Hola, Luna!', esOculto: false },
        { descripcion: 'Edad calculada', outputEsperado: '24 años', esOculto: false },
        { descripcion: 'Año de nacimiento', outputEsperado: 'Naciste en el año 2000', esOculto: false },
      ],
      pistas: [
        'edad = 2024 - anio_nacimiento',
        'Usa {edad} y {anio_nacimiento} en los f-strings',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, '¡Hola, Luna!', '24', '2000')
          ? ok('¡Cálculo de edad correcto!')
          : err('Verifica la fórmula de la edad y que uses las variables correctas en los prints.'),
    },
    {
      id: 'u1e6',
      titulo: 'Operadores de Comparación',
      dificultad: 'Principiante',
      xp: 85,
      conceptos: ['comparación', '>', '<', '==', '>='],
      descripcion: `**Misión: Comparar dos naves espaciales**

Compara las características de las naves Alfa y Beta usando operadores de comparación (\`>\`, \`<\`, \`==\`, \`>=\`).

Completa las expresiones booleanas donde están los \`___\`.`,
      codigoInicial: `# Nave Alfa
velocidad_alfa    = 28000  # km/h
tripulacion_alfa  = 7
combustible_alfa  = 85     # %

# Nave Beta
velocidad_beta    = 31000  # km/h
tripulacion_beta  = 5
combustible_beta  = 80     # %

print("=== COMPARATIVA DE NAVES ===")
print(f"¿Alfa es más rápida que Beta? {___}")
print(f"¿Tienen la misma tripulación? {___}")
print(f"¿Beta tiene más combustible? {___}")
print(f"¿Alfa tiene velocidad >= 28000? {___}")
print(f"¿La suma de tripulaciones es 12? {___}")
`,
      testCases: [
        { descripcion: 'Alfa más rápida → False', outputEsperado: '¿Alfa es más rápida que Beta? False', esOculto: false },
        { descripcion: 'Misma tripulación → False', outputEsperado: '¿Tienen la misma tripulación? False', esOculto: false },
        { descripcion: 'Alfa velocidad ≥ 28000 → True', outputEsperado: '¿Alfa tiene velocidad >= 28000? True', esOculto: false },
        { descripcion: 'Suma tripulaciones = 12 → True', outputEsperado: '¿La suma de tripulaciones es 12? True', esOculto: false },
      ],
      pistas: [
        'Alfa más rápida: velocidad_alfa > velocidad_beta',
        'Misma tripulación: tripulacion_alfa == tripulacion_beta',
        'Suma tripulaciones: tripulacion_alfa + tripulacion_beta == 12',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, '=== COMPARATIVA DE NAVES ===', 'False', 'True')
          ? ok('¡Comparaciones correctas! Las naves han sido evaluadas.')
          : err('Revisa los operadores de comparación. Recuerda: > < == >= <='),
    },
    {
      id: 'u1e7',
      titulo: 'Operadores Lógicos',
      dificultad: 'Intermedio',
      xp: 100,
      conceptos: ['and', 'or', 'not', 'lógica'],
      descripcion: `**Misión: Sistema de acceso a la nave**

Usa \`and\`, \`or\`, \`not\` para definir las condiciones de acceso.

- \`puede_entrar\`: tiene credencial **y** no está en lista negra
- \`acceso_total\`: puede entrar **y** es comandante
- \`operacion_normal\`: puede entrar **o** hay emergencia`,
      codigoInicial: `tiene_credencial = True
en_lista_negra   = False
es_comandante    = False
hay_emergencia   = True

puede_entrar    = ___  # tiene_credencial AND NOT en_lista_negra
acceso_total    = ___  # puede_entrar AND es_comandante
operacion_normal = ___  # puede_entrar OR hay_emergencia

print(f"¿Puede entrar? {puede_entrar}")
print(f"¿Acceso total? {acceso_total}")
print(f"¿Operación normal? {operacion_normal}")
`,
      testCases: [
        { descripcion: '¿Puede entrar? True', outputEsperado: '¿Puede entrar? True', esOculto: false },
        { descripcion: '¿Acceso total? False', outputEsperado: '¿Acceso total? False', esOculto: false },
        { descripcion: '¿Operación normal? True', outputEsperado: '¿Operación normal? True', esOculto: false },
      ],
      pistas: [
        'puede_entrar = tiene_credencial and not en_lista_negra',
        'acceso_total = puede_entrar and es_comandante',
        'operacion_normal = puede_entrar or hay_emergencia',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, '¿Puede entrar? True', '¿Acceso total? False', '¿Operación normal? True')
          ? ok('¡Sistema de acceso configurado correctamente!')
          : err('Revisa los operadores and, or, not y la lógica de cada condición.'),
    },
    {
      id: 'u1e8',
      titulo: 'Conversión de Tipos',
      dificultad: 'Intermedio',
      xp: 110,
      conceptos: ['int()', 'float()', 'str()', 'bool()', 'casting'],
      descripcion: `**Misión: Decodificar telemetría de la nave**

Los datos llegan como strings desde el sensor. Conviértelos al tipo correcto usando \`float()\`, \`int()\`, \`bool()\`.

Accede a los valores usando índices: \`datos_raw[0]\`, \`datos_raw[1]\`, etc.`,
      codigoInicial: `datos_raw = ["420.5", "7800", "-89.2", "1", "6", "7800"]

altitud    = ___(datos_raw[0])   # float
velocidad  = ___(datos_raw[1])   # int
temp       = ___(datos_raw[2])   # float
modulo     = ___(datos_raw[3])   # bool (1 → True)
tripulantes = ___(datos_raw[4])  # int

vel_kmh = velocidad * 3.6

print(f"Altitud: {altitud} km")
print(f"Velocidad: {velocidad} m/s")
print(f"Temperatura: {temp}°C")
print(f"Módulo activo: {modulo}")
print(f"Tripulantes: {tripulantes}")
print(f"Velocidad en km/h: {vel_kmh}")
`,
      testCases: [
        { descripcion: 'Altitud como float', outputEsperado: 'Altitud: 420.5 km', esOculto: false },
        { descripcion: 'Velocidad en km/h', outputEsperado: 'Velocidad en km/h: 28080.0', esOculto: false },
        { descripcion: 'Módulo activo como bool', outputEsperado: 'Módulo activo: True', esOculto: false },
      ],
      pistas: [
        'Usa float() para números decimales: float(datos_raw[0])',
        'Usa int() para enteros: int(datos_raw[1])',
        'bool("1") → True, bool(int("1")) → True',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Altitud: 420.5 km', '28080.0', 'True')
          ? ok('¡Telemetría decodificada correctamente!')
          : err('Revisa las conversiones de tipo. Cada dato necesita el cast correcto.'),
    },
  ],
};

// ─── UNIDAD 2 — Estructuras de Control ───────────────────────────────────────

const u2: Unidad = {
  id: 2,
  titulo: 'Estructuras de Control',
  descripcion: 'Condicionales if/elif/else, bucles for y while, break y continue. Controla el flujo de tu nave.',
  icono: '🌌',
  colorAccent: '#06b6d4',
  colorGlow: 'rgba(6,182,212,0.4)',
  prerequisito: 1,
  ejercicios: [
    {
      id: 'u2e1',
      titulo: 'Condicionales if/elif/else',
      dificultad: 'Principiante',
      xp: 90,
      conceptos: ['if', 'elif', 'else'],
      descripcion: `**Misión: Clasificador de velocidad**

Clasifica la velocidad de la nave usando \`if / elif / else\`:

- \`< 1000\` km/h → **Suborbital**
- \`< 7000\` km/h → **Orbital**
- \`< 11200\` km/h → **Escape**
- Mayor o igual → **Interestelar**`,
      codigoInicial: `def clasificar_velocidad(velocidad_kmh):
    if ___:
        return "Suborbital"
    elif ___:
        return "Orbital"
    elif ___:
        return "Escape"
    else:
        return "Interestelar"

print(f"500 km/h → {clasificar_velocidad(500)}")
print(f"3500 km/h → {clasificar_velocidad(3500)}")
print(f"9800 km/h → {clasificar_velocidad(9800)}")
print(f"25000 km/h → {clasificar_velocidad(25000)}")
`,
      testCases: [
        { descripcion: '500 → Suborbital', outputEsperado: '500 km/h → Suborbital', esOculto: false },
        { descripcion: '3500 → Orbital', outputEsperado: '3500 km/h → Orbital', esOculto: false },
        { descripcion: '9800 → Escape', outputEsperado: '9800 km/h → Escape', esOculto: false },
        { descripcion: '25000 → Interestelar', outputEsperado: '25000 km/h → Interestelar', esOculto: false },
      ],
      pistas: [
        'Primera condición: velocidad_kmh < 1000',
        'Segunda: velocidad_kmh < 7000',
        'Tercera: velocidad_kmh < 11200',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Suborbital', 'Orbital', 'Escape', 'Interestelar')
          ? ok('¡Clasificador de velocidad funcionando!')
          : err('Revisa los rangos de cada condición if/elif/else.'),
    },
    {
      id: 'u2e2',
      titulo: 'Bucle for y range()',
      dificultad: 'Principiante',
      xp: 95,
      conceptos: ['for', 'range()', 'bucles'],
      descripcion: `**Misión: Cuenta regresiva y tabla de multiplicar**

1. Imprime una cuenta regresiva de 10 a 1 usando \`range()\`
2. Imprime la tabla de multiplicar del 7

Usa \`range(10, 0, -1)\` para la cuenta regresiva.`,
      codigoInicial: `print("=== CUENTA REGRESIVA ===")
for i in range(___, ___, ___):
    print(f"T-{i}...")
print("🚀 ¡DESPEGUE!")

print()
print("=== TABLA DEL 7 ===")
for i in range(___, ___):
    print(f"7 × {i} = {7 * i}")
`,
      testCases: [
        { descripcion: 'Cuenta regresiva desde T-10', outputEsperado: 'T-10...', esOculto: false },
        { descripcion: 'Termina con DESPEGUE', outputEsperado: '🚀 ¡DESPEGUE!', esOculto: false },
        { descripcion: 'Tabla del 7 hasta ×10', outputEsperado: '7 × 10 = 70', esOculto: false },
      ],
      pistas: [
        'Cuenta regresiva: range(10, 0, -1) va de 10 a 1',
        'Tabla del 7: range(1, 11) va de 1 a 10',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'T-10...', '🚀 ¡DESPEGUE!', '7 × 10 = 70')
          ? ok('¡Bucles ejecutados perfectamente!')
          : err('Revisa los parámetros de range(). Para contar hacia atrás usa paso -1.'),
    },
    {
      id: 'u2e3',
      titulo: 'Bucle while',
      dificultad: 'Intermedio',
      xp: 110,
      conceptos: ['while', 'condiciones', 'bucle'],
      descripcion: `**Misión: Monitor de combustible**

Usa un bucle \`while\` para simular el consumo de combustible.

- Combustible inicial: 100%
- Consumo por segundo: 15%
- Muestra \`🟢 OK\` si > 20%, \`🟡 BAJO\` si ≤ 20%, \`🔴 VACÍO\` si ≤ 0`,
      codigoInicial: `combustible = 100.0
consumo_por_segundo = 15.0
segundo = 0

print("=== INICIO DE MISIÓN ===")
print(f"Segundo {segundo}: Combustible = {combustible}%")

while ___:
    segundo += 1
    combustible -= consumo_por_segundo

    if ___:
        estado = "🔴 VACÍO"
    elif ___:
        estado = "🟡 BAJO"
    else:
        estado = "🟢 OK"

    print(f"Segundo {segundo}: Combustible = {combustible}% {estado}")

print(f"\\n🚀 Misión duró {segundo} segundos")
`,
      testCases: [
        { descripcion: 'Empieza con 100%', outputEsperado: 'Segundo 0: Combustible = 100.0%', esOculto: false },
        { descripcion: 'Muestra estado BAJO', outputEsperado: '🟡 BAJO', esOculto: false },
        { descripcion: 'Termina al llegar a 0', outputEsperado: '🚀 Misión duró 7 segundos', esOculto: false },
      ],
      pistas: [
        'La condición del while es: combustible > 0',
        'VACÍO cuando combustible <= 0',
        'BAJO cuando combustible <= 20',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Segundo 0: Combustible = 100.0%', '🟡 BAJO', '7 segundos')
          ? ok('¡Monitor de combustible operativo!')
          : err('Revisa la condición del while y los estados de combustible.'),
    },
    {
      id: 'u2e4',
      titulo: 'break y continue',
      dificultad: 'Intermedio',
      xp: 120,
      conceptos: ['break', 'continue', 'control de flujo'],
      descripcion: `**Misión: Escaneo de asteroides**

Itera sobre la lista de asteroides:
- Si está \`INACTIVO\`: usa \`continue\` para omitirlo
- Si es \`PELIGROSO\`: usa \`break\` para detener el escaneo`,
      codigoInicial: `asteroides = [
    {"id": "A01", "estado": "normal",    "tamaño": 50},
    {"id": "A02", "estado": "INACTIVO",  "tamaño": 30},
    {"id": "A03", "estado": "normal",    "tamaño": 85},
    {"id": "A04", "estado": "PELIGROSO", "tamaño": 200},
    {"id": "A05", "estado": "normal",    "tamaño": 40},
]

print("=== ESCANEO DE ASTEROIDES ===")
for asteroide in asteroides:
    if ___:
        print(f"  {asteroide['id']}: INACTIVO — omitido")
        ___

    if ___:
        print(f"⚠️  ¡ALERTA! {asteroide['id']} es PELIGROSO. Deteniendo escaneo.")
        ___

    print(f"  {asteroide['id']}: tamaño={asteroide['tamaño']}m — escaneando...")

print("Escaneo finalizado.")
`,
      testCases: [
        { descripcion: 'A02 omitido con continue', outputEsperado: 'A02: INACTIVO — omitido', esOculto: false },
        { descripcion: 'Alerta en A04', outputEsperado: '¡ALERTA! A04 es PELIGROSO', esOculto: false },
        { descripcion: 'A05 no aparece (break)', outputEsperado: 'Escaneo finalizado.', esOculto: false },
      ],
      pistas: [
        'Para INACTIVO: if asteroide["estado"] == "INACTIVO": ... continue',
        'Para PELIGROSO: if asteroide["estado"] == "PELIGROSO": ... break',
        'El orden importa: primero chequea INACTIVO, luego PELIGROSO',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'INACTIVO — omitido', '¡ALERTA! A04 es PELIGROSO', 'Escaneo finalizado.')
          ? ok('¡Escaneo completado! break y continue usados correctamente.')
          : err('Revisa el uso de break y continue. ¿Chequeaste el estado antes de escanear?'),
    },
    {
      id: 'u2e5',
      titulo: 'Bucles Anidados',
      dificultad: 'Avanzado',
      xp: 150,
      conceptos: ['bucles anidados', 'matrices', 'for'],
      descripcion: `**Misión: Mapa estelar**

Recorre una matriz 4×5 usando bucles anidados.

- Si el valor es \`1\`: imprime \`★ \`
- Si el valor es \`0\`: imprime \`· \`

Al final, cuenta e imprime las estrellas activas.`,
      codigoInicial: `mapa = [
    [1, 0, 1, 1, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 0, 1],
]

filas    = ___
columnas = ___
total_activos = 0

print("=== MAPA ESTELAR ===")
for fila in range(___):
    for col in range(___):
        celda = mapa[fila][col]
        if ___:
            print("★ ", end="")
            total_activos += 1
        else:
            print("· ", end="")
    print()

print(f"\\nEstrellas activas: {total_activos} de {filas * columnas}")
`,
      testCases: [
        { descripcion: 'Primera fila correcta', outputEsperado: '★ · ★ ★ ★', esOculto: false },
        { descripcion: 'Cuenta de estrellas', outputEsperado: 'Estrellas activas: 14 de 20', esOculto: false },
      ],
      pistas: [
        'filas = len(mapa), columnas = len(mapa[0])',
        'for fila in range(filas): for col in range(columnas):',
        'if celda == 1: imprime ★, else: imprime ·',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, '★ · ★ ★ ★', 'Estrellas activas: 14 de 20')
          ? ok('¡Mapa estelar generado correctamente!')
          : err('Revisa los bucles anidados y las dimensiones de la matriz.'),
    },
    {
      id: 'u2e6',
      titulo: 'Comprensión de Listas',
      dificultad: 'Avanzado',
      xp: 140,
      conceptos: ['list comprehension', 'zip', 'round', 'strip'],
      descripcion: `**Misión: Procesar datos de misiones**

Usa comprensión de listas y funciones de string para limpiar los datos de las misiones espaciales.

Completa cada línea usando las funciones adecuadas.`,
      codigoInicial: `distancias_raw = ["  384.4 ", "778500.0", "1432000.0", "4498000.0", "25000000000000.0"]
nombres_raw    = ["apolo 11", "juno", "voyager_1", "new horizons", "alfa centauri"]
temperaturas   = [-89, -65, 100, 150, -200]

# Convierte strings a float y elimina espacios
distancias_km = [___ for d in distancias_raw]

# Convierte nombres a Title Case
nombres = [___ for n in nombres_raw]

# Temperatura más extrema (mayor valor absoluto)
temp_extremas = [abs(t) for t in temperaturas]

# Combina nombres y distancias en tuplas
misiones = list(zip(___, ___))

print(f"Distancias (M km): {distancias_km}")
print(f"Nombres: {nombres}")
print(f"Temperaturas extremas: {temp_extremas}")
print(f"Misiones: {misiones}")
`,
      testCases: [
        { descripcion: 'Distancias como floats', outputEsperado: '384.4', esOculto: false },
        { descripcion: 'Nombres en Title Case', outputEsperado: 'Apolo 11', esOculto: false },
        { descripcion: 'Zip de misiones', outputEsperado: "('Apolo 11', 384.4)", esOculto: false },
      ],
      pistas: [
        'distancias_km = [float(d.strip()) for d in distancias_raw]',
        'nombres = [n.title() for n in nombres_raw]',
        'misiones = list(zip(nombres, distancias_km))',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, '384.4', 'Apolo 11', 'Alfa Centauri')
          ? ok('¡Datos de misiones procesados perfectamente!')
          : err('Revisa float(), strip() y title(). El zip debe combinar nombres y distancias.'),
    },
  ],
};

// ─── UNIDAD 3 — Funciones ─────────────────────────────────────────────────────

const u3: Unidad = {
  id: 3,
  titulo: 'Funciones',
  descripcion: 'Crea funciones reutilizables, maneja parámetros, *args, **kwargs y recursión.',
  icono: '⚡',
  colorAccent: '#f59e0b',
  colorGlow: 'rgba(245,158,11,0.4)',
  prerequisito: 2,
  ejercicios: [
    {
      id: 'u3e1',
      titulo: 'Funciones Básicas',
      dificultad: 'Principiante',
      xp: 100,
      conceptos: ['def', 'return', 'parámetros'],
      descripcion: `**Misión: Calculadoras de conversión**

Crea tres funciones de conversión:
1. \`km_a_millas(km)\`: multiplica por \`0.621371\`
2. \`celsius_a_fahrenheit(c)\`: fórmula \`(c × 9/5) + 32\`
3. \`calcular_imc(peso, altura)\`: \`peso / altura²\``,
      codigoInicial: `def km_a_millas(km):
    return ___

def celsius_a_fahrenheit(c):
    return ___

def calcular_imc(peso, altura):
    return ___

print(f"384,400 km = {km_a_millas(384400):.2f} millas")
print(f"-273°C = {celsius_a_fahrenheit(-273):.2f}°F")
print(f"IMC (70kg, 1.75m) = {calcular_imc(70, 1.75):.2f}")
`,
      testCases: [
        { descripcion: 'Conversión km a millas', outputEsperado: '238857.94 millas', esOculto: false },
        { descripcion: 'Conversión Celsius a Fahrenheit', outputEsperado: '-459.40°F', esOculto: false },
        { descripcion: 'Cálculo IMC', outputEsperado: 'IMC (70kg, 1.75m) = 22.86', esOculto: false },
      ],
      pistas: [
        'km_a_millas: return km * 0.621371',
        'celsius_a_fahrenheit: return (c * 9/5) + 32',
        'calcular_imc: return peso / (altura ** 2)',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, '238857.94', '-459.40', '22.86')
          ? ok('¡Funciones de conversión perfectas!')
          : err('Revisa las fórmulas. ¿Usaste ** para la potencia en el IMC?'),
    },
    {
      id: 'u3e2',
      titulo: 'Funciones y Strings',
      dificultad: 'Intermedio',
      xp: 120,
      conceptos: ['strings', 'slicing', '[::-1]', 'upper'],
      descripcion: `**Misión: Decodificador de mensajes**

Crea una función \`procesar_mensaje\` que:
1. Invierta el mensaje si es \`CRÍTICO\` (usando \`[::-1]\`)
2. Lo convierta a mayúsculas si es \`URGENTE\`
3. Lo deje como está si es \`NORMAL\`
4. Trunca a 50 chars si es muy largo`,
      codigoInicial: `def procesar_mensaje(texto, nivel="NORMAL", max_chars=50):
    if nivel == "CRÍTICO":
        texto = ___   # invertir con [::-1]
    elif nivel == "URGENTE":
        texto = ___   # convertir a mayúsculas

    if len(texto) > max_chars:
        texto = ___   # truncar + "..."

    return texto

mensajes = [
    ("Base Luna", "Todo en orden", "NORMAL"),
    ("Terra", "¡Meteorito!", "CRÍTICO"),
    ("Marte", "A" * 60, "NORMAL"),
]

for destino, msg, nivel in mensajes:
    procesado = procesar_mensaje(msg, nivel)
    icono = "🔴" if nivel == "CRÍTICO" else "🟢"
    print(f"{icono} [{nivel}] Para: {destino}")
    print(f"Mensaje: {procesado}")
    print(f"Longitud: {len(procesado)} chars")
    print()
`,
      testCases: [
        { descripcion: 'Mensaje NORMAL sin cambios', outputEsperado: 'Todo en orden', esOculto: false },
        { descripcion: 'Mensaje CRÍTICO invertido', outputEsperado: '!OITEROM¡', esOculto: false },
        { descripcion: 'Mensaje largo truncado', outputEsperado: '50 chars', esOculto: false },
      ],
      pistas: [
        'Invertir: texto[::-1]',
        'Mayúsculas: texto.upper()',
        'Truncar: texto[:max_chars] + "..."',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Todo en orden', '!OITEROM¡', '50 chars')
          ? ok('¡Decodificador operativo!')
          : err('Revisa [::-1] para invertir y upper() para mayúsculas.'),
    },
    {
      id: 'u3e3',
      titulo: '*args y **kwargs',
      dificultad: 'Avanzado',
      xp: 160,
      conceptos: ['*args', '**kwargs', 'funciones avanzadas'],
      descripcion: `**Misión: Sistema de carga flexible**

Crea funciones que usen \`*args\` y \`**kwargs\`:

1. \`calcular_masa_total(*masas_kg)\`: suma todos los argumentos
2. \`mostrar_tripulacion(**datos_extra)\`: imprime datos del astronauta
3. \`reporte_lanzamiento(*pasos, **metadatos)\`: imprime pasos y metadatos`,
      codigoInicial: `def calcular_masa_total(*masas_kg):
    return ___

def mostrar_tripulante(**datos_extra):
    for clave, valor in ___:
        print(f"   {clave.replace('_', ' ').title()}: {valor}")

def reporte_lanzamiento(*pasos, **metadatos):
    print("═══ PRE-LANZAMIENTO ═══")
    for i, paso in enumerate(___, 1):
        print(f"{i}. {paso}")
    print("── Metadatos ──")
    for k, v in ___:
        print(f"   {k}: {v}")

total = calcular_masa_total(8000, 12000, 9500, 6200, 8500)
promedio = total / 5
print(f"Masa total: {total} kg | Promedio: {promedio:.0f} kg")
print()

print("👨‍🚀 Valentina Cruz")
mostrar_tripulante(Rol="Comandante", Edad=35, Especialidad="Astrofísica", Horas_Vuelo=2400)

print()
reporte_lanzamiento(
    "Sistemas verificados", "Combustible al 87%", "Tripulación lista",
    fecha="2024-03-15", mision_id="PQ-042"
)
`,
      testCases: [
        { descripcion: 'Masa total correcta', outputEsperado: 'Masa total: 44200 kg', esOculto: false },
        { descripcion: 'Datos del tripulante', outputEsperado: 'Rol: Comandante', esOculto: false },
        { descripcion: 'Reporte de lanzamiento', outputEsperado: '1. Sistemas verificados', esOculto: false },
      ],
      pistas: [
        'calcular_masa_total: return sum(masas_kg)',
        'mostrar_tripulante: for clave, valor in datos_extra.items()',
        'reporte_lanzamiento: itera pasos y metadatos.items()',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Masa total: 44200 kg', 'Rol: Comandante', '1. Sistemas verificados')
          ? ok('¡Funciones con *args y **kwargs dominadas!')
          : err('Revisa sum(masas_kg) y .items() para iterar sobre kwargs.'),
    },
    {
      id: 'u3e4',
      titulo: 'Recursión',
      dificultad: 'Avanzado',
      xp: 180,
      conceptos: ['recursión', 'caso base', 'fibonacci'],
      descripcion: `**Misión: Algoritmos recursivos**

Implementa tres funciones recursivas:
1. \`fibonacci(n)\`: retorna el n-ésimo número de Fibonacci
2. \`potencia(base, exp)\`: calcula base^exp sin usar \`**\`
3. \`suma_digitos(n)\`: suma los dígitos de un número`,
      codigoInicial: `def fibonacci(n):
    if ___:      # caso base
        return n
    return ___   # llamada recursiva

def potencia(base, exp):
    if exp == 0:
        return ___
    return ___   # base * potencia recursiva

def suma_digitos(n):
    if ___:      # número de un dígito
        return n
    return ___   # último dígito + suma del resto

print("Fibonacci:")
for i in range(10):
    print(f"  F({i}) = {fibonacci(i)}")

print(f"\\n2^10 = {potencia(2, 10)}")
print(f"3^5  = {potencia(3, 5)}")
print(f"Suma dígitos 9876 = {suma_digitos(9876)}")
`,
      testCases: [
        { descripcion: 'Fibonacci(9) = 34', outputEsperado: 'F(9) = 34', esOculto: false },
        { descripcion: '2^10 = 1024', outputEsperado: '2^10 = 1024', esOculto: false },
        { descripcion: 'Suma dígitos 9876 = 30', outputEsperado: 'Suma dígitos 9876 = 30', esOculto: false },
      ],
      pistas: [
        'fibonacci: caso base n <= 1, retorna fibonacci(n-1) + fibonacci(n-2)',
        'potencia: retorna base * potencia(base, exp-1)',
        'suma_digitos: retorna n%10 + suma_digitos(n//10)',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'F(9) = 34', '2^10 = 1024', 'Suma dígitos 9876 = 30')
          ? ok('¡Recursión dominada! Las funciones funcionan correctamente.')
          : err('Revisa los casos base y las llamadas recursivas.'),
    },
  ],
};

// ─── UNIDAD 4 — Estructuras de Datos ─────────────────────────────────────────

const u4: Unidad = {
  id: 4,
  titulo: 'Estructuras de Datos',
  descripcion: 'Listas, diccionarios, conjuntos y tuplas. Las herramientas para organizar tu misión.',
  icono: '🔭',
  colorAccent: '#8b5cf6',
  colorGlow: 'rgba(139,92,246,0.4)',
  prerequisito: 3,
  ejercicios: [
    {
      id: 'u4e1',
      titulo: 'Listas',
      dificultad: 'Principiante',
      xp: 100,
      conceptos: ['listas', 'append', 'insert', 'remove', 'sort'],
      descripcion: `**Misión: Gestionar la tripulación**

Completa las operaciones sobre la lista de tripulantes:
- \`append()\`: añadir al final
- \`insert()\`: insertar en posición específica  
- \`remove()\`: eliminar por valor
- \`sort()\`: ordenar
- \`index()\`: encontrar posición`,
      codigoInicial: `tripulacion = ["Valentina", "Yuri", "Neil", "Mae"]

# Añade "Sally" al final
tripulacion.___("Sally")

# Inserta "Comandante Chen" al inicio (índice 0)
tripulacion.___(0, "Comandante Chen")

# Ordena la lista
tripulacion.___()

primera = tripulacion[___]
ultima  = tripulacion[___]
pos_neil = tripulacion.___(___) + 1  # +1 para base 1

print(f"Tripulación ({len(tripulacion)} miembros): {tripulacion}")
print(f"Ordenada: {sorted(tripulacion)}")
print(f"Primera: {primera} | Última: {ultima}")
print(f"Posición de Neil: {pos_neil}")
`,
      testCases: [
        { descripcion: '6 miembros en tripulación', outputEsperado: 'Tripulación (6 miembros)', esOculto: false },
        { descripcion: 'Posición de Neil', outputEsperado: 'Posición de Neil: 3', esOculto: false },
      ],
      pistas: [
        'append("Sally"), insert(0, "Comandante Chen"), sort()',
        'primera = tripulacion[0], ultima = tripulacion[-1]',
        'pos_neil = tripulacion.index("Neil") + 1',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Tripulación (6 miembros)', 'Posición de Neil: 3')
          ? ok('¡Lista de tripulación gestionada correctamente!')
          : err('Revisa append(), insert(), sort() e index().'),
    },
    {
      id: 'u4e2',
      titulo: 'Diccionarios',
      dificultad: 'Intermedio',
      xp: 130,
      conceptos: ['dict', 'keys', 'values', 'items', 'lambda'],
      descripcion: `**Misión: Base de datos de misiones**

Trabaja con el diccionario de misiones espaciales.

- Filtra las misiones exitosas
- Cuenta las misiones tripuladas
- Encuentra la misión más reciente usando \`max()\` y \`lambda\``,
      codigoInicial: `misiones = {
    "apolo_11":   {"año": 1969, "exito": True,  "tripulada": True,  "nombre": "Apolo 11"},
    "mars_2030":  {"año": 2030, "exito": False, "tripulada": True,  "nombre": "Mars 2030"},
    "voyager_1":  {"año": 1977, "exito": True,  "tripulada": False, "nombre": "Voyager 1"},
    "europa_2035":{"año": 2035, "exito": None,  "tripulada": True,  "nombre": "Europa 2035"},
}

exitosas  = [___ for k, v in misiones.items() if v["exito"] == True]
tripuladas = sum(1 for v in misiones.___() if v["tripulada"])
mas_reciente = max(misiones, key=lambda k: misiones[k][___])

print(f"Misiones exitosas: {exitosas}")
print(f"Misiones tripuladas: {tripuladas}")
print(f"Misión más reciente: {mas_reciente} ({misiones[mas_reciente]['año']})")
print()
print("=== RESUMEN DE MISIONES ===")
for clave, datos in misiones.___():
    estado = "[✓]" if datos["exito"] == True else "[✗]" if datos["exito"] == False else "[?]"
    print(f"  {estado} {datos['nombre']} ({datos['año']})")
`,
      testCases: [
        { descripcion: 'Misiones exitosas listadas', outputEsperado: "Misiones exitosas: ['apolo_11', 'voyager_1']", esOculto: false },
        { descripcion: 'Misiones tripuladas = 3', outputEsperado: 'Misiones tripuladas: 3', esOculto: false },
        { descripcion: 'Más reciente es europa_2035', outputEsperado: 'europa_2035 (2035)', esOculto: false },
      ],
      pistas: [
        'exitosas = [k for k, v in misiones.items() if v["exito"] == True]',
        'tripuladas: misiones.values()',
        'max con lambda: lambda k: misiones[k]["año"]',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, "['apolo_11', 'voyager_1']", 'Misiones tripuladas: 3', 'europa_2035 (2035)')
          ? ok('¡Base de datos de misiones operativa!')
          : err('Revisa .items(), .values() y el lambda en max().'),
    },
    {
      id: 'u4e3',
      titulo: 'Conjuntos (Sets)',
      dificultad: 'Intermedio',
      xp: 140,
      conceptos: ['set', 'union', 'intersection', 'difference'],
      descripcion: `**Misión: Análisis de tripulaciones**

Usa operaciones de conjuntos para analizar los astronautas de cada misión:
- \`|\` unión, \`&\` intersección, \`-\` diferencia, \`^\` diferencia simétrica`,
      codigoInicial: `luna    = {"Ana", "Carlos", "Diana", "Eduardo"}
marte   = {"Ana", "Fiona", "Gabriel", "Hannah", "Diana"}
europa  = {"Ivan", "Julia"}

todos = luna ___ marte ___ europa
en_todas = luna ___ marte ___ europa
solo_luna = luna ___ marte ___ europa

luna_xor_marte = luna ___ marte

esta_carlos_europa = "Carlos" ___ europa

luna.add("Karen")

print(f"Total astronautas únicos: {len(todos)}")
print(f"En todas las misiones: {en_todas}")
print(f"Solo en Luna: {sorted(solo_luna)}")
print(f"Luna XOR Marte: {sorted(luna_xor_marte)}")
print(f"¿Carlos en Europa? {esta_carlos_europa}")
print(f"Luna actualizada: {sorted(luna)}")
`,
      testCases: [
        { descripcion: '10 astronautas únicos', outputEsperado: 'Total astronautas únicos: 10', esOculto: false },
        { descripcion: 'Solo Eduardo en Luna', outputEsperado: "Solo en Luna: ['Eduardo']", esOculto: false },
        { descripcion: 'Carlos no está en Europa', outputEsperado: '¿Carlos en Europa? False', esOculto: false },
      ],
      pistas: [
        'Unión: |, Intersección: &, Diferencia: -, XOR: ^',
        'en_todas = luna & marte & europa',
        'solo_luna = luna - marte - europa',
        '"Carlos" in europa',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Total astronautas únicos: 10', "['Eduardo']", '¿Carlos en Europa? False')
          ? ok('¡Operaciones de conjuntos ejecutadas correctamente!')
          : err('Revisa los operadores: | unión, & intersección, - diferencia, ^ XOR.'),
    },
    {
      id: 'u4e4',
      titulo: 'Tuplas',
      dificultad: 'Avanzado',
      xp: 150,
      conceptos: ['tuplas', 'desempaquetado', 'named tuples'],
      descripcion: `**Misión: Coordenadas estelares**

Trabaja con tuplas de coordenadas (RA, DEC, distancia):
- Desempaqueta tuplas para acceder a sus valores
- Usa slicing \`[::-1]\` para invertir
- Calcula estadísticas de las distancias`,
      codigoInicial: `estrellas = [
    ("Sol",        0.0,    0.0,   0.0),
    ("Sirius",     101.28, -16.71, 8.6),
    ("Betelgeuse", 88.79,  7.41,  700.0),
    ("Andrómeda",  10.68,  41.27, 2537000.0),
]

# Desempaqueta la primera tupla
nombre_sol, ra_s, dec_s, dist_s = estrellas[___]
print(f"Sol: RA={ra_s}, DEC={dec_s}, Dist={dist_s} ly")

# Ordena por distancia (4to elemento)
por_distancia = sorted(estrellas, key=lambda e: e[___])

print("\nEstrellas por distancia:")
for nombre, ra, dec, dist in ___:
    print(f"  {nombre:<14} → {dist:>14,.1f} ly")

# Intercambia RA y DEC de Sirius
nombre, ra, dec, dist = estrellas[1]
sirius_swapped = (nombre, ___, ___, dist)
print(f"\nSirius swapped: RA={sirius_swapped[1]}, DEC={sirius_swapped[2]}")

# Estadísticas
distancias = [e[___] for e in estrellas]
print(f"\nStats: min={min(distancias)}, max={max(distancias):,}, avg={sum(distancias)/len(distancias):,.1f} ly")
`,
      testCases: [
        { descripcion: 'Desempaquetado del Sol', outputEsperado: 'Sol: RA=0.0, DEC=0.0, Dist=0.0 ly', esOculto: false },
        { descripcion: 'Sirius con RA y DEC intercambiados', outputEsperado: 'Sirius swapped: RA=-16.71, DEC=101.28', esOculto: false },
        { descripcion: 'Estadísticas correctas', outputEsperado: 'min=0.0', esOculto: false },
      ],
      pistas: [
        'estrellas[0] es el Sol, estrellas[1] es Sirius',
        'sorted key: lambda e: e[3] (índice de distancia)',
        'sirius_swapped = (nombre, dec, ra, dist)',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Sol: RA=0.0, DEC=0.0, Dist=0.0 ly', 'RA=-16.71, DEC=101.28', 'min=0.0')
          ? ok('¡Coordenadas estelares calculadas correctamente!')
          : err('Revisa el desempaquetado de tuplas y los índices.'),
    },
  ],
};

// ─── UNIDAD 5 — Programación Orientada a Objetos ─────────────────────────────

const u5: Unidad = {
  id: 5,
  titulo: 'Programación Orientada a Objetos',
  descripcion: 'Clases, objetos, herencia y polimorfismo. Construye naves con arquitectura sólida.',
  icono: '🤖',
  colorAccent: '#10b981',
  colorGlow: 'rgba(16,185,129,0.4)',
  prerequisito: 4,
  ejercicios: [
    {
      id: 'u5e1',
      titulo: 'Clases y Objetos',
      dificultad: 'Intermedio',
      xp: 150,
      conceptos: ['class', '__init__', 'self', 'métodos'],
      descripcion: `**Misión: Construir una nave espacial**

Crea la clase \`NaveEspacial\` con:
- Atributos: \`nombre\`, \`tipo\`, \`velocidad_actual\`, \`velocidad_max\`, \`combustible\`
- Método \`acelerar(delta)\`: aumenta velocidad sin superar el máximo
- Método \`estado()\`: imprime el panel de control
- Variable de clase \`total_naves\` que cuenta las naves creadas`,
      codigoInicial: `class NaveEspacial:
    total_naves = ___

    def __init__(self, nombre, tipo, velocidad_max, combustible=100):
        self.nombre         = ___
        self.tipo           = ___
        self.velocidad_max  = ___
        self.velocidad_actual = 0
        self.combustible    = combustible
        NaveEspacial.___ += 1

    def acelerar(self, delta):
        self.velocidad_actual = min(self.velocidad_actual + delta, self.___)
        print(f"{self.nombre} acelera a {self.velocidad_actual} km/h")

    def estado(self):
        barra = "█" * (self.combustible // 10) + "░" * (10 - self.combustible // 10)
        print(f"🚀 {self.nombre} ({self.tipo})")
        print(f"   Velocidad: {self.velocidad_actual}/{self.velocidad_max} km/h")
        print(f"   Combustible: [{barra}] {self.combustible}%")

    def __repr__(self):
        return f"NaveEspacial('{self.nombre}', {self.velocidad_actual} km/h)"

aurora = NaveEspacial("Aurora", "Tipo-X", 40000, combustible=65)
fenix  = NaveEspacial("Fénix",  "Tipo-Z", 55000, combustible=75)

aurora.acelerar(15000)
aurora.acelerar(25000)
print()
aurora.estado()
print()
fenix.estado()
print(f"\\nTotal naves creadas: {NaveEspacial.total_naves}")
print(repr(aurora))
`,
      testCases: [
        { descripcion: 'Aurora acelera correctamente', outputEsperado: 'Aurora acelera a 15000 km/h', esOculto: false },
        { descripcion: 'No supera velocidad máxima', outputEsperado: 'Aurora acelera a 40000 km/h', esOculto: false },
        { descripcion: 'Total naves = 2', outputEsperado: 'Total naves creadas: 2', esOculto: false },
      ],
      pistas: [
        'total_naves = 0 (variable de clase)',
        'self.nombre = nombre en __init__',
        'acelerar: min(actual + delta, self.velocidad_max)',
        'NaveEspacial.total_naves += 1',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Aurora acelera a 15000 km/h', 'Aurora acelera a 40000 km/h', 'Total naves creadas: 2')
          ? ok('¡Clase NaveEspacial implementada correctamente!')
          : err('Revisa __init__, el método acelerar y el contador total_naves.'),
    },
    {
      id: 'u5e2',
      titulo: 'Herencia',
      dificultad: 'Avanzado',
      xp: 200,
      conceptos: ['herencia', 'super()', 'polimorfismo', 'override'],
      descripcion: `**Misión: Flota espacial con herencia**

Crea una jerarquía de clases:
- \`NaveBase\`: clase padre con \`nombre\`, \`masa_kg\`, \`propulsion\`
- \`NaveHabitada(NaveBase)\`: añade \`tripulacion\` y método \`embarcar()\`
- \`Satelite(NaveBase)\`: añade \`tipo_satelite\` y \`periodo_orbital\``,
      codigoInicial: `class NaveBase:
    def __init__(self, nombre, masa_kg, propulsion):
        self.nombre     = nombre
        self.masa_kg    = masa_kg
        self.propulsion = propulsion

    def info(self):
        print(f"{self.nombre} | Masa: {self.masa_kg:,} kg | Propulsión: {self.propulsion}")

class NaveHabitada(___):
    def __init__(self, nombre, masa_kg, propulsion, capacidad_max):
        ___(nombre, masa_kg, propulsion)  # llamar al padre
        self.tripulacion   = []
        self.capacidad_max = capacidad_max

    def embarcar(self, astronauta):
        if len(self.tripulacion) < self.capacidad_max:
            self.___.append(astronauta)
            print(f"✓ {astronauta} embarcado/a")
        else:
            print(f"✗ Nave llena")

    def info(self):
        super().___()
        print(f"Tipo: Nave Habitada")
        print(f"Tripulación ({len(self.tripulacion)}/{self.capacidad_max}): {', '.join(self.tripulacion)}")

class Satelite(___):
    def __init__(self, nombre, masa_kg, propulsion, tipo_satelite, periodo_orbital_h):
        ___(nombre, masa_kg, propulsion)
        self.tipo_satelite     = tipo_satelite
        self.periodo_orbital_h = periodo_orbital_h

    def info(self):
        super().___()
        print(f"Tipo: Satélite ({self.tipo_satelite})")
        print(f"Período orbital: {self.periodo_orbital_h:.2f} horas")

iss     = NaveHabitada("ISS", 419725, "Motor iónico", 6)
hubble  = Satelite("Hubble", 11110, "Cohete portador", "Observación", 1.6)
starlink = Satelite("Starlink-123", 260, "Ion thruster", "Telecomunicaciones", 1.5)

iss.info()
for a in ["Ana", "Carlos", "Diana"]:
    iss.embarcar(a)
print()
hubble.info()

print()
print("=== FLOTA ===")
flota = [iss, starlink, hubble]
for nave in ___:
    tipo = "Nave Habitada" if isinstance(nave, ___) else f"Satélite ({nave.tipo_satelite})"
    print(f"  {tipo:<30} → {nave.nombre}")
`,
      testCases: [
        { descripcion: 'ISS con tripulación', outputEsperado: 'Tripulación (3/6): Ana, Carlos, Diana', esOculto: false },
        { descripcion: 'Hubble período orbital', outputEsperado: 'Período orbital: 1.60 horas', esOculto: false },
        { descripcion: 'Flota listada', outputEsperado: '=== FLOTA ===', esOculto: false },
      ],
      pistas: [
        'class NaveHabitada(NaveBase): usa super().__init__()',
        'embarcar: self.tripulacion.append(astronauta)',
        'info() de hija: super().info() + datos propios',
        'isinstance(nave, NaveHabitada)',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, 'Tripulación (3/6): Ana, Carlos, Diana', 'Período orbital: 1.60 horas', '=== FLOTA ===')
          ? ok('¡Herencia implementada perfectamente!')
          : err('Revisa super().__init__(), los métodos override y isinstance().'),
    },
  ],
};

// ─── UNIDAD 6 — Manejo de Errores ────────────────────────────────────────────

const u6: Unidad = {
  id: 6,
  titulo: 'Manejo de Errores',
  descripcion: 'try/except/raise, excepciones personalizadas. Protege tu nave de fallos inesperados.',
  icono: '🛡️',
  colorAccent: '#ef4444',
  colorGlow: 'rgba(239,68,68,0.4)',
  prerequisito: 5,
  ejercicios: [
    {
      id: 'u6e1',
      titulo: 'try / except / raise',
      dificultad: 'Intermedio',
      xp: 160,
      conceptos: ['try', 'except', 'raise', 'ValueError'],
      descripcion: `**Misión: Validar telemetría de la nave**

Implementa el manejo de errores para procesar datos de sensores:

- Usa \`try / except\` para capturar errores
- Usa \`raise ValueError\` para lanzar errores personalizados
- Valida: formato, velocidad negativa, conversión a float`,
      codigoInicial: `def procesar_telemetria(datos_str):
    """
    datos_str formato: "velocidad,altitud,temperatura"
    Retorna dict con los valores o lanza ValueError
    """
    try:
        partes = datos_str.split(",")
        if len(partes) != 3:
            raise ValueError(f"Formato inválido: se esperan 3 valores, se recibieron {len(partes)}")

        velocidad   = ___(partes[0])
        altitud     = ___(partes[1])
        temperatura = ___(partes[2])

        if velocidad < 0:
            raise ValueError(f"Velocidad negativa no permitida: {velocidad}")

        return {"velocidad": velocidad, "altitud": altitud, "temperatura": temperatura}

    except ValueError as e:
        raise ___

    except Exception as e:
        raise ValueError(f"Error convirtiendo datos: {e}")

lecturas = ["28000.5,420.0,-89.2", "NO_SEÑAL", "-500,300,25", "abc,def,ghi"]

for lectura in lecturas:
    try:
        resultado = procesar_telemetria(lectura)
        print(f"✓ OK: {resultado}")
    except ValueError as e:
        print(f"✗ ValueError: {e}")
    finally:
        print(f"  [procesado: {repr(lectura)}]")
`,
      testCases: [
        { descripcion: 'Lectura válida procesada', outputEsperado: "✓ OK: {'velocidad': 28000.5", esOculto: false },
        { descripcion: 'Error de formato detectado', outputEsperado: 'Formato inválido: se esperan 3 valores', esOculto: false },
        { descripcion: 'Velocidad negativa rechazada', outputEsperado: 'Velocidad negativa no permitida', esOculto: false },
        { descripcion: 'Finally siempre ejecutado', outputEsperado: '[procesado:', esOculto: false },
      ],
      pistas: [
        'Usa float() para convertir los valores',
        'raise ValueError(f"...") para errores personalizados',
        'except ValueError as e: raise e (re-lanzar el mismo error)',
        'finally siempre se ejecuta, incluso con excepciones',
      ],
      validar: (_c, salida) =>
        salidaContiene(salida, "✓ OK: {'velocidad': 28000.5", 'Formato inválido', 'Velocidad negativa no permitida', '[procesado:')
          ? ok('¡Manejo de errores implementado correctamente!')
          : err('Revisa try/except/raise. ¿Estás usando float() y raise ValueError correctamente?'),
    },
  ],
};

// ─── Registro de unidades ─────────────────────────────────────────────────────

export const UNIDADES: Unidad[] = [u1, u2, u3, u4, u5, u6];

export const totalEjercicios = UNIDADES.reduce((sum, u) => sum + u.ejercicios.length, 0);

// ─── Funciones auxiliares ─────────────────────────────────────────────────────

export function getUnidad(id: number): Unidad | undefined {
  return UNIDADES.find(u => u.id === id);
}

export function getEjercicio(unidadId: number, ejercicioId: string): Ejercicio | undefined {
  return getUnidad(unidadId)?.ejercicios.find(e => e.id === ejercicioId);
}