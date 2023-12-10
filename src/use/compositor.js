const OPERATOR = Object.freeze({
    ADD: "ADD",
    SUBTRACT: "SUBTRACT",
    MULTIPLY: "MULTIPLY",
});

const NODE_TYPE = Object.freeze({
    DATA: "DATA",
    OPERATOR: "OPERATOR",
})

const OP_CASE = Object.freeze({
    APPLY_LEFT: "APPLY_LEFT",
    APPLY_RIGHT: "APPLY_RIGHT",
    APPLY_BOTH: "APPLY_BOTH",
    APPLY_NESTED_LEFT: "APPLY_NESTED_LEFT",
    APPLY_NESTED_RIGHT: "APPLY_NESTED_RIGHT",
});

class TreeNode {

    constructor(parent=null, data=null) {
        this.parent = parent;
        this.data = data;
        this.left = null;
        this.right = null;

        this.depth = parent === null ? 0 : parent.depth + 1;
        this.visited = false;
    }

    static fromArray(array) {
        if (array.length === 0) return new TreeNode();
        return TreeNode.buildTree(null, array[1], array[0], array[2]);
    }

    static buildTree(parent, data, left, right) {
        const node = new TreeNode(parent, data);
        if (left) {
            node.setLeft(TreeNode.buildTree(node, left[1], left[0], left[2]));
        }
        if (right) {
            node.setRight(TreeNode.buildTree(node, right[1], right[0], right[2]));
        }
        return node;
    }

    get full() {
        return this.data && this.hasLeft() && this.hasRight();
    }

    get maxDepth() {
        return this.getMaxDepth();
    }

    setDepth(depth) {
        this.depth = depth;
        this.traverseDown(n => n.depth = n.parent ? n.parent.depth+1 : 0)
    }

    hasLeft() {
        return this.left !== null && this.left !== undefined;
    }
    hasRight() {
        return this.right !== null && this.right !== undefined;
    }

    setLeft(node) {
        this.left = node;
        if (this.left instanceof TreeNode) {
            this.left.parent = this;
            this.left.setDepth(this.depth+1)
        }
    }
    addLeft(data) {
        this.setLeft(new TreeNode(this, data));
    }

    setRight(node) {
        this.right = node;
        if (this.right instanceof TreeNode) {
            this.right.parent = this;
            this.right.setDepth(this.depth+1)
        }
    }
    addRight(data) {
        this.setRight(new TreeNode(this, data));
    }

    getMaxDepth() {
        if (!this.isNested()) {
            return this.depth;
        }
        if (this.isNestedLeft(true)) {
            return this.left.getMaxDepth();
        }
        if (this.isNestedRight(true)) {
            return this.right.getMaxDepth();
        }
        return Math.max(this.left.getMaxDepth(), this.right.getMaxDepth())
    }

    getMaxDepthLeft() {
        if (this.isNestedLeft()) {
            return this.left.getMaxDepth();
        }
        return this.depth;
    }

    getMaxDepthRight() {
        if (this.isNestedRight()) {
            return this.right.getMaxDepth();
        }
        return this.depth;
    }

    getLastNode() {
        if (!this.isNested()) {
            return this;
        }
        let l, r;
        if (this.isNestedLeft()) {
            l = this.left.getLastNode();
        }
        if (this.isNestedRight()) {
            r = this.right.getLastNode();
        }

        if (l && !r) return l;
        if (r && !l) return r;

        return l.depth > r.depth ? l : r;
    }

    getLastNodeLeft() {
        if (this.isNestedLeft()) {
            return this.left.getLastNode();
        }
        return this;
    }

    getLastNodeRight() {
        if (this.isNestedRight()) {
            return this.right.getLastNode();
        }
        return this;
    }

    find(callback) {
        if (callback(this)) {
            return this;
        }
        if (this.isNestedLeft()) {
            const node = this.left.find(callback);
            if (node) return node;
        }
        if (this.isNestedRight()) {
            const node = this.right.find(callback);
            if (node) return node;
        }
    }

    includes(callback) {
        return callback(this.data) ||
            (!this.isNestedLeft() || this.left.includes(callback)) ||
            (!this.isNestedRight() || this.right.includes(callback))
    }

    isNested() {
        return this.isNestedLeft() || this.isNestedRight()
    }
    isNestedLeft(exclusive=false) {
        return this.left instanceof TreeNode && (!exclusive || !this.isNestedRight())
    }
    isNestedRight(exclusive=false) {
        return this.right instanceof TreeNode && (!exclusive || !this.isNestedLeft())
    }

