import { type JSX, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import PrivateLayout      from "./web.private/layout/PrivateLayout.tsx";
import LoginPage          from "./web.private/pages/Login.tsx";
import PerfilPage         from "./web.private/pages/Perfil.tsx";
import ForgotPasswordPage from "./web.private/pages/ForgotPassword.tsx";
import ResetPasswordPage  from "./web.private/pages/ResetPassword.tsx";

import PublicLayout    from "./web.public/layout/PublicLayout.tsx";
import {
  DestinosPage, HomePage, AboutUSPage, Register, ViajeDetallePage, ExperienciasPage,
  PagoExitoPage, PagoCanceladoPage,
} from "./web.public/pages";

import AdminLayout       from "./web.admin/layout/AdminLayout.tsx";
import AdminResumen      from "./web.admin/pages/AdminResumen.tsx";
import AdminViajes       from "./web.admin/pages/AdminViajes.tsx";
import AdminUsuarios     from "./web.admin/pages/AdminUsuarios.tsx";
import AdminVentas       from "./web.admin/pages/AdminVentas.tsx";
import AdminExperiencias from "./web.admin/pages/AdminExperiencias.tsx";
import AdminCovers       from "./web.admin/pages/AdminCovers.tsx";

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
                    <Route path={"/viaje/:id"}      element={<ViajeDetallePage/>}/>
                    <Route path={"/pago/exito"}     element={<PagoExitoPage/>}/>
                    <Route path={"/pago/cancelado"} element={<PagoCanceladoPage/>}/>
                </Route>

                {/* ── Rutas privadas (login / registro / perfil) ──────── */}
                <Route element={<PrivateLayout/>}>
                    <Route path={"/login"}                  element={<LoginPage/>}/>
                    <Route path={"/register"}               element={<Register/>}/>
                    <Route path={"/perfil"}                 element={<PerfilPage/>}/>
                    <Route path={"/forgot-password"}        element={<ForgotPasswordPage/>}/>
                    <Route path={"/reset-password/:token"}  element={<ResetPasswordPage/>}/>
                </Route>

                {/* ── Panel de administración (layout propio) ──────────── */}
                <Route path={"/admin"} element={<AdminLayout/>}>
                    <Route index                 element={<AdminResumen/>}/>
                    <Route path={"viajes"}       element={<AdminViajes/>}/>
                    <Route path={"usuarios"}     element={<AdminUsuarios/>}/>
                    <Route path={"ventas"}       element={<AdminVentas/>}/>
                    <Route path={"experiencias"} element={<AdminExperiencias/>}/>
                    <Route path={"covers"}       element={<AdminCovers/>}/>
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default ApplicationRouter;
