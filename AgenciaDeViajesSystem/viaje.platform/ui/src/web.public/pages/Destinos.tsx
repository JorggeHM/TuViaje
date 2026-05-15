import { useEffect, useMemo, useState } from "react";
import { Plane, SlidersHorizontal, X } from "lucide-react";
import TravelCardDetailed from "../../components/TravelCardDetailed";
import client from "../../infrastructure/api/client";

interface Viaje {
  id: number;
  title: string;
  description: string;
  destination: string;
  price: number;
  available_seats: number;
  total_ventas: number;
  start_date: string;
  end_date: string;
  duracion_dias: number;
  rating: number;
  imagen_url: string;
  estado: string;
}

type Orden = "recientes" | "precio_asc" | "precio_desc" | "rating" | "salida";
type Duracion = "todas" | "corta" | "media" | "larga";

const ordenLabels: Record<Orden, string> = {
  recientes: "Más recientes",
  precio_asc: "Precio: menor a mayor",
  precio_desc: "Precio: mayor a menor",
  rating: "Mejor valorados",
  salida: "Próxima salida",
};

const Destinos = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState(true);

  const [orden, setOrden] = useState<Orden>("recientes");
  const [precioMin, setPrecioMin] = useState<string>("");
  const [precioMax, setPrecioMax] = useState<string>("");
  const [duracion, setDuracion] = useState<Duracion>("todas");

  useEffect(() => {
    client.get('/api/viajes')
      .then((res) => {
        setViajes(res.data.data ?? []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const filtroActivo =
    orden !== "recientes" || precioMin !== "" || precioMax !== "" || duracion !== "todas";

  const limpiarFiltros = () => {
    setOrden("recientes");
    setPrecioMin("");
    setPrecioMax("");
    setDuracion("todas");
  };

  const viajesFiltrados = useMemo(() => {
    let lista = [...viajes];

    const min = precioMin === "" ? -Infinity : Number(precioMin);
    const max = precioMax === "" ? Infinity : Number(precioMax);
    lista = lista.filter((v) => v.price >= min && v.price <= max);

    if (duracion === "corta") lista = lista.filter((v) => v.duracion_dias <= 5);
    else if (duracion === "media") lista = lista.filter((v) => v.duracion_dias >= 6 && v.duracion_dias <= 10);
    else if (duracion === "larga") lista = lista.filter((v) => v.duracion_dias > 10);

    switch (orden) {
      case "precio_asc":  lista.sort((a, b) => a.price - b.price); break;
      case "precio_desc": lista.sort((a, b) => b.price - a.price); break;
      case "rating":      lista.sort((a, b) => b.rating - a.rating); break;
      case "salida":      lista.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()); break;
    }

    return lista;
  }, [viajes, orden, precioMin, precioMax, duracion]);

  return (
    <div className="bg-white min-h-screen">

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        {/* Filtros */}
        <div className="rounded-xl border border-orange-100 bg-orange-50/30 p-5 mb-10">
          <div className="flex items-center gap-2 mb-5 text-gray-700">
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-medium">Filtros</h2>
            {filtroActivo && (
              <button
                onClick={limpiarFiltros}
                className="ml-auto inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition"
              >
                <X className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Ordenar por</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-400 transition"
              >
                {(Object.keys(ordenLabels) as Orden[]).map((k) => (
                  <option key={k} value={k}>{ordenLabels[k]}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Precio mín. (MXN)</span>
              <input
                type="number"
                min={0}
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-400 transition"
              />
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Precio máx. (MXN)</span>
              <input
                type="number"
                min={0}
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                placeholder="Sin límite"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-400 transition"
              />
            </label>

            <label className="block">
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Duración</span>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value as Duracion)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-400 transition"
              >
                <option value="todas">Cualquiera</option>
                <option value="corta">Hasta 5 días</option>
                <option value="media">6 a 10 días</option>
                <option value="larga">Más de 10 días</option>
              </select>
            </label>
          </div>

          {!cargando && (
            <p className="text-xs text-gray-400 mt-4">
              Mostrando <span className="text-gray-700">{viajesFiltrados.length}</span> de {viajes.length} destinos
            </p>
          )}
        </div>

        {cargando && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-50 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {!cargando && viajes.length === 0 && (
          <div className="text-center py-24">
            <Plane className="w-10 h-10 text-gray-300 mx-auto mb-4" strokeWidth={1.2} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No hay destinos disponibles</h3>
            <p className="text-gray-400 text-sm">Intenta más tarde o contacta con soporte.</p>
          </div>
        )}

        {!cargando && viajes.length > 0 && viajesFiltrados.length === 0 && (
          <div className="text-center py-20">
            <SlidersHorizontal className="w-8 h-8 text-gray-300 mx-auto mb-3" strokeWidth={1.2} />
            <h3 className="text-base font-medium text-gray-800 mb-2">Sin resultados con estos filtros</h3>
            <button
              onClick={limpiarFiltros}
              className="text-sm text-orange-600 hover:text-orange-700 transition"
            >
              Limpiar filtros →
            </button>
          </div>
        )}

        {!cargando && viajesFiltrados.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {viajesFiltrados.map((viaje) => (
              <TravelCardDetailed
                key={viaje.id}
                id={viaje.id}
                nombre={viaje.title}
                destino={viaje.destination}
                precio={viaje.price}
                cuposDisponibles={viaje.available_seats}
                totalAsientos={viaje.available_seats + viaje.total_ventas}
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
