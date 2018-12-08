import {Graph, DependencyNotFoundError, CircularDependencyError} from "./Graph.js" ;

class EagerGraph extends Graph{
    receiveGraph(graph) {
        super.receiveGraph(graph);
        this.dependencies = this.getDependencies();
        this.orderOfCalls = this.getOrderOfCalls();
        this.solution =  this.getSolution();
        return this;
    }

    calcVertex(vertex) {
        return this.solution[vertex];
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
               let errors = [];
               for (let func of allFunctions) {
                   errors.push(func + "->" + Array.from(dependencyMap.get(func)).join(","));;
               }
               let errorMsg = errors.join("; ");
               throw new CircularDependencyError(`Circular dependency(ies) are found: ${errorMsg}`);
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
            this.solution[func] = this.graph[func](... this.dependencies.get(func).map(n => this.solution[n]));
        }
        return this.solution;
    }
}
export {EagerGraph};
