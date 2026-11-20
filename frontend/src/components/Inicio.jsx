// Vista de inicio: hero, métricas y propuesta para empresas.
import fotoHero from '../../Imagenes/talento60at.jpg';
import Contador from "./Contador.jsx";

const METRICAS = [
  {
    icono: "fa-solid fa-users",
    color: "morado",
    valor: "4",
    texto: "Candidatos con video activo",
  },
  {
    icono: "fa-regular fa-clock",
    color: "coral",
    valor: "60s",
    texto: "Duración máxima permitida",
  },
  {
    icono: "fa-solid fa-chart-line",
    color: "verde",
    valor: "85%",
    texto: "Reducción de tiempo de contratación",
  },
];

const LOGOS = [
  { icono: "fa-solid fa-cube", nombre: "TechLab" },
  { icono: "fa-solid fa-bolt", nombre: "Nova" },
  { icono: "fa-solid fa-layer-group", nombre: "Andina" },
  { icono: "fa-solid fa-code", nombre: "Pixel" },
  { icono: "fa-solid fa-rocket", nombre: "Futuro" },
];

export default function Inicio({ onNavegar }) {
  return (
    <div className="vista" data-vista-content="inicio">
      <section id="inicio" className="hero">
        <div className="hero-texto">
          <span className="badge badge-lila">
            ✨ Plataforma de Selección por Video
          </span>
          <h1>
            Tu talento habla <span>más</span> que un currículum en papel.
          </h1>
          <p>
            Un video de solo 60 segundos revela la actitud, la comunicación y la
            pasión que jamás se leen en un PDF. Encuentra el talento que tu
            equipo necesita.
          </p>

          <div className="hero-botones">
            <button
              className="btn btn-coral"
              type="button"
              onClick={() => onNavegar("procesos")}
            >
              <i className="fa-solid fa-video" aria-hidden="true" /> Publicar tu
              Videocurrículum
            </button>
            <button
              className="btn btn-blanco"
              type="button"
              onClick={() => onNavegar("feed")}
            >
              Explorar Candidatos{" "}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>

          <div className="confianza">
            <div className="avatares">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt=""
              />
            </div>
            <p>
              <strong>6+ empresas</strong> confían en Talento 60
            </p>
          </div>
        </div>

        <div className="hero-video">
          <div className="video-card">
            <img
              src={fotoHero}
              alt="Vista previa del videocurrículum de Sofía Serna"
            />
            <span className="badge badge-tiempo">0:60</span>
            <button
        
            >
              <i className="fa-solid fa-play" aria-hidden="true" />
            </button>
            
            <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
            
          </div>
        </div>
      </section>

      <section className="metricas" aria-label="Métricas de Talento 60">
        {METRICAS.map(({ icono, color, valor, texto }) => (
          <article className="card metrica" key={texto}>
            <span className={`metrica-icono ${color}`}>
              <i className={icono} aria-hidden="true" />
            </span>
            <div>
              <Contador valor={valor} />
              <span>{texto}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="empresas">
        <div className="empresas-contenido">
          <div>
            <span className="badge badge-coral">
              Para equipos de reclutamiento
            </span>
            <h2>Deja de leer 300 PDFs. Conoce a tus candidatos en 1 minuto.</h2>
            <p>
              La comunicación y la presencia se ven mejor en video. Filtra más
              rápido sin perder calidad.
            </p>

            <div className="metricas-empresa">
              <div>
                <strong>4x</strong>
                <span>Más rápido al evaluar</span>
              </div>
              <div>
                <strong>0%</strong>
                <span>Sesgos por formato</span>
              </div>
            </div>

            <div className="empresas-botones">
              <button className="btn btn-morado" type="button">
                Publicar vacante gratis
              </button>
              <button className="btn btn-ghost" type="button">
        
              </button>
            </div>
          </div>

          <div className="testimonio">
            <span className="comillas">“</span>
            <p>
              Sin duda el cambio a videocurrículums nos redujo el tiempo de
              contratación a la mitad. La calidad de los candidatos es
              increíble.
            </p>
            <div className="autor">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
                alt="Carolina Osorio"
                loading="lazy"
              />
              <div>
                <strong>Carolina Osorio</strong>
                <span>Head of Talent @ TechLab</span>
              </div>
            </div>
          </div>
        </div>

        <div className="logos" aria-label="Empresas de ejemplo">
          {LOGOS.map(({ icono, nombre }) => (
            <span key={nombre}>
              <i className={icono} aria-hidden="true" /> {nombre}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
