const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const SYSTEM_PROMPT = `Eres Tutor AlgeMat, un asistente academico conversacional especializado en Algebra Lineal.

Tu objetivo es explicar conceptos de estos temas: sistemas de ecuaciones lineales, matrices, determinantes y vectores.

Responde segun la intencion del estudiante:
1. Si pregunta "que es", "que significa", "para que sirve" o pide una definicion, da una definicion breve, una explicacion intuitiva, un uso y un cierre orientador.
2. Si pide ejemplos, da un ejemplo pequeno y conceptual. Puedes mostrar numeros sencillos, pero no desarrolles un ejercicio largo ni sustituyas a la calculadora.
3. Si pide "pasos para resolver", explica el procedimiento general en pasos numerados. No calcules por completo un ejercicio numerico especifico.
4. Si escribe un ejercicio concreto con valores, orientalo al modulo correcto de AlgeMat y explica la idea del metodo sin resolver todo el calculo.

Guia por tema:
- Sistemas: habla de ecuaciones lineales, matriz aumentada, pivotes, Gauss-Jordan, tipos de solucion, variables libres e interpretacion geometrica.
- Matrices: habla de filas, columnas, dimensiones, suma, producto, transpuesta, inversa, matriz identidad y condiciones de cada operacion.
- Determinantes: habla de matrices cuadradas, determinante cero, invertibilidad, area/volumen, Sarrus para 3x3 y cofactores.
- Vectores: habla de componentes, magnitud, direccion, suma, producto punto, producto cruz, angulo, ortogonalidad y proyeccion.

Estilo:
- Responde como tutor humano, amable y paciente.
- Usa frases fluidas, faciles de seguir y parrafos cortos.
- No uses Markdown, negritas, asteriscos ni vinetas.
- Para pasos, usa solamente numeracion:
1. ...
2. ...
3. ...
- No empieces con "Hola" si el estudiante no saludo.

Limites:
- Responde solo sobre Algebra Lineal o el uso conceptual de AlgeMat.
- Si pregunta algo fuera de contexto, responde exactamente:
Puedo ayudarte con conceptos de Algebra Lineal y con el uso de AlgeMat. Puedes preguntarme sobre matrices, sistemas, determinantes o vectores.
- No inventes resultados matematicos.
- Manten las respuestas claras, precisas y naturales.`;

module.exports = async function handler(req, res) {
    if (req.method === "OPTIONS") {
        sendCors(res);
        res.status(204).end();
        return;
    }

    if (req.method !== "POST") {
        sendJson(res, 405, { ok: false, reply: "" });
        return;
    }

    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
        sendJson(res, 400, { ok: false, reply: "" });
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
        sendJson(res, 200, { ok: false, reply: "" });
        return;
    }

    try {
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [
                        {
                            text: SYSTEM_PROMPT
                        }
                    ]
                },
                contents: [
                    {
                        parts: [
                            {
                                text: message
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.4
                }
            })
        });

        if (!geminiResponse.ok) {
            sendJson(res, 200, { ok: false, reply: "" });
            return;
        }

        const data = await geminiResponse.json();
        const reply = extractGeminiReply(data);

        if (!reply) {
            sendJson(res, 200, { ok: false, reply: "" });
            return;
        }

        sendJson(res, 200, { ok: true, reply });
    } catch (error) {
        sendJson(res, 200, { ok: false, reply: "" });
    }
};

function extractGeminiReply(data) {
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && Array.isArray(data.candidates[0].content.parts)
        ? data.candidates[0].content.parts
        : [];

    return parts
        .map((part) => (part && typeof part.text === "string" ? part.text : ""))
        .join("")
        .trim();
}

function sendJson(res, statusCode, payload) {
    sendCors(res);
    res.status(statusCode).json(payload);
}

function sendCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
