import Generator from "./generators";
import randi from "@stdlib/random/base/randi";

export default class TimeSeriesComponent {

    constructor(timeseries, generator) {
        generator = generator ? generator : new Generator()
        this._ts = timeseries;
        this.id = this._ts.getID(generator)
        this.hasCustomID = false;
        this.data = [];
        this.generator = generator;
    }

    setID(id) {
        if (!this._ts.hasID(id)) {
            this.id = id;
            this.hasCustomID = true;
        } else {
            console.error(`ID "${id}" already in use`);
        }
    }

    setSeed(seed) {
        this.generator.seed = seed;
        this.generate();
    }

    randomSeed() {
        this.generator.seed = randi();
        this.generate();
    }

    generate(samples) {
        samples = samples ? samples : this._ts.samples;
        this.data = this.generator.generate(samples)
        return this.data;
    }

}