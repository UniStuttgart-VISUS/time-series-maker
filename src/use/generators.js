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

    static makeFactory(name, options) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return stats.dists.normal.pdf.factory(getOpt("mu"), getOpt("sigma"));
            case "lognomal":
                return stats.dists.lognormal.pdf.factory(getOpt("mu"), getOpt("sigma"));
            case "poisson":
                return stats.dists.poisson.pmf.factory(getOpt("lambda"));
            case "geometric":
                return stats.dists.geometric.pmf.factory(getOpt("p"));
            default:
            case "uniform":
                return stats.dists.uniform.pdf.factory(getOpt("min"), getOpt("max"));
        }
    }
    static makeRandomFactory(name, options, seed) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return random.normal.factory(getOpt("mu"), getOpt("sigma"), { seed: seed });
            case "lognomal":
                return random.lognormal.factory(getOpt("mu"), getOpt("sigma"), { seed: seed });
            case "poisson":
                return random.poisson.factory(getOpt("lambda"), { seed: seed });
            case "geometric":
                return random.geometric.factory(getOpt("p"), { seed: seed });
            default:
            case "uniform":
                return random.uniform.factory(getOpt("min"), getOpt("max"), { seed: seed });
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

            case GENERATOR_TYPES.PMF:
            case GENERATOR_TYPES.PDF: {
                const factory = Generator.makeFactory(this.name, this.options);
                const magnitude = "magnitude" in this.options ? this.getOpt("magnitude") : 1;
                return linspace(0, 1, number).map(d => factory(d) * magnitude);
            }
            case GENERATOR_TYPES.WAVE:
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
