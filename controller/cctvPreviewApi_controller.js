/** ### Rest 연결 Test Controller */
const PropsReader = require("properties-reader");
const basicProp = PropsReader('properties/basicProxy.properties');
const requestIp = require('request-ip'); 

const nvrMapper = require("../mapper/nvrInfo_mapper");
const cctvStateCheckApi = require("../custom_modules/common_modules/getCctvStateInfo_modules");

/** live 중인 영상Stream Array 객체 */
let livePreviewArr = new Array(); 


// function createData (req, res){
//     console.log("데이터가 생성되었습니다.");
//     res.send("Data create");
// }


/** Preview 영상 Webserver IP&Port 전송 */
function getPreviewHost(req, res){

    
    // 접속한 web 클라이언트 ip
    const wsIP = basicProp.get("DNA_MW_WEBSOCK_HOST");
    // const wsIP = basicProp.get("ws.ip"); // test용 properties 파일 내용
   
    const wsPort = basicProp.get("DNA_MW_WEBSOCK_PREVIEW_PORT");
    const resString = "wsIP=" + wsIP + "\r\nwsPort=" + wsPort;

    console.log("\r\nLoad Preview Websocket URL information");
    console.log(resString);

    res.send(resString);
  }

  
/** Preview 영상 Play */
async function readData(req, res){
    const nvrApi = require("../custom_modules/nvrGetData_modules/callNvrData");
    const multiCamStreamApi = require("../custom_modules/cctvStream_modules/rtspMultiCameraStream");
    //const nvrIp = basicProp.get("cctv.ip"); // ictway 대전지사 연결 시 내부 ip에서 외부 ip 호출 불가

    /* NVR Info */
    const nvrVo = await nvrMapper.searchUsedNvrInfo();
    const nvrIp = nvrVo[0].nvr_ip;
    const nvrPort = nvrVo[0].nvr_port;
    const nvrAuthName = nvrVo[0].nvr_username; 
    const nvrAuthPass = nvrVo[0].nvr_password;

    const wsPort_stream = basicProp.get("DNA_MW_WEBSOCK_PREVIEW_PORT"); 
    const cctvNo = Number(req.params.cctvNo) - 1;

    // CCTV 연결상태 확인
    const cctvstate = await cctvStateCheckApi.cctvStateCheck(cctvNo).then(function(res){
        console.log(typeof res);
        return res;
    }, function(err){
        console.log(typeof err);
        console.log(err);
        return err;
    });

    console.log(typeof cctvstate);
    // CCTV Exception 처리
    if(typeof cctvstate == "string"){
        res.send(cctvstate);
        return;
    }

    let streamChannel = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/media.cgi?msubmenu=streamuri&action=view&Channel=" + cctvNo + "&MediaType=Live&Mode=Full&ClientType=PC";
    console.log("streamChannel >>> " + streamChannel);
    
    const streamRTSPurl = await nvrApi(streamChannel).then(function(res){
        let temp = res.split("=");
        let tempUrl = temp[1].replace("rtsp://", "");
        
        // [ip]:[port]/LiveChannel/[cctvNo]/media.smp
        let resultUrl = "rtsp://" + nvrAuthName + ":" + nvrAuthPass + "@" + tempUrl; 
            
        console.log("\r\n rtsp주소 : " + resultUrl);
        return resultUrl.replace("\r\n", "");
    }, function(err){
        console.log("streamRTSPurl 생성 불가..");
        console.log(err);
        return err;
    });


    // Input Live Camera Infomation
    const ws_previewVideo = "ws_previewVideo";
    let camPlayInfoArr = new Array();
    camPlayInfoArr[0] = {
        streamName: ws_previewVideo,
        rtspUrl: streamRTSPurl,
        wsPort: wsPort_stream
    };

    // Streaming play
    livePreviewArr = multiCamStreamApi(camPlayInfoArr);

    console.log("데이터가 조회되었습니다.");
    res.send("true");
}


// function updateData(req, res){
//     console.log("데이터가 수정되었습니다.");
//     res.send("Data update");
// }


/** 페이지 닫기 | 이동 | 새로고침 시 event */
function deleteData(req, res){

    if(livePreviewArr !== null && livePreviewArr !== undefined){
        for(let i = 0; i < livePreviewArr.length; i++){
            livePreviewArr[i].stop();
            console.log("priview disconnect ...");
        }
    }
    res.send("Recode Video Stream stop...");
}




//module.exports.createData = createData;
module.exports.getPreviewHost = getPreviewHost;
module.exports.readData = readData;
//module.exports.updateData = updateData;
module.exports.deleteData = deleteData;

