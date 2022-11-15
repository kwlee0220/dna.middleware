/** ### 선택한 녹화일의 timeline 정보 Controller */
const nvrMapper = require("../mapper/nvrInfo_mapper");

/* proxy server 대전지사 연결 시 강제 입력 필요 */
const PropsReader = require("properties-reader");
const basicProp = PropsReader('properties/basicProxy.properties'); // npm service

// function createData (req, res){
//     console.log("데이터가 생성되었습니다.");
//     res.send("Data create");
// }

async function readData(req, res){
    const nvrApi = require("../custom_modules/nvrGetData_modules/callNvrData");

    const searchDate = req.params.searchDate; // yyyy-mm-dd
    const cctvNo = Number(req.params.cctvNo) - 1;         // 0

    // const nvrIp = basicProp.get("cctv.ip"); // ictway 대전지사 연결 시 내부 ip에서 외부 ip 호출 불가

    // NVR Info
    const nvrVo = await nvrMapper.searchUsedNvrInfo();
    const nvrIp = nvrVo[0].nvr_ip;
    const nvrPort = nvrVo[0].nvr_port;

    const restSearchUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/recording.cgi?msubmenu=timeline&action=view&ChannelIDList=" + cctvNo + "&FromDate=" + searchDate + "T00:00:00Z&ToDate=" + searchDate + "T23:59:59Z";
    console.log(restSearchUrl);

    let result = await nvrApi(restSearchUrl).then(function(res){
        return res;
    }, function(err){
        console.log(err);
        return err;
    });

    console.log("전달받은 데이터 >> " + result);
    res.send(result);
}


// function updateData(req, res){
//     console.log("데이터가 수정되었습니다.");
//     res.send("Data update");
// }


// function deleteData(req, res){
//     console.log("데이터가 삭제되었습니다.");
//     res.send("Data delete");
// }


// module.exports.createData = createData;
module.exports.readData = readData;
// module.exports.updateData = updateData;
// module.exports.deleteData = deleteData;

