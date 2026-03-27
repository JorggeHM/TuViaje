import { type JSX } from "react";
import { Outlet }             from "react-router";
import CoverPublic            from "./CoverPrivate.tsx";
import FooterPublic           from "./FooterPrivate.tsx";

const PublicLayout = (): JSX.Element => {
    return (
        <div className={"flex min-h-screen flex-col"}>

            <CoverPublic/>

            <main>
                    <Outlet/>
            </main>

            <FooterPublic/>
        </div>
    );
};


export default PublicLayout;