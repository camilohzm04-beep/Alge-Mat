/**
 * AlgeMat - Asistente virtual interactivo
 *
 * Refactorizacion progresiva:
 * - Fase 1: conserva el contenido conceptual y los accesos rapidos, y mantiene
 *   la compatibilidad con la interfaz actual agregando entrada libre.
 * - Fase 2: separa parsing, clasificacion de intencion y conexion con app.js.
 * - Fase 3: devuelve respuestas pedagogicas reutilizando los modulos reales de
 *   la calculadora y su salida verificada.
 */

(function () {
    /**
     * Catalogo reutilizable del asistente.
     * Centraliza contenido conceptual, etiquetas y sugerencias.
     */
    const AssistantContent = {
        conceptLibrary: {
            sistemas: {
                title: "Sistemas de ecuaciones lineales",
                definition: "Un sistema lineal es un conjunto de ecuaciones que deben cumplirse al mismo tiempo.",
                simple: "La meta es encontrar los valores de las variables que hacen verdaderas todas las ecuaciones a la vez.",
                method: "Cuando hay ejercicio numerico, el metodo mas directo en esta app es Gauss-Jordan sobre la matriz aumentada.",
                recognition: "Suelen aparecer ecuaciones con signo igual, por ejemplo 2x + y = 5.",
                pitfall: "Un error comun es confundir una fila nula con contradiccion. La contradiccion real aparece cuando queda [0 0 ... | c] con c distinto de 0."
            },
            matrices: {
                title: "Operaciones con matrices",
                definition: "Una matriz es un arreglo rectangular de numeros organizado en filas y columnas.",
                simple: "Sirve para representar datos y transformaciones lineales.",
                method: "Cada operacion tiene una condicion previa: suma y resta exigen mismas dimensiones, multiplicacion exige compatibilidad interna, e inversa exige matriz cuadrada con determinante no nulo.",
                recognition: "Se reconocen por arreglos como [[1,2],[3,4]] o por nombres como A, B, transpuesta e inversa.",
                pitfall: "El error mas frecuente es intentar multiplicar matrices solo porque tienen el mismo tamano. Lo que manda es columnas de A contra filas de B."
            },
            determinantes: {
                title: "Determinantes",
                definition: "El determinante es un escalar asociado a una matriz cuadrada.",
                simple: "Indica si la transformacion lineal colapsa espacio y si la matriz tiene inversa.",
                method: "En esta app se usa formula directa en 2x2, Sarrus en 3x3 y cofactores en 4x4.",
                recognition: "Aparece como det(A), |A| o como peticion de saber si una matriz es invertible.",
                pitfall: "Un error comun es aplicar Sarrus a una matriz que no es 3x3."
            },
            vectores: {
                title: "Vectores",
                definition: "Un vector es un objeto con componentes que representa direccion y magnitud.",
                simple: "Se puede sumar, restar, medir, comparar con otro vector o proyectar sobre otra direccion.",
                method: "La operacion depende del objetivo: producto punto para alineacion, producto cruz para perpendicularidad en 3D, y magnitud para longitud.",
                recognition: "Suelen escribirse como [1,2], [1,2,3], u = [...], v = [...].",
                pitfall: "Un error comun es intentar producto cruz en 2D o calcular un angulo con un vector nulo."
            }
        },

        topicLabels: {
            sistemas: "Sistemas de ecuaciones",
            matrices: "Matrices",
            determinantes: "Determinantes",
            vectores: "Vectores"
        },

        baseResponses: {
            saludo: "Hola. Soy Tutor AlgeMat. Puedo explicarte conceptos de Algebra Lineal o ayudarte a elegir el modulo correcto.",
            agradecimiento: "Con gusto. Estoy aqui para ayudarte a comprender mejor Algebra Lineal.",
            despedida: "Hasta luego. Sigue practicando; cada ejercicio te ayuda a entender mejor.",
            usuario_perdido: "No te preocupes. Puedes usar las sugerencias que ves en pantalla para empezar, o decirme que tema estas viendo: sistemas, matrices, determinantes o vectores.",
            incoherencia: "Creo que tu mensaje no se entendio bien. Quieres aprender un concepto o resolver un ejercicio?",
            ejercicio: "Eso parece un ejercicio matematico. Para resolverlo completo, usa el modulo correspondiente de la calculadora. Aqui puedo ayudarte a entender el metodo o interpretar el resultado.",
            fuera_tema: "Puedo ayudarte principalmente con Algebra Lineal. Puedes preguntarme sobre sistemas, matrices, determinantes o vectores."
        },

        moduleHelp: {
            sistemas: "Para resolver un sistema, ingresa los coeficientes y terminos independientes, luego presiona \"Resolver y Mostrar Pasos\".",
            matrices: "En el modulo de matrices puedes ingresar tus valores y aplicar operaciones como suma, producto, inversa o reduccion.",
            determinantes: "En determinantes, ingresa una matriz cuadrada y la app calculara su determinante paso a paso.",
            vectores: "En vectores puedes ingresar componentes y calcular operaciones como magnitud, suma o producto punto."
        },

        conceptDictionary: {
            determinante: {
                topic: "determinantes",
                aliases: ["determinante", "det", "determinantes"],
                response: "El determinante es un numero asociado a una matriz cuadrada. Indica como una transformacion lineal estira, comprime o cambia la orientacion del espacio. Si vale cero, la matriz no tiene inversa.",
                suggestions: [
                    "Que significa que el determinante sea cero?",
                    "Para que sirve un determinante?",
                    "Que relacion tiene con la matriz inversa?"
                ]
            },
            matriz_invertible: {
                topic: "matrices",
                aliases: ["matriz invertible", "inversa", "matriz inversa", "invertible"],
                response: "Una matriz es invertible si existe otra matriz que revierte su efecto. En matrices cuadradas, esto ocurre cuando su determinante es distinto de cero.",
                suggestions: [
                    "Como se si una matriz es invertible?",
                    "Que pasa si el determinante es cero?",
                    "Para que sirve la matriz inversa?"
                ]
            },
            producto_punto: {
                topic: "vectores",
                aliases: ["producto punto", "producto escalar", "dot product"],
                response: "El producto punto mide que tanto un vector apunta en la direccion de otro. Tambien ayuda a saber si dos vectores son perpendiculares.",
                suggestions: [
                    "Cuando dos vectores son perpendiculares?",
                    "Para que sirve el producto punto?",
                    "Como se interpreta geometricamente?"
                ]
            },
            sistema_ecuaciones: {
                topic: "sistemas",
                aliases: ["sistema", "sistemas", "sistema de ecuaciones", "ecuaciones lineales"],
                response: "Un sistema de ecuaciones lineales es un conjunto de ecuaciones que comparten variables y deben cumplirse al mismo tiempo. Su solucion puede ser unica, infinita o inexistente.",
                suggestions: [
                    "Que significa solucion unica?",
                    "Que es un sistema incompatible?",
                    "Como funciona Gauss-Jordan?"
                ]
            },
            gauss_jordan: {
                topic: "sistemas",
                aliases: ["gauss jordan", "gauss-jordan", "reduccion", "eliminacion"],
                response: "El metodo de Gauss-Jordan transforma la matriz aumentada del sistema hasta una forma reducida. Asi se pueden leer directamente las soluciones.",
                suggestions: [
                    "Que es una matriz aumentada?",
                    "Que significa pivote?",
                    "Como interpreto el resultado?"
                ]
            },
            vector: {
                topic: "vectores",
                aliases: ["vector", "vectores"],
                response: "Un vector representa una cantidad con magnitud y direccion. En Algebra Lineal se usa para describir posiciones, desplazamientos y combinaciones lineales.",
                suggestions: [
                    "Que es la magnitud de un vector?",
                    "Que es una combinacion lineal?",
                    "Que significa direccion de un vector?"
                ]
            }
        },

        suggestions: {
            conceptos: [
                { id: "concept_det", topic: "determinantes", intent: "concepto", faqId: "faq-det-repr", text: "¿Qué representa un determinante?" },
                { id: "concept_inv", topic: "matrices", intent: "concepto", faqId: "faq-mat-inv", text: "¿Qué significa que una matriz sea invertible?" },
                { id: "concept_dot", topic: "vectores", intent: "concepto", faqId: "faq-vec-dot", text: "¿Para qué sirve el producto punto?" },
                { id: "concept_sys", topic: "sistemas", intent: "concepto", faqId: "faq-sis-gj", text: "¿Cuándo se usa Gauss-Jordan?" }
            ],
            sistemas: [
                { id: "sis_def", topic: "sistemas", intent: "concepto", faqId: "faq-sis-def", text: "¿Qué es un sistema de ecuaciones lineales?" },
                { id: "sis_sol", topic: "sistemas", intent: "concepto", faqId: "faq-sis-sol", text: "¿Qué significa que un sistema tenga solución?" },
                { id: "sis_comp", topic: "sistemas", intent: "concepto", faqId: "faq-sis-comp-diff", text: "¿Qué diferencia hay entre sistema compatible e incompatible?" },
                { id: "sis_gj", topic: "sistemas", intent: "concepto", faqId: "faq-sis-gj", text: "¿Cuándo se usa Gauss-Jordan?" },
                { id: "sis_geo", topic: "sistemas", intent: "concepto", faqId: "faq-sis-geo", text: "¿Qué representa un sistema en geometría?" },
                { id: "sis_free", topic: "sistemas", intent: "concepto", faqId: "faq-sis-free", text: "¿Qué significa una variable libre?" }
            ],
            matrices: [
                { id: "mat_square", topic: "matrices", intent: "concepto", faqId: "faq-mat-square", text: "¿Qué es una matriz cuadrada?" },
                { id: "mat_inv", topic: "matrices", intent: "concepto", faqId: "faq-mat-inv", text: "¿Qué significa que una matriz sea invertible?" },
                { id: "mat_mult", topic: "matrices", intent: "concepto", faqId: "faq-mat-mult", text: "¿Cuándo se pueden multiplicar dos matrices?" },
                { id: "mat_types", topic: "matrices", intent: "concepto", faqId: "faq-mat-types", text: "¿Qué diferencia hay entre matriz diagonal y triangular?" },
                { id: "mat_trans", topic: "matrices", intent: "concepto", faqId: "faq-mat-trans", text: "¿Qué significa la transpuesta de una matriz?" },
                { id: "mat_fail_inv", topic: "matrices", intent: "concepto", faqId: "faq-mat-fail-inv", text: "¿Por qué no toda matriz tiene inversa?" }
            ],
            determinantes: [
                { id: "det_repr", topic: "determinantes", intent: "concepto", faqId: "faq-det-repr", text: "¿Qué representa un determinante?" },
                { id: "det_zero", topic: "determinantes", intent: "concepto", faqId: "faq-det-zero", text: "¿Cuándo un determinante vale cero?" },
                { id: "det_inv", topic: "determinantes", intent: "concepto", faqId: "faq-det-inv", text: "¿Qué relación tiene el determinante con la inversa?" },
                { id: "det_use", topic: "determinantes", intent: "concepto", faqId: "faq-det-use", text: "¿Para qué sirve el determinante en Álgebra Lineal?" },
                { id: "det_sarrus", topic: "determinantes", intent: "concepto", faqId: "faq-det-sarrus", text: "¿Cuándo se usa la regla de Sarrus?" },
                { id: "det_neg", topic: "determinantes", intent: "concepto", faqId: "faq-det-neg", text: "¿Qué significa que el determinante sea negativo?" }
            ],
            vectores: [
                { id: "vec_def", topic: "vectores", intent: "concepto", faqId: "faq-vec-def", text: "¿Qué es un vector?" },
                { id: "vec_mag", topic: "vectores", intent: "concepto", faqId: "faq-vec-mag", text: "¿Qué representa la magnitud de un vector?" },
                { id: "vec_dot", topic: "vectores", intent: "concepto", faqId: "faq-vec-dot", text: "¿Para qué sirve el producto punto?" },
                { id: "vec_ortho", topic: "vectores", intent: "concepto", faqId: "faq-vec-ortho", text: "¿Qué significa que dos vectores sean ortogonales?" },
                { id: "vec_cross", topic: "vectores", intent: "concepto", faqId: "faq-vec-cross", text: "¿Cuándo se usa el producto cruz?" },
                { id: "vec_proj", topic: "vectores", intent: "concepto", faqId: "faq-vec-proj", text: "¿Para qué sirve la proyección de un vector sobre otro?" }
            ]
        },

        faqBank: {
            sistemas: [
                {
                    id: "faq-sis-def",
                    topic: "sistemas",
                    intent: "definicion",
                    question: "¿Qué es un sistema de ecuaciones lineales?",
                    variants: [
                        "que es un sistema de ecuaciones lineales",
                        "que significa un sistema de ecuaciones",
                        "que es un sistema lineal",
                        "explicame que es un sistema lineal",
                        "no entiendo que es un sistema de ecuaciones"
                    ],
                    answer: "Es un conjunto de ecuaciones lineales que deben cumplirse al mismo tiempo. Su objetivo es encontrar valores para las variables que hagan verdaderas todas las ecuaciones a la vez.",
                    related: [
                        "¿Qué significa que un sistema sea compatible?",
                        "¿Cuándo un sistema tiene infinitas soluciones?",
                        "¿Qué método se usa para resolver sistemas?"
                    ],
                    keywords: ["sistema", "ecuaciones lineales", "sistema lineal"]
                },
                {
                    id: "faq-sis-comp",
                    topic: "sistemas",
                    intent: "interpretacion",
                    question: "¿Qué significa que un sistema sea compatible?",
                    variants: [
                        "que es un sistema compatible",
                        "que quiere decir compatible en sistemas",
                        "no entiendo que significa sistema compatible"
                    ],
                    answer: "Significa que el sistema tiene al menos una solución. Puede tener una única solución o infinitas soluciones, pero no está en contradicción.",
                    related: [
                        "¿Qué diferencia hay entre sistema compatible e incompatible?",
                        "¿Qué significa una variable libre?",
                        "¿Cómo saber si un sistema no tiene solución?"
                    ],
                    keywords: ["compatible", "sistema compatible"]
                },
                {
                    id: "faq-sis-sol",
                    topic: "sistemas",
                    intent: "interpretacion",
                    question: "¿Qué significa que un sistema tenga solución?",
                    variants: [
                        "que significa que un sistema tenga solucion",
                        "que quiere decir que un sistema tenga solucion",
                        "como saber si un sistema tiene solucion"
                    ],
                    answer: "Significa que existe al menos un conjunto de valores para las variables que satisface todas las ecuaciones del sistema al mismo tiempo.",
                    related: [
                        "¿Qué significa que un sistema sea compatible?",
                        "¿Cuándo un sistema tiene infinitas soluciones?",
                        "¿Cómo saber si un sistema no tiene solución?"
                    ],
                    keywords: ["sistema tenga solucion", "tiene solucion"]
                },
                {
                    id: "faq-sis-comp-diff",
                    topic: "sistemas",
                    intent: "comparacion",
                    question: "¿Qué diferencia hay entre sistema compatible e incompatible?",
                    variants: [
                        "que diferencia hay entre sistema compatible e incompatible",
                        "diferencia entre compatible e incompatible",
                        "que cambia entre un sistema compatible y uno incompatible"
                    ],
                    answer: "Un sistema compatible tiene al menos una solución. Un sistema incompatible no tiene solución.",
                    related: [
                        "¿Qué significa que un sistema tenga solución?",
                        "¿Cómo saber si un sistema no tiene solución?",
                        "¿Qué representa un sistema en geometría?"
                    ],
                    keywords: ["compatible e incompatible", "sistema incompatible"]
                },
                {
                    id: "faq-sis-geo",
                    topic: "sistemas",
                    intent: "interpretacion",
                    question: "¿Qué representa un sistema en geometría?",
                    variants: [
                        "que representa un sistema en geometria",
                        "interpretacion geometrica de un sistema",
                        "que significa un sistema geometricamente"
                    ],
                    answer: "Representa la intersección de rectas, planos o hiperplanos. Resolverlo es determinar si se intersectan y cómo lo hacen.",
                    related: [
                        "¿Qué significa que un sistema tenga solución?",
                        "¿Qué diferencia hay entre sistema compatible e incompatible?",
                        "¿Cómo saber si un sistema no tiene solución?"
                    ],
                    keywords: ["geometria", "interseccion", "sistema en geometria"]
                },
                {
                    id: "faq-sis-free",
                    topic: "sistemas",
                    intent: "interpretacion",
                    question: "¿Qué significa una variable libre?",
                    variants: [
                        "que significa una variable libre",
                        "que es una variable libre",
                        "por que aparece una variable libre"
                    ],
                    answer: "Una variable libre es una variable que no queda fijada por un pivote. Su presencia suele indicar que el sistema tiene infinitas soluciones.",
                    related: [
                        "¿Cuándo un sistema tiene infinitas soluciones?",
                        "¿Qué significa que un sistema sea compatible?",
                        "¿Cuándo se usa Gauss-Jordan?"
                    ],
                    keywords: ["variable libre"]
                },
                {
                    id: "faq-sis-gj",
                    topic: "sistemas",
                    intent: "uso",
                    question: "¿Cuándo se usa Gauss-Jordan?",
                    variants: [
                        "cuando se usa gauss jordan",
                        "para que sirve gauss jordan",
                        "cuando conviene usar gauss jordan"
                    ],
                    answer: "Se usa cuando quieres resolver un sistema de forma ordenada y dejar la información en una forma reducida que permita ver con claridad la solución o su clasificación.",
                    related: [
                        "¿Qué significa que un sistema tenga solución?",
                        "¿Qué representa un sistema en geometría?",
                        "¿Qué significa una variable libre?"
                    ],
                    keywords: ["gauss jordan", "gauss-jordan"]
                }
            ],
            matrices: [
                {
                    id: "faq-mat-def",
                    topic: "matrices",
                    intent: "definicion",
                    question: "¿Qué es una matriz?",
                    variants: [
                        "que significa una matriz",
                        "para que sirve una matriz",
                        "explicame que es una matriz",
                        "no entiendo que es una matriz"
                    ],
                    answer: "Una matriz es un arreglo rectangular de números organizado en filas y columnas. En Álgebra Lineal sirve para representar datos, coeficientes y transformaciones lineales.",
                    related: [
                        "¿Qué es una matriz cuadrada?",
                        "¿Qué significa que una matriz sea invertible?",
                        "¿Qué diferencia hay entre matriz y vector?"
                    ],
                    keywords: ["matriz", "filas", "columnas"]
                },
                {
                    id: "faq-mat-square",
                    topic: "matrices",
                    intent: "definicion",
                    question: "¿Qué es una matriz cuadrada?",
                    variants: [
                        "que es una matriz cuadrada",
                        "que significa matriz cuadrada",
                        "como reconocer una matriz cuadrada"
                    ],
                    answer: "Es una matriz que tiene el mismo número de filas y columnas. Esa condición es importante porque conceptos como determinante e inversa se estudian en matrices cuadradas.",
                    related: [
                        "¿Qué significa que una matriz sea invertible?",
                        "¿Qué diferencia hay entre matriz cuadrada y rectangular?",
                        "¿Qué es un determinante?"
                    ],
                    keywords: ["matriz cuadrada", "cuadrada"]
                },
                {
                    id: "faq-mat-inv",
                    topic: "matrices",
                    intent: "interpretacion",
                    question: "¿Qué significa que una matriz sea invertible?",
                    variants: [
                        "que es una matriz invertible",
                        "que quiere decir que una matriz tenga inversa",
                        "no entiendo que significa invertible"
                    ],
                    answer: "Significa que la transformación que representa puede deshacerse. Conceptualmente, no pierde información y existe una inversa que revierte su efecto.",
                    related: [
                        "¿Por qué no toda matriz tiene inversa?",
                        "¿Qué relación hay entre determinante e inversa?",
                        "¿Qué es una matriz cuadrada?"
                    ],
                    keywords: ["invertible", "matriz invertible", "inversa"]
                },
                {
                    id: "faq-mat-mult",
                    topic: "matrices",
                    intent: "uso",
                    question: "¿Cuándo se puede multiplicar una matriz?",
                    variants: [
                        "cuando se puede multiplicar una matriz",
                        "cuando se pueden multiplicar dos matrices",
                        "como saber si dos matrices se pueden multiplicar"
                    ],
                    answer: "Se puede multiplicar una matriz por otra cuando el número de columnas de la primera coincide con el número de filas de la segunda.",
                    related: [
                        "¿Qué diferencia hay entre sumar y multiplicar matrices?",
                        "¿Qué significa que una matriz sea invertible?",
                        "¿Qué error común aparece al multiplicar matrices?"
                    ],
                    keywords: ["multiplicar matrices", "multiplicar una matriz"]
                },
                {
                    id: "faq-mat-types",
                    topic: "matrices",
                    intent: "comparacion",
                    question: "¿Qué diferencia hay entre matriz diagonal y triangular?",
                    variants: [
                        "que diferencia hay entre matriz diagonal y triangular",
                        "matriz diagonal y triangular",
                        "como distinguir una matriz diagonal de una triangular"
                    ],
                    answer: "Una matriz diagonal solo tiene posibles valores no nulos en la diagonal principal. Una triangular puede tener valores por encima o por debajo de esa diagonal, pero mantiene uno de esos lados en cero.",
                    related: [
                        "¿Qué es una matriz cuadrada?",
                        "¿Qué significa la transpuesta de una matriz?",
                        "¿Qué significa que una matriz sea invertible?"
                    ],
                    keywords: ["matriz diagonal", "matriz triangular", "diagonal y triangular"]
                },
                {
                    id: "faq-mat-trans",
                    topic: "matrices",
                    intent: "interpretacion",
                    question: "¿Qué significa la transpuesta de una matriz?",
                    variants: [
                        "que significa la transpuesta de una matriz",
                        "que es la transpuesta",
                        "para que sirve la transpuesta"
                    ],
                    answer: "La transpuesta se obtiene al intercambiar filas por columnas. Es útil para reorganizar información y aparece en muchas propiedades algebraicas.",
                    related: [
                        "¿Qué diferencia hay entre matriz diagonal y triangular?",
                        "¿Qué es una matriz cuadrada?",
                        "¿Qué significa que una matriz sea invertible?"
                    ],
                    keywords: ["transpuesta", "transpuesta de una matriz"]
                },
                {
                    id: "faq-mat-fail-inv",
                    topic: "matrices",
                    intent: "error_comun",
                    question: "¿Por qué no toda matriz tiene inversa?",
                    variants: [
                        "por que no toda matriz tiene inversa",
                        "cuando una matriz no tiene inversa",
                        "por que falla la inversa de una matriz"
                    ],
                    answer: "No toda matriz tiene inversa porque para ello debe cumplir condiciones como ser cuadrada y no perder información. Si esas condiciones fallan, la inversa no existe.",
                    related: [
                        "¿Qué significa que una matriz sea invertible?",
                        "¿Qué relación hay entre determinante e inversa?",
                        "¿Qué es una matriz cuadrada?"
                    ],
                    keywords: ["no toda matriz tiene inversa", "matriz no tiene inversa"]
                }
            ],
            determinantes: [
                {
                    id: "faq-det-repr",
                    topic: "determinantes",
                    intent: "interpretacion",
                    question: "¿Qué representa un determinante?",
                    variants: [
                        "que representa un determinante",
                        "que significa un determinante",
                        "para que sirve un determinante"
                    ],
                    answer: "Representa información clave sobre una matriz cuadrada: si es invertible y cómo la transformación asociada escala o cambia la orientación del espacio.",
                    related: [
                        "¿Cuándo un determinante vale cero?",
                        "¿Qué relación tiene el determinante con la inversa?",
                        "¿Para qué sirve el determinante en Álgebra Lineal?"
                    ],
                    keywords: ["determinante", "que representa un determinante"]
                },
                {
                    id: "faq-det-zero",
                    topic: "determinantes",
                    intent: "interpretacion",
                    question: "¿Cuándo un determinante vale cero?",
                    variants: [
                        "que significa que el determinante sea cero",
                        "que pasa si el determinante da cero",
                        "como interpretar un determinante cero"
                    ],
                    answer: "Un determinante igual a cero indica que la matriz es singular. Eso implica que no tiene inversa y que existe dependencia lineal entre sus filas o columnas.",
                    related: [
                        "¿Qué relación tiene el determinante con la inversa?",
                        "¿Qué significa que una matriz sea singular?",
                        "¿Para qué sirve el determinante en Álgebra Lineal?"
                    ],
                    keywords: ["determinante cero", "determinante sea cero", "det igual a cero"]
                },
                {
                    id: "faq-det-inv",
                    topic: "determinantes",
                    intent: "comparacion",
                    question: "¿Qué relación tiene el determinante con la inversa?",
                    variants: [
                        "que relacion tiene el determinante con la inversa",
                        "que relacion hay entre determinante e inversa",
                        "por que el determinante dice si hay inversa"
                    ],
                    answer: "En matrices cuadradas, un determinante distinto de cero indica que la matriz es invertible. Si el determinante es cero, la inversa no existe.",
                    related: [
                        "¿Qué significa que una matriz sea invertible?",
                        "¿Cuándo un determinante vale cero?",
                        "¿Qué representa un determinante?"
                    ],
                    keywords: ["determinante e inversa", "determinante con la inversa"]
                },
                {
                    id: "faq-det-sarrus",
                    topic: "determinantes",
                    intent: "uso",
                    question: "¿Cuándo se usa la regla de Sarrus?",
                    variants: [
                        "cuando se usa la regla de sarrus",
                        "cuando se usa sarrus",
                        "para que sirve la regla de sarrus"
                    ],
                    answer: "La regla de Sarrus se usa para determinantes de matrices 3x3. Es un método específico de ese tamaño.",
                    related: [
                        "¿Qué representa un determinante?",
                        "¿Qué es un cofactor?",
                        "¿Qué diferencia hay entre menor y cofactor?"
                    ],
                    keywords: ["sarrus", "regla de sarrus"]
                },
                {
                    id: "faq-det-use",
                    topic: "determinantes",
                    intent: "uso",
                    question: "¿Para qué sirve el determinante en Álgebra Lineal?",
                    variants: [
                        "para que sirve el determinante en algebra lineal",
                        "para que sirve calcular determinantes",
                        "utilidad del determinante"
                    ],
                    answer: "Sirve para decidir si una matriz cuadrada es invertible y para interpretar cómo una transformación escala área, volumen o más generalmente espacio.",
                    related: [
                        "¿Qué representa un determinante?",
                        "¿Cuándo un determinante vale cero?",
                        "¿Qué relación tiene el determinante con la inversa?"
                    ],
                    keywords: ["para que sirve el determinante", "utilidad del determinante"]
                },
                {
                    id: "faq-det-neg",
                    topic: "determinantes",
                    intent: "interpretacion",
                    question: "¿Qué significa que el determinante sea negativo?",
                    variants: [
                        "que significa que el determinante sea negativo",
                        "que pasa si el determinante es negativo",
                        "como interpretar un determinante negativo"
                    ],
                    answer: "Significa que la transformación cambia la orientación, además de escalar el espacio por un factor no nulo.",
                    related: [
                        "¿Qué representa un determinante?",
                        "¿Para qué sirve el determinante en Álgebra Lineal?",
                        "¿Cuándo un determinante vale cero?"
                    ],
                    keywords: ["determinante negativo", "determinante sea negativo"]
                }
            ],
            vectores: [
                {
                    id: "faq-vec-def",
                    topic: "vectores",
                    intent: "definicion",
                    question: "¿Qué es un vector?",
                    variants: [
                        "que significa un vector",
                        "que representa un vector",
                        "explicame que es un vector",
                        "no entiendo que es un vector"
                    ],
                    answer: "Un vector es un objeto con componentes que suele interpretarse por su magnitud y su dirección. En Álgebra Lineal también se entiende como un elemento de un espacio vectorial.",
                    related: [
                        "¿Qué representa la magnitud de un vector?",
                        "¿Qué diferencia hay entre magnitud y dirección?",
                        "¿Qué diferencia hay entre vector y escalar?"
                    ],
                    keywords: ["vector", "que es un vector"]
                },
                {
                    id: "faq-vec-mag",
                    topic: "vectores",
                    intent: "interpretacion",
                    question: "¿Qué representa la magnitud de un vector?",
                    variants: [
                        "que significa la magnitud de un vector",
                        "que representa la magnitud",
                        "para que sirve la magnitud de un vector"
                    ],
                    answer: "La magnitud representa la longitud o tamaño del vector. Geométricamente indica qué tan grande es el desplazamiento o la cantidad representada.",
                    related: [
                        "¿Qué diferencia hay entre magnitud y dirección?",
                        "¿Qué representa un vector?",
                        "¿Para qué sirve el producto punto?"
                    ],
                    keywords: ["magnitud", "magnitud de un vector"]
                },
                {
                    id: "faq-vec-dot",
                    topic: "vectores",
                    intent: "uso",
                    question: "¿Para qué sirve el producto punto?",
                    variants: [
                        "que me dice el producto punto",
                        "que significa el producto punto",
                        "para que se usa el producto punto"
                    ],
                    answer: "Sirve para estudiar la alineación entre vectores, calcular ángulos y reconocer perpendicularidad.",
                    related: [
                        "¿Qué significa que dos vectores sean ortogonales?",
                        "¿Qué diferencia hay entre producto punto y producto cruz?",
                        "¿Qué representa la proyección de un vector?"
                    ],
                    keywords: ["producto punto", "para que sirve el producto punto"]
                },
                {
                    id: "faq-vec-cross",
                    topic: "vectores",
                    intent: "uso",
                    question: "¿Cuándo se usa el producto cruz?",
                    variants: [
                        "cuando se usa el producto cruz",
                        "para que sirve el producto cruz",
                        "en que casos se usa el producto cruz"
                    ],
                    answer: "Se usa en 3D cuando necesitas un vector perpendicular al plano formado por otros dos vectores.",
                    related: [
                        "¿Qué diferencia hay entre producto punto y producto cruz?",
                        "¿Qué significa que dos vectores sean ortogonales?",
                        "¿Qué representa un vector?"
                    ],
                    keywords: ["producto cruz", "cuando se usa el producto cruz"]
                },
                {
                    id: "faq-vec-ortho",
                    topic: "vectores",
                    intent: "interpretacion",
                    question: "¿Qué significa que dos vectores sean ortogonales?",
                    variants: [
                        "que significa que dos vectores sean ortogonales",
                        "que significa que dos vectores sean perpendiculares",
                        "como interpretar vectores ortogonales"
                    ],
                    answer: "Significa que forman un ángulo recto entre sí. Si ambos son no nulos, esto suele reflejarse en un producto punto igual a cero.",
                    related: [
                        "¿Para qué sirve el producto punto?",
                        "¿Qué diferencia hay entre producto punto y producto cruz?",
                        "¿Qué representa la magnitud de un vector?"
                    ],
                    keywords: ["ortogonales", "vectores ortogonales", "perpendiculares"]
                },
                {
                    id: "faq-vec-proj",
                    topic: "vectores",
                    intent: "uso",
                    question: "¿Para qué sirve la proyección de un vector sobre otro?",
                    variants: [
                        "para que sirve la proyeccion de un vector sobre otro",
                        "que representa la proyeccion de un vector",
                        "para que sirve la proyeccion"
                    ],
                    answer: "Sirve para extraer la parte de un vector que apunta en la dirección de otro. Es útil para separar componentes y entender cuánto de un vector va en cierta dirección.",
                    related: [
                        "¿Para qué sirve el producto punto?",
                        "¿Qué diferencia hay entre magnitud y dirección?",
                        "¿Qué representa un vector?"
                    ],
                    keywords: ["proyeccion", "proyeccion de un vector"]
                }
            ]
        },

        getConcept(topic) {
            return this.conceptLibrary[topic];
        },

        getTopicLabel(topic) {
            return this.topicLabels[topic] || "Tema matematico";
        },

        getBaseResponse(intent) {
            return this.baseResponses[intent] || this.baseResponses.fuera_tema;
        },

        getModuleGuidance(topic) {
            const labels = {
                sistemas: "Si quieres resolver un ejercicio, usa el módulo de Sistemas de ecuaciones de la calculadora.",
                matrices: "Si quieres resolver un ejercicio, usa el módulo de Matrices de la calculadora.",
                determinantes: "Si quieres resolver un ejercicio, usa el módulo de Determinantes de la calculadora.",
                vectores: "Si quieres resolver un ejercicio, usa el módulo de Vectores de la calculadora."
            };

            return labels[topic] || "Si necesitas un procedimiento completo, ve al módulo correspondiente de la calculadora.";
        },

        getModuleHelp(topic) {
            if (topic && this.moduleHelp[topic]) {
                return this.moduleHelp[topic];
            }
            return "Puedes elegir un modulo en el menu lateral: Sistemas, Matrices, Determinantes o Vectores.";
        },

        getConceptExample(topic) {
            const examples = {
                sistemas: "Un ejemplo sencillo de sistema es tener dos ecuaciones que hablan de las mismas variables, como x + y = 5 y x - y = 1. La idea no es mirar cada ecuacion aislada, sino buscar valores de x y y que cumplan ambas al mismo tiempo.",
                matrices: "Un ejemplo sencillo de matriz es [[1, 2], [3, 4]]. Tiene 2 filas y 2 columnas. Puedes pensarla como una tabla de numeros o como una forma compacta de representar una transformacion.",
                determinantes: "Un ejemplo sencillo es una matriz 2x2. Su determinante resume si esa matriz conserva area de forma no nula. Si el determinante da cero, la transformacion aplasta el plano y la matriz no tiene inversa.",
                vectores: "Un ejemplo sencillo de vector es [3, 4]. Sus componentes indican desplazamiento en dos direcciones, y su magnitud representa la longitud de ese desplazamiento."
            };

            return examples[topic] || "Puedo darte un ejemplo dentro de sistemas, matrices, determinantes o vectores. Escribe el tema y lo conecto con una idea sencilla.";
        },

        getConceptSteps(topic) {
            const steps = {
                sistemas: "1. Escribe el sistema como matriz aumentada, separando coeficientes y terminos independientes.\n2. Usa operaciones elementales por fila para formar pivotes y eliminar variables.\n3. Lleva la matriz a una forma escalonada o reducida.\n4. Interpreta la fila final: solucion unica, infinitas soluciones o ninguna solucion.",
                matrices: "1. Identifica que operacion quieres hacer: suma, producto, transpuesta, inversa o reduccion.\n2. Revisa la condicion de la operacion, como dimensiones iguales para sumar o columnas de A iguales a filas de B para multiplicar.\n3. Aplica la regla entrada por entrada, fila por columna o por operaciones elementales segun corresponda.\n4. Verifica que el resultado tenga las dimensiones esperadas.",
                determinantes: "1. Confirma que la matriz sea cuadrada.\n2. Elige el metodo segun el tamano: formula directa en 2x2, Sarrus en 3x3 o cofactores en matrices mayores.\n3. Calcula con cuidado los signos y productos que pide el metodo.\n4. Interpreta el resultado: si es cero, la matriz no es invertible; si no es cero, si tiene inversa.",
                vectores: "1. Identifica la operacion: suma, resta, magnitud, producto punto, producto cruz, angulo o proyeccion.\n2. Revisa que los vectores tengan dimensiones compatibles.\n3. Aplica la formula correspondiente usando las componentes.\n4. Interpreta el resultado como longitud, direccion, alineacion, perpendicularidad o componente proyectada."
            };

            return steps[topic] || "1. Identifica el tema: sistemas, matrices, determinantes o vectores.\n2. Revisa las condiciones del metodo.\n3. Aplica el procedimiento general sin saltarte la interpretacion.\n4. Usa el modulo correspondiente de AlgeMat para desarrollar calculos completos.";
        },

        getCurrentModuleSuggestions(topic = null, limit = 4) {
            return this.getSuggestions(topic || "conceptos", "", limit);
        },

        getConceptDictionaryEntries() {
            return Object.values(this.conceptDictionary);
        },

        findConceptEntry(text, preferredTopic = null) {
            const normalized = AssistantParser.normalizeText(text || "");
            const entries = this.getConceptDictionaryEntries().filter((entry) => !preferredTopic || entry.topic === preferredTopic);

            return entries.find((entry) => {
                return (entry.aliases || []).some((alias) => {
                    const normalizedAlias = AssistantParser.normalizeText(alias);
                    return normalized === normalizedAlias || normalized.includes(normalizedAlias);
                });
            }) || null;
        },

        getClosing(intent, topic) {
            const closings = {
                definicion: "Puedo seguir con la interpretación de este concepto, una diferencia con ideas cercanas o un error común.",
                comparacion: "Si quieres, ahora puedo ayudarte a distinguir estos conceptos en contexto o señalar cuándo conviene pensar en uno y no en el otro.",
                interpretacion: "También puedo conectar esta idea con otra propiedad importante del mismo tema.",
                uso: "Si quieres, puedo explicarte por qué se usa en ese contexto y qué condición lo justifica.",
                orientacion_modulo: `${this.getModuleGuidance(topic)} Aquí puedo ayudarte a entender el concepto y orientarte al apartado correcto.`
            };

            return closings[intent] || "Puedo seguir con una explicación conceptual relacionada con este tema.";
        },

        getFaqEntries(topic = null) {
            if (topic && this.faqBank[topic]) {
                return this.faqBank[topic];
            }
            return Object.values(this.faqBank).flat();
        },

        findFaqById(faqId) {
            if (!faqId) return null;
            return this.getFaqEntries().find((entry) => entry.id === faqId) || null;
        },

        findFaqMatch(text, preferredTopic = null) {
            const normalized = AssistantParser.normalizeText(text || "");
            const entries = this.getFaqEntries(preferredTopic);

            return entries.find((entry) => {
                const prompts = [entry.question, ...(entry.variants || []), ...(entry.keywords || [])]
                    .map((item) => AssistantParser.normalizeText(item));

                return prompts.some((prompt) => normalized === prompt || normalized.includes(prompt) || prompt.includes(normalized));
            }) || null;
        },

        normalizeSuggestion(suggestion, fallbackTopic = "conceptos") {
            if (typeof suggestion === "string") {
                return {
                    id: `suggestion-${fallbackTopic}-${suggestion.toLowerCase().replace(/[^\w]+/g, "-")}`,
                    topic: fallbackTopic,
                    intent: "concepto",
                    text: suggestion,
                    prompt: suggestion
                };
            }

            return {
                id: suggestion.id || `suggestion-${fallbackTopic}-${Math.random().toString(36).slice(2, 8)}`,
                topic: suggestion.topic || fallbackTopic,
                intent: suggestion.intent || "concepto",
                faqId: suggestion.faqId || null,
                text: suggestion.text || suggestion.prompt || "",
                prompt: suggestion.prompt || suggestion.text || "",
                related: suggestion.related || []
            };
        },

        getSuggestions(topic, currentText = "", limit = 4) {
            const pool = (this.suggestions[topic] || this.suggestions.conceptos)
                .map((item) => this.normalizeSuggestion(item, topic || "conceptos"));
            const normalizedCurrent = AssistantParser.normalizeText(currentText || "");

            return pool
                .filter((item) => AssistantParser.normalizeText(item.prompt) !== normalizedCurrent)
                .slice(0, limit);
        }
    };

    /**
     * Utilidades puras para parsing y clasificacion de entrada matematica.
     * No tocan el DOM ni ejecutan modulos.
     */
    const AssistantParser = {
        normalizeText(text) {
            return String(text || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[\u00A0]/g, " ")
                .replace(/−/g, "-")
                .replace(/âˆ’/g, "-")
                .trim();
        },

        getCurrentModule() {
            const activeTab = document.querySelector(".tab-btn.active");
            const tabId = activeTab ? activeTab.getAttribute("data-tab") : null;
            if (["sistemas", "matrices", "determinantes", "vectores"].includes(tabId)) {
                return tabId;
            }
            return null;
        },

        findConcept(message, currentModule = null) {
            return AssistantContent.findConceptEntry(message, currentModule) || AssistantContent.findConceptEntry(message) || null;
        },

        looksLikeGreeting(text) {
            return /^(hola|holaa|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal|como estas)\b/.test(text);
        },

        looksLikeThanks(text) {
            return /\b(gracias|muchas gracias|ok gracias|perfecto|entendido|vale gracias)\b/.test(text);
        },

        looksLikeFarewell(text) {
            return /\b(adios|chao|hasta luego|nos vemos|bye)\b/.test(text);
        },

        looksLost(text) {
            return /\b(no se|no entiendo|ayuda|que hago|estoy perdido|por donde empiezo|como empiezo)\b/.test(text);
        },

        isIncoherent(text) {
            return /^(asd+|asdf|qwerty|kj+|kjsh\s*\d*|jaja xd|\d{1,3})$/.test(text) || text.length < 2;
        },

        isAppHelp(text) {
            return /\b(como uso|como se usa|donde pongo|como resuelvo|cargar ejemplo|que modulo|que modulo uso|boton|boton|coeficientes|menu lateral|modulo|modulo actual|como funciona la app)\b/.test(text);
        },

        isExercise(text) {
            return /=|(\d+\s*[a-z])|(\bx\b|\by\b|\bz\b)|\[\[|\]\]|\bdet\(/.test(text);
        },

        isOutsideTopic(text) {
            return /\b(futbol|cine|musica|historia universal|receta|programacion web|clima|politica)\b/.test(text);
        },

        looksLikeConceptQuestion(text) {
            return /\b(que es|explica|explicame|definicion|define|concepto|teoria|intuicion|cuando se usa|para que sirve|que significa|que representa|que implica|que diferencia|diferencia entre|como saber|como reconocer|que relacion|por que no|por que el|cuando un|que pasa si|ejemplo|ejemplos|pasos para|paso a paso|procedimiento|metodo para|como resolver|como se resuelve)\b/.test(text);
        },

        looksLikeExampleRequest(text) {
            return /\b(ejemplo|ejemplos|dame un ejemplo|un ejemplo|caso sencillo|caso simple)\b/.test(text);
        },

        looksLikeStepsRequest(text) {
            return /\b(pasos para|paso a paso|procedimiento|metodo para|como resolver|como se resuelve|que pasos|pasos de)\b/.test(text);
        },

        detectIntent(message, currentModule = null) {
            const text = this.normalizeText(message);

            if (this.looksLikeGreeting(text)) return "saludo";
            if (this.looksLikeThanks(text)) return "agradecimiento";
            if (this.looksLikeFarewell(text)) return "despedida";
            if (this.looksLost(text)) return "usuario_perdido";
            if (this.isIncoherent(text)) return "incoherencia";
            if (this.isOutsideTopic(text)) return "fuera_tema";
            if (this.isAppHelp(text)) return "ayuda_app";
            if (this.looksLikeConceptQuestion(text)) return "concepto";
            if (this.isExercise(text)) return "ejercicio";
            if (AssistantContent.findFaqMatch(text, currentModule)) return "concepto";
            if (this.findConcept(text, currentModule)) return "concepto";
            return "fuera_tema";
        },

        parseUserMathInput(text) {
            const normalized = this.normalizeText(text);
            if (!normalized) {
                return {
                    raw: text,
                    normalized,
                    intent: "resolver",
                    topic: null,
                    topicCandidates: [],
                    parsedData: null,
                    status: "unknown",
                    message: "Escribe un ejercicio o una pregunta concreta para que el asistente pueda ayudarte."
                };
            }
            const faqMatch = AssistantContent.findFaqMatch(text);
            if (faqMatch) {
                return {
                    raw: text,
                    normalized,
                    intent: "concepto",
                    topic: faqMatch.topic,
                    topicCandidates: [faqMatch.topic],
                    parsedData: null,
                    status: "ok",
                    message: "",
                    faqMatch
                };
            }

            const intent = this.detectMathIntent(normalized);
            const topicCandidates = this.detectTopics(normalized);

            const request = {
                raw: text,
                normalized,
                intent,
                topic: null,
                topicCandidates,
                parsedData: null,
                status: "ok",
                message: ""
            };

            if (!topicCandidates.length) {
                request.status = "unknown";
                request.message = "No pude reconocer el tipo de problema. Escribe el ejercicio con una estructura mas explicita.";
                return request;
            }

            if (this.isAmbiguousInput(normalized, topicCandidates, intent)) {
                request.status = "ambiguous";
                request.message = this.buildAmbiguousMessage(topicCandidates);
                return request;
            }

            request.topic = this.resolveTopic(normalized, topicCandidates);

            if (intent === "resolver" || intent === "verificar" || intent === "explicar_error") {
                request.parsedData = this.buildParsedPayload(request.topic, text);
            }

            return request;
        },

        detectMathIntent(text) {
            if (/(ejemplo|practica|practicar)/.test(text)) return "ejemplo";
            if (/(verifica|verificar|revision|revisa|comprobar|comprobacion)/.test(text)) return "verificar";
            if (/(error|equivoque|equivocado|paso incorrecto|por que esta mal)/.test(text)) return "explicar_error";
            if (/(que es|explica|explicame|definicion|define|concepto|teoria|intuicion|cuando se usa|para que sirve|que significa|que representa|que implica|que diferencia|diferencia entre|como saber|como reconocer|que relacion|por que no|por que el|cuando un|que pasa si)/.test(text)) return "concepto";
            return "resolver";
        },

        detectTopics(text) {
            const topics = [];
            const bracketBlocks = this.extractBracketBlocks(text);
            const hasMatrixBlocks = bracketBlocks.some((block) => this.blockDimension(block) === 2);
            const hasVectorBlocks = bracketBlocks.some((block) => this.blockDimension(block) === 1);

            if (/(det\(|determinante|\|a\|)/.test(text)) topics.push("determinantes");
            if (/(vector|producto punto|producto cruz|angulo|proyeccion|magnitud|\|\|u\|\||\bu\b|\bv\b)/.test(text) || hasVectorBlocks) topics.push("vectores");
            if (/(matriz|transpuesta|inversa|cofactor|adjunta|\[\s*\[|multiplica|suma|resta|escalar)/.test(text) || hasMatrixBlocks) topics.push("matrices");
            if (/(sistema|ecuacion|gauss|gauss-jordan|rouche|x\s*[+\-]|y\s*[+\-]|z\s*[+\-]|=)/.test(text)) topics.push("sistemas");

            return [...new Set(topics)];
        },

        detectTopic(text) {
            const topics = this.detectTopics(text);
            return topics.length ? topics[0] : null;
        },

        detectConceptTopic(text) {
            if (/determinante|invertible|singular|sarrus/.test(text)) return "determinantes";
            if (/vector|producto punto|producto cruz|proyeccion|magnitud|ortogonal|angulo/.test(text)) return "vectores";
            if (/sistema|ecuacion|gauss|rouche|pivote|matriz aumentada|variable libre/.test(text)) return "sistemas";
            if (/matriz|matrices|transpuesta|inversa|cofactor|adjunta|identidad/.test(text)) return "matrices";
            return null;
        },

        isAmbiguousInput(text, topicCandidates, intent) {
            if (intent === "concepto" || intent === "ejemplo") return false;
            if (topicCandidates.length <= 1) return false;

            const matrixVsDeterminant = topicCandidates.includes("matrices") && topicCandidates.includes("determinantes");
            if (matrixVsDeterminant && !/(det\(|determinante|\|a\||inversa|transpuesta|multiplica|suma|resta|cofactor|adjunta)/.test(text)) {
                return true;
            }

            const systemVsMatrix = topicCandidates.includes("sistemas") && topicCandidates.includes("matrices");
            if (systemVsMatrix && !/=/.test(text)) {
                return true;
            }

            return false;
        },

        buildAmbiguousMessage(topicCandidates) {
            const validationBridge = window.AlgeMatValidation;
            if (topicCandidates.includes("matrices") && topicCandidates.includes("determinantes")) {
                const detail = 'Parece una matriz cuadrada, pero no indica si quieres determinante, inversa, transpuesta u otra operacion. Escribe por ejemplo "det([[1,2],[3,4]])" o "inversa de [[1,2],[3,4]]".';
                return validationBridge ? validationBridge.buildAmbiguousChatMessage(detail) : `La entrada es ambigua. ${detail}`;
            }

            const detail = `Puede corresponder a estos temas: ${topicCandidates.join(", ")}. Especifica mejor la operacion o el objetivo.`;
            return validationBridge ? validationBridge.buildAmbiguousChatMessage(detail) : `La entrada es ambigua. ${detail}`;
        },

        resolveTopic(text, topicCandidates) {
            if (topicCandidates.includes("determinantes")) return "determinantes";
            if (topicCandidates.includes("vectores") && !topicCandidates.includes("sistemas")) return "vectores";
            if (topicCandidates.includes("matrices") && !topicCandidates.includes("sistemas")) return "matrices";
            if (topicCandidates.includes("sistemas")) return "sistemas";
            return topicCandidates[0];
        },

        buildParsedPayload(topic, rawText) {
            if (topic === "sistemas") return this.parseSystemInput(rawText);
            if (topic === "matrices") return this.parseMatrixInput(rawText);
            if (topic === "determinantes") return this.parseDeterminantInput(rawText);
            if (topic === "vectores") return this.parseVectorInput(rawText);
            return null;
        },

        parseSystemInput(text) {
            const parts = text
                .split(/\n|;|,(?=[^0-9])/)
                .map((item) => item.trim())
                .filter((item) => item.includes("="));

            if (parts.length < 2) {
                throw new Error("Para sistemas necesito al menos dos ecuaciones con signo igual.");
            }

            const parsedEquations = parts.map((equation) => this.parseLinearEquation(equation));
            const variableSet = new Set();
            parsedEquations.forEach((item) => Object.keys(item.coeffs).forEach((key) => variableSet.add(key)));

            const variables = ["x", "y", "z"].filter((variable) => variableSet.has(variable));
            if (variables.length < 2 || variables.length > 3) {
                throw new Error("El modulo actual de sistemas admite ejercicios de 2 o 3 variables.");
            }
            if (parsedEquations.length !== variables.length) {
                throw new Error("El numero de ecuaciones debe coincidir con el numero de variables para usar el modulo actual.");
            }

            const augmentedMatrix = parsedEquations.map((equation) => {
                const row = variables.map((variable) => equation.coeffs[variable] || math.fraction(0));
                row.push(math.multiply(-1, equation.constant));
                return row;
            });

            return { variables, augmentedMatrix };
        },

        parseLinearEquation(equation) {
            const normalized = equation
                .replace(/\s+/g, "")
                .replace(/−/g, "-")
                .replace(/âˆ’/g, "-")
                .toLowerCase();
            const pieces = normalized.split("=");
            if (pieces.length !== 2) {
                throw new Error(`No pude interpretar la ecuacion "${equation}".`);
            }

            const left = this.parseLinearExpression(pieces[0]);
            const right = this.parseLinearExpression(pieces[1]);
            const coeffs = {};

            ["x", "y", "z"].forEach((variable) => {
                coeffs[variable] = math.subtract(left.coeffs[variable] || math.fraction(0), right.coeffs[variable] || math.fraction(0));
            });

            return {
                coeffs,
                constant: math.subtract(left.constant, right.constant)
            };
        },

        parseLinearExpression(expression) {
            const safeExpression = expression.startsWith("-") || expression.startsWith("+") ? expression : `+${expression}`;
            const terms = safeExpression.match(/[+\-][^+\-]+/g) || [];
            const coeffs = {};
            let constant = math.fraction(0);

            terms.forEach((term) => {
                const variableMatch = term.match(/([xyz])$/);
                if (variableMatch) {
                    const variable = variableMatch[1];
                    let coefficientText = term.slice(0, -1);
                    if (coefficientText === "+" || coefficientText === "") coefficientText = "1";
                    if (coefficientText === "-") coefficientText = "-1";
                    coeffs[variable] = math.add(coeffs[variable] || math.fraction(0), this.parseScalar(coefficientText));
                } else {
                    constant = math.add(constant, this.parseScalar(term));
                }
            });

            return { coeffs, constant };
        },

        parseMatrixInput(text) {
            const blocks = this.extractBracketBlocks(text).filter((block) => this.blockDimension(block) === 2);
            if (!blocks.length) {
                throw new Error("No encontre matrices en formato valido. Usa por ejemplo [[1,2],[3,4]].");
            }

            const matrices = blocks.map((block) => this.parseNumericBlock(block));
            const operation = this.detectMatrixOperation(text, matrices.length);
            const methodLabel = this.methodLabelForMatrix(operation);
            let scalar = null;

            if (operation === "scalar") {
                const scalarMatch = text.match(/(-?\d+(?:\/\d+)?(?:\.\d+)?)\s*(?:\*|x|por)\s*\[/i);
                if (!scalarMatch) {
                    throw new Error("Para producto por escalar escribe algo como 3 * [[1,2],[3,4]].");
                }
                scalar = this.parseScalar(scalarMatch[1]);
            }

            if ((operation === "add" || operation === "sub" || operation === "mult") && matrices.length < 2) {
                throw new Error("Esta operacion matricial necesita dos matrices. Escribe por ejemplo [[1,2],[3,4]] + [[5,6],[7,8]].");
            }

            return {
                operation,
                methodLabel,
                scalar,
                A: matrices[0],
                B: operation === "add" || operation === "sub" || operation === "mult" ? matrices[1] : null
            };
        },

        detectMatrixOperation(text, matrixCount) {
            const normalized = this.normalizeText(text);
            if (/gauss/.test(normalized) && /inversa/.test(normalized)) return "invA_gauss";
            if (/transpuesta|transpose|\^t/.test(normalized)) return "transA";
            if (/inversa|adjunta|cofactores/.test(normalized)) return "invA";
            if (/escalar/.test(normalized) || /(-?\d+(?:\/\d+)?(?:\.\d+)?)\s*(?:\*|x|por)\s*\[/.test(normalized)) return "scalar";
            if (/suma/.test(normalized) || (matrixCount >= 2 && normalized.includes("+"))) return "add";
            if (/resta/.test(normalized) || (matrixCount >= 2 && /]\s*-\s*\[/.test(normalized.replace(/\s+/g, "")))) return "sub";
            if (/multiplica|producto| por /.test(normalized) || (matrixCount >= 2 && /]\s*(?:\*|x)\s*\[/.test(normalized.replace(/\s+/g, "")))) return "mult";
            throw new Error("No pude identificar la operacion matricial. Indica suma, resta, multiplicacion, transpuesta o inversa.");
        },

        parseDeterminantInput(text) {
            const blocks = this.extractBracketBlocks(text).filter((block) => this.blockDimension(block) === 2);
            if (!blocks.length) {
                throw new Error("Para calcular determinantes necesito una matriz en formato [[a,b],[c,d]].");
            }
            const matrix = this.parseNumericBlock(blocks[0]);
            if (!Array.isArray(matrix[0]) || matrix.length !== matrix[0].length) {
                throw new Error("El determinante solo esta definido para matrices cuadradas.");
            }
            return matrix;
        },

        parseVectorInput(text) {
            const blocks = this.extractBracketBlocks(text).filter((block) => this.blockDimension(block) === 1);
            if (!blocks.length) {
                throw new Error("No encontre vectores en formato valido. Usa por ejemplo [1,2] o [1,2,3].");
            }

            const vectors = blocks.map((block) => this.parseNumericBlock(block));
            const operation = this.detectVectorOperation(text, vectors.length);
            const dimension = vectors[0].length;

            if (operation !== "mag_u" && vectors.length < 2) {
                throw new Error("Esta operacion vectorial necesita dos vectores. Escribe por ejemplo [1,2] y [3,4].");
            }

            if (![2, 3].includes(dimension)) {
                throw new Error("El modulo de vectores admite vectores de dimension 2 o 3.");
            }

            if (vectors.some((vector) => vector.length !== dimension)) {
                throw new Error("Todos los vectores deben tener la misma dimension.");
            }

            return {
                operation,
                methodLabel: this.methodLabelForVector(operation),
                dimension,
                u: vectors[0],
                v: operation === "mag_u" ? null : vectors[1]
            };
        },

        detectVectorOperation(text, vectorCount) {
            const normalized = this.normalizeText(text);
            if (/producto cruz|cruz|cross/.test(normalized)) return "cross";
            if (/producto punto|punto|dot/.test(normalized)) return "dot";
            if (/angulo/.test(normalized)) return "angle";
            if (/proyeccion|proyecta/.test(normalized)) return "proj";
            if (/magnitud|norma/.test(normalized)) return "mag_u";
            if (/resta/.test(normalized) || (vectorCount >= 2 && normalized.includes("-"))) return "sub";
            if (/suma/.test(normalized) || (vectorCount >= 2 && normalized.includes("+"))) return "add";
            if (vectorCount === 1) return "mag_u";
            throw new Error("No pude identificar la operacion vectorial. Indica suma, resta, magnitud, producto punto, angulo, cruz o proyeccion.");
        },

        parseNumericBlock(block) {
            const normalized = block.replace(/\(/g, "[").replace(/\)/g, "]");
            let parsed;

            try {
                parsed = math.evaluate(normalized);
            } catch (error) {
                throw new Error(`No pude interpretar ${block}. Usa valores numericos separados por comas.`);
            }

            const value = parsed && typeof parsed.valueOf === "function" ? parsed.valueOf() : parsed;
            if (!Array.isArray(value)) {
                throw new Error(`La expresion ${block} no representa un arreglo valido.`);
            }

            if (!value.length) {
                throw new Error(`La expresion ${block} esta vacia. Completa todas las entradas antes de enviarla.`);
            }

            if (Array.isArray(value[0])) {
                const expectedLength = value[0].length;
                if (!expectedLength) {
                    throw new Error(`La expresion ${block} no contiene columnas validas.`);
                }
                const isRectangular = value.every((row) => Array.isArray(row) && row.length === expectedLength);
                if (!isRectangular) {
                    throw new Error(`La matriz ${block} no es rectangular. Todas las filas deben tener el mismo numero de entradas.`);
                }
            }

            return this.convertNestedArrayToFractions(value);
        },

        convertNestedArrayToFractions(value) {
            if (Array.isArray(value[0])) {
                return value.map((row) => row.map((cell) => math.fraction(cell)));
            }
            return value.map((cell) => math.fraction(cell));
        },

        extractBracketBlocks(text) {
            const blocks = [];
            let start = -1;
            let depth = 0;

            for (let index = 0; index < text.length; index += 1) {
                const char = text[index];
                if (char === "[") {
                    if (depth === 0) start = index;
                    depth += 1;
                } else if (char === "]") {
                    depth -= 1;
                    if (depth === 0 && start !== -1) {
                        blocks.push(text.slice(start, index + 1));
                        start = -1;
                    }
                }
            }

            return blocks;
        },

        blockDimension(block) {
            try {
                const parsed = math.evaluate(block);
                const value = parsed && typeof parsed.valueOf === "function" ? parsed.valueOf() : parsed;
                return Array.isArray(value[0]) ? 2 : 1;
            } catch (error) {
                return 0;
            }
        },

        parseScalar(value) {
            try {
                return math.fraction(value);
            } catch (error) {
                throw new Error(`No pude interpretar el valor numerico "${value}".`);
            }
        },

        methodForDeterminant(size) {
            if (size === 2) return "Formula directa para matriz 2x2.";
            if (size === 3) return "Regla de Sarrus para matriz 3x3.";
            return "Expansion por cofactores en una fila de la matriz 4x4.";
        },

        methodLabelForMatrix(operation) {
            const labels = {
                add: "Suma elemento a elemento entre matrices de la misma dimension.",
                sub: "Resta elemento a elemento entre matrices de la misma dimension.",
                mult: "Producto matricial fila por columna.",
                scalar: "Producto por escalar distribuyendo el factor en cada entrada.",
                transA: "Transpuesta intercambiando filas por columnas.",
                invA: "Inversa por determinante, cofactores, adjunta y division final.",
                invA_gauss: "Inversa por Gauss-Jordan sobre la matriz aumentada [A | I]."
            };
            return labels[operation];
        },

        methodLabelForVector(operation) {
            const labels = {
                add: "Suma componente por componente.",
                sub: "Resta componente por componente.",
                dot: "Producto punto multiplicando componentes homologos y sumando.",
                mag_u: "Magnitud aplicando raiz cuadrada a la suma de cuadrados.",
                angle: "Angulo usando producto punto y magnitudes.",
                cross: "Producto cruz calculando cada componente del vector perpendicular.",
                proj: "Proyeccion usando ((u . v) / ||v||^2) v."
            };
            return labels[operation];
        },

        intentLabel(intent) {
            const labels = {
                concepto: "Solicita explicacion teorica.",
                resolver: "Solicita orientacion para resolver en la calculadora.",
                verificar: "Solicita orientacion o contraste conceptual del procedimiento.",
                explicar_error: "Solicita localizar y aclarar un error.",
                ejemplo: "Solicita preguntas relacionadas para seguir estudiando."
            };
            return labels[intent] || "Solicita ayuda matematica.";
        }
    };

    /**
     * Adaptador entre el asistente y los modulos reales definidos en app.js.
     * Carga datos en la UI existente, dispara el modulo correcto y devuelve
     * el HTML pedagogico ya calculado por la aplicacion.
     */
    const AssistantBridge = {
        openTab(tabId) {
            document.querySelectorAll(".tab-btn").forEach((button) => {
                button.classList.toggle("active", button.getAttribute("data-tab") === tabId);
            });
            document.querySelectorAll(".tab-content").forEach((content) => {
                content.classList.toggle("active", content.id === tabId);
            });
        },

        toInputMatrix(matrix) {
            return matrix.map((row) => row.map((value) => this.formatValue(value)));
        },

        toInputVector(vector) {
            return vector.map((value) => this.formatValue(value));
        },

        formatValue(value) {
            if (typeof formatMathVal === "function") return formatMathVal(value);
            return String(value);
        },

        runSystem(parsed) {
            const matrixData = this.toInputMatrix(parsed.augmentedMatrix);
            this.openTab("sistemas");
            document.getElementById("sys-size").value = String(parsed.variables.length);
            createMatrixInput(parsed.variables.length, parsed.variables.length + 1, "sys-inputs", true);
            setMatrixValues("sys-inputs", matrixData);
            solveSystem();
            return document.getElementById("sys-steps").innerHTML;
        },

        runMatrix(parsed) {
            this.openTab("matrices");
            document.getElementById("mat-op").value = parsed.operation;
            document.getElementById("mat-op").dispatchEvent(new Event("change"));

            document.getElementById("matA-rows").value = parsed.A.length;
            document.getElementById("matA-cols").value = parsed.A[0].length;
            createMatrixInput(parsed.A.length, parsed.A[0].length, "matA-inputs");
            setMatrixValues("matA-inputs", this.toInputMatrix(parsed.A));

            if (parsed.B) {
                document.getElementById("matB-rows").value = parsed.B.length;
                document.getElementById("matB-cols").value = parsed.B[0].length;
                createMatrixInput(parsed.B.length, parsed.B[0].length, "matB-inputs");
                setMatrixValues("matB-inputs", this.toInputMatrix(parsed.B));
            }

            if (parsed.scalar !== null) {
                document.getElementById("mat-scalar-val").value = this.formatValue(parsed.scalar);
            }

            calcMatrix();
            return document.getElementById("mat-steps").innerHTML;
        },

        runDeterminant(matrix) {
            this.openTab("determinantes");
            document.getElementById("det-size").value = String(matrix.length);
            createMatrixInput(matrix.length, matrix.length, "det-inputs");
            setMatrixValues("det-inputs", this.toInputMatrix(matrix));
            calcDet();
            return document.getElementById("det-steps").innerHTML;
        },

        runVector(parsed) {
            this.openTab("vectores");
            document.getElementById("vec-dim").value = String(parsed.dimension);
            createMatrixInput(1, parsed.dimension, "vecA-inputs");
            setMatrixValues("vecA-inputs", [this.toInputVector(parsed.u)]);

            document.getElementById("vec-op").value = parsed.operation;
            document.getElementById("vec-op").dispatchEvent(new Event("change"));

            if (parsed.v) {
                createMatrixInput(1, parsed.dimension, "vecB-inputs");
                setMatrixValues("vecB-inputs", [this.toInputVector(parsed.v)]);
            }

            calcVector();
            return document.getElementById("vec-steps").innerHTML;
        }
    };

    /**
     * Encapsula la generacion de HTML del chat.
     * Mantiene el contenido conceptual previo y lo combina con el flujo nuevo.
     */
    const AssistantRenderer = {
        TYPING_SPEED: 32,

        renderBlockBody(bodyHtml) {
            if (!bodyHtml || !String(bodyHtml).trim()) return "";
            return `<div class="assistant-block-body">${bodyHtml}</div>`;
        },

        renderSection(kind, title, bodyHtml) {
            if (!title || !String(title).trim()) return "";
            const normalizedKind = kind || "explanation";
            const badgeKind = normalizedKind === "explanation" ? "procedure" : normalizedKind;
            const contentHtml = this.renderBlockBody(bodyHtml);
            if (!contentHtml) return "";

            return `
                <section class="assistant-block assistant-block--${normalizedKind}" data-chat-block="${normalizedKind}">
                    <div class="assistant-block-header">
                        <span class="math-stage-badge math-stage-badge--${badgeKind}">${title}</span>
                    </div>
                    ${contentHtml}
                </section>
            `;
        },

        renderOptionalSection(kind, title, bodyHtml) {
            return bodyHtml && String(bodyHtml).trim() ? this.renderSection(kind, title, bodyHtml) : "";
        },

        createMessageNode(role, html) {
            const wrapper = document.createElement("article");
            wrapper.className = `chat-message ${role === "user" ? "user" : "bot"}`;
            wrapper.setAttribute("data-role", role);

            const content = document.createElement("div");
            content.className = "chat-message-content";
            content.appendChild(this.createMessageFragment(html));
            wrapper.appendChild(content);
            return wrapper;
        },

        createMessageFragment(html) {
            const template = document.createElement("template");
            template.innerHTML = String(html || "").trim();

            const fragment = document.createDocumentFragment();
            if (!template.content.childNodes.length) {
                const fallback = document.createElement("p");
                fallback.textContent = "";
                fragment.appendChild(fallback);
                return fragment;
            }

            fragment.appendChild(template.content.cloneNode(true));
            return fragment;
        },

        postProcessMessage(app, wrapper) {
            this.removeEmptyBlocks(wrapper);
            this.normalizeDynamicContainers(wrapper);
            this.prepareScrollableMath(wrapper);
            this.applySafeTextWrapping(wrapper);

            const finalizeScroll = () => {
                this.scrollTutorToBottom(app);
            };

            if (typeof window.renderDynamicMath === "function") {
                Promise.resolve(window.renderDynamicMath(wrapper)).finally(() => {
                    requestAnimationFrame(finalizeScroll);
                });
                return;
            }

            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([wrapper])
                    .catch((error) => console.log("MathJax error:", error))
                    .finally(() => requestAnimationFrame(finalizeScroll));
                return;
            }

            requestAnimationFrame(finalizeScroll);
        },

        scrollTutorToBottom(app) {
            if (!app || !app.thread) return;
            app.thread.scrollTop = app.thread.scrollHeight;
            if (app.body) app.body.scrollLeft = 0;
        },

        removeEmptyBlocks(root) {
            root.querySelectorAll(".assistant-block, .assistant-module-output, .assistant-inline-list").forEach((element) => {
                const compactText = (element.textContent || "").replace(/\s+/g, "");
                const hasVisibleContent = element.querySelector("img, svg, mjx-container, .rendered-matrix, .math-step, .latex-container");
                if (!compactText && !hasVisibleContent) {
                    element.remove();
                }
            });
        },

        normalizeDynamicContainers(root) {
            root.querySelectorAll(".assistant-module-output").forEach((element) => {
                element.setAttribute("data-dynamic-block", "module-output");
            });

            root.querySelectorAll(".latex-container, .rendered-matrix, .math-step").forEach((element) => {
                element.classList.add("chat-scroll-safe");
            });

            root.querySelectorAll(".assistant-block h4, .assistant-block p, .assistant-inline-list li, .math-stage-badge").forEach((element) => {
                element.classList.add("chat-text-safe");
            });
        },

        prepareScrollableMath(root) {
            root.querySelectorAll(".latex-container, .rendered-matrix, mjx-container[display='true']").forEach((element) => {
                element.style.maxWidth = "100%";
                element.style.overflowX = "auto";
                element.style.overflowY = "hidden";
            });
        },

        applySafeTextWrapping(root) {
            root.querySelectorAll(".chat-text-safe, code, pre, .chat-chip").forEach((element) => {
                element.style.overflowWrap = "anywhere";
                element.style.wordBreak = "break-word";
                element.style.whiteSpace = element.tagName === "PRE" ? "pre-wrap" : "normal";
                element.style.maxWidth = "100%";
            });
        },

        renderShell(app) {
            app.body.innerHTML = `
                <div id="chat-thread" class="chat-thread"></div>
                <section id="chat-quick-actions-shell" class="chat-quick-actions-shell">
                    <div class="chat-quick-actions-header">
                        <span class="chat-quick-actions-label">Sugerencias del tema</span>
                        <button type="button" id="chat-quick-actions-toggle" class="chat-quick-actions-toggle" aria-expanded="true">
                            Ocultar sugerencias
                        </button>
                    </div>
                    <div id="chat-quick-actions" class="chat-quick-actions"></div>
                </section>
            `;

            app.footer.innerHTML = `
                <form id="chat-form" class="chat-form">
                    <label class="sr-only" for="chat-input">Escribe tu pregunta de álgebra lineal</label>
                    <textarea
                        id="chat-input"
                        class="chat-input"
                        rows="3"
                        placeholder="Pregunta un concepto o pide orientación. Ejemplo: ¿Qué es un determinante? o ¿Qué módulo uso para este sistema?"
                    ></textarea>
                    <div class="chat-form-actions">
                        <span class="chat-hint">El chat explica teoría, interpreta resultados y te guía al módulo correcto. No resuelve ejercicios completos aquí.</span>
                        <button type="submit" class="chat-send-btn">Enviar</button>
                    </div>
                </form>
            `;

            app.thread = document.getElementById("chat-thread");
            app.quickActionsShell = document.getElementById("chat-quick-actions-shell");
            app.quickActions = document.getElementById("chat-quick-actions");
            app.quickActionsToggle = document.getElementById("chat-quick-actions-toggle");
            app.form = document.getElementById("chat-form");
            app.input = document.getElementById("chat-input");
        },

        renderWelcome(app) {
            app.thread.innerHTML = "";
            this.addMessage(app, "bot", `
                <div class="assistant-block">
                    <h4>Tutor conceptual AlgeMat</h4>
                    <p>Estoy para explicar teoria, aclarar dudas, diferenciar conceptos, interpretar resultados y orientarte dentro de la app.</p>
                    <p>Si necesitas una resolucion completa paso a paso, te indicare el modulo correcto de la calculadora.</p>
                </div>
            `);
            this.renderQuickActions(app, AssistantContent.getSuggestions("conceptos"));
        },

        renderQuickActions(app, items) {
            const normalizedItems = items.map((item) => AssistantContent.normalizeSuggestion(item));

            app.quickActions.innerHTML = normalizedItems.map((item) => `
                <button
                    type="button"
                    class="chat-chip"
                    data-prompt="${this.escapeAttribute(item.prompt)}"
                    data-topic="${this.escapeAttribute(item.topic)}"
                    data-intent="${this.escapeAttribute(item.intent)}"
                    data-faq-id="${this.escapeAttribute(item.faqId || "")}"
                    data-id="${this.escapeAttribute(item.id)}"
                >${this.escapeHtml(item.text)}</button>
            `).join("");

            app.quickActions.querySelectorAll(".chat-chip").forEach((button) => {
                button.addEventListener("click", () => {
                    const prompt = button.getAttribute("data-prompt");
                    app.handleSuggestionSelection({
                        id: button.getAttribute("data-id"),
                        topic: button.getAttribute("data-topic"),
                        intent: button.getAttribute("data-intent"),
                        faqId: button.getAttribute("data-faq-id"),
                        text: prompt,
                        prompt
                    });
                });
            });

            if (app.quickActionsShell) {
                app.quickActionsShell.classList.toggle("is-empty", !normalizedItems.length);
            }
        },

        renderConceptResponse(topic) {
            const concept = AssistantContent.getConcept(topic);
            const moduleGuidance = AssistantContent.getModuleGuidance(topic);

            return `
                <div class="assistant-structured">
                    ${this.renderSection("topic", "Tema", `<p>${concept.title}</p>`)}
                    ${this.renderSection("request", "Objetivo", `<p>Explicación conceptual sin resolver más de lo necesario.</p>`)}
                    ${this.renderSection("explanation", "Explicación o resolución", `
                        <p><strong>Definición:</strong> ${concept.definition}</p>
                        <p><strong>Explicación sencilla:</strong> ${concept.simple}</p>
                        <p><strong>Método o idea clave:</strong> ${concept.method}</p>
                        <p><strong>Cómo reconocerlo:</strong> ${concept.recognition}</p>
                        <p><strong>Error común:</strong> ${concept.pitfall}</p>
                    `)}
                    ${this.renderSection("verification", "Verificación", `<p>No aplica una verificación numérica porque aquí se explicó teoría, no un cálculo puntual.</p>`)}
                    ${this.renderSection("final", "Sugerencia", `<p>${moduleGuidance}</p><p>Puedo ayudarte a entender el concepto y orientarte al apartado correcto.</p>`)}
                </div>
            `;
        },

        renderFaqResponse(entry) {
            const topicLabel = AssistantContent.getTopicLabel(entry.topic);
            const closing = AssistantContent.getClosing(entry.intent, entry.topic);

            return `
                <div class="assistant-structured">
                    ${this.renderSection("topic", "Tema", `<p>${topicLabel}</p>`)}
                    ${this.renderSection("request", "Objetivo", `<p>Respuesta conceptual y orientada a comprensión del tema.</p>`)}
                    ${this.renderSection("explanation", "Explicación o resolución", `
                        <p><strong>Pregunta:</strong> ${entry.question}</p>
                        <p><strong>Respuesta:</strong> ${entry.answer}</p>
                    `)}
                    ${this.renderSection("verification", "Verificación", `<p>El tutor respondió desde la interpretación conceptual y no recalculó ningún procedimiento.</p>`)}
                    ${this.renderSection("final", "Sugerencia", `<p>${closing}</p>`)}
                </div>
            `;
        },

        renderAcademicSupportResponse(topic) {
            const concept = AssistantContent.getConcept(topic);
            const topicLabel = AssistantContent.getTopicLabel(topic);
            const moduleGuidance = AssistantContent.getModuleGuidance(topic);

            return `
                <div class="assistant-structured">
                    ${this.renderSection("topic", "Tema", `<p>${topicLabel}</p>`)}
                    ${this.renderSection("request", "Objetivo", `<p>Apoyo conceptual, interpretación y orientación académica.</p>`)}
                    ${this.renderSection("explanation", "Explicación o resolución", `
                        <p><strong>Idea clave:</strong> ${concept.simple}</p>
                        <p><strong>Cómo reconocerlo:</strong> ${concept.recognition}</p>
                        <p><strong>Error común:</strong> ${concept.pitfall}</p>
                        <p><strong>Orientación:</strong> ${moduleGuidance}</p>
                    `)}
                    ${this.renderSection("verification", "Verificación", `<p>El tutor mantuvo el enfoque conceptual y no ejecutó cálculos ni procedimientos completos.</p>`)}
                    ${this.renderSection("final", "Sugerencia", `<p>Puedes seguir con una pregunta de definición, interpretación, diferencias o errores comunes dentro de este mismo tema.</p>`)}
                </div>
            `;
        },

        renderExampleResponse(topic, prompts) {
            return `
                <div class="assistant-structured">
                    ${this.renderSection("topic", "Tema", `<p>${AssistantContent.getTopicLabel(topic)}</p>`)}
                    ${this.renderSection("request", "Objetivo", `<p>Solicita un ejemplo guiado para practicar.</p>`)}
                    ${this.renderSection("explanation", "Explicación o resolución", `
                        <p>Te dejo preguntas conceptuales relacionadas para seguir estudiando este tema:</p>
                        <ul class="assistant-inline-list">
                            ${prompts.map((item) => `<li>${this.escapeHtml(item.text || item.prompt || item)}</li>`).join("")}
                        </ul>
                    `)}
                    ${this.renderSection("verification", "Verificación", `<p>Estas sugerencias mantienen el enfoque conceptual del tutor y no sustituyen a la calculadora principal.</p>`)}
                    ${this.renderSection("final", "Sugerencia", `<p>Toca una sugerencia para abrir la siguiente explicación relacionada.</p>`)}
                </div>
            `;
        },

        wrapModuleResponse(payload) {
            return `
                <div class="assistant-structured">
                    ${this.renderSection("topic", "Tema", `<p>${payload.topic}</p>`)}
                    ${this.renderSection("request", "Objetivo", `<p>${payload.desire}</p>`)}
                    ${this.renderSection("explanation", "Explicación o resolución", `<p><strong>Método aplicado:</strong> ${payload.method}</p><div class="assistant-module-output">${payload.detailHtml}</div>`)}
                    ${this.renderOptionalSection("verification", "Verificación", payload.verification ? `<p>${payload.verification}</p>` : "")}
                    ${this.renderOptionalSection("final", "Sugerencia", payload.suggestion ? `<p>${payload.suggestion}</p>` : "")}
                </div>
            `;
        },

        renderErrorResponse(message) {
            return `
                <div class="assistant-structured">
                    ${this.renderSection("topic", "Tema", `<p>No pude ejecutar la solicitud tal como está escrita.</p>`)}
                    ${this.renderSection("request", "Objetivo", `<p>Interpretar una consulta conceptual y orientarte dentro del tema correcto.</p>`)}
                    <div class="assistant-block assistant-block--verification assistant-error-block">
                        <div class="assistant-block-header">
                            <span class="math-stage-badge math-stage-badge--verification">Explicación o resolución</span>
                        </div>
                        <p>${this.escapeHtml(message)}</p>
                        <p>Puedes reescribirla con preguntas conceptuales como estas:</p>
                        <ul class="assistant-inline-list">
                            <li><code>¿Qué significa que un sistema tenga solución?</code></li>
                            <li><code>¿Qué relación hay entre determinante e inversa?</code></li>
                            <li><code>¿Cuándo se puede multiplicar una matriz por otra?</code></li>
                            <li><code>¿Para qué sirve el producto punto?</code></li>
                        </ul>
                    </div>
                    ${this.renderSection("verification", "Verificación", `<p>No se ejecutó ningún módulo de cálculo porque el tutor está enfocado en teoría y orientación.</p>`)}
                    ${this.renderSection("final", "Sugerencia", `<p>Si necesitas un procedimiento completo, ve al módulo correspondiente de la calculadora.</p><p>Puedo ayudarte a entender el concepto y orientarte al apartado correcto.</p>`)}
                </div>
            `;
        },

        renderTutorTextResponse(payload) {
            const topicLine = payload.topic ? `<p><strong>Tema:</strong> ${this.escapeHtml(payload.topic)}</p>` : "";
            const moduleLine = payload.module ? `<p><strong>Modulo sugerido:</strong> ${this.escapeHtml(AssistantContent.getTopicLabel(payload.module))}</p>` : "";
            const messageHtml = payload.messageHtml || `<p class="assistant-typed-target" data-typed-text="${this.escapeAttribute(payload.message || "")}"></p>`;
            const followUpHtml = payload.followUp ? `<p class="assistant-typed-target" data-typed-text="${this.escapeAttribute(payload.followUp)}"></p>` : "";

            return `
                <div class="assistant-structured">
                    ${this.renderSection("explanation", "Respuesta", `${messageHtml}${topicLine}${moduleLine}`)}
                    ${this.renderOptionalSection("final", "Sugerencia", followUpHtml)}
                </div>
            `;
        },

        addMessage(app, role, html) {
            const wrapper = this.createMessageNode(role, html);
            app.thread.appendChild(wrapper);
            this.fillTypedTargets(wrapper);
            this.postProcessMessage(app, wrapper);
            return wrapper;
        },

        async replaceMessage(app, wrapper, html, options = {}) {
            if (!wrapper) return null;
            const content = wrapper.querySelector(".chat-message-content");
            if (!content) return wrapper;

            this.finishTyping(app);
            content.innerHTML = "";
            content.appendChild(this.createMessageFragment(html));
            const shouldAnimate = wrapper.getAttribute("data-role") === "bot" && options.animateTyping;

            if (!shouldAnimate) {
                this.fillTypedTargets(wrapper);
                this.postProcessMessage(app, wrapper);
                return wrapper;
            }

            this.postProcessMessage(app, wrapper);
            await this.animateTutorMessage(app, wrapper, options.typingOptions || {});
            return wrapper;
        },

        fillTypedTargets(root) {
            root.querySelectorAll(".assistant-typed-target").forEach((element) => {
                const finalText = element.getAttribute("data-typed-text") || "";
                element.innerHTML = this.formatTutorText(finalText);
            });
        },

        async animateTutorMessage(app, wrapper, options = {}) {
            const targets = Array.from(wrapper.querySelectorAll(".assistant-typed-target"));
            if (!targets.length) {
                return;
            }

            const controller = {
                completed: false
            };

            controller.finish = () => {
                if (controller.completed) return;
                controller.completed = true;
                targets.forEach((element) => {
                    const finalText = element.getAttribute("data-typed-text") || "";
                    element.innerHTML = this.formatTutorText(finalText);
                });
                this.scrollTutorToBottom(app);
            };

            app.activeTypingController = controller;

            for (const element of targets) {
                const finalText = element.getAttribute("data-typed-text") || "";
                await this.typeTutorMessage(element, finalText, {
                    app,
                    controller,
                    speed: options.speed
                });

                if (controller.completed) {
                    break;
                }
            }

            controller.finish();
            if (app.activeTypingController === controller) {
                app.activeTypingController = null;
            }
        },

        async typeTutorMessage(element, text, options = {}) {
            const app = options.app || null;
            const controller = options.controller || null;
            const speed = Number(options.speed) || this.TYPING_SPEED;
            const tokens = String(text || "").split(/(\s+)/).filter((token) => token.length > 0);
            let partialText = "";

            element.innerHTML = "";

            for (const token of tokens) {
                if (controller && controller.completed) {
                    return;
                }

                partialText += token;
                element.innerHTML = this.formatTutorText(partialText);
                this.scrollTutorToBottom(app);
                await new Promise((resolve) => window.setTimeout(resolve, speed));
            }
        },

        finishTyping(app) {
            if (app && app.activeTypingController && typeof app.activeTypingController.finish === "function") {
                app.activeTypingController.finish();
                app.activeTypingController = null;
            }
        },

        escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },

        formatTutorText(text) {
            return this.escapeHtml(String(text || "")).replace(/\r?\n/g, "<br>");
        },

        escapeAttribute(text) {
            return this.escapeHtml(text).replace(/"/g, "&quot;");
        }
    };

    /**
     * Controlador principal del asistente.
     * Orquesta UI, parser, ejecucion del modulo correcto y render del chat.
     */
    const AssistantApp = {
        init() {
            this.chat = document.getElementById("mini-chat");
            this.body = document.getElementById("chat-body");
            this.footer = this.chat ? this.chat.querySelector(".mini-chat-footer") : null;
            if (!this.chat || !this.body || !this.footer) return;
            this.isLoading = false;
            this.loadingMessage = null;
            this.activeTypingController = null;
            this.suggestionsVisible = true;
            this.tutorApiEndpoint = "http://127.0.0.1:3000/api/tutor";

            AssistantRenderer.renderShell(this);
            this.bindEvents();
            this.updateQuickActionsVisibility();
            AssistantRenderer.renderWelcome(this);
        },

        setLoadingState(isLoading, loadingMessage = null) {
            this.isLoading = isLoading;
            this.loadingMessage = loadingMessage;

            if (this.input) {
                this.input.disabled = isLoading;
            }

            const sendButton = this.form ? this.form.querySelector(".chat-send-btn") : null;
            if (sendButton) {
                sendButton.disabled = isLoading;
                sendButton.textContent = isLoading ? "Procesando..." : "Enviar";
            }
        },

        /**
         * Conecta eventos de formulario y accesibilidad sin alterar la UI actual.
         */
        bindEvents() {
            this.form.addEventListener("submit", (event) => {
                event.preventDefault();
                const text = this.input.value.trim();
                if (!text) return;
                this.input.value = "";
                this.handleTutorQuery(text, "manual");
            });

            this.input.addEventListener("keydown", (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    this.form.requestSubmit();
                }
            });

            if (this.quickActionsToggle) {
                this.quickActionsToggle.addEventListener("click", () => {
                    this.suggestionsVisible = !this.suggestionsVisible;
                    this.updateQuickActionsVisibility();
                });
            }

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape" && this.chat) {
                    this.chat.classList.remove("active");
                }
            });
        },

        handleSuggestionSelection(suggestion) {
            if (!suggestion || !suggestion.prompt) return;
            this.input.value = suggestion.prompt;
            this.input.focus();
            this.handleTutorQuery(suggestion.prompt, "suggestion", {
                suggestionId: suggestion.id || null,
                faqId: suggestion.faqId || null,
                forcedTopic: suggestion.topic || null,
                forcedIntent: suggestion.intent || "concepto"
            });
            this.input.value = "";
        },

        /**
         * Punto de entrada del chat.
         * Registra el mensaje del usuario, lo interpreta y renderiza la respuesta.
         */
        handleUserMessage(text, options = {}) {
            this.handleTutorQuery(text, options.source || "manual", options);
        },

        handleTutorQuery(questionText, source = "manual", extraOptions = {}) {
            const text = String(questionText || "").trim();
            if (!text || this.isLoading) return;
            AssistantRenderer.finishTyping(this);

            const options = {
                ...extraOptions,
                source
            };

            AssistantRenderer.addMessage(this, "user", `<p>${AssistantRenderer.escapeHtml(text)}</p>`);
            const loadingMessage = AssistantRenderer.addMessage(
                this,
                "bot",
                `<p class="chat-loading-text">Procesando respuesta...</p>`
            );
            loadingMessage.classList.add("chat-message--loading");
            this.setLoadingState(true, loadingMessage);

            window.setTimeout(() => {
                Promise.resolve()
                    .then(async () => {
                        const request = this.buildRequest(text, options);
                        const response = await this.resolveTutorResponse(request);
                        loadingMessage.classList.remove("chat-message--loading");
                        this.setLoadingState(false, null);
                        await AssistantRenderer.replaceMessage(this, loadingMessage, response.html, {
                            animateTyping: true,
                            typingOptions: {
                                speed: AssistantRenderer.TYPING_SPEED
                            }
                        });
                        AssistantRenderer.renderQuickActions(
                            this,
                            response.suggestions || this.suggestionsForTopic(request.topic, text)
                        );
                    })
                    .catch((error) => {
                        loadingMessage.classList.remove("chat-message--loading");
                        this.setLoadingState(false, null);
                        AssistantRenderer.replaceMessage(this, loadingMessage, AssistantRenderer.renderErrorResponse(error.message));
                        AssistantRenderer.renderQuickActions(this, AssistantContent.getSuggestions("conceptos"));
                    })
                    .finally(() => {
                        this.setLoadingState(false, null);
                    });
            }, 0);
        },

        submitQuestion(text, options = {}) {
            return this.handleTutorQuery(text, options.source || "manual", options);
        },

        updateQuickActionsVisibility() {
            if (!this.quickActionsShell || !this.quickActionsToggle) return;

            this.quickActionsShell.classList.toggle("is-collapsed", !this.suggestionsVisible);
            this.quickActionsToggle.textContent = this.suggestionsVisible ? "Ocultar sugerencias" : "Mostrar sugerencias";
            this.quickActionsToggle.setAttribute("aria-expanded", String(this.suggestionsVisible));
        },

        /**
         * Convierte texto libre en una solicitud estandar del asistente.
         */
        buildRequest(text, options = {}) {
            const currentModule = options.currentModule || AssistantParser.getCurrentModule();
            const normalized = AssistantParser.normalizeText(text);
            const conversationalIntent = AssistantParser.detectIntent(text, currentModule);
            const conceptEntry = AssistantParser.findConcept(text, currentModule);
            const faqMatch = AssistantContent.findFaqMatch(text, currentModule) || AssistantContent.findFaqMatch(text);
            const topicFromIntent =
                (conceptEntry ? conceptEntry.topic : null) ||
                (faqMatch ? faqMatch.topic : null) ||
                AssistantParser.detectConceptTopic(normalized) ||
                currentModule;
            const request = {
                raw: text,
                normalized,
                currentModule,
                intent: conversationalIntent,
                topic: topicFromIntent,
                topicCandidates: topicFromIntent ? [topicFromIntent] : [],
                parsedData: null,
                status: "ok",
                message: "",
                conceptEntry,
                faqMatch,
                source: options.source || "user",
                suggestionId: options.suggestionId || null
            };
            const faqFromOption = AssistantContent.findFaqById(options.faqId);

            if (faqFromOption) {
                request.intent = "concepto";
                request.topic = faqFromOption.topic;
                request.topicCandidates = [faqFromOption.topic];
                request.parsedData = null;
                request.status = "ok";
                request.message = "";
                request.faqMatch = faqFromOption;
            }

            if (options.forcedTopic) {
                request.topic = options.forcedTopic;
                request.topicCandidates = [options.forcedTopic];
                if (request.status === "unknown") {
                    request.status = "ok";
                    request.message = "";
                }
            }

            if (options.forcedIntent) {
                request.intent = options.forcedIntent;
            }

            return request;
        },

        generateTutorResponse(message, context = {}) {
            const request = this.buildRequest(message, context);
            return this.processRequest(request);
        },

        async resolveTutorResponse(request) {
            const fallbackResponse = this.processRequest(request);

            if (!this.shouldUseGemini(request)) {
                return fallbackResponse;
            }

            const remoteReply = await this.requestTutorReply(request.raw);
            if (!remoteReply) {
                return fallbackResponse;
            }

            return {
                html: AssistantRenderer.renderTutorTextResponse({
                    message: remoteReply
                }),
                suggestions: fallbackResponse.suggestions
            };
        },

        shouldUseGemini(request) {
            return ["saludo", "agradecimiento", "despedida", "usuario_perdido", "incoherencia", "ayuda_app", "concepto", "fuera_tema"].includes(request.intent);
        },

        async requestTutorReply(message) {
            try {
                const response = await fetch(this.tutorApiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message
                    })
                });

                if (!response.ok) {
                    return "";
                }

                const data = await response.json();
                if (!data || data.ok !== true || typeof data.reply !== "string") {
                    return "";
                }

                return this.cleanTutorReply(data.reply);
            } catch (error) {
                return "";
            }
        },

        cleanTutorReply(text) {
            return String(text || "")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/^[ \t]*\*[ \t]+/gm, "")
                .replace(/[ \t]+\n/g, "\n")
                .replace(/^\s*(respuesta|explicacion)\s*:?[ \t]*\n?/i, "")
                .replace(/\n{3,}/g, "\n\n")
                .replace(/[^\S\r\n]{2,}/g, " ")
                .trim();
        },

        updateTutorSuggestions(suggestions) {
            AssistantRenderer.renderQuickActions(this, suggestions || AssistantContent.getSuggestions("conceptos"));
        },

        /**
         * Decide si responder con teoria, apoyo conceptual u orientación al módulo correcto.
         */
        processRequest(request) {
            const topic = request.topic || request.currentModule || null;

            if (request.intent === "saludo") {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getBaseResponse("saludo"),
                        followUp: request.currentModule
                            ? `Si quieres, puedo ayudarte con ${AssistantContent.getTopicLabel(request.currentModule).toLowerCase()}.`
                            : "Puedes preguntarme por sistemas, matrices, determinantes o vectores."
                    }),
                    suggestions: this.suggestionsForTopic(request.currentModule || "conceptos", request.raw)
                };
            }

            if (request.intent === "agradecimiento") {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getBaseResponse("agradecimiento"),
                        followUp: "Si quieres, seguimos con otra duda conceptual o con la orientacion del modulo."
                    }),
                    suggestions: this.suggestionsForTopic(request.currentModule || "conceptos", request.raw)
                };
            }

            if (request.intent === "despedida") {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getBaseResponse("despedida")
                    }),
                    suggestions: this.suggestionsForTopic(request.currentModule || "conceptos", request.raw)
                };
            }

            if (request.intent === "usuario_perdido") {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getBaseResponse("usuario_perdido"),
                        module: request.currentModule,
                        followUp: AssistantContent.getModuleHelp(request.currentModule)
                    }),
                    suggestions: this.suggestionsForTopic(request.currentModule || "conceptos", request.raw)
                };
            }

            if (request.intent === "incoherencia") {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getBaseResponse("incoherencia"),
                        module: request.currentModule
                    }),
                    suggestions: this.suggestionsForTopic(request.currentModule || "conceptos", request.raw)
                };
            }

            if (request.intent === "ayuda_app") {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getModuleHelp(request.currentModule),
                        module: request.currentModule,
                        followUp: request.currentModule
                            ? "Si quieres, tambien puedo explicarte el concepto detras de este modulo."
                            : "Puedes elegir un modulo y luego preguntarme por el concepto o el metodo."
                    }),
                    suggestions: this.suggestionsForTopic(request.currentModule || "conceptos", request.raw)
                };
            }

            if (request.intent === "concepto") {
                return this.handleConceptRequest(request);
            }

            if (request.intent === "ejercicio") {
                return this.handleOrientationRequest(request);
            }

            return {
                html: AssistantRenderer.renderTutorTextResponse({
                    message: AssistantContent.getBaseResponse("fuera_tema"),
                    followUp: "Si quieres, puedo explicarte un concepto o indicarte que modulo usar."
                }),
                suggestions: this.suggestionsForTopic(request.currentModule || "conceptos", request.raw)
            };
        },

        handleConceptRequest(request) {
            const conceptEntry = request.conceptEntry || AssistantParser.findConcept(request.raw, request.currentModule);
            const topic = AssistantParser.detectConceptTopic(request.normalized) ||
                (conceptEntry ? conceptEntry.topic : null) ||
                (request.faqMatch ? request.faqMatch.topic : null) ||
                request.topic ||
                request.currentModule ||
                "matrices";

            if (AssistantParser.looksLikeExampleRequest(request.normalized)) {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getConceptExample(topic),
                        topic: AssistantContent.getTopicLabel(topic),
                        module: topic,
                        followUp: "Para practicar con numeros completos, usa el modulo correspondiente de la calculadora."
                    }),
                    suggestions: this.suggestionsForTopic(topic, request.raw)
                };
            }

            if (AssistantParser.looksLikeStepsRequest(request.normalized)) {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: AssistantContent.getConceptSteps(topic),
                        topic: AssistantContent.getTopicLabel(topic),
                        module: topic,
                        followUp: AssistantContent.getModuleGuidance(topic)
                    }),
                    suggestions: this.suggestionsForTopic(topic, request.raw)
                };
            }

            if (conceptEntry) {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: conceptEntry.response,
                        topic: AssistantContent.getTopicLabel(conceptEntry.topic),
                        module: conceptEntry.topic,
                        followUp: "Puedo seguir con una idea relacionada si quieres."
                    }),
                    suggestions: (conceptEntry.suggestions || []).map((text, index) => ({
                        id: `concept-follow-up-${index}`,
                        topic: conceptEntry.topic,
                        intent: "concepto",
                        text,
                        prompt: text
                    }))
                };
            }

            const faqMatch = request.faqMatch || AssistantContent.findFaqMatch(request.raw, topic);

            if (faqMatch) {
                return {
                    html: AssistantRenderer.renderTutorTextResponse({
                        message: faqMatch.answer,
                        topic: AssistantContent.getTopicLabel(faqMatch.topic),
                        module: faqMatch.topic,
                        followUp: AssistantContent.getClosing(faqMatch.intent, faqMatch.topic)
                    }),
                    suggestions: AssistantContent.getSuggestions(faqMatch.topic, request.raw)
                };
            }

            return {
                html: AssistantRenderer.renderTutorTextResponse({
                    message: AssistantContent.getConcept(topic).simple,
                    topic: AssistantContent.getTopicLabel(topic),
                    module: topic,
                    followUp: "Si quieres, puedo darte una definicion mas formal o relacionarlo con otro concepto."
                }),
                suggestions: this.suggestionsForTopic(topic, request.raw)
            };
        },

        handleExampleRequest(request) {
            const topic = request.topic || "sistemas";
            const prompts = this.suggestionsForTopic(topic);
            return {
                html: AssistantRenderer.renderExampleResponse(topic, prompts),
                suggestions: prompts
            };
        },

        handleAcademicSupportRequest(request) {
            const topic = request.topic || AssistantParser.detectConceptTopic(request.normalized) || "matrices";
            return {
                html: AssistantRenderer.renderAcademicSupportResponse(topic),
                suggestions: this.suggestionsForTopic(topic, request.raw)
            };
        },

        handleOrientationRequest(request) {
            const topicCandidates = AssistantParser.detectTopics(request.normalized);
            const topic = AssistantParser.resolveTopic(request.normalized, topicCandidates) || request.topic || AssistantParser.detectConceptTopic(request.normalized) || request.currentModule || "matrices";
            const moduleGuidance = AssistantContent.getModuleGuidance(topic);

            return {
                html: AssistantRenderer.renderTutorTextResponse({
                    message: AssistantContent.getBaseResponse("ejercicio"),
                    topic: AssistantContent.getTopicLabel(topic),
                    module: topic,
                    followUp: moduleGuidance
                }),
                suggestions: this.suggestionsForTopic(topic, request.raw)
            };
        },

        handleSystemRequest(request) {
            const parsed = request.parsedData || AssistantParser.parseSystemInput(request.raw);
            const detailHtml = AssistantBridge.runSystem(parsed);
            const methodText = request.intent === "verificar"
                ? "Verificacion recalculando el sistema con el modulo real de Gauss-Jordan."
                : "Resolucion con Gauss-Jordan sobre la matriz aumentada.";

            return {
                html: AssistantRenderer.wrapModuleResponse({
                    topic: AssistantContent.getTopicLabel("sistemas"),
                    desire: AssistantParser.intentLabel(request.intent),
                    method: methodText,
                    detailHtml,
                    verification: "La clasificación final se obtuvo con el criterio de Rouché-Frobenius implementado en el módulo de sistemas.",
                    suggestion: "Si quieres, ahora puedo verificar tu procedimiento fila por fila si me copias tus operaciones."
                }),
                suggestions: AssistantContent.getSuggestions("sistemas")
            };
        },

        handleMatrixRequest(request) {
            const parsed = request.parsedData || AssistantParser.parseMatrixInput(request.raw);
            const detailHtml = AssistantBridge.runMatrix(parsed);

            return {
                html: AssistantRenderer.wrapModuleResponse({
                    topic: AssistantContent.getTopicLabel("matrices"),
                    desire: AssistantParser.intentLabel(request.intent),
                    method: parsed.methodLabel,
                    detailHtml,
                    verification: "La validez de la operacion y las dimensiones se revisaron antes de ejecutar el modulo.",
                    suggestion: "Tambien puedes pedirme la misma operacion en modo verificacion si ya intentaste resolverla por tu cuenta."
                }),
                suggestions: AssistantContent.getSuggestions("matrices")
            };
        },

        handleDeterminantRequest(request) {
            const matrix = request.parsedData || AssistantParser.parseDeterminantInput(request.raw);
            if (matrix.length !== matrix[0].length) {
                throw new Error("El determinante solo esta definido para matrices cuadradas.");
            }
            if (![2, 3, 4].includes(matrix.length)) {
                throw new Error("El modulo actual de determinantes trabaja con matrices 2x2, 3x3 y 4x4.");
            }

            const detailHtml = AssistantBridge.runDeterminant(matrix);

            return {
                html: AssistantRenderer.wrapModuleResponse({
                    topic: AssistantContent.getTopicLabel("determinantes"),
                    desire: AssistantParser.intentLabel(request.intent),
                    method: AssistantParser.methodForDeterminant(matrix.length),
                    detailHtml,
                    verification: "El metodo se eligio automaticamente segun el tamano de la matriz.",
                    suggestion: "Si quieres, despues calculamos la inversa de la misma matriz para relacionar determinante e invertibilidad."
                }),
                suggestions: AssistantContent.getSuggestions("determinantes")
            };
        },

        handleVectorRequest(request) {
            const parsed = request.parsedData || AssistantParser.parseVectorInput(request.raw);
            const detailHtml = AssistantBridge.runVector(parsed);

            return {
                html: AssistantRenderer.wrapModuleResponse({
                    topic: AssistantContent.getTopicLabel("vectores"),
                    desire: AssistantParser.intentLabel(request.intent),
                    method: parsed.methodLabel,
                    detailHtml,
                    verification: "La operacion se valido segun la dimension y el tipo de calculo vectorial.",
                    suggestion: "Si quieres profundizar, puedo explicarte la interpretacion geometrica del resultado."
                }),
                suggestions: AssistantContent.getSuggestions("vectores")
            };
        },

        suggestionsForTopic(topic, currentText = "") {
            return AssistantContent.getSuggestions(topic, currentText);
        }
    };

    window.normalizeText = function normalizeText(text) {
        return AssistantParser.normalizeText(text);
    };

    window.detectIntent = function detectIntent(message, currentModule) {
        return AssistantParser.detectIntent(message, currentModule);
    };

    window.findConcept = function findConcept(message, currentModule) {
        return AssistantParser.findConcept(message, currentModule);
    };

    window.generateTutorResponse = function generateTutorResponse(message, context) {
        return AssistantApp.generateTutorResponse(message, context);
    };

    window.updateTutorSuggestions = function updateTutorSuggestions(suggestions) {
        if (AssistantApp && AssistantApp.quickActions) {
            AssistantApp.updateTutorSuggestions(suggestions);
        }
    };

    window.toggleChat = function toggleChat() {
        const chat = document.getElementById("mini-chat");
        if (!chat) return;
        chat.classList.toggle("active");
        if (chat.classList.contains("active") && AssistantApp.input) {
            AssistantApp.input.focus();
        }
    };

    window.parseUserMathInput = function parseUserMathInput(text) {
        return AssistantParser.parseUserMathInput(text);
    };

    document.addEventListener("DOMContentLoaded", () => AssistantApp.init());
})();

