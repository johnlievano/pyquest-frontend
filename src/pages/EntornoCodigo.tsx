import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  ejerciciosService,
  type EjercicioBackend,
  colorCategoria,
  colorDificultad,
  mapDificultad,
} from '../services/ejercicios.service';
import { progresoService } from '../services/progreso.service';

function getUserFromToken(): { idUsuario: number } | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { idUsuario: payload.sub ?? payload.idUsuario };
  } catch { return null; }
}

type Fase = 'idle' | 'ejecutando' | 'validando' | 'ok' | 'error';

// Módulos y su dificultad — misma lógica que Dashboard
const MODULOS_DIFICULTAD = ['BAJO', 'MEDIO', 'ALTO'] as const;

// Dado todos los ejercicios y los completados, devuelve solo los desbloqueados
function getEjerciciosDesbloqueados(
  todos: EjercicioBackend[],
  completadosIds: Set<number>
): EjercicioBackend[] {
  const porModulo = MODULOS_DIFICULTAD.map(dif => todos.filter(e => e.dificultad === dif));
  const desbloqueados: EjercicioBackend[] = [];
  for (let i = 0; i < porModulo.length; i++) {
    const modulo = porModulo[i];
    desbloqueados.push(...modulo);
    // Si no están todos completados, no se desbloquea el siguiente
    const todosCompletos = modulo.every(e => completadosIds.has(e.idEjercicio));
    if (!todosCompletos) break;
  }
  return desbloqueados;
}

// ── Pistas por ejercicio ──────────────────────────────────────
const PISTAS: Record<number, string[]> = {
  1: [
    'Usá la función print() con el texto entre comillas.',
    'El texto debe ser exactamente: Hola Mundo (con mayúsculas).',
    'Solución: print("Hola Mundo")',
  ],
  2: [
    'Creá una variable con el signo igual: resultado = ...',
    'Podés sumar directamente: resultado = 5 + 3',
    'El nombre de la variable debe ser exactamente "resultado".',
  ],
  3: [
    'La función len() cuenta los elementos de una lista.',
    'Combiná print() y len(): print(len(numeros))',
    'Solución: print(len(numeros))  → muestra 5',
  ],
  4: [
    'La estructura es: if condicion:  (con los dos puntos al final)',
    'Dentro del if, el print va indentado con 4 espacios.',
    'Solución:\nif x > 10:\n    print("mayor")',
  ],
  5: [
    'range(1, 6) genera los números 1, 2, 3, 4, 5.',
    'La estructura del for es: for variable in range(...):',
    'Solución:\nfor i in range(1, 6):\n    print(i)',
  ],
  6: [
    'Definí la función con: def saludar(nombre):',
    'Usá return para devolver el resultado.',
    'Solución:\ndef saludar(nombre):\n    return "Hola, " + nombre',
  ],
  7: [
    'Un diccionario usa llaves {}: {"clave": valor}',
    'Separás los pares clave-valor con coma.',
    'Solución:\npersona = {"nombre": "Ana", "edad": 25}',
  ],
  8: [
    'La estructura es try: ... except TipoError:',
    'El error que hay que capturar es ZeroDivisionError.',
    'Solución:\ntry:\n    10/0\nexcept ZeroDivisionError:\n    print("Error: división por cero")',
  ],
  9: [
    'La sintaxis es: [expresion for variable in iterable]',
    'Para elevar al cuadrado usás: x**2',
    'Solución: [x**2 for x in range(1, 6)]',
  ],
  10: [
    'Definí la clase con: class Animal:',
    'El __init__ siempre recibe self como primer parámetro.',
    'Solución:\nclass Animal:\n    def __init__(self, nombre):\n        self.nombre = nombre',
  ],
};

// ── Iconos ─────────────────────────────────────────────────────
const Icons = {
  Play:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M8 5v14l11-7z"/></svg>,
  Back:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M19 12H5m7-7-7 7 7 7"/></svg>,
  Next:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>,
  Check:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><polyline points="20 6 9 17 4 12"/></svg>,
  X:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Reset:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Hint:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  Spin:    () => <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>,
};

const CODIGO_INICIAL = `# Escribí tu solución acá\n`;

