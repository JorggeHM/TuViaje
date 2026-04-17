/**
 * main.tsx — Punto de entrada de la aplicación React
 *
 * Este es el primer archivo que ejecuta el navegador al cargar la SPA.
 * Se encarga de montar el árbol de componentes dentro del <div id="root">
 * que se encuentra en index.html.
 *
 * Flujo de arranque:
 *   index.html
 *     └── main.tsx          ← aquí empieza React
 *           └── ApplicationRouter  ← define las rutas
 *                 ├── PublicLayout  ← para páginas públicas
 *                 └── PrivateLayout ← para login / registro
 *
 * StrictMode: en desarrollo activa advertencias adicionales de React
 * (doble render de efectos, detección de APIs obsoletas, etc.)
 */
import { StrictMode }            from 'react'
import { createRoot, type Root } from 'react-dom/client'
import ApplicationRouter         from './ApplicationRouter.tsx'
import './assets/css/main.css'   // Estilos globales con Tailwind CSS

// Obtiene el nodo raíz del DOM definido en index.html
const element: HTMLElement | null = document.getElementById('root');

// Crea la raíz de React y renderiza la aplicación completa
const site: Root = createRoot(element!);

site.render(
    <StrictMode>
        <ApplicationRouter/>
    </StrictMode>
);
