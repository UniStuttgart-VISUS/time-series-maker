import GeneratorOption from "./generator-option.js"
import GENERATOR_TYPES from "./generator-types.js";

const GENERATOR_DEFAULTS = {
    CONSTANT: {
        key: "CONSTANT",
        name: "constant",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Constant",
        seedRequired: false,
        options: { value: new GeneratorOption("value", 1, { step: 1 }) }
    },
    TREND: {
        key: "TREND",
        name: "trend",
        type: GENERATOR_TYPES.SPECIAL,
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
        type: GENERATOR_TYPES.SPECIAL,
        title: "Outlier",
        seedRequired: false,
        options: {
            position: new GeneratorOption("position", 0.5, { min: 0, max: 1, step: 0.01 }),
            width: new GeneratorOption("width", 1, { min: 1, step: 1 }),
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    DAY: {
        key: "DAY",
        name: "day",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Day",
        seedRequired: false,
        options: {
            day: new GeneratorOption("day", 1, { min: 1, max: 31, step: 1, validators: ["INTEGER"] }),
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    WEEK: {
        key: "WEEK",
        name: "week",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Week",
        seedRequired: false,
        options: {
            week: new GeneratorOption("week", 1, { min: 1, max: 53, step: 1, validators: ["INTEGER"] }),
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    MONTH: {
        key: "MONTH",
        name: "month",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Month",
        seedRequired: false,
        options: {
            month: new GeneratorOption("month", 1, { min: 1, max: 12, step: 1, validators: ["INTEGER"] }),
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    DAILY: {
        key: "DAILY",
        name: "daily",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Daily",
        seedRequired: false,
        options: {
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    WEEKLY: {
        key: "WEEKLY",
        name: "weekly",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Weekly",
        seedRequired: false,
        options: {
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    MONTHLY: {
        key: "MONTHLY",
        name: "monthly",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Monthly",
        seedRequired: false,
        options: {
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    WORK_WEEK: {
        key: "WORK_WEEK",
        name: "workweek",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Work Week",
        seedRequired: false,
        options: {
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    WEEKEND: {
        key: "WEEKEND",
        name: "weekend",
        type: GENERATOR_TYPES.SPECIAL,
        title: "Weekend",
        seedRequired: false,
        options: {
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },

    // common math functions
    MATH_EXP: {
        key: "MATH_EXP",
        name: "exp",
        title: "Natural Exponential",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            xMin: new GeneratorOption("xMin", 0, { step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_POW: {
        key: "MATH_POW",
        name: "pow",
        title: "Exponential",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            base: new GeneratorOption("base", 2, { min: 0, step: 1, validators: ["POSITIVE", "NOT_ZERO"] }),
            xMin: new GeneratorOption("xMin", 0, { step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_LN: {
        key: "MATH_LN",
        name: "ln",
        title: "Natural Logarithm",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            xMin: new GeneratorOption("xMin", 1, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_LOG: {
        key: "MATH_LOG",
        name: "log",
        title: "Logarithm",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            base: new GeneratorOption("base", 2, { min: 0, step: 1, validators: ["POSITIVE", "NOT_ZERO"] }),
            xMin: new GeneratorOption("xMin", 1, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_SQRT: {
        key: "MATH_SQRT",
        name: "sqrt",
        title: "Square Root",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            xMin: new GeneratorOption("xMin", 1, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_INV: {
        key: "MATH_INV",
        name: "inv",
        title: "Multiplical Inverse",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            xMin: new GeneratorOption("xMin", 1, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_COS: {
        key: "MATH_COS",
        name: "cos",
        title: "Cosine",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            xMin: new GeneratorOption("xMin", 0, { step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_SINE: {
        key: "MATH_SINE",
        name: "sine",
        title: "Sine",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            xMin: new GeneratorOption("xMin", 0, { step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    MATH_TAN: {
        key: "MATH_TAN",
        name: "tan",
        title: "Tangent",
        type: GENERATOR_TYPES.MATH,
        seedRequired: false,
        options: {
            xMin: new GeneratorOption("xMin", 0, { step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { step: 1, validators: ["NOT_ZERO", "INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
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
    RNG_OUTLIER: {
        key: "RNG_OUTLIER",
        name: "outlier",
        type: GENERATOR_TYPES.RNG,
        title: "Random Outlier",
        seedRequired: true,
        options: {
            count: new GeneratorOption("count", 1, { min: 1, step: 1 }),
            width: new GeneratorOption("width", 1, { min: 1, step: 1 }),
            value: new GeneratorOption("value", 1, { step: 1 }),
        }
    },
    RNG_UNIFORM: {
        key: "RNG_UNIFORM",
        name: "uniform",
        title: "Random Uniform",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            minSupport: new GeneratorOption("minSupport", -1),
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
    RNG_ARCSINE: {
        key: "RNG_ARCSINE",
        name: "arcsine",
        title: "Random Arcsine",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            minSupport: new GeneratorOption("minSupport", -1),
            maxSupport: new GeneratorOption("maxSupport", 1),
        }
    },
    RNG_CHI_SQUARED: {
        key: "RNG_CHI_SQUARED",
        name: "chi-squared",
        title: "Random Chi-Squared",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            k: new GeneratorOption("k", 2, { min: 2, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    RNG_STUDENTS_T: {
        key: "RNG_STUDENTS_T",
        name: "students-t",
        title: "Random Student's T",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            dof: new GeneratorOption("dof", 1, { min: 1, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    RNG_POISSON: {
        key: "RNG_POISSON",
        name: "poisson",
        title: "Random Poisson",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            lambda: new GeneratorOption("lambda", 1, { min: 1, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    RNG_BERNOULLI: {
        key: "RNG_BERNOULLI",
        name: "bernoulli",
        title: "Random Bernoulli",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            p: new GeneratorOption("p", 0.1, { min: 0, step: 0.01, max: 1 }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    RNG_BINOMIAL: {
        key: "RNG_BINOMIAL",
        name: "binomial",
        title: "Random Binomial",
        type: GENERATOR_TYPES.RNG,
        seedRequired: true,
        options: {
            n: new GeneratorOption("n", 1, { min: 0, step: 1, validators: ["INTEGER"] }),
            p: new GeneratorOption("p", 0.1, { min: 0, step: 0.01, max: 1 }),
            scale: new GeneratorOption("scale", 1),
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
            amplitude: new GeneratorOption("amplitude", 1, { min: 0, step: 1, validators: ["POSITIVE"] }),
            offset: new GeneratorOption("offset", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
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
            amplitude: new GeneratorOption("amplitude", 1, { min: 0, step: 1, validators: ["POSITIVE"] }),
            offset: new GeneratorOption("offset", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    WAVE_PULSE: {
        key: "WAVE_PULSE",
        name: "pulse",
        title: "Pulse Wave",
        type: GENERATOR_TYPES.WAVE,
        seedRequired: false,
        options: {
            period: new GeneratorOption("period", 10, { min: 1, step: 1, validators: ["INTEGER"] }),
            duration: new GeneratorOption("duration", 5, { min: 3, step: 1, validators: ["INTEGER"] }),
            offset: new GeneratorOption("offset", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            minAmplitude: new GeneratorOption("minAmplitude", -1),
            maxAmplitude: new GeneratorOption("maxAmplitude", 1),
        }
    },
    WAVE_BARTLETT_PULSE: {
        key: "WAVE_BARTLETT_PULSE",
        name: "bartlett",
        title: "Bartlett Pulse",
        type: GENERATOR_TYPES.WAVE,
        seedRequired: false,
        options: {
            period: new GeneratorOption("period", 50, { min: 2, step: 1, validators: ["INTEGER"] }),
            duration: new GeneratorOption("duration", 50, { min: 2, step: 1, validators: ["INTEGER"] }),
            amplitude: new GeneratorOption("amplitude", 1, { min: 0, step: 1, validators: ["POSITIVE"] }),
            offset: new GeneratorOption("offset", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    WAVE_SAWTOOTH: {
        key: "WAVE_SAWTOOTH",
        name: "sawtooth",
        title: "Sawtooth Wave",
        type: GENERATOR_TYPES.WAVE,
        seedRequired: false,
        options: {
            period: new GeneratorOption("period", 10, { min: 2, step: 1, validators: ["INTEGER"] }),
            amplitude: new GeneratorOption("amplitude", 1, { min: 0, step: 1, validators: ["POSITIVE"] }),
            offset: new GeneratorOption("offset", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
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
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
        }
    },
    PDF_ARCSINE: {
        key: "PDF_ARCSINE",
        name: "arcsine",
        type: GENERATOR_TYPES.PDF,
        title: "PDF Arcsine",
        seedRequired: false,
        options: {
            minSupport: new GeneratorOption("minSupport", -1),
            maxSupport: new GeneratorOption("maxSupport", 1),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
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
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    PDF_STUDENTS_T: {
        key: "PDF_STUDENTS_T",
        name: "students-t",
        title: "PDF Student's T",
        type: GENERATOR_TYPES.PDF,
        seedRequired: false,
        options: {
            dof: new GeneratorOption("dof", 1, { min: 1, step: 1, validators: ["INTEGER"] }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
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
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
        }
    },
    CDF_ARCSINE: {
        key: "CDF_ARCSINE",
        name: "arcsine",
        type: GENERATOR_TYPES.CDF,
        title: "CDF Arcsine",
        seedRequired: false,
        options: {
            minSupport: new GeneratorOption("minSupport", -1),
            maxSupport: new GeneratorOption("maxSupport", 1),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
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
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    CDF_STUDENTS_T: {
        key: "CDF_STUDENTS_T",
        name: "students-t",
        title: "CDF Student's T",
        type: GENERATOR_TYPES.CDF,
        seedRequired: false,
        options: {
            dof: new GeneratorOption("dof", 1, { min: 1, step: 1, validators: ["INTEGER"] }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    CDF_POISSON: {
        key: "CDF_POISSON",
        name: "poisson",
        title: "CDF Poisson",
        type: GENERATOR_TYPES.CDF,
        seedRequired: false,
        options: {
            lambda: new GeneratorOption("lambda", 1, { min: 1, step: 1, validators: ["INTEGER"] }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    CDF_BERNOULLI: {
        key: "CDF_BERNOULLI",
        name: "bernoulli",
        title: "CDF Bernoulli",
        type: GENERATOR_TYPES.CDF,
        seedRequired: false,
        options: {
            p: new GeneratorOption("p", 0.1, { min: 0, step: 0.01, max: 1 }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
        }
    },
    CDF_BINOMIAL: {
        key: "CDF_BINOMIAL",
        name: "binomial",
        title: "CDF Binomial",
        type: GENERATOR_TYPES.CDF,
        seedRequired: false,
        options: {
            n: new GeneratorOption("n", 1, { min: 0, step: 1, validators: ["INTEGER"] }),
            p: new GeneratorOption("p", 0.1, { min: 0, step: 0.01, max: 1 }),
            xMin: new GeneratorOption("xMin", 0, { min: 0, step: 1, validators: ["INTEGER"] }),
            xMax: new GeneratorOption("xMax", 10, { min: 0, step: 1, validators: ["INTEGER"] }),
            scale: new GeneratorOption("scale", 1),
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
