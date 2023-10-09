import datespace from '@stdlib/array/datespace';
import inmap from '@stdlib/utils/inmap';
import forEach from '@stdlib/utils/for-each';
import TimeSeriesComponent from './time-series-component';
import GENERATOR_DEFAULTS from "./generator-defaults";
import Generator from './generators';
import randi from '@stdlib/random/base/randi';
import Compositor, { OPERATOR, OP_CASE } from './compositor';
import filled from '@stdlib/array/filled'
import mapFun from '@stdlib/utils/map-function'

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

    getComponentIndex(id) {
        return this.components.findIndex(c => c.id === id)
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
        this.compositor.addData(
            this.components[this.components.length-1].id,
            this.components[this.components.length-1].name
        );
    }

    removeComponent(id) {
        const idx = this.componentIDs.indexOf(id);
        if (idx >= 0) {
            this.components.splice(idx, 1)
            this.compositor.remove(id);
        }
    }

    switchComponents(fromID, toID) {
        const fromIndex = this.getComponentIndex(fromID);
        const toIndex = this.getComponentIndex(toID);
        if (fromIndex >= 0 && fromIndex <= this.components.length &&
            toIndex >= 0 && toIndex <= this.components.length &&
            fromIndex !== toIndex
        ) {
            const from = this.components[fromIndex];
            this.components[fromIndex] = this.components[toIndex];
            this.components[toIndex] = from;

            this.compositor.switchData(fromID, toID);
        }
    }

    generate() {

        let leftVals, rightVals, cacheVals;
        const values = filled(0, this.samples);

        const getComp = id => {
            const c = this.getComponent(id);
            if (c.data.length !== this.samples) {
                c.generate(this.samples)
            }
            return c;
        }

        const apply = (op, inplace=true) => {
            switch(op.name) {
                default:
                case OPERATOR.ADD:
                    if (inplace) {
                        inmap(values, (_, i) => add(leftVals[i], rightVals[i]));
                    } else {
                        return mapFun(i => add(leftVals[i], rightVals[i]), this.samples);
                    }
                    break;
                case OPERATOR.MULTIPLY:
                    if (inplace) {
                        inmap(values, (_, i) => multiply(leftVals[i], rightVals[i]));
                    } else {
                        return mapFun(i => multiply(leftVals[i], rightVals[i]), this.samples);
                    }
                    break;
                case OPERATOR.SUBTRACT:
                    if (inplace) {
                        inmap(values, (_, i) => subtract(leftVals[i], rightVals[i]));
                    } else {
                        return mapFun(i => subtract(leftVals[i], rightVals[i]), this.samples);
                    }
                    break;
            }
        }

        this.compositor.iterate((opCase, left, op, right, extraOp) => {

            const hasLeft = left !== undefined && left !== null;
            const hasOp = op !== undefined && op !== null;
            const hasRight = right !== undefined && right !== null;
            const hasExtraOp = extraOp !== undefined && extraOp !== null;


            switch(opCase) {
                case OP_CASE.APPLY_BOTH: {
                    console.assert(hasLeft && hasOp && hasRight, "wrong case - missing data");
                    const cl = getComp(left.id);
                    const cr = getComp(right.id);
                    leftVals = cl.data;
                    rightVals = cr.data;
                    break;
                }
                case OP_CASE.APPLY_LEFT: {
                    console.assert(hasLeft, "wrong case - missing left");
                    const c = getComp(left.id);
                    leftVals = c.data;
                    rightVals = values;
                    break;
                }
                case OP_CASE.APPLY_RIGHT: {
                    console.assert(hasRight, "wrong case - missing right");
                    const c = getComp(right.id);
                    leftVals = values;
                    rightVals = c.data;
                    break;
                }
                case OP_CASE.APPLY_NESTED_LEFT: {
                    console.assert(hasLeft && hasOp && hasRight, "wrong case - missing data");
                    const cl = getComp(left.id);
                    const cr = getComp(right.id);
                    leftVals = cl.data;
                    rightVals = cr.data;
                    break;
                }
            }

            if (hasOp) {
                cacheVals = apply(op, !hasExtraOp);
            }

            if (hasExtraOp && cacheVals) {

                switch(opCase) {
                    case OP_CASE.APPLY_NESTED_LEFT: {
                        const c = getComp(left.id);
                        leftVals = c.data;
                        rightVals = cacheVals;
                        break;
                    }
                    case OP_CASE.APPLY_NESTED_RIGHT: {
                        const c = getComp(right.id);
                        leftVals = cacheVals;
                        rightVals = c.data;
                        break;
                    }
                    default: break;
                }
                apply(extraOp);
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