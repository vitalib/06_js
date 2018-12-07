class CircularDependencyError extends Error {}
class DependencyNotFoundError extends Error{}

class EagerGraph {
    receiveGraph(graph) {
        this.graph = graph;
        this.dependencies = this.getDependencies();
        this.orderOfCalls = this.getOrderOfCalls();
        this.solution =  this.getSolution();
        return this.solution;
    }

    getDependencies() {
        let funcs = new Set();
        for (let key of Object.keys(this.graph)) {
            funcs.add(key);
        }
        let dependencies = new Map();
        for (let key of Object.keys(this.graph)) {
            let parents = this.getParents(this.graph[key]);
            for (let parent of parents) {
                if (!funcs.has(parent)){
                    throw new DependencyNotFoundError(`Dependecy "${parent} is not found`);
                }
            }
            dependencies.set(key, parents);
        }
       return dependencies;
    }

    getOrderOfCalls() {
        let dependencyMap = new Map();
        for (let funcDependArr of this.dependencies.entries()){
           dependencyMap.set(funcDependArr[0], new Set(funcDependArr[1]));
        }
        let allFunctions = new Set(dependencyMap.keys());
        let orderOfCalls = [];
        while(allFunctions.size != 0) {
            let nextFunc = "";
            for (let func of allFunctions) {
                // if found a function without dependencies or where all dependecies are already resolved
                if (dependencyMap.get(func).size == 0) {
                    nextFunc= func;
                    break;
                }
            }
            if (!nextFunc) {
               throw new CircularDependencyError("Circular dependencies found");
            } else {
                orderOfCalls.push(nextFunc);
                allFunctions.delete(nextFunc);
                for (let functionSet of dependencyMap.values()){
                    functionSet.delete(nextFunc);
                }
            }
        }
        return orderOfCalls;
    }

    getSolution() {
        this.solution = {};
        for (let func of this.orderOfCalls) {
            this.solution[func] = this.graph[func].apply(null, this.dependencies.get(func).map(n => this.solution[n]));
        }
        return this.solution;
    }

    getParents(func) {
        let funcString = func.toString().replace(/ /g, '');
        let parents = /\((.*)\)/.exec(funcString)[1];
        if (parents == "") {
            return [];
        } else {
            return parents.split(",");
        }
    }
}


function isEquivalent(a, b) {
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}

function test() {
    let graphs = [
        {
            graph: {z: (x) => x * 3, x: (y) => y + 1, y: () => 5},
            answer: {y: 5, x: 6, z: 18},
        },
        {
            graph: {x: () => 5},
            answer: {x: 5}
        },
        {
            graph: {x: (y, z) => y + z, y: () => 5, z: () => 10},
            answer: {x: 15, y: 5, z: 10}
        },
        {
            graph: {x: (y, z) => y + z, y: (z) => z + " plus y ", z: () => "just z"},
            answer: {z: "just z", y: "just z plus y ", x: "just z plus y just z"}
        },
        {
            graph: {x: (y, z, w) => y + z * w, y: () => 1, z: () => 2, w: () => 3},
            answer: {x: 7, y: 1, z: 2, w: 3},
        },

        {
            graph: {x: (y, z, w) => y + z * w, y: () => 1, z: () => 2, w: (x) => x + 3},
            answer: {x: 7, y: 1, z: 2, w: 3},
            err: (new CircularDependencyError()),
        },
        {
            graph: {x: (y, z, w) => y + z * w, y: () => 1, z: () => 2, w: (k) => k + 3, l: () => 10},
            answer: {x: 7, y: 1, z: 2, w: 3},
            err: (new DependencyNotFoundError()),

        },
    ];

    for (let aGraph of graphs) {
        try {
            let result = (new EagerGraph().receiveGraph(aGraph.graph));
            if (!isEquivalent(result, aGraph.answer)) {
                throw new Error(`Expected: ${JSON.stringify(aGraph.answer)}, but got ${JSON.stringify(result)}`);
            }
        } catch (e) {
            if (!aGraph.hasOwnProperty("err") || e.constructor != aGraph.err.constructor) {
                throw e;
            }
        }

    }
    console.log("EagerGraph - All tests are passed")
}
test();
