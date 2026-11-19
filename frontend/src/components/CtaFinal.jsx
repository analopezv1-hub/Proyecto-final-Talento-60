// Llamada final a la acción.
export default function CtaFinal({ onNavegar, esEmpresa = false }) {
  return (
    <section className="cta">
      <div>
        <h2>
          {esEmpresa
            ? "Encuentra talento en 60 segundos."
            : "Tu carrera profesional comienza con 60 segundos."}
        </h2>
        <p>
          {esEmpresa
            ? "Publica tu vacante y revisa candidatos reales."
            : "Crea tu cuenta gratis, graba tu video y conecta hoy."}
        </p>
      </div>
      <button
        className="btn btn-blanco"
        type="button"
        onClick={() => onNavegar(esEmpresa ? "mensajes" : "procesos")}
      >
        {esEmpresa ? "Publicar vacante" : "Crear mi Videocurrículum"}{" "}
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </section>
  );
}
