const GENERATOR_DESCRIPTIONS = Object.freeze({
    CONSTANT: "Produces a constant <b>value</b> for each sample.",
    TREND: "Produces a linear trend that intersects the x-axis at a relative <b>position</b> and with the specified <b>slope</b>.",
    OUTLIER: "Produces a 0 for each sample except those at the relative <b>position</b> and its neighborhood specified through <b>width</b> with the given <b>magnitude</b>.",
    RNG_AWGN: "Samples an additive white gaussian noise function <i>N</i> times, where <b>sigma</b> defines the absolute scale of these values.",
    RNG_AWLN: "Produces a timeseries by sampling an additive white laplacian noise function <i>N</i> times, where <b>sigma</b> defines the absolute scale of these values.",
    RNG_AWUN: "Produces a timeseries by sampling an additive white uniform noise function <i>N</i> times, where <b>sigma</b> defines the absolute scale of these values.",
    RNG_UNIFORM: "Produces random values that are uniformly distributed in [<b>minSupport</b>, <b>maxSupport</b>].",
    RNG_NORMAL: "Produces random values that are normally distributed, with the mean at <b>mu</b> and standard deviation <b>std</b>.",
    WAVE_SINE: "Samples a sine wave with the given <b>period</b>, <b>amplitude</b> and <b>offset</b>.",
    WAVE_COSINE: "Samples a cosine wave with the given <b>period</b>, <b>amplitude</b> and <b>offset</b>.",
    PDF_NORMAL: "Samples a normal PDF, with the specified <b>mean</b>, standard deviation <b>std</b> and <b>magnitude</b> at <i>N</i> points in the range [<b>xMin</b>, <b>xMax</b>].",
    PDF_ARCSINE: "Samples a arcsine PDF at <i>N</i> points in the range [<b>xMin</b>, <b>xMax</b>].",
    PDF_CHI_SQUARED: "Samples a chi-squared PDF at <i>N</i> points in the range [<b>xMin</b>, <b>xMax</b>].",
    CDF_NORMAL: "Samples a normal CDF, with the specified <b>mean</b>, standard deviation <b>std</b> and <b>magnitude</b> at <i>N</i> points in the range [<b>xMin</b>, <b>xMax</b>].",
    CDF_ARCSINE: "Samples a arcsine CDF at <i>N</i> points in the range [<b>xMin</b>, <b>xMax</b>].",
    CDF_CHI_SQUARED: "Samples a chi-squared CDF at <i>N</i> points in the range [<b>xMin</b>, <b>xMax</b>].",
})

export { GENERATOR_DESCRIPTIONS as default }