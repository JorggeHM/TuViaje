import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import TravelCard from "../../components/TravelCard";
import client from "../../infrastructure/api/client";

interface Viaje {
  id: number;
  title: string;
  description: string;
  destination: string;
  price: number;
  available_seats: number;
  start_date: string;
  end_date: string;
  duracion_dias: number;
  rating: number;
  imagen_url: string;
  estado: string;
}

const Destinos = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    client.get('/api/viajes')
      .then((res) => {
        setViajes(res.data.data ?? []);
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
                id={viaje.id}
                nombre={viaje.title}
                precio={viaje.price}
                cuposDisponibles={viaje.available_seats}
                personasPorViaje={2}
                descripcionCorta={viaje.description}
                fechaSalida={viaje.start_date}
                duracionDias={viaje.duracion_dias}
                rating={viaje.rating}
                imagenUrl={viaje.imagen_url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinos;
