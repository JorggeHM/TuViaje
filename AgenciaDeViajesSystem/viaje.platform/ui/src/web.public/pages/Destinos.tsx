/**
 * Destinos.tsx — Catálogo de viajes (rutas: /destinos y /experiencias)
 *
 * Obtiene la lista de viajes desde la API del backend y los muestra
 * en un grid de tarjetas usando el componente TravelCard.
 *
 * Flujo de datos:
 *   1. Al montar el componente, useEffect dispara un fetch al endpoint
 *   2. La URL base se toma de la variable de entorno VITE_API_BASE_URL (.env)
 *      Si no está definida, usa http://localhost como fallback
 *   3. Mientras espera: muestra 6 skeletons animados (animate-pulse)
 *   4. Si la API falla o devuelve array vacío: muestra mensaje de error
 *   5. Con datos: renderiza un TravelCard por cada viaje
 *
 * Para cambiar el puerto o ruta de la API:
 *   Edita VITE_API_BASE_URL en el archivo .env de la raíz del proyecto UI.
 *
 * Interfaz Viaje — estructura del JSON que devuelve la API:
 *   { id, title, description, destination, price, available_seats,
 *     start_date, end_date }
 */
import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import TravelCard from "../../components/TravelCard";

interface Viaje {
  id: number;
  title: string;
  description: string;
  destination: string;
  price: number;
  available_seats: number;
  start_date: string;
  end_date: string;
}

const Destinos = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState(true);

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost";

  useEffect(() => {
    fetch(`${apiBase}/AgenciaDeViajesSystem/API/API_getviajes.php`)
      .then((res) => res.json())
      .then((data) => {
        setViajes(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* Cabecera de sección */}
      <div className="bg-orange-600 px-6 py-12 text-white text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-4">
          <Plane className="w-3 h-3" />
          Catálogo completo
        </span>
        <h1 className="text-3xl font-black md:text-4xl">Todos los destinos</h1>
        <p className="text-orange-100 text-sm mt-2 max-w-md mx-auto">
          Encuentra el viaje perfecto entre nuestra selección de destinos increíbles
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        {/* Estado: cargando */}
        {cargando && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 h-80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Estado: sin resultados */}
        {!cargando && viajes.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
              <Plane className="w-9 h-9 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No hay destinos disponibles</h3>
            <p className="text-gray-400 text-sm">Intenta más tarde o contacta con soporte.</p>
          </div>
        )}

        {/* Estado: con datos */}
        {!cargando && viajes.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {viajes.map((viaje) => (
              <TravelCard
                key={viaje.id}
                nombre={viaje.title}
                precio={viaje.price}
                cuposDisponibles={viaje.available_seats}
                personasPorViaje={2}
                descripcionCorta={viaje.description}
                fechaSalida={viaje.start_date}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinos;
