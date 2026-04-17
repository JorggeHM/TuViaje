/**
 * InfoCard.tsx — Tarjeta de información genérica
 *
 * Componente reutilizable para mostrar un bloque de título + descripción.
 * Se usa en AboutUs.tsx para las secciones de Misión, Visión, Valores,
 * Contacto y Términos.
 *
 * Props:
 *   title       — Título de la tarjeta
 *   description — Texto descriptivo
 *   icon        — (opcional) Ícono de Lucide React; si se provee, se muestra
 *                 en un cuadro naranja arriba del título
 *   accent      — (opcional) Si es true, el fondo es naranja suave (bg-orange-50)
 *                 en lugar de blanco. Útil para destacar tarjetas importantes.
 */
import { type LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  accent?: boolean;
}

const InfoCard = ({ title, description, icon: Icon, accent = false }: InfoCardProps) => {
  return (
    <div className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border ${accent ? "bg-orange-50 border-orange-100" : "bg-white border-gray-100"}`}>

      {/* Ícono — solo se renderiza si se pasa como prop */}
      {Icon && (
        <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500 shadow-md shadow-orange-900/20">
          <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
        </div>
      )}

      <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default InfoCard;
