/** ### Rest 연결 Test Controller */

const { basic } = require('http-auth');
function createData (req, res){
    console.log("데이터가 생성되었습니다.");
    res.send("Data create");
}

function readData(req, res){
    console.log("데이터가 조회되었습니다.");
    res.send("Data read");
}


function updateData(req, res){
    console.log("데이터가 수정되었습니다.");
    res.send("Data update");
}


function deleteData(req, res){
    console.log("데이터가 삭제되었습니다.");
    res.send("Data delete");
}

module.exports.createData = createData;
module.exports.readData = readData;
module.exports.updateData = updateData;
module.exports.deleteData = deleteData;
