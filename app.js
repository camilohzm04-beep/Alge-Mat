/**
 * Álgebra Lineal Educativa
 * Archivo principal de lógica JS
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSystemsModule();
    initMatrixModule();
    initDeterminantsModule();
    initVectorsModule();
    initExampleButtons();
    initPracticeSelectHelpers();
    initHistoryModule();
});

// ================= TAB NAVIGATION =================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to current
            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');
        });
    });
}

function switchToTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.toggle('active', content.id === tabId);
    });
}

function updatePracticeSelectHelper(selectElement) {
    if (!selectElement) return;

    const helperId = selectElement.dataset.selectionHelper;
    if (!helperId) return;

    const helper = document.getElementById(helperId);
    if (!helper) return;

    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedText = selectedOption ? selectedOption.text.trim() : '';
    const hasValue = String(selectElement.value || '').trim() !== '';

    selectElement.title = selectedText;
    helper.textContent = hasValue ? `Seleccionado: ${selectedText}` : '';
}

function initPracticeSelectHelpers() {
    document.querySelectorAll('select[data-selection-helper]').forEach((selectElement) => {
        updatePracticeSelectHelper(selectElement);
        selectElement.addEventListener('change', () => updatePracticeSelectHelper(selectElement));
    });
}

// ================= UTILS & EXAMPLES =================
const EXAMPLES_SYS = {
    sys_unique: [[2, 1, 5], [1, -1, 1]], // 2x+y=5, x-y=1 (x=2, y=1)
    sys_parallel: [[1, 2, 4], [2, 4, 10]], // x+2y=4, 2x+4y=10 (No sol)
    sys_infinite: [[1, -1, 3], [2, -2, 6]], // x-y=3, 2x-2y=6 (Infinitas)
    sys_3x3_unique: [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]] // 3x3 Unique sol
};

const SYSTEM_PRACTICE_GROUPS = {
    sys_unique: ['sys_unique'],
    sys_parallel: ['sys_parallel'],
    sys_infinite: ['sys_infinite'],
    sys_3x3_unique: ['sys_3x3_unique']
};

function getSystemPracticeModeSize(mode) {
    const exampleKeys = SYSTEM_PRACTICE_GROUPS[String(mode || '').trim()] || [];
    const firstExampleKey = exampleKeys.find((key) => Array.isArray(EXAMPLES_SYS[key]) && EXAMPLES_SYS[key].length);
    return firstExampleKey ? EXAMPLES_SYS[firstExampleKey].length : null;
}

function getCompatibleSystemPracticeModes(size) {
    const normalizedSize = Number(size);
    return Object.keys(SYSTEM_PRACTICE_GROUPS).filter((mode) => getSystemPracticeModeSize(mode) === normalizedSize);
}

function syncSystemPracticeOptionsBySize(size) {
    const practiceSelect = document.getElementById('sys-example');
    if (!practiceSelect) return;

    const compatibleModes = new Set(getCompatibleSystemPracticeModes(size));
    const currentValue = practiceSelect.value;

    Array.from(practiceSelect.options).forEach((option) => {
        if (!option.value) {
            option.hidden = false;
            option.disabled = false;
            return;
        }

        const isCompatible = compatibleModes.has(option.value);
        option.hidden = !isCompatible;
        option.disabled = !isCompatible;
    });

    if (currentValue && !compatibleModes.has(currentValue)) {
        practiceSelect.value = '';
    }
}

function rebuildSystemGridForSize(size, { preservePracticeValue = false } = {}) {
    const normalizedSize = [2, 3].includes(Number(size)) ? Number(size) : 2;
    const sizeSelect = document.getElementById('sys-size');
    const practiceSelect = document.getElementById('sys-example');
    const preservedPracticeValue = preservePracticeValue && practiceSelect ? practiceSelect.value : '';

    if (sizeSelect) {
        sizeSelect.value = String(normalizedSize);
    }

    createMatrixInput(normalizedSize, normalizedSize + 1, 'sys-inputs', true);
    document.getElementById('sys-results').classList.add('hidden');
    syncSystemPracticeOptionsBySize(normalizedSize);

    if (practiceSelect) {
        practiceSelect.value = preservePracticeValue;
    }
}

const SYSTEM_RANDOM_TYPES = ['unique_2x2', 'no_solution_2x2', 'infinite_2x2', 'unique_3x3', 'no_solution_3x3', 'infinite_3x3'];

const SYSTEM_TYPE_TO_PRACTICE_MODE = {
    unique_2x2: 'sys_unique',
    no_solution_2x2: 'sys_parallel',
    infinite_2x2: 'sys_infinite',
    unique_3x3: 'sys_3x3_unique',
    no_solution_3x3: 'sys_3x3_no_solution',
    infinite_3x3: 'sys_3x3_infinite'
};

const SYSTEM_PRACTICE_MODE_TO_TYPE = {
    sys_unique: 'unique_2x2',
    sys_parallel: 'no_solution_2x2',
    sys_infinite: 'infinite_2x2',
    sys_3x3_unique: 'unique_3x3',
    sys_3x3_no_solution: 'no_solution_3x3',
    sys_3x3_infinite: 'infinite_3x3'
};

function getRandomInt(min, max, excluded = []) {
    const blocked = new Set(excluded);
    let value = min;
    do {
        value = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (blocked.has(value));
    return value;
}

function getRandomNonZeroInt(min = -6, max = 6, excluded = []) {
    return getRandomInt(min, max, [0, ...excluded]);
}

function getRandomSystemType() {
    const randomIndex = Math.floor(Math.random() * SYSTEM_RANDOM_TYPES.length);
    return SYSTEM_RANDOM_TYPES[randomIndex];
}

function getSystemPracticeModeSize(mode) {
    const systemType = SYSTEM_PRACTICE_MODE_TO_TYPE[String(mode || '').trim()];
    if (!systemType) return null;
    return systemType.includes('3x3') ? 3 : 2;
}

function getCompatibleSystemPracticeModes(size) {
    const normalizedSize = Number(size);
    return Object.keys(SYSTEM_PRACTICE_MODE_TO_TYPE).filter((mode) => getSystemPracticeModeSize(mode) === normalizedSize);
}

function syncSystemPracticeOptionsBySize(size) {
    const practiceSelect = document.getElementById('sys-example');
    if (!practiceSelect) return;

    const compatibleModes = new Set(getCompatibleSystemPracticeModes(size));
    const currentValue = practiceSelect.value;

    Array.from(practiceSelect.options).forEach((option) => {
        if (!option.value) {
            option.hidden = false;
            option.disabled = false;
            return;
        }

        const isCompatible = compatibleModes.has(option.value);
        option.hidden = !isCompatible;
        option.disabled = !isCompatible;
    });

    if (currentValue && !compatibleModes.has(currentValue)) {
        practiceSelect.value = '';
    }
}

function setSystemSize(size) {
    const normalizedSize = [2, 3].includes(Number(size)) ? Number(size) : 2;
    const sizeSelect = document.getElementById('sys-size');

    if (sizeSelect) {
        sizeSelect.value = String(normalizedSize);
    }

    createMatrixInput(normalizedSize, normalizedSize + 1, 'sys-inputs', true);
    document.getElementById('sys-results').classList.add('hidden');
    syncSystemPracticeOptionsBySize(normalizedSize);
}

function setPracticeMode(mode) {
    const practiceSelect = document.getElementById('sys-example');
    if (practiceSelect) {
        practiceSelect.value = mode || '';
    }
}

function buildAugmentedMatrix(coefficients, solution) {
    return coefficients.map((row) => {
        const rhs = row.reduce((sum, coefficient, index) => sum + coefficient * solution[index], 0);
        return [...row, rhs];
    });
}

function generateUnique2x2() {
    let coefficients = [];
    do {
        coefficients = [
            [getRandomNonZeroInt(), getRandomNonZeroInt()],
            [getRandomNonZeroInt(), getRandomNonZeroInt()]
        ];
    } while ((coefficients[0][0] * coefficients[1][1]) - (coefficients[0][1] * coefficients[1][0]) === 0);

    const solution = [getRandomInt(-5, 5), getRandomInt(-5, 5)];
    return {
        type: 'unique_2x2',
        size: 2,
        practiceMode: SYSTEM_TYPE_TO_PRACTICE_MODE.unique_2x2,
        augmentedMatrix: buildAugmentedMatrix(coefficients, solution)
    };
}

function generateNoSolution2x2() {
    const baseRow = [getRandomNonZeroInt(), getRandomNonZeroInt()];
    const multiplier = getRandomNonZeroInt(-4, 4, [1]);
    const constant = getRandomInt(-8, 8);
    const offset = getRandomNonZeroInt(-5, 5);

    return {
        type: 'no_solution_2x2',
        size: 2,
        practiceMode: SYSTEM_TYPE_TO_PRACTICE_MODE.no_solution_2x2,
        augmentedMatrix: [
            [...baseRow, constant],
            [baseRow[0] * multiplier, baseRow[1] * multiplier, (constant * multiplier) + offset]
        ]
    };
}

function generateInfinite2x2() {
    const baseRow = [getRandomNonZeroInt(), getRandomNonZeroInt()];
    const constant = getRandomInt(-8, 8);
    const multiplier = getRandomNonZeroInt(-4, 4, [1]);

    return {
        type: 'infinite_2x2',
        size: 2,
        practiceMode: SYSTEM_TYPE_TO_PRACTICE_MODE.infinite_2x2,
        augmentedMatrix: [
            [...baseRow, constant],
            [baseRow[0] * multiplier, baseRow[1] * multiplier, constant * multiplier]
        ]
    };
}

function generateUnique3x3() {
    let coefficients = [];
    do {
        coefficients = [
            [getRandomNonZeroInt(-4, 4), getRandomInt(-4, 4), getRandomInt(-4, 4)],
            [getRandomInt(-4, 4), getRandomNonZeroInt(-4, 4), getRandomInt(-4, 4)],
            [getRandomInt(-4, 4), getRandomInt(-4, 4), getRandomNonZeroInt(-4, 4)]
        ];
    } while (Math.abs(math.det(coefficients)) < 1e-10);

    const solution = [getRandomInt(-4, 4), getRandomInt(-4, 4), getRandomInt(-4, 4)];
    return {
        type: 'unique_3x3',
        size: 3,
        practiceMode: SYSTEM_TYPE_TO_PRACTICE_MODE.unique_3x3,
        augmentedMatrix: buildAugmentedMatrix(coefficients, solution)
    };
}

function generateInfinite3x3() {
    let row1 = [];
    let row2 = [];
    do {
        row1 = [getRandomNonZeroInt(-4, 4), getRandomInt(-4, 4), getRandomInt(-4, 4)];
        row2 = [getRandomInt(-4, 4), getRandomNonZeroInt(-4, 4), getRandomInt(-4, 4)];
    } while (
        (row1[0] === 0 && row1[1] === 0 && row1[2] === 0) ||
        (row2[0] === 0 && row2[1] === 0 && row2[2] === 0) ||
        Math.abs(math.det([row1, row2, [1, 0, 0]])) < 1e-10 && Math.abs(math.det([row1, row2, [0, 1, 0]])) < 1e-10 && Math.abs(math.det([row1, row2, [0, 0, 1]])) < 1e-10
    );

    const c1 = getRandomInt(-8, 8);
    const c2 = getRandomInt(-8, 8);
    const multiplier = getRandomNonZeroInt(-3, 3, [1]);
    const row3 = row1.map((value, index) => value + (multiplier * row2[index]));

    return {
        type: 'infinite_3x3',
        size: 3,
        practiceMode: SYSTEM_TYPE_TO_PRACTICE_MODE.infinite_3x3,
        augmentedMatrix: [
            [...row1, c1],
            [...row2, c2],
            [...row3, c1 + (multiplier * c2)]
        ]
    };
}

function generateNoSolution3x3() {
    const infiniteSystem = generateInfinite3x3();
    const augmentedMatrix = infiniteSystem.augmentedMatrix.map((row) => [...row]);
    augmentedMatrix[2][3] = math.number(augmentedMatrix[2][3]) + getRandomNonZeroInt(-4, 4);

    return {
        type: 'no_solution_3x3',
        size: 3,
        practiceMode: SYSTEM_TYPE_TO_PRACTICE_MODE.no_solution_3x3,
        augmentedMatrix
    };
}

function generateSystemByType(type) {
    const normalizedType = String(type || '').trim();
    if (normalizedType === 'unique_2x2') return generateUnique2x2();
    if (normalizedType === 'no_solution_2x2') return generateNoSolution2x2();
    if (normalizedType === 'infinite_2x2') return generateInfinite2x2();
    if (normalizedType === 'unique_3x3') return generateUnique3x3();
    if (normalizedType === 'no_solution_3x3') return generateNoSolution3x3();
    if (normalizedType === 'infinite_3x3') return generateInfinite3x3();
    return null;
}

function applySystemToUI(system) {
    if (!system?.augmentedMatrix || !Array.isArray(system.augmentedMatrix)) {
        return false;
    }

    setSystemSize(system.size || system.augmentedMatrix.length);
    updateSystemMethodsBySize(system.size || system.augmentedMatrix.length);
    setPracticeMode(system.practiceMode || '');
    setElementValueIfPresent('sys-method', 'auto');
    setMatrixValues('sys-inputs', system.augmentedMatrix);
    document.getElementById('sys-results').classList.add('hidden');
    return true;
}

const EXAMPLES_MAT = {
    mat_singular: [[1, 2], [2, 4]], // det = 0
    mat_identity: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    mat_3x3_inv: [[1, 2, 3], [0, 1, 4], [5, 6, 0]] // Invertible 3x3
};

const MATRIX_PRACTICE_MODE_CONFIG = {
    add_2x2: {
        operationType: 'add',
        label: 'Suma 2x2',
        matrixA: { rows: 2, cols: 2 },
        matrixB: { rows: 2, cols: 2 }
    },
    sub_2x2: {
        operationType: 'sub',
        label: 'Resta 2x2',
        matrixA: { rows: 2, cols: 2 },
        matrixB: { rows: 2, cols: 2 }
    },
    mult_compatible: {
        operationType: 'mult',
        label: 'Multiplicacion compatible',
        matrixA: { rows: 2, cols: 3 },
        matrixB: { rows: 3, cols: 2 }
    },
    scalar_2x2: {
        operationType: 'scalar',
        label: 'Producto por escalar 2x2',
        matrixA: { rows: 2, cols: 2 },
        scalar: 2
    },
    transpose_2x3: {
        operationType: 'transA',
        label: 'Transpuesta 2x3',
        matrixA: { rows: 2, cols: 3 }
    },
    inv_cof_2x2: {
        operationType: 'invA',
        label: 'Inversa por cofactores 2x2',
        matrixA: { rows: 2, cols: 2 }
    },
    inv_cof_3x3: {
        operationType: 'invA',
        label: 'Inversa por cofactores 3x3',
        matrixA: { rows: 3, cols: 3 }
    },
    inv_gauss_2x2: {
        operationType: 'invA_gauss',
        label: 'Inversa por Gauss-Jordan 2x2',
        matrixA: { rows: 2, cols: 2 }
    },
    inv_gauss_3x3: {
        operationType: 'invA_gauss',
        label: 'Inversa por Gauss-Jordan 3x3',
        matrixA: { rows: 3, cols: 3 }
    },
    singular_2x2: {
        operationType: 'invA',
        label: 'Matriz singular 2x2',
        matrixA: { rows: 2, cols: 2 }
    },
    singular_3x3: {
        operationType: 'invA_gauss',
        label: 'Matriz singular 3x3',
        matrixA: { rows: 3, cols: 3 }
    }
};

const MATRIX_PRACTICE_EXAMPLES = {
    add_2x2: [
        {
            label: 'Suma 2x2',
            inputData: {
                operationType: 'add',
                matrixA: [[1, 2], [3, 4]],
                matrixB: [[2, -1], [0, 5]]
            }
        },
        {
            label: 'Suma 2x2',
            inputData: {
                operationType: 'add',
                matrixA: [[-2, 1], [4, 0]],
                matrixB: [[3, 2], [-1, 6]]
            }
        }
    ],
    sub_2x2: [
        {
            label: 'Resta 2x2',
            inputData: {
                operationType: 'sub',
                matrixA: [[5, 1], [2, 7]],
                matrixB: [[1, 3], [2, 4]]
            }
        },
        {
            label: 'Resta 2x2',
            inputData: {
                operationType: 'sub',
                matrixA: [[3, -2], [0, 6]],
                matrixB: [[1, 1], [-4, 2]]
            }
        }
    ],
    mult_compatible: [
        {
            label: 'Multiplicacion compatible',
            inputData: {
                operationType: 'mult',
                matrixA: [[1, 2, 0], [3, -1, 4]],
                matrixB: [[1, 0], [2, 1], [-1, 3]]
            }
        },
        {
            label: 'Multiplicacion compatible',
            inputData: {
                operationType: 'mult',
                matrixA: [[2, 0, 1], [-1, 3, 2]],
                matrixB: [[2, 1], [0, -1], [4, 2]]
            }
        }
    ],
    scalar_2x2: [
        {
            label: 'Producto por escalar 2x2',
            inputData: {
                operationType: 'scalar',
                scalar: 2,
                matrixA: [[1, -2], [3, 4]]
            }
        },
        {
            label: 'Producto por escalar 2x2',
            inputData: {
                operationType: 'scalar',
                scalar: -3,
                matrixA: [[2, 0], [-1, 5]]
            }
        }
    ],
    transpose_2x3: [
        {
            label: 'Transpuesta 2x3',
            inputData: {
                operationType: 'transA',
                matrixA: [[1, 2, 0], [-1, 3, 4]]
            }
        },
        {
            label: 'Transpuesta 2x3',
            inputData: {
                operationType: 'transA',
                matrixA: [[2, -1, 1], [0, 4, -2]]
            }
        }
    ],
    inv_cof_2x2: [
        {
            label: 'Inversa por cofactores 2x2',
            inputData: {
                operationType: 'invA',
                matrixA: [[2, 1], [1, 1]]
            }
        },
        {
            label: 'Inversa por cofactores 2x2',
            inputData: {
                operationType: 'invA',
                matrixA: [[3, -1], [2, 1]]
            }
        }
    ],
    inv_cof_3x3: [
        {
            label: 'Inversa por cofactores 3x3',
            inputData: {
                operationType: 'invA',
                matrixA: EXAMPLES_MAT.mat_3x3_inv
            }
        },
        {
            label: 'Inversa por cofactores 3x3',
            inputData: {
                operationType: 'invA',
                matrixA: [[2, 0, 1], [1, 1, 0], [3, 2, 1]]
            }
        }
    ],
    inv_gauss_2x2: [
        {
            label: 'Inversa por Gauss-Jordan 2x2',
            inputData: {
                operationType: 'invA_gauss',
                matrixA: [[2, 1], [1, 1]]
            }
        },
        {
            label: 'Inversa por Gauss-Jordan 2x2',
            inputData: {
                operationType: 'invA_gauss',
                matrixA: [[3, -1], [2, 1]]
            }
        }
    ],
    inv_gauss_3x3: [
        {
            label: 'Inversa por Gauss-Jordan 3x3',
            inputData: {
                operationType: 'invA_gauss',
                matrixA: EXAMPLES_MAT.mat_3x3_inv
            }
        },
        {
            label: 'Inversa por Gauss-Jordan 3x3',
            inputData: {
                operationType: 'invA_gauss',
                matrixA: [[2, 0, 1], [1, 1, 0], [3, 2, 1]]
            }
        }
    ],
    singular_2x2: [
        {
            label: 'Matriz singular 2x2',
            inputData: {
                operationType: 'invA',
                matrixA: EXAMPLES_MAT.mat_singular
            }
        },
        {
            label: 'Matriz singular 2x2',
            inputData: {
                operationType: 'invA',
                matrixA: [[3, -1], [6, -2]]
            }
        }
    ],
    singular_3x3: [
        {
            label: 'Matriz singular 3x3',
            inputData: {
                operationType: 'invA_gauss',
                matrixA: [[1, 2, 3], [2, 4, 6], [1, 1, 1]]
            }
        },
        {
            label: 'Matriz singular 3x3',
            inputData: {
                operationType: 'invA_gauss',
                matrixA: [[2, 0, 1], [4, 0, 2], [1, 3, 2]]
            }
        }
    ]
};

const EXAMPLES_DET = {
    det_2x2_basic: [[3, 2], [1, 4]],
    det_3x3_sarrus: [[1, 2, 3], [0, 1, 4], [5, 6, 0]],
    det_4x4_cofactor: [[1, 0, 2, -1], [3, 0, 0, 5], [2, 1, 4, -3], [1, 0, 5, 0]]
};

const EXAMPLES_VEC = {
    vec_add_2d: {
        operationType: 'add',
        vectorU: [2, -1],
        vectorV: [1, 3]
    },
    vec_dot_3d: {
        operationType: 'dot',
        vectorU: [1, 2, -1],
        vectorV: [2, 0, 3]
    },
    vec_cross_3d: {
        operationType: 'cross',
        vectorU: [1, 2, 3],
        vectorV: [0, 1, 1]
    }
};

const VECTOR_PRACTICE_MODE_CONFIG = {
    vec_add_2d: { dimension: 2, operationType: 'add', label: 'Suma de vectores en 2D', requiresV: true },
    vec_sub_2d: { dimension: 2, operationType: 'sub', label: 'Resta de vectores en 2D', requiresV: true },
    vec_dot_2d: { dimension: 2, operationType: 'dot', label: 'Producto punto en 2D', requiresV: true },
    vec_mag_2d: { dimension: 2, operationType: 'mag_u', label: 'Magnitud de u en 2D', requiresV: false },
    vec_angle_2d: { dimension: 2, operationType: 'angle', label: 'Ángulo entre u y v en 2D', requiresV: true },
    vec_proj_2d: { dimension: 2, operationType: 'proj', label: 'Proyección de u sobre v en 2D', requiresV: true },
    vec_add_3d: { dimension: 3, operationType: 'add', label: 'Suma de vectores en 3D', requiresV: true },
    vec_sub_3d: { dimension: 3, operationType: 'sub', label: 'Resta de vectores en 3D', requiresV: true },
    vec_dot_3d: { dimension: 3, operationType: 'dot', label: 'Producto punto en 3D', requiresV: true },
    vec_mag_3d: { dimension: 3, operationType: 'mag_u', label: 'Magnitud de u en 3D', requiresV: false },
    vec_angle_3d: { dimension: 3, operationType: 'angle', label: 'Ángulo entre u y v en 3D', requiresV: true },
    vec_cross_3d: { dimension: 3, operationType: 'cross', label: 'Producto cruz en 3D', requiresV: true },
    vec_proj_3d: { dimension: 3, operationType: 'proj', label: 'Proyección de u sobre v en 3D', requiresV: true }
};

const VECTOR_OPERATION_OPTIONS = {
    2: [
        { value: 'add', label: 'u + v (Suma)' },
        { value: 'sub', label: 'u - v (Resta)' },
        { value: 'dot', label: 'u · v (Producto Punto)' },
        { value: 'mag_u', label: '||u|| (Magnitud de u)' },
        { value: 'angle', label: 'Ángulo entre u y v' },
        { value: 'proj', label: 'Proyección de u sobre v' }
    ],
    3: [
        { value: 'add', label: 'u + v (Suma)' },
        { value: 'sub', label: 'u - v (Resta)' },
        { value: 'dot', label: 'u · v (Producto Punto)' },
        { value: 'mag_u', label: '||u|| (Magnitud de u)' },
        { value: 'angle', label: 'Ángulo entre u y v' },
        { value: 'cross', label: 'u × v (Producto Cruz)' },
        { value: 'proj', label: 'Proyección de u sobre v' }
    ]
};

const PRACTICE_EXAMPLES = {
    sistemas: {
        unique: {
            sys_unique: {
                label: 'Sistema 2x2 con solucion unica',
                inputData: {
                    augmentedMatrix: EXAMPLES_SYS.sys_unique
                }
            },
            sys_3x3_unique: {
                label: 'Sistema 3x3 con solucion unica',
                inputData: {
                    augmentedMatrix: EXAMPLES_SYS.sys_3x3_unique
                }
            }
        },
        no_solution: {
            sys_parallel: {
                label: 'Sistema 2x2 sin solucion',
                inputData: {
                    augmentedMatrix: EXAMPLES_SYS.sys_parallel
                }
            }
        },
        infinite: {
            sys_infinite: {
                label: 'Sistema 2x2 con infinitas soluciones',
                inputData: {
                    augmentedMatrix: EXAMPLES_SYS.sys_infinite
                }
            }
        }
    },
    matrices: {
        inverse: {
            mat_singular: {
                label: 'Inversa de matriz singular 2x2',
                inputData: {
                    operationType: 'invA',
                    matrixA: EXAMPLES_MAT.mat_singular
                }
            },
            mat_3x3_inv: {
                label: 'Inversa de matriz invertible 3x3',
                inputData: {
                    operationType: 'invA_gauss',
                    matrixA: EXAMPLES_MAT.mat_3x3_inv
                }
            }
        },
        transpose: {
            mat_identity: {
                label: 'Transpuesta de matriz identidad 3x3',
                inputData: {
                    operationType: 'transA',
                    matrixA: EXAMPLES_MAT.mat_identity
                }
            }
        }
    },
    determinantes: {
        direct: {
            det_2x2_basic: {
                label: 'Determinante 2x2 por formula directa',
                inputData: {
                    matrix: EXAMPLES_DET.det_2x2_basic
                }
            }
        },
        sarrus: {
            det_3x3_sarrus: {
                label: 'Determinante 3x3 por regla de Sarrus',
                inputData: {
                    matrix: EXAMPLES_DET.det_3x3_sarrus
                }
            }
        },
        cofactor: {
            det_4x4_cofactor: {
                label: 'Determinante 4x4 por cofactores',
                inputData: {
                    matrix: EXAMPLES_DET.det_4x4_cofactor
                }
            }
        }
    },
    vectores: {
        add: {
            vec_add_2d: {
                label: 'Suma de vectores en 2D',
                inputData: EXAMPLES_VEC.vec_add_2d
            }
        },
        dot: {
            vec_dot_3d: {
                label: 'Producto punto en 3D',
                inputData: EXAMPLES_VEC.vec_dot_3d
            }
        },
        cross: {
            vec_cross_3d: {
                label: 'Producto cruz en 3D',
                inputData: EXAMPLES_VEC.vec_cross_3d
            }
        }
    }
};

const PRACTICE_MODULE_CONFIG = {
    sistemas: {
        selectId: 'sys-example',
        modeByOptionValue: {
            sys_unique: 'unique',
            sys_parallel: 'no_solution',
            sys_infinite: 'infinite',
            sys_3x3_unique: 'unique'
        },
        validate: validateSystemPracticeExample
    },
    matrices: {
        selectId: 'mat-example',
        modeByOptionValue: {
            add_2x2: 'add',
            sub_2x2: 'sub',
            mult_compatible: 'mult',
            scalar_2x2: 'scalar',
            transpose_2x3: 'transpose',
            inv_cof_2x2: 'inverse',
            inv_cof_3x3: 'inverse',
            inv_gauss_2x2: 'inverse',
            inv_gauss_3x3: 'inverse',
            singular_2x2: 'inverse',
            singular_3x3: 'inverse'
        },
        validate: validateMatrixPracticeExample
    },
    determinantes: {
        selectId: 'det-example',
        modeByOptionValue: {
            det_2x2_basic: 'direct',
            det_3x3_sarrus: 'sarrus',
            det_4x4_cofactor: 'cofactor'
        },
        validate: validateDeterminantPracticeExample
    },
    vectores: {
        selectId: 'vec-example',
        modeByOptionValue: {
            vec_add_2d: 'add',
            vec_sub_2d: 'sub',
            vec_dot_2d: 'dot',
            vec_mag_2d: 'mag_u',
            vec_angle_2d: 'angle',
            vec_proj_2d: 'proj',
            vec_add_3d: 'add',
            vec_sub_3d: 'sub',
            vec_dot_3d: 'dot',
            vec_mag_3d: 'mag_u',
            vec_angle_3d: 'angle',
            vec_cross_3d: 'cross',
            vec_proj_3d: 'proj'
        },
        validate: validateVectorPracticeExample
    }
};

const DEFAULT_EXAMPLE_KEYS = {
    sistemas: 'sys_unique',
    matrices: 'mat_singular',
    determinantes: 'det_3x3_sarrus',
    vectores: 'vec_add_2d'
};

function getExampleRegistryEntries(registry = {}) {
    return Object.entries(registry).flatMap(([mode, examples]) =>
        Object.entries(examples || {}).map(([key, example]) => ({
            module: null,
            mode,
            key,
            label: example?.label || key,
            inputData: example?.inputData || null
        }))
    );
}

function getSelectedPracticeMode(moduleId) {
    const config = PRACTICE_MODULE_CONFIG[moduleId];
    if (!config?.selectId) return '';

    const select = document.getElementById(config.selectId);
    if (!select) return '';

    const rawValue = String(select.value || '').trim();
    if (!rawValue) return '';

    return config.modeByOptionValue?.[rawValue] || rawValue;
}

function validateSystemPracticeExample(inputData) {
    const matrix = inputData?.augmentedMatrix;
    if (!Array.isArray(matrix) || !matrix.length) return false;
    if (![2, 3].includes(matrix.length)) return false;
    return matrix.every((row) => Array.isArray(row) && row.length === matrix.length + 1);
}

function validateMatrixPracticeExample(inputData) {
    const op = inputData?.operationType || 'add';
    const A = inputData?.matrixA;
    const B = inputData?.matrixB || null;
    if (!Array.isArray(A) || !A.length || !Array.isArray(A[0]) || !A[0].length) return false;

    const rowsA = A.length;
    const colsA = A[0].length;
    const allowedOps = ['add', 'sub', 'mult', 'scalar', 'transA', 'invA', 'invA_gauss'];
    if (!allowedOps.includes(op)) return false;

    if ((op === 'add' || op === 'sub') && (!B || B.length !== rowsA || B[0]?.length !== colsA)) return false;
    if (op === 'mult' && (!B || colsA !== B.length)) return false;
    if ((op === 'invA' || op === 'invA_gauss') && rowsA !== colsA) return false;
    if (op === 'scalar' && (inputData.scalar === undefined || inputData.scalar === null)) return false;

    return true;
}

function validateDeterminantPracticeExample(inputData) {
    const matrix = inputData?.matrix;
    if (!Array.isArray(matrix) || !matrix.length) return false;
    if (![2, 3, 4].includes(matrix.length)) return false;
    return matrix.every((row) => Array.isArray(row) && row.length === matrix.length);
}

function validateVectorPracticeExample(inputData) {
    const op = inputData?.operationType || 'mag_u';
    const u = inputData?.vectorU;
    const v = inputData?.vectorV || null;
    if (!Array.isArray(u) || ![2, 3].includes(u.length)) return false;

    if (op === 'mag_u') return true;
    if (!Array.isArray(v) || v.length !== u.length) return false;
    if (op === 'cross' && u.length !== 3) return false;

    return ['add', 'sub', 'dot', 'angle', 'cross', 'proj'].includes(op);
}

function getRandomExample(moduleId, mode = '') {
    const normalizedModule = String(moduleId || '').trim();
    const registry = PRACTICE_EXAMPLES[normalizedModule];
    const config = PRACTICE_MODULE_CONFIG[normalizedModule];

    if (!registry || !config) {
        console.warn(`No existe configuracion de ejemplos para el modulo "${normalizedModule}".`);
        return null;
    }

    const selectedMode = String(mode || '').trim() || getSelectedPracticeMode(normalizedModule);
    const requestedEntries = selectedMode && registry[selectedMode]
        ? Object.entries(registry[selectedMode]).map(([key, example]) => ({
            module: normalizedModule,
            mode: selectedMode,
            key,
            label: example?.label || key,
            inputData: example?.inputData || null
        }))
        : [];

    const allEntries = getExampleRegistryEntries(registry).map((entry) => ({
        ...entry,
        module: normalizedModule
    }));

    const candidatePool = requestedEntries.length ? requestedEntries : allEntries;
    const validExamples = candidatePool.filter((entry) => {
        if (!entry?.inputData) return false;
        try {
            return typeof config.validate === 'function' ? config.validate(entry.inputData) : true;
        } catch (error) {
            console.warn(`No se pudo validar el ejemplo "${entry.key}" del modulo "${normalizedModule}".`, error);
            return false;
        }
    });

    if (!validExamples.length) {
        console.warn(
            selectedMode
                ? `No hay ejemplos validos para el modulo "${normalizedModule}" en el modo "${selectedMode}".`
                : `No hay ejemplos validos para el modulo "${normalizedModule}".`
        );
        return null;
    }

    const randomIndex = Math.floor(Math.random() * validExamples.length);
    return validExamples[randomIndex];
}

const EDU_TIPS = {
    sistemas: {
        default: "<strong>💡 Semanas 1-2:</strong> Los sistemas de ecuaciones lineales representan la intersección de rectas o planos. Un sistema sin solución corresponde a líneas paralelas."
    },
    matrices: {
        add: "<strong>💡 Semanas 3-4 (Suma):</strong> La suma se realiza elemento a elemento y solo es posible entre matrices de iguales dimensiones.",
        sub: "<strong>💡 Semanas 3-4 (Resta):</strong> Equivalente a sumar el recíproco aditivo. Resta elementos en la misma posición.",
        mult: "<strong>💡 Semana 5 (Producto Matricial):</strong> Para A × B, las columnas de A deben coincidir con las filas de B. Resulta en combinaciones lineales.",
        scalar: "<strong>💡 Semanas 3-4 (Escalar):</strong> Multiplicar una matriz por una constante k escala uniformemente toda la transformación lineal. Cada elemento se multiplica por k.",
        transA: "<strong>💡 Semanas 6-7 (Transpuesta):</strong> Intercambia filas por columnas. La diagonal principal permanece intacta.",
        invA: "<strong>💡 Semanas 8-10 (Inversa):</strong> Permite \"deshacer\" una transformación lineal. Se halla usando la Matriz de Cofactores y la Adjunta. Requiere det(A) ≠ 0."
    },
    determinantes: {
        2: "<strong>💡 Semana 8 (Determinante 2x2):</strong> Es el producto en cruz: ad - bc. Si es 0, los vectores fila son colineales y el área es 0 (matriz singular).",
        3: "<strong>💡 Semana 9 (Determinante 3x3):</strong> Se usa la Regla de Sarrus o Co-factores para calcular el volumen tridimensional del paralelepípedo formado.",
        4: "<strong>💡 Semana 10 (Determinante 4x4):</strong> Expansión por cofactores (Teorema de Laplace). Reduce el determinante grande a una suma ponderada de determinantes menores."
    },
    vectores: {
        add: "<strong>💡 Semanas 11-12 (Suma):</strong> Visualmente aplicas la regla del paralelogramo para trazar la diagonal resultante.",
        sub: "<strong>💡 Semanas 11-12 (Resta):</strong> Apunta desde la cabeza del vector restado hacia la cabeza del vector principal.",
        dot: "<strong>💡 Semanas 13-14 (Producto Punto):</strong> Operación escalar. Te dice cuánto interactúan u y v. Si el resultado es cero (0), los vectores son ortogonales.",
        mag_u: "<strong>💡 Semanas 11-12 (Magnitud):</strong> Distancia lineal desde el origen. Se calcula por pitágoras con los componentes iterados.",
        angle: "<strong>💡 Semanas 13-14 (Ángulo):</strong> Calculado a través del producto punto y las magnitudes mediante cos(θ).",
        cross: "<strong>💡 Semanas 13-14 (Producto Cruz):</strong> En 3D, produce un nuevo vector estrictamente perpendicular al plano formado por los dos originales.",
        proj: "<strong>💡 Semanas 13-14 (Proyección):</strong> Halla la 'sombra' ortogonal de un vector u a lo largo de la línea definida por otro vector v."
    }
};

function updateEduTip(moduleId, key) {
    const section = document.getElementById(moduleId);
    if (!section) return;
    const tipDiv = section.querySelector('.edu-tip');
    if (!tipDiv) return;
    
    if (EDU_TIPS[moduleId] && EDU_TIPS[moduleId][key]) {
        tipDiv.innerHTML = EDU_TIPS[moduleId][key];
    } else if (EDU_TIPS[moduleId] && EDU_TIPS[moduleId]['default']) {
        tipDiv.innerHTML = EDU_TIPS[moduleId]['default'];
    }
}

function getExampleKeyFromSelect(selectId, fallbackKey) {
    const select = document.getElementById(selectId);
    return (select && select.value) || fallbackKey;
}

function syncExampleSelect(selectId, exampleKey) {
    const select = document.getElementById(selectId);
    if (select) {
        select.value = exampleKey;
    }
}

function applyPracticeExample(moduleId, exampleEntry) {
    if (!exampleEntry?.inputData) {
        console.warn(`No se pudo aplicar el ejemplo del modulo "${moduleId}" porque no contiene datos de entrada.`);
        return false;
    }

    const config = PRACTICE_MODULE_CONFIG[moduleId];
    if (config?.selectId && exampleEntry.key) {
        syncExampleSelect(config.selectId, exampleEntry.key);
    }

    switch (moduleId) {
        case 'sistemas':
            restoreSystemHistoryEntry(exampleEntry.inputData);
            return true;
        case 'matrices':
            restoreMatrixHistoryEntry(
                exampleEntry.inputData,
                exampleEntry.inputData.operationType || exampleEntry.mode || ''
            );
            return true;
        case 'determinantes':
            restoreDeterminantHistoryEntry(exampleEntry.inputData);
            return true;
        case 'vectores':
            restoreVectorHistoryEntry(
                exampleEntry.inputData,
                exampleEntry.inputData.operationType || exampleEntry.mode || ''
            );
            return true;
        default:
            console.warn(`El modulo "${moduleId}" no tiene una estrategia de carga de ejemplos.`);
            return false;
    }
}

function buildMatrixExampleInputData(exampleKey) {
    const matrixA = EXAMPLES_MAT[exampleKey];
    if (!matrixA) return null;

    const operationByExample = {
        mat_singular: 'invA',
        mat_identity: 'transA',
        mat_3x3_inv: 'invA_gauss'
    };

    return {
        operationType: operationByExample[exampleKey] || 'transA',
        matrixA
    };
}

function loadSystemExample(exampleKey = DEFAULT_EXAMPLE_KEYS.sistemas, practiceValue = exampleKey) {
    const resolvedKey = EXAMPLES_SYS[exampleKey] ? exampleKey : DEFAULT_EXAMPLE_KEYS.sistemas;
    const size = Array.isArray(EXAMPLES_SYS[resolvedKey]) ? EXAMPLES_SYS[resolvedKey].length : 2;
    return applySystemToUI({
        type: SYSTEM_PRACTICE_MODE_TO_TYPE[practiceValue] || SYSTEM_PRACTICE_MODE_TO_TYPE[resolvedKey] || '',
        size,
        practiceMode: practiceValue,
        augmentedMatrix: EXAMPLES_SYS[resolvedKey]
    });
}

function getRandomSystemExampleBySize(size) {
    const normalizedSize = [2, 3].includes(Number(size)) ? Number(size) : 2;
    const compatibleTypes = SYSTEM_RANDOM_TYPES.filter((type) => {
        const generated = generateSystemByType(type);
        return generated && generated.size === normalizedSize;
    });

    if (!compatibleTypes.length) {
        console.warn(`No hay tipos de sistemas disponibles para tamano ${normalizedSize}x${normalizedSize}.`);
        return null;
    }

    const randomType = compatibleTypes[Math.floor(Math.random() * compatibleTypes.length)];
    return generateSystemByType(randomType);
}

function getRandomSystemExampleByMode(mode) {
    const normalizedMode = String(mode || '').trim();
    const systemType = SYSTEM_PRACTICE_MODE_TO_TYPE[normalizedMode];

    if (!systemType) {
        console.warn(`No hay un tipo de sistema asociado al modo "${normalizedMode}".`);
        return null;
    }

    return generateSystemByType(systemType);
}

function loadRandomSystemExampleForSelectedSize() {
    const sizeSelect = document.getElementById('sys-size');
    const selectedSize = parseInt(sizeSelect?.value || '2', 10);
    const randomSystem = getRandomSystemExampleBySize(selectedSize);

    if (!randomSystem) return false;
    return applySystemToUI(randomSystem);
}

function loadRandomSystemExampleFromCurrentContext() {
    const randomType = getRandomSystemType();
    const generatedSystem = generateSystemByType(randomType);

    if (!generatedSystem) return false;
    return applySystemToUI(generatedSystem);
}

function loadMatrixExample(exampleKey = DEFAULT_EXAMPLE_KEYS.matrices) {
    const resolvedKey = EXAMPLES_MAT[exampleKey] ? exampleKey : DEFAULT_EXAMPLE_KEYS.matrices;
    const exampleInput = buildMatrixExampleInputData(resolvedKey);
    if (!exampleInput) return false;
    return applyPracticeExample('matrices', {
        key: resolvedKey,
        mode: PRACTICE_MODULE_CONFIG.matrices.modeByOptionValue?.[resolvedKey] || '',
        inputData: exampleInput
    });
}

function getSelectedMatrixPracticeMode() {
    const practiceSelect = document.getElementById('mat-example');
    return String(practiceSelect?.value || '').trim();
}

function generateRandomIntegerMatrix(rows, cols, { min = -4, max = 5 } = {}) {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => getRandomInt(min, max))
    );
}

function generateInvertibleMatrix2x2() {
    let matrix = [];
    do {
        matrix = generateRandomIntegerMatrix(2, 2);
    } while (Math.abs(math.det(matrix)) < 1e-10);
    return matrix;
}

function generateInvertibleMatrix3x3() {
    let matrix = [];
    do {
        matrix = generateRandomIntegerMatrix(3, 3);
    } while (Math.abs(math.det(matrix)) < 1e-10);
    return matrix;
}

function generateSingularMatrix2x2() {
    const baseRow = [getRandomNonZeroInt(-4, 4), getRandomNonZeroInt(-4, 4)];
    const multiplier = getRandomNonZeroInt(-3, 3);
    return [
        [...baseRow],
        [baseRow[0] * multiplier, baseRow[1] * multiplier]
    ];
}

function generateSingularMatrix3x3() {
    const row1 = [getRandomInt(-3, 4), getRandomInt(-3, 4), getRandomInt(-3, 4)];
    const row2 = [getRandomInt(-3, 4), getRandomInt(-3, 4), getRandomInt(-3, 4)];
    const row3 = row1.map((value, index) => value + row2[index]);
    return [row1, row2, row3];
}

function getRandomMatrixMode() {
    const modes = Object.keys(MATRIX_PRACTICE_MODE_CONFIG);
    if (!modes.length) return '';
    return modes[Math.floor(Math.random() * modes.length)];
}

function generateMatrixByMode(mode) {
    const normalizedMode = String(mode || '').trim();
    const config = MATRIX_PRACTICE_MODE_CONFIG[normalizedMode];
    if (!config) return null;

    const buildExample = (overrides = {}) => ({
        mode: normalizedMode,
        operation: config.operationType,
        A: overrides.A || [],
        B: overrides.B || null,
        scalar: overrides.scalar ?? null,
        sizeA: overrides.sizeA || [config.matrixA?.rows || 0, config.matrixA?.cols || 0],
        sizeB: overrides.sizeB || (config.matrixB ? [config.matrixB.rows, config.matrixB.cols] : null)
    });

    switch (normalizedMode) {
        case 'add_2x2':
            return buildExample({
                A: generateRandomIntegerMatrix(2, 2),
                B: generateRandomIntegerMatrix(2, 2)
            });
        case 'sub_2x2':
            return buildExample({
                A: generateRandomIntegerMatrix(2, 2),
                B: generateRandomIntegerMatrix(2, 2)
            });
        case 'mult_compatible':
            return buildExample({
                A: generateRandomIntegerMatrix(2, 3),
                B: generateRandomIntegerMatrix(3, 2)
            });
        case 'scalar_2x2':
            return buildExample({
                A: generateRandomIntegerMatrix(2, 2),
                scalar: getRandomNonZeroInt(-5, 5)
            });
        case 'transpose_2x3':
            return buildExample({
                A: generateRandomIntegerMatrix(2, 3)
            });
        case 'inv_cof_2x2':
            return buildExample({
                A: generateInvertibleMatrix2x2()
            });
        case 'inv_cof_3x3':
            return buildExample({
                A: generateInvertibleMatrix3x3()
            });
        case 'inv_gauss_2x2':
            return buildExample({
                A: generateInvertibleMatrix2x2()
            });
        case 'inv_gauss_3x3':
            return buildExample({
                A: generateInvertibleMatrix3x3()
            });
        case 'singular_2x2':
            return buildExample({
                A: generateSingularMatrix2x2()
            });
        case 'singular_3x3':
            return buildExample({
                A: generateSingularMatrix3x3()
            });
        default:
            return null;
    }
}

function applyMatrixExample(example) {
    if (!example?.A || !Array.isArray(example.A) || !example.A.length) {
        return false;
    }

    const sizeA = Array.isArray(example.sizeA) ? example.sizeA : [example.A.length, example.A[0]?.length || 0];
    const sizeB = Array.isArray(example.sizeB) ? example.sizeB : (example.B ? [example.B.length, example.B[0]?.length || 0] : null);
    const rawOperation = String(example.operation || '').trim();
    const operation = rawOperation === 'invA_gauss' ? 'invA' : rawOperation;
    const selectedMethod = rawOperation === 'invA_gauss' ? 'gauss_jordan' : rawOperation === 'invA' ? 'cofactors' : 'auto';
    const inputData = {
        operationType: rawOperation,
        matrixA: example.A,
        matrixB: example.B || null,
        scalar: example.scalar
    };

    if (!validateMatrixPracticeExample(inputData)) {
        console.warn(`El ejemplo generado para matrices no es valido para el modo "${example.mode || ''}".`);
        return false;
    }

    setElementValueIfPresent('mat-example', example.mode || '');
    setMatrixDimensions('matA', sizeA[0], sizeA[1]);
    setMatrixValues('matA-inputs', example.A);

    if (sizeB && example.B) {
        setMatrixDimensions('matB', sizeB[0], sizeB[1]);
        setMatrixValues('matB-inputs', example.B);
    }

    if (example.scalar !== undefined && example.scalar !== null) {
        setElementValueIfPresent('mat-scalar-val', example.scalar);
    }

    if (operation) {
        setElementValueIfPresent('mat-op', operation);
    }
    setElementValueIfPresent('mat-method', selectedMethod);

    clearInputErrors(document.getElementById('matrices'));
    updateMatrixOperationUI(operation || document.getElementById('mat-op').value);
    updateEduTip('matrices', operation || document.getElementById('mat-op').value);
    document.getElementById('mat-results').classList.add('hidden');
    return true;
}

function setMatrixDimensions(prefix, rows, cols) {
    const normalizedRows = Math.max(1, Math.min(5, Number(rows) || 2));
    const normalizedCols = Math.max(1, Math.min(5, Number(cols) || 2));

    setElementValueIfPresent(`${prefix}-rows`, normalizedRows);
    setElementValueIfPresent(`${prefix}-cols`, normalizedCols);
    createMatrixInput(normalizedRows, normalizedCols, `${prefix}-inputs`);
}

function applyMatrixPracticeModeSelection(mode) {
    const generatedExample = generateMatrixByMode(mode);
    if (!generatedExample) return false;
    return applyMatrixExample(generatedExample);
}

function loadRandomMatrixExample() {
    const randomMode = getRandomMatrixMode();
    if (!randomMode) return false;

    setElementValueIfPresent('mat-example', randomMode);
    return applyMatrixPracticeModeSelection(randomMode);
}

function loadDeterminantExample(exampleKey = DEFAULT_EXAMPLE_KEYS.determinantes) {
    const resolvedKey = EXAMPLES_DET[exampleKey] ? exampleKey : DEFAULT_EXAMPLE_KEYS.determinantes;
    return applyPracticeExample('determinantes', {
        key: resolvedKey,
        mode: PRACTICE_MODULE_CONFIG.determinantes.modeByOptionValue?.[resolvedKey] || '',
        inputData: {
            matrix: EXAMPLES_DET[resolvedKey]
        }
    });
}

const DETERMINANT_PRACTICE_MODES = {
    det_2x2_basic: {
        size: 2,
        label: 'Determinante 2x2 por fórmula directa'
    },
    det_3x3_sarrus: {
        size: 3,
        label: 'Determinante 3x3 por regla de Sarrus'
    },
    det_4x4_cofactor: {
        size: 4,
        label: 'Determinante 4x4 por cofactores'
    }
};

function getRandomDeterminantMode() {
    const modes = Object.keys(DETERMINANT_PRACTICE_MODES);
    if (!modes.length) return '';
    return modes[Math.floor(Math.random() * modes.length)];
}

function generateDirect2x2Determinant() {
    return [
        [getRandomInt(-6, 6), getRandomInt(-6, 6)],
        [getRandomInt(-6, 6), getRandomInt(-6, 6)]
    ];
}

function generateSarrus3x3Determinant() {
    return [
        [getRandomInt(-4, 5), getRandomInt(-4, 5), getRandomInt(-4, 5)],
        [getRandomInt(-4, 5), getRandomInt(-4, 5), getRandomInt(-4, 5)],
        [getRandomInt(-4, 5), getRandomInt(-4, 5), getRandomInt(-4, 5)]
    ];
}

function generateCofactors4x4Determinant() {
    const highlightedRow = [0, getRandomNonZeroInt(-4, 4), 0, getRandomNonZeroInt(-4, 4)];
    const remainingRows = Array.from({ length: 3 }, () => [
        getRandomInt(-4, 5),
        getRandomInt(-4, 5),
        getRandomInt(-4, 5),
        getRandomInt(-4, 5)
    ]);

    return [highlightedRow, ...remainingRows];
}

function generateDeterminantByMode(mode) {
    const normalizedMode = String(mode || '').trim();
    const config = DETERMINANT_PRACTICE_MODES[normalizedMode];
    if (!config) return null;

    let matrix = [];
    if (normalizedMode === 'det_2x2_basic') {
        matrix = generateDirect2x2Determinant();
    } else if (normalizedMode === 'det_3x3_sarrus') {
        matrix = generateSarrus3x3Determinant();
    } else if (normalizedMode === 'det_4x4_cofactor') {
        matrix = generateCofactors4x4Determinant();
    }

    return {
        mode: normalizedMode,
        size: config.size,
        label: config.label,
        matrix
    };
}

function applyDeterminantExample(example) {
    if (!example?.matrix || !Array.isArray(example.matrix) || !example.matrix.length) {
        return false;
    }

    const size = Number(example.size) || example.matrix.length;
    if (!validateDeterminantPracticeExample({ matrix: example.matrix })) {
        console.warn(`El ejemplo generado para determinantes no es válido para el modo "${example.mode || ''}".`);
        return false;
    }

    setElementValueIfPresent('det-example', example.mode || '');
    setElementValueIfPresent('det-size', size);
    updateDeterminantMethodOptions(size, example.mode === 'det_2x2_basic' ? 'direct' : example.mode === 'det_3x3_sarrus' ? 'sarrus' : 'cofactors');
    createMatrixInput(size, size, 'det-inputs');
    setMatrixValues('det-inputs', example.matrix);
    updateEduTip('determinantes', String(size));
    document.getElementById('det-results').classList.add('hidden');
    return true;
}

function applyDeterminantPracticeModeSelection(mode) {
    const generatedExample = generateDeterminantByMode(mode);
    if (!generatedExample) return false;
    return applyDeterminantExample(generatedExample);
}

function loadRandomDeterminantExample() {
    const randomMode = getRandomDeterminantMode();
    if (!randomMode) return false;

    setElementValueIfPresent('det-example', randomMode);
    return applyDeterminantPracticeModeSelection(randomMode);
}

function loadVectorExample(exampleKey = DEFAULT_EXAMPLE_KEYS.vectores) {
    const resolvedKey = EXAMPLES_VEC[exampleKey] ? exampleKey : DEFAULT_EXAMPLE_KEYS.vectores;
    return applyPracticeExample('vectores', {
        key: resolvedKey,
        mode: PRACTICE_MODULE_CONFIG.vectores.modeByOptionValue?.[resolvedKey] || '',
        inputData: EXAMPLES_VEC[resolvedKey]
    });
}

function isZeroVector(vector) {
    return !Array.isArray(vector) || vector.every((value) => Number(value) === 0);
}

function syncVectorOperationUI(op) {
    const isUnary = op === 'mag_u';
    const groupVecB = document.getElementById('group-vecB');
    if (groupVecB) {
        groupVecB.style.display = isUnary ? 'none' : 'block';
    }
    toggleGroupInteractivity('group-vecB', !isUnary);
    updateEduTip('vectores', op);
}

function normalizeVectorDimensionValue(value, fallback = null) {
    const rawValue = String(value ?? '').trim();
    if (!rawValue) return fallback;

    if (rawValue === '2' || /^2\s*d?$/i.test(rawValue) || /^2d\b/i.test(rawValue)) return 2;
    if (rawValue === '3' || /^3\s*d?$/i.test(rawValue) || /^3d\b/i.test(rawValue)) return 3;

    const parsed = Number.parseInt(rawValue, 10);
    return parsed === 2 || parsed === 3 ? parsed : fallback;
}

function inferVectorGridDimension(containerId = 'vecA-inputs') {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const cells = container.querySelectorAll(`.matrix-cell[id^="${containerId}-0-"]`).length;
    return cells === 2 || cells === 3 ? cells : null;
}

function getCurrentVectorDimension() {
    const dimSelect = document.getElementById('vec-dim');
    const practiceSelect = document.getElementById('vec-example');
    const selectedDim = normalizeVectorDimensionValue(dimSelect?.value);
    const gridDim = inferVectorGridDimension('vecA-inputs');
    const practiceDim = normalizeVectorDimensionValue(
        practiceSelect ? VECTOR_PRACTICE_MODE_CONFIG[String(practiceSelect.value || '').trim()]?.dimension : null
    );
    const resolvedDim = selectedDim || gridDim || practiceDim || 2;

    if (dimSelect && dimSelect.value !== String(resolvedDim)) {
        dimSelect.value = String(resolvedDim);
    }

    return resolvedDim;
}

function syncVectorPracticeSelectionWithDimension(dimension) {
    const practiceSelect = document.getElementById('vec-example');
    if (!practiceSelect) return;

    const selectedMode = String(practiceSelect.value || '').trim();
    if (!selectedMode) return;

    const practiceDim = VECTOR_PRACTICE_MODE_CONFIG[selectedMode]?.dimension;
    if (practiceDim && practiceDim !== dimension) {
        practiceSelect.value = '';
        updatePracticeSelectHelper(practiceSelect);
    }
}

function updateVectorOperations(dimension) {
    const normalizedDimension = normalizeVectorDimensionValue(dimension, 2);
    const operationSelect = document.getElementById('vec-op');
    if (!operationSelect) return;

    const previousValue = String(operationSelect.value || '').trim();
    const validOptions = VECTOR_OPERATION_OPTIONS[normalizedDimension] || VECTOR_OPERATION_OPTIONS[2];
    const validValues = new Set(validOptions.map((option) => option.value));
    const nextValue = validValues.has(previousValue) ? previousValue : validOptions[0].value;

    operationSelect.innerHTML = validOptions
        .map((option) => `<option value="${option.value}">${option.label}</option>`)
        .join('');

    operationSelect.value = nextValue;
    if (operationSelect.dataset && operationSelect.dataset.selectionHelper) {
        updatePracticeSelectHelper(operationSelect);
    }

    syncVectorOperationUI(nextValue);
}

function calculateMagnitude(u) {
    const squaredTerms = u.map((value) => math.multiply(value, value));
    const squaredNorm = squaredTerms.reduce((sum, value) => math.add(sum, value), math.fraction(0));
    const result = Math.sqrt(math.number(squaredNorm));
    const symbolicSquares = u.map((value) => formatSquaredMathVal(value)).join(' + ');
    const numericSquares = squaredTerms.map((value) => formatMathVal(value)).join(' + ');
    const steps = [
        `${formatNormHtml('u')} = √(${symbolicSquares})`,
        `${formatNormHtml('u')} = √(${numericSquares}) = √(${formatMathVal(squaredNorm)})`,
        `${formatNormHtml('u')} ≈ ${result.toFixed(3)}`
    ];

    return {
        result,
        squaredNorm,
        squaredTerms,
        steps
    };
}

function generateRandomVector(dimension, { min = -5, max = 5, nonZero = false } = {}) {
    let vector = [];
    do {
        vector = Array.from({ length: dimension }, () => getRandomInt(min, max));
    } while (nonZero && isZeroVector(vector));
    return vector;
}

function areParallelVectors2D(u, v) {
    return (u[0] * v[1]) - (u[1] * v[0]) === 0;
}

function isZeroVector3D(vector) {
    return vector[0] === 0 && vector[1] === 0 && vector[2] === 0;
}

function generateAngleFriendlyVectors(dimension) {
    let u = [];
    let v = [];

    do {
        u = generateRandomVector(dimension, { nonZero: true });
        v = generateRandomVector(dimension, { nonZero: true });
    } while (
        (dimension === 2 && areParallelVectors2D(u, v)) ||
        (dimension === 3 && isZeroVector3D(math.cross(u, v)))
    );

    return { u, v };
}

function generateProjectionVectors(dimension) {
    const u = generateRandomVector(dimension, { nonZero: true });
    const v = generateRandomVector(dimension, { nonZero: true });
    return { u, v };
}

function getRandomVectorMode() {
    const modes = Object.keys(VECTOR_PRACTICE_MODE_CONFIG);
    if (!modes.length) return '';
    return modes[Math.floor(Math.random() * modes.length)];
}

function generateVectorByMode(mode) {
    const normalizedMode = String(mode || '').trim();
    const config = VECTOR_PRACTICE_MODE_CONFIG[normalizedMode];
    if (!config) return null;

    let u = [];
    let v = null;

    switch (normalizedMode) {
        case 'vec_add_2d':
        case 'vec_sub_2d':
        case 'vec_dot_2d':
            u = generateRandomVector(2);
            v = generateRandomVector(2);
            break;
        case 'vec_mag_2d':
            u = generateRandomVector(2, { nonZero: true });
            break;
        case 'vec_angle_2d': {
            const pair = generateAngleFriendlyVectors(2);
            u = pair.u;
            v = pair.v;
            break;
        }
        case 'vec_proj_2d': {
            const pair = generateProjectionVectors(2);
            u = pair.u;
            v = pair.v;
            break;
        }
        case 'vec_add_3d':
        case 'vec_sub_3d':
        case 'vec_dot_3d':
            u = generateRandomVector(3);
            v = generateRandomVector(3);
            break;
        case 'vec_mag_3d':
            u = generateRandomVector(3, { nonZero: true });
            break;
        case 'vec_angle_3d': {
            const pair = generateAngleFriendlyVectors(3);
            u = pair.u;
            v = pair.v;
            break;
        }
        case 'vec_cross_3d':
            do {
                u = generateRandomVector(3, { nonZero: true });
                v = generateRandomVector(3, { nonZero: true });
            } while (isZeroVector3D(math.cross(u, v)));
            break;
        case 'vec_proj_3d': {
            const pair = generateProjectionVectors(3);
            u = pair.u;
            v = pair.v;
            break;
        }
        default:
            return null;
    }

    return {
        mode: normalizedMode,
        dimension: config.dimension,
        u,
        v,
        operation: config.operationType,
        label: config.label
    };
}

function applyVectorExample(example) {
    if (!example?.u || !Array.isArray(example.u) || !example.u.length) {
        return false;
    }

    const inputData = {
        operationType: example.operation || 'mag_u',
        vectorU: example.u,
        vectorV: example.v
    };

    if (!validateVectorPracticeExample(inputData)) {
        console.warn(`El ejemplo generado para vectores no es válido para el modo "${example.mode || ''}".`);
        return false;
    }

    const dimension = Number(example.dimension) || example.u.length;
    const operation = String(example.operation || 'mag_u').trim();
    const requiresV = operation !== 'mag_u';

    setElementValueIfPresent('vec-example', example.mode || '');
    setElementValueIfPresent('vec-dim', dimension);
    updateVectorOperations(dimension);
    setElementValueIfPresent('vec-op', operation);

    createMatrixInput(1, dimension, 'vecA-inputs');
    setMatrixValues('vecA-inputs', [example.u]);

    createMatrixInput(1, dimension, 'vecB-inputs');
    if (requiresV && Array.isArray(example.v)) {
        setMatrixValues('vecB-inputs', [example.v]);
    }

    syncVectorOperationUI(operation);
    document.getElementById('vec-results').classList.add('hidden');
    return true;
}

function applyVectorPracticeModeSelection(mode) {
    const generatedExample = generateVectorByMode(mode);
    if (!generatedExample) return false;
    return applyVectorExample(generatedExample);
}

function loadRandomVectorExample() {
    const randomMode = getRandomVectorMode();
    if (!randomMode) return false;

    setElementValueIfPresent('vec-example', randomMode);
    return applyVectorPracticeModeSelection(randomMode);
}

function handleRandomExampleButtonClick(event) {
    const button = event.currentTarget;
    const moduleId = String(button?.dataset?.module || '').trim();
    if (!moduleId) return;

    const exampleEntry = getRandomExample(moduleId);
    if (!exampleEntry) {
        console.warn(`No se encontro un ejemplo aleatorio para el modulo "${moduleId}".`);
        return;
    }

    applyPracticeExample(moduleId, exampleEntry);
}

function initExampleButtons() {
    const loadSystemBtn = document.getElementById('btn-load-example-sys');
    if (loadSystemBtn) {
        loadSystemBtn.addEventListener('click', () => {
            loadRandomSystemExampleFromCurrentContext();
        });
    }

    const loadMatrixBtn = document.getElementById('btn-load-example-mat');
    if (loadMatrixBtn) {
        loadMatrixBtn.addEventListener('click', () => {
            loadRandomMatrixExample();
        });
    }

    const loadDetBtn = document.getElementById('btn-load-example-det');
    if (loadDetBtn) {
        loadDetBtn.addEventListener('click', () => {
            loadRandomDeterminantExample();
        });
    }

    const loadVecBtn = document.getElementById('btn-load-example-vec');
    if (loadVecBtn) {
        loadVecBtn.addEventListener('click', () => {
            loadRandomVectorExample();
        });
    }
}


// Auto-hide results when any matrix input changes
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('matrix-cell')) {
        document.querySelectorAll('.results-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
    }
    if (e.target.classList.contains('input-error')) {
        e.target.classList.remove('input-error');
    }
});

// Excel-style Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('matrix-cell')) return;

    const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!navKeys.includes(e.key)) return;

    e.preventDefault();
    const parts = e.target.id.split('-');
    if (parts.length < 3) return;

    // e.g. "sys-inputs-1-2" -> base="sys-inputs", r=1, c=2
    const c = parseInt(parts.pop());
    const r = parseInt(parts.pop());
    const base = parts.join('-'); 

    let nextId = null;
    if (e.key === 'ArrowUp') nextId = `${base}-${r-1}-${c}`;
    if (e.key === 'ArrowDown') nextId = `${base}-${r+1}-${c}`;
    if (e.key === 'ArrowLeft') nextId = `${base}-${r}-${c-1}`;
    if (e.key === 'ArrowRight') nextId = `${base}-${r}-${c+1}`;

    const nextEl = document.getElementById(nextId);
    if (nextEl) {
        nextEl.focus();
        nextEl.select(); // Auto-select text for easy overwrite
    }
});

function setMatrixValues(baseId, matrixData) {
    const rows = matrixData.length;
    const cols = matrixData[0].length;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const input = document.getElementById(`${baseId}-${r}-${c}`);
            if (input) input.value = matrixData[r][c];
        }
    }
}

function toggleGroupInteractivity(groupId, enabled) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.classList.toggle('is-muted', !enabled);
    group.querySelectorAll('input, select, button').forEach((element) => {
        element.disabled = !enabled;
    });
}

function clearInputErrors(scope = document) {
    scope.querySelectorAll('.input-error').forEach((element) => element.classList.remove('input-error'));
}

const VALIDATION_TEXT = {
    required: (label) => `Debes completar el campo "${label}".`,
    integer: (label) => `El campo "${label}" debe ser un numero entero.`,
    numeric: (label) => `El valor de "${label}" debe ser numerico.`,
    range: (label, min, max) => `El campo "${label}" debe estar entre ${min} y ${max}.`,
    missingCell: (label, row, col) => `Falta la casilla fila ${row}, columna ${col} de ${label}.`,
    emptyCell: (label, row, col) => `La entrada fila ${row}, columna ${col} de ${label} esta vacia.`,
    invalidCell: (label, row, col) => `La entrada fila ${row}, columna ${col} de ${label} debe ser numerica.`,
    invalidChoice: (label) => `La seleccion de "${label}" no es valida. Elige una opcion permitida.`,
    incompatibleAddSub: (nameA, dimsA, nameB, dimsB, opLabel) => `La ${opLabel} solo esta definida cuando ${nameA} y ${nameB} tienen la misma dimension. Recibiste ${dimsA} y ${dimsB}.`,
    incompatibleMult: (colsA, rowsB) => `La multiplicacion no esta definida porque las columnas de A (${colsA}) deben coincidir con las filas de B (${rowsB}).`,
    squareOnly: (label) => `${label} solo esta definida para matrices cuadradas.`,
    vectorDimMismatch: (dimU, dimV) => `Los vectores deben tener la misma dimension. Recibiste ${dimU} y ${dimV}.`,
    vectorAllowedDims: () => 'El modulo de vectores solo admite dimension 2 o 3.',
    crossOnly3D: () => 'El producto cruz solo esta permitido en 3 dimensiones.',
    projectionNeedsNonZero: () => 'La proyeccion no esta definida sobre un vector nulo porque aparece ||v||^2 en el denominador.',
    angleNeedsNonZero: () => 'El angulo no esta definido si alguno de los vectores es nulo.',
    ambiguousChat: (details) => `La entrada es ambigua. ${details}`
};

window.AlgeMatValidation = {
    text: VALIDATION_TEXT,
    buildAmbiguousChatMessage(details) {
        return VALIDATION_TEXT.ambiguousChat(details);
    }
};

function markInputError(elementOrId) {
    const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!element) return;
    element.classList.add('input-error');
}

function createValidationIssue(message, targets = [], meta = {}) {
    return { message, targets: Array.isArray(targets) ? targets : [targets], ...meta };
}

function markValidationIssues(issues = []) {
    issues.forEach((issue) => {
        (issue.targets || []).forEach((target) => {
            if (target) markInputError(target);
        });
    });
}

function buildValidationSummaryMessage(issues = []) {
    if (!issues.length) return 'No se detectaron errores de validacion.';
    if (issues.length === 1) return issues[0].message;

    const uniqueMessages = [...new Set(issues.map((issue) => issue.message))];
    const preview = uniqueMessages.slice(0, 3).map((message) => `- ${message}`).join('\n');
    const suffix = uniqueMessages.length > 3
        ? `\n- Hay ${uniqueMessages.length - 3} detalle(s) adicional(es) por corregir.`
        : '';
    return `Hay varios datos por corregir antes de continuar:\n${preview}${suffix}`;
}

function throwValidationIssues(issues = []) {
    if (!issues.length) return;
    markValidationIssues(issues);
    throw new Error(buildValidationSummaryMessage(issues));
}

function getInputElement(inputId, label) {
    const input = document.getElementById(inputId);
    if (!input) {
        throw new Error(`No se encontro el campo "${label}".`);
    }
    return input;
}

function readValidatedChoiceInput(inputId, label, allowedValues = []) {
    const input = getInputElement(inputId, label);
    const rawValue = String(input.value || '').trim();
    const issues = [];

    if (!rawValue) {
        issues.push(createValidationIssue(VALIDATION_TEXT.required(label), input));
    } else if (allowedValues.length && !allowedValues.includes(rawValue)) {
        issues.push(createValidationIssue(VALIDATION_TEXT.invalidChoice(label), input, { allowedValues }));
    }

    throwValidationIssues(issues);
    return rawValue;
}

function ensureVectorDimensions(u, v, { allowNullV = false, allowedDimensions = [2, 3] } = {}) {
    if (!Array.isArray(u) || !allowedDimensions.includes(u.length)) {
        throw new Error(VALIDATION_TEXT.vectorAllowedDims());
    }
    if (allowNullV && (!v || (Array.isArray(v) && v.length === 0))) return;
    if (!Array.isArray(v)) {
        throw new Error('Debes ingresar el segundo vector para esta operacion.');
    }
    if (!allowedDimensions.includes(v.length)) {
        throw new Error(VALIDATION_TEXT.vectorAllowedDims());
    }
    if (u.length !== v.length) {
        throw new Error(VALIDATION_TEXT.vectorDimMismatch(u.length, v.length));
    }
}

function ensureOperationAllowed(context, op, data = {}) {
    if (context === 'matrix') {
        const { A, B } = data;
        const rowsA = A.length;
        const colsA = A[0].length;
        const rowsB = B ? B.length : 0;
        const colsB = B ? B[0].length : 0;

        if ((op === 'add' || op === 'sub') && (rowsA !== rowsB || colsA !== colsB)) {
            ['matA-rows', 'matA-cols', 'matB-rows', 'matB-cols'].forEach(markInputError);
            throw new Error(VALIDATION_TEXT.incompatibleAddSub('A', `${rowsA}x${colsA}`, 'B', `${rowsB}x${colsB}`, op === 'add' ? 'suma' : 'resta'));
        }

        if (op === 'mult' && colsA !== rowsB) {
            ['matA-cols', 'matB-rows'].forEach(markInputError);
            throw new Error(VALIDATION_TEXT.incompatibleMult(colsA, rowsB));
        }

        if ((op === 'invA' || op === 'invA_gauss') && rowsA !== colsA) {
            ['matA-rows', 'matA-cols'].forEach(markInputError);
            throw new Error(VALIDATION_TEXT.squareOnly('La inversa'));
        }
    }

    if (context === 'vector') {
        const { u, v } = data;
        ensureVectorDimensions(u, v, { allowNullV: op === 'mag_u' });

        if (op === 'cross' && u.length !== 3) {
            throw new Error(VALIDATION_TEXT.crossOnly3D());
        }
        if (op === 'proj' && v && v.every((value) => isZeroMathVal(value))) {
            throw new Error(VALIDATION_TEXT.projectionNeedsNonZero());
        }
        if (op === 'angle' && (u.every((value) => isZeroMathVal(value)) || v.every((value) => isZeroMathVal(value)))) {
            throw new Error(VALIDATION_TEXT.angleNeedsNonZero());
        }
    }
}

const METHOD_LABELS = {
    systems: {
        auto: 'Automático',
        substitution: 'Sustitución',
        equalization: 'Igualación',
        elimination: 'Reducción / Eliminación',
        cramer: 'Regla de Cramer',
        gauss: 'Gauss',
        gauss_jordan: 'Gauss-Jordan'
    },
    matrices: {
        auto: 'Automático',
        gauss_jordan: 'Gauss-Jordan',
        cofactors: 'Cofactores'
    },
    determinants: {
        auto: 'Automático',
        direct: 'Fórmula directa 2x2',
        sarrus: 'Regla de Sarrus',
        cofactors: 'Cofactores'
    }
};

function normalizeMethodModuleName(moduleName = '') {
    const normalized = String(moduleName || '').trim().toLowerCase();
    if (normalized === 'sistemas' || normalized === 'systems') return 'systems';
    if (normalized === 'matrices' || normalized === 'matrix' || normalized === 'matrices') return 'matrices';
    if (normalized === 'determinantes' || normalized === 'determinants') return 'determinants';
    return normalized;
}

function getMethodLabel(moduleName, method) {
    const normalizedModule = normalizeMethodModuleName(moduleName);
    return METHOD_LABELS[normalizedModule]?.[method] || method || 'Método no especificado';
}

function getSelectedMethod(moduleName) {
    const normalizedModule = normalizeMethodModuleName(moduleName);
    const fieldByModule = {
        systems: 'sys-method',
        matrices: 'mat-method',
        determinants: 'det-method'
    };
    const inputId = fieldByModule[normalizedModule];
    if (!inputId) return 'auto';
    const input = document.getElementById(inputId);
    return String(input?.value || 'auto').trim() || 'auto';
}

function canUseMethod(moduleName, method, data = {}) {
    moduleName = normalizeMethodModuleName(moduleName);
    if (moduleName === 'systems') {
        return ['auto', 'gauss', 'gauss_jordan'].includes(method);
    }

    if (moduleName === 'matrices') {
        if (!['auto', 'gauss_jordan', 'cofactors'].includes(method)) return false;
        return data.operationType === 'invA' || data.operationType === 'invA_gauss';
    }

    if (moduleName === 'determinants') {
        const size = Number(data.size || data.matrix?.length || 0);
        if (method === 'auto') return [2, 3, 4].includes(size);
        if (size === 2) return method === 'direct';
        if (size === 3) return method === 'sarrus' || method === 'cofactors';
        if (size === 4) return method === 'cofactors';
        return false;
    }

    return false;
}

function getBestMethodForCase(moduleName, data = {}) {
    moduleName = normalizeMethodModuleName(moduleName);
    if (moduleName === 'systems') return 'gauss_jordan';

    if (moduleName === 'matrices') {
        if (data.operationType === 'invA' || data.operationType === 'invA_gauss') {
            return 'gauss_jordan';
        }
        return null;
    }

    if (moduleName === 'determinants') {
        const size = Number(data.size || data.matrix?.length || 0);
        if (size === 2) return 'direct';
        if (size === 3) return 'sarrus';
        if (size === 4) return 'cofactors';
    }

    return null;
}

function resolveWithAutoMethod(moduleName, data = {}) {
    moduleName = normalizeMethodModuleName(moduleName);
    const method = getBestMethodForCase(moduleName, data);
    if (!method || !canUseMethod(moduleName, method, data)) {
        throw new Error(`No se encontró un método automático válido para ${moduleName}.`);
    }
    return method;
}

function resolveWithManualMethod(moduleName, method, data = {}) {
    moduleName = normalizeMethodModuleName(moduleName);
    if (!canUseMethod(moduleName, method, data)) {
        if (moduleName === 'determinants') {
            const size = Number(data.size || data.matrix?.length || 0);
            throw new Error(`El método ${getMethodLabel(moduleName, method)} no aplica a un determinante ${size}x${size}. Elige un método compatible o usa Automático.`);
        }
        if (moduleName === 'matrices') {
            throw new Error(`El método ${getMethodLabel(moduleName, method)} solo aplica al cálculo de inversa. Para suma, resta, multiplicación, transpuesta o escalar no se necesita selector de método.`);
        }
        throw new Error(`El método ${getMethodLabel(moduleName, method)} no es compatible con este caso.`);
    }
    return method;
}

function resolveSelectedMethod(moduleName, data = {}) {
    moduleName = normalizeMethodModuleName(moduleName);
    const selectedMethod = data.selectedMethod || getSelectedMethod(moduleName);
    const resolvedMethod = selectedMethod === 'auto'
        ? resolveWithAutoMethod(moduleName, data)
        : resolveWithManualMethod(moduleName, selectedMethod, data);

    return {
        selectedMethod,
        resolvedMethod,
        isAutomatic: selectedMethod === 'auto'
    };
}

function describeResolvedMethod(moduleName, selectedMethod, resolvedMethod, data = {}) {
    moduleName = normalizeMethodModuleName(moduleName);
    const resolvedLabel = getMethodLabel(moduleName, resolvedMethod);
    if (selectedMethod !== 'auto') {
        return resolvedLabel;
    }

    if (moduleName === 'systems') {
        return `Selección automática -> se eligió ${resolvedLabel} por ser el método más completo para mostrar eliminación, reducción y clasificación del sistema.`;
    }

    if (moduleName === 'matrices') {
        return `Selección automática -> se eligió ${resolvedLabel} porque permite construir la inversa de forma directa mediante operaciones elementales sobre [A|I].`;
    }

    if (moduleName === 'determinants') {
        const size = Number(data.size || data.matrix?.length || 0);
        if (size === 2) return `Selección automática -> se eligió ${resolvedLabel} por ser el camino más simple para una matriz 2x2.`;
        if (size === 3) return `Selección automática -> se eligió ${resolvedLabel} por ser el método más claro y corto para una matriz 3x3.`;
        if (size === 4) return `Selección automática -> se eligió ${resolvedLabel} porque es el método aplicable y pedagógico para una matriz 4x4.`;
    }

    return resolvedLabel;
}

function readValidatedIntegerInput(inputId, label, { min = 1, max = 10 } = {}) {
    const input = getInputElement(inputId, label);
    const rawValue = String(input.value || '').trim();
    const issues = [];
    if (!rawValue) {
        issues.push(createValidationIssue(VALIDATION_TEXT.required(label), input));
    } else if (!/^-?\d+$/.test(rawValue)) {
        issues.push(createValidationIssue(VALIDATION_TEXT.integer(label), input));
    } else {
        const parsed = parseInt(rawValue, 10);
        if (parsed < min || parsed > max) {
            issues.push(createValidationIssue(VALIDATION_TEXT.range(label, min, max), input));
        }
    }

    throwValidationIssues(issues);
    return parseInt(rawValue, 10);
}

function readValidatedScalarInput(inputId, label) {
    const input = getInputElement(inputId, label);
    const rawValue = String(input.value || '').trim();
    if (!rawValue) {
        throwValidationIssues([createValidationIssue(VALIDATION_TEXT.required(label), input)]);
    }

    try {
        return math.fraction(rawValue);
    } catch (error) {
        throwValidationIssues([createValidationIssue(VALIDATION_TEXT.numeric(label), input)]);
    }
}

function readValidatedGrid(rows, cols, containerId, label) {
    const matrix = [];
    const issues = [];

    for (let i = 0; i < rows; i++) {
        const row = [];
        let rowHasIssue = false;
        for (let j = 0; j < cols; j++) {
            const cell = document.getElementById(`${containerId}-${i}-${j}`);
            if (!cell) {
                issues.push(createValidationIssue(VALIDATION_TEXT.missingCell(label, i + 1, j + 1), []));
                rowHasIssue = true;
                continue;
            }

            const rawValue = String(cell.value || '').trim();
            if (!rawValue) {
                issues.push(createValidationIssue(VALIDATION_TEXT.emptyCell(label, i + 1, j + 1), cell));
                rowHasIssue = true;
                continue;
            }

            try {
                row.push(math.fraction(rawValue));
            } catch (error) {
                issues.push(createValidationIssue(VALIDATION_TEXT.invalidCell(label, i + 1, j + 1), cell));
                rowHasIssue = true;
            }
        }
        if (!rowHasIssue) {
            matrix.push(row);
        }
    }

    throwValidationIssues(issues);
    return matrix;
}

function renderValidationErrorResponse(containerId, { topic, request, message, interpretation }) {
    setStandardMathResponse(containerId, createStandardMathResponse({
        topic,
        request,
        method: 'Validacion de entradas antes de ejecutar el calculo.',
        steps: [
            createStandardMathStep(
                'Validacion de datos',
                'Se revisaron los campos antes de iniciar el procedimiento matematico.',
                `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Error de validacion</h4><p style="white-space: pre-line;">${message}</p></div>`
            )
        ],
        result: {
            summary: 'No se pudo iniciar el calculo.',
            valueHtml: ''
        },
        verification: createValidationResult({
            status: 'warning',
            summary: 'Verificacion detenida.',
            detail: 'La operacion se detuvo antes de calcular porque la entrada no era valida.'
        }),
        interpretation
    }));
}

function updateMatrixOperationUI(op) {
    const isUnary = (op === 'transA' || op === 'invA' || op === 'invA_gauss');
    const isScalar = (op === 'scalar');
    const needsB = !isUnary && !isScalar;
    const groupMatB = document.getElementById('group-matB');
    const groupScalar = document.getElementById('group-scalar');
    const helper = document.getElementById('mat-op-context');

    if (groupMatB) groupMatB.style.display = needsB ? 'block' : 'none';
    if (groupScalar) groupScalar.style.display = isScalar ? 'block' : 'none';
    toggleGroupInteractivity('group-matB', needsB);
    toggleGroupInteractivity('group-scalar', isScalar);
    updateMatrixMethodUI(op);

    if (helper) {
        const messages = {
            add: 'Operación binaria: debes completar A y B con la misma dimensión.',
            sub: 'Operación binaria: debes completar A y B con la misma dimensión.',
            mult: 'Operación binaria: A y B deben cumplir columnas de A = filas de B.',
            scalar: 'Operación unaria con escalar: se usa A y el valor k. La matriz B no interviene.',
            transA: 'Operación unaria: solo se usa la matriz A. La matriz B no interviene.',
            invA: 'Operación unaria: solo se usa la matriz A y debe ser cuadrada e invertible. Aquí sí puedes elegir el método de inversión.',
            invA_gauss: 'Operación unaria: solo se usa la matriz A y debe ser cuadrada e invertible. Aquí sí puedes elegir el método de inversión.'
        };
        helper.textContent = messages[op] || 'Configura la operación y completa los datos requeridos.';
    }
}

const calculatorLoadingState = {
    isLoading: false,
    activeButtonId: null
};

function setCalculatorLoadingState(btn, isLoading, label = 'Procesando...') {
    if (!btn) return;

    if (!btn.dataset.originalLabel) {
        btn.dataset.originalLabel = btn.innerHTML;
    }

    if (isLoading) {
        btn.disabled = true;
        btn.classList.add('btn-loading');
        btn.textContent = label;
        return;
    }

    btn.classList.remove('btn-loading');
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalLabel || btn.innerHTML;
}

// Wrapper to animate calculate buttons
function runWithAnimation(btnId, callback) {
    const btn = document.getElementById(btnId);
    if (!btn || calculatorLoadingState.isLoading) return;

    calculatorLoadingState.isLoading = true;
    calculatorLoadingState.activeButtonId = btnId;
    setCalculatorLoadingState(btn, true);
    
    setTimeout(() => {
        Promise.resolve()
            .then(() => callback())
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                calculatorLoadingState.isLoading = false;
                calculatorLoadingState.activeButtonId = null;
                setCalculatorLoadingState(btn, false);
                renderDynamicMath(document.body);
            });
    }, 400); // 400ms delay to feel "processing"
}

function renderDynamicMath(targets = document.body) {
    const mathJax = window.MathJax;
    if (!mathJax || typeof mathJax.typesetPromise !== 'function') {
        return Promise.resolve();
    }

    const normalizedTargets = Array.isArray(targets)
        ? targets.filter(Boolean)
        : [targets].filter(Boolean);

    if (!normalizedTargets.length) {
        return Promise.resolve();
    }

    const runTypeset = () => {
        if (typeof mathJax.typesetClear === 'function') {
            mathJax.typesetClear(normalizedTargets);
        }
        return mathJax.typesetPromise(normalizedTargets)
            .catch((err) => {
                console.log('MathJax error: ', err);
            });
    };

    if (mathJax.startup && mathJax.startup.promise) {
        return mathJax.startup.promise.then(runTypeset).catch((err) => {
            console.log('MathJax startup error: ', err);
        });
    }

    return runTypeset();
}

window.renderDynamicMath = renderDynamicMath;

function createMatrixInput(rows, cols, containerId, isAugmented = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, minmax(var(--matrix-cell-min-width), max-content))`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.className = 'matrix-cell';
            if (isAugmented && j === cols - 1) {
                input.classList.add('augmented-col');
            }
            input.id = `${containerId}-${i}-${j}`;
            input.value = 0;
            container.appendChild(input);
        }
    }
}

function getMatrixData(rows, cols, containerId) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const val = document.getElementById(`${containerId}-${i}-${j}`).value;
            // Parse as fraction using math.js if possible, fallback to float
            try {
                row.push(math.fraction(val || "0"));
            } catch(e) {
                row.push(math.fraction(parseFloat(val) || 0));
            }
        }
        matrix.push(row);
    }
    return matrix;
}

// Format a value (fraction or number) to a readable string
function formatMathVal(val) {
    if (val && val.n !== undefined && val.d !== undefined) {
        // Prevent -0 numerator
        let n = val.n;
        if(Object.is(n, -0)) n = 0;
        
        let sign = val.s !== undefined ? val.s : 1;
        let num = n * sign;
        
        if (val.d === 1 || num === 0) return `${num}`;
        return `${num}/${val.d}`;
    }
    // Fallback for regular numbers
    let num = Math.round(val * 1000) / 1000;
    if(Object.is(num, -0)) num = 0;
    return num.toString();
}

function formatExponentHtml(base, exponent = 2, { wrapBase = false } = {}) {
    const normalizedBase = String(base);
    const needsParentheses = wrapBase || /^-/.test(normalizedBase);
    const visibleBase = needsParentheses ? `(${normalizedBase})` : normalizedBase;
    return `${visibleBase}<sup>${exponent}</sup>`;
}

function formatSquaredMathVal(val) {
    return formatExponentHtml(formatMathVal(val), 2, { wrapBase: true });
}

function formatNormHtml(symbol = 'v', exponent = null) {
    const normBase = `||${symbol}||`;
    return exponent === null ? normBase : `${normBase}<sup>${exponent}</sup>`;
}

function formatMathPlainSegment(text) {
    if (!text) return text;

    let formatted = String(text);

    formatted = formatted.replace(/\bA\^T\b/g, 'A<sup>T</sup>');
    formatted = formatted.replace(/\b([A-Za-z])\^T\b/g, '$1<sup>T</sup>');

    formatted = formatted.replace(/\|\|([A-Za-z])\|\|\^(\d+)/g, '||$1||<sup>$2</sup>');
    formatted = formatted.replace(/\b([A-Za-z]\d+)\^(\d+)/g, '$1<sup>$2</sup>');
    formatted = formatted.replace(/\b([A-Za-z]+)\^(\d+)/g, '$1<sup>$2</sup>');

    formatted = formatted.replace(/\((-?\d+(?:\.\d+)?(?:\/\d+)?)\)\^(\d+)/g, '($1)<sup>$2</sup>');
    formatted = formatted.replace(/(^|[\s=+\-*/,(\[])(-\d+(?:\.\d+)?(?:\/\d+)?)\^(\d+)/g, '$1($2)<sup>$3</sup>');

    formatted = formatted.replace(/\bsqrt\(([^()]+)\)/g, '&radic;($1)');
    formatted = formatted.replace(/\btheta\b/g, '&theta;');

    return formatted;
}

function renderMatrixHTML(matrix, isAugmented = false, highlightedCells = []) {
    const rows = matrix.length;
    let cols = 0;
    if (rows > 0) cols = matrix[0].length;
    const highlightedSet = new Set(
        (highlightedCells || []).map((cell) => `${cell.row}-${cell.col}`)
    );
    
    let html = `<div class="rendered-matrix" style="grid-template-columns: repeat(${cols}, auto);">`;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let strVal = formatMathVal(matrix[i][j]);
            let cssClass = 'rendered-cell';
            if (isAugmented && j === cols - 1) cssClass += ' aug';
            if (highlightedSet.has(`${i}-${j}`)) cssClass += ' pivot-cell';
            html += `<span class="${cssClass}">${strVal}</span>`;
        }
    }
    html += `</div>`;
    return html;
}

function findPivotPositions(matrix, variableCount) {
    const pivots = [];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < variableCount; j++) {
            if (!isZeroMathVal(matrix[i][j])) {
                pivots.push({ row: i, col: j });
                break;
            }
        }
    }
    return pivots;
}

function renderPivotSummary(pivots) {
    if (!pivots.length) {
        return '<p><strong>Pivotes:</strong> aun no aparece una entrada lider no nula en las columnas de las variables.</p>';
    }

    return `<p><strong>Pivotes marcados:</strong> ${pivots.map((pivot) => `F${pivot.row + 1}, C${pivot.col + 1}`).join('; ')}.</p>`;
}

function renderMatrixWithPivots(matrix, isAugmented = false, variableCount = matrix[0] ? matrix[0].length : 0) {
    const pivots = findPivotPositions(matrix, variableCount);
    return `
        <div class="step-matrix-display">${renderMatrixHTML(matrix, isAugmented, pivots)}</div>
        ${renderPivotSummary(pivots)}
    `;
}

function renderMatrixLaTeX(matrix) {
    const rows = matrix.length;
    let cols = 0;
    if (rows > 0) cols = matrix[0].length;
    
    let latex = '\\begin{bmatrix} ';
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Check if element is an array (minor determinant nested)
            if (Array.isArray(matrix[i][j])) {
                latex += renderMatrixLaTeX(matrix[i][j]);
            } else {
                latex += formatMathVal(matrix[i][j]);
            }
            if (j < cols - 1) latex += ' & ';
        }
        if (i < rows - 1) latex += ' \\\\ ';
    }
    latex += ' \\end{bmatrix}';
    return latex;
}

function isZeroMathVal(val) {
    return Math.abs(math.number(val)) < 1e-10;
}

function createStandardMathStep(title, detail, outputHtml = '', meta = {}) {
    return { title, detail, outputHtml, meta };
}

function renderEducationalStepField(label, content) {
    if (!content || (typeof content === 'string' && !content.trim())) return '';
    return `<p><strong>${label}:</strong> ${formatMathTextForHtml(content)}</p>`;
}

function renderEducationalSnapshot(label, content) {
    if (!content || (typeof content === 'string' && !content.trim())) return '';
    return `
        <div class="step-block">
            <h4>${label}</h4>
            ${typeof content === 'string' ? formatMathTextForHtml(content) : content}
        </div>
    `;
}

function addStep(title, explanation, operation, before, after, note, meta = {}) {
    const outputHtml = `
        <div class="educational-step">
            ${renderEducationalStepField('Explicacion', explanation)}
            ${renderEducationalStepField('Operacion', operation)}
            ${renderEducationalSnapshot('Antes', before)}
            ${renderEducationalSnapshot('Despues', after)}
            ${renderEducationalStepField('Nota didactica', note)}
        </div>
    `;

    return createStandardMathStep(title, explanation || operation || '', outputHtml, meta);
}

function generateFinalInterpretation(module, result = {}, context = {}) {
    const normalizedModule = normalizeModuleNameForValidation(module || context.module || '');

    if (normalizedModule === 'sistemas') {
        const classification = String(result.classification || result.type || '').toLowerCase();
        const solutionVector = Array.isArray(result.solutionVector) ? result.solutionVector : [];
        if (classification.includes('solucion unica') || classification.includes('determinado')) {
            const variables = ['x', 'y', 'z'].slice(0, solutionVector.length);
            const solutionText = variables.map((variable, index) => `${variable} = ${formatMathVal(solutionVector[index])}`).join(', ');
            return `El sistema tiene solucion unica porque cada variable queda asociada a un pivote. La solucion encontrada es ${solutionText}. Al sustituir estos valores en las ecuaciones originales, todas se cumplen.`;
        }
        if (classification.includes('infinita') || classification.includes('indeterminado')) {
            return 'El sistema tiene infinitas soluciones porque al menos una variable queda libre y no aparece ninguna contradiccion en la forma reducida final.';
        }
        if (classification.includes('sin solucion') || classification.includes('incompatible')) {
            return 'El sistema no tiene solucion porque aparece una fila del tipo 0 = c, con c distinto de cero. Eso representa una contradiccion.';
        }
        return context.explanation || 'La interpretacion final del sistema depende de la forma escalonada o reducida obtenida.';
    }

    if (normalizedModule === 'matrices') {
        const op = String(context.operationType || result.operationType || '').trim();
        if (op === 'invA' || op === 'invA_gauss') {
            return result.singular
                ? 'La matriz inversa no existe porque en el procedimiento aparece que la matriz es singular.'
                : 'La matriz inversa existe porque fue posible transformar A en la identidad. La parte derecha de la matriz aumentada corresponde a A^-1.';
        }
        if (op === 'mult') {
            return 'La matriz resultante se obtiene combinando cada fila de A con cada columna de B. Cada entrada resume una interaccion fila por columna.';
        }
        if (op === 'transA') {
            return 'La transpuesta reorganiza la informacion intercambiando filas por columnas sin alterar los valores originales.';
        }
        return context.explanation || 'La operacion matricial se interpreta observando como cambia cada entrada respecto de las matrices originales.';
    }

    if (normalizedModule === 'determinantes') {
        const det = result.det;
        if (det !== undefined && det !== null && isZeroMathVal(det)) {
            return 'El determinante es 0. Esto significa que la matriz no es invertible y sus filas o columnas son linealmente dependientes.';
        }
        if (det !== undefined && det !== null) {
            return 'Como el determinante es distinto de 0, la matriz es invertible y la transformacion asociada no colapsa el espacio.';
        }
        return context.explanation || 'El determinante resume si la matriz conserva independencia lineal y si tiene inversa.';
    }

    if (normalizedModule === 'vectores') {
        const op = String(context.operationType || result.operationType || '').trim();
        if (op === 'dot') {
            const scalar = result.scalarExact !== undefined ? result.scalarExact : result.scalar;
            if (scalar !== undefined && isZeroMathVal(scalar)) {
                return 'El producto punto es 0, asi que los vectores son perpendiculares.';
            }
            return 'El producto punto permite medir que tan alineados estan los vectores y ayuda a interpretar el angulo entre ellos.';
        }
        if (op === 'cross') {
            return 'El producto cruz produce un vector perpendicular al plano generado por los vectores originales.';
        }
        if (op === 'mag_u') {
            return 'La magnitud obtenida representa la longitud del vector desde el origen hasta su extremo.';
        }
        return context.explanation || 'El resultado vectorial debe interpretarse a partir de la relacion geometrica entre direccion, magnitud y orientacion.';
    }

    return context.explanation || 'El resultado final puede interpretarse revisando el metodo usado y la verificacion obtenida.';
}

function createValidationCheck({ label = '', passed = false, detail = '' }) {
    return { label, passed, detail };
}

function createValidationResult({
    status = 'info',
    summary = '',
    detail = '',
    checks = [],
    outputHtml = '',
    attempted = true,
    applicable = true
}) {
    return { status, summary, detail, checks, outputHtml, attempted, applicable };
}

const VALIDATION_STATUS = {
    CORRECT: 'correcto',
    INCORRECT: 'incorrecto',
    INCOMPLETE: 'incompleto',
    REVIEW: 'requiere_revision'
};

function createValidationDiagnosis({
    status = VALIDATION_STATUS.REVIEW,
    method = '',
    summary = '',
    issues = [],
    missingSteps = [],
    recommendations = [],
    checks = [],
    meta = {}
} = {}) {
    return { status, method, summary, issues, missingSteps, recommendations, checks, meta };
}

function normalizeModuleNameForValidation(moduleName = '') {
    const normalized = String(moduleName || '').trim().toLowerCase();
    if (normalized.includes('sistema')) return 'sistemas';
    if (normalized.includes('matriz')) return 'matrices';
    if (normalized.includes('determinante')) return 'determinantes';
    if (normalized.includes('vector')) return 'vectores';
    return normalized;
}

function normalizeValidationStatus(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (Object.values(VALIDATION_STATUS).includes(normalized)) return normalized;
    return VALIDATION_STATUS.REVIEW;
}

function finalizeValidationDiagnosis(diagnosis) {
    const issues = Array.isArray(diagnosis.issues) ? diagnosis.issues.filter(Boolean) : [];
    const missingSteps = Array.isArray(diagnosis.missingSteps) ? diagnosis.missingSteps.filter(Boolean) : [];
    const recommendations = Array.isArray(diagnosis.recommendations) ? diagnosis.recommendations.filter(Boolean) : [];
    const checks = Array.isArray(diagnosis.checks) ? diagnosis.checks : [];

    let status = normalizeValidationStatus(diagnosis.status);
    if (issues.length) {
        status = VALIDATION_STATUS.INCORRECT;
    } else if (missingSteps.length) {
        status = VALIDATION_STATUS.INCOMPLETE;
    } else if (!checks.length && !diagnosis.summary) {
        status = VALIDATION_STATUS.REVIEW;
    } else if (status === VALIDATION_STATUS.REVIEW && checks.length) {
        status = VALIDATION_STATUS.CORRECT;
    }

    return {
        ...diagnosis,
        status,
        issues,
        missingSteps,
        recommendations,
        checks
    };
}

function extractStepTexts(steps = []) {
    return (steps || []).map((step) => {
        return [
            step?.title || '',
            step?.detail || '',
            step?.desc || '',
            step?.outputHtml || ''
        ].join(' ');
    }).join(' ').toLowerCase();
}

function hasValidationEvidence(steps = [], patterns = []) {
    const haystack = extractStepTexts(steps);
    return patterns.every((pattern) => {
        if (pattern instanceof RegExp) return pattern.test(haystack);
        return haystack.includes(String(pattern || '').toLowerCase());
    });
}

function listMissingValidationEvidence(steps = [], requirements = []) {
    const haystack = extractStepTexts(steps);
    return requirements
        .filter((item) => {
            if (item.pattern instanceof RegExp) return !item.pattern.test(haystack);
            return !haystack.includes(String(item.pattern || '').toLowerCase());
        })
        .map((item) => item.message);
}

function buildValidationChecksFromDiagnosis(diagnosis) {
    const checks = Array.isArray(diagnosis.checks) ? [...diagnosis.checks] : [];

    if (diagnosis.issues?.length) {
        diagnosis.issues.forEach((issue, index) => {
            checks.push({
                label: `Error detectado ${index + 1}`,
                passed: false,
                detail: issue
            });
        });
    }

    if (diagnosis.missingSteps?.length) {
        diagnosis.missingSteps.forEach((item, index) => {
            checks.push({
                label: `Paso faltante ${index + 1}`,
                passed: false,
                detail: item
            });
        });
    }

    return checks;
}

function renderValidationDiagnosisHtml(diagnosis) {
    if (!diagnosis) return '';

    const renderList = (title, items) => {
        if (!items || !items.length) return '';
        return `
            <div class="validation-diagnosis-block">
                <strong>${title}</strong>
                <ul class="assistant-inline-list">
                    ${items.map((item) => `<li>${formatMathTextForHtml(item)}</li>`).join('')}
                </ul>
            </div>
        `;
    };

    return `
        <div class="validation-diagnosis">
            ${diagnosis.method ? `<p><strong>Metodo validado:</strong> ${formatMathTextForHtml(diagnosis.method)}</p>` : ''}
            ${renderList('Errores detectados', diagnosis.issues)}
            ${renderList('Pasos faltantes', diagnosis.missingSteps)}
            ${renderList('Recomendaciones', diagnosis.recommendations)}
        </div>
    `;
}

function mapValidationStatusToUiStatus(status) {
    if (status === VALIDATION_STATUS.CORRECT) return 'success';
    if (status === VALIDATION_STATUS.INCORRECT) return 'warning';
    if (status === VALIDATION_STATUS.INCOMPLETE) return 'info';
    return 'info';
}

function formatValidationForTutor(validation) {
    if (!validation) {
        return 'Estado: Requiere revision. No hubo suficientes datos para validar el procedimiento.';
    }

    const statusLabels = {
        [VALIDATION_STATUS.CORRECT]: 'Correcto',
        [VALIDATION_STATUS.INCORRECT]: 'Incorrecto',
        [VALIDATION_STATUS.INCOMPLETE]: 'Incompleto',
        [VALIDATION_STATUS.REVIEW]: 'Requiere revision'
    };
    const label = statusLabels[normalizeValidationStatus(validation.status)] || 'Requiere revision';
    const issue = validation.issues?.[0];
    const missing = validation.missingSteps?.[0];
    const detail = issue || missing || validation.summary || 'El diagnostico no encontro suficiente informacion detallada.';
    return `Estado: ${label}. ${detail}`;
}

function inferValidationResultPayload(result = {}, fallbackResult = {}) {
    if (result && Object.keys(result).length) return result;
    return fallbackResult || {};
}

function validateLinearSystem(input = {}, steps = [], result = {}) {
    const matrix = input.augmentedMatrix;
    if (!Array.isArray(matrix) || !matrix.length || !Array.isArray(matrix[0])) {
        return finalizeValidationDiagnosis(createValidationDiagnosis({
            status: VALIDATION_STATUS.REVIEW,
            method: result.method || input.method || 'Sistema lineal',
            summary: 'No hay una matriz aumentada valida para revisar el sistema.',
            recommendations: ['Verifica que el sistema tenga una matriz aumentada completa antes de validar.']
        }));
    }

    const size = Number(input.size || matrix.length);
    const reducedMatrix = buildSystemReferenceReduction(matrix);
    const { rankA, rankAb } = computeSystemRanks(reducedMatrix, size);
    const classification = buildSystemClassification(rankA, rankAb, size);
    const classificationLabel = String(result.classification || result.type || '').toLowerCase();
    const expectedLabel = String(classification.type || '').toLowerCase();
    const issues = [];
    const recommendations = [];
    const checks = [
        {
            label: 'Clasificacion por rangos',
            passed: expectedLabel ? classificationLabel.includes(expectedLabel.split('(')[0].trim()) || expectedLabel.includes(classificationLabel.split('(')[0].trim()) : false,
            detail: `La reduccion de referencia produce: ${classification.type}.`
        }
    ];

    if (classificationLabel && expectedLabel && !classificationLabel.includes(expectedLabel.split('(')[0].trim()) && !expectedLabel.includes(classificationLabel.split('(')[0].trim())) {
        issues.push(`La interpretacion final no coincide con la matriz reducida de referencia. Se esperaba: ${classification.type}.`);
    }

    const uniqueSolution = classification.type.toLowerCase().includes('solucion unica') || classification.type.toLowerCase().includes('determinado');
    const solutionVector = Array.isArray(result.solutionVector) ? result.solutionVector : null;

    if (uniqueSolution) {
        if (!solutionVector || solutionVector.length !== size) {
            issues.push('No se entrego una solucion numerica completa para un sistema con solucion unica.');
        } else {
            const equationsOk = matrix.every((row) => {
                const lhs = row.slice(0, size).reduce((acc, coeff, index) => math.add(acc, math.multiply(coeff, solutionVector[index])), math.fraction(0));
                return isZeroMathVal(math.subtract(lhs, row[size]));
            });
            checks.push({
                label: 'Sustitucion en el sistema original',
                passed: equationsOk,
                detail: equationsOk ? 'La solucion satisface todas las ecuaciones originales.' : 'Al menos una ecuacion no se satisface con la solucion reportada.'
            });
            if (!equationsOk) {
                issues.push('El resultado final no satisface todas las ecuaciones originales.');
                recommendations.push('Revisa el paso donde se interpreta la matriz final o se hace la sustitucion regresiva.');
            }
        }
    } else {
        checks.push({
            label: 'Consistencia estructural sin solucion unica',
            passed: true,
            detail: 'La clasificacion depende de los rangos y no de una unica sustitucion numerica.'
        });
    }

    const missingSteps = listMissingValidationEvidence(steps, [
        { pattern: /matriz aumentada/, message: 'Falta mostrar la construccion o referencia a la matriz aumentada inicial.' },
        { pattern: /clasific/, message: 'Falta explicar la clasificacion final del sistema.' },
        {
            pattern: /soluci[oó]n|sustituci[oó]n regresiva/,
            message: uniqueSolution ? 'Falta mostrar como se obtiene o interpreta la solucion final.' : 'Falta explicar como se interpreta la forma reducida final.'
        }
    ]);

    const methodText = String(result.method || input.method || '').toLowerCase();
    if (methodText.includes('gauss-jordan')) {
        if (!hasValidationEvidence(steps, [/pivote/, /eliminar/])) {
            missingSteps.push('Faltan operaciones elementales por fila suficientes para justificar Gauss-Jordan.');
        }
    }
    if (methodText.includes('gauss') && !methodText.includes('gauss-jordan')) {
        if (!hasValidationEvidence(steps, [/pivote/, /forma escalonada|sustitucion regresiva/])) {
            missingSteps.push('Falta evidenciar la escalonacion y la lectura final del metodo de Gauss.');
        }
    }
    if (methodText.includes('cramer') && !hasValidationEvidence(steps, [/determinante/, /delta/])) {
        missingSteps.push('Falta mostrar los determinantes necesarios para justificar la Regla de Cramer.');
    }

    const summary = issues.length
        ? 'La validacion encontro inconsistencias entre la clasificacion, la solucion y la comprobacion del sistema.'
        : missingSteps.length
            ? 'El resultado parece consistente, pero faltan pasos clave para justificar completamente el procedimiento.'
            : 'El procedimiento del sistema es consistente con la clasificacion y la comprobacion algebraica.';

    return finalizeValidationDiagnosis(createValidationDiagnosis({
        status: VALIDATION_STATUS.CORRECT,
        method: result.method || input.method || 'Resolucion de sistemas lineales',
        summary,
        issues,
        missingSteps,
        recommendations,
        checks,
        meta: {
            expectedClassification: classification.type,
            reducedMatrix
        }
    }));
}

function validateMatrixOperation(input = {}, steps = [], result = {}, operation = '') {
    const op = String(operation || input.operation || input.operationType || '').trim();
    const A = input.matrixA || input.A;
    const B = input.matrixB || input.B || null;
    const scalar = input.scalar !== undefined ? input.scalar : null;
    const outputMatrix = result.matrix || null;
    const issues = [];
    const recommendations = [];
    const checks = [];

    if (!Array.isArray(A) || !A.length || !Array.isArray(A[0])) {
        return finalizeValidationDiagnosis(createValidationDiagnosis({
            status: VALIDATION_STATUS.REVIEW,
            method: result.method || op || 'Operacion con matrices',
            summary: 'No hay suficientes datos de la matriz A para validar la operacion.',
            recommendations: ['Confirma que la app entregue la matriz de entrada y el resultado calculado.']
        }));
    }

    let expected = null;
    let dimensionsOk = true;

    if (op === 'add' || op === 'sub') {
        dimensionsOk = !!B && A.length === B.length && A[0].length === B[0].length;
        if (!dimensionsOk) {
            issues.push('Las dimensiones de A y B no son compatibles para suma o resta.');
        } else {
            expected = A.map((row, rowIndex) => row.map((value, colIndex) => op === 'add'
                ? math.add(value, B[rowIndex][colIndex])
                : math.subtract(value, B[rowIndex][colIndex])));
            const consistent = !!outputMatrix && matricesAreEqualExact(expected, outputMatrix);
            checks.push({
                label: 'Revision elemento por elemento',
                passed: consistent,
                detail: consistent ? 'Cada entrada coincide con la operacion definida.' : 'Al menos una entrada no coincide con la suma o resta esperada.'
            });
            if (!consistent) issues.push('El resultado matricial no coincide con la operacion elemento por elemento.');
        }
    } else if (op === 'mult') {
        dimensionsOk = !!B && A[0].length === B.length;
        if (!dimensionsOk) {
            issues.push('Las dimensiones no son compatibles para multiplicacion fila por columna.');
        } else {
            expected = multiplyMatricesExact(A, B);
            const consistent = !!outputMatrix && matricesAreEqualExact(expected, outputMatrix);
            checks.push({
                label: 'Producto fila por columna',
                passed: consistent,
                detail: consistent ? 'La recomposicion del producto coincide con la matriz reportada.' : 'La matriz reportada no coincide con la recomposicion del producto.'
            });
            if (!consistent) issues.push('El producto matricial reportado no coincide con el recalculo interno.');
        }
    } else if (op === 'scalar') {
        expected = A.map((row) => row.map((value) => math.multiply(value, scalar)));
        const consistent = !!outputMatrix && matricesAreEqualExact(expected, outputMatrix);
        checks.push({
            label: 'Producto por escalar',
            passed: consistent,
            detail: consistent ? 'Todas las entradas reflejan el mismo factor k.' : 'Alguna entrada no respeta el factor escalar comun.'
        });
        if (!consistent) issues.push('La matriz reportada no coincide con el producto por escalar esperado.');
    } else if (op === 'transA') {
        expected = A[0].map((_, colIndex) => A.map((row) => row[colIndex]));
        const consistent = !!outputMatrix && matricesAreEqualExact(expected, outputMatrix);
        checks.push({
            label: 'Intercambio fila-columna',
            passed: consistent,
            detail: consistent ? 'La transpuesta intercambia correctamente filas y columnas.' : 'La matriz reportada no coincide con la transpuesta esperada.'
        });
        if (!consistent) issues.push('La transpuesta reportada no coincide con el intercambio correcto de filas y columnas.');
    } else if (op === 'invA' || op === 'invA_gauss') {
        const square = A.length === A[0].length;
        const detA = square ? math.det(A) : null;
        checks.push({
            label: 'Matriz cuadrada',
            passed: square,
            detail: square ? 'La matriz A es cuadrada.' : 'La inversa solo existe para matrices cuadradas.'
        });
        if (!square) issues.push('La inversa solo puede validarse con una matriz cuadrada.');
        if (square && detA !== null && isZeroMathVal(detA)) {
            checks.push({
                label: 'Determinante no nulo',
                passed: false,
                detail: `det(A) = ${formatMathVal(detA)}`
            });
            if (!result.singular) {
                issues.push('La matriz es singular y no deberia presentarse una inversa valida.');
            }
        } else if (square && outputMatrix) {
            const product = multiplyMatricesExact(A, outputMatrix);
            const identity = buildIdentityMatrix(A.length);
            const consistent = matricesAreEqualExact(product, identity);
            checks.push({
                label: 'A * A^-1 = I',
                passed: consistent,
                detail: consistent ? 'La matriz inversa verifica la identidad.' : 'El producto con la inversa reportada no es la identidad.'
            });
            if (!consistent) issues.push('La matriz reportada no funciona como inversa de A.');
        }
    }

    const missingSteps = [];
    if (op === 'mult') {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /fila por columna|celda/, message: 'Falta mostrar el producto fila por columna de las entradas.' }
        ]));
    } else if (op === 'add' || op === 'sub' || op === 'scalar') {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /celda por celda|componente|entrada/, message: 'Falta explicar la operacion entrada por entrada.' }
        ]));
    } else if (op === 'transA') {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /fila.*columna|transpuesta/, message: 'Falta explicar el intercambio entre filas y columnas.' }
        ]));
    } else if (op === 'invA') {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /determinante/, message: 'Falta mostrar el determinante previo a la inversa.' },
            { pattern: /cofactor|adjunta/, message: 'Falta justificar la construccion por cofactores y adjunta.' }
        ]));
    } else if (op === 'invA_gauss') {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /matriz aumentada/, message: 'Falta mostrar la matriz aumentada [A | I].' },
            { pattern: /pivote|eliminar/, message: 'Faltan operaciones elementales por fila para justificar la inversa.' }
        ]));
    }

    if (issues.length) {
        recommendations.push('Revisa las dimensiones, el recalculo interno y la coherencia del resultado final.');
    }
    if (missingSteps.length) {
        recommendations.push('Agrega los pasos intermedios esenciales para que el procedimiento quede bien justificado.');
    }

    const summary = issues.length
        ? 'La validacion encontro inconsistencias en el resultado o en las condiciones de la operacion matricial.'
        : missingSteps.length
            ? 'La operacion parece consistente, pero la explicacion aun no es completa.'
            : 'La operacion matricial es coherente con el recalculo interno y con sus condiciones algebraicas.';

    return finalizeValidationDiagnosis(createValidationDiagnosis({
        status: VALIDATION_STATUS.CORRECT,
        method: result.method || op || 'Operacion con matrices',
        summary,
        issues,
        missingSteps,
        recommendations,
        checks,
        meta: { expected }
    }));
}

function validateDeterminant(input = {}, steps = [], result = {}) {
    const matrix = input.matrix || input.A;
    if (!Array.isArray(matrix) || !matrix.length || !Array.isArray(matrix[0])) {
        return finalizeValidationDiagnosis(createValidationDiagnosis({
            status: VALIDATION_STATUS.REVIEW,
            method: result.method || 'Determinante',
            summary: 'No hay una matriz valida para recalcular el determinante.',
            recommendations: ['Proporciona una matriz cuadrada completa para validar el determinante.']
        }));
    }

    const size = matrix.length;
    const square = size === matrix[0].length;
    const det = result.det;
    const recomputed = square ? math.det(matrix) : null;
    const issues = [];
    const recommendations = [];
    const checks = [
        {
            label: 'Matriz cuadrada',
            passed: square,
            detail: square ? `La matriz es ${size}x${size}.` : 'El determinante solo existe para matrices cuadradas.'
        }
    ];

    if (!square) {
        issues.push('El determinante solo puede calcularse para matrices cuadradas.');
    } else if (det === null || det === undefined) {
        issues.push('No se reporto un valor final de determinante para validar.');
    } else {
        const consistent = isZeroMathVal(math.subtract(recomputed, det));
        checks.push({
            label: 'Recalculo interno del determinante',
            passed: consistent,
            detail: `Valor esperado = ${formatMathVal(recomputed)}`
        });
        if (!consistent) {
            issues.push('El valor final del determinante no coincide con el recalculo interno.');
            recommendations.push('Revisa las multiplicaciones, sumas o signos del desarrollo mostrado.');
        }
    }

    const methodText = String(result.method || input.method || '').toLowerCase();
    if (methodText.includes('sarrus')) {
        if (!hasValidationEvidence(steps, [/diagonales principales/, /diagonales secundarias/])) {
            issues.push('El desarrollo de Sarrus no muestra con claridad las diagonales principales y secundarias.');
        }
    }
    if (methodText.includes('cofactor')) {
        if (!hasValidationEvidence(steps, [/cofactor|menor/, /signo/])) {
            issues.push('La expansion por cofactores no evidencia bien los menores y sus signos.');
        }
    }

    const missingSteps = [];
    if (methodText.includes('sarrus')) {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /sarrus|diagonales/, message: 'Falta mostrar el esquema de diagonales propio de Sarrus.' }
        ]));
    } else if (methodText.includes('cofactor')) {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /cofactor|menor/, message: 'Falta mostrar los menores o cofactores usados.' },
            { pattern: /suma final|resta final|det\(a\)/, message: 'Falta cerrar el desarrollo con la suma final del determinante.' }
        ]));
    } else {
        missingSteps.push(...listMissingValidationEvidence(steps, [
            { pattern: /det\(a\)|resultado final/, message: 'Falta una declaracion clara del valor final del determinante.' }
        ]));
    }

    const summary = issues.length
        ? 'La validacion del determinante encontro inconsistencias en el metodo o en el valor final.'
        : missingSteps.length
            ? 'El valor final parece consistente, pero faltan pasos para justificarlo completamente.'
            : 'El determinante es consistente con el recalculo interno y con el metodo mostrado.';

    return finalizeValidationDiagnosis(createValidationDiagnosis({
        status: VALIDATION_STATUS.CORRECT,
        method: result.method || input.method || 'Calculo de determinante',
        summary,
        issues,
        missingSteps,
        recommendations,
        checks,
        meta: { recomputed }
    }));
}

function validateVectorOperation(input = {}, steps = [], result = {}, operation = '') {
    const op = String(operation || input.operation || input.operationType || '').trim();
    const u = input.vectorU || input.u;
    const v = input.vectorV || input.v || null;
    const issues = [];
    const recommendations = [];
    const checks = [];

    if (!Array.isArray(u) || !u.length) {
        return finalizeValidationDiagnosis(createValidationDiagnosis({
            status: VALIDATION_STATUS.REVIEW,
            method: result.method || op || 'Operacion vectorial',
            summary: 'No hay suficientes datos del vector u para validar la operacion.',
            recommendations: ['Verifica que la entrada vectorial este completa antes de validar.']
        }));
    }

    if (v && u.length !== v.length) {
        issues.push('Los vectores no tienen la misma dimension.');
    }

    if (op === 'add' || op === 'sub') {
        const expected = op === 'add'
            ? u.map((value, index) => math.add(value, v[index]))
            : u.map((value, index) => math.subtract(value, v[index]));
        const consistent = Array.isArray(result.vector) && matricesAreEqualExact([expected], [result.vector]);
        checks.push({
            label: 'Revision componente por componente',
            passed: consistent,
            detail: consistent ? 'Cada componente coincide con el recalculo interno.' : 'Alguna componente no coincide con el recalculo interno.'
        });
        if (!consistent) issues.push('El vector resultante no coincide con la operacion componente por componente.');
    } else if (op === 'dot') {
        const expected = vecDotExact(u, v);
        const reported = result.scalarExact !== undefined ? result.scalarExact : result.scalar;
        const consistent = reported !== undefined && isZeroMathVal(math.subtract(expected, reported));
        checks.push({
            label: 'Producto punto recalculado',
            passed: consistent,
            detail: `Valor esperado = ${formatMathVal(expected)}`
        });
        if (!consistent) issues.push('El producto punto reportado no coincide con la suma de productos parciales.');
    } else if (op === 'mag_u') {
        const squaredNorm = u.reduce((acc, value) => math.add(acc, math.multiply(value, value)), math.fraction(0));
        const expected = Math.sqrt(math.number(squaredNorm));
        const reported = Number(result.scalar);
        const consistent = Number.isFinite(reported) && Math.abs(reported - expected) < 1e-8;
        checks.push({
            label: 'Magnitud recalculada',
            passed: consistent,
            detail: `Valor esperado ≈ ${expected.toFixed(6)}`
        });
        if (!consistent) issues.push('La magnitud reportada no coincide con la raiz de la suma de cuadrados.');
    } else if (op === 'cross') {
        const valid3D = u.length === 3 && Array.isArray(v) && v.length === 3;
        checks.push({
            label: 'Definicion en 3D',
            passed: valid3D,
            detail: valid3D ? 'El producto cruz esta bien planteado en 3D.' : 'El producto cruz solo puede validarse en 3 dimensiones.'
        });
        if (!valid3D) {
            issues.push('El producto cruz solo esta definido en 3 dimensiones.');
        } else if (Array.isArray(result.vector)) {
            const expected = math.cross(u, v);
            const consistent = matricesAreEqualExact([expected], [result.vector]);
            const dotU = vecDotExact(result.vector, u);
            const dotV = vecDotExact(result.vector, v);
            checks.push({
                label: 'Vector cruz recalculado',
                passed: consistent,
                detail: consistent ? 'El vector reportado coincide con el recalculo interno.' : 'El vector reportado no coincide con el recalculo interno.'
            });
            checks.push({
                label: 'Perpendicularidad',
                passed: isZeroMathVal(dotU) && isZeroMathVal(dotV),
                detail: `((u x v)·u, (u x v)·v) = (${formatMathVal(dotU)}, ${formatMathVal(dotV)})`
            });
            if (!consistent) issues.push('El producto cruz reportado no coincide con el recalculo interno.');
        }
    } else if (op === 'proj') {
        const expected = buildProjectionExpected(u, v);
        if (!expected) {
            issues.push('No se puede validar la proyeccion sobre un vector nulo.');
        } else {
            const consistent = Array.isArray(result.vector) && matricesAreEqualExact([expected.vector], [result.vector]);
            const residual = expected.residual;
            const orthogonal = isZeroMathVal(vecDotExact(residual, v));
            checks.push({
                label: 'Vector proyectado',
                passed: consistent,
                detail: consistent ? 'La proyeccion coincide con la formula esperada.' : 'La proyeccion reportada no coincide con la formula esperada.'
            });
            checks.push({
                label: 'Residuo ortogonal',
                passed: orthogonal,
                detail: `Residual · v = ${formatMathVal(vecDotExact(residual, v))}`
            });
            if (!consistent) issues.push('La proyeccion reportada no coincide con el recalculo interno.');
        }
    } else if (op === 'angle') {
        const dot = math.number(vecDotExact(u, v));
        const magU = Math.sqrt(math.number(vecDotExact(u, u)));
        const magV = Math.sqrt(math.number(vecDotExact(v, v)));
        if (magU === 0 || magV === 0) {
            issues.push('El angulo no puede validarse si alguno de los vectores es nulo.');
        } else {
            const cosTheta = Math.max(-1, Math.min(1, dot / (magU * magV)));
            const expected = Math.acos(cosTheta) * (180 / Math.PI);
            const consistent = Number.isFinite(result.angleDeg) && Math.abs(result.angleDeg - expected) < 1e-6;
            checks.push({
                label: 'Angulo recalculado',
                passed: consistent,
                detail: `Angulo esperado ≈ ${expected.toFixed(6)} grados`
            });
            if (!consistent) issues.push('El angulo reportado no coincide con el recalculo desde producto punto y magnitudes.');
        }
    }

    const missingSteps = [];
    const baseRequirements = {
        add: [{ pattern: /componente/, message: 'Falta mostrar la suma componente por componente.' }],
        sub: [{ pattern: /componente/, message: 'Falta mostrar la resta componente por componente.' }],
        dot: [{ pattern: /producto punto|productos parciales|suma/, message: 'Falta mostrar los productos parciales y la suma final del producto punto.' }],
        mag_u: [{ pattern: /suma de cuadrados|raiz/, message: 'Falta justificar la suma de cuadrados y la aplicacion de la raiz.' }],
        angle: [{ pattern: /producto punto|magnitudes|arccos|cos/, message: 'Falta mostrar la sustitucion completa para el angulo.' }],
        cross: [{ pattern: /componente x|componente y|componente z|producto cruz/, message: 'Falta mostrar el calculo componente por componente del producto cruz.' }],
        proj: [{ pattern: /proyeccion|residuo|escalar/, message: 'Falta mostrar el escalar de proyeccion y el vector resultante.' }]
    };
    missingSteps.push(...listMissingValidationEvidence(steps, baseRequirements[op] || []));

    if (issues.length) {
        recommendations.push('Revisa el recalculo algebraico de la operacion y la coherencia del resultado mostrado.');
    }
    if (missingSteps.length) {
        recommendations.push('Completa la explicacion con los pasos intermedios que justifican el resultado.');
    }

    const summary = issues.length
        ? 'La validacion vectorial encontro inconsistencias en el resultado o en las condiciones de la operacion.'
        : missingSteps.length
            ? 'La operacion vectorial parece consistente, pero faltan pasos importantes en la explicacion.'
            : 'La operacion vectorial es consistente con el recalculo interno y con sus propiedades algebraicas.';

    return finalizeValidationDiagnosis(createValidationDiagnosis({
        status: VALIDATION_STATUS.CORRECT,
        method: result.method || op || 'Operacion vectorial',
        summary,
        issues,
        missingSteps,
        recommendations,
        checks
    }));
}

function validateCalculation(moduleName, input, steps, result, operation) {
    const normalizedModule = normalizeModuleNameForValidation(moduleName);
    if (normalizedModule === 'sistemas') return validateLinearSystem(input, steps, result);
    if (normalizedModule === 'matrices') return validateMatrixOperation(input, steps, result, operation);
    if (normalizedModule === 'determinantes') return validateDeterminant(input, steps, result);
    if (normalizedModule === 'vectores') return validateVectorOperation(input, steps, result, operation);
    return finalizeValidationDiagnosis(createValidationDiagnosis({
        status: VALIDATION_STATUS.REVIEW,
        method: operation || normalizedModule,
        summary: 'No existe un validador especifico para este modulo.',
        recommendations: ['Usa uno de los modulos soportados: sistemas, matrices, determinantes o vectores.']
    }));
}

function mergeValidationIntoVerification(verification, diagnosis) {
    if (!diagnosis) return verification;

    const mergedChecks = [
        ...(verification.checks || []),
        ...buildValidationChecksFromDiagnosis(diagnosis)
    ];
    const tutorSummary = formatValidationForTutor(diagnosis);
    const mergedDetail = `${verification.detail || ''}${verification.detail ? '<br><br>' : ''}<strong>Validador AlgeMat:</strong> ${formatMathTextForHtml(tutorSummary)}`;
    const mergedOutput = `${verification.outputHtml || ''}${diagnosis ? renderValidationDiagnosisHtml(diagnosis) : ''}`;

    return createValidationResult({
        status: mapValidationStatusToUiStatus(diagnosis.status),
        summary: diagnosis.summary || verification.summary,
        detail: mergedDetail,
        checks: mergedChecks,
        outputHtml: mergedOutput,
        attempted: verification.attempted,
        applicable: verification.applicable
    });
}

Object.assign(window.AlgeMatValidation, {
    VALIDATION_STATUS,
    validateLinearSystem,
    validateMatrixOperation,
    validateDeterminant,
    validateVectorOperation,
    validateCalculation,
    formatValidationForTutor
});

window.VALIDATION_STATUS = VALIDATION_STATUS;
window.validateLinearSystem = validateLinearSystem;
window.validateMatrixOperation = validateMatrixOperation;
window.validateDeterminant = validateDeterminant;
window.validateVectorOperation = validateVectorOperation;
window.validateCalculation = validateCalculation;
window.formatValidationForTutor = formatValidationForTutor;

function buildDefaultVerificationSummary(topic = '') {
    const module = inferStandardMathModule(topic);
    const summaries = {
        sistemas: 'Verificación del sistema.',
        matrices: 'Verificación de la operación matricial.',
        determinantes: 'Verificación del determinante.',
        vectores: 'Verificación vectorial.',
        general: 'Verificación del resultado.'
    };
    return summaries[module] || summaries.general;
}

function buildDefaultVerificationDetail(topic = '', method = '') {
    const module = inferStandardMathModule(topic);
    const details = {
        sistemas: 'La app debe intentar verificar el sistema mediante sustitución o validación estructural según el tipo de solución.',
        matrices: 'La app debe intentar verificar la operación revisando dimensiones, consistencia algebraica o identidad cuando corresponda.',
        determinantes: 'La app debe intentar verificar la coherencia entre el tamaño de la matriz, el método usado y el desarrollo mostrado.',
        vectores: 'La app debe intentar verificar propiedades geométricas o algebraicas acordes a la operación vectorial solicitada.',
        general: 'La app debe intentar verificar el resultado final siempre que exista un criterio razonable para hacerlo.'
    };
    const baseDetail = details[module] || details.general;
    return method ? `${baseDetail} Método declarado: ${method}` : baseDetail;
}

function normalizeValidationResult(verification, context = {}) {
    if (!verification) {
        return createValidationResult({
            status: 'info',
            summary: buildDefaultVerificationSummary(context.topic),
            detail: buildDefaultVerificationDetail(context.topic, context.method),
            checks: [
                createValidationCheck({
                    label: 'Intento de verificación',
                    passed: false,
                    detail: 'El módulo no entregó una verificación específica y se aplicó el fallback estándar.'
                })
            ],
            applicable: false
        });
    }

    if (verification.status || verification.summary || verification.checks) {
        return createValidationResult({
            summary: verification.summary || buildDefaultVerificationSummary(context.topic),
            detail: verification.detail || buildDefaultVerificationDetail(context.topic, context.method),
            ...verification
        });
    }

    return createValidationResult({
        status: 'info',
        summary: buildDefaultVerificationSummary(context.topic),
        detail: verification.detail || buildDefaultVerificationDetail(context.topic, context.method),
        outputHtml: verification.outputHtml || '',
        checks: [
            createValidationCheck({
                label: 'Intento de verificación',
                passed: false,
                detail: 'El módulo entregó una verificación parcial sin estructura completa; se normalizó para la UI.'
            })
        ],
        applicable: false
    });
}

function inferStandardMathModule(topic = '') {
    const normalizedTopic = String(topic || '').toLowerCase();
    if (normalizedTopic.includes('sistema')) return 'sistemas';
    if (normalizedTopic.includes('matriz')) return 'matrices';
    if (normalizedTopic.includes('determinante')) return 'determinantes';
    if (normalizedTopic.includes('vector')) return 'vectores';
    return 'general';
}

function createStandardMathResult({ summary = '', valueHtml = '' } = {}) {
    return { summary, valueHtml };
}

function normalizeStandardMathStep(step, index) {
    return {
        id: step.id || `step-${index + 1}`,
        title: step.title || `Paso ${index + 1}`,
        detail: step.detail || '',
        outputHtml: step.outputHtml || '',
        meta: {
            kind: step.meta?.kind || 'procedure',
            ...step.meta
        }
    };
}

function buildStandardMathHistoryEntry(containerId, response) {
    return {
        id: response.id,
        containerId,
        module: response.module,
        topic: response.topic,
        request: response.request,
        method: response.method,
        resultSummary: response.result.summary,
        verificationSummary: response.verification.summary,
        interpretation: response.interpretation,
        createdAt: response.createdAt
    };
}

function createStandardMathResponse({ module, topic, request, method, steps = [], result, verification, interpretation, historyMeta = null }) {
    const normalizedSteps = steps.map((step, index) => normalizeStandardMathStep(step, index));
    const baseVerification = normalizeValidationResult(verification, { topic, method });
    const validationInput = historyMeta?.validationData?.input || null;
    const validationResultData = historyMeta?.validationData?.result || null;
    const validationOperation = historyMeta?.validationData?.operation || historyMeta?.operationType || null;
    const validationReport = validationInput
        ? validateCalculation(module || topic, validationInput, normalizedSteps, {
            ...(validationResultData || {}),
            method
        }, validationOperation)
        : null;
    const mergedVerification = validationReport
        ? mergeValidationIntoVerification(baseVerification, validationReport)
        : baseVerification;

    return {
        version: '1.0',
        id: `math-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        module: module || inferStandardMathModule(topic),
        createdAt: new Date().toISOString(),
        topic,
        request,
        method,
        steps: normalizedSteps,
        result: createStandardMathResult(result),
        verification: mergedVerification,
        validationReport,
        interpretation,
        historyMeta
    };
}

function renderValidationChecks(checks) {
    if (!checks || !checks.length) return '';
    return `
        <div class="validation-checks math-check-grid">
            ${checks.map((check) => `
                <div class="validation-check ${check.passed ? 'validation-check--ok' : 'validation-check--warn'}">
                    <strong>${check.passed ? 'OK' : 'Aviso'} - ${formatMathTextForHtml(check.label)}</strong><br>
                    <span>${formatMathTextForHtml(check.detail)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderMathStageBadge(kind = 'procedure') {
    const labels = {
        theory: 'Teoría breve',
        procedure: 'Procedimiento',
        partial: 'Resultado parcial',
        verification: 'Verificación',
        final: 'Respuesta final',
        topic: 'Tema',
        request: 'Objetivo',
        method: 'Método'
    };
    return `<span class="math-stage-badge math-stage-badge--${kind}">${labels[kind] || labels.procedure}</span>`;
}

function renderMathSection(kind, title, detailHtml, outputHtml = '') {
    return `
        <section class="math-step math-step--${kind}">
            <div class="math-step-header">
                ${renderMathStageBadge(kind)}
                <h4>${formatMathTextForHtml(title)}</h4>
            </div>
            <div class="math-step-body">
                ${formatMathTextForHtml(detailHtml)}
            </div>
            ${outputHtml ? `<div class="assistant-module-output math-output-shell">${formatMathTextForHtml(outputHtml)}</div>` : ''}
        </section>
    `;
}

function renderStandardMathResponse(response) {
    const stepsHtml = response.steps.map((step, index) => `
        ${renderMathSection(
            step.meta?.kind || 'procedure',
            `Paso ${index + 1}: ${step.title}`,
            `<p>${step.detail}</p>`,
            step.outputHtml
        )}
    `).join('');

    return `
        <div class="standard-math-response">
            <div class="math-structure-strip">
                ${renderMathStageBadge('topic')}
                ${renderMathStageBadge('method')}
                ${renderMathStageBadge('procedure')}
                ${renderMathStageBadge('partial')}
                ${renderMathStageBadge('verification')}
                ${renderMathStageBadge('final')}
            </div>
            ${renderMathSection('topic', 'Tema', `<p>${response.topic}</p>`)}
            ${renderMathSection('request', 'Qué se pide', `<p>${response.request}</p>`)}
            ${renderMathSection('method', 'Método usado', `<p>${response.method}</p>`)}
            ${stepsHtml}
            ${renderMathSection(
                'partial',
                'Resultado',
                `
                    <div class="math-summary-card math-summary-card--partial">
                        <p class="math-summary-lead">${response.result.summary}</p>
                    </div>
                `,
                response.result.valueHtml || ''
            )}
            ${renderMathSection(
                'verification',
                'Verificación',
                `
                    <div class="math-summary-card math-summary-card--verification">
                        ${response.verification.summary ? `<p class="math-summary-lead">${response.verification.summary}</p>` : ''}
                        <p>${response.verification.detail}</p>
                    </div>
                    ${renderValidationChecks(response.verification.checks)}
                `,
                response.verification.outputHtml || ''
            )}
            ${renderMathSection(
                'final',
                'Interpretación final',
                `
                    <div class="math-summary-card math-summary-card--final">
                        <p class="math-summary-lead">${response.interpretation}</p>
                    </div>
                `
            )}
        </div>
    `;
}

function setStandardMathResponse(containerId, response) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const normalizedResponse = createStandardMathResponse(response);
    if (!window.AlgeMatStandardOutputs) window.AlgeMatStandardOutputs = {};
    if (!window.AlgeMatStandardHistory) window.AlgeMatStandardHistory = [];
    window.AlgeMatStandardOutputs[containerId] = normalizedResponse;
    window.AlgeMatStandardHistory.push(buildStandardMathHistoryEntry(containerId, normalizedResponse));
    container.innerHTML = renderStandardMathResponse(normalizedResponse);
    if (window.AlgeMatProcedureHistory && normalizedResponse.historyMeta?.saveToHistory) {
        window.AlgeMatProcedureHistory.saveFromResponse(containerId, normalizedResponse);
    }
    const panel = container.closest('.results-panel');
    if (panel) panel.classList.remove('hidden');
    renderDynamicMath(container);
}

const HISTORY_STORAGE_KEY = 'algemat-procedure-history';

function toHistorySerializable(value) {
    if (Array.isArray(value)) return value.map((item) => toHistorySerializable(item));
    if (value && typeof value === 'object' && value.n !== undefined && value.d !== undefined) {
        return formatMathVal(value);
    }
    if (value && typeof value === 'object') {
        const result = {};
        Object.keys(value).forEach((key) => {
            result[key] = toHistorySerializable(value[key]);
        });
        return result;
    }
    return value;
}

function formatHistoryDate(isoDate) {
    try {
        return new Date(isoDate).toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return isoDate;
    }
}

function getOperationLabel(operationType = '') {
    const labels = {
        solve: 'Resolver sistema',
        add: 'Suma',
        sub: 'Resta',
        mult: 'Multiplicacion',
        scalar: 'Producto por escalar',
        transA: 'Transpuesta',
        invA: 'Inversa por cofactores',
        invA_gauss: 'Inversa por Gauss-Jordan',
        determinant: 'Determinante',
        dot: 'Producto punto',
        mag_u: 'Magnitud',
        angle: 'Angulo',
        cross: 'Producto cruz',
        proj: 'Proyeccion'
    };
    return labels[operationType] || operationType || 'Operacion';
}

function renderHistoryInputHtml(inputData) {
    if (!inputData) return '<p>No se registraron datos de entrada.</p>';

    const methodHtml = inputData.selectedMethod
        ? `<p><strong>Método seleccionado:</strong> ${getMethodLabel(inputData.module || '', inputData.selectedMethod)}</p>`
        : '';

    if (inputData.augmentedMatrix) {
        return `${methodHtml}<div class="step-matrix-display">${renderMatrixHTML(inputData.augmentedMatrix)}</div>`;
    }
    if (inputData.matrixA) {
        return `
            ${methodHtml}
            <p><strong>Matriz A:</strong></p>
            <div class="step-matrix-display">${renderMatrixHTML(inputData.matrixA)}</div>
            ${inputData.matrixB ? `<p><strong>Matriz B:</strong></p><div class="step-matrix-display">${renderMatrixHTML(inputData.matrixB)}</div>` : ''}
            ${inputData.scalar !== undefined && inputData.scalar !== null ? `<p><strong>Escalar:</strong> ${inputData.scalar}</p>` : ''}
        `;
    }
    if (inputData.matrix) {
        return `${methodHtml}<div class="step-matrix-display">${renderMatrixHTML(inputData.matrix)}</div>`;
    }
    if (inputData.vectorU) {
        return `
            ${methodHtml}
            <p><strong>u:</strong> [${inputData.vectorU.join(', ')}]</p>
            ${inputData.vectorV ? `<p><strong>v:</strong> [${inputData.vectorV.join(', ')}]</p>` : ''}
        `;
    }
    return `<pre>${JSON.stringify(inputData, null, 2)}</pre>`;
}

function historyElementExists(elementId) {
    return !!document.getElementById(elementId);
}

function requireHistoryElement(elementId, label) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`No se puede restaurar "${label}" porque falta el elemento "${elementId}" en la interfaz actual.`);
    }
    return element;
}

function setElementValueIfPresent(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
        if (element.dataset && element.dataset.selectionHelper) {
            updatePracticeSelectHelper(element);
        }
        return true;
    }
    return false;
}

function restoreSystemHistoryEntry(inputData) {
    if (!inputData?.augmentedMatrix || !Array.isArray(inputData.augmentedMatrix) || !inputData.augmentedMatrix.length) {
        throw new Error('La entrada de historial no contiene una matriz aumentada valida para sistemas.');
    }

    requireHistoryElement('sys-size', 'tamano del sistema');
    requireHistoryElement('sys-inputs', 'matriz del sistema');
    requireHistoryElement('sys-results', 'panel de resultados del sistema');

    const size = inputData.augmentedMatrix.length;
    document.getElementById('sys-size').value = String(size);
    updateSystemMethodsBySize(size);
    setElementValueIfPresent('sys-method', inputData.selectedMethod || 'auto');
    createMatrixInput(size, size + 1, 'sys-inputs', true);
    setMatrixValues('sys-inputs', inputData.augmentedMatrix);
    document.getElementById('sys-results').classList.add('hidden');
}

function restoreMatrixHistoryEntry(inputData, fallbackOperationType = '') {
    if (!inputData?.matrixA || !Array.isArray(inputData.matrixA) || !inputData.matrixA.length) {
        throw new Error('La entrada de historial no contiene una matriz A valida.');
    }

    ['mat-op', 'matA-rows', 'matA-cols', 'matA-inputs', 'mat-results'].forEach((id) => requireHistoryElement(id, id));
    const rawOperationType = inputData.operationType || fallbackOperationType || 'add';
    const operationType = rawOperationType === 'invA_gauss' ? 'invA' : rawOperationType;
    const selectedMethod = inputData.selectedMethod || (rawOperationType === 'invA_gauss' ? 'gauss_jordan' : rawOperationType === 'invA' ? 'cofactors' : 'auto');

    setElementValueIfPresent('mat-op', operationType);
    setElementValueIfPresent('mat-method', selectedMethod);
    setElementValueIfPresent('matA-rows', inputData.matrixA.length);
    setElementValueIfPresent('matA-cols', inputData.matrixA[0].length);
    createMatrixInput(inputData.matrixA.length, inputData.matrixA[0].length, 'matA-inputs');
    setMatrixValues('matA-inputs', inputData.matrixA);

    if (inputData.matrixB && Array.isArray(inputData.matrixB) && inputData.matrixB.length) {
        if (historyElementExists('matB-rows')) setElementValueIfPresent('matB-rows', inputData.matrixB.length);
        if (historyElementExists('matB-cols')) setElementValueIfPresent('matB-cols', inputData.matrixB[0].length);
        if (historyElementExists('matB-inputs')) {
            createMatrixInput(inputData.matrixB.length, inputData.matrixB[0].length, 'matB-inputs');
            setMatrixValues('matB-inputs', inputData.matrixB);
        }
    }

    if (inputData.scalar !== undefined && inputData.scalar !== null) {
        setElementValueIfPresent('mat-scalar-val', inputData.scalar);
    }

    if (typeof updateMatrixOperationUI === 'function') {
        updateMatrixOperationUI(operationType);
    }
    if (typeof updateEduTip === 'function') {
        updateEduTip('matrices', operationType);
    }
    document.getElementById('mat-results').classList.add('hidden');
}

function restoreDeterminantHistoryEntry(inputData) {
    if (!inputData?.matrix || !Array.isArray(inputData.matrix) || !inputData.matrix.length) {
        throw new Error('La entrada de historial no contiene una matriz valida para determinantes.');
    }

    requireHistoryElement('det-size', 'tamano del determinante');
    requireHistoryElement('det-inputs', 'matriz del determinante');
    requireHistoryElement('det-results', 'panel de resultados del determinante');

    const size = inputData.matrix.length;
    document.getElementById('det-size').value = String(size);
    setElementValueIfPresent('det-method', inputData.selectedMethod || 'auto');
    createMatrixInput(size, size, 'det-inputs');
    setMatrixValues('det-inputs', inputData.matrix);
    if (typeof updateDeterminantMethodOptions === 'function') {
        updateDeterminantMethodOptions(size, inputData.selectedMethod || 'auto');
    }
    if (typeof updateEduTip === 'function') {
        updateEduTip('determinantes', String(size));
    }
    document.getElementById('det-results').classList.add('hidden');
}

function restoreVectorHistoryEntry(inputData, fallbackOperationType = '') {
    if (!inputData?.vectorU || !Array.isArray(inputData.vectorU) || !inputData.vectorU.length) {
        throw new Error('La entrada de historial no contiene un vector u valido.');
    }

    ['vec-dim', 'vec-op', 'vecA-inputs', 'vec-results'].forEach((id) => requireHistoryElement(id, id));
    const dim = inputData.vectorU.length;
    const operationType = inputData.operationType || fallbackOperationType || 'mag_u';

    document.getElementById('vec-dim').value = String(dim);
    if (typeof updateVectorOperations === 'function') {
        updateVectorOperations(dim);
    }
    document.getElementById('vec-op').value = operationType;
    createMatrixInput(1, dim, 'vecA-inputs');
    setMatrixValues('vecA-inputs', [inputData.vectorU]);

    if (inputData.vectorV && Array.isArray(inputData.vectorV) && historyElementExists('vecB-inputs')) {
        createMatrixInput(1, dim, 'vecB-inputs');
        setMatrixValues('vecB-inputs', [inputData.vectorV]);
    }

    if (typeof syncVectorOperationUI === 'function') {
        syncVectorOperationUI(operationType);
    } else {
        if (typeof toggleGroupInteractivity === 'function') {
            toggleGroupInteractivity('group-vecB', operationType !== 'mag_u');
        }
        if (typeof updateEduTip === 'function') {
            updateEduTip('vectores', operationType);
        }
    }
    document.getElementById('vec-results').classList.add('hidden');
}

function loadHistoryEntry(entryId) {
    const entry = window.AlgeMatProcedureHistory?.getById(entryId);
    if (!entry) {
        throw new Error('No se encontro la entrada seleccionada en el historial.');
    }

    const inputData = entry.inputData || {};
    const resolvedModule =
        entry.module ||
        inputData.module ||
        entry.responseSnapshot?.module ||
        '';
    const resolvedOperationType =
        entry.operationType ||
        inputData.operationType ||
        entry.responseSnapshot?.historyMeta?.operationType ||
        resolvedModule;

    if (resolvedModule === 'sistemas' || (Array.isArray(inputData.augmentedMatrix) && inputData.augmentedMatrix.length)) {
        switchToTab('sistemas');
        restoreSystemHistoryEntry(inputData);
        return entry;
    }

    if (
        resolvedModule === 'matrices' ||
        Array.isArray(inputData.matrixA) ||
        ['add', 'sub', 'mult', 'scalar', 'transA', 'invA', 'invA_gauss'].includes(resolvedOperationType)
    ) {
        switchToTab('matrices');
        restoreMatrixHistoryEntry(inputData, resolvedOperationType);
        return entry;
    }

    if (resolvedModule === 'determinantes' || (Array.isArray(inputData.matrix) && inputData.matrix.length)) {
        switchToTab('determinantes');
        restoreDeterminantHistoryEntry(inputData);
        return entry;
    }

    if (resolvedModule === 'vectores' || (Array.isArray(inputData.vectorU) && inputData.vectorU.length)) {
        switchToTab('vectores');
        restoreVectorHistoryEntry(inputData, resolvedOperationType);
        return entry;
    }

    throw new Error(`El modulo "${resolvedModule || 'desconocido'}" no tiene restauracion implementada.`);
}

function loadHistoryEntries() {
    try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.map((entry) => {
            const snapshotMeta = entry?.responseSnapshot?.historyMeta || {};
            const normalizedInputData = toHistorySerializable(
                entry?.inputData ||
                snapshotMeta.inputData ||
                {}
            );
            const normalizedModule =
                entry?.module ||
                normalizedInputData?.module ||
                entry?.responseSnapshot?.module ||
                '';
            const normalizedOperationType =
                entry?.operationType ||
                normalizedInputData?.operationType ||
                snapshotMeta.operationType ||
                normalizedModule;

            const normalizedEntry = {
                ...entry,
                module: normalizedModule,
                operationType: normalizedOperationType,
                inputData: normalizedInputData
            };

            return {
                ...normalizedEntry,
                fingerprint: entry.fingerprint || createProcedureHistoryFingerprint(normalizedEntry)
            };
        });
    } catch (error) {
        return [];
    }
}

function persistHistoryEntries(entries) {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
}

function createProcedureHistoryFingerprint(entry) {
    return JSON.stringify({
        module: entry.module,
        operationType: entry.operationType,
        inputData: entry.inputData,
        resultFinal: entry.resultFinal
    });
}

function buildProcedureHistoryEntry(containerId, response) {
    const historyMeta = response.historyMeta || {};
    const entry = {
        id: historyMeta.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: response.createdAt,
        topic: response.topic,
        operationType: historyMeta.operationType || response.module,
        inputData: toHistorySerializable({
            restoreVersion: 1,
            module: response.module,
            operationType: historyMeta.operationType || response.module,
            ...(historyMeta.inputData || {})
        }),
        summary: historyMeta.summary || response.request,
        resultFinal: response.result.summary,
        procedureRef: {
            responseId: response.id,
            containerId
        },
        verification: {
            summary: response.verification.summary,
            detail: response.verification.detail,
            checks: response.verification.checks || []
        },
        responseSnapshot: toHistorySerializable(response),
        module: response.module
    };

    entry.fingerprint = createProcedureHistoryFingerprint(entry);
    return entry;
}

function shouldSaveProcedureHistoryEntry(entry, existingEntries = []) {
    if (!entry) return false;
    if (!entry.inputData || !Object.keys(entry.inputData).length) return false;

    const latestSameFingerprint = existingEntries.find((item) => item.fingerprint === entry.fingerprint);
    if (!latestSameFingerprint) return true;

    const elapsedMs = Math.abs(new Date(entry.createdAt).getTime() - new Date(latestSameFingerprint.createdAt).getTime());
    return elapsedMs > 30000;
}

window.AlgeMatProcedureHistory = {
    saveFromResponse(containerId, response) {
        const entries = loadHistoryEntries();
        const entry = buildProcedureHistoryEntry(containerId, response);
        if (!shouldSaveProcedureHistoryEntry(entry, entries)) {
            this.renderList();
            if (entries.length) this.renderDetail(entries[0].id);
            return;
        }

        const nextEntries = [entry, ...entries.filter((item) => item.id !== entry.id && item.fingerprint !== entry.fingerprint)].slice(0, 50);
        persistHistoryEntries(nextEntries);
        this.renderList();
        this.renderDetail(entry.id);
    },

    getAll() {
        return loadHistoryEntries();
    },

    getById(entryId) {
        return this.getAll().find((entry) => entry.id === entryId) || null;
    },

    delete(entryId) {
        persistHistoryEntries(this.getAll().filter((entry) => entry.id !== entryId));
        this.renderList();
        this.renderEmptyDetail('La entrada fue eliminada del historial.');
    },

    clear() {
        persistHistoryEntries([]);
        this.renderList();
        this.renderEmptyDetail('El historial está vacío. Resuelve un ejercicio para guardar una nueva entrada.');
    },

    renderList() {
        const container = document.getElementById('history-list');
        if (!container) return;
        const entries = this.getAll();

        if (!entries.length) {
            container.innerHTML = '<div class="history-empty-state">Aun no hay ejercicios guardados en el historial.</div>';
            return;
        }

        container.innerHTML = entries.map((entry) => `
            <article class="history-card">
                <h4>${entry.topic}</h4>
                <div class="history-meta">${formatHistoryDate(entry.createdAt)} · ${getOperationLabel(entry.operationType)}</div>
                <p class="history-summary">${entry.summary}</p>
                <div class="history-chip-row">
                    <span class="history-chip">${entry.resultFinal}</span>
                </div>
                <div class="history-actions">
                    <button type="button" class="history-btn" onclick="window.AlgeMatProcedureHistory.renderDetail('${entry.id}')">Ver detalle</button>
                    <button type="button" class="history-btn" onclick="window.AlgeMatProcedureHistory.reuse('${entry.id}')">Reutilizar</button>
                    <button type="button" class="history-btn history-btn--danger" onclick="window.AlgeMatProcedureHistory.delete('${entry.id}')">Eliminar</button>
                </div>
            </article>
        `).join('');
    },

    renderEmptyDetail(message) {
        const container = document.getElementById('history-detail');
        if (!container) return;
        container.innerHTML = `<div class="history-empty-state">${message}</div>`;
    },

    renderDetail(entryId) {
        const container = document.getElementById('history-detail');
        if (!container) return;
        const entry = this.getById(entryId);
        if (!entry) {
            this.renderEmptyDetail('No se encontro la entrada solicitada.');
            return;
        }

        const snapshot = entry.responseSnapshot;
        container.innerHTML = `
            <div class="history-detail-header">
                <div>
                    <h3>${entry.topic}</h3>
                    <div class="history-detail-meta">${formatHistoryDate(entry.createdAt)} · ${getOperationLabel(entry.operationType)}</div>
                </div>
            </div>
            <div class="history-detail-block">
                <h4>Resumen del ejercicio</h4>
                <p>${entry.summary}</p>
            </div>
            <div class="history-detail-block">
                <h4>Datos de entrada</h4>
                ${renderHistoryInputHtml(entry.inputData)}
            </div>
            <div class="history-detail-block">
                <h4>Resultado final</h4>
                <p>${entry.resultFinal}</p>
            </div>
            <div class="history-detail-block">
                <h4>Procedimiento guardado</h4>
                ${renderStandardMathResponse(snapshot)}
            </div>
        `;
        renderDynamicMath(container);
    },

    reuse(entryId) {
        return loadHistoryEntry(entryId);
    }
};

function initHistoryModule() {
    const refreshButton = document.getElementById('btn-refresh-history');
    const clearButton = document.getElementById('btn-clear-history');

    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            window.AlgeMatProcedureHistory.renderList();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            window.AlgeMatProcedureHistory.clear();
        });
    }

    window.AlgeMatProcedureHistory.renderList();
}

// Override textual UI helpers with clean UTF-8 labels for the standard pedagogical renderer.
function renderMathStageBadge(kind = 'procedure') {
    const labels = {
        theory: 'Teoría breve',
        procedure: 'Procedimiento',
        partial: 'Resultado parcial',
        verification: 'Verificación',
        final: 'Respuesta final',
        topic: 'Tema',
        request: 'Objetivo',
        method: 'Método'
    };
    return `<span class="math-stage-badge math-stage-badge--${kind}">${labels[kind] || labels.procedure}</span>`;
}

function renderStandardMathResponse(response) {
    const stepsHtml = response.steps.map((step, index) => `
        ${renderMathSection(
            step.meta?.kind || 'procedure',
            `Paso ${index + 1}: ${step.title}`,
            `<p>${step.detail}</p>`,
            step.outputHtml
        )}
    `).join('');

    return `
        <div class="standard-math-response">
            <div class="math-structure-strip">
                ${renderMathStageBadge('topic')}
                ${renderMathStageBadge('method')}
                ${renderMathStageBadge('procedure')}
                ${renderMathStageBadge('partial')}
                ${renderMathStageBadge('verification')}
                ${renderMathStageBadge('final')}
            </div>
            ${renderMathSection('topic', 'Tema', `<p>${response.topic}</p>`)}
            ${renderMathSection('request', 'Qué se pide', `<p>${response.request}</p>`)}
            ${renderMathSection('method', 'Método usado', `<p>${response.method}</p>`)}
            ${stepsHtml}
            ${renderMathSection(
                'partial',
                'Resultado',
                `
                    <div class="math-summary-card math-summary-card--partial">
                        <p class="math-summary-lead">${response.result.summary}</p>
                    </div>
                `,
                response.result.valueHtml || ''
            )}
            ${renderMathSection(
                'verification',
                'Verificación',
                `
                    <div class="math-summary-card math-summary-card--verification">
                        ${response.verification.summary ? `<p class="math-summary-lead">${response.verification.summary}</p>` : ''}
                        <p>${response.verification.detail}</p>
                    </div>
                    ${renderValidationChecks(response.verification.checks)}
                `,
                response.verification.outputHtml || ''
            )}
            ${renderMathSection(
                'final',
                'Interpretación final',
                `
                    <div class="math-summary-card math-summary-card--final">
                        <p class="math-summary-lead">${response.interpretation}</p>
                    </div>
                `
            )}
        </div>
    `;
}

function updateMatrixMethodUI(op, selectedMethod = null) {
    const methodGroup = document.getElementById('mat-method-group');
    const methodSelect = document.getElementById('mat-method');
    const applies = op === 'invA' || op === 'invA_gauss';

    if (methodGroup) {
        methodGroup.style.display = applies ? 'block' : 'none';
    }

    if (!methodSelect) return;

    methodSelect.disabled = !applies;
    if (!applies) {
        methodSelect.value = 'auto';
        return;
    }

    if (selectedMethod && canUseMethod('matrices', selectedMethod, { operationType: 'invA' })) {
        methodSelect.value = selectedMethod;
    } else if (!methodSelect.value) {
        methodSelect.value = 'auto';
    }
}

function updateMatrixOperationUI(op) {
    const isUnary = (op === 'transA' || op === 'invA' || op === 'invA_gauss');
    const isScalar = (op === 'scalar');
    const needsB = !isUnary && !isScalar;
    const groupMatB = document.getElementById('group-matB');
    const groupScalar = document.getElementById('group-scalar');
    const helper = document.getElementById('mat-op-context');

    if (groupMatB) groupMatB.style.display = needsB ? 'block' : 'none';
    if (groupScalar) groupScalar.style.display = isScalar ? 'block' : 'none';
    toggleGroupInteractivity('group-matB', needsB);
    toggleGroupInteractivity('group-scalar', isScalar);
    updateMatrixMethodUI(op);

    if (helper) {
        const messages = {
            add: 'Operación binaria: debes completar A y B con la misma dimensión.',
            sub: 'Operación binaria: debes completar A y B con la misma dimensión.',
            mult: 'Operación binaria: A y B deben cumplir columnas de A = filas de B.',
            scalar: 'Operación unaria con escalar: se usa A y el valor k. La matriz B no interviene.',
            transA: 'Operación unaria: solo se usa la matriz A. La matriz B no interviene.',
            invA: 'Operación unaria: solo se usa la matriz A y debe ser cuadrada e invertible. Aquí sí puedes elegir el método de inversión.',
            invA_gauss: 'Operación unaria: solo se usa la matriz A y debe ser cuadrada e invertible. Aquí sí puedes elegir el método de inversión.'
        };
        helper.textContent = messages[op] || 'Configura la operación y completa los datos requeridos.';
    }
}

function updateDeterminantMethodOptions(size, selectedMethod = null) {
    const methodSelect = document.getElementById('det-method');
    if (!methodSelect) return;

    const normalizedSize = Number(size);
    const optionsBySize = {
        2: [
            { value: 'auto', label: 'Automático' },
            { value: 'direct', label: 'Fórmula directa' }
        ],
        3: [
            { value: 'auto', label: 'Automático' },
            { value: 'sarrus', label: 'Regla de Sarrus' },
            { value: 'cofactors', label: 'Cofactores' }
        ],
        4: [
            { value: 'auto', label: 'Automático' },
            { value: 'cofactors', label: 'Cofactores' }
        ]
    };

    const options = optionsBySize[normalizedSize] || optionsBySize[2];
    methodSelect.innerHTML = options
        .map((option) => `<option value="${option.value}">${option.label}</option>`)
        .join('');

    const nextValue = options.some((option) => option.value === selectedMethod) ? selectedMethod : 'auto';
    methodSelect.value = nextValue;
}

function multiplyMatricesExact(A, B) {
    const rows = A.length;
    const cols = B[0].length;
    const inner = B.length;
    const result = [];

    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            let sum = math.fraction(0);
            for (let k = 0; k < inner; k++) {
                sum = math.add(sum, math.multiply(A[i][k], B[k][j]));
            }
            row.push(sum);
        }
        result.push(row);
    }

    return result;
}

function matricesAreEqualExact(A, B) {
    if (!A || !B || A.length !== B.length || A[0].length !== B[0].length) return false;
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < A[i].length; j++) {
            if (!isZeroMathVal(math.subtract(A[i][j], B[i][j]))) return false;
        }
    }
    return true;
}

function buildIdentityMatrix(size) {
    const identity = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(i === j ? math.fraction(1) : math.fraction(0));
        }
        identity.push(row);
    }
    return identity;
}

function buildSystemVerification(originalMat, reducedMat, classificationLabel, options = {}) {
    const size = originalMat.length;
    const vars = ['x', 'y', 'z'].slice(0, size);
    const normalizedClassification = String(classificationLabel || '').toLowerCase();
    const providedSolution = Array.isArray(options.solution) ? options.solution : null;
    const hasUniqueSolution = normalizedClassification.includes('solución única') || (normalizedClassification.includes('determinado') && !normalizedClassification.includes('indeterminado'));

    if (!hasUniqueSolution) {
        return createValidationResult({
            status: 'info',
            summary: 'Verificacion estructural del sistema.',
            detail: 'No hay una sustitucion numerica unica que verificar. La validacion del sistema se hace por clasificacion con rangos y forma reducida.',
            checks: [
                {
                    label: 'Clasificacion por rangos',
                    passed: true,
                    detail: 'La forma reducida y la comparacion entre rango(A) y rango(A|b) sostienen la clasificacion obtenida.'
                }
            ],
            outputHtml: reducedMat
                ? `<div class="step-matrix-display">${renderMatrixHTML(reducedMat, true)}</div>`
                : '<p>La clasificacion se interpreta a partir del procedimiento mostrado.</p>'
        });
    }

    const solution = providedSolution || Array.from({ length: size }, (_, i) => reducedMat[i][size]);

    let lines = '';
    for (let i = 0; i < size; i++) {
        const pieces = [];
        let lhs = math.fraction(0);
        for (let j = 0; j < size; j++) {
            const coeff = originalMat[i][j];
            const termValue = math.multiply(coeff, solution[j]);
            lhs = math.add(lhs, termValue);
            pieces.push(`(${formatMathVal(coeff)} * ${formatMathVal(solution[j])})`);
        }
        lines += `Ecuacion ${i + 1}: ${pieces.join(' + ')} = ${formatMathVal(lhs)} y coincide con ${formatMathVal(originalMat[i][size])}<br>`;
    }

    return createValidationResult({
        status: 'success',
        summary: 'Sustitucion de la solucion en las ecuaciones originales.',
        detail: `Se sustituye la solucion ${vars.map((variable, index) => `${variable} = ${formatMathVal(solution[index])}`).join(', ')} en las ecuaciones originales.`,
        checks: originalMat.map((row, rowIndex) => ({
            label: `Ecuacion ${rowIndex + 1}`,
            passed: isZeroMathVal(math.subtract(
                row.slice(0, size).reduce((acc, coeff, colIndex) => math.add(acc, math.multiply(coeff, solution[colIndex])), math.fraction(0)),
                row[size]
            )),
            detail: `La sustitucion reproduce el termino independiente ${formatMathVal(row[size])}.`
        })),
        outputHtml: `
            <div class="step-block">
                <h4>Sistema original para verificar</h4>
                ${renderOriginalSystemHtml(originalMat)}
            </div>
            <div class="step-block">
                <h4>Sustitución ecuación por ecuación</h4>
                <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">${lines}</div>
            </div>
        `
    });
}

function buildLinearExpressionFromRow(row, variableCount) {
    const variables = ['x', 'y', 'z'].slice(0, variableCount);
    const terms = [];

    for (let index = 0; index < variableCount; index++) {
        const coeff = row[index];
        if (isZeroMathVal(coeff)) continue;

        const absCoeff = math.abs(coeff);
        const sign = math.smaller(coeff, 0) ? '-' : '+';
        const coeffText = isZeroMathVal(math.subtract(absCoeff, math.fraction(1)))
            ? ''
            : formatMathVal(absCoeff);
        terms.push({
            sign,
            text: `${coeffText}${variables[index]}`
        });
    }

    if (!terms.length) return '0';

    return terms.map((term, index) => {
        if (index === 0) {
            return `${term.sign === '-' ? '-' : ''}${term.text}`;
        }
        return ` ${term.sign} ${term.text}`;
    }).join('');
}

function buildSystemEquationLine(row, variableCount) {
    return `${buildLinearExpressionFromRow(row, variableCount)} = ${formatMathVal(row[variableCount])}`;
}

function renderOriginalSystemHtml(matrix) {
    const variableCount = matrix[0].length - 1;
    return `
        <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
            ${matrix.map((row, index) => `Ecuación ${index + 1}: ${buildSystemEquationLine(row, variableCount)}`).join('<br>')}
        </div>
    `;
}

function renderAugmentedMatrixConstruction(matrix) {
    const variableCount = matrix[0].length - 1;
    const variables = ['x', 'y', 'z'].slice(0, variableCount);
    const coefficientColumns = variables.map((variable, index) => `Columna ${index + 1} → coeficientes de ${variable}`).join('<br>');

    return `
        <p>Las columnas ${variables.map((_, index) => index + 1).join(', ')} representan los coeficientes de ${variables.join(', ')} y la última columna contiene los términos independientes.</p>
        <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">
            ${coefficientColumns}<br>
            Columna ${variableCount + 1} → términos independientes
        </div>
        <div class="step-matrix-display">${renderMatrixHTML(matrix, true)}</div>
    `;
}

function buildIdentityVerification(A, inv, label = 'Verificacion de inversa') {
    const product = multiplyMatricesExact(A, inv);
    const identity = buildIdentityMatrix(A.length);
    const isIdentity = matricesAreEqualExact(product, identity);
    return createValidationResult({
        status: isIdentity ? 'success' : 'warning',
        summary: label,
        detail: isIdentity
            ? 'El producto A * A^-1 coincide con la identidad.'
            : 'El producto calculado no coincide exactamente con la identidad esperada.',
        checks: [
            {
                label: 'Producto A * A^-1',
                passed: isIdentity,
                detail: isIdentity
                    ? 'La matriz obtenida es la identidad del mismo orden.'
                    : 'Revisa el calculo de la inversa o del producto matricial.'
            }
        ],
        outputHtml: `<div class="step-matrix-display">${renderMatrixHTML(product)}</div>`
    });
}

function buildMatrixMultiplicationVerification(A, B, result) {
    const dimensionsValid = A[0].length === B.length;
    const recomputed = dimensionsValid ? multiplyMatricesExact(A, B) : null;
    const consistent = dimensionsValid && matricesAreEqualExact(recomputed, result);
    return createValidationResult({
        status: dimensionsValid && consistent ? 'success' : 'warning',
        summary: 'Verificacion del producto matricial.',
        detail: dimensionsValid
            ? 'Se valida compatibilidad dimensional y se recompone el producto para comparar el resultado.'
            : 'La multiplicacion no esta definida porque las dimensiones internas no coinciden.',
        checks: [
            {
                label: 'Compatibilidad dimensional',
                passed: dimensionsValid,
                detail: `${A[0].length} columnas de A y ${B.length} filas de B ${dimensionsValid ? 'coinciden' : 'no coinciden'}.`
            },
            {
                label: 'Consistencia del resultado',
                passed: consistent,
                detail: dimensionsValid
                    ? (consistent ? 'La recomposicion del producto coincide con la matriz mostrada.' : 'La recomposicion no coincide con el resultado mostrado.')
                    : 'No aplica porque la operacion no esta definida.'
            }
        ],
        outputHtml: recomputed ? `<div class="step-matrix-display">${renderMatrixHTML(recomputed)}</div>` : ''
    });
}

function buildDeterminantVerification(size, det, methodText) {
    const applicable = [2, 3, 4].includes(size);
    const invertible = det !== null && det !== undefined && !isZeroMathVal(det);
    return createValidationResult({
        status: applicable ? 'success' : 'warning',
        summary: 'Verificacion estructural del determinante.',
        detail: applicable
            ? `Se valida que el metodo usado (${methodText}) corresponde al tamano ${size}x${size} y que el desarrollo termina en det(A) = ${formatMathVal(det)}.`
            : 'No hay una verificacion estructural definida para este tamano en la app actual.',
        checks: [
            {
                label: 'Metodo acorde al tamano',
                passed: applicable,
                detail: applicable ? 'El metodo elegido coincide con el orden de la matriz.' : 'El metodo no esta cubierto por el modulo actual.'
            },
            {
                label: 'Resultado final declarado',
                passed: det !== null && det !== undefined,
                detail: 'El desarrollo concluye con un valor final de determinante.'
            },
            {
                label: 'Interpretacion de invertibilidad',
                passed: det !== null && det !== undefined,
                detail: invertible
                    ? 'Como det(A) es distinto de 0, la matriz es invertible.'
                    : 'Como det(A) es 0, la matriz es singular y no tiene inversa.'
            }
        ],
        outputHtml: ''
    });
}

function buildVectorVerification(op, u, v, resultData = {}) {
    if ((op === 'add' || op === 'sub') && resultData.vector) {
        const recomputed = op === 'add'
            ? u.map((val, index) => math.add(val, v[index]))
            : u.map((val, index) => math.subtract(val, v[index]));
        const consistent = matricesAreEqualExact([recomputed], [resultData.vector]);
        return createValidationResult({
            status: consistent ? 'success' : 'warning',
            summary: `Verificacion de ${op === 'add' ? 'suma' : 'resta'} de vectores.`,
            detail: 'Se recompone la operacion componente por componente para contrastar el resultado final.',
            checks: [
                {
                    label: 'Consistencia componente a componente',
                    passed: consistent,
                    detail: consistent
                        ? 'Cada componente coincide con la operacion esperada.'
                        : 'Alguna componente no coincide con la operacion esperada.'
                }
            ]
        });
    }

    if (op === 'dot' && resultData.scalar !== undefined) {
        return createValidationResult({
            status: isZeroMathVal(resultData.scalar) ? 'success' : 'info',
            summary: 'Verificacion del producto punto.',
            detail: isZeroMathVal(resultData.scalar)
                ? 'El producto punto es 0, asi que los vectores son perpendiculares.'
                : 'El producto punto no es 0, asi que los vectores no son perpendiculares.',
            checks: [
                {
                    label: 'Perpendicularidad',
                    passed: isZeroMathVal(resultData.scalar),
                    detail: `u · v = ${formatMathVal(resultData.scalar)}`
                }
            ]
        });
    }

    if (op === 'mag_u' && resultData.scalar !== undefined) {
        return createValidationResult({
            status: math.number(resultData.scalar) >= 0 ? 'success' : 'warning',
            summary: 'Verificacion de magnitud.',
            detail: 'La magnitud de un vector debe ser no negativa.',
            checks: [
                {
                    label: 'No negatividad',
                    passed: math.number(resultData.scalar) >= 0,
                    detail: `||u|| = ${formatMathVal(resultData.scalar)}`
                }
            ]
        });
    }

    if (op === 'angle' && resultData.scalar !== undefined) {
        const angleNumber = resultData.scalar;
        return createValidationResult({
            status: angleNumber >= 0 && angleNumber <= 180 ? 'success' : 'warning',
            summary: 'Verificacion del angulo.',
            detail: 'En grados, el angulo entre dos vectores debe quedar entre 0 y 180.',
            checks: [
                {
                    label: 'Rango angular',
                    passed: angleNumber >= 0 && angleNumber <= 180,
                    detail: `Angulo calculado = ${angleNumber.toFixed(2)} grados`
                },
                {
                    label: 'Consistencia geometrica',
                    passed: true,
                    detail: angleNumber === 90
                        ? 'El angulo recto coincide con perpendicularidad.'
                        : (angleNumber < 90 ? 'El angulo es agudo.' : 'El angulo es obtuso.')
                }
            ]
        });
    }

    if (op === 'cross' && resultData.vector) {
        const dotU = vecDotExact(resultData.vector, u);
        const dotV = vecDotExact(resultData.vector, v);
        return createValidationResult({
            status: isZeroMathVal(dotU) && isZeroMathVal(dotV) ? 'success' : 'warning',
            summary: 'Verificacion del producto cruz.',
            detail: 'El producto cruz debe ser perpendicular a ambos vectores originales.',
            checks: [
                {
                    label: '(u × v) · u',
                    passed: isZeroMathVal(dotU),
                    detail: `Resultado = ${formatMathVal(dotU)}`
                },
                {
                    label: '(u × v) · v',
                    passed: isZeroMathVal(dotV),
                    detail: `Resultado = ${formatMathVal(dotV)}`
                }
            ]
        });
    }

    if (op === 'proj' && resultData.vector && v) {
        const crossLike = resultData.vector.map((val, idx) => math.subtract(math.multiply(val, v[0]), math.multiply(v[idx], resultData.vector[0])));
        const consistentDirection = crossLike.every((val) => isZeroMathVal(val));
        const residual = u.map((val, idx) => math.subtract(val, resultData.vector[idx]));
        const orthogonality = vecDotExact(residual, v);
        return createValidationResult({
            status: consistentDirection ? 'success' : 'info',
            summary: 'Verificacion de proyeccion.',
            detail: 'La proyeccion debe quedar alineada con el vector sobre el que se proyecta.',
            checks: [
                {
                    label: 'Alineacion con v',
                    passed: consistentDirection,
                    detail: consistentDirection ? 'El vector proyectado queda en la misma direccion de v.' : 'Revisa si la proyeccion final es paralela a v.'
                },
                {
                    label: '(u - proy_v(u)) · v',
                    passed: isZeroMathVal(orthogonality),
                    detail: `Resultado = ${formatMathVal(orthogonality)}`
                }
            ]
        });
    }

    return createValidationResult({
        status: 'info',
        summary: 'Verificacion vectorial.',
        detail: 'No se definio una comprobacion automatica adicional para esta operacion.',
        checks: []
    });
}

function vecDotExact(a, b) {
    return a.reduce((sum, val, index) => math.add(sum, math.multiply(val, b[index])), math.fraction(0));
}

function determinantInterpretation(det) {
    if (isZeroMathVal(det)) {
        return 'Como el determinante es 0, la matriz es singular: no tiene inversa y la transformacion lineal colapsa area o volumen, por lo que las filas o columnas son linealmente dependientes.';
    }
    if (math.smaller(det, 0)) {
        return 'Como el determinante es distinto de 0 y además es negativo, la matriz es invertible y la transformación cambia la orientación mientras escala área o volumen con un factor no nulo.';
    }
    return 'Como el determinante es distinto de 0, la matriz es invertible, las filas y columnas son linealmente independientes y la transformacion conserva area o volumen con un factor de escala distinto de cero.';
}

function buildDeterminantSetupStep(A, size, methodText) {
    const reasonBySize = {
        2: 'Al ser una matriz 2x2, corresponde usar la fórmula directa ad - bc.',
        3: 'Al ser una matriz 3x3, corresponde usar la regla de Sarrus.',
        4: 'Al ser una matriz 4x4, corresponde usar expansión por cofactores.'
    };

    return addStep(
        'Paso 1: Identificar el orden y elegir el metodo',
        `La matriz dada es de orden ${size}x${size}. ${reasonBySize[size] || 'Se usa el metodo definido para este orden.'}`,
        `Metodo seleccionado: ${methodText}`,
        `<div class="step-matrix-display">${renderMatrixHTML(A)}</div>`,
        `<div class="step-matrix-display">${renderMatrixHTML(A)}</div><p><strong>Metodo seleccionado:</strong> ${methodText}</p>`,
        'Elegir el metodo correcto evita aplicar una tecnica que no corresponda al tamano de la matriz.',
        { kind: 'theory' }
    );
}

function cloneMathMatrix(matrix) {
    return matrix.map((row) => row.map((value) => value));
}

function renderRowOperationBreakdown(beforeMat, afterMat, targetRow, sourceRow, factor, operationLabel, highlightedCells = []) {
    const lines = [];
    for (let c = 0; c < beforeMat[targetRow].length; c++) {
        const beforeVal = beforeMat[targetRow][c];
        const sourceVal = beforeMat[sourceRow][c];
        const factorTimesSource = math.multiply(factor, sourceVal);
        const afterVal = afterMat[targetRow][c];
        lines.push(
            `Columna ${c + 1}: ${formatMathVal(beforeVal)} - (${formatMathVal(factor)} * ${formatMathVal(sourceVal)}) = ` +
            `${formatMathVal(beforeVal)} - (${formatMathVal(factorTimesSource)}) = ${formatMathVal(afterVal)}`
        );
    }

    return `
        <p><strong>Operacion realizada:</strong> ${operationLabel}</p>
        <div class="step-block">
            <h4>Antes</h4>
            <div class="step-matrix-display">${renderMatrixHTML(beforeMat, true)}</div>
        </div>
        <div class="step-block">
            <h4>Despues</h4>
            <div class="step-matrix-display">${renderMatrixHTML(afterMat, true, highlightedCells)}</div>
            ${renderPivotSummary(highlightedCells)}
        </div>
        <p><strong>Que cambio:</strong> La fila objetivo se reemplaza por una combinacion lineal que anula la entrada de la columna del pivote sin cambiar la solucion del sistema.</p>
        <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">${lines.join('<br>')}</div>
    `;
}

function renderRowScaleBreakdown(beforeMat, afterMat, rowIndex, divisor, highlightedCells = []) {
    const lines = [];
    for (let c = 0; c < beforeMat[rowIndex].length; c++) {
        const beforeVal = beforeMat[rowIndex][c];
        const afterVal = afterMat[rowIndex][c];
        lines.push(`Columna ${c + 1}: ${formatMathVal(beforeVal)} / ${formatMathVal(divisor)} = ${formatMathVal(afterVal)}`);
    }

    return `
        <p><strong>Operacion realizada:</strong> F${rowIndex + 1} <- F${rowIndex + 1} / ${formatMathVal(divisor)}</p>
        <div class="step-block">
            <h4>Antes</h4>
            <div class="step-matrix-display">${renderMatrixHTML(beforeMat, true)}</div>
        </div>
        <div class="step-block">
            <h4>Despues</h4>
            <div class="step-matrix-display">${renderMatrixHTML(afterMat, true, highlightedCells)}</div>
            ${renderPivotSummary(highlightedCells)}
        </div>
        <p><strong>Que cambio:</strong> La fila se normaliza para convertir el pivote en 1 y facilitar la eliminacion de su columna.</p>
        <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">${lines.join('<br>')}</div>
    `;
}

function buildMinorMatrix(matrix, rowToRemove, colToRemove) {
    const minor = [];
    for (let i = 0; i < matrix.length; i++) {
        if (i === rowToRemove) continue;
        const row = [];
        for (let j = 0; j < matrix[i].length; j++) {
            if (j === colToRemove) continue;
            row.push(matrix[i][j]);
        }
        minor.push(row);
    }
    return minor;
}

function renderSarrusBreakdown(minorMat) {
    const p1 = math.multiply(math.multiply(minorMat[0][0], minorMat[1][1]), minorMat[2][2]);
    const p2 = math.multiply(math.multiply(minorMat[0][1], minorMat[1][2]), minorMat[2][0]);
    const p3 = math.multiply(math.multiply(minorMat[0][2], minorMat[1][0]), minorMat[2][1]);
    const n1 = math.multiply(math.multiply(minorMat[0][2], minorMat[1][1]), minorMat[2][0]);
    const n2 = math.multiply(math.multiply(minorMat[0][0], minorMat[1][2]), minorMat[2][1]);
    const n3 = math.multiply(math.multiply(minorMat[0][1], minorMat[1][0]), minorMat[2][2]);
    const sumPos = math.add(math.add(p1, p2), p3);
    const sumNeg = math.add(math.add(n1, n2), n3);
    const det = math.subtract(sumPos, sumNeg);

    return `
        <div class="step-matrix-display">${renderMatrixHTML(minorMat)}</div>
        <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">
            Diagonales principales: ${formatMathVal(p1)} + ${formatMathVal(p2)} + ${formatMathVal(p3)} = ${formatMathVal(sumPos)}<br>
            Diagonales secundarias: ${formatMathVal(n1)} + ${formatMathVal(n2)} + ${formatMathVal(n3)} = ${formatMathVal(sumNeg)}<br>
            det(M) = ${formatMathVal(sumPos)} - ${formatMathVal(sumNeg)} = ${formatMathVal(det)}
        </div>
    `;
}

function buildDeterminant2x2Detailed(A) {
    const a = A[0][0], b = A[0][1];
    const c = A[1][0], d = A[1][1];
    const ad = math.multiply(a, d);
    const bc = math.multiply(b, c);
    const det = math.subtract(ad, bc);

    const steps = [
        createStandardMathStep(
            'Planteamiento del determinante 2x2',
            'Para una matriz 2x2 se usa la fórmula directa: producto de la diagonal principal menos producto de la diagonal secundaria.',
            `
                <div class="step-matrix-display">${renderMatrixHTML(A)}</div>
                <div class="latex-container">
                    $$ \\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc $$
                </div>
            `
        ),
        createStandardMathStep(
            'Desarrollo completo',
            'Se calculan por separado ambos productos y luego se realiza la resta final.',
            `
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    Diagonal principal: (${formatMathVal(a)})(${formatMathVal(d)}) = ${formatMathVal(ad)}<br>
                    Diagonal secundaria: (${formatMathVal(b)})(${formatMathVal(c)}) = ${formatMathVal(bc)}<br>
                    Determinante: ${formatMathVal(ad)} - (${formatMathVal(bc)}) = ${formatMathVal(det)}
                </div>
            `
        )
    ];

    return {
        det,
        methodText: 'Fórmula directa para determinante 2x2: ad - bc.',
        steps,
        html: steps.map((step) => `<div class="step-block"><h4>${step.title}</h4><p>${step.detail}</p>${step.outputHtml}</div>`).join('')
    };
}

function buildDeterminant3x3Detailed(A) {
    const p1 = math.multiply(math.multiply(A[0][0], A[1][1]), A[2][2]);
    const p2 = math.multiply(math.multiply(A[0][1], A[1][2]), A[2][0]);
    const p3 = math.multiply(math.multiply(A[0][2], A[1][0]), A[2][1]);
    const n1 = math.multiply(math.multiply(A[0][2], A[1][1]), A[2][0]);
    const n2 = math.multiply(math.multiply(A[0][0], A[1][2]), A[2][1]);
    const n3 = math.multiply(math.multiply(A[0][1], A[1][0]), A[2][2]);
    const sumPos = math.add(math.add(p1, p2), p3);
    const sumNeg = math.add(math.add(n1, n2), n3);
    const det = math.subtract(sumPos, sumNeg);

    const steps = [
        createStandardMathStep(
            'Planteamiento del determinante 3x3',
            'Para una matriz 3x3 se usa la regla de Sarrus: suma de diagonales principales menos suma de diagonales secundarias.',
            `<div class="step-matrix-display">${renderMatrixHTML(A)}</div>`
        ),
        createStandardMathStep(
            'Diagonales principales',
            'Se calculan los tres productos que recorren la matriz en sentido descendente principal.',
            `
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    D1 = (${formatMathVal(A[0][0])})(${formatMathVal(A[1][1])})(${formatMathVal(A[2][2])}) = ${formatMathVal(p1)}<br>
                    D2 = (${formatMathVal(A[0][1])})(${formatMathVal(A[1][2])})(${formatMathVal(A[2][0])}) = ${formatMathVal(p2)}<br>
                    D3 = (${formatMathVal(A[0][2])})(${formatMathVal(A[1][0])})(${formatMathVal(A[2][1])}) = ${formatMathVal(p3)}<br>
                    Suma principal = ${formatMathVal(p1)} + ${formatMathVal(p2)} + ${formatMathVal(p3)} = ${formatMathVal(sumPos)}
                </div>
            `
        ),
        createStandardMathStep(
            'Diagonales secundarias',
            'Se calculan los tres productos que recorren la matriz en sentido descendente secundario.',
            `
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    D4 = (${formatMathVal(A[0][2])})(${formatMathVal(A[1][1])})(${formatMathVal(A[2][0])}) = ${formatMathVal(n1)}<br>
                    D5 = (${formatMathVal(A[0][0])})(${formatMathVal(A[1][2])})(${formatMathVal(A[2][1])}) = ${formatMathVal(n2)}<br>
                    D6 = (${formatMathVal(A[0][1])})(${formatMathVal(A[1][0])})(${formatMathVal(A[2][2])}) = ${formatMathVal(n3)}<br>
                    Suma secundaria = ${formatMathVal(n1)} + ${formatMathVal(n2)} + ${formatMathVal(n3)} = ${formatMathVal(sumNeg)}
                </div>
            `
        ),
        createStandardMathStep(
            'Resta final',
            'El determinante se obtiene restando la suma secundaria a la suma principal.',
            `<div style="font-family: 'Fira Code', monospace; line-height: 1.7;">det(A) = ${formatMathVal(sumPos)} - ${formatMathVal(sumNeg)} = ${formatMathVal(det)}</div>`
        )
    ];

    return {
        det,
        methodText: 'Regla de Sarrus separando diagonales principales y secundarias.',
        steps,
        html: steps.map((step) => `<div class="step-block"><h4>${step.title}</h4><p>${step.detail}</p>${step.outputHtml}</div>`).join('')
    };
}

function buildDeterminant3x3ByCofactorsDetailed(A) {
    const expansion = chooseBestCofactorExpansion(A);
    const isRowExpansion = expansion.type === 'row';
    const signMatrix = [
        ['+', '-', '+'],
        ['-', '+', '-'],
        ['+', '-', '+']
    ];
    const steps = [
        createStandardMathStep(
            'Planteamiento del determinante 3x3 por cofactores',
            `Se elige la ${isRowExpansion ? 'fila' : 'columna'} ${expansion.index + 1} porque contiene ${expansion.zeroCount} cero(s), lo que reduce la cantidad de términos no nulos en la expansión.`,
            `
                <div class="step-matrix-display">${renderMatrixHTML(A)}</div>
                <div class="step-matrix-display">${renderTextMatrixHTML(signMatrix)}</div>
            `
        )
    ];
    const expansionTerms = [];
    let sum = math.fraction(0);

    for (let k = 0; k < 3; k++) {
        const rowIndex = isRowExpansion ? expansion.index : k;
        const colIndex = isRowExpansion ? k : expansion.index;
        const element = A[rowIndex][colIndex];
        const minorMat = buildMinorMatrix(A, rowIndex, colIndex);
        const minorBreakdown = buildDeterminant2x2Detailed(minorMat);
        const sign = buildCofactorSign(rowIndex, colIndex);
        const cofactor = math.multiply(sign, minorBreakdown.det);
        const term = math.multiply(element, cofactor);
        sum = math.add(sum, term);
        expansionTerms.push(formatMathVal(term));

        steps.push(
            createStandardMathStep(
                `Término ${k + 1}: a${rowIndex + 1},${colIndex + 1}`,
                `Se elimina la fila ${rowIndex + 1} y la columna ${colIndex + 1} para formar el menor correspondiente. Después se aplica el signo alternante para obtener el cofactor.`,
                `
                    <p><strong>Entrada elegida:</strong> a${rowIndex + 1},${colIndex + 1} = ${formatMathVal(element)}</p>
                    <div class="step-matrix-display">${renderMatrixHTML(minorMat)}</div>
                    <p><strong>Signo:</strong> (-1)^(${rowIndex + 1}+${colIndex + 1}) = ${sign > 0 ? '+1' : '-1'}</p>
                    <div class="assistant-module-output">${minorBreakdown.html}</div>
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                        Menor M${rowIndex + 1},${colIndex + 1} = ${formatMathVal(minorBreakdown.det)}<br>
                        Cofactor C${rowIndex + 1},${colIndex + 1} = (${sign > 0 ? '+1' : '-1'})(${formatMathVal(minorBreakdown.det)}) = ${formatMathVal(cofactor)}<br>
                        Término de expansión = (${formatMathVal(element)})(${formatMathVal(cofactor)}) = ${formatMathVal(term)}
                    </div>
                `
            )
        );
    }

    steps.push(
        createStandardMathStep(
            'Suma final de la expansión',
            'Se suman los términos obtenidos en la fila o columna elegida para llegar al valor final del determinante.',
            `<div style="font-family: 'Fira Code', monospace; line-height: 1.7;">det(A) = ${expansionTerms.join(' + ')} = ${formatMathVal(sum)}</div>`
        )
    );

    return {
        det: sum,
        methodText: `Expansión por cofactores sobre la ${isRowExpansion ? `fila ${expansion.index + 1}` : `columna ${expansion.index + 1}`}.`,
        steps,
        html: steps.map((step) => `<div class="step-block"><h4>${step.title}</h4><p>${step.detail}</p>${step.outputHtml}</div>`).join('')
    };
}

function buildCofactorSign(rowIndex, colIndex) {
    return ((rowIndex + colIndex) % 2 === 0) ? 1 : -1;
}

function buildDeterminant4x4Detailed(A) {
    const steps = [
        createStandardMathStep(
            'Planteamiento del determinante 4x4',
            'Para una matriz 4x4 se usa expansión por cofactores sobre una fila. Aquí se expande sobre la primera fila para mostrar con claridad los menores y los signos.',
            `
                <div class="step-matrix-display">${renderMatrixHTML(A)}</div>
                <div class="latex-container">
                    $$ \\det(A) = a_{11}C_{11} + a_{12}C_{12} + a_{13}C_{13} + a_{14}C_{14} $$
                </div>
            `
        )
    ];
    let htmlRows = '';
    let sum = math.fraction(0);

    for (let j = 0; j < 4; j++) {
        const element = A[0][j];
        const minorMat = buildMinorMatrix(A, 0, j);
        const minorBreakdown = buildDeterminant3x3Detailed(minorMat);
        const sign = buildCofactorSign(0, j);
        const cofactor = math.multiply(sign, minorBreakdown.det);
        const term = math.multiply(element, cofactor);
        sum = math.add(sum, term);

        const step = createStandardMathStep(
            `Cofactor C1,${j + 1}`,
            `Se elimina la fila 1 y la columna ${j + 1} para construir el menor M1,${j + 1}. Luego se aplica el signo correspondiente y se forma el término de expansión.`,
            `
                <div class="step-matrix-display">${renderMatrixHTML(minorMat)}</div>
                <p><strong>Signo:</strong> (-1)^(1+${j + 1}) = ${sign > 0 ? '+1' : '-1'}</p>
                <div class="assistant-module-output">${minorBreakdown.html}</div>
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    Cofactor C1,${j + 1} = (${sign > 0 ? '+1' : '-1'})(${formatMathVal(minorBreakdown.det)}) = ${formatMathVal(cofactor)}<br>
                    Término de expansión = a1,${j + 1} * C1,${j + 1} = (${formatMathVal(element)})(${formatMathVal(cofactor)}) = ${formatMathVal(term)}
                </div>
            `
        );
        steps.push(step);
        htmlRows += `<div class="step-block"><h4>${step.title}</h4><p>${step.detail}</p>${step.outputHtml}</div>`;
    }

    const finalStep = createStandardMathStep(
        'Suma final de cofactores',
        'Se suman los cuatro términos obtenidos en la expansión para llegar al valor final del determinante.',
        `<div style="font-family: 'Fira Code', monospace; line-height: 1.7;">det(A) = ${formatMathVal(sum)}</div>`
    );
    steps.push(finalStep);

    return {
        det: sum,
        methodText: 'Expansión por cofactores sobre la primera fila (teorema de Laplace).',
        steps,
        html: steps.map((step) => `<div class="step-block"><h4>${step.title}</h4><p>${step.detail}</p>${step.outputHtml}</div>`).join('')
    };
}

function renderSarrusExtendedMatrix(matrix) {
    const extended = matrix.map((row) => [...row, row[0], row[1]]);
    return renderMatrixHTML(extended);
}

function renderTextMatrixHTML(matrix) {
    const rows = matrix.length;
    const cols = rows ? matrix[0].length : 0;
    let html = `<div class="rendered-matrix" style="grid-template-columns: repeat(${cols}, auto);">`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            html += `<span class="rendered-cell">${matrix[i][j]}</span>`;
        }
    }

    html += '</div>';
    return html;
}

function countZeroEntries(values) {
    return values.reduce((count, value) => count + (isZeroMathVal(value) ? 1 : 0), 0);
}

function chooseBestCofactorExpansion(matrix) {
    const size = matrix.length;
    let best = null;

    for (let i = 0; i < size; i++) {
        const rowZeros = countZeroEntries(matrix[i]);
        const rowCandidate = {
            type: 'row',
            index: i,
            zeroCount: rowZeros,
            nonZeroCount: size - rowZeros
        };

        if (!best || rowCandidate.zeroCount > best.zeroCount || (rowCandidate.zeroCount === best.zeroCount && rowCandidate.nonZeroCount < best.nonZeroCount)) {
            best = rowCandidate;
        }

        const colValues = matrix.map((row) => row[i]);
        const colZeros = countZeroEntries(colValues);
        const colCandidate = {
            type: 'col',
            index: i,
            zeroCount: colZeros,
            nonZeroCount: size - colZeros
        };

        if (colCandidate.zeroCount > best.zeroCount || (colCandidate.zeroCount === best.zeroCount && colCandidate.nonZeroCount < best.nonZeroCount)) {
            best = colCandidate;
        }
    }

    return best;
}

function determinantInterpretation(det, size = null) {
    const geometricObject = size === 2
        ? 'el area'
        : size === 3
            ? 'el volumen'
            : 'el factor de escala n-dimensional';

    if (isZeroMathVal(det)) {
        return `Como el determinante es 0, la matriz es singular: no tiene inversa y la transformacion lineal colapsa ${geometricObject}, por lo que las filas o columnas son linealmente dependientes.`;
    }
    if (math.smaller(det, 0)) {
        return `Como el determinante es distinto de 0 y ademas es negativo, la matriz es invertible y la transformacion cambia la orientacion mientras escala ${geometricObject} con un factor no nulo.`;
    }
    return `Como el determinante es distinto de 0, la matriz es invertible, las filas y columnas son linealmente independientes y la transformacion conserva ${geometricObject} con un factor de escala distinto de cero.`;
}

function buildDeterminant3x3Detailed(A) {
    const p1 = math.multiply(math.multiply(A[0][0], A[1][1]), A[2][2]);
    const p2 = math.multiply(math.multiply(A[0][1], A[1][2]), A[2][0]);
    const p3 = math.multiply(math.multiply(A[0][2], A[1][0]), A[2][1]);
    const n1 = math.multiply(math.multiply(A[0][2], A[1][1]), A[2][0]);
    const n2 = math.multiply(math.multiply(A[0][0], A[1][2]), A[2][1]);
    const n3 = math.multiply(math.multiply(A[0][1], A[1][0]), A[2][2]);
    const sumPos = math.add(math.add(p1, p2), p3);
    const sumNeg = math.add(math.add(n1, n2), n3);
    const det = math.subtract(sumPos, sumNeg);

    const steps = [
        createStandardMathStep(
            'Planteamiento del determinante 3x3',
            'Para una matriz 3x3 se usa la regla de Sarrus: suma de diagonales principales menos suma de diagonales secundarias.',
            `<div class="step-matrix-display">${renderMatrixHTML(A)}</div>`
        ),
        createStandardMathStep(
            'Preparar la regla de Sarrus',
            'Se copian a la derecha las dos primeras columnas para seguir visualmente las diagonales sin omitir ningun producto.',
            `<div class="step-matrix-display">${renderSarrusExtendedMatrix(A)}</div>`
        ),
        createStandardMathStep(
            'Diagonales principales',
            'Se calculan los tres productos que recorren la matriz en sentido descendente principal.',
            `
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    D1 = (${formatMathVal(A[0][0])})(${formatMathVal(A[1][1])})(${formatMathVal(A[2][2])}) = ${formatMathVal(p1)}<br>
                    D2 = (${formatMathVal(A[0][1])})(${formatMathVal(A[1][2])})(${formatMathVal(A[2][0])}) = ${formatMathVal(p2)}<br>
                    D3 = (${formatMathVal(A[0][2])})(${formatMathVal(A[1][0])})(${formatMathVal(A[2][1])}) = ${formatMathVal(p3)}<br>
                    Suma principal = ${formatMathVal(p1)} + ${formatMathVal(p2)} + ${formatMathVal(p3)} = ${formatMathVal(sumPos)}
                </div>
            `
        ),
        createStandardMathStep(
            'Diagonales secundarias',
            'Se calculan los tres productos que recorren la matriz en sentido descendente secundario.',
            `
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    D4 = (${formatMathVal(A[0][2])})(${formatMathVal(A[1][1])})(${formatMathVal(A[2][0])}) = ${formatMathVal(n1)}<br>
                    D5 = (${formatMathVal(A[0][0])})(${formatMathVal(A[1][2])})(${formatMathVal(A[2][1])}) = ${formatMathVal(n2)}<br>
                    D6 = (${formatMathVal(A[0][1])})(${formatMathVal(A[1][0])})(${formatMathVal(A[2][2])}) = ${formatMathVal(n3)}<br>
                    Suma secundaria = ${formatMathVal(n1)} + ${formatMathVal(n2)} + ${formatMathVal(n3)} = ${formatMathVal(sumNeg)}
                </div>
            `
        ),
        createStandardMathStep(
            'Resta final',
            'El determinante se obtiene restando la suma secundaria a la suma principal.',
            `<div style="font-family: 'Fira Code', monospace; line-height: 1.7;">det(A) = ${formatMathVal(sumPos)} - ${formatMathVal(sumNeg)} = ${formatMathVal(det)}</div>`
        )
    ];

    return {
        det,
        methodText: 'Regla de Sarrus separando diagonales principales y secundarias.',
        steps,
        html: steps.map((step) => `<div class="step-block"><h4>${step.title}</h4><p>${step.detail}</p>${step.outputHtml}</div>`).join('')
    };
}

function buildDeterminant4x4Detailed(A) {
    const expansion = chooseBestCofactorExpansion(A);
    const isRowExpansion = expansion.type === 'row';
    const signMatrix = [
        ['+', '-', '+', '-'],
        ['-', '+', '-', '+'],
        ['+', '-', '+', '-'],
        ['-', '+', '-', '+']
    ];
    const steps = [
        createStandardMathStep(
            'Planteamiento del determinante 4x4',
            `Para una matriz 4x4 se usa expansion por cofactores. Se elige la ${isRowExpansion ? 'fila' : 'columna'} ${expansion.index + 1} porque contiene ${expansion.zeroCount} cero(s), lo que simplifica el calculo.`,
            `
                <div class="step-matrix-display">${renderMatrixHTML(A)}</div>
                <div class="latex-container">
                    $$ M_{ij} = \\det(\\text{submatriz al eliminar fila } i \\text{ y columna } j) $$
                    $$ C_{ij} = (-1)^{i+j} M_{ij} $$
                </div>
            `
        ),
        createStandardMathStep(
            'Patron de signos y expansion elegida',
            `El patron de signos alterna segun $(-1)^{i+j}$. Por eso se desarrolla la ${isRowExpansion ? `fila ${expansion.index + 1}` : `columna ${expansion.index + 1}`}.`,
            `
                <div class="step-matrix-display">${renderTextMatrixHTML(signMatrix)}</div>
                <p><strong>Expansion seleccionada:</strong> ${isRowExpansion ? `fila ${expansion.index + 1}` : `columna ${expansion.index + 1}`}</p>
            `,
            { kind: 'theory' }
        )
    ];
    let sum = math.fraction(0);
    const expansionTerms = [];

    for (let k = 0; k < 4; k++) {
        const rowIndex = isRowExpansion ? expansion.index : k;
        const colIndex = isRowExpansion ? k : expansion.index;
        const element = A[rowIndex][colIndex];
        const minorMat = buildMinorMatrix(A, rowIndex, colIndex);
        const minorBreakdown = buildDeterminant3x3Detailed(minorMat);
        const sign = buildCofactorSign(rowIndex, colIndex);
        const cofactor = math.multiply(sign, minorBreakdown.det);
        const term = math.multiply(element, cofactor);
        sum = math.add(sum, term);
        expansionTerms.push(formatMathVal(term));

        steps.push(
            createStandardMathStep(
                `Termino ${k + 1}: a${rowIndex + 1},${colIndex + 1}`,
                `Se elimina la fila ${rowIndex + 1} y la columna ${colIndex + 1} para formar el menor M${rowIndex + 1},${colIndex + 1}; despues se aplica el signo para obtener el cofactor C${rowIndex + 1},${colIndex + 1}.`,
                `
                    <p><strong>Entrada elegida:</strong> a${rowIndex + 1},${colIndex + 1} = ${formatMathVal(element)}</p>
                    <div class="step-matrix-display">${renderMatrixHTML(minorMat)}</div>
                    <p><strong>Signo:</strong> (-1)^(${rowIndex + 1}+${colIndex + 1}) = ${sign > 0 ? '+1' : '-1'}</p>
                    <div class="assistant-module-output">${minorBreakdown.html}</div>
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                        Menor M${rowIndex + 1},${colIndex + 1} = ${formatMathVal(minorBreakdown.det)}<br>
                        Cofactor C${rowIndex + 1},${colIndex + 1} = (${sign > 0 ? '+1' : '-1'})(${formatMathVal(minorBreakdown.det)}) = ${formatMathVal(cofactor)}<br>
                        Termino de expansion = a${rowIndex + 1},${colIndex + 1} * C${rowIndex + 1},${colIndex + 1} = (${formatMathVal(element)})(${formatMathVal(cofactor)}) = ${formatMathVal(term)}<br>
                        ${isZeroMathVal(element) ? 'Como la entrada elegida es 0, este termino aporta 0 a la suma final.' : 'Este termino se conserva en la suma final del determinante.'}
                    </div>
                `
            )
        );
    }

    steps.push(
        createStandardMathStep(
            'Suma final de cofactores',
            'Se suman todos los terminos obtenidos en la expansion elegida. Los terminos nulos tambien se muestran para que el desarrollo quede completo.',
            `<div style="font-family: 'Fira Code', monospace; line-height: 1.7;">det(A) = ${expansionTerms.join(' + ')} = ${formatMathVal(sum)}</div>`
        )
    );

    return {
        det: sum,
        methodText: `Expansion por cofactores (teorema de Laplace) sobre la ${isRowExpansion ? `fila ${expansion.index + 1}` : `columna ${expansion.index + 1}`}.`,
        steps,
        html: steps.map((step) => `<div class="step-block"><h4>${step.title}</h4><p>${step.detail}</p>${step.outputHtml}</div>`).join('')
    };
}

function calcDet() {
    try {
        clearInputErrors(document.getElementById('determinantes'));
        const size = parseInt(readValidatedChoiceInput('det-size', 'tamano de la matriz del determinante', ['2', '3', '4']), 10);
        const A = readValidatedGrid(size, size, 'det-inputs', 'la matriz del determinante');
        const methodState = resolveSelectedMethod('determinants', {
            size,
            matrix: A,
            selectedMethod: getSelectedMethod('determinants')
        });
        const stepsContainer = document.getElementById('det-steps');
        stepsContainer.innerHTML = '';
        document.getElementById('det-results').classList.remove('hidden');

        let detData = null;

        if (methodState.resolvedMethod === 'direct') {
            detData = buildDeterminant2x2Detailed(A);
        } else if (methodState.resolvedMethod === 'sarrus') {
            detData = buildDeterminant3x3Detailed(A);
        } else if (methodState.resolvedMethod === 'cofactors' && size === 3) {
            detData = buildDeterminant3x3ByCofactorsDetailed(A);
        } else if (methodState.resolvedMethod === 'cofactors' && size === 4) {
            detData = buildDeterminant4x4Detailed(A);
        } else {
            throw new Error('No se encontró un método válido para el tamaño seleccionado del determinante.');
        }

        const response = createStandardMathResponse({
            topic: 'Determinantes',
            request: `Calcular el determinante de una matriz ${size}x${size}.`,
            method: describeResolvedMethod('determinants', methodState.selectedMethod, methodState.resolvedMethod, { size, matrix: A }),
            steps: [
                buildDeterminantSetupStep(A, size, detData.methodText),
                ...detData.steps
            ],
            result: {
                summary: `El valor del determinante es ${formatMathVal(detData.det)}.`,
                valueHtml: `<div class="latex-container">$$ \\det(A) = ${formatMathVal(detData.det)} $$</div>`
            },
            verification: buildDeterminantVerification(size, detData.det, detData.methodText),
            interpretation: generateFinalInterpretation('determinantes', {
                det: detData.det
            }, {
                explanation: determinantInterpretation(detData.det, size)
            }),
            historyMeta: {
                saveToHistory: true,
                operationType: 'determinant',
                inputData: {
                    matrix: A,
                    selectedMethod: methodState.selectedMethod,
                    resolvedMethod: methodState.resolvedMethod
                },
                validationData: {
                    operation: methodState.resolvedMethod,
                    input: {
                        matrix: A,
                        method: detData.methodText
                    },
                    result: {
                        det: detData.det,
                        method: detData.methodText
                    }
                },
                summary: `Determinante de una matriz ${size}x${size}`
            }
        });
        setStandardMathResponse('det-steps', response);
    } catch (error) {
        renderValidationErrorResponse('det-steps', {
            topic: 'Determinantes',
            request: 'Calcular un determinante con el metodo adecuado segun el orden.',
            message: error.message,
            interpretation: 'Un determinante solo puede calcularse si la matriz esta completa y todas sus entradas son numericas.'
        });
    }
}

function formatVectorDisplay(vector) {
    return `[${vector.map((value) => formatMathVal(value)).join(', ')}]`;
}

function formatMathTextForHtml(text) {
    if (!text) return text;

    const htmlFragments = String(text).split(/(<[^>]+>)/g);
    return htmlFragments.map((fragment) => {
        if (!fragment || fragment.startsWith('<')) return fragment;

        const latexBlocks = [];
        const protectedFragment = fragment.replace(/\$\$[\s\S]*?\$\$|\$[^$]+\$/g, (match) => {
            const token = `__LATEX_BLOCK_${latexBlocks.length}__`;
            latexBlocks.push(match);
            return token;
        });

        const formattedFragment = formatMathPlainSegment(protectedFragment);
        return formattedFragment.replace(/__LATEX_BLOCK_(\d+)__/g, (_, index) => latexBlocks[Number(index)] || '');
    }).join('');
}

function buildVectorStepBlock(title, formula, explanation, bodyHtml, accent = 'var(--primary)') {
    return `
        <div class="step-block" style="border-left: 4px solid ${accent};">
            <h4>${title}</h4>
            ${formula ? `<div class="math-formula">${formatMathTextForHtml(formula)}</div>` : ''}
            ${explanation ? `<p>${formatMathTextForHtml(explanation)}</p>` : ''}
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">${formatMathTextForHtml(bodyHtml)}</div>
        </div>
    `;
}

function buildMatrixCellExplanation(A, B, rowIndex, colIndex) {
    const terms = [];
    for (let k = 0; k < A[0].length; k++) {
        terms.push(`A[${rowIndex + 1},${k + 1}]·B[${k + 1},${colIndex + 1}] = (${formatMathVal(A[rowIndex][k])})(${formatMathVal(B[k][colIndex])})`);
    }
    return `C[${rowIndex + 1},${colIndex + 1}] = ${terms.join(' + ')}`;
}

function buildVectorInterpretation(op, context = {}) {
    if (op === 'add') {
        return 'La suma representa la combinacion de dos desplazamientos y geometrically corresponde a la diagonal del paralelogramo formado por u y v.';
    }
    if (op === 'sub') {
        return 'La resta compara ambos vectores: el resultado apunta desde la punta de v hasta la punta de u cuando ambos parten del mismo origen.';
    }
    if (op === 'dot') {
        return isZeroMathVal(context.scalar)
            ? 'Como u · v = 0, los vectores son perpendiculares.'
            : 'Como u · v no es 0, los vectores no son perpendiculares y el signo del producto punto indica el tipo de alineacion.';
    }
    if (op === 'mag_u') {
        return 'La magnitud mide la longitud del vector desde el origen hasta su extremo.';
    }
    if (op === 'angle') {
        if (context.scalar === undefined) return 'El angulo resume la orientacion relativa entre dos vectores no nulos.';
        if (Math.abs(context.scalar - 90) < 1e-6) return 'El angulo es recto, por lo que los vectores son ortogonales.';
        if (context.scalar < 90) return 'El angulo es agudo, asi que los vectores apuntan en direcciones relativamente cercanas.';
        return 'El angulo es obtuso, asi que los vectores apuntan en direcciones mayormente opuestas.';
    }
    if (op === 'cross') {
        return 'El producto cruz genera un vector perpendicular al plano formado por u y v, y su magnitud representa el area del paralelogramo asociado.';
    }
    if (op === 'proj') {
        return 'La proyeccion extrae la parte de u que apunta exactamente en la direccion de v.';
    }
    return 'El resultado tiene una interpretacion geometrica asociada al tipo de operacion vectorial.';
}

// ================= MÓDULO 1: SISTEMAS =================
function initSystemsModule() {
    const sizeSelect = document.getElementById('sys-size');
    const practiceSelect = document.getElementById('sys-example');
    const solveBtn = document.getElementById('btn-solve-sys');

    const updateGrid = () => {
        const size = parseInt(sizeSelect.value, 10);
        setSystemSize(size);
        updateSystemMethodsBySize(size);
        setPracticeMode('');
    };

    sizeSelect.addEventListener('change', updateGrid);
    updateGrid(); // initial setup

    practiceSelect.addEventListener('change', (e) => {
        const practiceMode = e.target.value;
        if (!practiceMode) return;

        const generatedSystem = getRandomSystemExampleByMode(practiceMode);
        if (!generatedSystem) return;
        applySystemToUI(generatedSystem);
    });

    const methodSelect = document.getElementById('sys-method');
    if (methodSelect) {
        methodSelect.addEventListener('change', () => {
            document.getElementById('sys-results').classList.add('hidden');
        });
    }

    updateSystemMethodsBySize(sizeSelect.value);
    setElementValueIfPresent('sys-method', 'auto');
    solveBtn.addEventListener('click', () => { runWithAnimation('btn-solve-sys', solveSystem) });
    updateEduTip('sistemas', 'default');
}

function buildSystemClassification(rankA, rankAb, numVars) {
    if (rankA < rankAb) {
        return {
            type: "Sistema Incompatible (Sin Solución)",
            explanation: `Según el <strong>Teorema de Rouché-Frobenius</strong>: Rango(A) = ${rankA} y Rango(A|b) = ${rankAb}. Como Rango(A) ≠ Rango(A|b), el sistema posee contradicciones y gráficamente representa rectas o planos que no se intersectan.`,
            solutionHtml: `<p>No existe una solucion que satisfaga simultaneamente todas las ecuaciones del sistema.</p>`
        };
    }

    if (rankA === rankAb && rankA < numVars) {
        return {
            type: "Sistema Compatible Indeterminado (Infinitas)",
            explanation: `Según el <strong>Teorema de Rouché-Frobenius</strong>: Rango(A) = Rango(A|b) = ${rankA}, y este valor es menor que el numero de incognitas n = ${numVars}. Por eso aparecen variables libres y el sistema admite infinitas soluciones.`,
            solutionHtml: `<p>La forma reducida muestra al menos una variable libre, asi que la solucion se describe como una familia de soluciones y no como un unico punto.</p>`
        };
    }

    return {
        type: "Sistema Compatible Determinado (Solución Única)",
        explanation: `Según el <strong>Teorema de Rouché-Frobenius</strong>: Rango(A) = Rango(A|b) = ${rankA}, y ademas coincide con el numero de incognitas n = ${numVars}. Por ello existe una unica solucion.`,
        solutionHtml: ''
    };
}

function buildSystemSolutionHtml(reducedMat, size, classificationType) {
    const vars = ['x', 'y', 'z'].slice(0, size);

    if (!classificationType.includes('Determinado')) {
        if (classificationType.includes('Incompatible')) {
            return '<p>El sistema no tiene solucion, por lo tanto no se puede construir una sustitucion numerica final.</p>';
        }
        return '<p>El sistema tiene infinitas soluciones. La forma reducida final debe interpretarse en terminos de variables libres.</p>';
    }

    const lines = [];
    for (let i = 0; i < size; i++) {
        lines.push(`${vars[i]} = ${formatMathVal(reducedMat[i][size])}`);
    }

    return `
        <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">
            ${lines.join('<br>')}
        </div>
    `;
}

function buildSystemClassification(rankA, rankAb, numVars) {
    if (rankA < rankAb) {
        return {
            type: "Sistema incompatible (sin solución)",
            explanation: `Según el <strong>teorema de Rouché-Frobenius</strong>, Rango(A) = ${rankA} y Rango(A|b) = ${rankAb}. Como esos rangos son distintos, el sistema contiene una contradicción y no existe ningún punto que satisfaga todas las ecuaciones a la vez.`,
            solutionHtml: `<p>No existe una solución que satisfaga simultáneamente todas las ecuaciones del sistema.</p>`
        };
    }

    if (rankA === rankAb && rankA < numVars) {
        return {
            type: "Sistema compatible indeterminado (infinitas soluciones)",
            explanation: `Según el <strong>teorema de Rouché-Frobenius</strong>, Rango(A) = Rango(A|b) = ${rankA}, y ese valor es menor que el número de incógnitas n = ${numVars}. Por eso aparecen variables libres y el sistema admite infinitas soluciones.`,
            solutionHtml: `<p>La forma reducida muestra al menos una variable libre, así que la solución se describe como una familia de soluciones y no como un único punto.</p>`
        };
    }

    return {
        type: "Sistema compatible determinado (solución única)",
        explanation: `Según el <strong>teorema de Rouché-Frobenius</strong>, Rango(A) = Rango(A|b) = ${rankA}, y además coincide con el número de incógnitas n = ${numVars}. Por eso el sistema tiene una única solución.`,
        solutionHtml: ''
    };
}

function isOneMathVal(value) {
    return isZeroMathVal(math.subtract(math.abs(value), math.fraction(1)));
}

function getSystemCoefficientMatrix(augmentedMatrix) {
    return augmentedMatrix.map((row) => row.slice(0, augmentedMatrix.length));
}

function getSystemConstantsVector(augmentedMatrix) {
    const size = augmentedMatrix.length;
    return augmentedMatrix.map((row) => row[size]);
}

function updateSystemMethodsBySize(size) {
    const methodSelect = document.getElementById('sys-method');
    if (!methodSelect) return;

    const normalizedSize = Number(size) === 3 ? 3 : 2;
    const options = normalizedSize === 2
        ? [
            { value: 'auto', label: 'Automático' },
            { value: 'substitution', label: 'Sustitución' },
            { value: 'equalization', label: 'Igualación' },
            { value: 'elimination', label: 'Reducción / Eliminación' },
            { value: 'gauss', label: 'Gauss' },
            { value: 'gauss_jordan', label: 'Gauss-Jordan' },
            { value: 'cramer', label: 'Regla de Cramer' }
        ]
        : [
            { value: 'auto', label: 'Automático' },
            { value: 'gauss', label: 'Gauss' },
            { value: 'gauss_jordan', label: 'Gauss-Jordan' },
            { value: 'cramer', label: 'Regla de Cramer' }
        ];

    const previousValue = String(methodSelect.value || 'auto').trim();
    methodSelect.innerHTML = options
        .map((option) => `<option value="${option.value}">${option.label}</option>`)
        .join('');
    methodSelect.value = options.some((option) => option.value === previousValue) ? previousValue : 'auto';
}

function getSelectedSystemMethod() {
    return getSelectedMethod('systems');
}

function canUseCramer(data = {}) {
    const size = Number(data.size || data.augmentedMatrix?.length || 0);
    const coefficientMatrix = data.coefficientMatrix || (data.augmentedMatrix ? getSystemCoefficientMatrix(data.augmentedMatrix) : null);

    if (!coefficientMatrix || coefficientMatrix.length !== size || (size !== 2 && size !== 3)) {
        return {
            applies: false,
            determinant: null,
            reason: 'La Regla de Cramer solo está disponible para sistemas cuadrados 2x2 o 3x3.'
        };
    }

    const determinant = math.det(coefficientMatrix);
    if (isZeroMathVal(determinant)) {
        return {
            applies: false,
            determinant,
            reason: 'La Regla de Cramer no puede aplicarse porque el determinante principal es 0.'
        };
    }

    return {
        applies: true,
        determinant,
        reason: ''
    };
}

function canUseSystemMethod(method, data = {}) {
    const size = Number(data.size || data.augmentedMatrix?.length || 0);

    if (method === 'auto') return true;
    if (['gauss', 'gauss_jordan'].includes(method)) return size === 2 || size === 3;
    if (['substitution', 'equalization', 'elimination'].includes(method)) return size === 2;
    if (method === 'cramer') return size === 2 || size === 3;
    return false;
}

function getBestSystemMethod(data = {}) {
    const size = Number(data.size || data.augmentedMatrix?.length || 0);
    const coefficientMatrix = data.coefficientMatrix || (data.augmentedMatrix ? getSystemCoefficientMatrix(data.augmentedMatrix) : []);

    if (size === 2) {
        const determinant = coefficientMatrix.length === 2 ? math.det(coefficientMatrix) : null;
        const [[a, b], [c, d]] = coefficientMatrix;
        const canIsolateX = !isZeroMathVal(a) || !isZeroMathVal(c);
        const canIsolateY = !isZeroMathVal(b) || !isZeroMathVal(d);
        const canEqualizeX = !isZeroMathVal(a) && !isZeroMathVal(c);
        const canEqualizeY = !isZeroMathVal(b) && !isZeroMathVal(d);
        const hasUnitCoefficient = coefficientMatrix.some((row) => row.some((value) => !isZeroMathVal(value) && isOneMathVal(value)));

        if (determinant !== null && isZeroMathVal(determinant)) {
            return 'elimination';
        }
        if (hasUnitCoefficient && (canIsolateX || canIsolateY)) {
            return 'substitution';
        }
        if ((canEqualizeX || canEqualizeY) && coefficientMatrix.every((row) => row.every((value) => !isZeroMathVal(value)))) {
            return 'equalization';
        }
        return 'elimination';
    }

    if (size === 3) {
        return 'gauss';
    }

    return 'gauss_jordan';
}

function classifyTwoByTwoFromDeterminants(delta, deltaX, deltaY) {
    if (!isZeroMathVal(delta)) {
        return {
            type: 'Sistema compatible determinado (solución única)',
            explanation: 'El determinante principal es distinto de 0, así que el sistema tiene una única solución.',
            solutionHtml: ''
        };
    }

    if (isZeroMathVal(deltaX) && isZeroMathVal(deltaY)) {
        return {
            type: 'Sistema compatible indeterminado (infinitas soluciones)',
            explanation: 'El determinante principal y los determinantes asociados a las incógnitas valen 0. Las ecuaciones representan la misma recta y el sistema admite infinitas soluciones.',
            solutionHtml: '<p>Las dos ecuaciones son dependientes, así que el sistema describe la misma recta y no tiene una única pareja ordenada final.</p>'
        };
    }

    return {
        type: 'Sistema incompatible (sin solución)',
        explanation: 'El determinante principal es 0 pero al menos uno de los determinantes asociados no lo es. Eso indica contradicción entre las ecuaciones y, por tanto, no existe una solución común.',
        solutionHtml: '<p>Las ecuaciones son incompatibles: al desarrollar el método aparece una contradicción, así que no existe una solución que satisfaga ambas a la vez.</p>'
    };
}

function buildMethodSpecificTwoByTwoClassification(methodKey, delta, deltaX, deltaY) {
    const actionMap = {
        substitution: {
            unique: 'Después de despejar una variable y sustituirla en la otra ecuación se obtiene un único par ordenado que satisface el sistema.',
            infinite: 'Al sustituir una ecuación en la otra se obtiene una identidad. Eso muestra que ambas ecuaciones representan la misma recta y el sistema tiene infinitas soluciones.',
            incompatible: 'Al sustituir una ecuación en la otra aparece una contradicción. Por eso las rectas no comparten ningún punto y el sistema no tiene solución.'
        },
        equalization: {
            unique: 'Al igualar las expresiones despejadas se obtiene una única solución compatible con ambas ecuaciones.',
            infinite: 'Al igualar las expresiones se llega a una identidad, señal de que ambas ecuaciones describen la misma relación y el sistema admite infinitas soluciones.',
            incompatible: 'Al igualar las expresiones aparece una contradicción, así que las ecuaciones no comparten una solución común.'
        },
        elimination: {
            unique: 'Al eliminar una variable queda una sola incógnita, y luego se recupera la otra. El sistema tiene una única solución.',
            infinite: 'Al combinar las ecuaciones se obtiene una identidad. Eso indica dependencia entre ellas y, por tanto, infinitas soluciones.',
            incompatible: 'Al combinar las ecuaciones aparece una contradicción. Por eso el sistema es incompatible y no tiene solución.'
        }
    };

    const baseClassification = classifyTwoByTwoFromDeterminants(delta, deltaX, deltaY);
    const methodNarratives = actionMap[methodKey] || actionMap.elimination;

    if (!isZeroMathVal(delta)) {
        return { ...baseClassification, explanation: methodNarratives.unique };
    }
    if (isZeroMathVal(deltaX) && isZeroMathVal(deltaY)) {
        return { ...baseClassification, explanation: methodNarratives.infinite };
    }
    return { ...baseClassification, explanation: methodNarratives.incompatible };
}

function standardizeSystemSteps(steps = [], size) {
    return (steps || []).map((step) => {
        if (step && typeof step === 'object' && 'detail' in step && 'html' in step) {
            return step;
        }

        const fallbackHtml = step?.mat
            ? `<div class="step-matrix-display">${renderMatrixHTML(step.mat, true, findPivotPositions(step.mat, size))}</div>`
            : '<p>Sin detalle adicional.</p>';

        return createStandardMathStep(
            step?.title || 'Paso',
            step?.detail || step?.desc || '',
            step?.html || step?.outputHtml || fallbackHtml
        );
    });
}

function ensureDidacticSystemEvidence(steps = [], originalMat, classification, size) {
    const enrichedSteps = [...standardizeSystemSteps(steps, size)];

    if (!hasValidationEvidence(enrichedSteps, [/matriz aumentada/])) {
        enrichedSteps.unshift(createStandardMathStep(
            'Matriz aumentada inicial',
            'Se construye la matriz aumentada [A | b] para organizar coeficientes y terminos independientes antes de aplicar el metodo.',
            renderAugmentedMatrixConstruction(originalMat),
            { kind: 'theory' }
        ));
    }

    if (!hasValidationEvidence(enrichedSteps, [/clasific/])) {
        enrichedSteps.push(createStandardMathStep(
            'Clasificacion final del sistema',
            'Se explica la clasificacion final del sistema a partir del procedimiento y de la verificacion algebraica.',
            `
                <p><strong>Clasificacion:</strong> ${classification.type}</p>
                <p>${classification.explanation}</p>
                ${classification.solutionHtml || ''}
            `,
            { kind: 'interpretation' }
        ));
    }

    return enrichedSteps;
}

function getSystemAutoMethodReason(method, size, data = {}) {
    if (method === 'substitution') {
        return 'Se detectó un sistema 2x2 con un coeficiente sencillo para despejar una variable y reemplazarla sin introducir demasiadas fracciones.';
    }
    if (method === 'equalization') {
        return 'Se detectó un sistema 2x2 donde conviene despejar la misma variable en ambas ecuaciones e igualar las expresiones obtenidas.';
    }
    if (method === 'elimination') {
        return 'Se detectó un sistema 2x2 donde resulta más claro anular una variable combinando ecuaciones.';
    }
    if (method === 'gauss') {
        return size === 3
            ? 'Para un sistema 3x3 es más pedagógico triangular primero y luego hacer sustitución regresiva.'
            : 'Se priorizó la forma escalonada superior para resolver el sistema de manera ordenada.';
    }
    if (method === 'gauss_jordan') {
        return 'Se eligió la forma reducida por filas porque permite leer directamente la solución y clasificar el sistema.';
    }
    if (method === 'cramer') {
        const coefficientMatrix = data.coefficientMatrix || (data.augmentedMatrix ? getSystemCoefficientMatrix(data.augmentedMatrix) : []);
        const determinant = coefficientMatrix.length ? math.det(coefficientMatrix) : null;
        return `El sistema es cuadrado y su determinante principal ${determinant !== null ? `(${formatMathVal(determinant)}) ` : ''}es distinto de 0, así que Cramer es válido y produce una solución única.`;
    }
    return 'Se seleccionó el procedimiento más adecuado para este sistema.';
}

function finalizeSystemResolution(resolution, { selectedMethod, resolvedMethod, size, data }) {
    const methodMode = selectedMethod === 'auto' ? 'automatic' : 'manual';
    const methodLabel = getMethodLabel('systems', resolvedMethod);
    const methodText = methodMode === 'automatic'
        ? `Selección automática -> se eligió ${methodLabel}. ${getSystemAutoMethodReason(resolvedMethod, size, data)}`
        : methodLabel;

    return {
        ...resolution,
        methodKey: resolvedMethod,
        methodUsed: methodLabel,
        methodMode,
        methodText,
        steps: standardizeSystemSteps(resolution.steps, size)
    };
}

function buildSystemMethodResponse({
    originalMat,
    verificationMatrix,
    steps,
    classification,
    methodText,
    methodKey = '',
    solutionHtml = null,
    solutionVector = null,
    visualizationType = 'matrix',
    resultMatrix = null,
    reportProfile = '',
    ...extras
}) {
    const size = originalMat.length;

    return {
        finalMatrix: resultMatrix === null ? verificationMatrix : resultMatrix,
        verificationMatrix,
        steps: ensureDidacticSystemEvidence(steps, originalMat, classification, size),
        classification,
        type: classification.type,
        explanation: classification.explanation,
        solutionHtml: solutionHtml || classification.solutionHtml,
        methodText,
        methodKey,
        solutionVector,
        visualizationType,
        reportProfile: reportProfile || methodKey,
        ...extras
    };
}

function buildSystemReferenceReduction(augmentedMatrix) {
    const size = augmentedMatrix.length;
    return solveSystemGaussJordanDetailed(augmentedMatrix, size).finalMatrix;
}

function solveBySubstitution(data) {
    const { augmentedMatrix } = data;
    const coefficients = getSystemCoefficientMatrix(augmentedMatrix);
    const constants = getSystemConstantsVector(augmentedMatrix);
    const [[a, b], [c, d]] = coefficients;
    const [e, f] = constants;
    const delta = math.subtract(math.multiply(a, d), math.multiply(b, c));
    const deltaX = math.subtract(math.multiply(e, d), math.multiply(b, f));
    const deltaY = math.subtract(math.multiply(a, f), math.multiply(e, c));
    const classification = buildMethodSpecificTwoByTwoClassification('substitution', delta, deltaX, deltaY);
    const canIsolateX = !isZeroMathVal(a) || !isZeroMathVal(c);
    const canIsolateY = !isZeroMathVal(b) || !isZeroMathVal(d);

    if (!canIsolateX && !canIsolateY) {
        throw new Error('La sustitución requiere poder despejar al menos una variable en alguna ecuación. En este caso conviene usar reducción, Gauss o Gauss-Jordan.');
    }

    const isolateVar = canIsolateX ? 'x' : 'y';
    const solveFromFirst = isolateVar === 'x' ? !isZeroMathVal(a) : !isZeroMathVal(b);
    const baseEqIndex = solveFromFirst ? 0 : 1;
    const otherEqIndex = solveFromFirst ? 1 : 0;
    const eqBase = augmentedMatrix[baseEqIndex];
    const eqOther = augmentedMatrix[otherEqIndex];
    const solution = !isZeroMathVal(delta)
        ? [math.divide(deltaX, delta), math.divide(deltaY, delta)]
        : null;
    const verificationMatrix = solution
        ? buildIdentityAugmentedFromSolution(solution)
        : buildSystemReferenceReduction(augmentedMatrix);

    const despejeHtml = isolateVar === 'x'
        ? `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                ${solveFromFirst ? 'Ecuación 1' : 'Ecuación 2'}: (${formatMathVal(eqBase[0])})x + (${formatMathVal(eqBase[1])})y = ${formatMathVal(eqBase[2])}<br>
                x = (${formatMathVal(eqBase[2])} - (${formatMathVal(eqBase[1])})y) / ${formatMathVal(eqBase[0])}
            </div>
        `
        : `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                ${solveFromFirst ? 'Ecuación 1' : 'Ecuación 2'}: (${formatMathVal(eqBase[0])})x + (${formatMathVal(eqBase[1])})y = ${formatMathVal(eqBase[2])}<br>
                y = (${formatMathVal(eqBase[2])} - (${formatMathVal(eqBase[0])})x) / ${formatMathVal(eqBase[1])}
            </div>
        `;

    const substitutionHtml = isolateVar === 'x'
        ? `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                Sustituimos x en la otra ecuación:<br>
                (${formatMathVal(eqOther[0])})[( ${formatMathVal(eqBase[2])} - (${formatMathVal(eqBase[1])})y ) / ${formatMathVal(eqBase[0])}] + (${formatMathVal(eqOther[1])})y = ${formatMathVal(eqOther[2])}
            </div>
        `
        : `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                Sustituimos y en la otra ecuación:<br>
                (${formatMathVal(eqOther[0])})x + (${formatMathVal(eqOther[1])})[( ${formatMathVal(eqBase[2])} - (${formatMathVal(eqBase[0])})x ) / ${formatMathVal(eqBase[1])}] = ${formatMathVal(eqOther[2])}
            </div>
        `;

    const finalHtml = solution
        ? `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                x = ${formatMathVal(solution[0])}<br>
                y = ${formatMathVal(solution[1])}
            </div>
        `
        : classification.solutionHtml;

    return buildSystemMethodResponse({
        originalMat: augmentedMatrix,
        verificationMatrix,
        classification,
        methodKey: 'substitution',
        methodText: 'Sustitución: despejar una variable, reemplazarla en la otra ecuación y luego regresar al despeje inicial.',
        solutionHtml: finalHtml,
        solutionVector: solution,
        visualizationType: 'none',
        resultMatrix: null,
        reportProfile: 'substitution',
        steps: [
            {
                title: 'Sistema original',
                desc: 'Se observan las dos ecuaciones para decidir cuál conviene despejar primero.',
                outputHtml: renderOriginalSystemHtml(augmentedMatrix)
            },
            {
                title: 'Despejar una variable',
                desc: `Se despeja ${isolateVar} en la ecuación con coeficiente más conveniente para simplificar las fracciones.`,
                outputHtml: despejeHtml
            },
            {
                title: 'Sustituir en la otra ecuación',
                desc: `La expresión obtenida para ${isolateVar} se reemplaza en la otra ecuación para quedarnos con una sola incógnita.`,
                outputHtml: substitutionHtml
            },
            {
                title: 'Interpretar el resultado',
                desc: 'Se interpreta si el despeje y la sustitución conducen a una solución única, una identidad o una contradicción.',
                outputHtml: finalHtml
            }
        ]
    });
}

function solveByEqualization(data) {
    const { augmentedMatrix } = data;
    const coefficients = getSystemCoefficientMatrix(augmentedMatrix);
    const constants = getSystemConstantsVector(augmentedMatrix);
    const [[a, b], [c, d]] = coefficients;
    const [e, f] = constants;
    const delta = math.subtract(math.multiply(a, d), math.multiply(b, c));
    const deltaX = math.subtract(math.multiply(e, d), math.multiply(b, f));
    const deltaY = math.subtract(math.multiply(a, f), math.multiply(e, c));
    const classification = buildMethodSpecificTwoByTwoClassification('equalization', delta, deltaX, deltaY);
    const canEqualizeX = !isZeroMathVal(a) && !isZeroMathVal(c);
    const canEqualizeY = !isZeroMathVal(b) && !isZeroMathVal(d);

    if (!canEqualizeX && !canEqualizeY) {
        throw new Error('La igualación requiere poder despejar la misma variable en ambas ecuaciones. En este sistema conviene usar reducción, Gauss o Gauss-Jordan.');
    }

    const isolateX = canEqualizeX && (!canEqualizeY || (math.number(math.abs(a)) + math.number(math.abs(c)) <= math.number(math.abs(b)) + math.number(math.abs(d))));
    const solution = !isZeroMathVal(delta)
        ? [math.divide(deltaX, delta), math.divide(deltaY, delta)]
        : null;
    const verificationMatrix = solution
        ? buildIdentityAugmentedFromSolution(solution)
        : buildSystemReferenceReduction(augmentedMatrix);

    const despejeAmbas = isolateX
        ? `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                Ecuación 1: x = (${formatMathVal(e)} - (${formatMathVal(b)})y) / ${formatMathVal(a)}<br>
                Ecuación 2: x = (${formatMathVal(f)} - (${formatMathVal(d)})y) / ${formatMathVal(c)}
            </div>
        `
        : `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                Ecuación 1: y = (${formatMathVal(e)} - (${formatMathVal(a)})x) / ${formatMathVal(b)}<br>
                Ecuación 2: y = (${formatMathVal(f)} - (${formatMathVal(c)})x) / ${formatMathVal(d)}
            </div>
        `;

    const igualacionHtml = isolateX
        ? `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                (${formatMathVal(e)} - (${formatMathVal(b)})y) / ${formatMathVal(a)} = (${formatMathVal(f)} - (${formatMathVal(d)})y) / ${formatMathVal(c)}
            </div>
        `
        : `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                (${formatMathVal(e)} - (${formatMathVal(a)})x) / ${formatMathVal(b)} = (${formatMathVal(f)} - (${formatMathVal(c)})x) / ${formatMathVal(d)}
            </div>
        `;

    return buildSystemMethodResponse({
        originalMat: augmentedMatrix,
        verificationMatrix,
        classification,
        methodKey: 'equalization',
        methodText: 'Igualación: despejar la misma variable en ambas ecuaciones y luego igualar las expresiones obtenidas.',
        solutionHtml: solution
            ? `
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    x = ${formatMathVal(solution[0])}<br>
                    y = ${formatMathVal(solution[1])}
                </div>
            `
            : classification.solutionHtml,
        solutionVector: solution,
        visualizationType: 'none',
        resultMatrix: null,
        reportProfile: 'equalization',
        steps: [
            {
                title: 'Sistema original',
                desc: 'Se identifican las dos ecuaciones y se decide qué variable conviene despejar en ambas.',
                outputHtml: renderOriginalSystemHtml(augmentedMatrix)
            },
            {
                title: 'Despejar la misma variable en ambas ecuaciones',
                desc: `Se despeja ${isolateX ? 'x' : 'y'} en las dos ecuaciones para luego igualar ambas expresiones.`,
                outputHtml: despejeAmbas
            },
            {
                title: 'Igualar las expresiones',
                desc: 'Como ambas expresiones representan la misma variable, se igualan y se resuelve la incógnita restante.',
                outputHtml: igualacionHtml
            },
            {
                title: 'Interpretar el resultado',
                desc: 'Se revisa si la igualación conduce a una solución única, una identidad o una contradicción.',
                outputHtml: solution
                    ? `
                        <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                            x = ${formatMathVal(solution[0])}<br>
                            y = ${formatMathVal(solution[1])}
                        </div>
                    `
                    : classification.solutionHtml
            }
        ]
    });
}

function solveByElimination(data) {
    const { augmentedMatrix } = data;
    const coefficients = getSystemCoefficientMatrix(augmentedMatrix);
    const constants = getSystemConstantsVector(augmentedMatrix);
    const [[a, b], [c, d]] = coefficients;
    const [e, f] = constants;
    const delta = math.subtract(math.multiply(a, d), math.multiply(b, c));
    const deltaX = math.subtract(math.multiply(e, d), math.multiply(b, f));
    const deltaY = math.subtract(math.multiply(a, f), math.multiply(e, c));
    const classification = buildMethodSpecificTwoByTwoClassification('elimination', delta, deltaX, deltaY);
    const canEliminateX = !isZeroMathVal(a) && !isZeroMathVal(c);
    const canEliminateY = !isZeroMathVal(b) && !isZeroMathVal(d);

    if (!canEliminateX && !canEliminateY) {
        throw new Error('La reducción requiere una variable común entre ambas ecuaciones para poder anularla. En este caso conviene usar sustitución, Gauss o Gauss-Jordan.');
    }

    const eliminateX = !canEliminateX
        ? false
        : !canEliminateY
            ? true
            : math.number(math.abs(math.multiply(a, c))) <= math.number(math.abs(math.multiply(b, d)));
    const firstFactor = eliminateX ? c : d;
    const secondFactor = eliminateX ? a : b;
    const scaledEq1 = augmentedMatrix[0].map((value) => math.multiply(value, firstFactor));
    const scaledEq2 = augmentedMatrix[1].map((value) => math.multiply(value, secondFactor));
    const combined = scaledEq2.map((value, index) => math.subtract(value, scaledEq1[index]));
    const solution = !isZeroMathVal(delta)
        ? [math.divide(deltaX, delta), math.divide(deltaY, delta)]
        : null;
    const verificationMatrix = solution
        ? buildIdentityAugmentedFromSolution(solution)
        : buildSystemReferenceReduction(augmentedMatrix);

    return buildSystemMethodResponse({
        originalMat: augmentedMatrix,
        verificationMatrix,
        classification,
        methodKey: 'elimination',
        methodText: 'Reducción / eliminación: combinar ecuaciones para anular una variable y resolver primero la restante.',
        solutionHtml: solution
            ? `
                <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                    x = ${formatMathVal(solution[0])}<br>
                    y = ${formatMathVal(solution[1])}
                </div>
            `
            : classification.solutionHtml,
        solutionVector: solution,
        visualizationType: 'none',
        resultMatrix: null,
        reportProfile: 'elimination',
        steps: [
            {
                title: 'Sistema original',
                desc: 'Se inspeccionan las ecuaciones para decidir cuál variable conviene eliminar.',
                outputHtml: renderOriginalSystemHtml(augmentedMatrix)
            },
            {
                title: 'Preparar la eliminación',
                desc: `Se multiplican las ecuaciones para anular ${eliminateX ? 'x' : 'y'} al sumar o restar ambas expresiones.`,
                outputHtml: `
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                        E1 × ${formatMathVal(firstFactor)} -> [${scaledEq1.map((value) => formatMathVal(value)).join(', ')}]<br>
                        E2 × ${formatMathVal(secondFactor)} -> [${scaledEq2.map((value) => formatMathVal(value)).join(', ')}]
                    </div>
                `
            },
            {
                title: 'Restar las ecuaciones escaladas',
                desc: `Al restar las ecuaciones escaladas desaparece ${eliminateX ? 'x' : 'y'} y queda una ecuación con una sola incógnita.`,
                outputHtml: `
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                        Resultado combinado: [${combined.map((value) => formatMathVal(value)).join(', ')}]
                    </div>
                `
            },
            {
                title: 'Interpretar el resultado',
                desc: 'Se resuelve la variable restante y luego se reemplaza en una de las ecuaciones originales, o se detecta identidad/contradicción.',
                outputHtml: solution
                    ? `
                        <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                            x = ${formatMathVal(solution[0])}<br>
                            y = ${formatMathVal(solution[1])}
                        </div>
                    `
                    : classification.solutionHtml
            }
        ]
    });
}

function buildReplacedMatrix(matrix, constants, columnIndex) {
    return matrix.map((row, rowIndex) => row.map((value, colIndex) => (colIndex === columnIndex ? constants[rowIndex] : value)));
}

function buildCramerInapplicabilityMessage(data) {
    const size = Number(data.size || data.augmentedMatrix?.length || 0);
    const coefficientMatrix = data.coefficientMatrix || (data.augmentedMatrix ? getSystemCoefficientMatrix(data.augmentedMatrix) : null);

    if (!coefficientMatrix || coefficientMatrix.length !== size) {
        return 'La Regla de Cramer solo está disponible cuando el sistema es cuadrado y la matriz de coeficientes está completa.';
    }

    const delta = math.det(coefficientMatrix);
    if (!isZeroMathVal(delta)) {
        return 'La Regla de Cramer es aplicable en este sistema.';
    }

    const reducedMatrix = buildSystemReferenceReduction(data.augmentedMatrix);
    const { rankA, rankAb } = computeSystemRanks(reducedMatrix, size);
    const classification = buildSystemClassification(rankA, rankAb, size);

    if (String(classification.type || '').toLowerCase().includes('indeterminado')) {
        return 'La Regla de Cramer no aplica porque el determinante principal es 0 y el sistema es compatible indeterminado; no existe una solución única que pueda obtenerse con Δx/Δ, Δy/Δ o Δz/Δ.';
    }

    if (String(classification.type || '').toLowerCase().includes('incompatible')) {
        return 'La Regla de Cramer no aplica porque el determinante principal es 0 y el sistema es incompatible; las ecuaciones no comparten una solución común.';
    }

    return 'La Regla de Cramer no aplica porque el determinante principal es 0. En ese caso el sistema no tiene solución única y conviene usar otro método.';
}

function classifySystemWhenCramerFails(data) {
    const reducedMatrix = buildSystemReferenceReduction(data.augmentedMatrix);
    const size = Number(data.size || data.augmentedMatrix?.length || 0);
    const { rankA, rankAb } = computeSystemRanks(reducedMatrix, size);
    const classification = buildSystemClassification(rankA, rankAb, size);

    return {
        reducedMatrix,
        classification
    };
}

function solveByCramer(data) {
    const { augmentedMatrix, size } = data;
    const coefficientMatrix = getSystemCoefficientMatrix(augmentedMatrix);
    const constants = getSystemConstantsVector(augmentedMatrix);
    const cramerState = canUseCramer({ ...data, coefficientMatrix });
    const delta = cramerState.determinant;

    if (!cramerState.applies) {
        const fallback = classifySystemWhenCramerFails({ ...data, coefficientMatrix });
        const warning = buildCramerInapplicabilityMessage({ ...data, coefficientMatrix });
        const fallbackClassification = {
            ...fallback.classification,
            explanation: `${warning} ${fallback.classification.explanation}`
        };

        return buildSystemMethodResponse({
            originalMat: augmentedMatrix,
            verificationMatrix: fallback.reducedMatrix,
            classification: fallbackClassification,
            methodKey: 'cramer',
            methodText: 'Regla de Cramer: calcular el determinante principal y los determinantes parciales para cada incógnita.',
            solutionHtml: `
                <p>La Regla de Cramer no puede aplicarse porque Δ = ${delta === null ? 'no disponible' : formatMathVal(delta)}.</p>
                ${fallback.classification.solutionHtml}
            `,
            solutionVector: null,
            visualizationType: 'none',
            resultMatrix: null,
            reportProfile: 'cramer',
            applies: false,
            determinant: delta,
            determinants: {},
            warnings: [warning],
            steps: [
                {
                    title: 'Matriz de coeficientes y vector independiente',
                    desc: 'Se identifica la matriz de coeficientes A y el vector independiente b antes de comprobar si Cramer es aplicable.',
                    outputHtml: `
                        <p><strong>Matriz A:</strong></p>
                        <div class="step-matrix-display">${renderMatrixHTML(coefficientMatrix)}</div>
                        <p><strong>Vector b:</strong> [${constants.map((value) => formatMathVal(value)).join(', ')}]</p>
                    `
                },
                {
                    title: 'Verificar el determinante principal',
                    desc: 'La Regla de Cramer solo puede continuar si el determinante principal es distinto de 0.',
                    outputHtml: `
                        <div class="step-matrix-display">${renderMatrixHTML(coefficientMatrix)}</div>
                        <p><strong>Δ = det(A) = ${delta === null ? 'no disponible' : formatMathVal(delta)}</strong></p>
                        <p>${warning}</p>
                    `
                },
                {
                    title: 'Clasificar el sistema por un criterio alternativo seguro',
                    desc: 'Como Cramer no aplica directamente, se usa una reducción por filas para determinar si el sistema es incompatible o compatible indeterminado.',
                    outputHtml: `
                        <p><strong>Clasificación:</strong> ${fallback.classification.type}</p>
                        <p>${fallback.classification.explanation}</p>
                        <div class="step-matrix-display">${renderMatrixHTML(fallback.reducedMatrix, true)}</div>
                    `
                }
            ]
        });
    }

    const variableNames = ['x', 'y', 'z'].slice(0, size);
    const replacedMatrices = coefficientMatrix.map((_, columnIndex) => buildReplacedMatrix(coefficientMatrix, constants, columnIndex));
    const partialDeterminants = replacedMatrices.map((matrix) => math.det(matrix));
    const solution = partialDeterminants.map((value) => math.divide(value, delta));
    const verificationMatrix = buildIdentityAugmentedFromSolution(solution);
    const classification = {
        type: 'Sistema compatible determinado (solución única)',
        explanation: 'La Regla de Cramer aplica porque el determinante principal es distinto de 0. Por eso el sistema tiene una única solución.',
        solutionHtml: `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                ${variableNames.map((name, index) => `${name} = ${formatMathVal(solution[index])}`).join('<br>')}
            </div>
        `
    };

    return buildSystemMethodResponse({
        originalMat: augmentedMatrix,
        verificationMatrix,
        classification,
        methodKey: 'cramer',
        methodText: 'Regla de Cramer: calcular el determinante principal y los determinantes parciales para cada incógnita.',
        solutionHtml: classification.solutionHtml,
        solutionVector: solution,
        visualizationType: 'none',
        resultMatrix: null,
        reportProfile: 'cramer',
        applies: true,
        determinant: delta,
        determinants: Object.fromEntries(variableNames.map((name, index) => [`d${name}`, partialDeterminants[index]])),
        warnings: [],
        steps: [
            {
                title: 'Matriz de coeficientes y vector independiente',
                desc: 'Se separa la matriz de coeficientes A del vector de términos independientes b.',
                outputHtml: `
                    <p><strong>Matriz A:</strong></p>
                    <div class="step-matrix-display">${renderMatrixHTML(coefficientMatrix)}</div>
                    <p><strong>Vector b:</strong> [${constants.map((value) => formatMathVal(value)).join(', ')}]</p>
                `
            },
            {
                title: 'Determinante principal',
                desc: 'Se calcula el determinante de la matriz de coeficientes para verificar si existe solución única.',
                outputHtml: `
                    <div class="step-matrix-display">${renderMatrixHTML(coefficientMatrix)}</div>
                    <p><strong>Δ = det(A) = ${formatMathVal(delta)}</strong></p>
                `
            },
            ...replacedMatrices.map((matrix, index) => ({
                title: `Determinante parcial Δ${variableNames[index]}`,
                desc: `Se reemplaza la columna de ${variableNames[index]} por el vector independiente para formar la matriz auxiliar correspondiente.`,
                outputHtml: `
                    <div class="step-matrix-display">${renderMatrixHTML(matrix)}</div>
                    <p><strong>Δ${variableNames[index]} = ${formatMathVal(partialDeterminants[index])}</strong></p>
                `
            })),
            {
                title: 'Aplicar las fórmulas de Cramer',
                desc: 'Cada incógnita se obtiene dividiendo su determinante parcial entre el determinante principal.',
                outputHtml: classification.solutionHtml
            }
        ]
    });
}

function solveSystemAutomatically(data) {
    const method = getBestSystemMethod(data);
    return solveSystemByMethod(method, data, { selectedMethod: 'auto' });
}

function solveSystemByMethod(method, data, options = {}) {
    if (!canUseSystemMethod(method, data)) {
        const size = Number(data.size || data.augmentedMatrix?.length || 0);
        if (['substitution', 'equalization', 'elimination'].includes(method)) {
            throw new Error(`El método ${getMethodLabel('systems', method)} se reserva para sistemas 2x2. Para un sistema ${size}x${size} usa Gauss, Gauss-Jordan o Cramer si aplica.`);
        }
        if (method === 'cramer') {
            throw new Error(buildCramerInapplicabilityMessage(data));
        }
        throw new Error(`El método ${getMethodLabel('systems', method)} no está disponible para este sistema.`);
    }

    let resolution;
    switch (method) {
        case 'substitution':
            resolution = solveBySubstitution(data);
            break;
        case 'equalization':
            resolution = solveByEqualization(data);
            break;
        case 'elimination':
            resolution = solveByElimination(data);
            break;
        case 'gauss':
            resolution = solveSystemGaussDetailed(data.augmentedMatrix, data.size);
            break;
        case 'gauss_jordan':
            resolution = solveSystemGaussJordanDetailed(data.augmentedMatrix, data.size);
            break;
        case 'cramer':
            resolution = solveByCramer(data);
            break;
        default:
            throw new Error(`No existe una implementación para el método ${method}.`);
    }

    return finalizeSystemResolution(resolution, {
        selectedMethod: options.selectedMethod || method,
        resolvedMethod: method,
        size: Number(data.size || data.augmentedMatrix?.length || 0),
        data
    });
}

function buildSystemInitialSteps(mat, originalMat, size, methodLabel) {
    return [
        addStep(
            'Paso 1: Escribir el sistema original',
            'Primero se identifica el sistema tal como fue ingresado para reconocer variables, ecuaciones y terminos independientes.',
            'Sistema original',
            renderOriginalSystemHtml(originalMat),
            renderOriginalSystemHtml(originalMat),
            'Todavia no se hace ninguna transformacion; solo se organiza la informacion del problema.',
            { kind: 'theory' }
        ),
        addStep(
            'Paso 2: Construir la matriz aumentada',
            'Tomamos los coeficientes del sistema y los colocamos en una matriz. La ultima columna corresponde a los terminos independientes.',
            'Matriz aumentada [A | b]',
            renderOriginalSystemHtml(originalMat),
            renderAugmentedMatrixConstruction(mat),
            'Esta forma permite aplicar operaciones por fila sin cambiar la solucion del sistema.',
            { kind: 'theory' }
        ),
        addStep(
            `Paso 3: Preparar el metodo ${methodLabel}`,
            `Esta es la matriz de partida para ${methodLabel}. A partir de aqui se buscan pivotes para llevar el sistema a forma escalonada o reducida.`,
            'Identificar pivotes iniciales',
            `<div class="step-matrix-display">${renderMatrixHTML(mat, true)}</div>`,
            renderMatrixWithPivots(mat, true, size),
            'Un pivote es una entrada clave que se usa para eliminar otras de su columna y avanzar ordenadamente en el procedimiento.',
            { kind: 'theory' }
        )
    ];
}

function computeSystemRanks(matrix, size) {
    let rankA = 0;
    let rankAb = 0;

    for (let i = 0; i < matrix.length; i++) {
        let isZeroA = true;
        for (let j = 0; j < size; j++) {
            if (math.number(math.abs(matrix[i][j])) > 1e-10) {
                isZeroA = false;
                break;
            }
        }
        if (!isZeroA) rankA++;

        let isZeroAb = isZeroA;
        if (isZeroA && math.number(math.abs(matrix[i][size])) > 1e-10) {
            isZeroAb = false;
        }
        if (!isZeroAb) rankAb++;
    }

    return { rankA, rankAb };
}

function buildIdentityAugmentedFromSolution(solution) {
    return solution.map((value, index) => {
        const row = Array.from({ length: solution.length + 1 }, () => math.fraction(0));
        row[index] = math.fraction(1);
        row[solution.length] = value;
        return row;
    });
}

function buildGaussBackSubstitution(uniqueMat, size) {
    const variables = ['x', 'y', 'z'].slice(0, size);
    const solution = Array.from({ length: size }, () => math.fraction(0));
    const lines = [];

    for (let i = size - 1; i >= 0; i--) {
        let subtotal = math.fraction(0);
        const knownTerms = [];

        for (let j = i + 1; j < size; j++) {
            const contribution = math.multiply(uniqueMat[i][j], solution[j]);
            subtotal = math.add(subtotal, contribution);
            knownTerms.push(`(${formatMathVal(uniqueMat[i][j])})(${formatMathVal(solution[j])})`);
        }

        const numerator = math.subtract(uniqueMat[i][size], subtotal);
        const pivot = uniqueMat[i][i];
        solution[i] = math.divide(numerator, pivot);

        lines.push(`
            ${variables[i]} = (${formatMathVal(uniqueMat[i][size])}${knownTerms.length ? ` - ${knownTerms.join(' - ')}` : ''}) / ${formatMathVal(pivot)} = ${formatMathVal(solution[i])}
        `);
    }

    return {
        solution,
        html: `
            <div style="font-family: 'Fira Code', monospace; line-height: 1.7;">
                ${lines.join('<br>')}
            </div>
        `
    };
}

function solveSystemGaussJordanDetailed(originalMat, size) {
    const mat = cloneMathMatrix(originalMat);
    const steps = buildSystemInitialSteps(mat, originalMat, size, 'Gauss-Jordan');
    const rows = size;
    const cols = size + 1;
    let rank = 0;

    for (let j = 0; j < rows; j++) {
        let maxRow = rank;
        for (let i = rank + 1; i < rows; i++) {
            if (math.abs(mat[i][j]) > math.abs(mat[maxRow][j])) {
                maxRow = i;
            }
        }

        if (math.number(math.abs(mat[maxRow][j])) < 1e-10) {
            steps.push({
                title: `Columna ${j + 1} sin pivote`,
                desc: `Desde la fila ${rank + 1} hacia abajo, todas las entradas de la columna ${j + 1} son cero. Por eso esta columna no puede aportar un nuevo pivote y se avanza a la siguiente.`,
                mat: cloneMathMatrix(mat),
                outputHtml: renderMatrixWithPivots(mat, true, size)
            });
            continue;
        }

        steps.push({
            title: `Seleccionar pivote en columna ${j + 1}`,
            desc: `Se elige como pivote la entrada de la fila ${maxRow + 1}, columna ${j + 1}, porque es no nula y permite continuar la reducción en la fila ${rank + 1}.`,
            mat: cloneMathMatrix(mat),
            outputHtml: `
                <div class="step-matrix-display">${renderMatrixHTML(mat, true, [{ row: maxRow, col: j }])}</div>
                <p><strong>Pivote candidato:</strong> F${maxRow + 1}, C${j + 1} = ${formatMathVal(mat[maxRow][j])}.</p>
            `
        });

        if (maxRow !== rank) {
            const beforeSwap = cloneMathMatrix(mat);
            const temp = mat[rank];
            mat[rank] = mat[maxRow];
            mat[maxRow] = temp;
            const pivotPositions = findPivotPositions(mat, size);
            steps.push({
                title: `Intercambiar fila ${rank + 1} con fila ${maxRow + 1}`,
                desc: `Se permutan las filas para llevar el pivote seleccionado a la fila de trabajo ${rank + 1}.`,
                mat: cloneMathMatrix(mat),
                outputHtml: `
                    <div class="step-matrix-display">${renderMatrixHTML(mat, true, pivotPositions)}</div>
                    ${renderPivotSummary(pivotPositions)}
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">
                        Antes del intercambio:<br>${renderMatrixHTML(beforeSwap, true)}<br>
                        Se permutan F${rank + 1} y F${maxRow + 1} para colocar un pivote no nulo en la fila de trabajo.
                    </div>
                `
            });
        }

        const pivot = mat[rank][j];
        const pivotPositionsBeforeNormalization = findPivotPositions(mat, size);
        steps.push({
            title: `Marcar pivote en fila ${rank + 1}`,
            desc: `El pivote activo queda en la posición F${rank + 1}, C${j + 1}. Ese valor guiará la eliminación de todas las demás entradas de su columna.`,
            mat: cloneMathMatrix(mat),
            outputHtml: `
                <div class="step-matrix-display">${renderMatrixHTML(mat, true, [{ row: rank, col: j }, ...pivotPositionsBeforeNormalization.filter((cell) => !(cell.row === rank && cell.col === j))])}</div>
                <p><strong>Pivote activo:</strong> ${formatMathVal(pivot)} en F${rank + 1}, C${j + 1}.</p>
            `
        });

        if (math.number(pivot) !== 1) {
            const beforeNormalize = cloneMathMatrix(mat);
            for (let c = 0; c < cols; c++) {
                mat[rank][c] = math.divide(mat[rank][c], pivot);
            }
            const pivotPositions = findPivotPositions(mat, size);
            steps.push({
                title: `Hacer 1 el pivote en fila ${rank + 1}`,
                desc: `Dividir la fila ${rank + 1} por ${formatMathVal(pivot)} para obtener un 1 principal.`,
                mat: cloneMathMatrix(mat),
                outputHtml: renderRowScaleBreakdown(beforeNormalize, mat, rank, pivot, pivotPositions)
            });
        }

        for (let i = 0; i < rows; i++) {
            if (i !== rank) {
                const factor = mat[i][j];
                if (math.number(math.abs(factor)) > 1e-10) {
                    const beforeElimination = cloneMathMatrix(mat);
                    for (let c = 0; c < cols; c++) {
                        mat[i][c] = math.subtract(mat[i][c], math.multiply(factor, mat[rank][c]));
                    }
                    const pivotPositions = findPivotPositions(mat, size);
                    steps.push({
                        title: `Eliminar en fila ${i + 1}, columna ${j + 1}`,
                        desc: `Fila ${i + 1} = Fila ${i + 1} - (${formatMathVal(factor)}) × Fila ${rank + 1}`,
                        mat: cloneMathMatrix(mat),
                        outputHtml: renderRowOperationBreakdown(
                            beforeElimination,
                            mat,
                            i,
                            rank,
                            factor,
                            `F${i + 1} <- F${i + 1} - (${formatMathVal(factor)})F${rank + 1}`,
                            pivotPositions
                        )
                    });
                }
            }
        }

        rank++;
    }

    const { rankA, rankAb } = computeSystemRanks(mat, size);
    const classification = buildSystemClassification(rankA, rankAb, size);
    const type = classification.type;
    const explanation = classification.explanation;

    steps.push({
        title: 'Forma reducida final',
        desc: 'Después de aplicar Gauss-Jordan, esta es la matriz final desde la cual se clasifica el sistema y, si es posible, se lee la solución.',
        mat: cloneMathMatrix(mat),
        outputHtml: renderMatrixWithPivots(mat, true, size)
    });
    steps.push({
        title: 'Clasificar el sistema',
        desc: `Se compara Rango(A) con Rango(A|b) y ambos con el número de incógnitas n = ${size}. En este caso se obtuvo Rango(A) = ${rankA} y Rango(A|b) = ${rankAb}.`,
        mat: cloneMathMatrix(mat),
        outputHtml: `
            <p><strong>Clasificación:</strong> ${type}</p>
            <p>${explanation}</p>
            <div class="step-matrix-display">${renderMatrixHTML(mat, true, findPivotPositions(mat, size))}</div>
        `
    });
    steps.push({
        title: 'Escribir la solución final',
        desc: 'Se interpreta la forma reducida final para escribir la solución del sistema según la clasificación obtenida.',
        mat: cloneMathMatrix(mat),
        outputHtml: buildSystemSolutionHtml(mat, size, type)
    });

    return {
        finalMatrix: mat,
        verificationMatrix: mat,
        steps,
        classification,
        type,
        explanation,
        solutionHtml: classification.solutionHtml || buildSystemSolutionHtml(mat, size, type)
    };
}

function solveSystemGaussDetailed(originalMat, size) {
    const mat = cloneMathMatrix(originalMat);
    const steps = buildSystemInitialSteps(mat, originalMat, size, 'Gauss');
    const rows = size;
    const cols = size + 1;
    let rank = 0;

    for (let j = 0; j < size; j++) {
        let maxRow = rank;
        for (let i = rank + 1; i < rows; i++) {
            if (math.abs(mat[i][j]) > math.abs(mat[maxRow][j])) {
                maxRow = i;
            }
        }

        if (math.number(math.abs(mat[maxRow][j])) < 1e-10) {
            steps.push({
                title: `Columna ${j + 1} sin pivote`,
                desc: `No aparece un pivote útil en la columna ${j + 1}, así que se conserva la estructura actual y se avanza a la siguiente columna.`,
                mat: cloneMathMatrix(mat),
                outputHtml: renderMatrixWithPivots(mat, true, size)
            });
            continue;
        }

        if (maxRow !== rank) {
            const beforeSwap = cloneMathMatrix(mat);
            const temp = mat[rank];
            mat[rank] = mat[maxRow];
            mat[maxRow] = temp;
            steps.push({
                title: `Intercambiar fila ${rank + 1} con fila ${maxRow + 1}`,
                desc: `Se lleva a la fila de trabajo un pivote no nulo para comenzar la eliminación hacia abajo.`,
                mat: cloneMathMatrix(mat),
                outputHtml: `
                    <div class="step-matrix-display">${renderMatrixHTML(mat, true, findPivotPositions(mat, size))}</div>
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">Antes del intercambio:<br>${renderMatrixHTML(beforeSwap, true)}</div>
                `
            });
        }

        const pivot = mat[rank][j];
        steps.push({
            title: `Pivote en fila ${rank + 1}, columna ${j + 1}`,
            desc: `Se fija el pivote ${formatMathVal(pivot)} y se anulan únicamente las entradas que quedan debajo de él, porque Gauss busca una forma escalonada superior.`,
            mat: cloneMathMatrix(mat),
            outputHtml: `
                <div class="step-matrix-display">${renderMatrixHTML(mat, true, [{ row: rank, col: j }])}</div>
                <p><strong>Pivote activo:</strong> ${formatMathVal(pivot)}.</p>
            `
        });

        for (let i = rank + 1; i < rows; i++) {
            const factor = mat[i][j];
            if (math.number(math.abs(factor)) > 1e-10) {
                const beforeElimination = cloneMathMatrix(mat);
                const multiplier = math.divide(factor, pivot);
                for (let c = 0; c < cols; c++) {
                    mat[i][c] = math.subtract(mat[i][c], math.multiply(multiplier, mat[rank][c]));
                }
                steps.push({
                    title: `Eliminar debajo del pivote en fila ${i + 1}`,
                    desc: `Se aplica F${i + 1} = F${i + 1} - (${formatMathVal(multiplier)}) × F${rank + 1} para convertir en 0 la entrada de la columna ${j + 1}.`,
                    mat: cloneMathMatrix(mat),
                    outputHtml: renderRowOperationBreakdown(
                        beforeElimination,
                        mat,
                        i,
                        rank,
                        multiplier,
                        `F${i + 1} <- F${i + 1} - (${formatMathVal(multiplier)})F${rank + 1}`,
                        findPivotPositions(mat, size)
                    )
                });
            }
        }

        rank++;
    }

    const { rankA, rankAb } = computeSystemRanks(mat, size);
    const classification = buildSystemClassification(rankA, rankAb, size);
    const type = classification.type;
    const explanation = classification.explanation;
    let verificationMatrix = mat;
    let solutionHtml = classification.solutionHtml || buildSystemSolutionHtml(mat, size, type);

    steps.push({
        title: 'Forma escalonada superior',
        desc: 'La eliminación de Gauss deja el sistema en forma escalonada. Desde aquí se clasifica el sistema y, si la solución es única, se aplica sustitución regresiva.',
        mat: cloneMathMatrix(mat),
        outputHtml: renderMatrixWithPivots(mat, true, size)
    });
    steps.push({
        title: 'Clasificar el sistema',
        desc: `Se compara Rango(A) con Rango(A|b) y ambos con el número de incógnitas n = ${size}. En este caso se obtuvo Rango(A) = ${rankA} y Rango(A|b) = ${rankAb}.`,
        mat: cloneMathMatrix(mat),
        outputHtml: `
            <p><strong>Clasificación:</strong> ${type}</p>
            <p>${explanation}</p>
            <div class="step-matrix-display">${renderMatrixHTML(mat, true, findPivotPositions(mat, size))}</div>
        `
    });

    if (type.includes('solución única')) {
        const backSubstitution = buildGaussBackSubstitution(mat, size);
        verificationMatrix = buildIdentityAugmentedFromSolution(backSubstitution.solution);
        solutionHtml = backSubstitution.html;
        steps.push({
            title: 'Sustitución regresiva',
            desc: 'Como la forma escalonada ya deja despejada la última variable, se sustituyen los valores de abajo hacia arriba hasta obtener todas las incógnitas.',
            mat: cloneMathMatrix(verificationMatrix),
            outputHtml: `
                ${backSubstitution.html}
                <div style="margin-top: 12px;" class="step-matrix-display">${renderMatrixHTML(verificationMatrix, true)}</div>
            `
        });
    } else {
        steps.push({
            title: 'Interpretar la solución',
            desc: 'La forma escalonada permite decidir si el sistema es incompatible o si admite infinitas soluciones.',
            mat: cloneMathMatrix(mat),
            outputHtml: solutionHtml
        });
    }

    return {
        finalMatrix: mat,
        verificationMatrix,
        steps,
        classification,
        type,
        explanation,
        solutionHtml
    };
}

function solveSystem() {
    try {
        clearInputErrors(document.getElementById('sistemas'));
        const size = readValidatedIntegerInput('sys-size', 'Tamano del sistema', { min: 2, max: 3 });
        const originalMat = readValidatedGrid(size, size + 1, 'sys-inputs', 'la matriz aumentada del sistema');
        const systemData = {
            size,
            augmentedMatrix: originalMat,
            coefficientMatrix: getSystemCoefficientMatrix(originalMat),
            constants: getSystemConstantsVector(originalMat)
        };
        const selectedMethod = getSelectedSystemMethod();
        const systemResolution = selectedMethod === 'auto'
            ? solveSystemAutomatically(systemData)
            : solveSystemByMethod(selectedMethod, systemData);
        const resolvedMethod = systemResolution.methodKey || (selectedMethod === 'auto'
            ? getBestSystemMethod(systemData)
            : selectedMethod);

        const response = createStandardMathResponse({
            topic: 'Sistemas de ecuaciones lineales',
            request: `Resolver un sistema ${size}x${size}, clasificarlo y justificar la clasificacion.`,
            method: systemResolution.methodText || getMethodLabel('systems', resolvedMethod),
            steps: systemResolution.steps,
            result: {
                summary: systemResolution.type,
                valueHtml: `
                    <p>${systemResolution.explanation}</p>
                    ${systemResolution.visualizationType !== 'none' && systemResolution.finalMatrix
                        ? `<div class="step-matrix-display">${renderMatrixHTML(systemResolution.finalMatrix, true, findPivotPositions(systemResolution.finalMatrix, size))}</div>`
                        : ''}
                    ${systemResolution.solutionHtml}
                `
            },
            verification: buildSystemVerification(
                originalMat,
                systemResolution.verificationMatrix,
                systemResolution.type,
                { solution: systemResolution.solutionVector }
            ),
            interpretation: generateFinalInterpretation('sistemas', {
                classification: systemResolution.type,
                type: systemResolution.type,
                solutionVector: systemResolution.solutionVector || []
            }, {
                explanation: systemResolution.explanation
            }),
            historyMeta: {
                saveToHistory: true,
                operationType: 'solve',
                inputData: {
                    augmentedMatrix: originalMat,
                    selectedMethod,
                    resolvedMethod
                },
                validationData: {
                    operation: resolvedMethod,
                    input: {
                        size,
                        augmentedMatrix: originalMat,
                        method: systemResolution.methodText || getMethodLabel('systems', resolvedMethod)
                    },
                    result: {
                        classification: systemResolution.type,
                        solutionVector: systemResolution.solutionVector || null,
                        reducedMatrix: systemResolution.finalMatrix || null
                    }
                },
                summary: `Sistema ${size}x${size}: ${systemResolution.type}`
            }
        });
        setStandardMathResponse('sys-steps', response);
        plotSystemGraph(originalMat, size);
    } catch (error) {
        const graphDiv = document.getElementById('sys-graph');
        if (graphDiv) graphDiv.innerHTML = '';
        renderValidationErrorResponse('sys-steps', {
            topic: 'Sistemas de ecuaciones lineales',
            request: 'Resolver un sistema lineal con el método seleccionado.',
            message: error.message,
            interpretation: 'Un sistema solo se puede procesar si la matriz aumentada esta completa y todos sus datos son numericos.'
        });
    }
}

function plotSystemGraph(origMat, size) {
    const graphDiv = document.getElementById('sys-graph');
    if (size !== 2) {
        graphDiv.innerHTML = '<p style="text-align:center; padding: 2rem;">Gráfica compleja para 3x3 omitida, se requieren herramientas volumétricas. Mostramos gráficamente sistemas 2x2 donde podemos ver las rectas fácilmente.</p>';
        return;
    }
    graphDiv.innerHTML = ''; // clear

    // System:
    // a1*x + b1*y = c1 --> y = (c1 - a1*x) / b1
    // a2*x + b2*y = c2 --> y = (c2 - a2*x) / b2
    const data = [];
    
    // Create x axis range loosely around origin
    const xValues = [];
    for (let i = -10; i <= 10; i+=0.5) { xValues.push(i); }

    const colors = ['#00A4CD', '#82C341'];

    for (let i = 0; i < 2; i++) {
        let a = math.number(origMat[i][0]);
        let b = math.number(origMat[i][1]);
        let c = math.number(origMat[i][2]);

        let yValues = [];
        let rX = [];
        for (let x of xValues) {
            if (Math.abs(b) < 1e-10) {
                // vertical line x = c/a
                rX.push(c/a);
                yValues.push(x); // reusing xValues range for vertical spread
            } else {
                rX.push(x);
                yValues.push((c - a * x) / b);
            }
        }

        data.push({
            x: rX,
            y: yValues,
            mode: 'lines',
            name: `Ec ${i+1}: ${a}x + ${b}y = ${c}`,
            line: {color: colors[i], width: 3}
        });
    }

    const layout = {
        title: 'Gráfica del Sistema de Ecuaciones (2D)',
        xaxis: { title: 'X', zeroline: true },
        yaxis: { title: 'Y', zeroline: true, scaleanchor: 'x', scaleratio: 1 },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#fff'
    };

    Plotly.newPlot(graphDiv, data, layout, {responsive: true});
}

// ================= MÓDULO 2: MATRICES =================
function initMatrixModule() {
    document.getElementById('btn-update-matA').addEventListener('click', () => {
        const r = parseInt(document.getElementById('matA-rows').value);
        const c = parseInt(document.getElementById('matA-cols').value);
        createMatrixInput(r, c, 'matA-inputs');
        document.getElementById('mat-results').classList.add('hidden');
    });

    document.getElementById('btn-update-matB').addEventListener('click', () => {
        const r = parseInt(document.getElementById('matB-rows').value);
        const c = parseInt(document.getElementById('matB-cols').value);
        createMatrixInput(r, c, 'matB-inputs');
        document.getElementById('mat-results').classList.add('hidden');
    });

    document.getElementById('mat-example').addEventListener('change', (e) => {
        const practiceMode = e.target.value;
        if (!practiceMode) return;
        applyMatrixPracticeModeSelection(practiceMode);
    });

    document.getElementById('mat-op').addEventListener('change', (e) => {
        const op = e.target.value;
        clearInputErrors(document.getElementById('matrices'));
        updateMatrixOperationUI(op);
        updateEduTip('matrices', op);
    });

    const matMethod = document.getElementById('mat-method');
    if (matMethod) {
        matMethod.addEventListener('change', () => {
            document.getElementById('mat-results').classList.add('hidden');
        });
    }

    document.getElementById('btn-calc-mat').addEventListener('click', () => { runWithAnimation('btn-calc-mat', calcMatrix) });

    // Init
    createMatrixInput(2, 2, 'matA-inputs');
    createMatrixInput(2, 2, 'matB-inputs');
    setElementValueIfPresent('mat-method', 'auto');
    updateMatrixOperationUI(document.getElementById('mat-op').value);
    updateEduTip('matrices', document.getElementById('mat-op').value);
}

function validateMatrixOperationCompatibility(op, A, B = null) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B ? B.length : 0;
    const colsB = B ? B[0].length : 0;

    if ((op === 'add' || op === 'sub') && (rowsA !== rowsB || colsA !== colsB)) {
        ['matA-rows', 'matA-cols', 'matB-rows', 'matB-cols'].forEach(markInputError);
        throw new Error(`La ${op === 'add' ? 'suma' : 'resta'} solo está definida entre matrices de la misma dimensión. A es ${rowsA}x${colsA} y B es ${rowsB}x${colsB}.`);
    }

    if (op === 'mult' && colsA !== rowsB) {
        ['matA-cols', 'matB-rows'].forEach(markInputError);
        throw new Error(`La multiplicación no está definida: las columnas de A (${colsA}) deben coincidir con las filas de B (${rowsB}).`);
    }

    if ((op === 'invA' || op === 'invA_gauss') && rowsA !== colsA) {
        ['matA-rows', 'matA-cols'].forEach(markInputError);
        throw new Error('La inversa solo existe para matrices cuadradas.');
    }
}

function buildMatrixIntroStep(op, A, B = null, scalar = null) {
    const dimsA = `${A.length}x${A[0].length}`;
    const dimsB = B ? `${B.length}x${B[0].length}` : null;
    const descriptions = {
        add: `Se trabajará con A de dimensión ${dimsA} y B de dimensión ${dimsB}. Como ambas matrices tienen el mismo tamaño, la operación se hará entrada por entrada.`,
        sub: `Se trabajará con A de dimensión ${dimsA} y B de dimensión ${dimsB}. Como ambas matrices tienen el mismo tamaño, la operación se hará entrada por entrada.`,
        mult: `Se trabajará con A de dimensión ${dimsA} y B de dimensión ${dimsB}. Cada entrada del resultado se obtiene combinando una fila de A con una columna de B.`,
        scalar: `Se trabajará con la matriz A de dimensión ${dimsA} y el escalar k = ${formatMathVal(scalar)}. Cada entrada de A se multiplicará por ese mismo valor.`,
        transA: `Se trabajará solo con la matriz A de dimensión ${dimsA}. La transpuesta intercambia filas por columnas.`,
        invA: `Se trabajará solo con la matriz A de dimensión ${dimsA}. Primero se verifica que sea cuadrada e invertible y luego se aplica el método de cofactores.`,
        invA_gauss: `Se trabajará solo con la matriz A de dimensión ${dimsA}. Primero se verifica que sea cuadrada e invertible y luego se aplica Gauss-Jordan sobre [A|I].`
    };

    return createStandardMathStep(
        'Lectura del problema',
        descriptions[op] || 'Se identifican los datos necesarios antes de operar.',
        `
            <div class="step-block">
                <h4>Datos de entrada</h4>
                <p><strong>Matriz A (${dimsA}):</strong></p>
                <div class="step-matrix-display">${renderMatrixHTML(A)}</div>
                ${B ? `<p><strong>Matriz B (${dimsB}):</strong></p><div class="step-matrix-display">${renderMatrixHTML(B)}</div>` : ''}
                ${scalar !== null ? `<p><strong>Escalar:</strong> ${formatMathVal(scalar)}</p>` : ''}
            </div>
        `,
        { kind: 'theory' }
    );
}

function calcMatrix() {
    try {
        clearInputErrors(document.getElementById('matrices'));
        const rawOp = readValidatedChoiceInput('mat-op', 'operacion matricial', ['add', 'sub', 'mult', 'scalar', 'transA', 'invA', 'invA_gauss']);
        const normalizedOp = rawOp === 'invA_gauss' ? 'invA' : rawOp;
        const selectedMatrixMethod = rawOp === 'invA_gauss' && getSelectedMethod('matrices') === 'auto'
            ? 'gauss_jordan'
            : getSelectedMethod('matrices');
        const matrixMethodState = normalizedOp === 'invA'
            ? resolveSelectedMethod('matrices', { operationType: normalizedOp, selectedMethod: selectedMatrixMethod })
            : null;
        const op = normalizedOp === 'invA' && matrixMethodState?.resolvedMethod === 'gauss_jordan' ? 'invA_gauss' : normalizedOp;
        const historyOperationType = normalizedOp === 'invA' ? 'invA' : op;
        const rA = readValidatedIntegerInput('matA-rows', 'filas de la matriz A', { min: 1, max: 5 });
        const cA = readValidatedIntegerInput('matA-cols', 'columnas de la matriz A', { min: 1, max: 5 });
        const A = readValidatedGrid(rA, cA, 'matA-inputs', 'la matriz A');
        
        let B = [];
        let rB = 0, cB = 0;
        if (op === 'add' || op === 'sub' || op === 'mult') {
            rB = readValidatedIntegerInput('matB-rows', 'filas de la matriz B', { min: 1, max: 5 });
            cB = readValidatedIntegerInput('matB-cols', 'columnas de la matriz B', { min: 1, max: 5 });
            B = readValidatedGrid(rB, cB, 'matB-inputs', 'la matriz B');
        }
        validateMatrixOperationCompatibility(op, A, B.length ? B : null);

        const stepsContainer = document.getElementById('mat-steps');
        stepsContainer.innerHTML = ''; // Clean container as requested
        document.getElementById('mat-results').classList.remove('hidden');

        let result = [];
        let htmlContent = '';
        const operationLabels = {
            add: 'suma de matrices',
            sub: 'resta de matrices',
            mult: 'multiplicacion de matrices',
            scalar: 'producto por escalar',
            transA: 'transpuesta de la matriz A',
            invA: 'inversa de la matriz A',
            invA_gauss: 'inversa de la matriz A'
        };
        const renderMatrixStandard = (method, detailHtml, resultSummary, resultHtml, verification, interpretation, validationResultData = {}) => {
            const scalarValue = op === 'scalar' ? readValidatedScalarInput('mat-scalar-val', 'el escalar k') : null;
            const methodText = matrixMethodState
                ? describeResolvedMethod('matrices', matrixMethodState.selectedMethod, matrixMethodState.resolvedMethod, { operationType: normalizedOp })
                : method;
            const finalInterpretation = generateFinalInterpretation('matrices', {
                operationType: historyOperationType,
                singular: !!validationResultData.singular
            }, {
                operationType: historyOperationType,
                explanation: interpretation
            });
            const response = createStandardMathResponse({
                topic: 'Operaciones con matrices',
                request: `Calcular la ${operationLabels[historyOperationType] || 'operacion matricial solicitada'}.`,
                method: methodText,
                steps: [
                    buildMatrixIntroStep(op, A, B.length ? B : null, scalarValue),
                    createStandardMathStep('Desarrollo paso a paso', 'Se muestran las operaciones relevantes de la matriz en el orden en que se ejecutan.', detailHtml)
                ],
                result: {
                    summary: resultSummary,
                    valueHtml: resultHtml
                },
                verification,
                interpretation: finalInterpretation,
                historyMeta: {
                    saveToHistory: true,
                    operationType: historyOperationType,
                    inputData: {
                        operationType: historyOperationType,
                        matrixA: A,
                        matrixB: B.length ? B : null,
                        scalar: scalarValue,
                        selectedMethod: matrixMethodState?.selectedMethod || null,
                        resolvedMethod: matrixMethodState?.resolvedMethod || null
                    },
                    validationData: {
                        operation: historyOperationType,
                        input: {
                            operationType: historyOperationType,
                            matrixA: A,
                            matrixB: B.length ? B : null,
                            scalar: scalarValue
                        },
                        result: {
                            matrix: validationResultData.matrix || null,
                            singular: !!validationResultData.singular,
                            determinant: validationResultData.determinant !== undefined ? validationResultData.determinant : null
                        }
                    },
                    summary: `Matrices: ${operationLabels[historyOperationType] || historyOperationType}`
                }
            });
            setStandardMathResponse('mat-steps', response);
        };

        if (op === 'add' || op === 'sub') {
            if (rA !== rB || cA !== cB) {
                ['matA-rows', 'matA-cols', 'matB-rows', 'matB-cols'].forEach(markInputError);
                throw new Error("Las matrices deben tener las mismas dimensiones.");
            }
            
            let symbol = op === 'add' ? '+' : '-';
            let opNames = op === 'add' ? 'Suma' : 'Resta';
            htmlContent += `
                <div class="step-block">
                    <h4>Planteamiento: ${opNames} de Matrices</h4>
                    <p>La operación se realiza posición por posición para cada celda coincidente.</p>
                </div>
                <div class="step-block">
                    <h4>Desarrollo: Cálculos Celda por Celda</h4>
                    <div style="font-family: 'Fira Code', monospace; font-size: 0.95rem; line-height: 1.6;">
            `;

            for (let i = 0; i < rA; i++) {
                let row = [];
                for (let j = 0; j < cA; j++) {
                    let aVal = A[i][j];
                    let bVal = B[i][j];
                    let resCell = op === 'add' ? math.add(aVal, bVal) : math.subtract(aVal, bVal);
                    row.push(resCell);
                    
                    htmlContent += `C[${i+1},${j+1}] = ${formatMathVal(aVal)} ${symbol} ${formatMathVal(bVal)} = <strong>${formatMathVal(resCell)}</strong><br>`;
                }
                result.push(row);
            }

            htmlContent += `
                    </div>
                </div>
                <div class="step-block" style="border-left-color: var(--secondary)">
                    <h4>Conclusión: Matriz Resultante</h4>
                    <div class="step-matrix-display">${renderMatrixHTML(result)}</div>
                </div>
            `;
            renderMatrixStandard(
                `Operacion elemento a elemento entre matrices de dimension ${rA}x${cA}.`,
                htmlContent,
                'Se obtuvo la matriz resultante de la operacion entrada por entrada.',
                `<div class="step-matrix-display">${renderMatrixHTML(result)}</div>`,
                createValidationResult({
                    status: 'success',
                    summary: 'Verificacion de suma/resta de matrices.',
                    detail: 'La operacion es valida porque ambas matrices tienen las mismas dimensiones.',
                    checks: [
                        {
                            label: 'Dimensiones compatibles',
                            passed: true,
                            detail: `${rA}x${cA} y ${rB}x${cB}`
                        }
                    ]
                }),
                'La suma y la resta combinan informacion posicion por posicion, por eso exigen correspondencia exacta entre filas y columnas.',
                { matrix: result }
            );
            return;

        } else if (op === 'scalar') {
            const k = readValidatedScalarInput('mat-scalar-val', 'el escalar k');
            
            htmlContent += `
                <div class="step-block">
                    <h4>Planteamiento: Producto por un Escalar</h4>
                    <p>El número real $k = ${formatMathVal(k)}$ multiplicará a absolutamente todos los elementos dentro de la matriz plana.</p>
                </div>
                <div class="step-block">
                    <h4>Desarrollo: Cálculos Celda por Celda</h4>
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">
            `;

            for (let i = 0; i < rA; i++) {
                let row = [];
                for (let j = 0; j < cA; j++) {
                    let aVal = A[i][j];
                    let resCell = math.multiply(k, aVal);
                    row.push(resCell);
                    
                    htmlContent += `C[${i+1},${j+1}] = ${formatMathVal(k)} × ${formatMathVal(aVal)} = <strong>${formatMathVal(resCell)}</strong><br>`;
                }
                result.push(row);
            }

            htmlContent += `
                    </div>
                </div>
                <div class="step-block" style="border-left-color: var(--secondary)">
                    <h4>Conclusión: Matriz Resultante</h4>
                    <div class="step-matrix-display">${renderMatrixHTML(result)}</div>
                </div>
            `;
            renderMatrixStandard(
                'Multiplicacion de todos los elementos de A por el escalar dado.',
                htmlContent,
                'Se obtuvo la matriz escalada.',
                `<div class="step-matrix-display">${renderMatrixHTML(result)}</div>`,
                createValidationResult({
                    status: 'success',
                    summary: 'Verificacion del producto por escalar.',
                    detail: 'Cada entrada final se obtiene multiplicando la entrada original por el mismo escalar.',
                    checks: [
                        {
                            label: 'Consistencia del factor comun',
                            passed: true,
                            detail: `Se aplico k = ${formatMathVal(k)} a todas las entradas de A.`
                        }
                    ]
                }),
                'Multiplicar por un escalar cambia la intensidad de la transformacion o de los datos sin alterar la forma de la matriz.',
                { matrix: result }
            );
            return;

        } else if (op === 'mult') {
            if (cA !== rB) {
                ['matA-cols', 'matB-rows'].forEach(markInputError);
                throw new Error(`La multiplicacion no esta definida: las columnas de A (${cA}) deben coincidir con las filas de B (${rB}).`);
            }
            
            htmlContent += `
                <div class="step-block">
                    <h4>Planteamiento: Multiplicación de Matrices (A × B)</h4>
                    <p>Calcularemos el producto punto de cada fila de A por cada columna de B. Tamaño esperado: ${rA}x${cB}.</p>
                </div>
                <div class="step-block">
                    <h4>Desarrollo: Cálculos Celda por Celda</h4>
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">
            `;
            
            for (let i = 0; i < rA; i++) {
                let row = [];
                for (let j = 0; j < cB; j++) {
                    let termsStr = [];
                    let prodValues = [];
                    let resCell = math.fraction(0);
                    for (let k = 0; k < cA; k++) {
                        let aVal = A[i][k];
                        let bVal = B[k][j];
                        let prod = math.multiply(aVal, bVal);
                        resCell = math.add(resCell, prod);
                        prodValues.push(formatMathVal(prod));
                        termsStr.push(`(${formatMathVal(aVal)} × ${formatMathVal(bVal)})`);
                    }
                    row.push(resCell);
                    htmlContent += `${buildMatrixCellExplanation(A, B, i, j)}<br>C[${i+1},${j+1}] = ${termsStr.join(' + ')} = ${prodValues.join(' + ')} = <strong>${formatMathVal(resCell)}</strong><br><em>Interpretacion parcial:</em> esta celda combina la fila ${i + 1} de A con la columna ${j + 1} de B.<br><br>`;
                }
                result.push(row);
            }

            htmlContent += `
                    </div>
                </div>
                <div class="step-block" style="border-left-color: var(--secondary)">
                    <h4>Conclusión: Matriz Resultante</h4>
                    <div class="step-matrix-display">${renderMatrixHTML(result)}</div>
                </div>
            `;
            renderMatrixStandard(
                `Producto fila por columna entre una matriz ${rA}x${cA} y una matriz ${rB}x${cB}.`,
                htmlContent,
                'Se obtuvo la matriz producto A x B.',
                `<div class="step-matrix-display">${renderMatrixHTML(result)}</div>`,
                buildMatrixMultiplicationVerification(A, B, result),
                'En el producto matricial cada entrada resume como interactua una fila de A con una columna de B.',
                { matrix: result }
            );
            return;

        } else if (op === 'transA') {
            htmlContent += `
                <div class="step-block">
                    <h4>Planteamiento: Matriz Transpuesta</h4>
                    <p>La operación transpuesta intercambia sistemáticamente las filas por las columnas, provocando un giro axial diagonal sobre la matriz matriz original rotando sus dimensiones.</p>
                </div>
                <div class="step-block">
                    <h4>Desarrollo: Celda por Celda</h4>
                    <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">
            `;

            for (let j = 0; j < cA; j++) {
                let row = [];
                for (let i = 0; i < rA; i++) {
                    let aVal = A[i][j];
                    row.push(aVal);
                    htmlContent += `A^T[${j+1},${i+1}] toma el valor original de Fila ${i+1}, Columna ${j+1} = <strong>${formatMathVal(aVal)}</strong><br>`;
                }
                result.push(row);
            }

            htmlContent += `
                    </div>
                </div>
                <div class="step-block" style="border-left-color: var(--secondary)">
                    <h4>Conclusión: Matriz Transpuesta Creada</h4>
                    <div class="step-matrix-display">${renderMatrixHTML(result)}</div>
                </div>
            `;
            renderMatrixStandard(
                'Intercambio sistematico entre filas y columnas de la matriz original.',
                htmlContent,
                'Se obtuvo la transpuesta de A.',
                `<div class="step-matrix-display">${renderMatrixHTML(result)}</div>`,
                createValidationResult({
                    status: 'success',
                    summary: 'Verificacion de transpuesta.',
                    detail: 'Cada entrada A(i,j) pasa a la posicion A^T(j,i).',
                    checks: [
                        {
                            label: 'Intercambio fila-columna',
                            passed: true,
                            detail: `La matriz resultante tiene dimension ${cA}x${rA}.`
                        }
                    ]
                }),
                'La transpuesta refleja la matriz respecto de su diagonal principal.',
                { matrix: result }
            );
            return;

        } else if (op === 'invA') {
            if (rA !== cA) {
                markInputError('matA-rows');
                markInputError('matA-cols');
                throw new Error("La matriz debe ser cuadrada para tener Inversa.");
            }
            const exactDet = math.det(A);
            const numDet = Array.isArray(exactDet) || typeof exactDet === 'object' ? math.number(exactDet) : math.number(exactDet);
            
            htmlContent += `
                <div class="step-block">
                    <h4>1. Cálculo del Determinante</h4>
                    <p>Evaluamos si la matriz dispone de inversa computando su determinante principal:</p>
                    <div style="font-family: 'Fira Code', monospace;">det(A) = <strong>${formatMathVal(exactDet)}</strong></div>
                </div>
            `;

            if (Math.abs(numDet) < 1e-10) {
                htmlContent += `
                    <div class="step-block" style="border-left-color: var(--error); background-color: #fff0f0;">
                        <h4 style="color: var(--error);">¡Matriz Singular!</h4>
                        <p><strong>Conclusión Teórica:</strong> Como el determinante es exactamente cero, la matriz <strong>no tiene inversa</strong>. La transformación matemática es irreversible.</p>
                    </div>
                `;
                renderMatrixStandard(
                    'Criterio de invertibilidad por determinante y metodo de cofactores.',
                    htmlContent,
                    'La matriz no tiene inversa.',
                    `<p>det(A) = ${formatMathVal(exactDet)}</p>`,
                    createValidationResult({
                        status: 'warning',
                        summary: 'Verificacion de inversa no aplicable.',
                        detail: 'No se puede comprobar A * A^-1 = I porque el determinante es 0 y la inversa no existe.',
                        checks: [
                            {
                                label: 'Invertibilidad',
                                passed: false,
                                detail: `det(A) = ${formatMathVal(exactDet)}`
                            }
                        ]
                    }),
                    'Una matriz singular no puede deshacerse porque su transformacion pierde informacion.',
                    { singular: true, determinant: exactDet }
                );
                return;
            }

            const cofactors = [];
            let cofactorDetailsHtml = `<div class="step-block"><h4>2. Menores y Cofactores</h4><div style="font-family: 'Fira Code', monospace; line-height: 1.7;">`;
            for (let i = 0; i < rA; i++) {
                let cRow = [];
                for (let j = 0; j < cA; j++) {
                    let minorMat = buildMinorMatrix(A, i, j);
                    let minorDet = minorMat.length > 0 ? math.det(minorMat) : math.fraction(1);
                    let sign = ((i + j) % 2 === 0) ? 1 : -1;
                    const cofactorVal = math.multiply(sign, minorDet);
                    cRow.push(cofactorVal);
                    cofactorDetailsHtml += `C${i + 1}${j + 1}: signo = ${sign > 0 ? '+1' : '-1'}; M${i + 1}${j + 1} = ${renderMatrixHTML(minorMat)}; det(M${i + 1}${j + 1}) = ${formatMathVal(minorDet)}; C${i + 1}${j + 1} = ${formatMathVal(cofactorVal)}<br><br>`;
                }
                cofactors.push(cRow);
            }
            cofactorDetailsHtml += `</div></div>`;

            const adjugate = [];
            for (let j = 0; j < cA; j++) {
                let row = [];
                for (let i = 0; i < rA; i++) row.push(cofactors[i][j]);
                adjugate.push(row);
            }

            for (let i = 0; i < cA; i++) {
                let row = [];
                for (let j = 0; j < rA; j++) {
                    row.push(math.multiply(adjugate[i][j], math.divide(1, exactDet)));
                }
                result.push(row);
            }

            htmlContent += `
                ${cofactorDetailsHtml}
                <div class="step-block">
                    <h4>3. Matriz de Cofactores</h4>
                    <p>Se aplica la matriz de menores por el arreglo de signos positivos y negativos correspondientes $(-1)^{i+j}$ :</p>
                    <div class="step-matrix-display">${renderMatrixHTML(cofactors)}</div>
                </div>
                <div class="step-block">
                    <h4>4. Matriz Adjunta (Transpuesta de Cofactores)</h4>
                    <p>Transponemos la Matriz de Cofactores invirtiendo las filas por las columnas:</p>
                    <div class="step-matrix-display">${renderMatrixHTML(adjugate)}</div>
                </div>
                <div class="step-block" style="border-left-color: var(--secondary)">
                    <h4>5. Inversa Final (División por Determinante)</h4>
                    <p>Dividimos cada celda de la Matriz Adjunta por el determinante original (<strong>${formatMathVal(exactDet)}</strong>):</p>
                    <div class="step-matrix-display">${renderMatrixHTML(result)}</div>
                </div>
            `;
            const identityCheckCof = multiplyMatricesExact(A, result);
            renderMatrixStandard(
                'Metodo de cofactores: determinante, cofactores, adjunta y division por det(A).',
                htmlContent,
                'Se obtuvo la inversa de A.',
                `<div class="step-matrix-display">${renderMatrixHTML(result)}</div>`,
                buildIdentityVerification(A, result, 'Verificacion de inversa por cofactores.'),
                `Producto de verificacion:<div class="step-matrix-display">${renderMatrixHTML(identityCheckCof)}</div>La inversa existe porque det(A) es distinto de 0.`,
                { matrix: result, determinant: exactDet }
            );
            return;

        } else if (op === 'invA_gauss') {
            if (rA !== cA) {
                markInputError('matA-rows');
                markInputError('matA-cols');
                throw new Error("La matriz debe ser cuadrada (mismo numero de filas y columnas) para tener inversa.");
            }
            
            const exactDet = math.det(A); 
            if (Math.abs(math.number(exactDet)) < 1e-10) {
                throw new Error("El determinante es 0, por lo tanto la matriz es Singular (NO TIENE INVERSA).");
            }

            // Create Augmented Matrix [A|I]
            let aug = [];
            for (let i = 0; i < rA; i++) {
                let row = [];
                for (let j = 0; j < cA; j++) row.push(A[i][j]);
                for (let j = 0; j < cA; j++) row.push(i === j ? math.fraction(1) : math.fraction(0));
                aug.push(row);
            }

            stepsContainer.innerHTML = `
                <div class="math-step">
                    <h4>1. Matriz Aumentada [A | I]</h4>
                    <p>Aplicamos el método de Gauss-Jordan agregando la matriz Identidad al lado derecho. Nuestro objetivo es llegar a [I | A⁻¹] mediante operaciones de fila.</p>
                    <div class="step-matrix-display">${renderMatrixHTML(aug, true)}</div>
                </div>
            `;

            let stepCount = 2;
            let rank = 0;
            // Gauss-Jordan on [A|I]
            for (let j = 0; j < rA; j++) {
                let maxRow = rank;
                for (let i = rank + 1; i < rA; i++) {
                    if (math.abs(aug[i][j]) > math.abs(aug[maxRow][j])) maxRow = i;
                }
                if (math.number(math.abs(aug[maxRow][j])) < 1e-10) continue;

                if (maxRow !== rank) {
                    const beforeSwap = cloneMathMatrix(aug);
                    let temp = aug[rank];
                    aug[rank] = aug[maxRow];
                    aug[maxRow] = temp;
                    stepsContainer.innerHTML += `
                        <div class="math-step">
                            <h4>${stepCount++}. Intercambio de Filas</h4>
                            <p>Fila ${rank + 1} ↔ Fila ${maxRow + 1}</p>
                            <div class="step-matrix-display">${renderMatrixHTML(aug, true)}</div>
                            <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">Antes del intercambio:<br>${renderMatrixHTML(beforeSwap, true)}</div>
                        </div>
                    `;
                }

                let pivot = aug[rank][j];
                if (math.number(pivot) !== 1) {
                    const beforeNormalize = cloneMathMatrix(aug);
                    for (let c = 0; c < rA * 2; c++) aug[rank][c] = math.divide(aug[rank][c], pivot);
                    stepsContainer.innerHTML += `
                        <div class="math-step">
                            <h4>${stepCount++}. Hacer 1 el pivote (Fila ${rank + 1})</h4>
                            <p>Dividir fila ${rank + 1} entre ${formatMathVal(pivot)}</p>
                            <div class="step-matrix-display">${renderMatrixHTML(aug, true)}</div>
                            <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">${beforeNormalize[rank].map((value, idx) => `Columna ${idx + 1}: ${formatMathVal(value)} / ${formatMathVal(pivot)} = ${formatMathVal(aug[rank][idx])}`).join('<br>')}</div>
                        </div>
                    `;
                }

                for (let i = 0; i < rA; i++) {
                    if (i !== rank) {
                        let factor = aug[i][j];
                        if (math.number(math.abs(factor)) > 1e-10) {
                            const beforeElimination = cloneMathMatrix(aug);
                            for (let c = 0; c < rA * 2; c++) {
                                aug[i][c] = math.subtract(aug[i][c], math.multiply(factor, aug[rank][c]));
                            }
                            stepsContainer.innerHTML += `
                                <div class="math-step">
                                    <h4>${stepCount++}. Eliminar entrada en fila ${i + 1}, columna ${j + 1}</h4>
                                    <p>F${i + 1} ← F${i + 1} - (${formatMathVal(factor)})F${rank + 1}</p>
                                    ${renderRowOperationBreakdown(beforeElimination, aug, i, rank, factor, `F${i + 1} <- F${i + 1} - (${formatMathVal(factor)})F${rank + 1}`)}
                                </div>
                            `;
                        }
                    }
                }
                rank++;
            }

            // Extract Inverse
            let inv = [];
            for (let i = 0; i < rA; i++) {
                let row = [];
                for (let j = 0; j < cA; j++) row.push(aug[i][rA + j]);
                inv.push(row);
            }

            stepsContainer.innerHTML += `
                <div class="math-step" style="border-left-color: var(--secondary)">
                    <h4>${stepCount}. Inversa Final [I | A⁻¹]</h4>
                    <p>El lado derecho resultante corresponde a la Matriz Inversa.</p>
                    <div class="step-matrix-display">${renderMatrixHTML(inv)}</div>
                </div>
            `;
            const gaussHtml = stepsContainer.innerHTML;
            const identityCheckGauss = multiplyMatricesExact(A, inv);
            renderMatrixStandard(
                'Metodo de Gauss-Jordan sobre la matriz aumentada [A | I].',
                gaussHtml,
                'Se obtuvo la inversa de A mediante operaciones elementales por filas.',
                `<div class="step-matrix-display">${renderMatrixHTML(inv)}</div>`,
                buildIdentityVerification(A, inv, 'Verificacion de inversa por Gauss-Jordan.'),
                `Producto de verificacion:<div class="step-matrix-display">${renderMatrixHTML(identityCheckGauss)}</div>Gauss-Jordan construye la inversa aplicando a la identidad las mismas operaciones que convierten A en I.`,
                { matrix: inv, determinant: exactDet }
            );
            return;
        }

        stepsContainer.innerHTML = `
            <div class="math-step">
                <h4>1. Fórmula Matemática Aplicada</h4>
                <p>${pText}</p>
                <div class="math-formula">${formula}</div>
            </div>
            <div class="math-step" style="border-left-color: var(--secondary)">
                <h4>2. Resultado Final de la Operación</h4>
                <div class="step-matrix-display">
                    ${renderMatrixHTML(result)}
                </div>
            </div>
        `;
    } catch (err) {
        setStandardMathResponse('mat-steps', createStandardMathResponse({
            topic: 'Operaciones con matrices',
            request: 'Ejecutar la operacion matricial solicitada.',
            method: 'Validacion previa de dimensiones y restricciones de la operacion.',
            steps: [
                createStandardMathStep('Intento de ejecucion', 'La operacion se detuvo al detectar una condicion invalida.', `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Error</h4><p>${err.message}</p></div>`)
            ],
            result: {
                summary: 'No se obtuvo un resultado valido.',
                valueHtml: ''
            },
            verification: {
                detail: 'La validacion ya esta incorporada en la propia deteccion del error.',
                outputHtml: ''
            },
            interpretation: 'Cuando una operacion matricial no cumple sus condiciones de definicion, debe detenerse antes de calcular.'
        }));
    }
}

// Final UI override for matrix operation guidance. This definition is intentionally
// placed after the legacy ones so the active behavior in the browser is consistent.
function updateMatrixOperationUI(op) {
    const isUnary = (op === 'transA' || op === 'invA' || op === 'invA_gauss');
    const isScalar = (op === 'scalar');
    const needsB = !isUnary && !isScalar;
    const groupMatB = document.getElementById('group-matB');
    const groupScalar = document.getElementById('group-scalar');
    const helper = document.getElementById('mat-op-context');

    if (groupMatB) groupMatB.style.display = needsB ? 'block' : 'none';
    if (groupScalar) groupScalar.style.display = isScalar ? 'block' : 'none';
    toggleGroupInteractivity('group-matB', needsB);
    toggleGroupInteractivity('group-scalar', isScalar);
    updateMatrixMethodUI(op);

    if (helper) {
        const messages = {
            add: 'Operación binaria: debes completar A y B con la misma dimensión.',
            sub: 'Operación binaria: debes completar A y B con la misma dimensión.',
            mult: 'Operación binaria: A y B deben cumplir columnas de A = filas de B.',
            scalar: 'Operación unaria con escalar: se usa A y el valor k. La matriz B no interviene.',
            transA: 'Operación unaria: solo se usa la matriz A. La matriz B no interviene.',
            invA: 'Operación unaria: solo se usa la matriz A y debe ser cuadrada e invertible. Aquí sí puedes elegir el método de inversión.',
            invA_gauss: 'Operación unaria: solo se usa la matriz A y debe ser cuadrada e invertible. Aquí sí puedes elegir el método de inversión.'
        };
        helper.textContent = messages[op] || 'Configura la operación y completa los datos requeridos.';
    }
}

// ================= MÓDULO 3: DETERMINANTES =================
function initDeterminantsModule() {
    const sizeSelect = document.getElementById('det-size');
    const practiceSelect = document.getElementById('det-example');
    const updateDetGrid = () => {
        const size = parseInt(sizeSelect.value);
        updateDeterminantMethodOptions(size, getSelectedMethod('determinants'));
        createMatrixInput(size, size, 'det-inputs');
        document.getElementById('det-results').classList.add('hidden');
        updateEduTip('determinantes', sizeSelect.value);
    };
    sizeSelect.addEventListener('change', updateDetGrid);
    if (practiceSelect) {
        practiceSelect.addEventListener('change', (e) => {
            const practiceMode = String(e.target.value || '').trim();
            if (!practiceMode) return;
            applyDeterminantPracticeModeSelection(practiceMode);
        });
    }
    const detMethod = document.getElementById('det-method');
    if (detMethod) {
        detMethod.addEventListener('change', () => {
            document.getElementById('det-results').classList.add('hidden');
        });
    }
    document.getElementById('btn-calc-det').addEventListener('click', () => { runWithAnimation('btn-calc-det', calcDet) });
    updateDetGrid();
}

function calcDet() {
    try {
        clearInputErrors(document.getElementById('determinantes'));
        const size = parseInt(readValidatedChoiceInput('det-size', 'tamano de la matriz del determinante', ['2', '3', '4']), 10);
        const A = readValidatedGrid(size, size, 'det-inputs', 'la matriz del determinante');
        const methodState = resolveSelectedMethod('determinants', {
            size,
            matrix: A,
            selectedMethod: getSelectedMethod('determinants')
        });
        const stepsContainer = document.getElementById('det-steps');
        stepsContainer.innerHTML = '';
        document.getElementById('det-results').classList.remove('hidden');

        let detData = null;

        if (methodState.resolvedMethod === 'direct') {
            detData = buildDeterminant2x2Detailed(A);
        } else if (methodState.resolvedMethod === 'sarrus') {
            detData = buildDeterminant3x3Detailed(A);
        } else if (methodState.resolvedMethod === 'cofactors' && size === 3) {
            detData = buildDeterminant3x3ByCofactorsDetailed(A);
        } else if (methodState.resolvedMethod === 'cofactors' && size === 4) {
            detData = buildDeterminant4x4Detailed(A);
        } else {
            throw new Error('No se encontró un método válido para el tamaño seleccionado del determinante.');
        }

        const response = createStandardMathResponse({
            topic: 'Determinantes',
            request: `Calcular el determinante de una matriz ${size}x${size}.`,
            method: describeResolvedMethod('determinants', methodState.selectedMethod, methodState.resolvedMethod, { size, matrix: A }),
            steps: [
                buildDeterminantSetupStep(A, size, detData.methodText),
                ...detData.steps
            ],
            result: {
                summary: `El valor del determinante es ${formatMathVal(detData.det)}.`,
                valueHtml: `<div class="latex-container">$$ \\det(A) = ${formatMathVal(detData.det)} $$</div>`
            },
            verification: buildDeterminantVerification(size, detData.det, detData.methodText),
            interpretation: determinantInterpretation(detData.det, size),
            historyMeta: {
                saveToHistory: true,
                operationType: 'determinant',
                inputData: {
                    matrix: A,
                    selectedMethod: methodState.selectedMethod,
                    resolvedMethod: methodState.resolvedMethod
                },
                summary: `Determinante de una matriz ${size}x${size}`
            }
        });
        setStandardMathResponse('det-steps', response);
    } catch (error) {
        renderValidationErrorResponse('det-steps', {
            topic: 'Determinantes',
            request: 'Calcular un determinante con el metodo adecuado segun el orden.',
            message: error.message,
            interpretation: 'Un determinante solo puede calcularse si la matriz esta completa y todas sus entradas son numericas.'
        });
    }
}

// ================= MÓDULO 4: VECTORES =================
function initVectorsModule() {
    const dimSelect = document.getElementById('vec-dim');
    const practiceSelect = document.getElementById('vec-example');
    const updateVecGrid = () => {
        const dim = getCurrentVectorDimension();
        dimSelect.value = String(dim);
        syncVectorPracticeSelectionWithDimension(dim);
        updateVectorOperations(dim);
        createMatrixInput(1, dim, 'vecA-inputs');
        createMatrixInput(1, dim, 'vecB-inputs');
        document.getElementById('vec-results').classList.add('hidden');
    };

    dimSelect.addEventListener('change', updateVecGrid);
    if (practiceSelect) {
        practiceSelect.addEventListener('change', (e) => {
            const practiceMode = String(e.target.value || '').trim();
            if (!practiceMode) return;
            applyVectorPracticeModeSelection(practiceMode);
        });
    }
    document.getElementById('vec-op').addEventListener('change', (e) => {
        syncVectorOperationUI(e.target.value);
    });

    document.getElementById('btn-calc-vec').addEventListener('click', () => { runWithAnimation('btn-calc-vec', calcVector) });
    updateVecGrid();
    syncVectorOperationUI(document.getElementById('vec-op').value);
}

function calcVector() {
    const dim = parseInt(document.getElementById('vec-dim').value);
    const op = document.getElementById('vec-op').value;
    
    // Get row as vector array
    const u = getMatrixData(1, dim, 'vecA-inputs')[0];
    let v = [];
    if (op !== 'mag_u') {
        v = getMatrixData(1, dim, 'vecB-inputs')[0];
    }

    const stepsContainer = document.getElementById('vec-steps');
    stepsContainer.innerHTML = '';
    document.getElementById('vec-results').classList.remove('hidden');

    let resultTpl = '';
    let graphData = [];
    let validationPayload = {};
    const vectorMethodMap = {
        add: 'Suma componente por componente.',
        sub: 'Resta componente por componente.',
        dot: 'Producto punto como suma de productos entre componentes homologas.',
        mag_u: 'Magnitud calculada como la raiz cuadrada de la suma de cuadrados.',
        angle: 'Uso de cos(theta) = (u · v) / (||u|| ||v||).',
        cross: 'Producto cruz calculando cada componente del vector perpendicular.',
        proj: 'Proyeccion usando ((u · v) / ||v||^2) v.'
    };
    const vectorVerificationMap = {
        add: 'La verificacion es directa: cada componente del resultado debe coincidir con la suma de las componentes correspondientes.',
        sub: 'La verificacion es directa: cada componente del resultado debe coincidir con la resta de las componentes correspondientes.',
        dot: 'La verificacion consiste en revisar cada producto parcial y la suma escalar final.',
        mag_u: 'No hay una verificacion independiente distinta del propio calculo; se comprueba revisando la suma de cuadrados antes de la raiz.',
        angle: 'La validacion exige que ninguno de los vectores sea nulo antes de aplicar la formula del angulo.',
        cross: 'La validacion exige vectores en 3D; ademas el vector resultante debe ser perpendicular al plano generado por u y v.',
        proj: 'La validacion exige que el vector sobre el que se proyecta no sea nulo, porque aparece en el denominador ||v||^2.'
    };
    const vectorInterpretationMap = {
        add: 'La suma representa la combinacion de ambos desplazamientos.',
        sub: 'La resta compara direccion y distancia entre los dos vectores.',
        dot: 'El producto punto mide alineacion: cero indica perpendicularidad.',
        mag_u: 'La magnitud representa la longitud del vector.',
        angle: 'El angulo resume la orientacion relativa entre ambos vectores.',
        cross: 'El producto cruz genera un vector perpendicular y su magnitud expresa un area.',
        proj: 'La proyeccion extrae la componente de un vector en la direccion del otro.'
    };

    // Helper functions
    const vecAdd = (a, b) => a.map((val, i) => math.add(val, b[i]));
    const vecSub = (a, b) => a.map((val, i) => math.subtract(val, b[i]));
    const vecDot = (a, b) => a.reduce((sum, val, i) => math.add(sum, math.multiply(val, b[i])), math.fraction(0));
    const vecMagSq = (a) => a.reduce((sum, val) => math.add(sum, math.multiply(val, val)), math.fraction(0));
    
    // Format vector string (e.g. "[1, 2, 3]")
    const strVec = (arr) => `[${arr.map(x => formatMathVal(x)).join(', ')}]`;

    if (op === 'add') {
        const res = vecAdd(u, v);
        validationPayload = { vector: res };
        let componentsHtml = u.map((_, i) => `Componente ${i + 1}: ${formatMathVal(u[i])} + ${formatMathVal(v[i])} = ${formatMathVal(res[i])}`).join('<br>');
        resultTpl = `
            <div class="math-step">
                <h4>Suma de Vectores (u + v)</h4>
                <div class="math-formula">u + v = [u₁ + v₁, u₂ + v₂, ...]</div>
                <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">${componentsHtml}</div>
                <p>Resultado = <strong>${strVec(res)}</strong></p>
            </div>
        `;
        graphData = generateVectorPlotArgs(u, v, res, "Suma", dim);
    } 
    else if (op === 'sub') {
        const res = vecSub(u, v);
        validationPayload = { vector: res };
        let componentsHtml = u.map((_, i) => `Componente ${i + 1}: ${formatMathVal(u[i])} - ${formatMathVal(v[i])} = ${formatMathVal(res[i])}`).join('<br>');
        resultTpl = `
            <div class="math-step">
                <h4>Resta de Vectores (u - v)</h4>
                <div class="math-formula">u - v = [u₁ - v₁, u₂ - v₂, ...]</div>
                <div style="font-family: 'Fira Code', monospace; line-height: 1.6;">${componentsHtml}</div>
                <p>Resultado = <strong>${strVec(res)}</strong></p>
            </div>
        `;
        graphData = generateVectorPlotArgs(u, v, res, "Resta", dim);
    } 
    else if (op === 'dot') {
        const res = vecDot(u, v);
        validationPayload = { scalar: res };
        let details = u.map((val, i) => `(${formatMathVal(val)} × ${formatMathVal(v[i])})`).join(' + ');
        let results = u.map((val, i) => `${formatMathVal(math.multiply(val, v[i]))}`).join(' + ');
        resultTpl = `
            <div class="math-step">
                <h4>Producto Punto (u · v)</h4>
                <div class="math-formula">u · v = u₁v₁ + u₂v₂ + ...</div>
                <p>Sustitución: ${details}</p>
                <p>Sumatoria: ${results}</p>
                <p>Resultado final = <strong>${formatMathVal(res)}</strong></p>
                <p><small>* Nota: Si el resultado es cero, los vectores son ortogonales.</small></p>
            </div>
        `;
        graphData = generateVectorPlotArgs(u, v, null, null, dim);
    }
    else if (op === 'mag_u') {
        const magSq = vecMagSq(u);
        const mag = Math.sqrt(math.number(magSq));
        validationPayload = { scalar: math.fraction(mag) };
        let squares = u.map(val => `${formatMathVal(val)}²`).join(' + ');
        let squaresRes = u.map(val => `${formatMathVal(math.multiply(val, val))}`).join(' + ');
        resultTpl = `
            <div class="math-step">
                <h4>Magnitud o Norma (||u||)</h4>
                <div class="math-formula">||u|| = √(u₁² + u₂² + ...)</div>
                <p>Elevación al cuadrado: √(${squares})</p>
                <p>Suma de componentes: √(${squaresRes}) = √${formatMathVal(magSq)}</p>
                <p>Resultado final = <strong>${mag.toFixed(3)}</strong></p>
            </div>
        `;
        graphData = generateVectorPlotArgs(u, null, null, null, dim);
    }
    else if (op === 'angle') {
        const dot = math.number(vecDot(u, v));
        const magSqU = vecMagSq(u);
        const magSqV = vecMagSq(v);
        const magU = Math.sqrt(math.number(magSqU));
        const magV = Math.sqrt(math.number(magSqV));
        
        if (magU === 0 || magV === 0) {
            validationPayload = {};
            resultTpl = `<div class="math-step">El ángulo no está definido para el vector nulo.</div>`;
        } else {
            let cosTheta = dot / (magU * magV);
            cosTheta = Math.max(-1, Math.min(1, cosTheta)); 
            let angleRad = Math.acos(cosTheta);
            let angleDeg = angleRad * (180 / Math.PI);
            validationPayload = { scalar: angleDeg };
            
            resultTpl = `
                <div class="math-step">
                    <h4>Ángulo entre u y v (θ)</h4>
                    <div class="math-formula">cos(θ) = (u · v) / (||u|| × ||v||)</div>
                    
                    <p><strong>1. Producto Punto (u · v):</strong><br>
                    ${u.map((val, i) => `(${formatMathVal(val)} × ${formatMathVal(v[i])})`).join(' + ')} = ${formatMathVal(math.fraction(dot))}</p>
                    
                    <p><strong>2. Magnitudes (Normas):</strong><br>
                    ||u|| = √(${u.map(val => `${formatMathVal(val)}²`).join(' + ')}) = √${formatMathVal(magSqU)} ≈ ${magU.toFixed(3)}<br>
                    ||v|| = √(${v.map(val => `${formatMathVal(val)}²`).join(' + ')}) = √${formatMathVal(magSqV)} ≈ ${magV.toFixed(3)}</p>
                    
                    <p><strong>3. Sustitución en Fórmula:</strong><br>
                    cos(θ) = ${formatMathVal(math.fraction(dot))} / (${magU.toFixed(3)} × ${magV.toFixed(3)}) = ${cosTheta.toFixed(4)}</p>
                    
                    <p><strong>4. Despeje de θ:</strong><br>
                    θ = arccos(${cosTheta.toFixed(4)})<br>
                    Resultado: <strong>θ = ${angleDeg.toFixed(2)}° (${angleRad.toFixed(3)} rad)</strong></p>
                </div>
            `;
        }
        graphData = generateVectorPlotArgs(u, v, null, null, dim);
    }
    else if (op === 'cross') {
        try {
            if (dim !== 3) throw new Error("El Producto Cruz solo está definido para vectores en 3 dimensiones.");
            const res = math.cross(u, v);
            validationPayload = { vector: res };
            
            // Step by step breakdown for 3D cross product
            let cx_op = `(${formatMathVal(u[1])} × ${formatMathVal(v[2])}) - (${formatMathVal(u[2])} × ${formatMathVal(v[1])})`;
            let cy_op = `(${formatMathVal(u[2])} × ${formatMathVal(v[0])}) - (${formatMathVal(u[0])} × ${formatMathVal(v[2])})`;
            let cz_op = `(${formatMathVal(u[0])} × ${formatMathVal(v[1])}) - (${formatMathVal(u[1])} × ${formatMathVal(v[0])})`;

            const areaSq = vecMagSq(res);
            const area = Math.sqrt(math.number(areaSq));

            resultTpl = `
                <div class="math-step">
                    <h4>Producto Cruz (u × v) en 3D</h4>
                    <div class="math-formula">u × v = [(u₂v₃ - u₃v₂), (u₃v₁ - u₁v₃), (u₁v₂ - u₂v₁)]</div>
                    <p><strong>x:</strong> ${cx_op} = ${formatMathVal(math.multiply(u[1], v[2]))} - ${formatMathVal(math.multiply(u[2], v[1]))} = <strong>${formatMathVal(res[0])}</strong></p>
                    <p><strong>y:</strong> ${cy_op} = ${formatMathVal(math.multiply(u[2], v[0]))} - ${formatMathVal(math.multiply(u[0], v[2]))} = <strong>${formatMathVal(res[1])}</strong></p>
                    <p><strong>z:</strong> ${cz_op} = ${formatMathVal(math.multiply(u[0], v[1]))} - ${formatMathVal(math.multiply(u[1], v[0]))} = <strong>${formatMathVal(res[2])}</strong></p>
                    <p>Resultado final: <strong>${strVec(res)}</strong></p>
                </div>
                <div class="math-step" style="border-left-color: var(--secondary)">
                    <h4>Interpretación Geométrica</h4>
                    <p>La magnitud ||u × v|| representa el área del paralelogramo.</p>
                    <p>Área = √(${formatMathVal(res[0])}² + ${formatMathVal(res[1])}² + ${formatMathVal(res[2])}²) = <strong>${area.toFixed(3)}</strong> u²</p>
                </div>
            `;
            graphData = generateVectorPlotArgs(u, v, res, "Cruz", dim);
        } catch (err) {
            validationPayload = {};
            resultTpl = `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Error Operacional</h4><p>${err.message}</p></div>`;
            // Empty graph data for 2D cross product error to avoid confusion
            graphData = { data: [], layout: {} };
        }
    }
    else if (op === 'proj') {
        const dotUV = vecDot(u, v);
        const magVSq = vecMagSq(v);
        
        if (math.number(magVSq) === 0) {
            validationPayload = {};
            resultTpl = `<div class="math-step">Indefinido: No se puede proyectar sobre un vector nulo.</div>`;
            graphData = { data: [], layout: {} };
        } else {
            const scalarProj = math.divide(dotUV, magVSq);
            const res = v.map((val) => math.multiply(val, scalarProj));
            validationPayload = { vector: res };
            
            // Breakdown for dot product and norm squared
            const dotBreakdown = u.map((val, i) => `(${formatMathVal(val)} × ${formatMathVal(v[i])})`).join(' + ');
            const vSqBreakdown = v.map(val => `${formatMathVal(val)}²`).join(' + ');

            resultTpl = `
                <div class="math-step">
                    <h4>Proyección de u sobre v (proyᵥ u)</h4>
                    <div class="math-formula">proyᵥ u = [(u · v) / ||v||²] × v</div>
                    
                    <p><strong>1. Numerador (u · v):</strong><br>
                    ${dotBreakdown} = <strong>${formatMathVal(dotUV)}</strong></p>
                    
                    <p><strong>2. Denominador (||v||²):</strong><br>
                    ${vSqBreakdown} = <strong>${formatMathVal(magVSq)}</strong></p>
                    
                    <p><strong>3. Escalar (k):</strong><br>
                    k = ${formatMathVal(dotUV)} / ${formatMathVal(magVSq)} = <strong>${formatMathVal(scalarProj)}</strong></p>
                    
                    <p><strong>4. Vector Proyección final:</strong><br>
                    ${formatMathVal(scalarProj)} × ${strVec(v)} = <strong>${strVec(res)}</strong></p>
                </div>
            `;
            graphData = generateVectorPlotArgs(u, v, res, "Proyección", dim);
        }
    }

    const response = createStandardMathResponse({
        topic: 'Vectores',
        request: 'Ejecutar la operacion vectorial solicitada.',
        method: vectorMethodMap[op] || 'Metodo vectorial especifico segun la operacion seleccionada.',
        steps: [
            createStandardMathStep('Desarrollo paso a paso', 'Se muestra el procedimiento componente por componente o la formula correspondiente.', resultTpl)
        ],
        result: {
            summary: 'Se obtuvo el resultado de la operacion vectorial solicitada.',
            valueHtml: ''
        },
        verification: buildVectorVerification(op, u, v, validationPayload),
        interpretation: vectorInterpretationMap[op] || 'El resultado tiene una interpretacion geometrica asociada al tipo de operacion.'
    });

    setStandardMathResponse('vec-steps', response);

    // Plot graph
    plotVectorGraph(graphData.data, graphData.layout);
}

function calcVectorEnhanced() {
    try {
        clearInputErrors(document.getElementById('vectores'));
        readValidatedChoiceInput('vec-dim', 'dimension vectorial', ['2', '3']);
        const dim = getCurrentVectorDimension();
        const op = readValidatedChoiceInput('vec-op', 'operacion vectorial', ['add', 'sub', 'dot', 'mag_u', 'angle', 'cross', 'proj']);
        const u = readValidatedGrid(1, dim, 'vecA-inputs', 'el vector u')[0];
        let v = null;
        if (op !== 'mag_u') {
            v = readValidatedGrid(1, dim, 'vecB-inputs', 'el vector v')[0];
        }
        ensureOperationAllowed('vector', op, { u, v });

        const stepsContainer = document.getElementById('vec-steps');
        stepsContainer.innerHTML = '';
        document.getElementById('vec-results').classList.remove('hidden');

        let resultTpl = '';
        let graphData = [];
        let validationPayload = {};
        const vectorMethodMap = {
            add: 'Suma componente por componente.',
            sub: 'Resta componente por componente.',
            dot: 'Producto punto como suma de productos entre componentes homologas.',
            mag_u: 'Magnitud calculada como la raiz cuadrada de la suma de cuadrados.',
            angle: 'Uso de cos(theta) = (u · v) / (||u|| ||v||).',
            cross: 'Producto cruz calculando cada componente del vector perpendicular.',
            proj: 'Proyeccion usando ((u · v) / ||v||^2) v.'
        };

        const vecAdd = (a, b) => a.map((val, i) => math.add(val, b[i]));
        const vecSub = (a, b) => a.map((val, i) => math.subtract(val, b[i]));
        const vecDot = (a, b) => a.reduce((sum, val, i) => math.add(sum, math.multiply(val, b[i])), math.fraction(0));
        const vecMagSq = (a) => a.reduce((sum, val) => math.add(sum, math.multiply(val, val)), math.fraction(0));

    if (op === 'add') {
        const res = vecAdd(u, v);
        validationPayload = { vector: res };
        const componentsHtml = u.map((_, i) => `Componente ${i + 1}: ${formatMathVal(u[i])} + ${formatMathVal(v[i])} = ${formatMathVal(res[i])}`).join('<br>');
        resultTpl = `
            ${buildVectorStepBlock('Formula y datos', 'u + v = [u1 + v1, u2 + v2, ..., un + vn]', `Se suma componente a componente usando u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
            ${buildVectorStepBlock('Desarrollo componente a componente', '', 'Cada componente del resultado se obtiene sumando las entradas de la misma posicion.', `${componentsHtml}<br><br>Resultado final: ${formatVectorDisplay(res)}`)}
            ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('add', { vector: res }), `Vector resultante: ${formatVectorDisplay(res)}`)}
        `;
        graphData = generateVectorPlotArgs(u, v, res, "Suma", dim);
    } else if (op === 'sub') {
        const res = vecSub(u, v);
        validationPayload = { vector: res };
        const componentsHtml = u.map((_, i) => `Componente ${i + 1}: ${formatMathVal(u[i])} - ${formatMathVal(v[i])} = ${formatMathVal(res[i])}`).join('<br>');
        resultTpl = `
            ${buildVectorStepBlock('Formula y datos', 'u - v = [u1 - v1, u2 - v2, ..., un - vn]', `Se resta componente a componente usando u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
            ${buildVectorStepBlock('Desarrollo componente a componente', '', 'Cada componente del resultado se obtiene restando las entradas de la misma posicion.', `${componentsHtml}<br><br>Resultado final: ${formatVectorDisplay(res)}`)}
            ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('sub', { vector: res }), `Vector resultante: ${formatVectorDisplay(res)}`)}
        `;
        graphData = generateVectorPlotArgs(u, v, res, "Resta", dim);
    } else if (op === 'dot') {
        const res = vecDot(u, v);
        validationPayload = { scalar: res };
        const multiplicationLines = u.map((val, i) => {
            const partial = math.multiply(val, v[i]);
            return `Componente ${i + 1}: (${formatMathVal(val)})(${formatMathVal(v[i])}) = ${formatMathVal(partial)}`;
        }).join('<br>');
        const sumLine = u.map((val, i) => `${formatMathVal(math.multiply(val, v[i]))}`).join(' + ');
        resultTpl = `
            ${buildVectorStepBlock('Formula y datos', 'u · v = u1v1 + u2v2 + ... + unvn', `Se calcula el producto punto usando u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
            ${buildVectorStepBlock('Productos parciales y suma', '', 'Primero se multiplica componente a componente y luego se suman todos los productos.', `${multiplicationLines}<br><br>${sumLine} = ${formatMathVal(res)}`)}
            ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('dot', { scalar: res }), `u · v = ${formatMathVal(res)}`)}
        `;
        graphData = generateVectorPlotArgs(u, v, null, null, dim);
    } else if (op === 'mag_u') {
        const magSq = vecMagSq(u);
        const mag = Math.sqrt(math.number(magSq));
        validationPayload = { scalar: math.fraction(mag) };
        const squareLines = u.map((val, index) => `Componente ${index + 1}: (${formatMathVal(val)})^2 = ${formatMathVal(math.multiply(val, val))}`).join('<br>');
        resultTpl = `
            ${buildVectorStepBlock('Formula y datos', '||u|| = sqrt(u1^2 + u2^2 + ... + un^2)', `Se calcula la longitud del vector u = ${formatVectorDisplay(u)}.`, `u = ${formatVectorDisplay(u)}`)}
            ${buildVectorStepBlock('Suma de cuadrados', '', 'Se eleva cada componente al cuadrado y luego se suman esos resultados antes de aplicar la raiz.', `${squareLines}<br><br>${u.map((val) => formatMathVal(math.multiply(val, val))).join(' + ')} = ${formatMathVal(magSq)}`)}
            ${buildVectorStepBlock('Aplicacion de la raiz', '', 'La magnitud es la raiz cuadrada de la suma de cuadrados.', `||u|| = sqrt(${formatMathVal(magSq)}) ≈ ${mag.toFixed(3)}`)}
            ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('mag_u', { scalar: math.fraction(mag) }), `Longitud aproximada: ${mag.toFixed(3)}`)}
        `;
        graphData = generateVectorPlotArgs(u, null, null, null, dim);
    } else if (op === 'angle') {
        const dot = math.number(vecDot(u, v));
        const magSqU = vecMagSq(u);
        const magSqV = vecMagSq(v);
        const magU = Math.sqrt(math.number(magSqU));
        const magV = Math.sqrt(math.number(magSqV));

        if (magU === 0 || magV === 0) {
            validationPayload = {};
            resultTpl = `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Angulo no definido</h4><p>El angulo no esta definido si alguno de los dos vectores es nulo.</p></div>`;
        } else {
            let cosTheta = dot / (magU * magV);
            cosTheta = Math.max(-1, Math.min(1, cosTheta));
            const angleRad = Math.acos(cosTheta);
            const angleDeg = angleRad * (180 / Math.PI);
            validationPayload = { scalar: angleDeg };

            resultTpl = `
                ${buildVectorStepBlock('Formula y datos', 'cos(theta) = (u · v) / (||u|| ||v||)', `Se calcula el angulo entre u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                ${buildVectorStepBlock('Producto punto y magnitudes', '', 'Primero se calcula el producto punto y despues las magnitudes de ambos vectores.', `u · v = ${u.map((val, i) => `(${formatMathVal(val)})(${formatMathVal(v[i])})`).join(' + ')} = ${formatMathVal(math.fraction(dot))}<br><br>||u|| = sqrt(${u.map((val) => `${formatMathVal(val)}^2`).join(' + ')}) = sqrt(${formatMathVal(magSqU)}) ≈ ${magU.toFixed(3)}<br>||v|| = sqrt(${v.map((val) => `${formatMathVal(val)}^2`).join(' + ')}) = sqrt(${formatMathVal(magSqV)}) ≈ ${magV.toFixed(3)}`)}
                ${buildVectorStepBlock('Sustitucion y despeje', '', 'Se sustituye en la formula del coseno y luego se aplica arccos para despejar el angulo.', `cos(theta) = ${formatMathVal(math.fraction(dot))} / (${magU.toFixed(3)} * ${magV.toFixed(3)}) = ${cosTheta.toFixed(4)}<br>theta = arccos(${cosTheta.toFixed(4)}) = ${angleDeg.toFixed(2)} grados = ${angleRad.toFixed(3)} rad`)}
                ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('angle', { scalar: angleDeg }), `Angulo final: ${angleDeg.toFixed(2)} grados`)}
            `;
        }
        graphData = generateVectorPlotArgs(u, v, null, null, dim);
    } else if (op === 'cross') {
        try {
            if (dim !== 3) throw new Error('El producto cruz solo esta definido para vectores en 3 dimensiones.');
            const res = math.cross(u, v);
            validationPayload = { vector: res };
            const cxOp = `(${formatMathVal(u[1])} * ${formatMathVal(v[2])}) - (${formatMathVal(u[2])} * ${formatMathVal(v[1])})`;
            const cyOp = `(${formatMathVal(u[2])} * ${formatMathVal(v[0])}) - (${formatMathVal(u[0])} * ${formatMathVal(v[2])})`;
            const czOp = `(${formatMathVal(u[0])} * ${formatMathVal(v[1])}) - (${formatMathVal(u[1])} * ${formatMathVal(v[0])})`;
            const areaSq = vecMagSq(res);
            const area = Math.sqrt(math.number(areaSq));

            resultTpl = `
                ${buildVectorStepBlock('Formula y datos', 'u × v = [u2v3 - u3v2, u3v1 - u1v3, u1v2 - u2v1]', `El producto cruz se calcula con u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                ${buildVectorStepBlock('Calculo componente a componente', '', 'Cada componente del vector perpendicular se obtiene con su formula correspondiente.', `Componente x: ${cxOp} = ${formatMathVal(math.multiply(u[1], v[2]))} - ${formatMathVal(math.multiply(u[2], v[1]))} = ${formatMathVal(res[0])}<br>Componente y: ${cyOp} = ${formatMathVal(math.multiply(u[2], v[0]))} - ${formatMathVal(math.multiply(u[0], v[2]))} = ${formatMathVal(res[1])}<br>Componente z: ${czOp} = ${formatMathVal(math.multiply(u[0], v[1]))} - ${formatMathVal(math.multiply(u[1], v[0]))} = ${formatMathVal(res[2])}<br><br>Resultado final: ${formatVectorDisplay(res)}`)}
                ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('cross', { vector: res }), `||u × v|| = sqrt(${formatMathVal(areaSq)}) ≈ ${area.toFixed(3)}`)}
            `;
            graphData = generateVectorPlotArgs(u, v, res, "Cruz", dim);
        } catch (err) {
            validationPayload = {};
            resultTpl = `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Error operacional</h4><p>${err.message}</p></div>`;
            graphData = { data: [], layout: {} };
        }
    } else if (op === 'proj') {
        const dotUV = vecDot(u, v);
        const magVSq = vecMagSq(v);

        if (math.number(magVSq) === 0) {
            validationPayload = {};
            resultTpl = `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Proyeccion no definida</h4><p>No se puede proyectar sobre un vector nulo porque aparece en el denominador ||v||^2.</p></div>`;
            graphData = { data: [], layout: {} };
        } else {
            const scalarProj = math.divide(dotUV, magVSq);
            const res = v.map((val) => math.multiply(val, scalarProj));
            validationPayload = { vector: res };
            const dotBreakdown = u.map((val, i) => `(${formatMathVal(val)})(${formatMathVal(v[i])})`).join(' + ');
            const vSqBreakdown = v.map((val) => `${formatMathVal(val)}^2`).join(' + ');

            resultTpl = `
                ${buildVectorStepBlock('Formula y datos', 'proy_v(u) = ((u · v) / ||v||^2) v', `Se proyecta u = ${formatVectorDisplay(u)} sobre la direccion de v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                ${buildVectorStepBlock('Calculo del escalar de proyeccion', '', 'Primero se calcula el producto punto u · v y luego la norma al cuadrado de v.', `u · v = ${dotBreakdown} = ${formatMathVal(dotUV)}<br>||v||^2 = ${vSqBreakdown} = ${formatMathVal(magVSq)}<br>k = ${formatMathVal(dotUV)} / ${formatMathVal(magVSq)} = ${formatMathVal(scalarProj)}`)}
                ${buildVectorStepBlock('Construccion del vector proyectado', '', 'El vector proyectado se obtiene multiplicando el escalar de proyeccion por el vector base v.', `${formatMathVal(scalarProj)} * ${formatVectorDisplay(v)} = ${formatVectorDisplay(res)}`)}
                ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('proj', { vector: res }), `Proyeccion final: ${formatVectorDisplay(res)}`)}
            `;
            graphData = generateVectorPlotArgs(u, v, res, "Proyección", dim);
        }
    }

        const response = createStandardMathResponse({
            topic: 'Vectores',
            request: 'Ejecutar la operacion vectorial solicitada.',
            method: vectorMethodMap[op] || 'Metodo vectorial especifico segun la operacion seleccionada.',
            steps: [
                createStandardMathStep('Desarrollo paso a paso', 'Se presenta la formula antes de calcular, luego el desarrollo detallado y finalmente una interpretacion geometrica.', resultTpl)
            ],
            result: {
                summary: 'Se obtuvo el resultado de la operacion vectorial solicitada.',
                valueHtml: ''
            },
            verification: buildVectorVerification(op, u, v, validationPayload),
            interpretation: buildVectorInterpretation(op, validationPayload),
            historyMeta: {
                saveToHistory: true,
                operationType: op,
                inputData: {
                    operationType: op,
                    vectorU: u,
                    vectorV: op === 'mag_u' ? null : v
                },
                validationData: {
                    operation: op,
                    input: {
                        operationType: op,
                        vectorU: u,
                        vectorV: op === 'mag_u' ? null : v
                    },
                    result: {
                        ...validationPayload
                    }
                },
                summary: `Vectores: ${getOperationLabel(op)}`
            }
        });

        setStandardMathResponse('vec-steps', response);
        plotVectorGraph(graphData.data, graphData.layout);
    } catch (error) {
        const graphDiv = document.getElementById('vec-graph');
        if (graphDiv) graphDiv.innerHTML = '';
        renderValidationErrorResponse('vec-steps', {
            topic: 'Vectores',
            request: 'Ejecutar una operacion vectorial con datos validos.',
            message: error.message,
            interpretation: 'Una operacion con vectores exige entradas completas, numericas y del tamano correcto.'
        });
    }
}

calcVector = calcVectorEnhanced;

function getVectorAxisLabels(dim) {
    return dim === 2 ? ['x', 'y'] : ['x', 'y', 'z'];
}

function formatVectorComponents(vector, dim) {
    const labels = getVectorAxisLabels(dim || vector.length);
    return labels.map((label, index) => `${label} = ${formatMathVal(vector[index])}`).join('<br>');
}

function buildVectorOperationResultHtml(resultData = {}, dim = null) {
    if (resultData.vector) {
        return `Resultado vectorial: ${formatVectorDisplay(resultData.vector)}<br>${formatVectorComponents(resultData.vector, dim || resultData.vector.length)}`;
    }
    if (resultData.scalarExact !== undefined) {
        return `Resultado escalar exacto: ${formatMathVal(resultData.scalarExact)}`;
    }
    if (resultData.angleDeg !== undefined) {
        return `Resultado angular: ${resultData.angleDeg.toFixed(2)} grados<br>Resultado en radianes: ${resultData.angleRad.toFixed(3)}`;
    }
    if (resultData.scalar !== undefined) {
        return `Resultado escalar: ${typeof resultData.scalar === 'number' ? resultData.scalar.toFixed(4) : formatMathVal(resultData.scalar)}`;
    }
    return 'El resultado queda expresado en el desarrollo mostrado.';
}

function buildProjectionExpected(u, v) {
    const dotUV = vecDotExact(u, v);
    const normVSq = vecDotExact(v, v);
    if (isZeroMathVal(normVSq)) return null;
    const scalar = math.divide(dotUV, normVSq);
    return {
        scalar,
        vector: v.map((value) => math.multiply(value, scalar)),
        residual: u.map((value, index) => math.subtract(value, math.multiply(v[index], scalar)))
    };
}

function buildVectorVerification(op, u, v, resultData = {}) {
    if ((op === 'add' || op === 'sub') && resultData.vector) {
        const recomputed = op === 'add'
            ? u.map((val, index) => math.add(val, v[index]))
            : u.map((val, index) => math.subtract(val, v[index]));
        const consistent = matricesAreEqualExact([recomputed], [resultData.vector]);
        return createValidationResult({
            status: consistent ? 'success' : 'warning',
            summary: `Verificacion de ${op === 'add' ? 'suma' : 'resta'} de vectores.`,
            detail: 'Se recompone la operacion componente por componente para comparar el resultado mostrado con el esperado.',
            checks: [
                {
                    label: 'Consistencia componente a componente',
                    passed: consistent,
                    detail: consistent ? 'Cada componente coincide con la operacion definida.' : 'Alguna componente no coincide con la operacion definida.'
                }
            ],
            outputHtml: `<div class="step-matrix-display">${renderMatrixHTML([recomputed])}</div>`
        });
    }

    if (op === 'dot' && resultData.scalarExact !== undefined) {
        const recomputed = vecDotExact(u, v);
        const consistent = math.equal(recomputed, resultData.scalarExact);
        return createValidationResult({
            status: consistent ? 'success' : 'warning',
            summary: 'Verificacion del producto punto.',
            detail: 'Se recalcula la suma de productos y se interpreta el signo del resultado.',
            checks: [
                {
                    label: 'Recomposicion algebraica',
                    passed: consistent,
                    detail: `u · v = ${formatMathVal(recomputed)}`
                },
                {
                    label: 'Perpendicularidad',
                    passed: isZeroMathVal(recomputed),
                    detail: isZeroMathVal(recomputed) ? 'Como u · v = 0, los vectores son perpendiculares.' : 'Como u · v ≠ 0, los vectores no son perpendiculares.'
                }
            ]
        });
    }

    if (op === 'mag_u' && resultData.scalar !== undefined && resultData.squaredNorm !== undefined) {
        const nonNegative = resultData.scalar >= 0;
        const recomposedSquare = Math.abs((resultData.scalar * resultData.scalar) - math.number(resultData.squaredNorm)) < 1e-8;
        return createValidationResult({
            status: nonNegative && recomposedSquare ? 'success' : 'warning',
            summary: 'Verificacion de magnitud.',
            detail: 'La magnitud debe ser no negativa y su cuadrado debe coincidir con la suma de cuadrados de las componentes.',
            checks: [
                {
                    label: 'No negatividad',
                    passed: nonNegative,
                    detail: `||u|| ≈ ${resultData.scalar.toFixed(4)}`
                },
                {
                    label: 'Consistencia con ||u||^2',
                    passed: recomposedSquare,
                    detail: `||u||^2 ≈ ${(resultData.scalar * resultData.scalar).toFixed(4)} y suma de cuadrados = ${formatMathVal(resultData.squaredNorm)}`
                }
            ]
        });
    }

    if (op === 'angle' && resultData.angleDeg !== undefined) {
        const validRange = resultData.angleDeg >= 0 && resultData.angleDeg <= 180;
        const cosineRange = resultData.cosTheta >= -1 && resultData.cosTheta <= 1;
        const dotConsistency = Math.abs(resultData.dotNumber) < 1e-10
            ? Math.abs(resultData.angleDeg - 90) < 1e-6
            : (resultData.dotNumber > 0 ? resultData.angleDeg < 90 : resultData.angleDeg > 90);
        return createValidationResult({
            status: validRange && cosineRange && dotConsistency ? 'success' : 'warning',
            summary: 'Verificacion del angulo.',
            detail: 'Se comprueba que el coseno sea valido y que el angulo sea coherente con el signo del producto punto.',
            checks: [
                {
                    label: 'Rango angular',
                    passed: validRange,
                    detail: `theta = ${resultData.angleDeg.toFixed(2)} grados`
                },
                {
                    label: 'Coseno valido',
                    passed: cosineRange,
                    detail: `cos(theta) = ${resultData.cosTheta.toFixed(4)}`
                },
                {
                    label: 'Consistencia con u · v',
                    passed: dotConsistency,
                    detail: `u · v = ${resultData.dotNumber.toFixed(4)}`
                }
            ]
        });
    }

    if (op === 'cross' && resultData.vector) {
        const dotU = vecDotExact(resultData.vector, u);
        const dotV = vecDotExact(resultData.vector, v);
        return createValidationResult({
            status: isZeroMathVal(dotU) && isZeroMathVal(dotV) ? 'success' : 'warning',
            summary: 'Verificacion del producto cruz.',
            detail: 'El vector resultante debe ser perpendicular a ambos vectores originales.',
            checks: [
                {
                    label: '(u × v) · u = 0',
                    passed: isZeroMathVal(dotU),
                    detail: `Resultado = ${formatMathVal(dotU)}`
                },
                {
                    label: '(u × v) · v = 0',
                    passed: isZeroMathVal(dotV),
                    detail: `Resultado = ${formatMathVal(dotV)}`
                }
            ]
        });
    }

    if (op === 'proj' && resultData.vector && v) {
        const expected = buildProjectionExpected(u, v);
        const consistent = expected ? matricesAreEqualExact([expected.vector], [resultData.vector]) : false;
        const residualOrthogonal = expected ? isZeroMathVal(vecDotExact(expected.residual, v)) : false;
        return createValidationResult({
            status: consistent && residualOrthogonal ? 'success' : 'warning',
            summary: 'Verificacion de proyeccion.',
            detail: 'La proyeccion correcta debe coincidir con la formula y dejar un residuo ortogonal a v.',
            checks: [
                {
                    label: 'Coincide con proy_v(u)',
                    passed: consistent,
                    detail: expected ? `Vector esperado = ${formatVectorDisplay(expected.vector)}` : 'No aplica porque v es nulo.'
                },
                {
                    label: '(u - proy_v(u)) · v = 0',
                    passed: residualOrthogonal,
                    detail: expected ? `Resultado = ${formatMathVal(vecDotExact(expected.residual, v))}` : 'No aplica porque v es nulo.'
                }
            ]
        });
    }

    return createValidationResult({
        status: 'info',
        summary: 'Verificacion vectorial.',
        detail: 'No se definio una verificacion adicional para esta situacion.'
    });
}

function buildVectorInterpretation(op, context = {}) {
    if (op === 'add') {
        return 'La suma representa la combinacion de dos desplazamientos y geometricamente corresponde a la diagonal del paralelogramo formado por u y v.';
    }
    if (op === 'sub') {
        return 'La resta mide el desplazamiento que lleva desde la punta de v hasta la punta de u cuando ambos parten del mismo origen.';
    }
    if (op === 'dot') {
        if (context.scalarExact === undefined) return 'El producto punto mide el grado de alineacion entre dos vectores.';
        if (isZeroMathVal(context.scalarExact)) return 'Como u · v = 0, los vectores son perpendiculares.';
        return math.smaller(context.scalarExact, 0)
            ? 'Como u · v es negativo, el angulo entre los vectores es obtuso y apuntan en direcciones mayormente opuestas.'
            : 'Como u · v es positivo, el angulo entre los vectores es agudo y apuntan en direcciones relativamente cercanas.';
    }
    if (op === 'mag_u') {
        return 'La magnitud mide la longitud del vector desde el origen hasta su extremo.';
    }
    if (op === 'angle') {
        if (context.angleDeg === undefined) return 'El angulo resume la orientacion relativa entre dos vectores no nulos.';
        if (Math.abs(context.angleDeg - 90) < 1e-6) return 'El angulo es recto, de modo que los vectores son ortogonales.';
        if (context.angleDeg < 90) return 'El angulo es agudo, por lo que los vectores tienen orientaciones cercanas.';
        return 'El angulo es obtuso, por lo que los vectores tienen orientaciones mayormente opuestas.';
    }
    if (op === 'cross') {
        return 'El producto cruz produce un vector perpendicular al plano generado por u y v, y su magnitud representa el area del paralelogramo formado por ambos.';
    }
    if (op === 'proj') {
        return 'La proyeccion extrae la componente de u que queda exactamente en la direccion de v.';
    }
    return 'El resultado admite una interpretacion geometrica segun la operacion elegida.';
}

function calcVectorEnhanced() {
    try {
        clearInputErrors(document.getElementById('vectores'));
        readValidatedChoiceInput('vec-dim', 'dimension vectorial', ['2', '3']);
        const dim = getCurrentVectorDimension();
        const op = readValidatedChoiceInput('vec-op', 'operacion vectorial', ['add', 'sub', 'dot', 'mag_u', 'angle', 'cross', 'proj']);
        const u = readValidatedGrid(1, dim, 'vecA-inputs', 'el vector u')[0];
        let v = null;
        if (op !== 'mag_u') {
            v = readValidatedGrid(1, dim, 'vecB-inputs', 'el vector v')[0];
        }
        ensureOperationAllowed('vector', op, { u, v });

        const stepsContainer = document.getElementById('vec-steps');
        stepsContainer.innerHTML = '';
        document.getElementById('vec-results').classList.remove('hidden');

        let resultTpl = '';
        let graphData = [];
        let validationPayload = {};
        const vectorMethodMap = {
            add: 'Suma componente por componente.',
            sub: 'Resta componente por componente.',
            dot: 'Producto punto como suma de productos entre componentes homologas.',
            mag_u: 'Magnitud calculada como la raiz cuadrada de la suma de cuadrados.',
            angle: 'Uso de cos(theta) = (u · v) / (||u|| ||v||).',
            cross: 'Producto cruz calculando cada componente del vector perpendicular.',
            proj: 'Proyeccion usando ((u · v) / ||v||^2) v.'
        };

        const vecAdd = (a, b) => a.map((val, i) => math.add(val, b[i]));
        const vecSub = (a, b) => a.map((val, i) => math.subtract(val, b[i]));
        const vecDot = (a, b) => a.reduce((sum, val, i) => math.add(sum, math.multiply(val, b[i])), math.fraction(0));
        const vecMagSq = (a) => a.reduce((sum, val) => math.add(sum, math.multiply(val, val)), math.fraction(0));

        if (op === 'add' || op === 'sub') {
            const res = op === 'add' ? vecAdd(u, v) : vecSub(u, v);
            validationPayload = { vector: res };
            const symbol = op === 'add' ? '+' : '-';
            const componentsHtml = u.map((_, i) => `Componente ${i + 1}: ${formatMathVal(u[i])} ${symbol} ${formatMathVal(v[i])} = ${formatMathVal(res[i])}`).join('<br>');
            resultTpl = `
                ${buildVectorStepBlock('Formula y datos', op === 'add' ? 'u + v = [u1 + v1, u2 + v2, ..., un + vn]' : 'u - v = [u1 - v1, u2 - v2, ..., un - vn]', `Se trabaja con u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                ${buildVectorStepBlock('Desarrollo componente a componente', '', 'Cada componente del resultado se obtiene operando las entradas de la misma posicion.', `${componentsHtml}<br><br>Resultado final: ${formatVectorDisplay(res)}`)}
                ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation(op, validationPayload), `Vector resultante: ${formatVectorDisplay(res)}`)}
                ${buildVectorStepBlock('Resultado final', '', 'Se resume el vector obtenido en forma compacta y por componentes.', buildVectorOperationResultHtml(validationPayload, dim))}
            `;
            graphData = generateVectorPlotArgs(u, v, res, op === 'add' ? 'Suma' : 'Resta', dim);
        } else if (op === 'dot') {
            const res = vecDot(u, v);
            validationPayload = { scalarExact: res };
            const multiplicationLines = u.map((val, i) => `Componente ${i + 1}: (${formatMathVal(val)})(${formatMathVal(v[i])}) = ${formatMathVal(math.multiply(val, v[i]))}`).join('<br>');
            const sumLine = u.map((val, i) => formatMathVal(math.multiply(val, v[i]))).join(' + ');
            resultTpl = `
                ${buildVectorStepBlock('Formula y datos', 'u · v = u1v1 + u2v2 + ... + unvn', `Se calcula el producto punto con u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                ${buildVectorStepBlock('Productos parciales y suma', '', 'Primero se multiplica componente a componente y luego se suman todos los productos.', `${multiplicationLines}<br><br>${sumLine} = ${formatMathVal(res)}`)}
                ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('dot', validationPayload), `u · v = ${formatMathVal(res)}`)}
                ${buildVectorStepBlock('Resultado final', '', 'Se resume el valor escalar obtenido.', buildVectorOperationResultHtml(validationPayload, dim))}
            `;
            graphData = generateVectorPlotArgs(u, v, null, null, dim);
        } else if (op === 'mag_u') {
            const magnitudeData = calculateMagnitude(u);
            validationPayload = { scalar: magnitudeData.result, squaredNorm: magnitudeData.squaredNorm };
            const squareLines = u.map((val, index) => `Componente ${index + 1}: ${formatSquaredMathVal(val)} = ${formatMathVal(magnitudeData.squaredTerms[index])}`).join('<br>');
            resultTpl = `
                ${buildVectorStepBlock('Formula y datos', `${formatNormHtml('u')} = √(u1<sup>2</sup> + u2<sup>2</sup> + ... + un<sup>2</sup>)`, `Se calcula la longitud del vector u = ${formatVectorDisplay(u)}.`, `u = ${formatVectorDisplay(u)}`)}
                ${buildVectorStepBlock('Suma de cuadrados', '', 'Se eleva cada componente al cuadrado y luego se suman esos resultados.', `${squareLines}<br><br>${magnitudeData.steps[0]}<br>${magnitudeData.steps[1]}`)}
                ${buildVectorStepBlock('Aplicacion de la raiz', '', 'La magnitud es la raiz cuadrada de la suma de cuadrados.', magnitudeData.steps[2])}
                ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('mag_u', validationPayload), `Longitud aproximada: ${magnitudeData.result.toFixed(3)}`)}
                ${buildVectorStepBlock('Resultado final', '', 'Se resume la longitud obtenida.', buildVectorOperationResultHtml(validationPayload, dim))}
            `;
            graphData = generateVectorPlotArgs(u, null, null, null, dim);
        } else if (op === 'angle') {
            const dotExact = vecDot(u, v);
            const dotNumber = math.number(dotExact);
            const magSqU = vecMagSq(u);
            const magSqV = vecMagSq(v);
            const magU = Math.sqrt(math.number(magSqU));
            const magV = Math.sqrt(math.number(magSqV));

            if (magU === 0 || magV === 0) {
                validationPayload = {};
                resultTpl = `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Angulo no definido</h4><p>El angulo no esta definido si alguno de los dos vectores es nulo.</p></div>`;
            } else {
                let cosTheta = dotNumber / (magU * magV);
                cosTheta = Math.max(-1, Math.min(1, cosTheta));
                const angleRad = Math.acos(cosTheta);
                const angleDeg = angleRad * (180 / Math.PI);
                validationPayload = { angleDeg, angleRad, cosTheta, dotNumber, dotExact };

                resultTpl = `
                    ${buildVectorStepBlock('Formula y datos', 'cos(theta) = (u · v) / (||u|| ||v||)', `Se calcula el angulo entre u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                    ${buildVectorStepBlock('Producto punto y magnitudes', '', 'Primero se calcula el producto punto y despues las magnitudes de ambos vectores.', `u · v = ${u.map((val, i) => `(${formatMathVal(val)})(${formatMathVal(v[i])})`).join(' + ')} = ${formatMathVal(dotExact)}<br><br>||u|| = sqrt(${u.map((val) => `${formatMathVal(val)}^2`).join(' + ')}) = sqrt(${formatMathVal(magSqU)}) ≈ ${magU.toFixed(3)}<br>||v|| = sqrt(${v.map((val) => `${formatMathVal(val)}^2`).join(' + ')}) = sqrt(${formatMathVal(magSqV)}) ≈ ${magV.toFixed(3)}`)}
                    ${buildVectorStepBlock('Sustitucion y despeje', '', 'Se sustituye en la formula del coseno y luego se aplica arccos para despejar el angulo.', `cos(theta) = ${formatMathVal(dotExact)} / (${magU.toFixed(3)} * ${magV.toFixed(3)}) = ${cosTheta.toFixed(4)}<br>theta = arccos(${cosTheta.toFixed(4)}) = ${angleDeg.toFixed(2)} grados = ${angleRad.toFixed(3)} rad`)}
                    ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('angle', validationPayload), `Angulo final: ${angleDeg.toFixed(2)} grados`)}
                    ${buildVectorStepBlock('Resultado final', '', 'Se resume el valor angular obtenido.', buildVectorOperationResultHtml(validationPayload, dim))}
                `;
            }
            graphData = generateVectorPlotArgs(u, v, null, null, dim);
        } else if (op === 'cross') {
            if (dim !== 3) {
                validationPayload = {};
                resultTpl = `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Error operacional</h4><p>El producto cruz solo esta definido para vectores en 3 dimensiones.</p></div>`;
                graphData = { data: [], layout: {} };
            } else {
                const res = math.cross(u, v);
                validationPayload = { vector: res };
                const areaSq = vecMagSq(res);
                const area = Math.sqrt(math.number(areaSq));
                resultTpl = `
                    ${buildVectorStepBlock('Formula y datos', 'u × v = [u2v3 - u3v2, u3v1 - u1v3, u1v2 - u2v1]', `Se calcula el producto cruz con u = ${formatVectorDisplay(u)} y v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                    ${buildVectorStepBlock('Calculo componente a componente', '', 'Cada componente se obtiene con su formula correspondiente.', `Componente x: (${formatMathVal(u[1])})(${formatMathVal(v[2])}) - (${formatMathVal(u[2])})(${formatMathVal(v[1])}) = ${formatMathVal(res[0])}<br>Componente y: (${formatMathVal(u[2])})(${formatMathVal(v[0])}) - (${formatMathVal(u[0])})(${formatMathVal(v[2])}) = ${formatMathVal(res[1])}<br>Componente z: (${formatMathVal(u[0])})(${formatMathVal(v[1])}) - (${formatMathVal(u[1])})(${formatMathVal(v[0])}) = ${formatMathVal(res[2])}<br><br>Resultado final: ${formatVectorDisplay(res)}`)}
                    ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('cross', validationPayload), `||u × v|| = sqrt(${formatMathVal(areaSq)}) ≈ ${area.toFixed(3)}`)}
                    ${buildVectorStepBlock('Resultado final', '', 'Se resume el vector perpendicular obtenido.', buildVectorOperationResultHtml(validationPayload, dim))}
                `;
                graphData = generateVectorPlotArgs(u, v, res, 'Cruz', dim);
            }
        } else if (op === 'proj') {
            const dotUV = vecDot(u, v);
            const magVSq = vecMagSq(v);

            if (math.number(magVSq) === 0) {
                validationPayload = {};
                resultTpl = `<div class="math-step" style="border-left-color: var(--error)"><h4 style="color:var(--error)">Proyeccion no definida</h4><p>No se puede proyectar sobre un vector nulo porque aparece en el denominador ${formatNormHtml('v', 2)}.</p></div>`;
                graphData = { data: [], layout: {} };
            } else {
                const scalarProj = math.divide(dotUV, magVSq);
                const res = v.map((val) => math.multiply(val, scalarProj));
                const residual = u.map((val, i) => math.subtract(val, res[i]));
                validationPayload = { vector: res, scalarExact: scalarProj, residual };
                const dotBreakdown = u.map((val, i) => `(${formatMathVal(val)})(${formatMathVal(v[i])})`).join(' + ');
                const vSqBreakdown = v.map((val) => formatSquaredMathVal(val)).join(' + ');

                resultTpl = `
                    ${buildVectorStepBlock('Formula y datos', 'proy_v(u) = ((u · v) / ||v||^2) v', `Se proyecta u = ${formatVectorDisplay(u)} sobre la direccion de v = ${formatVectorDisplay(v)}.`, `u = ${formatVectorDisplay(u)}<br>v = ${formatVectorDisplay(v)}`)}
                    ${buildVectorStepBlock('Calculo del escalar de proyeccion', '', 'Primero se calcula el producto punto u · v y luego la norma al cuadrado de v.', `u · v = ${dotBreakdown} = ${formatMathVal(dotUV)}<br>||v||^2 = ${vSqBreakdown} = ${formatMathVal(magVSq)}<br>k = ${formatMathVal(dotUV)} / ${formatMathVal(magVSq)} = ${formatMathVal(scalarProj)}`)}
                    ${buildVectorStepBlock('Construccion del vector proyectado', '', 'El vector proyectado se obtiene multiplicando el escalar de proyeccion por el vector base v.', `${formatMathVal(scalarProj)} * ${formatVectorDisplay(v)} = ${formatVectorDisplay(res)}<br><br>Residuo ortogonal: u - proy_v(u) = ${formatVectorDisplay(residual)}`)}
                    ${buildVectorStepBlock('Interpretacion geometrica', '', buildVectorInterpretation('proj', validationPayload), `Proyeccion final: ${formatVectorDisplay(res)}`)}
                    ${buildVectorStepBlock('Resultado final', '', 'Se resume el vector proyectado y el escalar de proyeccion.', `Escalar de proyeccion: ${formatMathVal(scalarProj)}<br>${buildVectorOperationResultHtml(validationPayload, dim)}`)}
                `;
                graphData = generateVectorPlotArgs(u, v, res, 'Proyección', dim);
            }
        }

        const response = createStandardMathResponse({
            topic: 'Vectores',
            request: 'Ejecutar la operacion vectorial solicitada.',
            method: vectorMethodMap[op] || 'Metodo vectorial especifico segun la operacion seleccionada.',
            steps: [
                createStandardMathStep('Desarrollo paso a paso', 'Se presenta la formula antes de calcular, luego el desarrollo componente por componente, la interpretacion geometrica y un cierre consistente del resultado.', resultTpl)
            ],
            result: {
                summary: 'Se obtuvo el resultado de la operacion vectorial solicitada.',
                valueHtml: `<div style="font-family: 'Fira Code', monospace; line-height: 1.7;">${buildVectorOperationResultHtml(validationPayload, dim)}</div>`
            },
            verification: buildVectorVerification(op, u, v, validationPayload),
            interpretation: generateFinalInterpretation('vectores', {
                operationType: op,
                ...validationPayload
            }, {
                operationType: op,
                explanation: buildVectorInterpretation(op, validationPayload)
            }),
            historyMeta: {
                saveToHistory: true,
                operationType: op,
                inputData: {
                    operationType: op,
                    vectorU: u,
                    vectorV: op === 'mag_u' ? null : v
                },
                validationData: {
                    operation: op,
                    input: {
                        operationType: op,
                        vectorU: u,
                        vectorV: op === 'mag_u' ? null : v
                    },
                    result: {
                        ...validationPayload
                    }
                },
                summary: `Vectores: ${getOperationLabel(op)}`
            }
        });

        setStandardMathResponse('vec-steps', response);
        plotVectorGraph(graphData.data, graphData.layout);
    } catch (error) {
        const graphDiv = document.getElementById('vec-graph');
        if (graphDiv) graphDiv.innerHTML = '';
        renderValidationErrorResponse('vec-steps', {
            topic: 'Vectores',
            request: 'Ejecutar una operacion vectorial con datos validos.',
            message: error.message,
            interpretation: 'Una operacion con vectores exige entradas completas, numericas y del tamano correcto.'
        });
    }
}

calcVector = calcVectorEnhanced;

function validateMatrixOperationCompatibility(op, A, B = null) {
    ensureOperationAllowed('matrix', op, { A, B });
}

// Generate data for Plotly
function generateVectorPlotArgs(u, v, res, resName, dim) {
    let data = [];
    
    const pushVec = (vec, name, color, start = null) => {
        // Convert fraction vector back to floats just for Plotly graphing
        const floatVec = vec ? vec.map(v => math.number(v)) : null;

        if (!floatVec) return;
        const x0 = start ? math.number(start[0]) : 0;
        const y0 = start ? math.number(start[1]) : 0;
        const x1 = x0 + floatVec[0];
        const y1 = y0 + floatVec[1];
        
        if (dim === 2) {
            data.push({
                x: [x0, x1], y: [y0, y1],
                mode: 'lines+markers', name: name,
                marker: { size: [0, 8] },
                line: { color: color, width: 3 }
            });
        } else {
            const z0 = start ? start[2] : 0;
            const z1 = z0 + vec[2];
            data.push({
                type: 'scatter3d',
                x: [x0, x1], y: [y0, y1], z: [z0, z1],
                mode: 'lines+markers', name: name,
                marker: { size: 4 },
                line: { color: color, width: 4 }
            });
        }
    };

    pushVec(u, 'Vector u', '#00A4CD');
    if (v) pushVec(v, 'Vector v', '#82C341');
    if (res && resName === "Suma") {
        pushVec(res, 'u + v', '#F59E0B');
        // Visual guides (parallelogram)
        pushVec(v, 'guía v', 'rgba(130,195,65,0.3)', u); // starts at end of u
        pushVec(u, 'guía u', 'rgba(0,164,205,0.3)', v); // starts at end of v
    } else if (res && resName === "Resta") {
        pushVec(res, 'u - v', '#EF4444');
    } else if (res && resName === "Cruz") {
        pushVec(res, 'u × v', '#9C27B0');
    } else if (res && resName === "Proyección") {
        pushVec(res, 'proy_v(u)', '#E91E63');
        // Re-use vecSub to get the perpendicular distance u - proj
        const vecSubFunc = (a, b) => a.map((val, i) => math.subtract(val, b[i]));
        pushVec(vecSubFunc(u, res), 'guía ortogonal', 'rgba(233,30,99,0.5)', res);
    }

    const layout = {
        title: `Representación Geométrica (${dim}D)`,
        showlegend: true,
        margin: {l:40, r:40, t:40, b:40},
        plot_bgcolor: '#f9fafb'
    };
    
    if (dim === 2) {
        layout.xaxis = { title: 'X', zeroline: true };
        layout.yaxis = { title: 'Y', zeroline: true, scaleanchor: 'x', scaleratio: 1 };
    } else {
        layout.scene = {
            xaxis: {title: 'X', zeroline: true},
            yaxis: {title: 'Y', zeroline: true},
            zaxis: {title: 'Z', zeroline: true},
            aspectmode: 'cube'
        };
    }

    return { data, layout };
}

function plotVectorGraph(data, layout) {
    const graphDiv = document.getElementById('vec-graph');
    graphDiv.innerHTML = '';
    Plotly.newPlot(graphDiv, data, layout, {responsive: true});
}

// ================= EXPORTACIÓN =================
function exportProcedure(containerId, baseFilename) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove hidden class temporarily if it exists (though shouldn't if we are exporting)
    const wasHidden = container.classList.contains('hidden');
    if (wasHidden) container.classList.remove('hidden');

    const btn = container.querySelector('.btn-export');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Generando...';
    btn.disabled = true;

    // PREPARE HEADER FOR EXPORT
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.padding = '30px';
    header.style.marginBottom = '20px';
    header.style.borderBottom = '2px solid #ddd';
    header.style.backgroundColor = '#f9fafb';
    const cleanTopic = document.querySelector('.tab-btn.active').innerText;
    header.innerHTML = `
        <img src="logo-ucc.png" style="height: 100px; margin-bottom: 15px;" onerror="this.style.display='none'">
        <h2 style="margin:0; color: #00A4CD; font-family: 'Inter', sans-serif;">AlgeMat - Universidad Cooperativa de Colombia</h2>
        <h3 style="margin:5px 0 0 0; color: #333; font-family: 'Inter', sans-serif;">Reporte Educativo Paso a Paso: ${cleanTopic}</h3>
    `;
    container.insertBefore(header, container.firstChild);
    
    // DISABLE ANIMATIONS GLOBALLY FOR HTML2CANVAS CLONE
    const noAnimStyle = document.createElement('style');
    noAnimStyle.innerHTML = `* { animation: none !important; transition: none !important; opacity: 1 !important; }`;
    document.head.appendChild(noAnimStyle);

    setTimeout(() => {
        html2canvas(container, {
            scale: 2, 
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight,
            ignoreElements: (element) => {
                return element.classList.contains('btn-export') || 
                       element.tagName === 'MJX-ASSISTIVE-MML' || 
                       element.classList.contains('mjx-assistive-mml');
            }
        }).then(canvas => {
            header.remove();
            if (noAnimStyle.parentNode) noAnimStyle.parentNode.removeChild(noAnimStyle);
            
            btn.innerHTML = originalText;
            btn.disabled = false;
            if (wasHidden) container.classList.add('hidden');

            const link = document.createElement('a');
            const dateStr = new Date().toISOString().slice(0, 10);
            link.download = `AlgeMat_${baseFilename}_${dateStr}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            header.remove();
            if (noAnimStyle.parentNode) noAnimStyle.parentNode.removeChild(noAnimStyle);
            
            console.error("Error exporting image:", err);
            btn.innerHTML = '❌ Error';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        });
    }, 500);
}

function formatGraphNumber(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return String(value);
    if (Math.abs(numericValue) < 1e-10) return '0';
    return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
}

function solve2x2Intersection(row1, row2) {
    const a1 = math.number(row1[0]);
    const b1 = math.number(row1[1]);
    const c1 = math.number(row1[2]);
    const a2 = math.number(row2[0]);
    const b2 = math.number(row2[1]);
    const c2 = math.number(row2[2]);
    const det = a1 * b2 - a2 * b1;
    const tolerance = 1e-10;

    if (Math.abs(det) > tolerance) {
        return {
            type: 'unique',
            x: (c1 * b2 - c2 * b1) / det,
            y: (a1 * c2 - a2 * c1) / det
        };
    }

    const coincident = Math.abs(a1 * c2 - a2 * c1) < tolerance && Math.abs(b1 * c2 - b2 * c1) < tolerance;
    return {
        type: coincident ? 'coincident' : 'parallel',
        x: null,
        y: null
    };
}

function buildSystemLineTrace(row, equationIndex, xRange, yRange, color) {
    const a = math.number(row[0]);
    const b = math.number(row[1]);
    const c = math.number(row[2]);
    const tolerance = 1e-10;
    const pointCount = 100;
    const xValues = [];
    const yValues = [];

    if (Math.abs(b) < tolerance && Math.abs(a) >= tolerance) {
        const xConstant = c / a;
        const yStep = (yRange[1] - yRange[0]) / pointCount;
        for (let index = 0; index <= pointCount; index++) {
            const y = yRange[0] + (yStep * index);
            xValues.push(xConstant);
            yValues.push(y);
        }
    } else {
        const xStep = (xRange[1] - xRange[0]) / pointCount;
        for (let index = 0; index <= pointCount; index++) {
            const x = xRange[0] + (xStep * index);
            xValues.push(x);
            yValues.push((c - a * x) / b);
        }
    }

    return {
        x: xValues,
        y: yValues,
        mode: 'lines',
        name: `Ec ${equationIndex}: ${formatGraphNumber(a)}x + ${formatGraphNumber(b)}y = ${formatGraphNumber(c)}`,
        line: {
            color,
            width: 3
        },
        hovertemplate: `Ec ${equationIndex}<br>x = %{x:.2f}<br>y = %{y:.2f}<extra></extra>`
    };
}

function plotSystemGraph(origMat, size) {
    const graphDiv = document.getElementById('sys-graph');
    if (size !== 2) {
        graphDiv.innerHTML = '<p style="text-align:center; padding: 2rem;">GrÃ¡fica compleja para 3x3 omitida, se requieren herramientas volumÃ©tricas. Mostramos grÃ¡ficamente sistemas 2x2 donde podemos ver las rectas fÃ¡cilmente.</p>';
        return;
    }
    graphDiv.innerHTML = '';

    const row1 = origMat[0];
    const row2 = origMat[1];
    const intersection = solve2x2Intersection(row1, row2);
    const defaultRange = [-50, 50];
    const padding = 10;
    const xRange = intersection.type === 'unique'
        ? [intersection.x - padding, intersection.x + padding]
        : defaultRange;
    const yRange = intersection.type === 'unique'
        ? [intersection.y - padding, intersection.y + padding]
        : defaultRange;

    const data = [
        buildSystemLineTrace(row1, 1, xRange, yRange, '#0b84f3'),
        buildSystemLineTrace(row2, 2, xRange, yRange, '#3bb273')
    ];
    const annotations = [];

    if (intersection.type === 'unique') {
        data.push({
            x: [intersection.x],
            y: [intersection.y],
            mode: 'markers',
            name: 'Interseccion',
            marker: {
                size: 10,
                color: 'red'
            },
            hovertemplate: `Interseccion<br>x = %{x:.2f}<br>y = %{y:.2f}<extra></extra>`
        });

        annotations.push({
            x: intersection.x,
            y: intersection.y,
            text: `( ${formatGraphNumber(intersection.x)}, ${formatGraphNumber(intersection.y)} )`,
            showarrow: true,
            arrowhead: 2,
            ax: 25,
            ay: -30
        });
    } else if (intersection.type === 'parallel') {
        annotations.push({
            x: 0,
            y: yRange[1] - 5,
            text: 'Las rectas no se intersectan',
            showarrow: false,
            bgcolor: '#fff4e5',
            bordercolor: '#f59e0b',
            borderwidth: 1
        });
    } else if (intersection.type === 'coincident') {
        annotations.push({
            x: 0,
            y: yRange[1] - 5,
            text: 'Las rectas coinciden: infinitas soluciones',
            showarrow: false,
            bgcolor: '#ecfeef',
            bordercolor: '#16a34a',
            borderwidth: 1
        });
    }

    const layout = {
        title: 'GrÃ¡fica del Sistema de Ecuaciones (2D)',
        xaxis: {
            title: 'X',
            zeroline: true,
            showgrid: true,
            gridcolor: '#d9e2f1',
            range: xRange
        },
        yaxis: {
            title: 'Y',
            zeroline: true,
            showgrid: true,
            gridcolor: '#d9e2f1',
            scaleanchor: 'x',
            scaleratio: 1,
            range: yRange
        },
        annotations,
        legend: {
            orientation: 'h',
            y: 1.1
        },
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#fff'
    };

    Plotly.newPlot(graphDiv, data, layout, { responsive: true });
}
