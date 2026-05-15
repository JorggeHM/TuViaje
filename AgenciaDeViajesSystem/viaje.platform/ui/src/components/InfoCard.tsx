/**
 * InfoCard.tsx — Tarjeta de información minimalista
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
    <div className={`rounded-xl p-7 border transition ${accent ? "bg-orange-50 border-orange-200" : "bg-white border-orange-100/60 hover:border-orange-200"}`}>
      {Icon && (
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 mb-4">
          <Icon className="w-5 h-5" strokeWidth={1.6} />
        </div>
      )}
      <h3 className="text-base font-medium mb-2 text-gray-900 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default InfoCard;
