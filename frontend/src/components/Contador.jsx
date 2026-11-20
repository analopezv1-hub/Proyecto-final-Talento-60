// Contador animado para las métricas.
import { useEffect, useRef, useState } from "react";

// Anima un número cuando aparece en pantalla.
export default function Contador({ valor }) {
  const referencia = useRef(null);
  const [texto, setTexto] = useState(valor);

  useEffect(() => {
    const partes = valor.match(/^(\D*)([\d,.]+)(\D*)$/);
    if (!partes) return;

    const [, prefijo, numero, sufijo] = partes;
    const final = Number(numero.replace(/,/g, ""));
    const elemento = referencia.current;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();

        const inicio = performance.now();
        const animar = (ahora) => {
          const progreso = Math.min((ahora - inicio) / 1500, 1);
          const suave = 1 - Math.pow(1 - progreso, 3);
          const actual = Math.round(final * suave).toLocaleString("en-US");
          setTexto(prefijo + actual + sufijo);
          if (progreso < 1) requestAnimationFrame(animar);
        };

        requestAnimationFrame(animar);
      },
      { threshold: 0.6 },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, [valor]);

  return <strong ref={referencia}>{texto}</strong>;
}
