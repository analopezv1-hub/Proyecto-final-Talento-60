// Perfil del usuario: datos, estadísticas y videos subidos.
import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";

const CATEGORIAS = ["Diseño UX", "Desarrollo", "Marketing", "Producto", "Otro"];

function formatearFecha(fecha) {
  if (!fecha) return "Sin videos";
  return new Date(fecha).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatearDuracion(segundos) {
  const total = Math.round(Number(segundos) || 0);
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  if (!total) return "0 s";
  if (!minutos) return `${resto} s`;
  return `${minutos} min ${resto} s`;
}

export default function Perfil({ sesion, onLogin, onNavegar }) {
  const [videos, setVideos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeEdicion, setMensajeEdicion] = useState("");
  const [form, setForm] = useState({
    titulo: "",
    cargo: "",
    categoria: "",
    edad: "",
    skills: "",
  });

  // Carga los videos del usuario cada vez que cambia la sesión.
  useEffect(() => {
    if (!sesion?.token || sesion.usuario.rol === "empresa") {
      setVideos([]);
      return undefined;
    }

    let activo = true;
    setCargando(true);
    setError("");

    apiFetch("/api/videos/mios", { token: sesion.token })
      .then((datos) => {
        if (activo && Array.isArray(datos)) setVideos(datos);
      })
      .catch((fallo) => {
        if (activo) setError(fallo.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [sesion?.token]);

  if (!sesion) {
    return (
      <div className="vista" data-vista-content="perfil">
        <section className="seccion">
          <div className="card perfil-bloqueado">
            <h2>Mi perfil</h2>
            <p>Inicia sesión para ver tus datos y tus videos.</p>
            <button className="btn btn-morado" type="button" onClick={onLogin}>
              Iniciar sesión
            </button>
          </div>
        </section>
      </div>
    );
  }

  const nombre = sesion.usuario.nombre || sesion.usuario.email;
  const esEmpresa = sesion.usuario.rol === "empresa";
  const rol = esEmpresa ? "Empresa" : "Candidato";
  const totalSegundos = videos.reduce(
    (total, video) => total + Number(video.duracion || 0),
    0,
  );
  const ultimaSubida = videos[0]?.creado;

  function abrirEditor(video) {
    setEditando(video._id);
    setMensajeEdicion("");
    setForm({
      titulo: video.titulo || "",
      cargo: video.cargo || "",
      categoria: video.categoria || "Otro",
      edad: video.edad || "",
      skills: Array.isArray(video.skills) ? video.skills.join(", ") : "",
    });
  }

  function cambiarForm(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function guardarEdicion(evento) {
    evento.preventDefault();
    setGuardando(true);
    setMensajeEdicion("");

    try {
      const actualizado = await apiFetch(`/api/videos/${editando}`, {
        method: "PATCH",
        token: sesion.token,
        body: form,
      });
      setVideos((anteriores) =>
        anteriores.map((video) =>
          video._id === actualizado._id ? actualizado : video,
        ),
      );
      setEditando("");
      setMensajeEdicion("Datos actualizados correctamente.");
    } catch (fallo) {
      setMensajeEdicion(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista" data-vista-content="perfil">
      <section id="perfil" className="seccion">
        <div className="perfil-cabecera">
          <div>
            <span className="badge badge-lila">
              {esEmpresa ? "Perfil de empresa" : "Mi perfil"}
            </span>
            <h2>Hola, {nombre}</h2>
            <p>
              {esEmpresa
                ? "Aquí puedes revisar los datos de tu empresa y publicar vacantes."
                : "Aquí puedes revisar tus datos y los videos que has subido."}
            </p>
          </div>
          {esEmpresa ? (
            <button
              className="btn btn-coral"
              type="button"
              onClick={() => onNavegar("mensajes")}
            >
              <i className="fa-solid fa-briefcase" aria-hidden="true" />{" "}
              Publicar vacante
            </button>
          ) : (
            <button
              className="btn btn-coral"
              type="button"
              onClick={() => onNavegar("procesos")}
            >
              <i className="fa-solid fa-video" aria-hidden="true" /> Subir video
            </button>
          )}
        </div>

        {!esEmpresa && (
          <div className="perfil-metricas">
            <article className="card perfil-metrica">
              <strong>{videos.length}</strong>
              <span>Videos subidos</span>
            </article>
            <article className="card perfil-metrica">
              <strong>{formatearDuracion(totalSegundos)}</strong>
              <span>Duración total</span>
            </article>
            <article className="card perfil-metrica">
              <strong>{formatearFecha(ultimaSubida)}</strong>
              <span>Última subida</span>
            </article>
          </div>
        )}

        {esEmpresa && (
          <article className="card perfil-empresa">
            <h3>Publica una vacante</h3>
            <p>
              Crea la búsqueda, revisa los videocurrículums de los postulantes y
              actualiza el estado de cada candidato.
            </p>
            <button
              className="btn btn-morado"
              type="button"
              onClick={() => onNavegar("mensajes")}
            >
              <i className="fa-solid fa-briefcase" aria-hidden="true" />{" "}
              Publicar vacante
            </button>
          </article>
        )}

        <div className="perfil-columnas">
          <article className="card perfil-datos">
            <h3>Mis datos</h3>
            <p>
              <span>Nombre</span>
              <strong>{sesion.usuario.nombre || "Sin nombre"}</strong>
            </p>
            <p>
              <span>Correo</span>
              <strong>{sesion.usuario.email}</strong>
            </p>
            <p>
              <span>Perfil</span>
              <strong>{rol}</strong>
            </p>
          </article>

          <article className="card perfil-datos">
            <h3>Estado</h3>
            <p>
              <span>Cuenta</span>
              <strong>Activa</strong>
            </p>
            {esEmpresa ? (
              <>
                <p>
                  <span>Perfil</span>
                  <strong>Empresa</strong>
                </p>
                <p>
                  <span>Publicaciones</span>
                  <strong>Gestión de vacantes</strong>
                </p>
              </>
            ) : (
              <>
                <p>
                  <span>Videos publicados</span>
                  <strong>{videos.length}</strong>
                </p>
                <p>
                  <span>Última actualización</span>
                  <strong>{formatearFecha(ultimaSubida)}</strong>
                </p>
              </>
            )}
          </article>
        </div>

        {!esEmpresa && (
          <div className="perfil-videos">
            <div className="perfil-videos-cabecera">
            <div>
              <h3>Mis videos</h3>
              <p>Los videos que subiste desde Estudio de Grabación.</p>
            </div>
            <button
              className="btn btn-blanco btn-sm"
              type="button"
              onClick={() => onNavegar("procesos")}
            >
              Gestionar videos
            </button>
          </div>

          {cargando && <p>Cargando tus videos...</p>}
          {error && (
            <p className="login-msg error" role="alert">
              {error}
            </p>
          )}
          {mensajeEdicion && (
            <p className="login-msg" role="status">
              {mensajeEdicion}
            </p>
          )}

          {!cargando && !error && videos.length === 0 && (
            <article className="card perfil-vacio">
              <i className="fa-solid fa-video" aria-hidden="true" />
              <h3>Aún no has subido ningún video</h3>
              <p>Graba tu pitch de 60 segundos y súbelo desde Estudio de Grabación.</p>
              <button
                className="btn btn-morado"
                type="button"
                onClick={() => onNavegar("procesos")}
              >
                Subir mi primer video
              </button>
            </article>
          )}

          {videos.map((video) => (
            <article className="card perfil-video" key={video._id}>
              <video src={video.url} controls playsInline preload="metadata" />
              <div>
                {editando === video._id ? (
                  <form
                    className="asistente-form perfil-editor"
                    onSubmit={guardarEdicion}
                  >
                    <label htmlFor={`titulo-${video._id}`}>Título</label>
                    <input
                      id={`titulo-${video._id}`}
                      value={form.titulo}
                      onChange={(evento) =>
                        cambiarForm("titulo", evento.target.value)
                      }
                      maxLength={80}
                      disabled={guardando}
                    />

                    <label htmlFor={`cargo-${video._id}`}>Cargo</label>
                    <input
                      id={`cargo-${video._id}`}
                      value={form.cargo}
                      onChange={(evento) =>
                        cambiarForm("cargo", evento.target.value)
                      }
                      maxLength={80}
                      disabled={guardando}
                    />

                    <label htmlFor={`edad-${video._id}`}>Edad</label>
                    <input
                      id={`edad-${video._id}`}
                      type="number"
                      min="18"
                      max="100"
                      value={form.edad}
                      onChange={(evento) =>
                        cambiarForm("edad", evento.target.value)
                      }
                      placeholder="Ej.: 25"
                      disabled={guardando}
                    />

                    <label htmlFor={`skills-${video._id}`}>
                      Habilidades (separadas por coma)
                    </label>
                    <input
                      id={`skills-${video._id}`}
                      value={form.skills}
                      onChange={(evento) =>
                        cambiarForm("skills", evento.target.value)
                      }
                      placeholder="Ej.: Figma, ventas, liderazgo"
                      maxLength={200}
                      disabled={guardando}
                    />

                    <label htmlFor={`categoria-${video._id}`}>Categoría</label>
                    <select
                      id={`categoria-${video._id}`}
                      value={form.categoria}
                      onChange={(evento) =>
                        cambiarForm("categoria", evento.target.value)
                      }
                      disabled={guardando}
                    >
                      {CATEGORIAS.map((nombre) => (
                        <option key={nombre} value={nombre}>
                          {nombre}
                        </option>
                      ))}
                    </select>

                    <div className="perfil-editor-acciones">
                      <button
                        className="btn btn-morado btn-sm"
                        type="submit"
                        disabled={guardando}
                      >
                        {guardando ? "Guardando..." : "Guardar datos"}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => setEditando("")}
                        disabled={guardando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{video.titulo}</h3>
                    <p>
                      {video.cargo || "Sin cargo"}
                      {video.edad ? ` · ${video.edad} años` : ""}
                      {video.categoria ? ` · ${video.categoria}` : ""}
                    </p>
                    {Array.isArray(video.skills) && video.skills.length > 0 && (
                      <div className="skills">
                        {video.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    )}
                    <p className="perfil-video-detalle">
                      {Number(video.duracion || 0).toFixed(1)} s
                      {video.recortado ? " · recortado a 60 s" : ""}
                      {" · "}
                      {formatearFecha(video.creado)}
                    </p>
                    <div className="perfil-video-acciones">
                      <button
                        className="btn btn-blanco btn-sm"
                        type="button"
                        onClick={() => abrirEditor(video)}
                      >
                        Editar datos
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => onNavegar("procesos")}
                      >
                        Volver a gestión de videos
                      </button>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
          </div>
        )}

        <div className="perfil-acciones">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onNavegar("feed")}
          >
            Ver feed de candidatos
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onNavegar("inicio")}
          >
            Volver al inicio
          </button>
        </div>
      </section>
    </div>
  );
}
