import * as d3 from 'd3';
import TimeSeries from "@/use/time-series";
import datespace from '@stdlib/array/datespace';

import { DateTime } from 'luxon';

const TSC_DEFAULTS = Object.freeze({
    samples: 100,
    dynamicRange: true,
    min: -2,
    max: 2,
    start: "2022-01-01",
    end: "2022-12-31",
})

export default class TimeSeriesCollection {

    constructor(options=TSC_DEFAULTS, series=[]) {
        this.start = options.start;
        this.end = options.end;
        this.samples = options.samples;
        this.dynamicRange = options.dynamicRange;
        this.min = options.min;
        this.max = options.max;

        this.dataX = [];
        this.series = [];
        this.lastUpdate = null;

        this.TS_ID = series.length;
        series.forEach(s => {
            this.series._tsc = this;
            this.TS_ID = Math.max(this.TS_ID, Number.parseInt(s.id.slice(s.id.indexOf("_")+1))+1);
        })

        if (this.series.length === 0) {
            this.addTimeSeries();
        } else {
            this.generate();
        }
    }

    static fromJSON(json) {
        return new TimeSeriesCollection(
            json.options,
            json.series.map(s => TimeSeries.fromJSON(null, s))
        );
    }

    fromJSON(json) {
        this.start = json.options.start;
        this.end = json.options.end;
        this.samples = json.options.samples;
        this.dynamicRange = json.options.dynamicRange;
        this.min = json.options.min;
        this.max = json.options.max;

        this.dataX = [];
        this.series = [];

        this.TS_ID = json.series.length;
        json.series.forEach(s => {
            this.series.push(TimeSeries.fromJSON(this, s))
            this.TS_ID = Math.max(this.TS_ID, Number.parseInt(s.id.slice(s.id.indexOf("_")+1))+1);
        });
        this.generate();
    }

    toJSON() {
        return {
            type: "timeseries-collection",
            options: this.options,
            series: this.series.map(s => s.toJSON())
        }
    }

    toCSV() {
        if (this.dataX.length !== this.samples) {
            this.generate();
        }
        return this.series.map(s => Array.from(s.dataY))
    }

    toCSVHeader() {
        if (this.dataX.length !== this.samples) {
            this.generate();
        }
        return this.dataX.map(d => DateTime.fromJSDate(d).toFormat("yyyy-LL-dd"))
    }

    get size() {
        return this.series.length;
    }

    get options() {
        return {
            start: this.start,
            end: this.end,
            samples: this.samples,
            dynamicRange: this.dynamicRange,
            min: this.min,
            max: this.max
        }
    }

    setOption(key, value) {
        switch (key) {
            case "min":
                this.min = value < this.max ? value : this.min;
                break;
            case "max":
                this.max = value > this.min ? value : this.max;
                break;
            case "start":
                this.start = value < this.end ? value : this.start;
                this.generate();
                break;
            case "end":
                this.end = value > this.start ? value : this.end;
                this.generate();
                break;
            case "samples":
                this.samples = Math.max(3, Math.round(value));
                this.generate();
                break;
            case "dynamicRange": {
                this.dynamicRange = value === true;
                if (!this.dynamicRange && this.size > 0) {
                    if (this.dataX.length !== this.samples) {
                        this.generate();
                    }
                    this.series.forEach(s => {
                        const [min, max] = d3.extent(s.dataY);
                        this.min = Math.min(min, this.min);
                        this.max = Math.max(max, this.max);
                    })
                }
                break;
            }
        }
    }

    getID() {
        return "ts_" + (this.TS_ID++)
    }

    getName(number) {
        return "timeseries " + number;
    }

    getTimeSeries(id) {
        return this.series.find(ts => ts.id === id);
    }
    getTimeSeriesIndex(id) {
        return this.series.findIndex(ts => ts.id === id);
    }

    addTimeSeries(timeseries=null) {
        this.series.push(timeseries ? timeseries : new TimeSeries(
            this,
            this.getID(),
            this.getName(this.TS_ID-1))
        );
        this.generate();
    }

    removeTimeSeries(id) {
        const idx = this.getTimeSeriesIndex(id);
        if (idx >= 0) {
            this.series.splice(idx, 1);
            this.generate();
        }
    }

    update() {
        this.lastUpdate = Date.now();
    }

    generate() {
        this.dataX = datespace(this.start, this.end, this.samples);
        this.series.forEach(ts => ts.generate());
        this.update();
    }

    toChartData() {
        const data = [];
        if (this.dataX.length !== this.samples) {
            this.generate();
        }

        this.series.forEach(ts => {
            const result = [];
            ts.dataY.forEach((d, i) => result.push([this.dataX[i], d]));
            data.push({
                id: ts.id,
                color: ts.id,
                opacity: 0.5,
                values: result
            });
        });

        return data;

    }
}