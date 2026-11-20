// Panel de empresa: publica vacantes, revisa postulantes y cambia estados.
import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";

const CATEGORIAS = ["Diseño UX", "Desarrollo", "Marketing", "Producto", "Otro"];
const MODALIDADES = ["Presencial", "Remoto", "Híbrido"];
const ESTADOS = [
  ["recibida", "Recibida"],
  ["revisada", "Revisada"],
  ["entrevista", "Entrevista"],
  ["contratada", "Contratada"],
  ["rechazada", "Rechazada"],
];

const FORM_INICIAL = {
  titulo: "",
  descripcion: "",
  ciudad: "",
  modalidad: "Presencial",
  categoria: "Otro",
  skills: "",
};

export default function PanelVacantes({ sesion, onNavegar }) {
  const [vacantes, setVacantes] = useState([]);
  const [postulantes, setPostulantes] = useState({});
  const [abierta, setAbierta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(FORM_INICIAL);
  const [creando, setCreando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargandoPostulantes, setCargandoPostulantes] = useState(false);

  function cambiarForm(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function cargarVacantes() {
    setCargando(true);
    setError("");
    try {
      const datos = await apiFetch("/api/vacantes/mias", {
        token: sesion.token,
      });
      if (Array.isArray(datos)) setVacantes(datos);
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarVacantes();
  }, [sesion.token]);

  async function crearVacante(evento) {
    evento.preventDefault();
    setCreando(true);
    setMensaje("");
    setError("");

    try {
      const nueva = await apiFetch("/api/vacantes", {
        method: "POST",
        token: sesion.token,
        body: form,
      });
      setVacantes((anteriores) => [nueva, ...anteriores]);
      setForm(FORM_INICIAL);
      setMensaje("Vacante publicada correctamente.");
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCreando(false);
    }
  }

  async function cambiarEstadoVacante(vacante) {
    setError("");
    setMensaje("");
    try {
      const actualizada = await apiFetch(`/api/vacantes/${vacante._id}`, {
        method: "PATCH",
        token: sesion.token,
        body: { estado: vacante.estado === "abierta" ? "cerrada" : "abierta" },
      });
      setVacantes((anteriores) =>
        anteriores.map((item) =>
          item._id === actualizada._id ? actualizada : item,
        ),
      );
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  async function verPostulantes(vacante) {
    if (abierta === vacante._id) {
      setAbierta("");
      return;
    }

    setAbierta(vacante._id);
    setCargandoPostulantes(true);
    setError("");
    try {
      const datos = await apiFetch(
        `/api/vacantes/${vacante._id}/postulaciones`,
        { token: sesion.token },
      );
      setPostulantes((anteriores) => ({
        ...anteriores,
        [vacante._id]: Array.isArray(datos) ? datos : [],
      }));
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setCargandoPostulantes(false);
    }
  }

  async function cambiarEstadoPostulacion(postulacion, estado) {
    setError("");
    try {
      const actualizada = await apiFetch(
        `/api/postulaciones/${postulacion._id}`,
        {
          method: "PATCH",
          token: sesion.token,
          body: { estado },
        },
      );
      setPostulantes((anteriores) => ({
        ...anteriores,
        [abierta]: (anteriores[abierta] || []).map((item) =>
          item._id === actualizada._id
            ? { ...item, estado: actualizada.estado }
            : item,
        ),
      }));
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  return (
    <section className="seccion">
      <div className="seccion-cabecera">
        <div>
          <span className="badge badge-lila">Empresas</span>
          <h2>Gestiona tus vacantes</h2>
          <p>
            Publica una búsqueda y revisa los videocurrículums de quienes se
            postulan.
          </p>
        </div>
        <button
          className="btn btn-blanco btn-sm"
          type="button"
          onClick={() => onNavegar("feed")}
        >
          Ver feed de candidatos
        </button>
      </div>

      {mensaje && (
        <p className="login-msg exito" role="status">
          {mensaje}
        </p>
      )}
      {error && (
        <p className="login-msg error" role="alert">
          {error}
        </p>
      )}

      <div className="panel-vacantes-columnas">
        <form className="card asistente-form panel-vacante-form" onSubmit={crearVacante}>
          <h3>Publicar una vacante</h3>
          <label htmlFor="vacante-titulo">Título</label>
          <input
            id="vacante-titulo"
            value={form.titulo}
            onChange={(evento) => cambiarForm("titulo", evento.target.value)}
            maxLength={100}
            placeholder="Ej.: Asesor comercial"
            required
          />

          <label htmlFor="vacante-descripcion">Descripción</label>
          <textarea
            id="vacante-descripcion"
            value={form.descripcion}
            onChange={(evento) =>
              cambiarForm("descripcion", evento.target.value)
            }
            maxLength={1200}
            rows="4"
            placeholder="Cuenta qué necesita el equipo y qué hará la persona."
            required
          />

          <div className="panel-vacante-grid">
            <div>
              <label htmlFor="vacante-ciudad">Ciudad</label>
              <input
                id="vacante-ciudad"
                value={form.ciudad}
                onChange={(evento) =>
                  cambiarForm("ciudad", evento.target.value)
                }
                maxLength={80}
                placeholder="Ej.: Medellín"
              />
            </div>
            <div>
              <label htmlFor="vacante-modalidad">Modalidad</label>
              <select
                id="vacante-modalidad"
                value={form.modalidad}
                onChange={(evento) =>
                  cambiarForm("modalidad", evento.target.value)
                }
              >
                {MODALIDADES.map((modalidad) => (
                  <option key={modalidad} value={modalidad}>
                    {modalidad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="vacante-categoria">Categoría</label>
          <select
            id="vacante-categoria"
            value={form.categoria}
            onChange={(evento) =>
              cambiarForm("categoria", evento.target.value)
            }
          >
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>

          <label htmlFor="vacante-skills">
            Habilidades (separadas por coma)
          </label>
          <input
            id="vacante-skills"
            value={form.skills}
            onChange={(evento) => cambiarForm("skills", evento.target.value)}
            maxLength={200}
            placeholder="Ej.: Ventas, comunicación, CRM"
          />

          <button className="btn btn-morado" type="submit" disabled={creando}>
            {creando ? "Publicando..." : "Publicar vacante"}
          </button>
        </form>

        <div className="panel-vacantes-lista">
          <h3>Mis vacantes</h3>
          {cargando && <p>Cargando vacantes...</p>}
          {!cargando && vacantes.length === 0 && (
            <article className="card vacante-vacia">
              <i className="fa-solid fa-briefcase" aria-hidden="true" />
              <h4>Aún no has publicado vacantes</h4>
              <p>Usa el formulario para crear la primera búsqueda.</p>
            </article>
          )}

          {vacantes.map((vacante) => (
            <article className="card vacante-card" key={vacante._id}>
              <div className="vacante-cabecera">
                <span
                  className={
                    vacante.estado === "abierta"
                      ? "badge badge-lila"
                      : "badge badge-coral"
                  }
                >
                  {vacante.estado === "abierta" ? "Abierta" : "Cerrada"}
                </span>
                <span className="vacante-meta">
                  {vacante.ciudad || "Sin ciudad"} · {vacante.modalidad}
                </span>
              </div>
              <h3>{vacante.titulo}</h3>
              <p>{vacante.descripcion}</p>
              {Array.isArray(vacante.skills) && vacante.skills.length > 0 && (
                <div className="skills">
                  {vacante.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              )}
              <p className="small">
                {vacante.postulaciones || 0} postulante
                {vacante.postulaciones === 1 ? "" : "s"} · {vacante.categoria}
              </p>

              <div className="perfil-video-acciones">
                <button
                  className="btn btn-morado btn-sm"
                  type="button"
                  onClick={() => verPostulantes(vacante)}
                >
                  {abierta === vacante._id
                    ? "Ocultar postulantes"
                    : "Ver postulantes"}
                </button>
                <button
                  className="btn btn-blanco btn-sm"
                  type="button"
                  onClick={() => cambiarEstadoVacante(vacante)}
                >
                  {vacante.estado === "abierta"
                    ? "Cerrar vacante"
                    : "Reabrir vacante"}
                </button>
              </div>

              {abierta === vacante._id && (
                <div className="postulantes-lista">
                  {cargandoPostulantes && <p>Cargando postulantes...</p>}
                  {!cargandoPostulantes &&
                    (postulantes[vacante._id] || []).length === 0 && (
                      <p className="small">
                        Todavía no hay candidatos postulados.
                      </p>
                    )}
                  {(postulantes[vacante._id] || []).map((postulacion) => (
                    <article className="card postulante-card" key={postulacion._id}>
                      <div className="postulante-info">
                        <h4>{postulacion.candidato?.nombre || "Candidato"}</h4>
                        <p className="small">
                          {postulacion.candidato?.email || ""}
                        </p>
                        {postulacion.video ? (
                          <>
                            <p>
                              {postulacion.video.cargo || "Sin cargo"}
                              {postulacion.video.edad
                                ? ` · ${postulacion.video.edad} años`
                                : ""}
                            </p>
                            <video
                              src={postulacion.video.url}
                              controls
                              preload="metadata"
                            />
                            {Array.isArray(postulacion.video.skills) &&
                              postulacion.video.skills.length > 0 && (
                                <div className="skills">
                                  {postulacion.video.skills.map((skill) => (
                                    <span key={skill}>{skill}</span>
                                  ))}
                                </div>
                              )}
                          </>
                        ) : (
                          <p className="small">Este candidato no tiene video.</p>
                        )}
                        {postulacion.mensaje && (
                          <p className="postulante-mensaje">
                            “{postulacion.mensaje}”
                          </p>
                        )}
                      </div>
                      <div className="postulante-acciones">
                        <label htmlFor={`estado-${postulacion._id}`}>
                          Estado
                        </label>
                        <select
                          id={`estado-${postulacion._id}`}
                          value={postulacion.estado}
                          onChange={(evento) =>
                            cambiarEstadoPostulacion(
                              postulacion,
                              evento.target.value,
                            )
                          }
                        >
                          {ESTADOS.map(([valor, texto]) => (
                            <option key={valor} value={valor}>
                              {texto}
                            </option>
                          ))}
                        </select>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
