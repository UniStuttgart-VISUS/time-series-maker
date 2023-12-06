const OPERATOR = Object.freeze({
    ADD: "ADD",
    SUBTRACT: "SUBTRACT",
    MULTIPLY: "MULTIPLY",
});

const NODE_TYPE = Object.freeze({
    DATA: "DATA",
    OPERATOR: "OPERATOR",
    BRACKETS: "BRACKETS",
})

const OP_CASE = Object.freeze({
    APPLY_LEFT: "APPLY_LEFT",
    APPLY_RIGHT: "APPLY_RIGHT",
    APPLY_BOTH: "APPLY_BOTH",
    APPLY_NESTED_LEFT: "APPLY_NESTED_LEFT",
    APPLY_NESTED_RIGHT: "APPLY_NESTED_RIGHT",
});

class CompGroup {

    constructor(parent=null) {
        this.data = [];
        this.parent = parent;
        this.depth = parent === null ? 0 : parent.depth + 1;
        this.lastNode = null;
        this.deepestNode = null;
        this.visited = false;
    }

    get size() { return this.data.length };

    get left() { return this.data[0] }
    set left(value) {
        if (value === null) {
            this.data = []
        } else {
            this.data[0] = value
        }
    }

    get op() { return this.data[1] }
    set op(value) {
        if (value === null) {
            this.data = [this.data[0]]
        } else {
            this.data[1] = value
        }
    }

    get right() { return this.data[2] }
    set right(value) {
        if (value === null) {
            this.data.pop();
        } else {
            this.data[2] = value
        }
    }

    includes(value) {
        return this.data.includes(value);
    }

    isNested() {
        return this.isNestedLeft() || this.isNestedRight()
    }
    isNestedLeft(exclusive=false) {
        return (this.left && this.left instanceof CompGroup) &&
            (!exclusive || !this.isNestedRight())
    }
    isNestedRight(exclusive=false) {
        return (this.right && this.right instanceof CompGroup) &&
            (!exclusive || !this.isNestedLeft())
    }

    traverse(callback) {
        callback(node.left, node.op, node.right);
        if (this.parent) {
            this.parent.traverse();
        }
    }

    setVisited(value=true) {
        this.visited = value;
        if (this.isNestedLeft()) {
            this.left.setVisited(value);
        }
        if (this.isNestedRight()) {
            this.right.setVisited(value);
        }
    }

    toArray() {
        if (!this.isNested()) {
            return this.data.slice()
        } else if (this.isNestedLeft(true)) {
            return [this.left.toArray(), this.op, this.right]
        } else if (this.isNestedRight(true)) {
            return [this.left, this.op, this.right.toArray()]
        } else {
            return [this.left.toArray(), this.op, this.right.toArray()]
        }
    }

    toString() {
        return JSON.stringify(this.toArray(), null, 2)
    }
}

class Compositor {

    constructor(items=[]) {
        this.flat = items;
        this.tree = null;
        this.ID_NUM = items.length;
        items.forEach(d => {
            this.ID_NUM = Math.max(this.ID_NUM, Number.parseInt(d.id.slice(d.id.indexOf("_")+1))+1);
        })
    }

    toJSON() {
        return this.flat.slice()
    }

    static fromJSON(json) {
        return new Compositor(json);
    }

    copy() {
        return new Compositor(this.flat.map(d => Object.assign({}, d)))
    }

    nextID() {
        return "op_" + (this.ID_NUM++)
    }


    static isOperator(item) {
        return item in OPERATOR;
    }

    get size() {
        return this.flat.length;
    }

    clear() {
        this.tree = null;
        this.flat = [];
    }

    getNode(id) {
        return this.flat.find(d => d.id === id);
    }

    getNodeIndex(id) {
        return this.flat.findIndex(d => d.id === id);
    }

    addData(id, name, genType) {

        // when tree is empty
        if (this.size === 0) {
            this.flat.push({ name: name, id: id, type: NODE_TYPE.DATA, genType: genType });
        } else {

            const node = this.flat[this.size-1]
            // last node is an operator
            if (node.type === NODE_TYPE.OPERATOR) {
                this.flat.push({ name: name, id: id, type: NODE_TYPE.DATA, genType: genType  });
            } else {
                // we have an item but are missing an operator - add ADD as default
                this.addOperator(OPERATOR.ADD);
                this.addData(id, name, genType)
            }
        }
        this.tree = null;
    }

