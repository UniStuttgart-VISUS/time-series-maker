import copy from '@stdlib/utils/copy';
import datespace from '@stdlib/array/datespace';
import inmap from '@stdlib/utils/inmap';
import forEach from '@stdlib/utils/for-each';
import TimeSeriesComponent from './time-series-component';
import GENERATOR_DEFAULTS, { GENERATOR_DEFAULT_NAMES } from "./generator-defaults";
import Generator from './generators';
import randi from '@stdlib/random/base/randi';
import Compositor, { OPERATOR } from './compositor';

function add(a, b) { return a+b; }
function subtract(a, b) { return a-b; }
function multiply(a, b) { return a*b; }

export default class TimeSeries {

    constructor(samples=100, min=-2, max=2, start="2022-01-01T12:00", end="2022-12-31T12:00") {
        this.samples = samples;
        this.start = start;
        this.end = end;
        this.min = min;
        this.max = max;
        this.dataX = [];
        this.dataY = [];
        this.components = [];
        this.compositor = new Compositor();
        this.addComponent();
    }

    get componentIDs() {
        return this.components.map(d => d.id)
    }

    getID(generator) {
        const count = this.components.reduce((acc, d) => acc + (d.generator.key === generator.key ? 1 : 0), 0);
        return generator.title + ` ${count}`;
    }

    hasID(id) {
        return this.getComponent(id) !== undefined;
    }

    getComponent(id) {
        return this.components.find(c => c.id === id)
    }

    randomSeed() {
        this.components.forEach(c => c.setSeed(randi()));
        this.generate();
    }

    addComponent(generatorType) {
        if (generatorType && (generatorType in GENERATOR_DEFAULTS)) {
            const generator = new Generator(generatorType, randi());
            this.components.push(new TimeSeriesComponent(this, generator))
        } else {
            this.components.push(new TimeSeriesComponent(this))
        }
        // TODO: what about renaming?
        this.compositor.addData(
            this.components[this.components.length-1].id,
            this.components[this.components.length-1].name
        );
    }

    removeComponent(id) {
        const idx = this.componentIDs.indexOf(id);
        if (idx >= 0) {
            this.components.splice(idx, 1)
            const IDS = {}
            GENERATOR_DEFAULT_NAMES.forEach(d => IDS[d.key] = 0);
            this.components.forEach(c => {
                c.id = c.generator.title + ` ${IDS[c.generator.key]++}`;
            });
        }
    }

    generate() {
        let values = null;

        this.compositor.iterate((left, op, right) => {

            const hasLeft = left !== undefined && left !== null;
            const hasOp = op !== undefined && op !== null;
            const hasRight = right !== undefined && right !== null;

            if (hasLeft) {
                const c = this.getComponent(left.id);
                if (c.data.length !== this.samples) {
                    c.generate(this.samples)
                }

                if (values === null) {
                    values = copy(c.data)
                }
            }

            if (hasOp && hasRight) {
                const c = this.getComponent(right.id);
                if (c.data.length !== this.samples) {
                    c.generate(this.samples)
                }

                switch(op.name) {
                    default:
                    case OPERATOR.ADD:
                        inmap(values, (val, index) => add(val, c.data[index]));
                        break;
                    case OPERATOR.MULTIPLY:
                        inmap(values, (val, index) => multiply(val, c.data[index]));
                        break;
                    case OPERATOR.SUBTRACT:
                        inmap(values, (val, index) => subtract(val, c.data[index]));
                        break;
                }
            }

            if (hasLeft && hasOp && !hasRight) {

                const c = this.getComponent(left.id);
                if (c.data.length !== this.samples) {
                    c.generate(this.samples)
                }

                switch(op.name) {
                    default:
                    case OPERATOR.ADD:
                        inmap(values, (val, index) => add(val, c.data[index]));
                        break;
                    case OPERATOR.MULTIPLY:
                        inmap(values, (val, index) => multiply(val, c.data[index]));
                        break;
                    case OPERATOR.SUBTRACT:
                        inmap(values, (val, index) => subtract(c.data[index], val));
                        break;
                }
            }
        });

        this.dataX = datespace(this.start, this.end, this.samples);
        this.dataY = values;
        return this.dataY;
    }

    toChartData() {
        const data = [];
        if (this.dataY.length === 0) {
            this.generate();
        }

        this.components.forEach(c => {
            const result = [];
            forEach(c.data, (d, i) => result.push([this.dataX[i], d ]));
            data.push({
                id: c.id,
                color: c.generator.type,
                opacity: 0.33,
                values: result
            });
        });

        const result = [];
        forEach(this.dataY, (d, i) => result.push([this.dataX[i], d]));
        data.push({
            id: "result",
            color: "result",
            opacity: 1,
            values: result
        });

        return data;
    }
}