    traverseUp(callback) {
        callback(this);
        if (this.parent) {
            this.parent.traverseUp(callback);
        }
    }
    traverseDown(callback) {
        callback(this);
        if (this.isNestedLeft()) {
            this.left.traverseDown(callback);
        }
        if (this.isNestedRight()) {
            this.right.traverseDown(callback);
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

    nodesAtDepth(depth) {
        const nodes = [];
        this.traverseDown(node => {
            if (node.depth === depth) {
                nodes.push(node);
            }
        });
        return nodes;
    }

    leaves() {
        const nodes = [];
        this.traverseDown(node => {
            if (!node.isNested()) {
                nodes.push(node);
            }
        });
        return nodes;
    }

    toArray(deep=false) {
        return [
            this.left ? this.left.toArray() : null,
            deep && typeof data === "object" ? Object.assign({}, this.data) : this.data,
            this.right ? this.right.toArray() : null
        ]
    }

    toString() {
        // return JSON.stringify(this.toArray(), null, 2)
        let str = Array(this.depth+1).join('--|') + ` ${this.data.name} (${this.data.id})\n`
        if (this.isNestedLeft()) { str += this.left.toString() }
        if (this.isNestedRight()) { str += this.right.toString() }
        return str;
    }
}

class Compositor {

    constructor(items=[]) {
        this.tree = items.length > 0 ? TreeNode.fromArray(items) : null;
        this.size = 0;
        this.lastTreeNode = this.tree ? this.tree : null;
        this.ID_NUM = 0;
        if (items.length > 0) {
            this.tree.traverseDown(node => {
                this.ID_NUM = Math.max(
                    this.ID_NUM,
                    Number.parseInt(node.data.id.slice(node.data.id.indexOf("_")+1)) + 1
                );
                if (node.depth >= this.lastTreeNode.depth) {
                    this.lastTreeNode = node;
                }
                this.size++;
            });
        }
    }

    toJSON() {
        return this.tree ? this.tree.toArray(true) : [];
    }

    static fromJSON(json) {
        return new Compositor(json);
    }

    copy() {
        return new Compositor(this.toJSON())
    }

    nextID() {
        return "op_" + (this.ID_NUM++)
    }

    static isOperator(item) {
        return item in OPERATOR;
    }

    clear() {
        this.size = 0;
        this.tree = null;
        this.lastTreeNode = null;
    }

    setLastNode(id) {
        const node = this.getNode(id)
        if (node) {
            console.assert(!node.full, "cannot set to full node")
            this.lastTreeNode = this.size >= 3 ? node : this.tree;
            return true;
        }
        return false
    }

    getNode(id) {
        return this.tree ? this.tree.find(d => d.data.id === id) : null;
    }

    addData(id, name, genType, nodeID=null) {

        const obj = {
            name: name,
            id: id,
            type: NODE_TYPE.DATA,
            genType: genType
        };

        // when tree is empty
        if (this.size === 0) {
            this.addOperator(OPERATOR.ADD);
            this.addData(id, name, genType)
        } else {
            const node = nodeID !== null && nodeID !== undefined ?
                this.getNode(nodeID) : this.lastTreeNode

            if (!node) {
                throw new Error("missing a node to add to")
            }

            console.assert(!node.full, "node cannot be full when adding data")

            if (node.data.type === NODE_TYPE.DATA) {
                const opNodeID = this.addOperator(OPERATOR.ADD, node.data.id, true)
                this.addData(id, name, genType, opNodeID)
            } else {
                if (node.isNestedLeft()) {
                    node.addRight(obj)
                    if (node.full) {
                        this.lastTreeNode = node.right;
                    }
                } else {
                    node.addLeft(obj)
                    if (node.full) {
                        this.lastTreeNode = node.left;
                    }
                }
                this.size++;
            }
        }

        return id;
    }

    addOperator(op, nodeID=null, setLeft=false) {

        if (!Compositor.isOperator(op)) {
            throw new Error("invalid input - not an operator");
        }

        const id = this.nextID();
        const obj = {
            name: op,
            id: id,
            type: NODE_TYPE.OPERATOR
        };

        // when tree is empty
        if (this.size === 0) {
            this.tree = new TreeNode(null, obj);
            this.lastTreeNode = this.tree;
        } else {
            const node = nodeID !== null && nodeID !== undefined ?
                this.getNode(nodeID) : this.lastTreeNode

            if (!node) {
                throw new Error("missing a node to add to")
            }

            console.assert(!node.isNested(), "can only append operator to leaf node")
            const data = node.data;
            node.data = obj;

            let nextNode;
            if (setLeft) {
                node.addLeft(data)
                nextNode = node.left;
            } else {
                node.addRight(data)
                nextNode = node.right;
            }

            if (nextNode.depth > this.lastTreeNode.depth) {
                this.lastTreeNode = nextNode;
            }
        }

        this.size++;
        return id;
    }

    remove(id) {
        if (this.tree === null) return;

        const node = this.getNode(id);
        if (node) {
            console.assert(!node.isNested(), "can only remove leaf nodes")

            if (node === this.tree) {
                this.tree = null;
                this.lastTreeNode = null;
                this.size = 0;
            } else {
                const onLeft = node.parent.left === node;

                // if there is a node on the parent's other side
                if (onLeft && node.parent.isNestedRight() ||
                    !onLeft && node.parent.isNestedLeft()
                ) {
                    const p = node.parent.parent;
                    if (!p) {
                        const other = onLeft ? node.parent.right : node.parent.left;
                        if (other.isNested()) {
                            this.tree = other;
                            this.tree.parent = null;
                            this.tree.setDepth(0)
                            this.size -= 2;
                            this.lastTreeNode = this.tree.getLastNode();
                        } else {
                            if (onLeft) {
                                node.parent.setLeft(null)
                            } else {
                                node.parent.setRight(null)
                            }
                            this.size--;
                            this.lastTreeNode = node.parent;
                        }
                    } else {
                        const pOnLeft = p.left === node.parent;
                        if (pOnLeft) {
                            p.setLeft(onLeft ? node.parent.right : node.parent.left);
                        } else {
                            p.setRight(onLeft ? node.parent.right : node.parent.left);
                        }
                        this.size -= 2;
                        this.lastTreeNode = this.tree.getLastNode();
                    }

                } else {
                    this.tree = null;
                    this.lastTreeNode = null;
                    this.size = 0;
                    // if (node.parent.left === node) {
                    //     node.parent.setLeft(null);
                    // } else {
                    //     node.parent.setRight(null);
                    // }
                    // this.size--;
                    // this.lastTreeNode = node.parent;
                }
            }
        }
    }

    setOperator(id, newOp) {
        const node = this.getNode(id);
        if (node) {
            node.data.name = newOp;
        }
    }

    setNodeData(id, name, genType) {
        const node = this.getNode(id);
        if (node) {
            node.data.name = name;
            node.data.genType = genType;
        }
    }

    switchData(fromID, toID) {
        const nodeFrom = this.getNode(fromID);
        const nodeTo = this.getNode(toID);
        if (nodeFrom !== nodeTo) {
            const tmp = nodeFrom.data;
            nodeFrom.data = nodeTo.data;
            nodeTo.data = tmp;
        }
    }

    rename(id, name) {
        const node = this.getNode(id);
        if (node) {
            node.data.name = name;
        }
    }

    toTree() {

        if (this.size === 0) {
            return {
                root: {},
                maxDepth: 0,
                numLeaves: 0,
                addNodeID: ""
            };
        }

        let maxDepth = 0, numLeaves = 0;

        const build = node => {

            const currentNode = {
                depth: node.depth,
                id: node.data.id,
                type: node.data.type,
                data: node.data.name,
                parent: node.parent ? node.parent.data.id : null,
                children: []
            }
            maxDepth = Math.max(maxDepth, node.depth);

            if (node.isNestedLeft()) {
                currentNode.children.push(build(node.left))
            }
            if (node.isNestedRight()) {
                currentNode.children.push(build(node.right))
            }

            if (currentNode.children.length === 0) {
                numLeaves++;
            }

            return currentNode
        };

        return {
            root: build(this.tree),
            maxDepth: maxDepth,
            numLeaves: numLeaves,
            addNodeID: this.lastTreeNode.data.id
        };
    }

    iterate(callback) {

        if (!this.tree || this.size === 0) return;

        // console.log(this.tree.toString())

        // only one component
        if (this.size === 2) {
            return callback(
                OP_CASE.APPLY_LEFT,
                this.tree.left.data.id,
                this.tree.data.name,
                this.tree.data.id,
                null
            );
        }

        // only one operation
        if (this.size === 3) {
            return callback(
                OP_CASE.APPLY_BOTH,
                this.tree.left.data.id,
                this.tree.data.name,
                this.tree.data.id,
                this.tree.right.data.id,
            );
        }

        const apply = node => {

            if (node.visited) {
                return;
            }

            if (node.isNestedLeft(true)) {
                callback(
                    OP_CASE.APPLY_LEFT,
                    node.left.data.id,
                    node.data.name,
                    node.data.id,
                    null,
                );
            } else if (node.isNestedRight(true)) {
                callback(
                    OP_CASE.APPLY_RIGHT,
                    null,
                    node.data.name,
                    node.data.id,
                    node.right.data.id,
                );
            } else if (node.isNested()) {
                callback(
                    OP_CASE.APPLY_BOTH,
                    node.left.data.id,
                    node.data.name,
                    node.data.id,
                    node.right.data.id,
                );
            }

            node.visited = true;
        }

        this.tree.setVisited(false);

        for (let i = this.tree.maxDepth-1; i >= 0; --i) {
            this.tree.nodesAtDepth(i).forEach(apply)
        }
    }
}

export { Compositor as default, OPERATOR, NODE_TYPE, OP_CASE };