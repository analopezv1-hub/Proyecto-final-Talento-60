// Asistente creativo: IA opcional con respaldo de plantillas.
const PROMPT_SISTEMA =
  "Eres el Asistente creativo de Talento 60. Ayudas a una persona a preparar un videocurrículum de 60 segundos. Responde en español, con ideas concretas y sin inventar experiencia que no te hayan dado.";

// Devuelve un texto limpio o un valor por defecto.
function limpiar(valor, defecto) {
  return String(valor || "").trim() || defecto;
}

// Sugerencias base para cuando no hay clave de IA o falla el servicio.
function respaldo({ rol, detalles }) {
  const profesion = limpiar(rol, "profesional");
  const experiencia = limpiar(detalles, "mis habilidades y experiencia");

  return {
    gancho: `¿Y si tu próximo talento se viera en 60 segundos? Soy ${profesion} y quiero mostrarte lo que sé hacer.`,
    guion: [
      `Hola, soy ${profesion}.`,
      `Me enfoco en ${experiencia}.`,
      "En mi experiencia he aprendido a comunicar, resolver y trabajar en equipo.",
      "Busco un lugar donde pueda aportar desde el primer día.",
    ],
    cierre:
      "Si buscas talento con ganas de aportar, hablemos. Mi video dura 60 segundos; mi impacto puede durar mucho más.",
    titulos: [
      `${profesion} con enfoque en resultados`,
      `Talento 60: ${profesion}`,
    ],
    mensajes: [
      `Hola, soy ${profesion}. Vi su vacante y creo que mi experiencia puede aportar al equipo. ¿Podemos hablar?`,
      `Hola, me interesa formar parte de su equipo. Soy ${profesion} y me encantaría mostrarles mi videocurrículum.`,
    ],
    mejoras: [
      "Empieza con una pregunta o un logro concreto.",
      "Muestra una habilidad con un ejemplo real.",
      "Cierra con una llamada a la acción clara.",
    ],
  };
}

// Genera el guión y las ideas con IA o con el respaldo local.
async function generarSugerencias(datos) {
  const base = respaldo(datos);

  if (!process.env.AI_API_KEY) {
    return { ...base, fuente: "plantillas" };
  }

  const url =
    process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
  const modelo = process.env.AI_MODEL || "gpt-4o-mini";
  // El prompt pide un JSON para poder mostrarlo por secciones en React.
  const mensaje = `Rol: ${limpiar(datos.rol, "no indicado")}
Habilidades, logros y objetivo: ${limpiar(datos.detalles, "no indicados")}

Devuelve SOLO un JSON válido con estas claves:
{
  "gancho": "frase inicial",
  "guion": ["línea 1", "línea 2", "línea 3", "línea 4"],
  "cierre": "frase final",
  "titulos": ["título 1", "título 2"],
  "mensajes": ["mensaje 1", "mensaje 2"],
  "mejoras": ["mejora 1", "mejora 2"]
}`;

  try {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          { role: "system", content: PROMPT_SISTEMA },
          { role: "user", content: mensaje },
        ],
        temperature: 0.8,
      }),
    });

    if (!respuesta.ok) throw new Error(`La IA respondió ${respuesta.status}`);

    const cuerpo = await respuesta.json();
    const contenido = cuerpo.choices?.[0]?.message?.content;
    if (!contenido) throw new Error("La IA no devolvió contenido");

    const limpio = contenido.replace(/```(?:json)?/gi, "").trim();
    return { ...base, ...JSON.parse(limpio), fuente: "ia" };
  } catch (error) {
    console.error("Asistente creativo:", error.message);
    return { ...base, fuente: "plantillas" };
  }
}

module.exports = { generarSugerencias };
