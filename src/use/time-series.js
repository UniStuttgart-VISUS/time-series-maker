import TimeSeriesComponent from './time-series-component.js';
import Generator from './generator.js';
import GENERATOR_DEFAULTS from "./generator-defaults.js";
import Compositor, { OPERATOR, OP_CASE } from './compositor.js';

import inmap from '@stdlib/utils/inmap';
import randi from '@stdlib/random/base/randi';
import filled from '@stdlib/array/filled'
import mapFun from '@stdlib/utils/map-function'
import clamp from '@stdlib/math/base/special/clamp';

function add(a, b) { return a+b; }
function subtract(a, b) { return a-b; }
function multiply(a, b) { return a*b; }

const DEFAULT_OPTIONS = Object.freeze({
    instances: 1,
    clampMin: false,
    clampMax: false,
    clampMinValue: 0,
    clampMaxValue: 1,
})

function readOptions(obj) {
    if ("options" in obj) {
        return obj.options;
    }

    const options = Object.assign({}, DEFAULT_OPTIONS);
    if ("instances" in obj) {
        options.instances = obj.instances;
    }

    return options;
}

export default class TimeSeries {

    constructor(tsc, id, name=null, options={}, components=[], compositor=null) {

        options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);

        this._tsc = tsc;
        this.id = id;
        this.name = name ? name : id;

        this.instances = Math.max(1, options.instances);
        this.clampMin = options.clampMin;
        this.clampMax = options.clampMax;
        this.clampMinValue = options.clampMinValue;
        this.clampMaxValue = options.clampMaxValue;
        if (this.clampMinValue >= this.clampMaxValue) {
            this.clampMinValue = this.clampMaxValue - 1;
        }

        this.dataY = [];

        this.lastUpdate = null;
        this.COMP_ID = components.length;

        this.tree = null;
        this.compositor = compositor ? compositor : new Compositor();

