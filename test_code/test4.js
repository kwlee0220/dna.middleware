

function test(){
    
    
    const test = "1111111111111111111000000000000\r\n";
    console.log(test);
    test.replace(/(?:\\[rn]|[\r\n]+)+/g, "");

    console.log(test);
    console.log("??");

}


test();

