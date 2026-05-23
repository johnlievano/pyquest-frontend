import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { UNIDADES, getEjercicio, getUnidad } from '../exercises';
import { ejecutarCodigo } from '../lib/api';

// ─── Tipos ───────────────────────────────────────────────────────
type FaseEjecucion = 'idle' | 'compilando' | 'ejecutando' | 'ok' | 'error' | 'success';

interface ResultadoEjecucion {
  salida: string;
  ok: boolean;
  mensaje: string;
  xpGanado: number;
  tiempoMs: number;
}

// ─── Simulador de ejecución Python (cliente-side) ────────────────
// En producción reemplazar con llamada a /api/compiler
const simularEjecucion = async (
  codigo: string,
  ejercicioId: string,
  unidadId: number,
): Promise<ResultadoEjecucion> => {
  try {
    return await ejecutarCodigo({ codigo, ejercicioId, unidadId });
  } catch (err) {
    // Fallback al simulador local si el backend no responde
    console.warn('Backend no disponible, usando simulador:', err);
    const inicio = Date.now();
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    const ejercicio = getEjercicio(unidadId, ejercicioId);
    if (!ejercicio) {
      return { salida: 'Error: ejercicio no encontrado.', ok: false, mensaje: '', xpGanado: 0, tiempoMs: 0 };
    }
    const salidaSimulada = generarSalidaSimulada(codigo, ejercicioId);
    const resultado = ejercicio.validar(codigo, salidaSimulada);
    return {
      salida: salidaSimulada,
      ok: resultado.ok,
      mensaje: resultado.mensaje,
      xpGanado: resultado.ok ? ejercicio.xp : 0,
      tiempoMs: Date.now() - inicio,
    };
  }
};

