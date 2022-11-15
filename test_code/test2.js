/** ### Rest 연결 Test Controller */
const PropsReader = require("properties-reader");
const basicProp = PropsReader('..\\properties\\basicProxy.properties'); // js test용

const nvrMapper = require("../mapper/nvrInfo_mapper");

  
/** Preview 영상 Play */
async function test(){
    const nvrApi = require("../custom_modules/nvrGetData_modules/callNvrData");
    const multiCamStreamApi = require("../custom_modules/cctvStream_modules/rtspMultiCameraStream");

    /* NVR Info */
    const nvrVo = await nvrMapper.searchUsedNvrInfo();
    const nvrIp = nvrVo[0].nvr_ip;
    const nvrPort = nvrVo[0].nvr_port;
    const nvrAuthName = nvrVo[0].nvr_username; 
    const nvrAuthPass = nvrVo[0].nvr_password;

    const wsPort_stream = basicProp.get("DNA_MW_WEBSOCK_PREVIEW_PORT"); 
    //const cctvNo = req.params.cctvNo;
    const cctvNo = "0";

    let streamChannel = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/media.cgi?msubmenu=streamuri&action=view&Channel=" + cctvNo + "&MediaType=Live&Mode=Full&ClientType=PC";
    
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
    liveStreamArr = multiCamStreamApi(camPlayInfoArr)

    console.log("데이터가 조회되었습니다.");
    //res.send("Data read");
}


test();


