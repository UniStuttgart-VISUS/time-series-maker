import * as d3 from 'd3';

const OPERATOR = Object.freeze({
    ADD: "ADD",
    SUBTRACT: "SUBTRACT",
    MULTIPLY: "MULTIPLY",
});
const OPERATOR_PRECEDENCE = Object.freeze({
    ADD: 1,
    SUBTRACT: 0,
    MULTIPLY: 2,
});

const NODE_TYPE = Object.freeze({
    DATA: "DATA",
    OPERATOR: "OPERATOR",
    BRACKETS: "BRACKETS",
})

let ID_NUM = 0;

class Compositor {

    constructor() {
        this.tree = { children: [] };
        this.depth = 0;
        this.array = [];
    }

    static nextID() {
        return "op_" + (ID_NUM++)
    }

    static precedence(opA, opB) {
        return OPERATOR_PRECEDENCE[opA] - OPERATOR_PRECEDENCE[opB] >= 0;
    }

    static isOperator(item) {
        return item in OPERATOR;
    }

    get size() {
        return this.array.length;
    }

    clear() {
        this.tree = { children: [] };
        this.depth = 0;
        this.array = [];
    }

    getOpenNode() {

        const traverse = node => {
            if (node.children.length === 0 || (node.children.length === 1 &&
                node.type === NODE_TYPE.OPERATOR)
            ) {
                return node;
            }

            if (node.children[1]) {
                return traverse(node.children[1])
            }
            if (node.children[0]) {
                return traverse(node.children[0])
            }

            return null;
        }

        return traverse(this.tree)
    }

    addData(id, name) {

        // when tree is empty
        if (this.size === 0) {

            this.tree.name = OPERATOR.ADD;
            this.tree.type = NODE_TYPE.OPERATOR;
            this.tree.id = Compositor.nextID();

            this.tree.children.push({
                parent: this.tree,
                type: NODE_TYPE.DATA,
                name: name,
                id: id,
                children: []
            });

            this.depth = 1;

            this.array.push({ name: name, id: id, type: NODE_TYPE.DATA });
            this.array.push({
                name: OPERATOR.ADD,
                id: this.tree.id,
                type: NODE_TYPE.OPERATOR
            });

        } else {

            const node = this.getOpenNode()
            if (node) {
                // last node is an operator
                if (node.type === NODE_TYPE.OPERATOR) {

                    console.assert(node.children.length === 1, "operator node must have exactly one child");
                    // add
                    node.children.push({
                        parent: node,
                        type: NODE_TYPE.DATA,
                        name: name,
                        id: id,
                        children: []
                    });

                    this.array.push({ name: name, id: id, type: NODE_TYPE.DATA });

                } else {
                    // we have an item but are missing an operator - ADD default
                    this.addOperator(OPERATOR.ADD);

                    const lastNode = this.getOpenNode()

                    lastNode.children.push({
                        parent: lastNode,
                        type: NODE_TYPE.DATA,
                        name: name,
                        id: id,
                        children: []
                    });

                    this.array.push({ name: name, id: id, type: NODE_TYPE.DATA });
                }
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

            this.tree.name = op;
            this.tree.type = NODE_TYPE.OPERATOR;
            this.tree.id = id;
            this.tree.children = [];

            this.depth = 1;
            this.array.push({
                name: op,
                id: this.tree.id,
                type: NODE_TYPE.OPERATOR
            });

        } else {

            const node = this.getOpenNode()
            if (node) {

                console.assert(node.type !== NODE_TYPE.OPERATOR, "node - must NOT be an operator")
                console.assert(node.parent.type === NODE_TYPE.OPERATOR, "node must be an operator")

                if (Compositor.precedence(op, node.parent.name)) {
                    // the new operator has precedence - we can just add a node
                    const tmp = {
                        parent: node.parent,
                        type: NODE_TYPE.OPERATOR,
                        name: op,
                        id: id,
                        children: [node],
                    };
                    node.parent = tmp;

                } else {
                    // the previous operator has precedence - we need to switch stuff
                    const parent = node.parent;
                    if (!parent.parent) {
                        const newNode = {
                            type: NODE_TYPE.OPERATOR,
                            name: op,
                            id: id,
                            children: [parent],
                        }
                        parent.parent = newNode;
                        this.tree = newNode;
                    } else {
                        console.error("already has parent - should this happen?")
                    }
                }

                this.array.push({ name: op, id: id, type: NODE_TYPE.OPERATOR });
                this.depth++;
            }
        }
    }

    setOperator(id, newOp) {

        const traverse = node => {
            if (node.id === id) {

                if (node.parent && node.parent.type === NODE_TYPE.OPERATOR) {
                    if (this.precedence(newOp, node.parent.name)) {

                    } else {

                    }
                } else if (node.children[1] && node.children[1].type === NODE_TYPE.OPERATOR) {
                    if (this.precedence(newOp, node.node.children[1].name)) {

                    } else {

                    }
                }
                // node.name = newOp;
                return;
            }

            if (node.children[0]) {
                traverse(node.children[0])
            }
            if (node.children[1]) {
                traverse(node.children[1])
            }
        }

        traverse(this.tree)

        const node = this.array.find(node => node.id === id);
        if (node) {
            node.name = newOp;
        }
    }

    // TODO
    remove() {

        // if leaf - just remove

        // if (sub-tree) - rebuild tree?
    }

    rename(id, name) {

        const traverse = node => {
            if (node.id === id) {
                node.name = name;
            }

            if (node.children[0]) {
                traverse(node.children[0])
            }
            if (node.children[1]) {
                traverse(node.children[1])
            }
        }

        traverse(this.tree)

        this.array.forEach(node => {
            if (node.id === id) {
                node.name = name;
            }
        })
    }

    iterate(callback, attr=null) {

        if (this.depth === 0) return;
        if (this.depth === 1) {
            callback(this.tree, this.tree.children[1], this.tree.children[0])
            return;
        }

        const current = {
            op: null,
            right: null,
            left: null,
        };

        const apply = node => {

            if (!current.right) {
                current.right = node;
            } else if (!current.left) {
                current.left = node;
            } else if (!current.op) {
                current.op = node;
            }  else {
                callback(
                    attr ? current.op[attr] : current.op,
                    attr ? current.right[attr] : current.right,
                    attr ? current.left[attr] : current.left,
                );
                current.right = current.right.parent ? current.right : null;
                current.left = null;
                current.op = null;
            }
        };

        const traverse = node => {

            if (node.children[1]) {
                traverse(node.children[1])
            }
            if (node.children[0]) {
                traverse(node.children[0])
            }

            apply(node);
        };

        traverse(this.tree);

        if (current.left || current.right || current.op) {
            callback(
                attr ? current.op[attr] : current.op,
                attr ? current.right[attr] : current.right,
                attr ? current.left[attr] : current.left,
            );
        }
    }
}

export { Compositor as default, OPERATOR, NODE_TYPE };