    addOperator(op) {

        if (!Compositor.isOperator(op)) {
            console.error("invalid input - not an operator");
            return;
        }

        const id = this.nextID();
        // when tree is empty
        if (this.size === 0) {
            console.error("invalid input - cannot start with an operator");
            return;
        } else {
            this.flat.push({ name: op, id: id, type: NODE_TYPE.OPERATOR });
        }
        this.tree = null;
    }

    remove(id) {
        const index = this.flat.findIndex(node => node.id === id);
        if (index >= 0) {
            const isOp = this.flat[index].type === NODE_TYPE.OPERATOR;
            this.flat.splice(
                isOp || index === 0 ? index : index-1,
                2
            );
            this.tree = null;
        }
    }

    setOperator(id, newOp) {
        const node = this.flat.find(node => node.id === id);
        if (node) {
            node.name = newOp;
            this.tree = null;
        }
    }

    switchData(fromID, toID) {
        const fromIndex = this.getNodeIndex(fromID);
        const toIndex = this.getNodeIndex(toID);
        if (fromIndex >= 0 && fromIndex <= this.flat.length &&
            toIndex >= 0 && toIndex <= this.flat.length &&
            fromIndex !== toIndex
        ) {
            const from = this.flat[fromIndex];
            this.flat[fromIndex] = this.flat[toIndex];
            this.flat[toIndex] = from;
            this.tree = null;
        }
    }

    rename(id, name) {
        this.flat.forEach(node => {
            if (node.id === id) {
                node.name = name;
            }
        });
    }

    toTree() {
        if (!this.tree) {
            this._makeTree();
        } else {
            this.tree.setVisited(false)
        }

        let leafIndex = 0;
        const graph = { nodes: [], links: [] };

        if (this.size === 0) {
            return graph;
        }

        // only one or two component
        if (this.size < 3) {
            graph.nodes.push({
                depth: 1, id: this.flat[0].id, type: NODE_TYPE.DATA,
                index: 0, data: this.flat[0].name
            });
            graph.nodes.push({
                depth: 0,
                id: this.size === 1  ? "op_base" : this.flat[1].id,
                type: NODE_TYPE.OPERATOR,
                minIndex: 0, maxIndex: 0,
                data: this.size === 1 ? OPERATOR.ADD : this.flat[1].name
            });
            return graph;
        }

        const traverse = node => {

            // reached the end
            if (!node) return;

            // non-nested node
            if (!node.isNested()) {
                graph.nodes.push({
                    depth: node.depth+1, id: node.left, type: NODE_TYPE.DATA, index: leafIndex++,
                    data: this.getNode(node.left) ? this.getNode(node.left).name : ""
                });
                graph.nodes.push({
                    depth: node.depth, id: node.op, type: NODE_TYPE.OPERATOR,
                    minIndex: leafIndex-1, maxIndex: leafIndex,
                    data: this.getNode(node.op).name
                });
                graph.nodes.push({
                    depth: node.depth+1, id: node.right, type: NODE_TYPE.DATA, index: leafIndex++,
                    data: this.getNode(node.right) ? this.getNode(node.right).name : ""
                });
                graph.links.push({ source: node.op, target: node.left });
                graph.links.push({ source: node.op, target: node.right });
                node.visited = true;
                // go to parent
                return traverse(node.parent)
            }

            // nested on left side (already visited)
            if (node.isNestedLeft(true)) {
                graph.nodes.push({
                    depth: node.depth, id: node.op, type: NODE_TYPE.OPERATOR,
                    minIndex: Math.min(leafIndex, graph.nodes.find(d => d.id === node.left.op).minIndex),
                    maxIndex: Math.max(leafIndex, graph.nodes.find(d => d.id === node.left.op).maxIndex),
                    data: this.getNode(node.op).name,
                });
                graph.nodes.push({ depth: node.depth+1, id: node.right, type: NODE_TYPE.DATA, index: leafIndex++, data: this.getNode(node.right).name });
                graph.links.push({ source: node.op, target: node.right });
                graph.links.push({ source: node.op, target: node.left.op });
                node.visited = true;

            // nested on right side (already visited)
            } else if (node.isNestedRight(true)) {
                graph.nodes.push({
                    depth: node.depth, id: node.op, type: NODE_TYPE.OPERATOR,
                    minIndex: Math.min(leafIndex, graph.nodes.find(d => d.id === node.right.op).minIndex),
                    maxIndex: Math.max(leafIndex, graph.nodes.find(d => d.id === node.right.op).maxIndex),
                    data: this.getNode(node.op).name,
                });
                graph.nodes.push({ depth: node.depth+1, id: node.left, type: NODE_TYPE.DATA, index: leafIndex++, data: this.getNode(node.left).name });
                graph.links.push({ source: node.op, target: node.left });
                graph.links.push({ source: node.op, target: node.right.op });
                node.visited = true;

            // both are nested, but one should have already been visited
            } else if (node.isNested()) {

                const vLeft = node.left.visited;
                const vRight = node.right.visited;
                console.assert(vLeft ^ vRight, "only one side should have been visited beforehand");

                graph.nodes.push({
                    depth: node.depth, id: node.op, type: NODE_TYPE.OPERATOR,
                    minIndex: Math.min(
                        graph.nodes.find(d => d.id === node.left.op).minIndex,
                        graph.nodes.find(d => d.id === node.right.op).minIndex
                    ),
                    maxIndex: Math.max(
                        graph.nodes.find(d => d.id === node.left.op).minIndex,
                        graph.nodes.find(d => d.id === node.right.op).minIndex
                    ),
                    data: this.getNode(node.op).name,
                });
                graph.links.push({ source: node.op, target: node.left.op });
                graph.links.push({ source: node.op, target: node.right.op });
                node.visited = true;
            }

            // go to parent
            traverse(node.parent)
        };

        if (this.tree) {
            traverse(this.tree.deepestNode);
        }

        return graph;
    }

