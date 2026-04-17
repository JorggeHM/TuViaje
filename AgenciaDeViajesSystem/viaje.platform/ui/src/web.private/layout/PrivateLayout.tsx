/**
 * PrivateLayout.tsx — Layout para páginas de autenticación (login / registro)
 *
 * Reutiliza los mismos Nav y Footer del área pública, pero NO incluye
 * el CoverPublic (hero banner), ya que las páginas de login y registro
 * tienen su propio diseño de pantalla completa.
 *
 * Árbol visual:
 *   <PrivateLayout>
 *     <Nav />        ← misma barra de navegación que el área pública
 *     <Outlet />     ← aquí se renderiza Login o Register
 *     <FooterPublic />
 *   </PrivateLayout>
 *
 * NOTA: En el futuro este layout puede incluir un guard de autenticación
 * que redirija al usuario si ya está logueado (usando AuthService.isAuthenticated()).
 */
import { type JSX } from "react";
import { Outlet }   from "react-router";
import FooterPublic from "../../web.public/layout/FooterPublic.tsx";
import Nav          from "../../web.public/layout/Nav";

const PrivateLayout = (): JSX.Element => {
    return (
        <div className={"flex min-h-screen flex-col"}>

            {/* Barra de navegación compartida con el área pública */}
            <Nav/>

            {/* Login o Register se renderiza aquí */}
            <main>
                <Outlet/>
            </main>

            <FooterPublic/>
        </div>
    );
};

export default PrivateLayout;
