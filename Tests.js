import {EagerGraph} from "./EagerGraph.js";
import {LazyGraph} from "./LazyGraph.js";
import {CircularDependencyError, DependencyNotFoundError} from "./Graph.js";

function test(className) {
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
            answer: {x: null, y: 1, z: 2, w: null},
            err: (new CircularDependencyError()),
        },
        {
            graph: {x: (y, z, w) => y + z * w, y: () => 1, z: () => 2, w: (k) => k + 3, l: () => 10},
            answer: {x: null, y: 1, z: 2, w: null},
            err: (new DependencyNotFoundError()),

        },
        {
            graph: {},
            answer: {},
        },
        {
            graph: {x: (y, z) => y + z, y: (x, z) => x - z, z: (x, y) => x * y},
            answer: {x: null, y: null, z: null},
            err: (new CircularDependencyError()),
        }
    ];
    for (let aGraph of graphs) {
        for (var property in aGraph.answer) {
            if (aGraph.answer.hasOwnProperty(property)) {
                try {
                    let result = (new className().receiveGraph(aGraph.graph)).calcVertex(property);
                    if (result != aGraph.answer[property]) {
                        throw new Error(`Expected: ${JSON.stringify(aGraph.answer[property])}, but got ${JSON.stringify(result)}`);
                    }
                } catch (e) {
                    if (!aGraph.hasOwnProperty("err") || e.constructor != aGraph.err.constructor) {
                        throw e;
                    }
                }
            }
        }
    }
    console.log(`${className.name} - All tests are passed`);
}

for (let aClass of [EagerGraph, LazyGraph]) {
    test(aClass);
}
