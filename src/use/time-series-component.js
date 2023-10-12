import Generator from "./generators";
import randi from "@stdlib/random/base/randi";

export default class TimeSeriesComponent {

    constructor(timeseries, generator=null, id=null, name=null) {
        generator = generator ? generator : new Generator()
        this._ts = timeseries;
        this.id = id ? id : this._ts.getID()
        this.name = name ? name : this._ts.getName(generator)
        this.data = [];
        this.generator = generator;
        this.visible = true;
        this.generate();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            generator: this.generator.toJSON()
        }
    }

    static fromJSON(timeseries, json) {
        return new TimeSeriesComponent(
            timeseries,
            Generator.fromJSON(json.generator),
            json.id,
            json.name
        );
    }

    copy(timeseries) {
        return new TimeSeriesComponent(
            timeseries,
            this.generator.copy(),
            this.id,
            this.name
        )
    }

    setName(name) {
        this.name = name;
        this._ts.compositor.rename(this.id, this.name);
    }

    setVisible(value) {
        this.visible = value;
        console.log(this.visible)
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
        return this.generator.isValid();
    }

    generate(samples) {
        if (!this._ts) return;
        samples = samples ? samples : this._ts._tsc.samples;
        this.data = this.generator.generate(samples)
        return this.data;
    }

    update() {
        if (!this._ts) return;
        this._ts.update();
    }

}