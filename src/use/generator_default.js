const GENERATOR_DEFAULTS = {
    CONSTANT: {
        key: "CONSTANT",
        name: "constant",
        type: "prefab",
        title: "Constant",
        options: {
            value: {
                value: 0,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
        }
    },
    TREND: {
        key: "TREND",
        name: "trend",
        type: "prefab",
        title: "Linear Trend",
        options: {
            position: {
                value: 0,
                min: 0,
                max: 1,
                step: 0.01,
                validator: d => !(Number.isNaN(d) || d < 0 || d > 1)
            },
            slope: {
                value: 0.1,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !(Number.isNaN(d) || d === 0)
            },
        }
    },
    OUTLIER: {
        key: "OUTLIER",
        name: "outlier",
        type: "prefab",
        title: "Outlier",
        options: {
            position: {
                value: 0.5,
                min: 0,
                max: 1,
                step: 0.01,
                validator: d => !(Number.isNaN(d) || d < 0 || d > 1)
            },
            width: {
                value: 0.0125,
                min: 0.001,
                max: NaN,
                step: 0.001,
                validator: d => (!Number.isNaN(d) || d <= 0)
            },
            magnitude: {
                value: 1,
                min: 0.001,
                max: NaN,
                step: 0.001,
                validator: d => (!Number.isNaN(d) || d <= 0)
            },
        }
    },

    // pdfs
    PDF_UNIFORM: {
        key: "PDF_UNIFORM",
        name: "uniform",
        title: "PDF Uniform",
        type: "pdf",
        options: {
            min: {
                value: 0,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
            max: {
                value: 1,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
            magnitude: {
                value: 1,
                min: 0.1,
                max: NaN,
                step: 0.01,
                validator: d => (!Number.isNaN(d) || d <= 0)
            },
        }
    },
    PDF_NORMAL: {
        key: "PDF_NORMAL",
        name: "normal",
        type: "pdf",
        title: "PDF Normal",
        options: {
            mu: {
                value: 0,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
            sigma: {
                value: 1,
                min: 0.01,
                max: NaN,
                step: 0.01,
                validator: d => !(Number.isNaN(d) || d <= 0)
            },
            magnitude: {
                value: 1,
                min: 0.1,
                max: NaN,
                step: 0.01,
                validator: d => (!Number.isNaN(d) || d <= 0)
            },
        }
    },
    PDF_LOGNORMAL: {
        key: "PDF_LOGNORMAL",
        name: "lognormal",
        title: "PDF LogNormal",
        type: "pdf",
        options: {
            mean: {
                value: 0,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
            std: {
                value: 1,
                min: 0.01,
                max: NaN,
                step: 0.01,
                validator: d => !(Number.isNaN(d) || d <= 0)
            },
            magnitude: {
                value: 1,
                min: 0.1,
                max: NaN,
                step: 0.01,
                validator: d => (!Number.isNaN(d) || d <= 0)
            },
        }
    },

    // pmfs
    PMF_POISSON: {
        key: "PMF_POISSON",
        name: "poisson",
        title: "PMF Poisson",
        type: "pmf",
        options: {
            lambda: {
                value: 1,
                min: 1,
                max: NaN,
                step: 1,
                validator: d => !(Number.isNaN(d) || d <= 0)
            },
            magnitude: {
                value: 1,
                min: 0.1,
                max: NaN,
                step: 0.01,
                validator: d => (!Number.isNaN(d) || d <= 0)
            },
        }
    },
    PMF_GEOMETRIC: {
        key: "PMF_GEOMETRIC",
        name: "geometric",
        title: "PMF Geometric",
        type: "pmf",
        options: {
            p: {
                value: 0.5,
                min: 0.01,
                max: 1,
                step: 0.01,
                validator: d => !(Number.isNaN(d) || d < 0 || d > 1)
            },
            magnitude: {
                value: 1,
                min: 0.1,
                max: NaN,
                step: 0.01,
                validator: d => (!Number.isNaN(d) || d <= 0)
            },
        }
    },

    // random numbers / noise
    RNG_UNIFORM: {
        key: "RNG_UNIFORM",
        name: "uniform",
        title: "Random Uniform",
        type: "random",
        options: {
            min: {
                value: 0,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
            max: {
                value: 1,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
        }
    },

    RNG_NORMAL: {
        key: "RNG_NORMAL",
        name: "normal",
        title: "Random Normal",
        type: "random",
        options: {
            mu: {
                value: 0,
                min: NaN,
                max: NaN,
                step: 0.01,
                validator: d => !Number.isNaN(d)
            },
            sigma: {
                value: 1,
                min: 0.01,
                max: NaN,
                step: 0.01,
                validator: d => !(Number.isNaN(d) || d <= 0)
            },
        }
    },
};

const GEN_TYPES = Object.keys(GENERATOR_DEFAULTS).map(d => ({
    key: d,
    name: GENERATOR_DEFAULTS[d].name,
    title: GENERATOR_DEFAULTS[d].title,
}));

export { GENERATOR_DEFAULTS as default, GEN_TYPES };