// Genera salida simulada inteligente según el ejercicio
function generarSalidaSimulada(codigo: string, ejercicioId: string): string {
  const c = codigo;

  switch (ejercicioId) {
    case 'u1e1':
      if (c.includes('print') && (c.includes('"Hola, Universo!"') || c.includes("'Hola, Universo!'")))
        return 'Hola, Universo!';
      if (c.includes('print'))
        return extractPrintContent(c);
      return 'Error: sin output';

    case 'u1e2':
      if (c.includes('___')) return 'SyntaxError: invalid syntax (línea con ___)';
      if (c.includes('str') && c.includes('int') && c.includes('float') && c.includes('bool'))
        return 'Nombre: Carlos — Tipo: str\nEdad: 28 — Tipo: int\nAltura: 1.75 — Tipo: float\nActivo: True — Tipo: bool';
      return 'NameError: name \'___\' is not defined';

    case 'u1e3':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('base') && c.includes('altura') && c.includes('area') && c.includes('perimetro'))
        return 'Área: 60\nPerímetro: 34\n¿Es el área mayor que 50? True';
      return 'Error en el cálculo';

    case 'u1e4':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes(':.2f') && c.includes('horas_vuelo'))
        return '=== FICHA DE ASTRONAUTA ===\nNombre: Valentina | Nivel: Comandante\nEdad: 30 años | Misión: Órbita Lunar\nHoras de vuelo: 1247 (≈ 51.96 días)\n===========================';
      return 'Falta el formato :.2f';

    case 'u1e5':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('2024') && c.includes('anio_nacimiento'))
        return '¡Hola, Luna!\nTienes aproximadamente 24 años.\nNaciste en el año 2000.';
      return 'Error en el cálculo de edad';

    case 'u1e6':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      return '=== COMPARATIVA DE NAVES ===\n¿Alfa es más rápida que Beta? False\n¿Tienen la misma tripulación? False\n¿Beta tiene más combustible? False\n¿Alfa tiene velocidad >= 28000? True\n¿La suma de tripulaciones es 12? True';

    case 'u1e7':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('and') && c.includes('or') && c.includes('not'))
        return '¿Puede entrar? True\n¿Acceso total? False\n¿Operación normal? True';
      return 'Faltan operadores lógicos';

    case 'u1e8':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('datos_raw['))
        return 'Altitud: 420.5 km\nVelocidad: 7800 m/s\nTemperatura: -89.2°C\nMódulo activo: True\nTripulantes: 6\nVelocidad en km/h: 28080.0';
      return 'TypeError: float() argument must be a string or a number';

    case 'u2e1':
      if (!c.includes('velocidad_kmh < 1000') && !c.includes('< 1000'))
        return 'IndentationError o lógica incorrecta';
      return '500 km/h → Suborbital\n3500 km/h → Orbital\n9800 km/h → Escape\n25000 km/h → Interestelar';

    case 'u2e2':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('range') && c.includes('-1') && c.includes('7 *'))
        return '=== CUENTA REGRESIVA ===\nT-10...\nT-9...\nT-8...\nT-7...\nT-6...\nT-5...\nT-4...\nT-3...\nT-2...\nT-1...\n🚀 ¡DESPEGUE!\n\n=== TABLA DEL 7 ===\n7 × 1 = 7\n7 × 2 = 14\n7 × 3 = 21\n7 × 4 = 28\n7 × 5 = 35\n7 × 6 = 42\n7 × 7 = 49\n7 × 8 = 56\n7 × 9 = 63\n7 × 10 = 70';
      return 'Error en range() o multiplicación';

    case 'u2e3':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('consumo_por_segundo') && c.includes('while'))
        return '=== INICIO DE MISIÓN ===\nSegundo 0: Combustible = 100.0%\nSegundo 1: Combustible = 85.0% 🟢 OK\nSegundo 2: Combustible = 70.0% 🟢 OK\nSegundo 3: Combustible = 55.0% 🟢 OK\nSegundo 4: Combustible = 40.0% 🟢 OK\nSegundo 5: Combustible = 25.0% 🟡 BAJO\nSegundo 6: Combustible = 10.0% 🟡 BAJO\nSegundo 7: Combustible = 0.0% 🔴 VACÍO\n\n🚀 Misión duró 7 segundos';
      return 'Error en el bucle while';

    case 'u2e4':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('continue') && c.includes('break'))
        return '=== ESCANEO DE ASTEROIDES ===\n  A01: tamaño=50m — escaneando...\n  A02: INACTIVO — omitido\n  A03: tamaño=85m — escaneando...\n⚠️  ¡ALERTA! A04 es PELIGROSO. Deteniendo escaneo.\nEscaneo finalizado.';
      if (!c.includes('continue')) return 'Falta el continue para omitir inactivos';
      if (!c.includes('break')) return 'Falta el break para detener el escaneo';
      return 'Error en break/continue';

    case 'u2e5':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('total_activos') && c.includes('filas') && c.includes('columnas'))
        return '=== MAPA ESTELAR ===\n★ · ★ ★ ★ \n★ ★ · ★ ★ \n· ★ ★ ★ · \n★ ★ ★ · ★ \n\nEstrellas activas: 14 de 20';
      return 'Error en los bucles anidados';

    case 'u2e6':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('round') && c.includes('strip') && c.includes('title'))
        return "Distancias (M km): [384.4, 778500.0, 1432000.0, 4498000.0, 25000000000000.0]\nNombres: ['Apolo 11', 'Juno', 'Voyager_1', 'New Horizons', 'Alfa Centauri']\nTemperaturas extremas: [-89, -65, 100, 150, -200]\nMisiones: [('Apolo 11', 384.4), ('Juno', 778500.0), ('Voyager_1', 1432000.0), ('New Horizons', 4498000.0), ('Alfa Centauri', 25000000000000.0)]";
      return 'Error en comprensión de listas';

    case 'u3e1':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('0.621371') && c.includes('9/5') && c.includes('**'))
        return '384,400 km = 238857.94 millas\n-273°C = -459.40°F\nIMC (70kg, 1.75m) = 22.86';
      return 'Revisa las fórmulas de conversión';

    case 'u3e2':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('[::-1]'))
        return '🟢 [NORMAL] Para: Base Luna\nMensaje: Todo en orden\nLongitud: 14 chars\n\n🔴 [CRÍTICO] Para: Terra\nMensaje: !OITEROM¡\nLongitud: 9 chars\n\n🟢 [NORMAL] Para: Marte\nMensaje: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...\nLongitud: 50 chars';
      return 'Falta la inversión con [::-1]';

    case 'u3e3':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('masas_kg') && c.includes('datos_extra'))
        return 'Masa total: 44200 kg | Promedio: 8840 kg\n\n👨‍🚀 Valentina Cruz\n   Rol: Comandante\n   Edad: 35\n   Especialidad: Astrofísica\n   Horas Vuelo: 2400\n\n═══ PRE-LANZAMIENTO ═══\n1. Sistemas verificados\n2. Combustible al 87%\n3. Tripulación lista\n── Metadatos ──\n   fecha: 2024-03-15\n   mision_id: PQ-042';
      return 'Error en *args o **kwargs';

    case 'u3e4':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('fibonacci') && c.includes('potencia') && c.includes('suma_digitos'))
        return 'Fibonacci:\n  F(0) = 0\n  F(1) = 1\n  F(2) = 1\n  F(3) = 2\n  F(4) = 3\n  F(5) = 5\n  F(6) = 8\n  F(7) = 13\n  F(8) = 21\n  F(9) = 34\n\n2^10 = 1024\n3^5  = 243\nSuma dígitos 9876 = 30';
      return 'Error en las funciones recursivas';

    case 'u4e1':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('append') && c.includes('insert') && c.includes('remove'))
        return "Tripulación (6 miembros): ['Comandante Chen', 'Valentina', 'Yuri', 'Neil', 'Mae', 'Sally']\nOrdenada: ['Comandante Chen', 'Mae', 'Neil', 'Sally', 'Valentina', 'Yuri']\nPrimera: Comandante Chen | Última: Sally\nPosición de Neil: 3";
      return 'Faltan métodos de lista';

    case 'u4e2':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('misiones') && c.includes('values') && c.includes('lambda'))
        return "Misiones exitosas: ['apolo_11', 'voyager_1']\nMisiones tripuladas: 3\nMisión más reciente: europa_2035 (2035)\n\n=== RESUMEN DE MISIONES ===\n  [✓] Apolo 11 (1969)\n  [✗] Mars 2030 (2030)\n  [✓] Voyager 1 (1977)\n  [?] Europa 2035 (2035)";
      return 'Error en el diccionario';

    case 'u4e3':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('|') && c.includes('&') && c.includes('add'))
        return "Total astronautas únicos: 10\nEn todas las misiones: set()\nSolo en Luna: ['Eduardo']\nLuna XOR Marte: ['Ana', 'Eduardo', 'Fiona', 'Gabriel', 'Hannah']\n¿Carlos en Europa? False\nLuna actualizada: ['Ana', 'Carlos', 'Diana', 'Eduardo', 'Karen']";
      return 'Error en operaciones de conjuntos';

    case 'u4e4':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('sol') && c.includes('[::-1]') || (c.includes('dec_s') && c.includes('ra_s')))
        return 'Sol: RA=0.0, DEC=0.0, Dist=0.0 ly\n\nEstrellas por distancia:\n  Sol           →             0.0 ly\n  Sirius        →             8.6 ly\n  Betelgeuse    →           700.0 ly\n  Andrómeda     → 2,537,000.0 ly\n\nSirius swapped: RA=-16.71, DEC=101.28\n\nStats: min=0.0, max=2,537,000, avg=634,677.2 ly';
      return 'Error en el desempaquetado de tuplas';

    case 'u5e1':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('self.nombre') && c.includes('velocidad_max'))
        return 'Aurora acelera a 15000 km/h\nAurora acelera a 40000 km/h\n\n🚀 Aurora (Tipo-X)\n   Velocidad: 40000/40000 km/h\n   Combustible: [██████░░░░] 65%\n\n🚀 Fénix (Tipo-Z)\n   Velocidad: 0/55000 km/h\n   Combustible: [███████░░░] 75%\n\nTotal naves creadas: 2\nNaveEspacial(\'Aurora\', 40000 km/h)';
      return 'Error en la clase NaveEspacial';

    case 'u5e2':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('super().__init__') && c.includes('append'))
        return 'ISS | Masa: 419,725 kg | Propulsión: Motor iónico\nTipo: Nave Habitada\n✓ Ana embarcado/a\n✓ Carlos embarcado/a\n✓ Diana embarcado/a\nTripulación (3/6): Ana, Carlos, Diana\n\nHubble | Masa: 11,110 kg | Propulsión: Cohete portador\nTipo: Satélite (Observación)\nPeríodo orbital: 1.60 horas\n\n=== FLOTA ===\n  Nave Habitada                  → ISS\n  Satélite (Telecomunicaciones)  → Starlink-123\n  Satélite (Observación)         → Hubble';
      return 'Error en herencia';

    case 'u6e1':
      if (c.includes('___')) return 'SyntaxError: invalid syntax';
      if (c.includes('ValueError') && c.includes('raise'))
        return '✓ OK: {\'velocidad\': 28000.5, \'altitud\': 420.0, \'temperatura\': -89.2}\n  [procesado: \'28000.5,420.0,-89.2\']\n✗ ValueError: Formato inválido: se esperan 3 valores, se recibieron 1\n  [procesado: \'NO_SEÑAL\']\n✗ ValueError: Velocidad negativa no permitida: -500.0\n  [procesado: \'-500,300,25\']\n✗ ValueError: Error convirtiendo datos: could not convert string to float: \'abc\'\n  [procesado: \'abc,def,ghi\']';
      return 'Faltan las excepciones ValueError';

    default:
      return `> Código ejecutado\n> Sin salida detectada`;
  }
}

