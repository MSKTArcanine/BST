import Queue from "./queue.js";

class Node {
    constructor(value){
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class IRemoval{
    constructor(value, root, parent, subnode){
        this.value = value;
        this.root = root;
        this.parent = parent;
        this.subnode = subnode;
        if(new.target === IRemoval) throw new Error('Abstract');
    }
    execute(){throw new Error('To implement')}
}

class RemoveLeaf extends IRemoval{
    constructor(value, root, parent, subnode){
        super(value, root, parent, subnode);
    }
    execute(){
        this.parent[this.subnode] = null;
    }
}

class RemoveNode extends IRemoval{
    constructor(value, root, parent, subnode){
        super(value, root, parent, subnode);
    }
    execute(){
        console.log('node !')
        if(this.parent[this.subnode].left){
            this.parent[this.subnode] = this.parent[this.subnode].left;
        }else{this.parent[this.subnode] = this.parent[this.subnode].right;}
    }
}

class RemoveRoot extends IRemoval{
    constructor(value, root, parent, subnode, rootInOrder, parentInOrder){
        super(value, root, parent, subnode);
        this.rootInOrder = rootInOrder;
        this.parentInOrder = parentInOrder;
    }
    execute(){
        console.log('node !')
        if(this.parent[this.subnode].left){
            this.parent[this.subnode] = this.parent[this.subnode].left;
        }else{this.parent[this.subnode] = this.parent[this.subnode].right;}
    }
}

export default class BST {
    constructor(array = []){
        this.root = null;
        this.storage = [...new Set(array)];
    }
    
    buildTree(){
        this.sortTree();
        this.root = this.arrayToTree(this.storage);
        return this.root;
    }   
    sortTree(){this.storage = [...new Set(this.storage)].sort()}
    arrayToTree(array, start = 0, end = array.length - 1){
        if(start > end) return null;
        let mid = start + Math.floor((end - start)/2);
        let root = new Node(array[mid])
        root.left = this.arrayToTree(array, start, mid - 1);
        root.right = this.arrayToTree(array, mid + 1, end);
        return root;
    }
    insertValue(value){
        this.traversalInsert(value);
        this.storage.push(value);
        return this;
    }
    traversalInsert(value){
        if(this.root === null) {this.root = new Node(value); return this};
        let root = this.root;
        while(root.value != value){
            if(value > root.value){
                if(root.right == null){
                    this.insert(root, value);
                    ; return}
                root = root.right;
            }else{if(root.left == null){this.insert(root, value); return} root = root.left}
        }
        throw new Error('Value already exist')
    }
    insert(root, value){
        const node = new Node(value);
        if(value > root.value){
            root.right = node;
        }else{root.left = node;}
    }
    inOrderRetrieval(root, parentInOrder = null){
        if(root.left == null)return [root, parentInOrder];
        parentInOrder = root;
        return this.inOrderRetrieval(root.left, parentInOrder);
    }
    remove(value){
        let root = this.root;
        let parent = null;
        let subnode = null;

        while(root.value != value){
            parent = root;
            if(value > root.value){
                subnode = 'right';
                root = root.right;
            }else{
                subnode = 'left';
                root = root.left;
            }
        }
        if(!root.left && !root.right){
            new RemoveLeaf(value, root, parent, subnode).execute();
        }else if((root.left == null && root.right) || (root.left && root.right == null)){
            new RemoveNode(value, root, parent, subnode).execute();
        }else if(root.left && root.right){
            let [rootInOrder, parentRootInOrder] = this.inOrderRetrieval(root.right, null);
            if(!rootInOrder.right){
                new RemoveLeaf(value, rootInOrder, parentRootInOrder ?? root, "right").execute();
                this.swapNodes(rootInOrder, root, parent, subnode);
            }else{
                new RemoveNode(value, rootInOrder, parentRootInOrder ?? root, "right").execute();
                this.swapNodes(rootInOrder, root, parent, subnode)
            }
        }
    } 
    swapNodes(rootInOrder, root, parent, subnode){
        [rootInOrder.left, rootInOrder.right] = [root.left, root.right];
        parent[subnode] = rootInOrder;
    }
    find(value){
        let root = {...this.root};
        while(root.value != value){
            if(value > root.value){
                root = root.right;
            }else{
                root = root.left;
            }
            if(!root) break;
        }
        if(root)
            return root;
        return "-1";
    }
    levelOrder(callback){
        const root = this.root;
        const queue = new Queue();
        queue.enqueue(root);
        while(!queue.isEmpty()){
            const dequeuedNode = queue.dequeue().value;
            callback(dequeuedNode);
            if(dequeuedNode.left) queue.enqueue(dequeuedNode.left);
            if(dequeuedNode.right) queue.enqueue(dequeuedNode.right);
        }
    }
    inOrder(callback, root = this.root){
        if(!root) return;
        callback(root);
        if(root.left) this.inOrder(callback, root.left);
        if(root.right) this.inOrder(callback, root.right);
    }
    preOrder(callback, root = this.root){
        if(!root) return;
        if(root.left) this.preOrder(callback, root.left);
        callback(root);
        if(root.right) this.preOrder(callback, root.right);
    }
    postOrder(callback, root = this.root){
        if(!root) return;
        if(root.left) this.postOrder(callback, root.left);
        if(root.right) this.postOrder(callback, root.right);
        callback(root);
    }
    height(node = this.root) {
        if (!node) return -1; 
        const leftHeight = this.height(node.left);
        const rightHeight = this.height(node.right);
        return Math.max(leftHeight, rightHeight) + 1; 
    }
    depth(value){
        let root = this.root;
        let counter = 0;
        while(value != root.value){
            if(value > root.value){
                root = root.right;
            }else{root = root.left}
            counter += 1;
        }
        return (value === root.value) ? counter : -1;
    }
    isBalanced(root = this.root) {
        if (!root) return true;
    
        const leftHeight = this.height(root.left);
        const rightHeight = this.height(root.right);
    
        if (Math.abs(leftHeight - rightHeight) > 1) {
            return false;
        }
        return this.isBalanced(root.left) && this.isBalanced(root.right);
    }
    rebalance(){
        const arr = [];
        this.levelOrder(x => arr.push(x.value));
        this.buildTree(arr);
        return this;
    }
}