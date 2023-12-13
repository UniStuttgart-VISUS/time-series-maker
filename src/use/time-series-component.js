import Generator from "./generator";
import randi from "@stdlib/random/base/randi";

export default class TimeSeriesComponent {

    constructor(timeseries, instances=1, generator=null, id=null, name=null) {
        generator = generator ? generator : new Generator()
        this._ts = timeseries;
        this.id = id ? id : this._ts.getID()
        this.name = name ? name : this._ts.getName(generator)
        this.wasRenamed = false;
        this.data = [];
        this.instances = 0;
        this.generator = generator;
        this.visible = true;
        if (generator !== null) {
            this.setInstances(instances)
        }
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            instances: this.instances,
            generator: this.generator.toJSON()
        }
    }

    static fromJSON(timeseries, json) {
        return new TimeSeriesComponent(
            timeseries,
            json.instances,
            Generator.fromJSON(json.generator),
            json.id,
            json.name
        );
    }

    copy(timeseries) {
        return new TimeSeriesComponent(
            timeseries,
            this.instances,
            this.generator.copy(),
            this.id,
            this.name
        )
    }

    get hasRandom() {
        return this.generator ? this.generator.seedRequired : false;
    }

    get lastUpdate() {
        if (!this._ts) return null;
        return this._ts.lastUpdate
    }

    setName(name) {
        this.name = name;
        this._ts.compositor.rename(this.id, this.name);
        this.wasRenamed = true;
    }

    setVisible(value) {
        this.visible = value;
    }

    setGenerator(generator) {
        this.generator = generator;
        this.data = [];
        this.setInstances(this.instances);
    }

    setInstances(number, generate=true) {
        if (this.generator.seedRequired) {
            if (number < this.instances) {
                this.generator.seeds = this.generator.seeds.slice(0, number);
            } else {
                for (let i = this.instances; i < number; ++i) {
                    this.generator.addSeed(randi());
                }
            }
        }
        this.instances = Math.max(1, number);
        if (generate && this.generator.seedRequired) {
            this.generate();
        }
    }

    setSeed(seed) {
        this.generator.seeds[0] = seed;
        this.generate();
    }

    randomSeed() {
        for (let i = 0; i < this.instances; ++i) {
            this.generator.seeds[i] = randi();
        }
        this.generate();
    }

    isValid() {
        return this.generator.isValid();
    }

    getData(index) {
        if (this.generator.seedRequired) {
            return this.data[index];
        }
        return this.data[0];
    }

    generate(samples, index) {
        if (!this._ts) return;
        samples = samples ? samples : (this._ts._tsc.dataX ? this._ts._tsc.dataX : this._ts._tsc.samples);
        this.data = this.generator.generate(samples, index)
        return this.data;
    }

    update(generate=true) {
        if (!this._ts) return;
        if (generate) this.generate()
        this._ts.generate();
    }

}