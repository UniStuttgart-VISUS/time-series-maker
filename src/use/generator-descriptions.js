const GENERATOR_DESCRIPTIONS = Object.freeze({
    CONSTANT: "Produces a constant <b>value</b> for each sample",
    TREND: "Produces a linear trend that intersects the x-axis at a relative <b>position</b> ([0,1]) and with the specified <b>slope</b> (!= 0)",
    OUTLIER: "Produces a zero for each sample except those at the relative <b>position</b> ([0,1]) and its neighborhood specified through <b>width</b>",
    RNG_AWGN: "Produces a timeseries by sampling an additive white gaussian noise function <i>samples</i> times, where <b>sigma</b> (> 0) defines the absolute scale of these values",
    RNG_AWLN: "Produces a timeseries by sampling an additive white laplacian noise function <i>samples</i> times, where <b>sigma</b> (> 0) defines the absolute scale of these values",
    RNG_AWUN: "Produces a timeseries by sampling an additive white uniform noise function <i>samples</i> times, where <b>sigma</b> (> 0) defines the absolute scale of these values",
    RNG_UNIFORM: "Produces random values that are uniformally distributed in [<b>min</b>, <b>max</b>]",
    RNG_NORMAL: "Produces random values that are normally distributed, with the mean at <b>mu</b> and standard deviation <b>sigma</b> (> 0)",
    WAVE_SINE: "Samples a sine wave with the given <b>period</b> (integer > 1), <b>amplitude</b> (> 0) and <b>offset</b> (integer > 0)",
    WAVE_COSINE: "Samples a cosine wave with the given <b>period</b> (integer > 1), <b>amplitude</b> (> 0) and <b>offset</b> (integer > 0)",
    PDF_NORMAL: "Samples a normal distribution PDF, with the <b>mean</b>, standard deviation <b>std</b> (> 0) and given <b>magnitude</b> (> 0) at <i>samples</i> points",
})

export { GENERATOR_DESCRIPTIONS as default }