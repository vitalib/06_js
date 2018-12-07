function sum(a) {
    if(arguments.callee.total == undefined){
        arguments.callee.total = {total1: a, total2: a};
    } else {
        arguments.callee.total.total1 += a;
        arguments.callee.total.total2 += a;
    }
    let total = arguments.callee.total;
    arguments.callee.valueOf = function() {
        let result = total.total1;
        total.total1 = 0;
        return result;
    }
    arguments.callee.toString = function() {
        let result = total.total2;
        total.total2 = 0;
        return result;
    }
    return arguments.callee;
}

console.log(sum(5)(6)(7)(8)); //26
