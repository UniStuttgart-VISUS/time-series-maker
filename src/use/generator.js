import filled from '@stdlib/array/filled';
import linspace from '@stdlib/array/linspace';
import array2iterator from '@stdlib/array/to-iterator'
import dists from '@stdlib/stats/base/dists';
import random from '@stdlib/random/base';
import simulate from '@stdlib/simulate/iter'
import GENERATOR_DEFAULTS from './generator-defaults.js';
import GENERATOR_TYPES from './generator-types.js';
import { DateTime } from 'luxon';

export default class Generator {

    constructor(type="CONSTANT", seeds=[42], options={}) {
        const defaults = GENERATOR_DEFAULTS[type in GENERATOR_DEFAULTS ? type : "CONSTANT"]

        this.key = defaults.key;
        this.name = defaults.name;
        this.title = defaults.title;
        this.type = defaults.type;
        this.seedRequired = defaults.seedRequired;

        this.seeds = seeds;

        this.options = {};
        for (const key in defaults.options) {
            this.options[key] = defaults.options[key].copy()
        }
        for (const key in options) {
            this.options[key].value = options[key];
        }
    }

    toJSON() {
        const optionValues = {};
        for (const key in this.options) {
            optionValues[key] = this.options[key].value;
        }
        return {
            key: this.key,
            seeds: this.seeds,
            options: optionValues
        }
    }

    static fromJSON(json) {
        return new Generator(
            json.key,
            json.seeds,
            json.options
        )
    }

    copy() {
        const optionValues = {};
        for (const key in this.options) {
            optionValues[key] = this.options[key].value;
        }
        return new Generator(
            this.key,
            this.seeds.slice(),
            optionValues
        );
    }

    addSeed(seed) {
        this.seeds.push(seed);
    }

    static makePDFFactory(name, options) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return dists.normal.pdf.factory(getOpt("mean"), getOpt("std"));
            case "arcsine":
                return dists.arcsine.pdf.factory(getOpt("minSupport"), getOpt("maxSupport"))
            case "chi-squared":
                return dists.chisquare.pdf.factory(getOpt("k"))
        }
    }
    static makeCDFFactory(name, options) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return dists.normal.cdf.factory(getOpt("mean"), getOpt("std"));
            case "arcsine":
                return dists.arcsine.cdf.factory(getOpt("minSupport"), getOpt("maxSupport"))
            case "chi-squared":
                return dists.chisquare.cdf.factory(getOpt("k"));
        }
    }
    static makeRandomFactory(name, options, opts) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return random.normal.factory(getOpt("mean"), getOpt("std"), opts);
            case "lognomal":
                return random.lognormal.factory(getOpt("mean"), getOpt("std"), opts);
            case "poisson":
                return random.poisson.factory(getOpt("lambda"), opts);
            case "geometric":
                return random.geometric.factory(getOpt("p"), opts);
            default:
            case "uniform":
                return random.uniform.factory(getOpt("minSupport"), getOpt("maxSupport"), opts);
        }
    }

    isValid() {
        const ops = Object.keys(this.options);
        return !ops.some(o => !this.options[o].isValid())
    }

    setOpt(name, value) {
        if (this.options[name].isValid(value)) {
            this.options[name].value = value;
        }
    }

    getOpt(name) {
        return this.options[name].value;
    }

    _apply(numberOrValues, index=0) {
        const number = typeof numberOrValues === "number" ? numberOrValues : numberOrValues.length;
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
                    case "weekend": {
                        const magnitude = this.getOpt("magnitude");
                        return numberOrValues.map(d => {
                            const w = d.getDay();
                            return w === 5 || w === 6 ? magnitude : 0;
                        });
                    }
                    case "monthly": {
                        const magnitude = this.getOpt("magnitude");
                        let month = -1;
                        return numberOrValues.map(d => {
                            const m = d.getMonth();
                            if (m !== month) {
                                month = m;
                                return magnitude;
                            }
                            return 0;
                        });
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
                            seed: this.seeds[index],
                            period: this.getOpt("period"),
                            amplitude: this.getOpt("amplitude"),
                            offset: this.getOpt("offset"),
                        })
                        return filled(0, number).map(() => iter.next().value);
                    }
                    case "cosine": {
                        const iter = simulate.iterCosineWave({
                            seed: this.seeds[index],
                            period: this.getOpt("period"),
                            amplitude: this.getOpt("amplitude"),
                            offset: this.getOpt("offset"),
                        })
                        return filled(0, number).map(() => iter.next().value);
                    }
                    case "pulse": {
                        const iter = simulate.iterPulse({
                            seed: this.seeds[index],
                            period: this.getOpt("period"),
                            duration: this.getOpt("duration"),
                            offset: this.getOpt("offset"),
                            min: this.getOpt("minAmplitude"),
                            max: this.getOpt("maxAmplitude"),
                            iter: number
                        })
                        return filled(0, number).map(() => iter.next().value);
                    }
                    case "bartlett": {
                        const iter = simulate.iterBartlettPulse({
                            seed: this.seeds[index],
                            period: this.getOpt("period"),
                            duration: this.getOpt("duration"),
                            amplitude: this.getOpt("amplitude"),
                            offset: this.getOpt("offset"),
                            iter: number
                        })
                        return filled(0, number).map(() => iter.next().value);
                    }

                }
            case GENERATOR_TYPES.RNG: {
                switch (this.name) {
                    case "awgn": {
                        const arr = filled(0, number);
                        const opts = { seed: this.seeds[index] }
                        const iter = simulate.iterawgn(array2iterator(arr), this.getOpt("sigma"), opts)
                        return arr.map(() => iter.next().value);
                    }
                    case "awln": {
                        const arr = filled(0, number);
                        const opts = { seed: this.seeds[index] }
                        const iter = simulate.iterawln(array2iterator(arr), this.getOpt("sigma"), opts)
                        return arr.map(() => iter.next().value);
                    }
                    case "awun": {
                        const arr = filled(0, number);
                        const opts = { seed: this.seeds[index] }
                        const iter = simulate.iterawun(array2iterator(arr), this.getOpt("sigma"), opts)
                        return arr.map(() => iter.next().value);
                    }
                    default: {
                        const opts = { seed: this.seeds[index] }
                        const factory = Generator.makeRandomFactory(this.name, this.options, opts);
                        return linspace(0, number, number).map(factory);
                    }
                }
            }
        }
    }

    generate(numberOrValues, index=-1) {

        if (!this.isValid()) {
            throw new Error("invalid parameters")
        }

        if (index !== undefined && index >= 0) {
            return [this._apply(numberOrValues, index)]
        }

        if (!this.seedRequired || this.seeds.length === 1) {
            return [this._apply(numberOrValues, 0)]
        }

        const data = [];
        for (let i = 0; i < this.seeds.length; ++i) {
            data.push(this._apply(numberOrValues, i));
        }

        return data
    }
}