        this.components = [];
        components.forEach(c => {
            c._ts = this;
            this.components.push(c)
            this.COMP_ID = Math.max(this.COMP_ID, Number.parseInt(c.id.slice(c.id.indexOf("_")+1))+1);
        });
    }

    setClampMin(value) {
        if (!this.clampMax || value < this.clampMaxValue) {
            this.generate();
            this.clampMinValue = value;
            return true;
        }
        return false;
    }

    setClampMax(value) {
        if (!this.clampMin || value < this.clampMinValue) {
            this.clampMaxValue = value;
            this.generate();
            return true;
        }
        return false;
    }

    getOptions() {
        return {
            instances: this.instances,
            clampMin: this.clampMin,
            clampMax: this.clampMax,
            clampMinValue: this.clampMinValue,
            clampMaxValue: this.clampMaxValue,
        }
    }

    static fromJSON(tsc, json) {
        return new TimeSeries(
            tsc,
            json.id,
            "name" in json ? json.name : json.id,
            readOptions(json),
            json.components.map(c => TimeSeriesComponent.fromJSON(null, c)),
            Compositor.fromJSON(json.compositor)
        )
    }

    fromJSON(json) {

        this.id = json.id;
        this.name = json.name;
        this.instances = Math.max(1, json.options.instances);
        this.clampMin = json.options.clampMin;
        this.clampMax = json.options.clampMax;
        this.clampMinValue = json.options.clampMinValue;
        this.clampMaxValue = json.options.clampMaxValue;

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
            options: this.getOptions(),
            type: "timeseries",
            components: this.components.map(c => c.toJSON()),
            compositor: this.compositor.toJSON()
        }
        return json
    }

    toCSV() {
        if (this.dataY.length !== this.numSamples) {
            this.generate();
        }
        return Array.from(this.dataY);
    }

    toCSVHeader() {
        return this._tsc.toCSVHeader()
    }

    makeTree() {
        this.tree = this.compositor.toTree();
    }

    copy() {
        const id = "copy_" + this.id;
        return new TimeSeries(
            this._tsc,
            id,
            id,
            this.instances,
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

    get numSamples() {
        return this._tsc ? this._tsc.samples : 0
    }
    set numSamples(value) {
        if (this._tsc) {
            this._tsc.setOption("samples", value);
        }
    }

    get hasRandom() {
        return this.components.some(d => d.hasRandom)
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

    setInstances(number) {
        this.instances = number;
        this.components.forEach(c => c.setInstances(number));
        this.generate();
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

    hasComponent(id) {
        return this.getComponent(id) !== undefined;
    }

    randomSeed() {
        this.components.forEach(c => c.setSeed(randi()));
        this.generate();
    }

    addComponent(generatorType, nodeID) {
        if (generatorType && (generatorType in GENERATOR_DEFAULTS)) {
            const generator = new Generator(generatorType, [randi()]);
            this.components.push(new TimeSeriesComponent(this, this.instances, generator))
        } else {
            this.components.push(new TimeSeriesComponent(this, this.instances))
        }

        const last = this.components.at(-1)
        this.compositor.addData(
            last.id,
            last.name,
            last.generator.type,
            nodeID
        );
        this.generate();
    }

    removeComponent(id) {
        const idx = this.componentIDs.indexOf(id);
        if (idx >= 0) {
            this.components.splice(idx, 1)
            this.compositor.remove(id);
        }
        if (!this.hasRandom) {
            this.instances = 1;
        }

        this.generate();
    }

    replaceComponent(nodeID, generatorType) {
        const c = this.getComponent(nodeID);
        if (!c || !generatorType || !(generatorType in GENERATOR_DEFAULTS)) {
            throw new Error("unknown component")
        }

        const generator = new Generator(generatorType, [randi()]);
        c.setGenerator(generator);
        if (!c.wasRenamed) {
            c.name = this.getName(generator)
        }

        this.compositor.setNodeData(nodeID, c.name, generator.type)
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

    generate(xValues, force=false) {

        if (!this._tsc) return;

        let leftVals, rightVals;

        const samples = this.numSamples;
        const baseVals = filled(0, samples);

        xValues = xValues ? xValues : (this._tsc.dataX ? this._tsc.dataX : samples);

        const getComp = id => {
            const c = this.getComponent(id);
            if (c && (force || c.data.length === 0 || c.data[0].length !== samples)) {
                c.generate(xValues)
            }
            return c;
        }

        const getNode = id => {
            const traverse = node => {
                if (node.id === id) {
                    return node;
                }

                for (let i = 0; i < node.children.length; ++i) {
                    const n = traverse(node.children[i]);
                    if (n) {
                        return n;
                    }
                }
            }
            return traverse(this.tree.root)
        }
        const getNodeVals = id => {
            const node = getNode(id);
            return Array.isArray(node.values) ? node.values : node.values[node.data];
        }

        const apply = op => {
            switch(op) {
                default:
                case OPERATOR.ADD:
                    return mapFun(i => add(leftVals[i], rightVals[i]), samples);
                case OPERATOR.MULTIPLY:
                    return mapFun(i => multiply(leftVals[i], rightVals[i]), samples);
                case OPERATOR.SUBTRACT:
                    return mapFun(i => subtract(leftVals[i], rightVals[i]), samples);
            }
        }

        let leftNode, rightNode;
        this.makeTree()

        const OPLIST = Object.values(OPERATOR);

        // create array of arrays
        const values = [];
        for (let i = this.instances-1; i >= 0; --i) {

            values[i] = filled(0, samples);

            leftNode = null;
            rightNode = null;

            this.compositor.iterate((opCase, left, op, opID, right) => {

                const hasLeft = left !== undefined && left !== null;
                const hasOp = op !== undefined && op !== null && opID;
                const hasRight = right !== undefined && right !== null;

                switch(opCase) {
                    case OP_CASE.APPLY_BOTH: {
                        console.assert(hasLeft && hasOp && hasRight, "wrong case - missing data");
                        const cl = getComp(left);
                        const cr = getComp(right);

                        leftVals = cl ? cl.getData(i) : getNodeVals(left);
                        rightVals = cr ? cr.getData(i) : getNodeVals(right);

                        if (cl) {
                            leftNode = getNode(left);
                            leftNode.color = cl.generator.type;
                        }
                        if (cr) {
                            rightNode = getNode(right);
                            rightNode.color = cr.generator.type;
                        }

                        break;
                    }
                    case OP_CASE.APPLY_LEFT: {
                        console.assert(hasLeft, "wrong case - missing left");
                        const c = getComp(left);

                        leftVals = c ? c.getData(i) : getNodeVals(left);
                        if (c) {
                            leftNode = getNode(left);
                            leftNode.color = c.generator.type;
                        }

                        rightVals = hasRight ? getNodeVals(right) : baseVals;
                        break;
                    }
                    case OP_CASE.APPLY_RIGHT: {
                        console.assert(hasRight, "wrong case - missing right");
                        const c = getComp(right);

                        leftVals = hasLeft ? getNodeVals(left) : baseVals;

                        rightVals = c ? c.getData(i) : getNodeVals(right);
                        if (c) {
                            rightNode = getNode(right);
                            rightNode.color = c.generator.type;
                        }
                        break;
                    }
                }

                if (leftNode) {
                    leftNode.values = Array.from(leftVals)
                    leftNode = null;
                }
                if (rightNode) {
                    rightNode.values = Array.from(rightVals)
                    rightNode = null;
                }

                if (hasOp) {
                    const opNode = getNode(opID);
                    opNode.values = {}
                    OPLIST.forEach(o => {
                        const result = apply(o);
                        if (op === o) { values[i] = result; }
                        opNode.values[o] = Array.from(result);
                    });
                }
            });

            if (this.clampMin || this.clampMax) {

                if (this.clampMin && this.clampMax && this.clampMinValue >= this.clampMaxValue) {
                    console.error("invalid clamp values")
                    break;
                }

                inmap(values[i], d => {
                    if (this.clampMin && this.clampMax) {
                        return clamp(d, this.clampMinValue, this.clampMaxValue)
                    } else if (this.clampMin) {
                        return Math.max(d, this.clampMinValue)
                    } else if (this.clampMax) {
                        return Math.min(d, this.clampMaxValue)
                    }
                });
            }
        }

        this.dataY = values;
        this.update()
        return this.dataY;
    }

    update() {
        this.lastUpdate = Date.now();
        this._tsc.update();
    }

    _chartDataSingle(index, opacity) {
        console.assert(index >= 0 && index < this.instances, "invalid instance index for time series")

        const data = [];
        this.components.forEach(c => {
            const result = [];
            if (!c.visible) return;
            c.data[index].forEach((d, i) => result.push([this._tsc.dataX[i], d]));
            data.push({
                id: c.id,
                color: c.generator.type,
                opacity: opacity,
                values: result
            });
        });

        const result = [];
        this.dataY[index].forEach((d, i) => result.push([this._tsc.dataX[i], d]));
        data.push({
            id: "result",
            color: "result",
            opacity: 1,
            values: result
        });

        return data;
    }

    toChartData(single=true, opacity=0.2) {
        if (this.dataY.length === 0 || this.dataY[0].length !== this.numSamples) {
            this.generate();
        }

        if (single) {
            return this._chartDataSingle(0, opacity)
        }

        let data = [];
        for (let idx = 0; idx < this.dataY.length; ++idx) {
            const result = [];
            this.dataY[idx].forEach((d, i) => result.push([this._tsc.dataX[i], d]));
            data.push({
                id: this.id,
                color: this.id,
                opacity: opacity,
                values: result
            });
        }

        return data;
    }
}