class CircularDependencyError extends Error {}
class DependencyNotFoundError extends Error{}

class LazyGraph {
    receiveGraph(graph) {
        this.graph = graph;
        this.dependencies = new Map();
        this.solution = new Map();
        return this;
    }

    calcVertex(vertex) {
        if (!this.solution.has(vertex)) {
            if (!this.dependencies.has(vertex)) {
                this.getDependencies(vertex);
            }
            this.getSolution(vertex);
        }
        return this.solution.get(vertex);
    }

    getDependencies(vertex, visited=new Set()) {
        let parents = [];
        try {
            parents = this.getParents(this.graph[vertex]);
        } catch(err) {
            throw new DependencyNotFoundError(`Dependent function "${vertex}" is not in a graph`);
        }
        visited.add(vertex);
        for (let parent of parents)  {
            if (!this.dependencies.has(parent)) {
                if (visited.has(parent)) {
                    throw new CircularDependencyError("Circular dependencies are found");
                }
                this.getDependencies(parent, visited);
            }
        }
        this.dependencies.set(vertex, parents);
        visited.delete(vertex);
    }

    getSolution(vertex) {
        let value = this.graph[vertex].apply(null, this.dependencies.get(vertex).map(n => this.calcVertex(n)));
        this.solution.set(vertex, value);
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

function test() {
    let graphs = [
        {
            graph: {z: (x) => x * 3, x: (y) => y + 1, y: () => 5},
            answer: {y: 5, x: 6, z: 18}
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
            graph: {x: (y, z) => y + z, y: () => 5, z: () => 10},
            answer: {x: 15, y: 5, z: 10}
        },

    ];

    for (let aGraph of graphs) {
        for (var property in aGraph.answer) {
            if (aGraph.answer.hasOwnProperty(property)) {
                let result = (new LazyGraph().receiveGraph(aGraph.graph)).calcVertex(property);
                if (result != aGraph.answer[property]) {
                    throw new Error(`Expected: ${JSON.stringify(aGraph.answer[property])}, but got ${JSON.stringify(result)}`);
                }
            }
        }
    }
}


function testCircularDependency() {
    let aGraph = {
        graph: {z: (x) => x * 3, x: (y) => y + 1, y: (z) => z + 5},
    }
    let result = (new LazyGraph().receiveGraph(aGraph.graph)).calcVertex('z');

}

function testDependencyNotFound() {

    let aGraph = {
        graph: {z: (x) => x * 3, x: (y) => y + 1, y: (w) => w + 5},
    }
    let result = (new LazyGraph().receiveGraph(aGraph.graph)).calcVertex('z');
}

function testIncorrecCallArgument() {
    let aGraph = {
        graph: {z: (x) => x * 3, x: (y) => y + 1, y: () => 5},
    }
    let result = (new LazyGraph().receiveGraph(aGraph.graph)).calcVertex('k');

}

(function testAll() {
    testFunctions = [{test: test}, {test: testCircularDependency, err: new CircularDependencyError()},
        {test: testDependencyNotFound, err: new DependencyNotFoundError()},
        {test: testIncorrecCallArgument, err: new DependencyNotFoundError()},
    ]
    for (let func of testFunctions) {
        try {
            func.test();
        } catch (e) {
            if (!func.hasOwnProperty("err") || e.constructor != func.err.constructor){
                throw e;
            }
        }
    }
    console.log("LazyGraph - All tests are passed")
})();

