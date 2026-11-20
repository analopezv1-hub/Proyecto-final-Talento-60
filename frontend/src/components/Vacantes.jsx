// Buscador real de vacantes para candidatos.
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api.js";

const ESTADOS = {
  recibida: "Recibida",
  revisada: "Revisada",
  entrevista: "Entrevista",
  contratada: "Contratada",
  rechazada: "Rechazada",
};

export default function Vacantes({ sesion, onLogin }) {
  const [vacantes, setVacantes] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [categoria, setCategoria] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [seleccionada, setSeleccionada] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");

  const esCandidato = sesion?.usuario?.rol === "candidato";

  async function cargarVacantes() {
    setCargando(true);
    setError("");
    try {
      const datos = await apiFetch("/api/vacantes");
      if (Array.isArray(datos)) setVacantes(datos);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarPostulaciones() {
    if (!esCandidato) {
      setPostulaciones([]);
      return;
    }
    try {
      const datos = await apiFetch("/api/postulaciones/mias", {
        token: sesion.token,
      });
      if (Array.isArray(datos)) setPostulaciones(datos);
    } catch {
      // Si el token viejo falla, la lista de vacantes sigue visible.
    }
  }

  useEffect(() => {
    cargarVacantes();
  }, []);

  useEffect(() => {
    cargarPostulaciones();
  }, [sesion?.token, esCandidato]);

  const postuladas = useMemo(
    () =>
      new Set(
        postulaciones
          .map((postulacion) => postulacion.vacante?._id)
          .filter(Boolean),
      ),
    [postulaciones],
  );

  const categorias = useMemo(
    () => ["Todas", ...new Set(vacantes.map((vacante) => vacante.categoria))],
    [vacantes],
  );

  const visibles =
    categoria === "Todas"
      ? vacantes
      : vacantes.filter((vacante) => vacante.categoria === categoria);

  function abrirPostulacion(vacante) {
    if (!sesion) {
      onLogin?.();
      return;
    }
    if (!esCandidato) return;

    setSeleccionada(vacante._id);
    setMensaje("");
    setAviso("");
    setError("");
  }

  async function enviarPostulacion(evento) {
    evento.preventDefault();
    setEnviando(true);
    setError("");
    setAviso("");

    const vacanteId = seleccionada;

    try {
      await apiFetch(`/api/vacantes/${seleccionada}/postular`, {
        method: "POST",
        token: sesion.token,
        body: { mensaje },
      });
      setAviso("Postulación enviada");
      setPostulaciones((anteriores) => [
        ...anteriores,
        {
          _id: `local-${Date.now()}`,
          vacante: { _id: vacanteId },
          estado: "recibida",
        },
      ]);
      setSeleccionada("");
      setMensaje("");
      await cargarPostulaciones();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="seccion">
      <div className="seccion-cabecera">
        <div>
          <span className="badge badge-lila">Vacantes</span>
          <h2>Encuentra tu próximo rol</h2>
          <p>
            Aplica con tu videocurrículum y muestra cómo te comunicas antes de
            la entrevista.
          </p>
        </div>
        <button
          className="btn btn-blanco btn-sm"
          type="button"
          onClick={cargarVacantes}
          disabled={cargando}
        >
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="filtros" aria-label="Filtrar vacantes por categoría">
        {categorias.map((nombre) => (
          <button
            key={nombre}
            type="button"
            className={categoria === nombre ? "activo" : ""}
            onClick={() => setCategoria(nombre)}
          >
            {nombre}
          </button>
        ))}
      </div>

      {aviso && (
        <p className="login-msg exito" role="status">
          {aviso}
        </p>
      )}
      {error && (
        <p className="login-msg error" role="alert">
          {error}
        </p>
      )}

      {cargando && <p>Cargando vacantes...</p>}
      {!cargando && visibles.length === 0 && (
        <article className="card vacante-vacia">
          <i className="fa-solid fa-briefcase" aria-hidden="true" />
          <h3>No hay vacantes publicadas todavía</h3>
          <p>
            Cuando una empresa publique una vacante, aparecerá aquí para que
            puedas postularte.
          </p>
        </article>
      )}

      <div className="vacantes-lista">
        {visibles.map((vacante) => {
          const yaPostulada = postuladas.has(vacante._id);
          return (
            <article className="card vacante-card" key={vacante._id}>
              <div className="vacante-cabecera">
                <span className="badge badge-lila">{vacante.categoria}</span>
                <span className="vacante-meta">
                  {vacante.ciudad || "Sin ciudad"} · {vacante.modalidad}
                </span>
              </div>
              <h3>{vacante.titulo}</h3>
              <p className="vacante-empresa">{vacante.empresaNombre}</p>
              <p>{vacante.descripcion}</p>
              {Array.isArray(vacante.skills) && vacante.skills.length > 0 && (
                <div className="skills">
                  {vacante.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              )}

              {yaPostulada ? (
                <p className="login-msg exito">Ya enviaste tu postulación.</p>
              ) : seleccionada === vacante._id ? (
                <form className="vacante-postulacion" onSubmit={enviarPostulacion}>
                  <label htmlFor={`mensaje-${vacante._id}`}>
                    Mensaje para la empresa (opcional)
                  </label>
                  <textarea
                    id={`mensaje-${vacante._id}`}
                    rows="3"
                    maxLength={600}
                    value={mensaje}
                    onChange={(evento) => setMensaje(evento.target.value)}
                    placeholder="Cuéntale por qué te interesa esta vacante"
                  />
                  {error && (
                    <p className="login-msg error" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="vacante-postulacion-acciones">
                    <button
                      className="btn btn-morado btn-sm"
                      type="submit"
                      disabled={enviando}
                    >
                      {enviando ? "Enviando..." : "Enviar postulación"}
                    </button>
                    <button
                      className="btn btn-blanco btn-sm"
                      type="button"
                      onClick={() => setSeleccionada("")}
                      disabled={enviando}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  className="btn btn-morado btn-sm"
                  type="button"
                  onClick={() => abrirPostulacion(vacante)}
                >
                  {sesion
                    ? esCandidato
                      ? "Postularme"
                      : "Solo candidatos"
                    : "Iniciar sesión para postularme"}
                </button>
              )}

              {postulaciones.find(
                (postulacion) => postulacion.vacante?._id === vacante._id,
              )?.estado && (
                <span className="vacante-estado">
                  Estado:{" "}
                  {ESTADOS[
                    postulaciones.find(
                      (postulacion) => postulacion.vacante?._id === vacante._id,
                    ).estado
                  ] || "Recibida"}
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
