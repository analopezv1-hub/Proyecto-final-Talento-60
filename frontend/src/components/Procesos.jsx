// Vista del proceso y del Asistente creativo.
import AsistenteCreativo from "./AsistenteCreativo.jsx";
import SubirVideo from "./SubirVideo.jsx";

export default function Procesos({ sesion, onLogin, onPerfil, onNavegar }) {
  // La empresa no necesita grabar ni subir un videocurrículum.
  if (sesion?.usuario?.rol === "empresa") {
    return (
      <div className="vista" data-vista-content="procesos">
        <section id="procesos" className="seccion">
          <div className="seccion-cabecera centro">
            <div>
              <span className="badge badge-coral">Para empresas</span>
              <h2>Encuentra talento en 60 segundos</h2>
              <p>
                Revisa candidatos reales, escucha cómo se comunican y publica tu
                vacante.
              </p>
            </div>
          </div>

          <div className="pasos">
            <article className="card paso">
              <span className="paso-numero">PASO 01</span>
              <h3>
                <i className="fa-solid fa-users" aria-hidden="true" /> Explora
                candidatos
              </h3>
              <p>
                Mira los videocurrículums publicados y filtra por categoría.
              </p>
            </article>

            <article className="card paso">
              <span className="paso-numero">PASO 02</span>
              <h3>
                <i className="fa-solid fa-circle-play" aria-hidden="true" />{" "}
                Evalúa por video
              </h3>
              <p>
                Conoce la comunicación y la actitud antes de la entrevista.
              </p>
            </article>

            <article className="card paso">
              <span className="paso-numero">PASO 03</span>
              <h3>
                <i className="fa-solid fa-briefcase" aria-hidden="true" />{" "}
                Publica tu vacante
              </h3>
              <p>
                Cuéntanos qué perfil buscas y te ayudamos a conectar con el
                talento.
              </p>
            </article>
          </div>

          <div className="centro">
            <div className="perfil-acciones">
              <button
                className="btn btn-morado"
                type="button"
                onClick={() => onNavegar("feed")}
              >
                <i className="fa-solid fa-users" aria-hidden="true" /> Ver
                candidatos
              </button>
              <button
                className="btn btn-coral"
                type="button"
                onClick={() => onNavegar("mensajes")}
              >
                <i className="fa-solid fa-briefcase" aria-hidden="true" />{" "}
                Publicar vacante
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="vista" data-vista-content="procesos">
      <section id="procesos" className="seccion">
        <div className="seccion-cabecera centro">
          <div>
            <span className="badge badge-coral">Proceso para candidatos</span>
            <h2>¿Cómo funciona en 60 segundos?</h2>
            <p>Sin cartas eternas. Tu talento, tu voz y tus proyectos.</p>
          </div>
        </div>

        <div className="pasos">
          <article className="card paso">
            <span className="paso-numero">PASO 01</span>
            <h3>
              <i className="fa-solid fa-video" aria-hidden="true" /> Graba tu
              pitch
            </h3>
            <p>Cuéntanos quién eres, qué has logrado y qué buscas.</p>
            <ul className="lista-check">
              <li>¿Quién eres y qué aportas?</li>
              <li>¿Tus proyectos más relevantes?</li>
              <li>¿Qué buscas en tu próximo rol?</li>
            </ul>
          </article>

          <article className="card paso">
            <span className="paso-numero">PASO 02</span>
            <h3>
              <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" />{" "}
              Súbelo aquí
            </h3>
            <p>Sube tu video y guárdalo en tu perfil.</p>
            <ul className="lista-check">
              <li>Máximo 60 segundos.</li>
              <li>Máximo 50 MB.</li>
              <li>MP4, WebM o MOV.</li>
            </ul>
          </article>

          <article className="card paso">
            <span className="paso-numero">PASO 03</span>
            <h3>
              <i className="fa-solid fa-bolt" aria-hidden="true" /> Conecta
              rápido
            </h3>
            <p>Las empresas ven tu perfil y te contactan en horas.</p>
            <div className="alerta">
              <i className="fa-solid fa-bell" aria-hidden="true" /> Una empresa
              solicitó entrevista
            </div>
          </article>
        </div>

        <SubirVideo
          sesion={sesion}
          onLogin={onLogin}
          onPerfil={onPerfil}
        />

        <AsistenteCreativo />
      </section>
    </div>
  );
}
