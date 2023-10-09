const OPERATOR = Object.freeze({
    ADD: "ADD",
    SUBTRACT: "SUBTRACT",
    MULTIPLY: "MULTIPLY",
});
const OPERATOR_PRECEDENCE = Object.freeze({
    ADD: 1,
    SUBTRACT: 1,
    MULTIPLY: 2,
});
const PRECEDENCE_RESULT = Object.freeze({
    SAME: 0,
    MORE: 1,
    LESS: -1,
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

let ID_NUM = 0;

class CompGroup {

    constructor(parent=null) {
        this.data = [];
        this.parent = parent;
        this.depth = parent === null ? 1 : parent.depth + 1;
        this.lastNode = null;
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

    traverse(callback) {
        callback(node.left, node.op, node.right);
        if (this.parent) {
            this.parent.traverse();
        }
    }

    setVisited() {
        this.visited = true;
        if (this.left instanceof CompGroup) {
            this.left.setVisited();
        }
        if (this.right instanceof CompGroup) {
            this.right.setVisited();
        }
    }

    toArray() {

        if ((this.left && !(this.left instanceof CompGroup)) &&
            (this.right && !(this.right instanceof CompGroup))
        ) {
            return this.data.slice()
        } else if (this.left instanceof CompGroup && !(this.right instanceof CompGroup)) {
            return [this.left.toArray(), this.op, this.right]
        } else if (this.right instanceof CompGroup && !(this.left instanceof CompGroup)) {
            return [this.left, this.op, this.right.toArray()]
        } else if (this.left instanceof CompGroup && this.right instanceof CompGroup) {
            return [this.left.toArray(), this.op, this.right.toArray()]
        }

        return [];
    }

    toString() {
        return JSON.stringify(this.toArray(), null, 2)
    }
}

class Compositor {

    constructor() {
        this.flat = [];
        this.tree = null;
    }

    static nextID() {
        return "op_" + (ID_NUM++)
    }

    static precedence(opA, opB) {
        const diff = OPERATOR_PRECEDENCE[opA] - OPERATOR_PRECEDENCE[opB];
        if (diff < 0) return PRECEDENCE_RESULT.LESS;
        else if (diff > 0) return PRECEDENCE_RESULT.MORE
        return PRECEDENCE_RESULT.SAME;
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

    addData(id, name) {

        // when tree is empty
        if (this.size === 0) {
            this.flat.push({ name: name, id: id, type: NODE_TYPE.DATA });
        } else {

            const node = this.flat[this.size-1]
            // last node is an operator
            if (node.type === NODE_TYPE.OPERATOR) {
                this.flat.push({ name: name, id: id, type: NODE_TYPE.DATA });
            } else {
                // we have an item but are missing an operator - add ADD as default
                this.addOperator(OPERATOR.ADD);
                this.addData(id, name)
            }
        }
        this.tree = null;
    }

    addOperator(op) {

        if (!Compositor.isOperator(op)) {
            console.error("invalid input - not an operator");
            return;
        }

        const id = Compositor.nextID();
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

    _makeTree() {
        this.tree = null;
        this.flat.forEach(node => {
            if (node.type === NODE_TYPE.DATA) {
                this._treeAddData(node.id);
            } else {
                this._treeAddOperator(node.id, node.name);
            }
        })
    }

    _treeAddData(id) {

        // when tree is empty
        if (this.tree === null) {
            this.tree = new CompGroup();
            this.tree.left = id;
        } else if (!this.tree.right) {
            this.tree.right = id;
        } else if (this.tree.lastNode) {
            console.assert(!this.tree.lastNode.right, "right side must be free");
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
            const opNode = this.getNode(node.op)

            switch (Compositor.precedence(op, opNode.name)) {
                case PRECEDENCE_RESULT.MORE:
                case PRECEDENCE_RESULT.SAME: {
                    // replace right side in previous array/operation
                    const newNode = new CompGroup(node);
                    newNode.left = node.right
                    newNode.op = id;
                    node.right = newNode
                    // replace last node if it is deeper than previous or none exists
                    if (!this.tree.lastNode || newNode.depth >= this.tree.lastNode.depth) {
                        this.tree.lastNode = newNode;
                    }
                    break;
                }
                case PRECEDENCE_RESULT.LESS: {
                    // replace left side in previous array/operation
                    const newNode = new CompGroup(node);
                    newNode.left = node.left
                    newNode.op = node.op
                    newNode.right = node.right
                    node.left = newNode;
                    node.op = id;
                    node.right = null;
                    // replace last node if it is deeper than previous or none exists
                    if (!this.tree.lastNode || newNode.depth >= this.tree.lastNode.depth) {
                        if (node === this.tree) {
                            node.lastNode = null;
                            this.tree = newNode;
                            newNode.lastNode = node;
                        } else {
                            this.tree.lastNode = node;
                        }
                    }
                    break;
                }
            }
        }
    }

    iterate(callback) {

        if (this.size === 0) return;

        // only one component
        if (this.size === 1) {
            callback(OP_CASE.APPLY_LEFT, this.flat[0])
            return;
        }

        // only one operation
        if (this.size === 3) {
            callback(OP_CASE.APPLY_BOTH, this.flat[0], this.flat[1], this.flat[2])
            return;
        }

        if (this.tree === null) {
            this._makeTree();
        }

        const traverse = node => {

            // reached the end
            if (!node) return;

            // non-nested node
            if ((node.left && !(node.left instanceof CompGroup)) &&
                (node.right && !(node.right instanceof CompGroup))
            ) {
                callback(
                    OP_CASE.APPLY_BOTH,
                    this.getNode(node.left),
                    this.getNode(node.op),
                    this.getNode(node.right),
                );
                node.visited = true;
                // go to parent
                return traverse(node.parent)
            }

            // nested on left side (already visited)
            if (node.left instanceof CompGroup && !(node.right instanceof CompGroup)) {
                callback(
                    OP_CASE.APPLY_RIGHT,
                    null,
                    this.getNode(node.op),
                    this.getNode(node.right),
                );
                node.visited = true;

            // nested on right side (already visited)
            } else if (node.right instanceof CompGroup && !(node.left instanceof CompGroup)) {
                callback(
                    OP_CASE.APPLY_LEFT,
                    this.getNode(node.left),
                    this.getNode(node.op),
                );
                node.visited = true;

            // both are nested, but one should have already been visited
            } else if (node.left instanceof CompGroup && node.right instanceof CompGroup) {
                const vLeft = node.left.visited;
                const vRight = node.right.visited;
                console.assert(vLeft ^ vRight, "only one side should have been visited beforehand");

                if (vLeft) {
                    // left side already calculated
                    callback(
                        OP_CASE.APPLY_NESTED_RIGHT,
                        this.getNode(node.right.left),
                        this.getNode(node.right.op),
                        this.getNode(node.right.right),
                        this.getNode(node.op)
                    );
                    node.visited = true;
                }
                else if (vRight) {
                    // right side already calculated
                    callback(
                        OP_CASE.APPLY_NESTED_LEFT,
                        this.getNode(node.left.left),
                        this.getNode(node.left.op),
                        this.getNode(node.left.right),
                        this.getNode(node.op)
                    );
                    node.visited = true;
                }
            }

            // go to parent
            traverse(node.parent)
        };

        // console.log(this.tree.toString())

        traverse(this.tree.lastNode);
    }
}

export { Compositor as default, OPERATOR, NODE_TYPE, OP_CASE };