import { StrictMode }            from 'react'
import { createRoot, type Root } from 'react-dom/client'
import ApplicationRouter         from './ApplicationRouter.tsx'
import './assets/css/main.css'
const element: HTMLElement | null = document.getElementById('root');
const site: Root = createRoot(element!);

site.render(
    <StrictMode>
        <ApplicationRouter/>
    </StrictMode>
);