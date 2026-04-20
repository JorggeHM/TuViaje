/**
 * PublicLayout.tsx — Layout base para todas las páginas públicas
 *
 * Actúa como "plantilla" que envuelve el contenido de cada página pública.
 * React Router inyecta la página activa en el <Outlet/>.
 *
 * Árbol visual:
 *   <PublicLayout>
 *     <Nav />                           ← barra de navegación (siempre visible)
 *     {mostrarCover && <CoverPublic />} ← hero banner (condicional)
 *     <Outlet />                        ← aquí se renderiza la página activa
 *     <FooterPublic />                  ← pie de página (siempre visible)
 *   </PublicLayout>
 *
 * ¿Por qué CoverPublic es condicional?
 * La página /viaje/detalle tiene su propio layout de contenido completo
 * (galería + info + panel de compra) y no necesita el hero encima.
 * Se agrega la ruta a SIN_COVER para ocultarlo.
 */
import { type JSX } from "react";
import { Outlet, useLocation } from "react-router";
import FooterPublic from "./FooterPublic.tsx";
import Nav         from "./Nav.tsx";
import CoverPublic from "./CoverPublic.tsx";

const PublicLayout = (): JSX.Element => {
    const { pathname } = useLocation();

    // Ocultar hero en la ficha de detalle de viaje (sea por state o por ID en URL)
    const mostrarCover = pathname !== "/viaje/detalle" && !pathname.startsWith("/viaje/");

    return (
        <div className={"flex min-h-screen flex-col"}>
            <Nav/>

            {/* Hero banner — visible en /, /destinos, /experiencias, /nosotros */}
            {mostrarCover && <CoverPublic/>}

            {/* Contenido de la página activa según la ruta */}
            <main className="flex-1">
                <Outlet/>
            </main>

            <FooterPublic/>
        </div>
    );
};

export default PublicLayout;
