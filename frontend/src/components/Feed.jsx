// Vista de candidatos: carga el feed y filtra por categoría.
import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";
import { CANDIDATOS } from "../data/candidatos.js";
import TarjetaCandidato from "./TarjetaCandidato.jsx";

// Categorías que se muestran en los botones de filtro.
const CATEGORIAS = ["Todos", "Diseño UX", "Desarrollo", "Marketing", "Producto"];

// Descripciones de los perfiles demo, escritas según su profesión.
const DESCRIPCIONES_DEMO = new Map(
  CANDIDATOS.map((candidato) => [String(candidato.id), candidato.descripcion]),
);

// Para videos reales, la descripción se arma con el cargo y las habilidades.
function descripcionDe(candidato) {
  if (candidato.descripcion) return candidato.descripcion;
  const skills = Array.isArray(candidato.skills) ? candidato.skills : [];
  const habilidades = skills.length
    ? ` Sus habilidades principales son ${skills.join(", ")}.`
    : "";
  return `${candidato.nombre} se presenta para el rol de ${candidato.cargo || "candidato"}.${habilidades} Un videocurrículum breve para conocer su forma de comunicarse.`;
}

export default function Feed() {
  // categoria es el filtro activo; candidatos guarda los datos del feed.
  const [categoria, setCategoria] = useState("Todos");
  const [candidatos, setCandidatos] = useState(CANDIDATOS);
  // Video que se abre en el modal, si la tarjeta tiene uno real.
  const [videoActivo, setVideoActivo] = useState(null);
  // Perfil que se abre desde la tarjeta.
  const [perfilActivo, setPerfilActivo] = useState(null);

  // Cierra los modales con Escape.
  useEffect(() => {
    const alPresionar = (evento) => {
      if (evento.key === "Escape") {
        setVideoActivo(null);
        setPerfilActivo(null);
      }
    };
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, []);

  // Intenta cargar el feed desde MongoDB; si falla, deja los datos demo.
  useEffect(() => {
    let activo = true;

    apiFetch("/api/candidatos")
      .then((datos) => {
        if (activo && Array.isArray(datos) && datos.length > 0) {
          setCandidatos(
            datos.map((candidato) => ({
              ...candidato,
              descripcion:
                candidato.descripcion ||
                DESCRIPCIONES_DEMO.get(String(candidato.id)) ||
                descripcionDe(candidato),
            })),
          );
        }
      })
      .catch(() => {});

    return () => {
      activo = false;
    };
  }, []);

  // Filtra en memoria; no vuelve a pedir datos al backend.
  const visibles =
    categoria === "Todos"
      ? candidatos
      : candidatos.filter((candidato) => candidato.categoria === categoria);

  return (
    <div className="vista" data-vista-content="feed">
      <section id="feed" className="seccion">
        <div className="seccion-cabecera">
          <div>
            <span className="badge badge-lila">Candidatos</span>
            <h2>Videocurrículums destacados</h2>
            <p>Perfiles reales que se muestran como son, no como un PDF.</p>
          </div>

          <div className="filtros" aria-label="Filtrar candidatos">
            {CATEGORIAS.map((nombre) => (
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
        </div>

        <div className="tarjetas">
          {/* Cada candidato se convierte en una tarjeta reutilizable. */}
          {visibles.map((candidato) => (
            <TarjetaCandidato
              key={candidato.id}
              {...candidato}
              onVerVideo={setVideoActivo}
              onVerPerfil={setPerfilActivo}
            />
          ))}
        </div>

        {perfilActivo && (
          <div
            className="modal-video modal-perfil"
            role="dialog"
            aria-modal="true"
            aria-label={`Perfil de ${perfilActivo.nombre}`}
            onClick={() => setPerfilActivo(null)}
          >
            <div
              className="modal-perfil-contenido"
              onClick={(evento) => evento.stopPropagation()}
            >
              <button
                className="modal-cerrar"
                type="button"
                onClick={() => setPerfilActivo(null)}
                aria-label="Cerrar perfil"
              >
                ×
              </button>

              <div className="modal-perfil-grid">
                {perfilActivo.imagen ? (
                  <img
                    src={perfilActivo.imagen}
                    alt={`Perfil de ${perfilActivo.nombre}`}
                  />
                ) : (
                  <div className="modal-perfil-sin-imagen" aria-hidden="true">
                    <i className="fa-regular fa-user" />
                  </div>
                )}

                <div className="modal-perfil-info">
                  <span className="badge badge-lila">
                    {perfilActivo.categoria || "Candidato"}
                  </span>
                  <h3>
                    {perfilActivo.nombre}{" "}
                    {perfilActivo.edad ? (
                      <span>{perfilActivo.edad} años</span>
                    ) : null}
                  </h3>
                  <p className="cargo">{perfilActivo.cargo}</p>
                  <p className="modal-perfil-descripcion">
                    {perfilActivo.descripcion ||
                      descripcionDe(perfilActivo)}
                  </p>

                  {Array.isArray(perfilActivo.skills) &&
                    perfilActivo.skills.length > 0 && (
                      <div className="skills">
                        {perfilActivo.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    )}

                  <p className="perfil-video-detalle">
                    {perfilActivo.duracion || "0:60"}
                    {perfilActivo.match != null
                      ? ` · Match ${perfilActivo.match}%`
                      : perfilActivo.esVideoSubido
                        ? " · Video subido"
                        : ""}
                  </p>

                  {perfilActivo.videoUrl && (
                    <button
                      className="btn btn-morado btn-sm"
                      type="button"
                      onClick={() => {
                        setVideoActivo({
                          nombre: perfilActivo.nombre,
                          videoUrl: perfilActivo.videoUrl,
                        });
                        setPerfilActivo(null);
                      }}
                    >
                      <i className="fa-solid fa-play" aria-hidden="true" /> Ver
                      video
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {videoActivo && (
          <div
            className="modal-video"
            role="dialog"
            aria-modal="true"
            aria-label={`Video de ${videoActivo.nombre}`}
            onClick={() => setVideoActivo(null)}
          >
            <div
              className="modal-video-contenido"
              onClick={(evento) => evento.stopPropagation()}
            >
              <button
                className="modal-cerrar"
                type="button"
                onClick={() => setVideoActivo(null)}
                aria-label="Cerrar video"
              >
                ×
              </button>
              <video src={videoActivo.videoUrl} controls autoPlay playsInline />
              <p>{videoActivo.nombre}</p>
            </div>
          </div>
        )}

        <div className="centro">
          <button className="btn btn-blanco" type="button">
            Ver más candidatos{" "}
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