function extractPrintContent(codigo: string): string {
  const match = codigo.match(/print\(['"](.+)['"]\)/);
  return match ? match[1] : '> Salida no detectada';
}

// ─── Iconos ───────────────────────────────────────────────────────
const Icons = {
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M19 12H5m7-7-7 7 7 7"/>
    </svg>
  ),
  Next: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M5 12h14m-7-7 7 7-7 7"/>
    </svg>
  ),
  Bulb: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9 21h6m-3-3v-3m3-8.27A7 7 0 1 0 9 12.73V18h6v-5.27z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Reset: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  ),
};

// ─── Componente de dificultad ─────────────────────────────────────
function BadgeDificultad({ dificultad }: { dificultad: string }) {
  const colores: Record<string, { bg: string; text: string }> = {
    'Principiante': { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
    'Intermedio':   { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    'Avanzado':     { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444' },
  };
  const color = colores[dificultad] ?? colores['Principiante'];
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color.bg, color: color.text }}>
      {dificultad}
    </span>
  );
}

// ─── EntornoCodigo ────────────────────────────────────────────────
export default function EntornoCodigo() {
  const { unidadId, ejercicioId } = useParams<{ unidadId: string; ejercicioId: string }>();
  const navigate = useNavigate();

  const uid = Number(unidadId);
  const unidad = getUnidad(uid);
  const ejercicio = getEjercicio(uid, ejercicioId ?? '');

  const [codigo, setCodigo] = useState(ejercicio?.codigoInicial ?? '');
  const [salida, setSalida] = useState('');
  const [fase, setFase] = useState<FaseEjecucion>('idle');
  const [resultado, setResultado] = useState<ResultadoEjecucion | null>(null);
  const [pistaActiva, setPistaActiva] = useState<number | null>(null);
  const [pistas, setPistas] = useState(0);  // cantidad de pistas usadas
  const [panelActivo, setPanelActivo] = useState<'descripcion' | 'tests' | 'pistas'>('descripcion');
  const [completados, setCompletados] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('pq_completados') ?? '[]'); } catch { return []; }
  });

  const terminalRef = useRef<HTMLDivElement>(null);

  // Cambia de ejercicio
  useEffect(() => {
    if (ejercicio) {
      setCodigo(ejercicio.codigoInicial);
      setSalida('');
      setFase('idle');
      setResultado(null);
      setPistaActiva(null);
      setPistas(0);
      setPanelActivo('descripcion');
    }
  }, [ejercicioId, ejercicio]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [salida]);

  const ejecutar = useCallback(async () => {
    if (!ejercicio || fase === 'compilando' || fase === 'ejecutando') return;

    setFase('compilando');
    setSalida('');

    await new Promise(r => setTimeout(r, 400));
    setFase('ejecutando');
    setSalida('> Ejecutando main.py...\n');

    const res = await simularEjecucion(codigo, ejercicio.id, uid);

    setSalida(prev => prev + res.salida);
    setResultado(res);
    setFase(res.ok ? 'success' : 'error');

    if (res.ok && !completados.includes(ejercicio.id)) {
      const nuevos = [...completados, ejercicio.id];
      setCompletados(nuevos);
      localStorage.setItem('pq_completados', JSON.stringify(nuevos));
    }
  }, [codigo, ejercicio, fase, uid, completados]);

  const navegarEjercicio = (direccion: 'anterior' | 'siguiente') => {
    if (!unidad || !ejercicio) return;
    const idx = unidad.ejercicios.findIndex(e => e.id === ejercicio.id);
    const nuevoIdx = direccion === 'anterior' ? idx - 1 : idx + 1;
    if (nuevoIdx >= 0 && nuevoIdx < unidad.ejercicios.length) {
      navigate(`/unidades/${uid}/ejercicios/${unidad.ejercicios[nuevoIdx].id}`);
    }
  };

  if (!unidad || !ejercicio) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#050812', color: '#fff' }}>
        <div className="text-center">
          <p className="text-6xl mb-4">🌑</p>
          <h2 className="text-xl font-bold mb-2">Ejercicio no encontrado</h2>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300">← Volver al Dashboard</Link>
        </div>
      </div>
    );
  }

  const idxActual = unidad.ejercicios.findIndex(e => e.id === ejercicio.id);
  const yaCompletado = completados.includes(ejercicio.id);

  const terminalColor = fase === 'success' ? '#10b981' : fase === 'error' ? '#f87171' : '#34d399';

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Exo 2', 'Fira Code', monospace", background: '#050812' }}>

      {/* ──────────── PANEL IZQUIERDO ──────────── */}
      <div className="w-[380px] flex-shrink-0 flex flex-col h-screen overflow-hidden" style={{ background: 'rgba(6,9,20,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Cabecera */}
        <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => navigate('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
            style={{ color: 'rgba(160,185,255,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-4 h-4"><Icons.Back /></div>
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: unidad.colorAccent }}>
              {unidad.icono} U{uid} · {unidad.titulo}
            </p>
          </div>

          {/* Nav ejercicio */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => navegarEjercicio('anterior')} disabled={idxActual === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 transition-colors"
              style={{ color: 'rgba(160,185,255,0.6)' }}
              onMouseEnter={e => { if (idxActual > 0) (e.currentTarget.style.background = 'rgba(255,255,255,0.06)'); }}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div className="w-3.5 h-3.5"><Icons.Back /></div>
            </button>
            <span className="text-xs" style={{ color: 'rgba(160,185,255,0.4)' }}>{idxActual + 1}/{unidad.ejercicios.length}</span>
            <button onClick={() => navegarEjercicio('siguiente')} disabled={idxActual === unidad.ejercicios.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 transition-colors"
              style={{ color: 'rgba(160,185,255,0.6)' }}
              onMouseEnter={e => { if (idxActual < unidad.ejercicios.length - 1) (e.currentTarget.style.background = 'rgba(255,255,255,0.06)'); }}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div className="w-3.5 h-3.5"><Icons.Next /></div>
            </button>
          </div>
        </div>

        {/* Info ejercicio */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h2 className="text-base font-black text-white leading-tight">{ejercicio.titulo}</h2>
            {yaCompletado && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#10b981', color: '#fff' }}>
                <div className="w-3 h-3"><Icons.Check /></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <BadgeDificultad dificultad={ejercicio.dificultad} />
            <div className="flex items-center gap-1" style={{ color: 'rgba(245,158,11,0.8)' }}>
              <div className="w-3 h-3"><Icons.Star /></div>
              <span className="text-xs font-bold">{ejercicio.xp} XP</span>
            </div>
            {ejercicio.conceptos.slice(0, 2).map(c => (
              <span key={c} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(160,185,255,0.5)' }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'descripcion', label: 'Misión',  icon: Icons.List },
            { id: 'tests',       label: 'Tests',   icon: Icons.Check },
            { id: 'pistas',      label: `Pistas${pistas > 0 ? ` (${pistas})` : ''}`, icon: Icons.Bulb },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setPanelActivo(tab.id as typeof panelActivo)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color: panelActivo === tab.id ? unidad.colorAccent : 'rgba(160,185,255,0.4)',
                borderBottom: panelActivo === tab.id ? `2px solid ${unidad.colorAccent}` : '2px solid transparent',
                background: 'transparent',
              }}>
              <div className="w-3.5 h-3.5"><tab.icon /></div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido del panel */}
        <div className="flex-1 overflow-y-auto">
          {panelActivo === 'descripcion' && (
            <div className="p-4 space-y-4">
              {/* Descripción con markdown mínimo */}
              <div className="text-sm leading-relaxed" style={{ color: 'rgba(180,200,240,0.8)' }}>
                {ejercicio.descripcion.split('\n').map((linea, i) => {
                  if (linea.startsWith('**') && linea.endsWith('**'))
                    return <p key={i} className="font-bold text-white mt-3 mb-1">{linea.replace(/\*\*/g, '')}</p>;
                  if (linea.startsWith('```') || linea.endsWith('```'))
                    return null;
                  if (linea.startsWith('- '))
                    return <p key={i} className="pl-3 mb-1" style={{ color: 'rgba(160,185,255,0.7)' }}>· {linea.slice(2)}</p>;
                  if (linea.trim() === '') return <div key={i} className="h-2" />;
                  // Código inline
                  const parts = linea.split(/(`[^`]+`)/g);
                  return (
                    <p key={i} className="mb-1">
                      {parts.map((p, j) =>
                        p.startsWith('`') && p.endsWith('`')
                          ? <code key={j} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>{p.slice(1,-1)}</code>
                          : <span key={j}>{p}</span>
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {panelActivo === 'tests' && (
            <div className="p-4 space-y-2">
              <p className="text-xs mb-3" style={{ color: 'rgba(160,185,255,0.4)' }}>
                Casos de prueba que debe pasar tu código:
              </p>
              {ejercicio.testCases.map((tc, i) => {
                const pasado = resultado?.ok && !tc.esOculto;
                return (
                  <div key={i} className="p-3 rounded-xl" style={{ background: pasado ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${pasado ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-white">{tc.descripcion}</span>
                      {pasado && <div className="w-4 h-4 text-green-400 flex-shrink-0"><Icons.Check /></div>}
                    </div>
                    {!tc.esOculto && (
                      <code className="text-xs" style={{ color: 'rgba(160,185,255,0.5)', fontFamily: 'Fira Code, monospace' }}>
                        → "{tc.outputEsperado}"
                      </code>
                    )}
                    {tc.esOculto && <span className="text-xs" style={{ color: 'rgba(160,185,255,0.3)' }}>Caso oculto</span>}
                  </div>
                );
              })}
            </div>
          )}

          {panelActivo === 'pistas' && (
            <div className="p-4 space-y-2">
              <p className="text-xs mb-3" style={{ color: 'rgba(160,185,255,0.4)' }}>
                Las pistas reducen el XP ganado. ¡Úsalas con sabiduría!
              </p>
              {ejercicio.pistas.map((pista, i) => (
                <div key={i}>
                  {pistaActiva !== null && pistaActiva >= i ? (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3.5 h-3.5 text-yellow-400"><Icons.Bulb /></div>
                        <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>Pista {i + 1}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(220,200,140,0.9)', fontFamily: 'Fira Code, monospace' }}>{pista}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setPistaActiva(i); setPistas(p => Math.max(p, i + 1)); }}
                      className="w-full p-3 rounded-xl text-left transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(160,185,255,0.5)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5" style={{ color: 'rgba(245,158,11,0.5)' }}><Icons.Bulb /></div>
                        <span className="text-xs">Revelar pista {i + 1}</span>
                        <span className="text-xs ml-auto" style={{ color: 'rgba(239,68,68,0.6)' }}>-{(i + 1) * 10} XP</span>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón ejecutar */}
        <div className="p-4 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Feedback resultado */}
          {resultado && (
            <div className="p-3 rounded-xl text-xs" style={{
              background: resultado.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${resultado.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: resultado.ok ? '#6ee7b7' : '#fca5a5',
            }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4">{resultado.ok ? <Icons.Check /> : <Icons.X />}</div>
                <span className="font-bold">{resultado.ok ? `¡Correcto! +${resultado.xpGanado} XP` : 'Incorrecto'}</span>
                <span className="ml-auto opacity-60">{resultado.tiempoMs}ms</span>
              </div>
              <p className="leading-relaxed">{resultado.mensaje}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setCodigo(ejercicio.codigoInicial); setSalida(''); setFase('idle'); setResultado(null); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(160,185,255,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}
              title="Reiniciar código"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
              <div className="w-4 h-4"><Icons.Reset /></div>
            </button>

            <button
              onClick={ejecutar}
              disabled={fase === 'compilando' || fase === 'ejecutando'}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: fase === 'compilando' || fase === 'ejecutando'
                  ? 'rgba(59,130,246,0.4)'
                  : `linear-gradient(135deg, ${unidad.colorAccent}, ${unidad.colorAccent}bb)`,
                color: '#fff',
                boxShadow: fase === 'compilando' || fase === 'ejecutando' ? 'none' : `0 4px 16px ${unidad.colorGlow}`,
              }}
              onMouseEnter={e => { if (fase === 'idle' || fase === 'success' || fase === 'error') (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}>
              {fase === 'compilando' ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Compilando...</>
              ) : fase === 'ejecutando' ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Ejecutando...</>
              ) : (
                <><div className="w-4 h-4"><Icons.Play /></div>Ejecutar Código</>
              )}
            </button>
          </div>

          {/* Navegar al siguiente si completado */}
          {yaCompletado && idxActual < unidad.ejercicios.length - 1 && (
            <button onClick={() => navegarEjercicio('siguiente')}
              className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}>
              Siguiente ejercicio <div className="w-3.5 h-3.5"><Icons.Next /></div>
            </button>
          )}
        </div>
      </div>

      {/* ──────────── PANEL DERECHO ──────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Barra del editor */}
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ background: 'rgba(8,11,24,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            {/* Semáforo decorativo */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
            </div>
            <span className="text-xs font-mono" style={{ color: 'rgba(160,185,255,0.5)' }}>main.py</span>
            {yaCompletado && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                ✓ Completado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'rgba(160,185,255,0.3)', fontFamily: 'Fira Code, monospace' }}>Python 3.11</span>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: fase === 'compilando' || fase === 'ejecutando' ? '#f59e0b' : '#10b981' }} />
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={codigo}
            onChange={val => { setCodigo(val ?? ''); if (fase !== 'idle') { setFase('idle'); setResultado(null); } }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
              fontLigatures: true,
              lineHeight: 22,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'gutter',
              bracketPairColorization: { enabled: true },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Terminal */}
        <div className="h-44 flex-shrink-0 flex flex-col" style={{ background: '#020714', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: fase === 'compilando' || fase === 'ejecutando' ? '#f59e0b' : fase === 'success' ? '#10b981' : fase === 'error' ? '#ef4444' : '#334155' }} />
              <span className="text-xs font-mono font-bold" style={{ color: 'rgba(160,185,255,0.4)' }}>
                TERMINAL {fase === 'compilando' ? '— compilando' : fase === 'ejecutando' ? '— ejecutando' : fase === 'success' ? '— éxito ✓' : fase === 'error' ? '— error ✗' : ''}
              </span>
            </div>
            <button onClick={() => { setSalida(''); setFase('idle'); setResultado(null); }}
              className="text-xs transition-colors" style={{ color: 'rgba(160,185,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(160,185,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,185,255,0.3)')}>
              limpiar
            </button>
          </div>

          <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: terminalColor }}>
            {salida || (
              <span style={{ color: 'rgba(160,185,255,0.25)' }}>
                {'> Terminal lista. Presiona "Ejecutar Código" para comenzar.'}
              </span>
            )}
            {(fase === 'compilando' || fase === 'ejecutando') && (
              <span className="animate-pulse">█</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}