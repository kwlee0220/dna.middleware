/** ### 실시간영상 입출력 관련 Controller */

const PropsReader = require("properties-reader");
const basicProp = PropsReader('properties/basicProxy.properties');
const requestIp = require('request-ip'); 

const nvrMapper = require("../mapper/nvrInfo_mapper");
const cctvStateCheckApi = require("../custom_modules/common_modules/getCctvStateInfo_modules");

/** live 중인 영상Stream Array 객체 */
let liveStreamArr = new Array(); 


// function createData (req, res){
//     console.log("데이터가 생성되었습니다.");
//     res.send("Data create");
// }

function getStreamHost(req, res){
    // 접속한 web 클라이언트 ip
    const wsIP = requestIp.getClientIp(req);
    // const wsIP = basicProp.get("ws.ip"); // test용 properties 파일 내용
    
    console.log("websocket client IP : " + wsIP);
    const wsPort = basicProp.get("DNA_MW_WEBSOCK_STREAM_PORTS");
    const wsPort1 = wsPort.split(",")[0];
    const wsPort2 = wsPort.split(",")[1];
    const wsPort3 = wsPort.split(",")[2];
    const wsPort4 = wsPort.split(",")[3];
    const resString = "wsIP=" + wsIP + "\r\nwsPort1=" + wsPort1 + "\r\nwsPort2=" + wsPort2 + "\r\nwsPort3=" + wsPort3 + "\r\nwsPort4=" + wsPort4;
  
    console.log("\r\nLoad Stream Websocket URL information");
    console.log(resString);

    res.send(resString);
  }

async function getCCTVLiveStatus(req, res){
    /* Live Camera Check 정보 호출 
        - 최대연결 가능 수 cctvstate.cctvMaxCount 
        - 연결된 CCTV 번호 List cctvstate.cctvLinkedList
    */
    const cctvLinkedList = await cctvStateCheckApi.cctvStateList().then(function(res){
        console.log(typeof res);
        return res;
    }, function(err){
        console.log(typeof err);
        console.log(err);
        return err;
    });


    if(cctvLinkedList == "error"){
        res.send("error");
        return;
    }

    console.log("연결된 CCTV : " + cctvLinkedList);

    const resString = "liveCCTVList=" + cctvLinkedList;
  
    res.send(resString);
}



async function readData(req, res){
    const nvrApi = require("../custom_modules/nvrGetData_modules/callNvrData");
    const multiCamStreamApi = require("../custom_modules/cctvStream_modules/rtspMultiCameraStream");
    
    //const nvrIp = basicProp.get("cctv.ip"); // ictway 대전지사 연결 시 내부 ip에서 외부 ip 호출 불가

    // 중복 포트 방지용 (스트림객체 초기화)
    if(liveStreamArr !== null && liveStreamArr !== undefined){
        for(let i = 0; i < liveStreamArr.length; i++){
            liveStreamArr[i].stop();
        }
        liveStreamArr = new Array();
    }

    /* NVR Info */
    const nvrVo = await nvrMapper.searchUsedNvrInfo();
    const nvrIp = nvrVo[0].nvr_ip;
    const nvrPort = nvrVo[0].nvr_port;
    const nvrAuthName = nvrVo[0].nvr_username; 
    const nvrAuthPass = nvrVo[0].nvr_password;
    
    const wsPort_stream = new Array();
    const wsPort = basicProp.get("DNA_MW_WEBSOCK_STREAM_PORTS");
    wsPort_stream[0] = wsPort.split(",")[0];    
    wsPort_stream[1] = wsPort.split(",")[1];    
    wsPort_stream[2] = wsPort.split(",")[2];    
    wsPort_stream[3] = wsPort.split(",")[3];

    let check_camera = "";
    for(let i = 0; i < wsPort_stream.length; i++){
        if(i > 0) check_camera += ",";
        check_camera += String(i);
    }


    /* Live Camera Check >> cctvstate) 최대연결 가능 수 cctvstate.cctvMaxCount || 카메라No : 배열객체  && 연결된 CCTV_NO >> " + result.cctvLinkedList*/
    const cctvLinkedList = await cctvStateCheckApi.cctvStateList().then(function(res){
        console.log(typeof res);
        return res;
    }, function(err){
        console.log(typeof err);
        console.log(err);
        return err;
    });

    if(cctvLinkedList == "error"){
        res.send("error");
        return;
    }

    console.log(cctvLinkedList);
    let openChannelList = cctvLinkedList.split(","); // 열려있는 카메라 번호 List
    const openCahnnelCount = openChannelList.length; 
    
    let camPlayInfoArr = new Array();
    /* StreamChannel open : i 갯수만큼 */
    for(let i = 0; i < openCahnnelCount; i++){
        // Get Live Channel Address
        let streamChannel = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/media.cgi?msubmenu=streamuri&action=view&Channel=" + openChannelList[i] + "&MediaType=Live&Mode=Full&ClientType=PC";
        console.log("\r\n\r\nstreamCamera_" + openChannelList[i]);   
        console.log("streamChannel : " + streamChannel); 

        const streamRTSPurl = await nvrApi(streamChannel).then(function(res){
            let temp = res.split("=");
            let tempUrl = temp[1].replace("rtsp://", "");

            // [ip]:[port]/LiveChannel/[cctvNo]/media.smp
            let resultUrl = "rtsp://" + nvrAuthName + ":" + nvrAuthPass + "@" + tempUrl; 

            return resultUrl.replace("\r\n", "");
        }, function(err){
            console.log("streamRTSPurl 생성 불가..");
            console.log(err);
            return err;
        });

  
        console.log("\r\n\r\n>>>> liveRTSPurl_" + i + " : " + streamRTSPurl);

        // Input Live Camera Infomation
        const ws_VideoName= "ws_streamVideo_" + i;
        camPlayInfoArr[i] = {
            streamName: ws_VideoName,
            rtspUrl: streamRTSPurl,
            wsPort: wsPort_stream[i]
        };
        console.log(camPlayInfoArr[i]);
    }
    
    // Streaming play
    liveStreamArr = multiCamStreamApi(camPlayInfoArr)
    
    console.log(openChannelList);
    res.send(openChannelList);
}



// function updateData(req, res){
//     console.log("데이터가 수정되었습니다.");
//     res.send("Data update");
// }


function deleteData(req, res){
    console.log(liveStreamArr.length);
    if(liveStreamArr.length > 0){
        for(let i = 0; i < liveStreamArr.length; i++){
            liveStreamArr[i].stop();
        }
    }
    console.log(liveStreamArr.length);
    res.send("Recode Video Stream stop...");
}


//module.exports.createData = createData;
module.exports.getStreamHost = getStreamHost;
module.exports.getCCTVLiveStatus = getCCTVLiveStatus;
module.exports.readData = readData;
//module.exports.updateData = updateData;
module.exports.deleteData = deleteData;

