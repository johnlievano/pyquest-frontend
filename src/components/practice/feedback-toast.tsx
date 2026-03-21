// Props del aviso flotante.
interface FeedbackToastProps {
  // Estado para mostrar u ocultar el toast.
  visible: boolean;
  // Tipo de mensaje para color visual.
  type: "success" | "error";
  // Contenido del mensaje.
  message: string;
}

export function FeedbackToast({ visible, type, message }: FeedbackToastProps) {
  // Si no está visible, no renderizamos nada.
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 max-w-xs rounded-xl border px-4 py-3 text-sm shadow-xl ${
        type === "success"
          ? "border-emerald-500 bg-emerald-900 text-emerald-100"
          : "border-rose-500 bg-rose-900 text-rose-100"
      }`}
    >
      {/* Texto del feedback */}
      {message}
    </div>
  );
}