    _makeTree() {
        this.tree = null;

        if (this.size === 1) {
            this._treeAddData(this.flat[0].id);
            this._treeAddOperator('op_base', OPERATOR.ADD);
            return;
        }

        this.flat.forEach(node => {
            if (node.type === NODE_TYPE.DATA) {
                this._treeAddData(node.id);
            } else {
                this._treeAddOperator(node.id, node.name);
            }
            // console.log(this.tree.toString())
        })
    }

    _treeAddData(id) {

        // when tree is empty
        if (this.tree === null) {
            this.tree = new CompGroup();
            this.tree.left = id;
            this.tree.lastNode = this.tree;
            this.tree.deepestNode = this.tree;
        } else if (!this.tree.lastNode.right){
            this.tree.lastNode.right = id;
        } else {
            console.error("what?!")
        }
    }
    _treeAddOperator(id, op) {

        if (!Compositor.isOperator(op)) {
            console.error("invalid input - not an operator");
            return;
        }

        // when tree is empty
        if (this.tree === null) {
            console.error("invalid input - cannot start with an operator");
            return;
        } else if (!this.tree.op) {
            this.tree.op = id;
        } else {

            const node = this.tree.lastNode ? this.tree.lastNode : this.tree;

            // replace right side in previous array/operation
            const newNode = new CompGroup(node);
            newNode.left = node.right
            newNode.op = id;
            node.right = newNode
            // replace last node if it is deeper than previous or none exists
            if (newNode.depth >= this.tree.deepestNode.depth) {
                this.tree.deepestNode = newNode;
            }
            this.tree.lastNode = newNode;
        }
    }

