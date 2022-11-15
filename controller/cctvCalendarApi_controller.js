/** ### CCTV 녹화되어있는 일자 관련 Controller */

const nvrMapper = require("../mapper/nvrInfo_mapper");

/* proxy server 대전지사 연결 시 강제 입력 필요 */
const PropsReader = require("properties-reader");
const basicProp = PropsReader('properties/basicProxy.properties'); // npm service

// function createData (req, res){
//     console.log("데이터가 생성되었습니다.");
//     res.send("Data create");
// }


/** 요청한 월 또는 NVR Channal의 녹화일 정보를 조회한다. */
async function readData(req, res){
    const nvrApi = require("../custom_modules/nvrGetData_modules/callNvrData");
    
    // const nvrIp = basicProp.get("cctv.ip"); // ictway 대전지사 연결 시 내부 ip에서 외부 ip 호출 불가
    console.log("도착");
    /* NVR Info */
    const nvrVo = await nvrMapper.searchUsedNvrInfo();
    const nvrIp = nvrVo[0].nvr_ip;
    const nvrPort = nvrVo[0].nvr_port;

    const searchDate = req.params.searchDate; // yyyy-mm-dd
    
    console.log("누구??");
    console.log(req.params.cctvNo);

    // cctvNo Data를 넘겼을때 
    let restSearchUrl = "";
    if(typeof req.params.cctvNo !== "undefined"){
        const cctvNo = Number(req.params.cctvNo) - 1;         // 0
        restSearchUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/recording.cgi?msubmenu=calendarsearch&action=view&Month=" + searchDate + "&ChannelIdList=" + cctvNo;
    }else{
        restSearchUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/recording.cgi?msubmenu=calendarsearch&action=view&Month=" + searchDate;
    }
    
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

