/**
 * index.ts — Barrel de exportaciones para las páginas públicas
 *
 * Centraliza todos los exports de páginas para que ApplicationRouter
 * pueda importarlos desde un solo lugar:
 *   import { HomePage, DestinosPage, ... } from "./web.public/pages"
 *
 * Al agregar una nueva página pública, se debe:
 *   1. Crear el archivo .tsx en esta carpeta
 *   2. Agregar el export aquí
 *   3. Registrar la ruta en ApplicationRouter.tsx
 */
export { default as DestinosPage      } from "./Destinos.tsx";
export { default as HomePage          } from "./Inicio.tsx";
export { default as AboutUSPage       } from "./AboutUs.tsx";
export { default as Register          } from "./Register.tsx";
export { default as ViajeDetallePage  } from "./ViajeDetalle.tsx";
export { default as ExperienciasPage  } from "./Experiencias.tsx";
export { default as PagoExitoPage     } from "./PagoExito.tsx";
export { default as PagoCanceladoPage } from "./PagoCancelado.tsx";