    iterate(callback) {

        if (this.size === 0) return;

        // only one component
        if (this.size === 1) {
            callback(OP_CASE.APPLY_LEFT, this.flat[0].id, OPERATOR.ADD)
            return;
        }

        // only one operation
        if (this.size === 3) {
            return callback(
                OP_CASE.APPLY_BOTH,
                this.flat[0].id,
                this.flat[1].name,
                this.flat[2].id
            );
        }

        if (this.tree === null) {
            this._makeTree();
        } else {
            this.tree.setVisited(false)
        }

        const traverse = node => {

            // reached the end
            if (!node) return;

            // non-nested node
            if (!node.isNested()) {
                callback(
                    OP_CASE.APPLY_BOTH,
                    node.left,
                    this.getNode(node.op).name,
                    node.right,
                );
                node.visited = true;
                // go to parent
                return traverse(node.parent)
            }

            // nested on left side (already visited)
            if (node.isNestedLeft(true)) {
                callback(
                    OP_CASE.APPLY_RIGHT,
                    null,
                    this.getNode(node.op).name,
                    node.right,
                );
                node.visited = true;

            // nested on right side (already visited)
            } else if (node.isNestedRight(true)) {
                callback(
                    OP_CASE.APPLY_LEFT,
                    node.left,
                    this.getNode(node.op).name,
                );
                node.visited = true;

            // both are nested, but one should have already been visited
            } else if (node.isNested()) {

                const vLeft = node.left.visited;
                const vRight = node.right.visited;
                console.assert(vLeft ^ vRight, "only one side should have been visited beforehand");

                if (vLeft) {
                    // left side already calculated
                    callback(
                        OP_CASE.APPLY_NESTED_RIGHT,
                        node.right.left,
                        this.getNode(node.right.op).name,
                        node.right.right,
                        this.getNode(node.op).name
                    );
                    node.visited = true;
                }
                else if (vRight) {
                    // right side already calculated
                    callback(
                        OP_CASE.APPLY_NESTED_LEFT,
                        node.left.left,
                        this.getNode(node.left.op).name,
                        node.left.right,
                        this.getNode(node.op).name
                    );
                    node.visited = true;
                }
            }

            // go to parent
            traverse(node.parent)
        };

        traverse(this.tree.deepestNode);
    }

    iterateWithOpID(callback) {

        if (this.size === 0) return;

        // only one component
        if (this.size === 1) {
            return callback(
                OP_CASE.APPLY_LEFT,
                this.flat[0].id,
                OPERATOR.ADD,
                'op_base',
            );
        }

        // only one operation
        if (this.size === 3) {
            return callback(
                OP_CASE.APPLY_BOTH,
                this.flat[0].id,
                this.flat[1].name,
                this.flat[1].id,
                this.flat[2].id
            );
        }

        if (this.tree === null) {
            this._makeTree();
        } else {
            this.tree.setVisited(false)
        }

        const traverse = node => {

            // reached the end
            if (!node) return;

            // non-nested node
            if (!node.isNested()) {
                callback(
                    OP_CASE.APPLY_BOTH,
                    node.left,
                    this.getNode(node.op).name,
                    node.op,
                    node.right,
                );
                node.visited = true;
                // go to parent
                return traverse(node.parent)
            }

            // nested on left side (already visited)
            if (node.isNestedLeft(true)) {
                callback(
                    OP_CASE.APPLY_RIGHT,
                    null,
                    this.getNode(node.op).name,
                    node.op,
                    node.right,
                );
                node.visited = true;

            // nested on right side (already visited)
            } else if (node.isNestedRight(true)) {
                callback(
                    OP_CASE.APPLY_LEFT,
                    node.left,
                    this.getNode(node.op).name,
                    node.op,
                );
                node.visited = true;

            // both are nested, but one should have already been visited
            } else if (node.isNested()) {

                const vLeft = node.left.visited;
                const vRight = node.right.visited;
                console.assert(vLeft ^ vRight, "only one side should have been visited beforehand");

                if (vLeft) {
                    // left side already calculated
                    callback(
                        OP_CASE.APPLY_NESTED_RIGHT,
                        node.right.left,
                        this.getNode(node.right.op).name,
                        node.right.op,
                        node.right.right,
                        this.getNode(node.op).name,
                        node.op,
                    );
                    node.visited = true;
                }
                else if (vRight) {
                    // right side already calculated
                    callback(
                        OP_CASE.APPLY_NESTED_LEFT,
                        node.left.left,
                        this.getNode(node.left.op).name,
                        node.left.op,
                        node.left.right,
                        this.getNode(node.op).name,
                        node.op,
                    );
                    node.visited = true;
                }
            }

            // go to parent
            traverse(node.parent)
        };

        traverse(this.tree.deepestNode);
    }
}

export { Compositor as default, OPERATOR, NODE_TYPE, OP_CASE };