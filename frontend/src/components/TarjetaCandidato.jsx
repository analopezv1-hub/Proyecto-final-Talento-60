// Componente reutilizable: recibe los datos del candidato por props.
export default function TarjetaCandidato({
  nombre,
  edad,
  cargo,
  categoria,
  skills,
  duracion,
  match,
  imagen,
  videoUrl,
  esVideoSubido,
  onVerVideo,
}) {
  const abrirVideo = () => {
    if (videoUrl) onVerVideo?.({ nombre, videoUrl });
  };

  return (
    // La tarjeta se divide en imagen, datos y habilidades.
    <article className="card tarjeta" data-categoria={categoria}>
      <div className="tarjeta-media">
        {/* Imagen, duración, coincidencia y botón de reproducción. */}
        {imagen ? (
          <img src={imagen} alt={`Video de ${nombre}`} loading="lazy" />
        ) : (
          <div className="tarjeta-sin-imagen" aria-hidden="true">
            <i className="fa-solid fa-video" />
          </div>
        )}
        <span className="badge badge-tiempo">{duracion}</span>
        {match != null ? (
          <span className="badge badge-match">Match {match}%</span>
        ) : (
          esVideoSubido && <span className="badge badge-nuevo">Nuevo</span>
        )}
        <button
          className="btn-play"
          type="button"
          onClick={abrirVideo}
          aria-label={`Reproducir video de ${nombre}`}
        >
          <i className="fa-solid fa-play" aria-hidden="true" />
        </button>
      </div>

      <div className="tarjeta-info">
        {/* Datos del candidato y habilidades. */}
        <h3>
          {nombre} {edad ? <span>{edad} años</span> : null}
        </h3>
        <p className="cargo">{cargo}</p>
        <div className="skills">
          {/* Cada skill se muestra como una etiqueta. */}
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <button
          className="btn btn-morado btn-sm btn-block"
          type="button"
          onClick={abrirVideo}
        >
          <i
            className={videoUrl ? "fa-solid fa-play" : "fa-regular fa-user"}
            aria-hidden="true"
          />{" "}
          {videoUrl ? "Ver video" : "Ver Perfil"}
        </button>
      </div>
    </article>
  );
}
