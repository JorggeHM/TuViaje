function Nav() {
  return (
    <header className="bg-linear-to-r from-orange-600 via-orange-500 to-orange-400 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="inline-flex items-center gap-2 text-white">
          <span className="rounded-full bg-white/20 p-2 text-lg">✈</span>
          <span className="font-black tracking-wide text-lg">TViaje</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-white">
          <a href="#inicio" className="transition hover:text-orange-200">Inicio</a>
          <a href="#destinos" className="transition hover:text-orange-200">Destinos</a>
          <a href="#experiencias" className="transition hover:text-orange-200">Experiencias</a>
          <a href="#nosotros" className="transition hover:text-orange-200">Nosotros</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="#iniciar-sesion" className="rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25 hover:text-orange-100">
            Iniciar sesión
          </a>
        </div>

        <button className="md:hidden rounded-lg bg-white/15 px-3 py-2 text-white transition hover:bg-white/25">
          <span className="text-xl">☰</span>
        </button>
      </div>
    </header>
  )
}

export default Nav