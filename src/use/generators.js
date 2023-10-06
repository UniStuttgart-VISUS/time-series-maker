import filled from '@stdlib/array/filled';
import linspace from '@stdlib/array/linspace';
import stats from '@stdlib/stats/base';
import random from '@stdlib/random/base';

import GENERATOR_DEFAULTS from './generator_default';

export default class Generator {

    constructor(type="CONSTANT") {
        const defaults = GENERATOR_DEFAULTS[type in GENERATOR_DEFAULTS ? type : "CONSTANT"]
        this.key = defaults.key;
        this.name = defaults.name;
        this.title = defaults.title;
        this.prefab = defaults.prefab;
        this.type = defaults.type;
        this.options = {};
        for (const key in defaults.options) {
            this.options[key] = Object.assign({}, defaults.options[key]);
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
    static makeRandomFactory(name, options) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return random.normal.factory(getOpt("mu"), getOpt("sigma"));
            case "lognomal":
                return random.lognormal.factory(getOpt("mu"), getOpt("sigma"));
            case "poisson":
                return random.poisson.factory(getOpt("lambda"));
            case "geometric":
                return random.geometric.factory(getOpt("p"));
            default:
            case "uniform":
                return random.uniform.factory(getOpt("min"), getOpt("max"));
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
            case "prefab":
                switch (this.name) {
                    case "trend": {
                        const pos = Math.round(this.getOpt("position") * number);
                        const slope = this.getOpt("slope");
                        return linspace(-pos, number-pos, number).map(d => d*slope)
                    }
                    case "outlier": {
                        const xvals = linspace(0, 1, number)
                        const pos = Math.round(this.getOpt("position") * number);
                        const factory = stats.dists.normal.pdf.factory(xvals[pos], this.getOpt("width"))
                        const magnitude = this.getOpt("magnitude");
                        return xvals.map(d => factory(d) * magnitude);
                    }
                    default:
                    case "constant":
                        return filled(this.getOpt("value"), number)
                }

            case "pmf":
            case "pdf": {
                const factory = Generator.makeFactory(this.name, this.options);
                const magnitude = "magnitude" in this.options ? this.getOpt("magnitude") : 1;
                return linspace(0, 1, number).map(d => factory(d) * magnitude);
            }
            case "random": {
                const factory = Generator.makeRandomFactory(this.name, this.options);
                switch (this.name) {
                    default:
                        return linspace(0, number, number).map(() => factory());
                }
            }
        }
    }
}
