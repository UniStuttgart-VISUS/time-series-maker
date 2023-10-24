import GeneratorOption from "./generator-option.js"
import GENERATOR_TYPES from "./generator-types.js";

const GENERATOR_DEFAULTS = {
    CONSTANT: {
        key: "CONSTANT",
        name: "constant",
        type: GENERATOR_TYPES.PREFAB,
        title: "Constant",
        seedRequired: false,
        options: { value: new GeneratorOption("value", 0, { step: 0.1 }) }
    },
    TREND: {
        key: "TREND",
        name: "trend",
        type: GENERATOR_TYPES.PREFAB,
        title: "Linear Trend",
        seedRequired: false,
        options: {
            position: new GeneratorOption("position", 0.5, { min: 0, max: 1, step: 0.01 }),
            slope: new GeneratorOption("slope", 0.1, { validators: ["NOT_ZERO"] }),
        }
    },
    OUTLIER: {
        key: "OUTLIER",
        name: "outlier",
        type: GENERATOR_TYPES.PREFAB,
        title: "Outlier",
        seedRequired: false,
        options: {
            position: new GeneratorOption("position", 0.5, { min: 0, max: 1, step: 0.01 }),
            width: new GeneratorOption("width", 1, { min: 1, step: 1 }),
            magnitude: new GeneratorOption("magnitude", 0.5, { min: 0, step: 0.01, validators: ["POSITIVE"] }),
        }
    },

    // random numbers / noise
    RNG_AWGN: {
        key: "RNG_AWGN",
        name: "awgn",
        title: "Additive White Gaussian Noise",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            sigma: new GeneratorOption("sigma", 0.1, { min: 0, validators: ["NOT_ZERO", "POSITIVE"] }),
        }
    },
    RNG_AWLN: {
        key: "RNG_AWLN",
        name: "awln",
        title: "Additive White Laplacian Noise",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            sigma: new GeneratorOption("sigma", 0.1, { min: 0, validators: ["NOT_ZERO", "POSITIVE"] }),
        }
    },
    RNG_AWUN: {
        key: "RNG_AWUN",
        name: "awun",
        title: "Additive White Uniform Noise",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            sigma: new GeneratorOption("sigma", 0.1, { min: 0, validators: ["NOT_ZERO", "POSITIVE"] }),
        }
    },

    RNG_UNIFORM: {
        key: "RNG_UNIFORM",
        name: "uniform",
        title: "Random Uniform",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            minSupport: new GeneratorOption("minSupport", 0),
            maxSupport: new GeneratorOption("maxSupport", 1),
        }
    },

    RNG_NORMAL: {
        key: "RNG_NORMAL",
        name: "normal",
        title: "Random Normal",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            mean: new GeneratorOption("mean", 0),
            std: new GeneratorOption("std", 0.1, { min: 0, validators: ["NOT_ZERO"] }),
        }
    },

    // waves
    WAVE_SINE: {
        key: "WAVE_SINE",
        name: "sine",
        title: "Sine Wave",
        type: GENERATOR_TYPES.WAVE,
        seedRequired: false,
        options: {
            period: new GeneratorOption("period", 10, { min: 1, step: 1, validators: ["INTEGER"] }),
            amplitude: new GeneratorOption("amplitude", 1, { min: 0.1, step: 0.1, validators: ["POSITIVE"] }),
            offset: new GeneratorOption("offset", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
        }
    },
    WAVE_COSINE: {
        key: "WAVE_COSINE",
        name: "cosine",
        title: "Cosine Wave",
        type: GENERATOR_TYPES.WAVE,
        seedRequired: false,
        options: {
            period: new GeneratorOption("period", 10, { min: 1, step: 1, validators: ["INTEGER"] }),
            amplitude: new GeneratorOption("amplitude", 1, { min: 0.1, step: 0.1, validators: ["POSITIVE"] }),
            offset: new GeneratorOption("offset", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
        }
    },

    // pdfs
    PDF_NORMAL: {
        key: "PDF_NORMAL",
        name: "normal",
        type: GENERATOR_TYPES.PDF,
        title: "PDF Normal",
        seedRequired: false,
        options: {
            mean: new GeneratorOption("mean", 0),
            std: new GeneratorOption("std", 0.1, { min: 0, validators: ["NOT_ZERO"] }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 0.1 }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 0.1 }),
        }
    },
    PDF_ARCSINE: {
        key: "PDF_ARCSINE",
        name: "arcsine",
        type: GENERATOR_TYPES.PDF,
        title: "PDF Arcsine",
        seedRequired: false,
        options: {
            minSupport: new GeneratorOption("minSupport", 0),
            maxSupport: new GeneratorOption("maxSupport", 1),
        }
    },
    PDF_CHI_SQUARED: {
        key: "PDF_CHI_SQUARED",
        name: "chi-squared",
        type: GENERATOR_TYPES.PDF,
        title: "PDF Chi-squared",
        seedRequired: false,
        options: {
            k: new GeneratorOption("k", 2, { min: 2, step: 1, validators: ["INTEGER"] }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 0.1 }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 0.1 }),
        }
    },

    // cdfs
    CDF_NORMAL: {
        key: "CDF_NORMAL",
        name: "normal",
        type: GENERATOR_TYPES.CDF,
        title: "CDF Normal",
        seedRequired: false,
        options: {
            mean: new GeneratorOption("mean", 0),
            std: new GeneratorOption("std", 0.1, { min: 0, validators: ["NOT_ZERO"] }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 0.1 }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 0.1 }),
        }
    },
    CDF_ARCSINE: {
        key: "CDF_ARCSINE",
        name: "arcsine",
        type: GENERATOR_TYPES.CDF,
        title: "CDF Arcsine",
        seedRequired: false,
        options: {
            minSupport: new GeneratorOption("minSupport", 0),
            maxSupport: new GeneratorOption("maxSupport", 1),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 0.1 }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 0.1 }),
        }
    },
    CDF_CHI_SQUARED: {
        key: "CDF_CHI_SQUARED",
        name: "chi-squared",
        type: GENERATOR_TYPES.CDF,
        title: "CDF Chi-squared",
        seedRequired: false,
        options: {
            k: new GeneratorOption("k", 2, { min: 2, step: 1, validators: ["INTEGER"] }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 0.1 }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 0.1 }),
        }
    },
};

const GENERATOR_DEFAULT_NAMES = Object.keys(GENERATOR_DEFAULTS).map(d => ({
    key: d,
    name: GENERATOR_DEFAULTS[d].name,
    title: GENERATOR_DEFAULTS[d].title,
    type: GENERATOR_DEFAULTS[d].type,
}));

export { GENERATOR_DEFAULTS as default, GENERATOR_DEFAULT_NAMES };
