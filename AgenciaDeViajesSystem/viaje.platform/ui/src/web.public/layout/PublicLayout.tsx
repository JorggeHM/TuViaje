import { type JSX } from "react";
import { Outlet }             from "react-router";
import CoverPublic            from "./CoverPublic.tsx";
import FooterPublic           from "./FooterPublic.tsx";
import Nav                    from "./Nav.tsx";   

const PublicLayout = (): JSX.Element => {
    return (
        <div className={"flex min-h-screen flex-col"}>
            <Nav/>

            <CoverPublic/>

            <main>
                    <Outlet/>
            </main>

            <FooterPublic/>
        </div>
    );
};


export default PublicLayout;