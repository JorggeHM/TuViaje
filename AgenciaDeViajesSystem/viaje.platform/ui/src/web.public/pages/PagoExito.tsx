import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Plane, Mail, Loader2, AlertTriangle } from "lucide-react";
import ReservasService from "../../infrastructure/services/reservas.service";

type FaseUI = "verificando" | "confirmada" | "pendiente" | "no_encontrada";

const MAX_INTENTOS = 6;        // ~12 segundos máximos de espera
const INTERVALO_MS = 2000;

export default function PagoExito() {
  const [searchParams] = useSearchParams();
  const sessionId      = searchParams.get("session_id");

  const [fase,    setFase]    = useState<FaseUI>(sessionId ? "verificando" : "pendiente");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    let cancelado = false;
    let intentos  = 0;

    const consultar = async () => {
      if (cancelado) return;
      intentos++;
      setIntento(intentos);
      try {
        const { estado } = await ReservasService.estadoPorSesion(sessionId);
        if (cancelado) return;

        if (estado === "Confirmada") {
          setFase("confirmada");
          return;
        }
        // Si Stripe canceló o sigue Pendiente, paramos de pollear cuando llegamos al máximo
        if (intentos >= MAX_INTENTOS) {
          setFase("pendiente");
          return;
        }
        setTimeout(consultar, INTERVALO_MS);
      } catch (err: any) {
        if (cancelado) return;
        if (err?.response?.status === 404) {
          setFase("no_encontrada");
          return;
        }
        if (intentos >= MAX_INTENTOS) {
          setFase("pendiente");
          return;
        }
        setTimeout(consultar, INTERVALO_MS);
      }
    };

    consultar();
    return () => { cancelado = true; };
  }, [sessionId]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-white px-6 py-16">
      <div className="rounded-xl border border-gray-100 max-w-md w-full p-10 text-center">

        {fase === "verificando" && (
          <>
            <Loader2 className="w-12 h-12 text-orange-500 mx-auto mb-5 animate-spin" strokeWidth={1.3} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Confirmando tu pago...</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Estamos esperando la confirmación de la pasarela. Esto suele tardar un par de segundos.
            </p>
            <p className="text-xs text-gray-400">Intento {intento} de {MAX_INTENTOS}</p>
          </>
        )}

        {fase === "confirmada" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-5" strokeWidth={1.3} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Pago confirmado</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Tu reserva quedó confirmada y te enviamos los detalles por email.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to="/perfil"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition">
                <Plane className="w-4 h-4" /> Ver mis reservas
              </Link>
              <Link to="/destinos"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition">
                Seguir explorando
              </Link>
            </div>
          </>
        )}

        {fase === "pendiente" && (
          <>
            <Mail className="w-12 h-12 text-amber-500 mx-auto mb-5" strokeWidth={1.3} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Pago en procesamiento</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Recibimos tu pago pero la confirmación está demorando más de lo habitual.
              Revisá tu perfil en unos minutos o el email de confirmación.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to="/perfil"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition">
                <Plane className="w-4 h-4" /> Ver mis reservas
              </Link>
              <Link to="/destinos"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition">
                Seguir explorando
              </Link>
            </div>
          </>
        )}

        {fase === "no_encontrada" && (
          <>
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-5" strokeWidth={1.3} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">No encontramos tu reserva</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              No pudimos asociar este pago a una reserva. Si el cargo aparece en tu tarjeta, contactá a soporte.
            </p>
            <Link to="/destinos"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition">
              Volver a destinos
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
