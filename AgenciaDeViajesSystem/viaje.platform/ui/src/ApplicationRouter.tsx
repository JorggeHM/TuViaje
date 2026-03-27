
import { type JSX, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import PrivateLayout                                 from "./web.private/layout/PrivateLayout.tsx";
import LoginPage                                     from "./web.private/pages/Login.tsx";

import PublicLayout                                  from "./web.public/layout/PublicLayout.tsx";
import { DestinosPage, HomePage, AboutUSPage }       from "./web.public/pages";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const ApplicationRouter = (): JSX.Element => {

    return (
        <BrowserRouter basename={"/"}>

            <ScrollToTop />

            <Routes>

                <Route element={<PublicLayout/>}>
                    <Route path={"/"} element={<HomePage/>}/>
                    <Route path={"/nosotros"} element={<AboutUSPage/>}/>
                    <Route path={"/destinos"} element={<DestinosPage/>}/>
                </Route>

                <Route element={<PrivateLayout/>}>
                    <Route path={"/login"} element={<LoginPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default ApplicationRouter
