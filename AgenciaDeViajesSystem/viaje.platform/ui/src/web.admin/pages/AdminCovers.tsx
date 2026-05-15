import { useState, useEffect, useRef } from "react";
import {
  ImageIcon, Upload, Link as LinkIcon, Eye, EyeOff, Trash2, X, Loader2, CheckCircle2,
} from "lucide-react";
import CoversService, { type CoverImagen } from "../../infrastructure/services/covers.service";

export default function AdminCovers() {
  const [covers,        setCovers]        = useState<CoverImagen[]>([]);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [exito,         setExito]         = useState<string | null>(null);
  const [confirmElim,   setConfirmElim]   = useState<number | null>(null);

  // Formulario
  const [modo,          setModo]          = useState<"archivo" | "url">("archivo");
  const [archivo,       setArchivo]       = useState<File | null>(null);
  const [previewLocal,  setPreviewLocal]  = useState<string | null>(null);
  const [urlExterna,    setUrlExterna]    = useState("");
  const [orden,         setOrden]         = useState(0);
  const [enviando,      setEnviando]      = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    CoversService.listarTodas()
      .then(setCovers)
      .catch(() => setError("No se pudo cargar la lista de imágenes."))
      .finally(() => setCargando(false));
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setArchivo(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreviewLocal(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreviewLocal(null);
    }
  };

  const limpiarForm = () => {
    setArchivo(null);
    setPreviewLocal(null);
    setUrlExterna("");
    setOrden(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (modo === "archivo" && !archivo) {
      setError("Seleccioná un archivo de imagen.");
      return;
    }
    if (modo === "url" && !urlExterna.trim()) {
      setError("Ingresá una URL válida.");
      return;
    }

    setEnviando(true);
    try {
      const nuevo = modo === "archivo"
        ? await CoversService.subirArchivo(archivo!, orden)
        : await CoversService.agregarPorUrl(urlExterna.trim(), orden);
      setCovers((prev) => [nuevo, ...prev]);
      setExito("Imagen agregada al header.");
      limpiarForm();
      setTimeout(() => setExito(null), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo agregar la imagen.");
    } finally {
      setEnviando(false);
    }
  };

  const toggleVisible = async (id: number) => {
    try {
      const res = await CoversService.toggleVisible(id);
      const nuevoVisible = (res.data?.visible ?? 1) as number;
      setCovers((prev) => prev.map((c) => c.id === id ? { ...c, visible: nuevoVisible } : c));
    } catch {
      setError("Error al cambiar la visibilidad.");
    }
  };

  const eliminar = async (id: number) => {
    try {
      await CoversService.eliminar(id);
      setCovers((prev) => prev.filter((c) => c.id !== id));
      setConfirmElim(null);
    } catch {
      setError("Error al eliminar la imagen.");
    }
  };

  const totalVisibles = covers.filter((c) => c.visible === 1).length;
  const totalOcultas  = covers.filter((c) => c.visible === 0).length;

  return (
    <div className="space-y-6 max-w-6xl">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {exito && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4" /> {exito}
        </div>
      )}

      {/* Mini métricas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total imágenes", valor: covers.length,  color: "bg-purple-50 text-purple-600", Icon: ImageIcon },
          { label: "Visibles",       valor: totalVisibles,  color: "bg-green-50  text-green-600",  Icon: Eye },
          { label: "Ocultas",        valor: totalOcultas,   color: "bg-gray-100  text-gray-500",   Icon: EyeOff },
        ].map(({ label, valor, color, Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{valor}</p>
              <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario de carga */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
          <Upload className="w-5 h-5 text-orange-500" /> Agregar imagen al header
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Las imágenes visibles se muestran como fondo del hero principal en /, /destinos, /experiencias y /nosotros.
          Recomendado: 1600 × 900 px o mayor, JPG/PNG/WEBP, hasta 5 MB.
        </p>

        {/* Selector de modo */}
        <div className="flex gap-2 mb-4">
          {[
            { v: "archivo" as const, label: "Subir archivo",  Icon: Upload },
            { v: "url"     as const, label: "URL externa",    Icon: LinkIcon },
          ].map(({ v, label, Icon }) => (
            <button key={v} type="button" onClick={() => setModo(v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                modo === v
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "archivo" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Archivo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFileChange}
                className="w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
              />
              {previewLocal && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 max-w-md">
                  <img src={previewLocal} alt="Preview" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL de la imagen</label>
              <input
                type="url"
                value={urlExterna}
                onChange={(e) => setUrlExterna(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
              />
            </div>
          )}

          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Orden (menor = primero)</label>
            <input
              type="number"
              min="0"
              value={orden}
              onChange={(e) => setOrden(parseInt(e.target.value || "0", 10))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition disabled:opacity-60"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {enviando ? "Subiendo..." : "Agregar al header"}
          </button>
        </form>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-500" /> Imágenes del header
        </h2>

        {cargando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : covers.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">
            Aún no agregaste imágenes al header. Subí la primera arriba.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {covers.map((c) => (
              <div key={c.id} className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
                <div className="relative h-40">
                  <img src={c.url} alt="" className={`w-full h-full object-cover ${c.visible === 0 ? "grayscale opacity-50" : ""}`} />
                  <span className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    c.visible === 1
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {c.visible === 1 ? <><Eye className="w-3 h-3" />Visible</> : <><EyeOff className="w-3 h-3" />Oculta</>}
                  </span>
                  {c.orden > 0 && (
                    <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-gray-700 border border-gray-200">
                      Orden {c.orden}
                    </span>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 truncate flex-1" title={c.url}>{c.url}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => toggleVisible(c.id)}
                      title={c.visible === 1 ? "Ocultar" : "Mostrar"}
                      className={`p-2 rounded-lg transition ${
                        c.visible === 1
                          ? "text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                          : "text-gray-400 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      {c.visible === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setConfirmElim(c.id)} title="Eliminar"
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal confirmar eliminación */}
      {confirmElim !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">¿Eliminar esta imagen?</h3>
            <p className="text-sm text-gray-400 mb-6">
              Si fue subida al servidor, también se borra el archivo. Si solo querés que no aparezca, podés ocultarla.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmElim(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmElim)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
