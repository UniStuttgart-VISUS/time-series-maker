import Generator from "./generators";

export default class TimeSeriesComponent {

    constructor(timeseries, generator) {
        generator = generator ? generator : new Generator()
        this._ts = timeseries;
        this.id = this._ts.getID(generator)
        this.data = [];
        this.generator = generator;
    }

    setGenerator(generator) {
        if (generator.key !== this.generator.key) {

            this.id = this._ts.getID(generator);
            this.generator = generator;

            if (this.data.length > 0) {
                this.generate(this.data.length);
            }
        }
    }

    generate(samples) {
        samples = samples ? samples : this._ts.samples;
        this.data = this.generator.generate(samples)
        return this.data;
    }

}