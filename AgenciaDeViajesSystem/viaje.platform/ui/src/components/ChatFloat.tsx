/**
 * ChatFloat.tsx — Botón flotante de soporte minimalista
 */
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Mensaje {
  id: number;
  de: "bot" | "user";
  texto: string;
}

const mensajesIniciales: Mensaje[] = [
  {
    id: 1,
    de: "bot",
    texto: "Hola. Soy el asistente de TuViaje. ¿En qué puedo ayudarte hoy?",
  },
];

// URL del webhook de n8n — define VITE_N8N_WEBHOOK_URL en tu .env
const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ?? "";

export default function ChatFloat() {
  const [abierto,   setAbierto]   = useState(false);
  const [mensajes,  setMensajes]  = useState<Mensaje[]>(mensajesIniciales);
  const [input,     setInput]     = useState("");
  const [esperando, setEsperando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, esperando]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || esperando) return;

    setMensajes((prev) => [...prev, { id: Date.now(), de: "user", texto }]);
    setInput("");
    setEsperando(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: texto }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      // n8n debe responder con { respuesta: "texto del bot" }
      const respuestaBot =
        data.respuesta ?? data.output ?? data.message ?? "No entendí tu mensaje, ¿puedes reformularlo?";

      setMensajes((prev) => [
        ...prev,
        { id: Date.now() + 1, de: "bot", texto: respuestaBot },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          de: "bot",
          texto: "Hubo un problema al conectar con el asistente. Intenta de nuevo.",
        },
      ]);
    } finally {
      setEsperando(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {abierto && (
        <div className="w-80 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden">

          <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium leading-tight">Soporte TuViaje</p>
                <p className="text-orange-100 text-[10px]">Te respondemos en minutos</p>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} className="text-white/70 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-60 overflow-y-auto px-4 py-3 space-y-3 bg-orange-50/40">
            {mensajes.map((m) => (
              <div key={m.id} className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.de === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 border border-orange-100"
                }`}>
                  {m.texto}
                </div>
              </div>
            ))}

            {esperando && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-2.5 border-t border-gray-100 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="Escribe tu mensaje..."
              disabled={esperando}
              className="flex-1 text-xs bg-gray-50 border border-gray-100 rounded-full px-3 py-2 focus:outline-none focus:border-orange-300 transition disabled:opacity-50"
            />
            <button
              onClick={enviar}
              disabled={esperando || !input.trim()}
              className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setAbierto(!abierto)}
        className="w-12 h-12 rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition flex items-center justify-center"
        aria-label="Abrir chat de soporte"
      >
        {abierto ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
