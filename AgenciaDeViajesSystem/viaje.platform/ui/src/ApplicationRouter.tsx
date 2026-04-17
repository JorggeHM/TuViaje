/**
 * ApplicationRouter.tsx — Enrutador central de la aplicación
 *
 * Define TODAS las rutas de la SPA y las agrupa bajo sus layouts correspondientes.
 * Es el archivo que conecta URLs con componentes de página.
 *
 * Mapa de rutas:
 * ┌─ PublicLayout  (Nav + CoverPublic condicional + Footer)
 * │   ├── /                 → HomePage        Página de inicio con hero y secciones
 * │   ├── /nosotros         → AboutUSPage     Información de la empresa
 * │   ├── /destinos         → DestinosPage    Catálogo de viajes desde la API
 * │   ├── /experiencias     → ExperienciasPage Feed de experiencias de viajeros
 * │   └── /viaje/detalle    → ViajeDetallePage Ficha de producto (sin CoverPublic)
 * │
 * ├─ PrivateLayout  (Nav + Footer, sin CoverPublic)
 * │   ├── /login            → LoginPage       Formulario de inicio de sesión
 * │   └── /register         → Register        Formulario de registro
 * │
 * └─ AdminLayout  (Sidebar + Topbar — sin Nav ni Footer públicos)
 *     ├── /admin            → AdminResumen    Overview con métricas y últimas ventas
 *     ├── /admin/viajes     → AdminViajes     CRUD de viajes (tabla + modal)
 *     ├── /admin/usuarios   → AdminUsuarios   Lista de usuarios registrados
 *     └── /admin/ventas     → AdminVentas     Reporte de ingresos y ventas
 *
 * NOTA: Los datos del viaje seleccionado se pasan a /viaje/detalle mediante
 * React Router state (navigate("/viaje/detalle", { state: {...} })).
 * No se usa un parámetro :id en la URL porque no hay endpoint individual en la API.
 */
import { type JSX, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import PrivateLayout   from "./web.private/layout/PrivateLayout.tsx";
import LoginPage       from "./web.private/pages/Login.tsx";

import PublicLayout    from "./web.public/layout/PublicLayout.tsx";
import { DestinosPage, HomePage, AboutUSPage, Register, ViajeDetallePage, ExperienciasPage } from "./web.public/pages";

import AdminLayout    from "./web.admin/layout/AdminLayout.tsx";
import AdminResumen   from "./web.admin/pages/AdminResumen.tsx";
import AdminViajes    from "./web.admin/pages/AdminViajes.tsx";
import AdminUsuarios  from "./web.admin/pages/AdminUsuarios.tsx";
import AdminVentas    from "./web.admin/pages/AdminVentas.tsx";

/**
 * ScrollToTop — Componente auxiliar sin render visual.
 * Escucha los cambios de ruta y hace scroll al inicio de la página.
 * Evita que el usuario llegue a una nueva página con el scroll en la mitad.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]); // Se dispara cada vez que cambia la URL

    return null; // No renderiza ningún elemento en el DOM
};

const ApplicationRouter = (): JSX.Element => {
    return (
        <BrowserRouter basename={"/"}>

            {/* ScrollToTop debe ir dentro de BrowserRouter para acceder a useLocation */}
            <ScrollToTop />

            <Routes>

                {/* ── Rutas públicas ──────────────────────────────────────
                    Comparten Nav y Footer.
                    CoverPublic se oculta automáticamente en /viaje/detalle
                    (ver lógica en PublicLayout.tsx).
                ─────────────────────────────────────────────────────── */}
                <Route element={<PublicLayout/>}>
                    <Route path={"/"}               element={<HomePage/>}/>
                    <Route path={"/nosotros"}       element={<AboutUSPage/>}/>
                    <Route path={"/destinos"}        element={<DestinosPage/>}/>
                    <Route path={"/experiencias"}   element={<ExperienciasPage/>}/>
                    <Route path={"/viaje/detalle"}  element={<ViajeDetallePage/>}/>
                </Route>

                {/* ── Rutas privadas ──────────────────────────────────────
                    Comparten el mismo Nav y Footer pero NO muestran CoverPublic.
                    En un futuro se puede agregar un guard de autenticación aquí.
                ─────────────────────────────────────────────────────── */}
                <Route element={<PrivateLayout/>}>
                    <Route path={"/login"}    element={<LoginPage/>}/>
                    <Route path={"/register"} element={<Register/>}/>
                    <Route path={"/admin"} element={<AdminLayout/>}>
                        <Route path={"resumen"} element={<AdminResumen/>}/>
                        <Route path={"viajes"} element={<AdminViajes/>}/>
                        <Route path={"usuarios"} element={<AdminUsuarios/>}/>
                        <Route path={"ventas"} element={<AdminVentas/>}/>
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default ApplicationRouter;
