import { type JSX } from "react";
import { Outlet }             from "react-router";
import FooterPublic                    from "../../web.public/layout/FooterPublic.tsx";
import Nav                    from "../../web.public/layout/Nav";
const PublicLayout = (): JSX.Element => {
    return (
        <div className={"flex min-h-screen flex-col"}>

            <Nav/>

            <main>
                    <Outlet/>
            </main>

            <FooterPublic/>
        </div>
    );
};


export default PublicLayout;