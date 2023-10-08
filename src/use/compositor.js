import copy from "@stdlib/utils/copy";

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

let ID_NUM = 0;

class CompGroup {

    constructor(parent=null) {
        this.data = [];
        this.parent = parent;
        this.lastNode = null;
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
    }

    remove(id) {
        const index = this.flat.findIndex(node => node.id === id);
        if (index >= 0) {
            this.flat.splice(index, 1);
        }
    }

    setOperator(id, newOp) {
        const node = this.flat.find(node => node.id === id);
        if (node) {
            node.name = newOp;
        }
    }

    rename(id, name) {
        this.flat.forEach(node => {
            if (node.id === id) {
                node.name = name;
            }
        });
    }

    _treeFindGroup(id) {

        const find = g => {

            if ((!(g.left instanceof CompGroup) && g.left === id) || g.op === id ||
                (!(g.right instanceof CompGroup) && g.right === id)
            ) {
                return g;
            }

            if (g.left instanceof CompGroup) {
                const result = find(g.left);
                if (result !== null) {
                    return result;
                }
            }
            if (g.right instanceof CompGroup) {
                const result = find(g.right);
                if (result !== null) {
                    return result;
                }
            }

            return null;
        }

        return this.find(this.tree)
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

        const printTree = (left, op, right) => {
            if ((left && !(left instanceof CompGroup)) &&
                (right && !(right instanceof CompGroup))
            ) {
                const nl = this.getNode(left);
                const no = this.getNode(op);
                const nr = this.getNode(right);
                console.log(
                    nl ? nl.name : "NOPE",
                    no ? no.name : "NOPE",
                    nr ? nr.name : "NOPE"
                )
            } else if (left instanceof CompGroup && !(right instanceof CompGroup)) {
                const no = this.getNode(op);
                const nr = this.getNode(right);
                console.log(
                    "----",
                    no ? no.name : "NOPE",
                    nr ? nr.name : "NOPE"
                )
            } else if (right instanceof CompGroup && !(left instanceof CompGroup)) {
                const nl = this.getNode(node.left);
                const no = this.getNode(node.op);
                console.log(
                    nl ? nl.name : "NOPE",
                    no ? no.name : "NOPE",
                    "----",
                )
            }
        }
        // this._treeTraverse(printTree);
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
                    this.tree.lastNode = newNode;
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
                    if (node === this.tree) {
                        node.lastNode = null;
                        this.tree = newNode;
                        newNode.lastNode = node;
                    } else {
                        this.tree.lastNode = node;
                    }
                    break;
                }
            }
        }
    }

    _treeTraverse(callback) {

        if (!this.tree) return;

        const traverse = node => {
            if (!node) return;
            callback(node.left, node.op, node.right);
            traverse(node.parent)
        }

        traverse(this.tree.lastNode ? this.tree.lastNode : this.tree);
    }

    iterate(callback) {

        if (this.size === 0) return;

        // only one component
        if (this.size === 1) {
            callback(this.flat[0])
            return;
        }

        // only one operation
        if (this.size === 3) {
            callback(this.flat[0], this.flat[1], this.flat[2])
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
                    this.getNode(node.left),
                    this.getNode(node.op),
                    this.getNode(node.right),
                );
                // go to parent
                return traverse(node.parent)
            }

            // nested on left side (already visited)
            if (node.left instanceof CompGroup && !(node.right instanceof CompGroup)) {
                callback(
                    null,
                    this.getNode(node.op),
                    this.getNode(node.right),
                );

            // nested on right side (already visited)
            } else if (node.right instanceof CompGroup && !(node.left instanceof CompGroup)) {
                callback(
                    this.getNode(node.left),
                    this.getNode(node.op),
                );

            // should not happen at all?!
            } else {
                console.error("should not happen?!")
            }

            // go to parent
            traverse(node.parent)
        };

        traverse(this.tree.lastNode);
    }
}

export { Compositor as default, OPERATOR, NODE_TYPE };