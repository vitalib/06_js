sum.toString = function () {
    let result = sum.total.total2;
    sum.total.total2 = 0;
    return result;
}

sum.valueOf = function() {
    let result = sum.total.total1;
    sum.total.total1 = 0;
    return result;
}

function sum(a) {
    if(arguments.callee.total == undefined){
        arguments.callee.total = {total1: a || 0, total2: a || 0};
    } else {
        arguments.callee.total.total1 += a;
        arguments.callee.total.total2 += a;
    }
    return arguments.callee;
}

(function test() {
    tests = [
        {value: sum() + 0, estimated: 0},
        {value: sum(5) + 0, estimated: 5},
        {value: sum(5)(6) + 0, estimated: 11},
        {value: sum(5)(6)(7) + 0, estimated: 18},
    ]
    for (let testSample of tests) {
        if (testSample.value != testSample.estimated) {
            throw new Error(`${testSample.value} != ${testSample.estimated}`);
        }
    }


})()

console.log(sum(5)(6)(7)(8)); //26
