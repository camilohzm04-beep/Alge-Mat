const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;
const FRONTEND_ORIGIN = "http://127.0.0.1:5501";
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

loadEnvFile(path.join(ROOT_DIR, ".env"));

const MIME_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
    try {
        const requestUrl = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);

        if (requestUrl.pathname === "/api/tutor" && req.method === "OPTIONS") {
            sendTutorCors(res, 204);
            return;
        }

        if (req.method === "POST" && requestUrl.pathname === "/api/tutor") {
            await handleTutorRequest(req, res);
            return;
        }

        if (req.method === "GET") {
            serveStaticFile(requestUrl.pathname, res);
            return;
        }

        sendJson(res, 405, { ok: false, reply: "" });
    } catch (error) {
        sendJson(res, 500, { ok: false, reply: "" });
    }
});

server.listen(PORT, HOST, () => {
    console.log(`AlgeMat disponible en http://${HOST}:${PORT}`);
});

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex < 0) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

async function handleTutorRequest(req, res) {
    const body = await readJsonBody(req);
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
        sendJson(res, 400, { ok: false, reply: "" }, buildTutorCorsHeaders());
        return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
        sendJson(res, 200, { ok: false, reply: "" }, buildTutorCorsHeaders());
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
            sendJson(res, 200, { ok: false, reply: "" }, buildTutorCorsHeaders());
            return;
        }

        const data = await geminiResponse.json();
        const reply = extractGeminiReply(data);

        if (!reply) {
            sendJson(res, 200, { ok: false, reply: "" }, buildTutorCorsHeaders());
            return;
        }

        sendJson(res, 200, { ok: true, reply }, buildTutorCorsHeaders());
    } catch (error) {
        sendJson(res, 200, { ok: false, reply: "" }, buildTutorCorsHeaders());
    }
}

function extractGeminiReply(data) {
    const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && Array.isArray(data.candidates[0].content.parts)
        ? data.candidates[0].content.parts
        : [];

    const text = parts
        .map((part) => (part && typeof part.text === "string" ? part.text : ""))
        .join("")
        .trim();

    return text;
}

function serveStaticFile(requestPath, res) {
    const safePath = resolveFilePath(requestPath);

    if (!safePath) {
        sendNotFound(res);
        return;
    }

    fs.readFile(safePath, (error, content) => {
        if (error) {
            sendNotFound(res);
            return;
        }

        const extension = path.extname(safePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME_TYPES[extension] || "application/octet-stream" });
        res.end(content);
    });
}

function resolveFilePath(requestPath) {
    const relativePath = requestPath === "/" ? "/index.html" : requestPath;
    const decodedPath = decodeURIComponent(relativePath);

    if (decodedPath === "/.env") {
        return null;
    }

    const normalizedPath = path.normalize(decodedPath)
        .replace(/^(\.\.[\/\\])+/, "")
        .replace(/^[/\\]+/, "");
    const absolutePath = path.join(ROOT_DIR, normalizedPath);

    if (!absolutePath.startsWith(ROOT_DIR)) {
        return null;
    }

    return absolutePath;
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        ...extraHeaders
    });
    res.end(body);
}

function buildTutorCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };
}

function sendTutorCors(res, statusCode) {
    res.writeHead(statusCode, buildTutorCorsHeaders());
    res.end();
}

function sendNotFound(res) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 1024 * 1024) {
                req.destroy();
                reject(new Error("Body too large"));
            }
        });

        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);
    });
}
