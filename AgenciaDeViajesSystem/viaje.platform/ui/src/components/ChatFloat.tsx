/**
 * ChatFloat.tsx — Botón flotante de soporte al cliente
 *
 * Muestra un botón fijo en la esquina inferior derecha de la pantalla.
 * Al hacer clic abre una ventana de chat básica.
 *
 * Estado actual: las respuestas son automáticas (bot simple).
 * En el futuro se conectará a un modelo de IA (OpenAI / Claude) para
 * atender consultas de los usuarios de forma inteligente.
 *
 * Se renderiza en Inicio.tsx pero podría moverse a PublicLayout.tsx
 * si se desea que aparezca en todas las páginas públicas.
 *
 * Flujo de mensajes:
 *   1. Usuario escribe y presiona Enter o el botón Send
 *   2. Se agrega el mensaje del usuario al estado
 *   3. Después de 900ms aparece la respuesta automática del bot
 *   4. El indicador de "escritura" (3 puntos) se muestra mientras espera
 */
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";

interface Mensaje {
  id: number;
  de: "bot" | "user";
  texto: string;
}

/** Mensaje de bienvenida que aparece al abrir el chat por primera vez */
const mensajesIniciales: Mensaje[] = [
  {
    id: 1,
    de: "bot",
    texto: "¡Hola! 👋 Soy el asistente de TuViaje. Pronto estaré impulsado por IA. ¿En qué puedo ayudarte hoy?",
  },
];

/** Respuesta estática mientras no haya IA conectada */
const respuestaAutomatica =
  "Gracias por tu mensaje. Nuestro equipo te responderá pronto. ¡Muy pronto este chat será asistido por IA! 🤖✨";

export default function ChatFloat() {
  const [abierto,   setAbierto]   = useState(false);
  const [mensajes,  setMensajes]  = useState<Mensaje[]>(mensajesIniciales);
  const [input,     setInput]     = useState("");
  const [esperando, setEsperando] = useState(false); // Controla el indicador de escritura
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje cada vez que cambia la lista o aparece el indicador
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, esperando]);

  /** Agrega el mensaje del usuario y simula una respuesta del bot */
  const enviar = () => {
    const texto = input.trim();
    if (!texto || esperando) return;

    // Agrega mensaje del usuario
    setMensajes((prev) => [...prev, { id: Date.now(), de: "user", texto }]);
    setInput("");
    setEsperando(true); // Muestra indicador de escritura

    // Simula demora de respuesta del bot (900ms)
    setTimeout(() => {
      setMensajes((prev) => [
        ...prev,
        { id: Date.now() + 1, de: "bot", texto: respuestaAutomatica },
      ]);
      setEsperando(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Ventana de chat (visible solo cuando abierto = true) ── */}
      {abierto && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden">

          {/* Encabezado — gradiente de marca para identificar el canal de soporte */}
          <div className="bg-gradient-to-r from-orange-700 to-orange-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Soporte TuViaje</p>
                <p className="text-orange-200 text-[10px] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Próximamente con IA
                </p>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} className="text-white/70 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Lista de mensajes ── */}
          <div className="h-60 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {mensajes.map((m) => (
              <div key={m.id} className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.de === "user"
                    ? "bg-orange-600 text-white rounded-br-sm"
                    : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-sm"
                }`}>
                  {m.texto}
                </div>
              </div>
            ))}

            {/* Indicador de "el bot está escribiendo..." */}
            {esperando && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Referencia para auto-scroll */}
            <div ref={bottomRef} />
          </div>

          {/* ── Input de texto ── */}
          <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()} // Enviar con Enter
              placeholder="Escribe tu mensaje..."
              disabled={esperando}
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 transition disabled:opacity-50"
            />
            <button
              onClick={enviar}
              disabled={esperando || !input.trim()}
              className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white hover:bg-orange-700 transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Botón flotante principal ── */}
      {/* Alterna entre ícono de chat (cerrado) y X (abierto) */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-14 h-14 rounded-full bg-orange-600 text-white shadow-xl shadow-orange-900/30 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Abrir chat de soporte"
      >
        {abierto ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
