/**
 * PublicLayout.tsx — Layout base para todas las páginas públicas
 *
 * Cover:
 *   - "/" → grande (hero principal)
 *   - "/destinos", "/experiencias", "/nosotros" → compacto, decorativo
 *   - "/viaje/:id" → sin cover (la página tiene breadcrumb propio)
 */
import { type JSX } from "react";
import { Outlet, useLocation } from "react-router";
import FooterPublic from "./FooterPublic.tsx";
import Nav         from "./Nav.tsx";
import CoverPublic from "./CoverPublic.tsx";

interface CoverConfig {
  compact?: boolean;
  title?: string;
  subtitle?: string;
  tag?: string;
}

const COVERS: Record<string, CoverConfig | null> = {
  "/":              { compact: false },
  "/destinos":      { compact: true, tag: "Catálogo completo", title: "Todos los destinos", subtitle: "Encuentra el viaje perfecto entre nuestra selección." },
  "/experiencias":  { compact: true, tag: "Comunidad de viajeros", title: "Experiencias", subtitle: "Comparte tu viaje e inspira a otros aventureros." },
  "/nosotros":      { compact: true, tag: "Nuestra historia", title: "Sobre nosotros", subtitle: "Creando experiencias de viaje inolvidables desde hace más de 10 años." },
};

const PublicLayout = (): JSX.Element => {
    const { pathname } = useLocation();
    const cover = COVERS[pathname] ?? null;

    return (
        <div className={"flex min-h-screen flex-col"}>
            <Nav/>

            {cover && <CoverPublic {...cover} />}

            <main className="flex-1">
                <Outlet/>
            </main>

            <FooterPublic/>
        </div>
    );
};

export default PublicLayout;
