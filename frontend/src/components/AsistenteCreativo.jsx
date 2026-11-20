// Tarjeta del Asistente creativo: convierte el perfil en ideas para el video.
import { useState } from "react";
import { apiFetch } from "../api.js";

// Orden fijo de las secciones que devuelve el backend.
const SECCIONES = [
  { clave: "gancho", titulo: "Gancho" },
  { clave: "guion", titulo: "Guión de 60 segundos" },
  { clave: "cierre", titulo: "Cierre" },
  { clave: "titulos", titulo: "Nombres o títulos" },
  { clave: "mensajes", titulo: "Mensajes" },
  { clave: "mejoras", titulo: "Mejoras" },
];

// Tarjeta del Asistente creativo: recibe el perfil y muestra las ideas.
export default function AsistenteCreativo() {
  // Estados del formulario, resultado, errores y carga.
  const [rol, setRol] = useState("");
  const [detalles, setDetalles] = useState("");
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // Envía el perfil al backend y guarda las sugerencias.
  async function generar(evento) {
    evento.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      const datos = await apiFetch("/api/ia/asistente", {
        method: "POST",
        body: { rol, detalles },
      });
      setResultado(datos);
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    // La tarjeta muestra el formulario y, si hay resultado, las ideas.
    <article className="card asistente-creativo">
      <div className="asistente-cabecera">
        <span className="asistente-icono" aria-hidden="true">
          +
        </span>
        <div>
          <h2>Asistente creativo</h2>
          <p>Propone ideas, nombres, mensajes o mejoras para tu video.</p>
        </div>
      </div>

      <form className="asistente-form" onSubmit={generar}>
        <label htmlFor="asistente-rol">Tu rol o profesión</label>
        <input
          id="asistente-rol"
          value={rol}
          onChange={(evento) => setRol(evento.target.value)}
          placeholder="Ej.: Diseñadora UX"
        />

        <label htmlFor="asistente-detalles">
          Habilidades, logros y objetivo
        </label>
        <textarea
          id="asistente-detalles"
          value={detalles}
          onChange={(evento) => setDetalles(evento.target.value)}
          placeholder="Ej.: Figma, investigación, lideré un rediseño..."
          rows="3"
        />

        <button className="btn btn-morado" type="submit" disabled={cargando}>
          {cargando ? "Generando..." : "Generar ideas"}
        </button>
      </form>

      {mensaje && (
        <p className="login-msg" role="status">
          {mensaje}
        </p>
      )}

      {resultado && (
        <div className="asistente-resultados">
          {/* Recorre las secciones y decide si muestra lista o párrafo. */}
          {SECCIONES.map(({ clave, titulo }) => {
            const valor = resultado[clave];
            if (!valor) return null;

            return (
              <section key={clave}>
                <h3>{titulo}</h3>
                {Array.isArray(valor) ? (
                  <ul>
                    {valor.map((item, indice) => (
                      <li key={`${clave}-${indice}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{valor}</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}
