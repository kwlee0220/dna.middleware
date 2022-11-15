/** ### 사용중인 NVR에 연결되어있는 CCTV 정보를 가져온다
 * paramiter
 *  - cctvMaxCount : NVR로 연결할 수 있는 최대 CCTV 개수
 *  - cctvLinkedList : 현재 연결되어있는 CCTV 개수
*/

const nvrApi = require("../nvrGetData_modules/callNvrData");
const nvrMapper = require("../../mapper/nvrInfo_mapper");

/* proxy server 대전지사 연결 시 강제 입력 필요 */
const PropsReader = require("properties-reader");
const basicProp = PropsReader('properties/basicProxy.properties'); // npm service



/* CCTV 상태 확인 호출 */
async function cctvStateCheck(checkCctvNo){
    return new Promise(async function(resulove, reject){
        
        // const nvrIp = basicProp.get("cctv.ip"); // ictway 대전지사 연결 시 내부 ip에서 외부 ip 호출 불가
        
        /* NVR Info */
        const nvrVo = await nvrMapper.searchUsedNvrInfo();
        const nvrIp = nvrVo[0].nvr_ip;
        const nvrPort = nvrVo[0].nvr_port;
        const cctvNo = checkCctvNo;

        console.log('cctvStateCheck');
        console.log(nvrIp);

        // CCTV 상태 호출
        const restSearchUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/attributes.cgi/attributes/Media/Support/" + cctvNo + "/Protocol.SUNAPI";
        console.log(restSearchUrl);
        let result = await nvrApi(restSearchUrl).then(function(res){
            return res;
        }, function(err){
            console.log(err);
            return err;
        });


        // NVR 연결 에러 처리
        if(result.substr(0, 2) == "NG"){
            return reject("CCTV connection exceeded");
        }

        // xml 파싱
        const parseString = require('xml2js').parseString;
        let resultVal;
        parseString(result, function (err, result) {
            resultVal = result.attribute.$.value;
            console.log("value=" + resultVal);
        });
        
        console.log(resultVal);
        if(resultVal == "True"){
            resulove(true);
        }else{
            resulove("CCTV not connected ...");
        }
    });
}


/* 활성화된 CctvList 호출 */
async function cctvStateList(searchLimit){
  
    return new Promise(async function(resulove, reject){
        try{
            // const nvrIp = nvrVo[0].nvr_ip;

            /* NVR Info */
            const nvrVo = await nvrMapper.searchUsedNvrInfo();
            const nvrIp = nvrVo[0].nvr_ip;
            const nvrPort = nvrVo[0].nvr_port;
            
            console.log("CCTV 상태 정보를 확인하는 NVR URL >>> " + nvrIp + ":" + nvrPort);

            let count = 0;
            let cctvList = "";

            const restSearchUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/media.cgi?msubmenu=videoprofilepolicy&action=view";
            console.log(restSearchUrl);
        
            let resultSearch = await nvrApi(restSearchUrl).then(function(res){

                console.log("???");
                
                return res;
            }, function(err){
                console.log("!!!");
                console.log(err);
                return err;
            });


            console.log("====================");
            console.log(resultSearch);

            let channelInfo = resultSearch.split('\r\n');
            let tempCameraNum = "";
            let cctvLinkedList = "";
            for(var i = 0; i < channelInfo.length; i++){
                let channelDetail = channelInfo[i].split('.');

                if(typeof channelDetail[1] !== 'undefined' && channelDetail[1] != tempCameraNum){
                    if(i == 0){
                        cctvLinkedList += channelDetail[1];
                    }else{
                        cctvLinkedList += "," + channelDetail[1];
                    }
                    tempCameraNum = channelDetail[1];
                }

            }
            
            console.log("현재 연결된 CCTV_NO >> " + cctvLinkedList);

            if(cctvLinkedList != ""){
                resulove(cctvLinkedList);
            }else{
                console.log("CCTV not connected ...");
                reject("error");
            }


        }catch(e){
             console.log('handling Error1', e)
             reject("error");
        }


    });


   
}

module.exports.cctvStateCheck = (selectCctvNo) => cctvStateCheck(selectCctvNo);
module.exports.cctvStateList = cctvStateList;