export default function EntornoCodigo() {
  const { ejercicioId } = useParams<{ ejercicioId: string }>();
  const navigate = useNavigate();
  const usuario = getUserFromToken();
  const id = Number(ejercicioId);

  const [ejercicio, setEjercicio]               = useState<EjercicioBackend | null>(null);
  const [todosEjercicios, setTodosEjercicios]   = useState<EjercicioBackend[]>([]);
  const [completadosIds, setCompletadosIds]     = useState<Set<number>>(new Set());
  const [codigo, setCodigo]                     = useState(CODIGO_INICIAL);
  const [salida, setSalida]                 = useState('');
  const [fase, setFase]                     = useState<Fase>('idle');
  const [feedback, setFeedback]             = useState<{ ok: boolean; mensaje: string; stdout?: string } | null>(null);
  const [yaCompletado, setYaCompletado]     = useState(false);
  const [loading, setLoading]               = useState(true);
  const [pistaIdx, setPistaIdx]             = useState(0);
  const [mostrarPista, setMostrarPista]     = useState(false);
  const [pistasUsadas, setPistasUsadas]     = useState(0);

  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usuario) { navigate('/login'); return; }
    if (isNaN(id)) { navigate('/dashboard'); return; }
    cargarEjercicio();
    cargarTodos();
  }, [ejercicioId]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [salida]);

  // Resetear pistas al cambiar ejercicio
  useEffect(() => {
    setPistaIdx(0);
    setMostrarPista(false);
    setPistasUsadas(0);
  }, [ejercicioId]);

  const cargarEjercicio = async () => {
    try {
      setLoading(true);
      setCodigo(CODIGO_INICIAL);
      setSalida('');
      setFase('idle');
      setFeedback(null);
      const res = await ejerciciosService.getById(id);
      setEjercicio(res.data);
      if (usuario) {
        const resProg = await progresoService.getByUsuario(usuario.idUsuario);
        const completado = (resProg.data ?? []).some(
          (p: any) => p.idEjercicio === id && p.completado
        );
        setYaCompletado(completado);
      }
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cargarTodos = async () => {
    try {
      const [resEj, resProg] = await Promise.all([
        ejerciciosService.getAll(),
        usuario ? progresoService.getByUsuario(usuario.idUsuario) : Promise.resolve({ data: [] }),
      ]);
      const todos = resEj.data ?? [];
      const ids = new Set<number>(
        (resProg.data ?? []).filter((p: any) => p.completado).map((p: any) => Number(p.idEjercicio))
      );
      setTodosEjercicios(todos);
      setCompletadosIds(ids);
    } catch { /* silencioso */ }
  };

  const pistas = PISTAS[id] ?? [];

  const verSiguientePista = () => {
    setMostrarPista(true);
    if (pistaIdx < pistas.length - 1) {
      setPistaIdx(i => i + 1);
    }
    setPistasUsadas(u => Math.min(u + 1, pistas.length));
  };

  const ejecutar = useCallback(async () => {
    if (!ejercicio || fase === 'ejecutando' || fase === 'validando') return;
    if (!codigo.trim() || codigo.trim() === CODIGO_INICIAL.trim()) {
      setSalida('⚠️  Escribí tu solución antes de ejecutar.');
      return;
    }

    setFase('ejecutando');
    setSalida('> Ejecutando código en Python...\n');
    setFeedback(null);

    try {
      const resCompiler = await ejerciciosService.ejecutarCodigo({ code: codigo });
      const compilerData = resCompiler.data;
      const stdout = compilerData.stdout ?? '';
      const stderr = compilerData.stderr ?? '';

      setSalida(`> Ejecutando...\n${stdout}${stderr ? `\n⚠️  ${stderr}` : ''}`);

      if (!compilerData.passed) {
        setFase('error');
        setFeedback({ ok: false, mensaje: compilerData.error ?? 'Error al ejecutar el código.', stdout });
        return;
      }

      setFase('validando');
      setSalida(prev => prev + '\n> Validando respuesta...');

      if (!usuario) return;

      const resValidar = await ejerciciosService.validar(id, {
        idUsuario: usuario.idUsuario,
        respuesta: codigo,
      });

      const { esCorrecto, feedback: feedbackMsg } = resValidar.data;
      setFase(esCorrecto ? 'ok' : 'error');
      setFeedback({ ok: esCorrecto, mensaje: feedbackMsg, stdout });

      if (esCorrecto && !yaCompletado) {
        await progresoService.guardar({
          idUsuario: usuario.idUsuario,
          idEjercicio: id,
          completado: true,
        });
        setYaCompletado(true);
        setCompletadosIds(prev => new Set([...prev, id]));
      }
    } catch (err: any) {
      setFase('error');
      const msg = err?.message ?? 'Error de conexión con el servidor.';
      setSalida(prev => prev + `\n❌  ${msg}`);
      setFeedback({ ok: false, mensaje: msg });
    }
  }, [codigo, ejercicio, fase, id, usuario, yaCompletado]);

  const navegarEjercicio = (dir: 'anterior' | 'siguiente') => {
    const lista = getEjerciciosDesbloqueados(todosEjercicios, completadosIds);
    const idx = lista.findIndex(e => e.idEjercicio === id);
    const nuevoIdx = dir === 'anterior' ? idx - 1 : idx + 1;
    if (nuevoIdx >= 0 && nuevoIdx < lista.length) {
      navigate(`/ejercicios/${lista[nuevoIdx].idEjercicio}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#050812', color: '#fff' }}>
        <Icons.Spin /><span className="ml-3 text-sm" style={{ color: 'rgba(160,185,255,0.5)' }}>Cargando ejercicio...</span>
      </div>
    );
  }

  if (!ejercicio) {
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

  const cat = colorCategoria(ejercicio.categoria);
  const dif = colorDificultad(ejercicio.dificultad);
  const ejerciciosNavegables = getEjerciciosDesbloqueados(todosEjercicios, completadosIds);
  const idxActual = ejerciciosNavegables.findIndex(e => e.idEjercicio === id);
  const terminalColor = fase === 'ok' ? '#10b981' : fase === 'error' ? '#f87171' : '#34d399';

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Exo 2','Fira Code',monospace", background: '#050812' }}>

      {/* ── Panel izquierdo ── */}
      <div className="w-[400px] flex-shrink-0 flex flex-col h-screen overflow-hidden"
        style={{ background: 'rgba(6,9,20,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

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
            <p className="text-xs font-semibold truncate" style={{ color: cat.accent }}>
              {cat.icono} {ejercicio.categoria}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => navegarEjercicio('anterior')} disabled={idxActual <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30"
              style={{ color: 'rgba(160,185,255,0.6)' }}>
              <div className="w-3.5 h-3.5"><Icons.Back /></div>
            </button>
            <span className="text-xs" style={{ color: 'rgba(160,185,255,0.4)' }}>
              {idxActual + 1}/{ejerciciosNavegables.length}
            </span>
            <button onClick={() => navegarEjercicio('siguiente')} disabled={idxActual >= ejerciciosNavegables.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30"
              style={{ color: 'rgba(160,185,255,0.6)' }}>
              <div className="w-3.5 h-3.5"><Icons.Next /></div>
            </button>
          </div>
        </div>

        {/* Info ejercicio */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-base font-black text-white leading-tight">{ejercicio.titulo}</h2>
            {yaCompletado && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#10b981', color: '#fff' }}>
                <div className="w-3 h-3"><Icons.Check /></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: dif.bg, color: dif.text }}>
              {mapDificultad(ejercicio.dificultad)}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(160,185,255,0.5)' }}>
              {ejercicio.categoria}
            </span>
          </div>
        </div>

        {/* Descripción + pistas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Descripción */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: cat.accent }}>
              📋 Descripción
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(180,200,240,0.8)' }}>
              {ejercicio.descripcion}
            </p>
          </div>

          {/* Instrucciones */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#60a5fa' }}>💡 ¿Cómo funciona?</p>
            <p className="text-xs" style={{ color: 'rgba(160,185,255,0.7)' }}>
              Escribí tu código Python en el editor de la derecha y hacé clic en <strong style={{ color: '#fff' }}>Ejecutar Código</strong>. El sistema va a validar tu respuesta automáticamente.
            </p>
          </div>

          {/* Sección de pistas */}
          {pistas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                  🔍 Pistas
                </h3>
                <span className="text-xs" style={{ color: 'rgba(160,185,255,0.4)' }}>
                  {pistasUsadas}/{pistas.length} usadas
                </span>
              </div>

              {/* Pista actual visible */}
              {mostrarPista && (
                <div className="p-3 rounded-xl mb-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>
                    Pista {pistaIdx + 1} de {pistas.length}
                  </p>
                  <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: 'rgba(255,220,130,0.9)' }}>
                    {pistas[pistaIdx]}
                  </p>
                </div>
              )}

              {/* Botón para ver pista */}
              <button
                onClick={verSiguientePista}
                disabled={mostrarPista && pistaIdx >= pistas.length - 1}
                className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(245,158,11,0.1)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}>
                <div className="w-3.5 h-3.5"><Icons.Hint /></div>
                {!mostrarPista
                  ? 'Ver primera pista'
                  : pistaIdx < pistas.length - 1
                    ? 'Ver siguiente pista'
                    : 'No hay más pistas'}
              </button>
            </div>
          )}
        </div>

        {/* Botón ejecutar + feedback */}
        <div className="p-4 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {feedback && (
            <div className="p-3 rounded-xl text-xs"
              style={{
                background: feedback.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${feedback.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: feedback.ok ? '#6ee7b7' : '#fca5a5',
              }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4">{feedback.ok ? <Icons.Check /> : <Icons.X />}</div>
                <span className="font-bold">{feedback.ok ? '¡Correcto! 🎉' : 'Incorrecto, intentá de nuevo'}</span>
              </div>
              <p className="leading-relaxed">{feedback.mensaje}</p>
              {!feedback.ok && pistas.length > 0 && (
                <button onClick={verSiguientePista}
                  className="mt-2 text-xs underline"
                  style={{ color: '#f59e0b' }}>
                  Ver una pista →
                </button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setCodigo(CODIGO_INICIAL); setSalida(''); setFase('idle'); setFeedback(null); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(160,185,255,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}
              title="Reiniciar código">
              <div className="w-4 h-4"><Icons.Reset /></div>
            </button>

            <button onClick={ejecutar}
              disabled={fase === 'ejecutando' || fase === 'validando'}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: fase === 'ejecutando' || fase === 'validando'
                  ? 'rgba(59,130,246,0.4)'
                  : `linear-gradient(135deg,${cat.accent},${cat.accent}bb)`,
                color: '#fff',
                boxShadow: fase === 'ejecutando' || fase === 'validando' ? 'none' : `0 4px 16px ${cat.glow}`,
              }}>
              {fase === 'ejecutando' ? <><Icons.Spin /> Ejecutando...</>
                : fase === 'validando' ? <><Icons.Spin /> Validando...</>
                : <><div className="w-4 h-4"><Icons.Play /></div>Ejecutar Código</>}
            </button>
          </div>

          {yaCompletado && idxActual < ejerciciosNavegables.length - 1 && (
            <button onClick={() => navegarEjercicio('siguiente')}
              className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
              Siguiente ejercicio <div className="w-3.5 h-3.5"><Icons.Next /></div>
            </button>
          )}
        </div>
      </div>

      {/* ── Panel derecho: Editor + Terminal ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Barra editor */}
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0"
          style={{ background: 'rgba(8,11,24,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
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
            <span className="text-xs font-mono" style={{ color: 'rgba(160,185,255,0.3)' }}>Python 3.11</span>
            <div className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: fase === 'ejecutando' || fase === 'validando' ? '#f59e0b' : '#10b981' }} />
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={codigo}
            onChange={val => { setCodigo(val ?? ''); if (fase !== 'idle') { setFase('idle'); setFeedback(null); } }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code','JetBrains Mono',monospace",
              fontLigatures: true,
              lineHeight: 22,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Terminal */}
        <div className="h-44 flex-shrink-0 flex flex-col" style={{ background: '#020714', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full"
                style={{ background: fase === 'ejecutando' || fase === 'validando' ? '#f59e0b' : fase === 'ok' ? '#10b981' : fase === 'error' ? '#ef4444' : '#334155' }} />
              <span className="text-xs font-mono font-bold" style={{ color: 'rgba(160,185,255,0.4)' }}>
                TERMINAL {fase === 'ejecutando' ? '— ejecutando' : fase === 'validando' ? '— validando' : fase === 'ok' ? '— éxito ✓' : fase === 'error' ? '— error ✗' : ''}
              </span>
            </div>
            <button onClick={() => { setSalida(''); setFase('idle'); setFeedback(null); }}
              className="text-xs transition-colors" style={{ color: 'rgba(160,185,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(160,185,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,185,255,0.3)')}>
              limpiar
            </button>
          </div>
          <div ref={terminalRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: terminalColor }}>
            {salida || <span style={{ color: 'rgba(160,185,255,0.25)' }}>{'> Terminal lista. Presioná "Ejecutar Código" para comenzar.'}</span>}
            {(fase === 'ejecutando' || fase === 'validando') && <span className="animate-pulse">█</span>}
          </div>
        </div>
      </div>
    </div>
  );
}