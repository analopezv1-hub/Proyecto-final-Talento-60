// Vista de vacantes: lista para candidatos y panel de gestión para empresas.
import Contacto from "./Contacto.jsx";
import PanelVacantes from "./PanelVacantes.jsx";
import Vacantes from "./Vacantes.jsx";

export default function Mensajes({ sesion, onLogin, onNavegar }) {
  const esEmpresa = sesion?.usuario?.rol === "empresa";

  return (
    <div className="vista" data-vista-content="mensajes">
      {esEmpresa ? (
        <PanelVacantes sesion={sesion} onNavegar={onNavegar} />
      ) : (
        <>
          <Vacantes sesion={sesion} onLogin={onLogin} />
          <Contacto />
        </>
      )}
    </div>
  );
}
