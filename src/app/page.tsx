import Link from "next/link";

// Esta página es la bienvenida principal de PyQuest.
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      {/* Contenedor general */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Encabezado de bienvenida */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-10">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-blue-300">PyQuest</p>
          <h1 className="text-3xl font-black text-white sm:text-5xl">
            Aprende Python practicando
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
            Plataforma interactiva para estudiantes que quieren mejorar su lógica con
            ejercicios rápidos, feedback inmediato y progreso visual por niveles.
          </p>

          {/* Botones de acción */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/practica"
              className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-yellow-300"
            >
              Iniciar práctica
            </Link>
            <a
              href="#modulos"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-400"
            >
              Ver módulos
            </a>
          </div>
        </section>

        {/* Resumen visual de módulos */}
        <section id="modulos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Variables",
            "Condicionales",
            "Bucles",
            "Funciones",
          ].map((moduleName, index) => (
            <article
              key={moduleName}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <p className="text-xs text-slate-400">Módulo {index + 1}</p>
              <h2 className="mt-1 text-lg font-bold text-white">{moduleName}</h2>
              <p className="mt-2 text-sm text-slate-300">
                Prácticas guiadas con validación simple y explicaciones claras.
              </p>
            </article>
          ))}
        </section>

        {/* Bloque inferior con llamada a la acción */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-sm text-slate-300">
            Entra al área de práctica y resuelve retos desde el navegador.
          </p>
          <Link
            href="/practica"
            className="mt-4 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            Ir al editor
          </Link>
        </section>
      </div>
    </main>
  );
}
