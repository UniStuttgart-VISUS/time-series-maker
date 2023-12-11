import filled from '@stdlib/array/filled';
import linspace from '@stdlib/array/linspace';
import array2iterator from '@stdlib/array/to-iterator'
import dists from '@stdlib/stats/base/dists';
import random from '@stdlib/random/base';
import simulate from '@stdlib/simulate/iter'
import { cos, sin, tan, ln, log, pow, sqrt, inv, exp } from '@stdlib/math/base/special'

import GENERATOR_DEFAULTS from './generator-defaults.js';
import GENERATOR_TYPES from './generator-types.js';
import { DateTime } from 'luxon';
import { specificDate, specificDateChange } from './generator-utils.js';

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
            this.options[key].setGenerator(this);
        }
        for (const key in options) {
            if (this.options[key] && this.options[key].isValid(options[key])) {
                this.options[key].value = options[key];
            }
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
            default:
            case "normal":
                return dists.normal.pdf.factory(getOpt("mean"), getOpt("std"));
            case "arcsine":
                return dists.arcsine.pdf.factory(getOpt("minSupport"), getOpt("maxSupport"))
            case "chi-squared":
                return dists.chisquare.pdf.factory(getOpt("k"))
            case "students-t":
                return dists.t.pdf.factory(getOpt("dof"));
        }
    }
    static makeCDFFactory(name, options) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            default:
            case "normal":
                return dists.normal.cdf.factory(getOpt("mean"), getOpt("std"));
            case "arcsine":
                return dists.arcsine.cdf.factory(getOpt("minSupport"), getOpt("maxSupport"))
            case "chi-squared":
                return dists.chisquare.cdf.factory(getOpt("k"));
            case "students-t":
                return dists.t.cdf.factory(getOpt("dof"));
            case "poisson":
                return dists.poisson.cdf.factory(getOpt("lambda"));
            case "bernoulli":
                return dists.bernoulli.cdf.factory(getOpt("p"));
            case "binomial":
                return dists.binomial.cdf.factory(getOpt("n"), getOpt("p"));
        }
    }
    static makeRandomFactory(name, options, opts) {
        const getOpt = opName => options[opName].value;
        switch (name) {
            case "normal":
                return random.normal.factory(getOpt("mean"), getOpt("std"), opts);
            case "arcsine":
                return random.arcsine.factory(getOpt("minSupport"), getOpt("maxSupport"), opts);
            case "chi-squared":
                return random.chisquare.factory(getOpt("k"), opts);
            case "students-t":
                return random.t.factory(getOpt("dof"), opts);
            case "poisson":
                return random.poisson.factory(getOpt("lambda"), opts);
            case "bernoulli":
                return random.bernoulli.factory(getOpt("p"), opts);
            case "binomial":
                return random.binomial.factory(getOpt("n"), getOpt("p"), opts);
            default:
            case "uniform":
                return random.uniform.factory(getOpt("minSupport"), getOpt("maxSupport"), opts);
        }
    }

    isValid() {
        const ops = Object.keys(this.options);
        return !ops.some(o => !this.options[o].isValid())
    }

    hasOpt(name) {
        return name in this.options;
    }

    setOpt(name, value) {
        if (this.options[name].isValid(value)) {
            this.options[name].value = value;
        }
    }

    getOpt(name) {
        return this.options[name].value;
    }

    _applyBase(numberOrValues, index=0) {
        const number = typeof numberOrValues === "number" ? numberOrValues : numberOrValues.length;
        switch (this.type) {
            default:
            case GENERATOR_TYPES.SPECIAL:
                switch (this.name) {
                    case "trend": {
                        const pos = Math.min(Math.round(this.getOpt("position") * number), number-1);
                        const slope = this.getOpt("slope");
                        return linspace(-pos, number-pos, number).map(d => d*slope)
                    }
                    case "outlier": {
                        const vals = filled(0, number)
                        const pos = Math.min(Math.round(this.getOpt("position") * number), number-1);
                        const width = this.getOpt("width")
                        const value = this.getOpt("value");
                        const back = width > 1 ? Math.floor(width * 0.5) : 0;
                        const forward = width > 1 ? Math.floor((width-1) * 0.5) : 0;
                        for (let i = pos-back; i >= 0 && i < number && i <= pos+forward; i++) {
                            vals[i] = value;
                        }
                        return vals;
                    }
                    case "day": {
                        return specificDate(
                            numberOrValues,
                            this.getOpt("day"),
                            this.getOpt("value"),
                            "day"
                        );
                    }
                    case "week": {
                        return specificDate(
                            numberOrValues,
                            this.getOpt("week"),
                            this.getOpt("value"),
                            "weekNumber"
                        );
                    }
                    case "month": {
                        return specificDate(
                            numberOrValues,
                            this.getOpt("month"),
                            this.getOpt("value"),
                            "month"
                        );
                    }
                    case "daily": {
                        return specificDateChange(
                            numberOrValues,
                            this.getOpt("value"),
                            "day"
                        );
                    }
                    case "weekly": {
                        return specificDateChange(
                            numberOrValues,
                            this.getOpt("value"),
                            "weekNumber"
                        );
                    }
                    case "monthly": {
                        return specificDateChange(
                            numberOrValues,
                            this.getOpt("value"),
                            "month"
                        );
                    }
                    case "workweek": {
                        const value = this.getOpt("value");
                        return numberOrValues.map(d => {
                            const w = DateTime.fromJSDate(d).weekday;
                            return w <= 5 ? value : 0;
                        });
                    }
                    case "weekend": {
                        const value = this.getOpt("value");
                        return numberOrValues.map(d => {
                            const w = DateTime.fromJSDate(d).weekday;
                            return w > 5 ? value : 0;
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
                return linspace(xMin, xMax, number).map(d => factory(d));
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
                        return linspace(xMin, xMax, number).map(d => factory(d));
                    }
                }
            }

            case GENERATOR_TYPES.MATH:
                switch (this.name) {
                    case "exp": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(exp);
                    }
                    case "pow": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        const base = this.getOpt("base");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(d => pow(base, d));
                    }
                    case "ln": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(ln);
                    }
                    case "log": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        const base = this.getOpt("base");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(d => log(d, base));
                    }
                    case "sqrt": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(sqrt);
                    }
                    case "inv": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(inv);
                    }
                    case "cos": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(cos);
                    }
                    case "sine": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(sin);
                    }
                    case "tan": {
                        const xMin = this.getOpt("xMin");
                        const xMax = this.getOpt("xMax");
                        console.assert(xMin < xMax, "min must be smaller than max")
                        return linspace(xMin, xMax, number).map(tan);
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
                    case "sawtooth": {
                        const iter = simulate.iterSawtoothWave({
                            seed: this.seeds[index],
                            period: this.getOpt("period"),
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
                    case "outlier": {
                        const vals = filled(0, number)
                        const pos = []
                        const count = this.getOpt("count")
                        for (let i = 0; i < count; ++i) {
                            let p;
                            do {
                                p = Math.min(Math.round(random.randu() * number), number-1)
                            } while (pos.includes(p))
                            pos.push(p);
                        }
                        const width = this.getOpt("width")
                        const value = this.getOpt("value");
                        const back = width > 1 ? Math.floor(width * 0.5) : 0;
                        const forward = width > 1 ? Math.floor((width-1) * 0.5) : 0;
                        for (let j = 0; j < pos.length; ++j) {
                            for (let i = pos[j]-back; i >= 0 && i < number && i <= pos[j]+forward; i++) {
                                vals[i] = value;
                            }
                        }
                        return vals;
                    }
                    default: {
                        const opts = { seed: this.seeds[index] }
                        const factory = Generator.makeRandomFactory(this.name, this.options, opts);
                        return linspace(0, number, number).map(d => factory());
                    }
                }
            }
        }
    }

    _apply(numberOrValues, index=0) {
        const vals = this._applyBase(numberOrValues, index)
        const scale = this.hasOpt("scale") ? this.getOpt("scale") : 1;
        if (scale !== 1) {
            return vals.map(v => v * scale);
        }
        return vals;
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
