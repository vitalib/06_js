import {Graph, DependencyNotFoundError, CircularDependencyError} from "./Graph.js" ;

class LazyGraph extends Graph{
    receiveGraph(graph) {
        super.receiveGraph(graph);
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

    getDependencies(vertex, visited=new Set(), depenList= []) {
        let parents = [];
        try {
            parents = this.getParents(this.graph[vertex]);
        } catch(err) {
            throw new DependencyNotFoundError(`Dependent function "${vertex}" is not in a graph`);
        }
        visited.add(vertex);
        depenList.push(vertex);
        for (let parent of parents)  {
            if (!this.dependencies.has(parent)) {
                if (visited.has(parent)) {
                    depenList.push(parent);
                    let msgErro = depenList.join("->");
                    throw new CircularDependencyError(`Circular dependencies are found: ${msgErro}`);
                }
                this.getDependencies(parent, visited, depenList);
            }
        }
        this.dependencies.set(vertex, parents);
        visited.delete(vertex);
        depenList.pop();
    }

    getSolution(vertex) {
        const value = this.graph[vertex](...this.dependencies.get(vertex).map(n => this.calcVertex(n)));
        this.solution.set(vertex, value);
    }
}

export {LazyGraph};
