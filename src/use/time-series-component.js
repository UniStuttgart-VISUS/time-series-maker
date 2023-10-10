import Generator from "./generators";
import randi from "@stdlib/random/base/randi";

export default class TimeSeriesComponent {

    constructor(timeseries, generator) {
        generator = generator ? generator : new Generator()
        this._ts = timeseries;
        this.id = this._ts.getID()
        this.name = this._ts.getName(generator)
        this.data = [];
        this.generator = generator;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            generator: this.generator.toJSON()
        }
    }

    static fromJSON(timeseries, json) {
        const g = Generator.fromJSON(json.generator);
        const c = new TimeSeriesComponent(timeseries, g)
        c.id = json.id;
        c.name = json.name;
        return c;
    }

    setName(name) {
        this.name = name;
        this._ts.compositor.rename(this.id, this.name);
    }

    setSeed(seed) {
        this.generator.seed = seed;
        this.generate();
    }

    randomSeed() {
        this.generator.seed = randi();
        this.generate();
    }

    isValid() {
        for (const opt in this.generator.options) {
            if (!this.generator.options[opt].isValid()) {
                return false;
            }
        }
        return true;
    }

    generate(samples) {
        samples = samples ? samples : this._ts.samples;
        this.data = this.generator.generate(samples)
        return this.data;
    }

}