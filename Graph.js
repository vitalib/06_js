class CircularDependencyError extends Error {}
class DependencyNotFoundError extends Error{}

class Graph {
    receiveGraph(graph) {
        this.graph = graph;
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

export {CircularDependencyError, DependencyNotFoundError, Graph };