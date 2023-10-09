import filled from '@stdlib/array/filled';
import linspace from '@stdlib/array/linspace';
import array2iterator from '@stdlib/array/to-iterator'
import stats from '@stdlib/stats/base';
import random from '@stdlib/random/base';
import simulate from '@stdlib/simulate/iter'
import GENERATOR_DEFAULTS from './generator-defaults';
import GENERATOR_TYPES from './generator-types';

export default class Generator {

    constructor(type="CONSTANT", seed=42) {
        const defaults = GENERATOR_DEFAULTS[type in GENERATOR_DEFAULTS ? type : "CONSTANT"]
        this.key = defaults.key;
        this.name = defaults.name;
        this.title = defaults.title;
        this.prefab = defaults.prefab;
        this.type = defaults.type;
        this.seed = seed;
        this.seedRequired = defaults.seedRequired;
        this.options = {};
        for (const key in defaults.options) {
            this.options[key] = defaults.options[key].copy()
        }
    }

    static makePDFFactory(name, options) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return stats.dists.normal.pdf.factory(getOpt("mean"), getOpt("std"));
            case "arcsine":
                return stats.dists.arcsine.pdf.factory(getOpt("minSupport"), getOpt("maxSupport"))
            case "chi-squared":
                return stats.dists.chisquare.pdf.factory(getOpt("k"))
        }
    }
    static makeCDFFactory(name, options) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return stats.dists.normal.cdf.factory(getOpt("mean"), getOpt("std"));
        }
    }
    static makeRandomFactory(name, options, seed) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return random.normal.factory(getOpt("mean"), getOpt("std"), { seed: seed });
            case "lognomal":
                return random.lognormal.factory(getOpt("mean"), getOpt("std"), { seed: seed });
            case "poisson":
                return random.poisson.factory(getOpt("lambda"), { seed: seed });
            case "geometric":
                return random.geometric.factory(getOpt("p"), { seed: seed });
            default:
            case "uniform":
                return random.uniform.factory(getOpt("minSupport"), getOpt("maxSupport"), { seed: seed });
        }
    }

    isValid() {
        const ops = Object.keys(this.options);
        return ops.every(o => this.options[o].validator())
    }

    getOpt(name) {
        return this.options[name].value;
    }

    generate(number) {
        switch (this.type) {
            default:
            case GENERATOR_TYPES.PREFAB:
                switch (this.name) {
                    case "trend": {
                        const pos = Math.round(this.getOpt("position") * number);
                        const slope = this.getOpt("slope");
                        return linspace(-pos, number-pos, number).map(d => d*slope)
                    }
                    case "outlier": {
                        const vals = filled(0, number)
                        const pos = Math.round(this.getOpt("position") * number);
                        const width = this.getOpt("width")
                        const magnitude = this.getOpt("magnitude");
                        const back = width > 1 ? Math.floor(width * 0.5) : 0;
                        const forward = width > 1 ? Math.floor((width-1) * 0.5) : 0;
                        for (let i = pos-back; i >= 0 && i < number && i <= pos+forward; i++) {
                            vals[i] = magnitude;
                        }
                        return vals;
                    }
                    default:
                    case "constant":
                        return filled(this.getOpt("value"), number)
                }

            case GENERATOR_TYPES.CDF: {
                const factory = Generator.makeCDFFactory(this.name, this.options);
                const xMin = this.getOpt("xMin");
                const xMax = this.getOpt("xMax")
                console.assert(xMin < xMax, "min must be smaller than max")
                return linspace(xMin, xMax, number).map(factory);
            }

            case GENERATOR_TYPES.PDF: {
                const factory = Generator.makePDFFactory(this.name, this.options);
                switch (this.name) {
                    case "arcsine": {
                        const xMin = this.getOpt("minSupport");
                        const xMax = this.getOpt("maxSupport")
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(
                            xMin + this.options["minSupport"].step,
                            xMax - this.options["maxSupport"].step,
                            number
                        ).map(factory);
                    }
                    default: {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax")
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(factory);
                    }
                }
            }

            case GENERATOR_TYPES.WAVE:
                switch (this.name) {
                    case "sine": {
                        const iter = simulate.iterSineWave({
                            seed: this.seed,
                            period: this.getOpt("period"),
                            amplitude: this.getOpt("amplitude"),
                            offset: this.getOpt("offset"),
                        })
                        return filled(0, number).map(() => iter.next().value);
                    }
                    case "cosine": {
                        const iter = simulate.iterCosineWave({
                            seed: this.seed,
                            period: this.getOpt("period"),
                            amplitude: this.getOpt("amplitude"),
                            offset: this.getOpt("offset"),
                        })
                        return filled(0, number).map(() => iter.next().value);
                    }
                }
            case GENERATOR_TYPES.RNG: {
                switch (this.name) {
                    case "awgn": {
                        const arr = filled(0, number);
                        const iter = simulate.iterawgn(array2iterator(arr), this.getOpt("sigma"), { seed: this.seed })
                        return arr.map(() => iter.next().value);
                    }
                    case "awln": {
                        const arr = filled(0, number);
                        const iter = simulate.iterawln(array2iterator(arr), this.getOpt("sigma"), { seed: this.seed })
                        return arr.map(() => iter.next().value);
                    }
                    case "awun": {
                        const arr = filled(0, number);
                        const iter = simulate.iterawun(array2iterator(arr), this.getOpt("sigma"), { seed: this.seed })
                        return arr.map(() => iter.next().value);
                    }
                    default:
                        const factory = Generator.makeRandomFactory(this.name, this.options, this.seed);
                        return linspace(0, number, number).map(() => factory());
                }
            }
        }
    }
}
