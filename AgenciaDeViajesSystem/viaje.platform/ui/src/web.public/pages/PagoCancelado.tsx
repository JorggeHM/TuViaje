import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import ReservasService from "../../infrastructure/services/reservas.service";

type FaseUI = "verificando" | "cancelada" | "pendiente" | "confirmada_inesperada";

const MAX_INTENTOS = 3;       // ~6 segundos (cancelar es rápido en Stripe)
const INTERVALO_MS = 2000;

export default function PagoCancelado() {
  const [searchParams] = useSearchParams();
  const sessionId      = searchParams.get("session_id");

  const [fase, setFase] = useState<FaseUI>(sessionId ? "verificando" : "cancelada");

  useEffect(() => {
    if (!sessionId) return;

    let cancelado = false;
    let intentos  = 0;

    const consultar = async () => {
      if (cancelado) return;
      intentos++;
      try {
        const { estado } = await ReservasService.estadoPorSesion(sessionId);
        if (cancelado) return;

        if (estado === "Cancelada") {
          setFase("cancelada");
          return;
        }
        if (estado === "Confirmada") {
          // Edge case: pagó y volvió a cancel_url manualmente. Mostramos su realidad.
          setFase("confirmada_inesperada");
          return;
        }
        // Sigue Pendiente: esperamos el webhook expired/payment_failed
        if (intentos >= MAX_INTENTOS) {
          setFase("pendiente");
          return;
        }
        setTimeout(consultar, INTERVALO_MS);
      } catch {
        if (cancelado) return;
        if (intentos >= MAX_INTENTOS) {
          setFase("cancelada");
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
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Verificando...</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Estamos liberando los cupos y cerrando la reserva.
            </p>
          </>
        )}

        {fase === "cancelada" && (
          <>
            <XCircle className="w-12 h-12 text-amber-500 mx-auto mb-5" strokeWidth={1.3} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Pago cancelado</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              No completaste el pago, así que tu reserva no fue creada y los cupos quedaron disponibles para otros viajeros.
              Podés volver a intentarlo cuando quieras.
            </p>
            <div className="flex flex-col gap-2.5">
              <Link to="/destinos"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition">
                <ArrowLeft className="w-4 h-4" /> Volver a destinos
              </Link>
              <Link to="/"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 hover:bg-gray-50 transition">
                Ir al inicio
              </Link>
            </div>
          </>
        )}

        {fase === "pendiente" && (
          <>
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-5" strokeWidth={1.3} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Reserva en espera</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Volviste sin completar el pago. La reserva quedará abierta unos minutos más; si no se paga, se liberará automáticamente.
            </p>
            <Link to="/destinos"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition">
              Volver a destinos
            </Link>
          </>
        )}

        {fase === "confirmada_inesperada" && (
          <>
            <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-5" strokeWidth={1.3} />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Tu pago ya fue acreditado</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Aunque viste la pantalla de "cancelado", el pago se completó. La reserva está confirmada.
            </p>
            <Link to="/perfil"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition">
              Ver mis reservas
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
