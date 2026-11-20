// Vista de candidatos: carga el feed y filtra por categoría.
import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";
import { CANDIDATOS } from "../data/candidatos.js";
import TarjetaCandidato from "./TarjetaCandidato.jsx";

// Categorías que se muestran en los botones de filtro.
const CATEGORIAS = ["Todos", "Diseño UX", "Desarrollo", "Marketing", "Producto"];

export default function Feed() {
  // categoria es el filtro activo; candidatos guarda los datos del feed.
  const [categoria, setCategoria] = useState("Todos");
  const [candidatos, setCandidatos] = useState(CANDIDATOS);
  // Video que se abre en el modal, si la tarjeta tiene uno real.
  const [videoActivo, setVideoActivo] = useState(null);

  // Cierra el modal con Escape.
  useEffect(() => {
    const alPresionar = (evento) => {
      if (evento.key === "Escape") setVideoActivo(null);
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
          setCandidatos(datos);
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
            />
          ))}
        </div>

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
