import TimeSeriesComponent from './time-series-component';
import Generator from './generators';
import GENERATOR_DEFAULTS from "./generator-defaults";
import Compositor, { OPERATOR, OP_CASE } from './compositor';

import inmap from '@stdlib/utils/inmap';
import randi from '@stdlib/random/base/randi';
import filled from '@stdlib/array/filled'
import mapFun from '@stdlib/utils/map-function'

import { DateTime } from 'luxon';

function add(a, b) { return a+b; }
function subtract(a, b) { return a-b; }
function multiply(a, b) { return a*b; }


export default class TimeSeries {

    constructor(tsc, id, name=null, components=[], compositor=null) {

        this._tsc = tsc;
        this.id = id;
        this.name = name ? name : id;

        this.dataY = [];

        this.lastUpdate = null;
        this.COMP_ID = components.length;

        this.compositor = compositor ? compositor : new Compositor();
        this.components = [];
        components.forEach(c => {
            c._ts = this;
            this.components.push(c)
            this.COMP_ID = Math.max(this.COMP_ID, Number.parseInt(c.id.slice(c.id.indexOf("_")+1))+1);
        });

        if (this.size === 0) {
            this.addComponent();
        } else {
            this.generate();
        }
    }

    static fromJSON(tsc, json) {
        return new TimeSeries(
            tsc,
            json.id,
            json.name,
            json.components.map(c => TimeSeriesComponent.fromJSON(null, c)),
            Compositor.fromJSON(json.compositor)
        )
    }

    fromJSON(json) {

        this.id = json.id;
        this.name = json.name;

        this.dataY = [];

        this.COMP_ID = json.components.length;

        this.compositor = Compositor.fromJSON(json.compositor);
        this.components = [];
        json.components.forEach(c => {
            this.components.push(TimeSeriesComponent.fromJSON(this, c))
            this.COMP_ID = Math.max(this.COMP_ID, Number.parseInt(c.id.slice(c.id.indexOf("_")+1)));
        });
        this.generate();
    }

    toJSON() {
        const json = {
            id: this.id,
            name: this.name,
            type: "timeseries",
            components: this.components.map(c => c.toJSON()),
            compositor: this.compositor.toJSON()
        }
        return json
    }

    toCSV() {
        if (this.dataY.length !== this._tsc.samples) {
            this.generate();
        }
        return Array.from(this.dataY);
    }

    toCSVHeader() {
        return this._tsc.toCSVHeader()
    }

    copy() {
        const id = "copy_" + this.id;
        return new TimeSeries(
            this._tsc,
            id,
            id,
            this.components.map(c => c.copy()),
            this.compositor.copy()
        )
    }

    get componentIDs() {
        return this.components.map(d => d.id)
    }

    get size() {
        return this.components.length;
    }

    getID() {
        return "comp_" + (this.COMP_ID++)
    }
    getName(generator) {
        const count = this.components.reduce((acc, d) => acc + (d.generator.key === generator.key ? 1 : 0), 0);
        return generator.title + ` ${count}`;
    }
    setName(name) {
        this.name = name;
    }

    hasID(id) {
        return this.getComponent(id) !== undefined;
    }

    clear() {
        this.dataY = [];
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
            this.components[this.components.length-1].name,
            this.components[this.components.length-1].generator.type
        );
        this.generate();
    }

    removeComponent(id) {
        const idx = this.componentIDs.indexOf(id);
        if (idx >= 0) {
            this.components.splice(idx, 1)
            this.compositor.remove(id);
        }
        this.generate();
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
        this.generate();
    }

    generate() {

        if (!this._tsc) return;

        let leftVals, rightVals, cacheVals;
        const values = filled(0, this._tsc.samples);

        const getComp = id => {
            const c = this.getComponent(id);
            if (c.data.length !== this._tsc.samples) {
                c.generate(this._tsc.samples)
            }
            return c;
        }

        const apply = (op, inplace=true) => {
            switch(op) {
                default:
                case OPERATOR.ADD:
                    if (inplace) {
                        inmap(values, (_, i) => add(leftVals[i], rightVals[i]));
                    } else {
                        return mapFun(i => add(leftVals[i], rightVals[i]), this._tsc.samples);
                    }
                    break;
                case OPERATOR.MULTIPLY:
                    if (inplace) {
                        inmap(values, (_, i) => multiply(leftVals[i], rightVals[i]));
                    } else {
                        return mapFun(i => multiply(leftVals[i], rightVals[i]), this._tsc.samples);
                    }
                    break;
                case OPERATOR.SUBTRACT:
                    if (inplace) {
                        inmap(values, (_, i) => subtract(leftVals[i], rightVals[i]));
                    } else {
                        return mapFun(i => subtract(leftVals[i], rightVals[i]), this._tsc.samples);
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
                    const cl = getComp(left);
                    const cr = getComp(right);
                    leftVals = cl.data;
                    rightVals = cr.data;
                    break;
                }
                case OP_CASE.APPLY_LEFT: {
                    console.assert(hasLeft, "wrong case - missing left");
                    const c = getComp(left);
                    leftVals = c.data;
                    rightVals = values;
                    break;
                }
                case OP_CASE.APPLY_RIGHT: {
                    console.assert(hasRight, "wrong case - missing right");
                    const c = getComp(right);
                    leftVals = values;
                    rightVals = c.data;
                    break;
                }
                case OP_CASE.APPLY_NESTED_LEFT: {
                    console.assert(hasLeft && hasOp && hasRight, "wrong case - missing data");
                    const cl = getComp(left);
                    const cr = getComp(right);
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
                        leftVals = values;
                        rightVals = cacheVals;
                        break;
                    }
                    case OP_CASE.APPLY_NESTED_RIGHT: {
                        leftVals = cacheVals;
                        rightVals = values;
                        break;
                    }
                }
                apply(extraOp);
                cacheVals = null;
            }

        });

        this.dataY = values;
        this.lastUpdate = Date.now();
        this._tsc.update();

        return this.dataY;
    }

    toChartData() {
        const data = [];
        if (this.dataY.length !== this._tsc.samples) {
            this.generate();
        }

        this.components.forEach(c => {
            const result = [];
            c.data.forEach((d, i) => result.push([this._tsc.dataX[i], d ]));
            data.push({
                id: c.id,
                color: c.generator.type,
                opacity: 0.25,
                values: result
            });
        });

        const result = [];
        this.dataY.forEach((d, i) => result.push([this._tsc.dataX[i], d]));
        data.push({
            id: "result",
            color: "result",
            opacity: 1,
            values: result
        });

        return data;
    }
}