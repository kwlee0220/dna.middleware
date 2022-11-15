/** ### 사용중인 NVR에 연결되어있는 CCTV 정보를 가져온다
 * InputParamiter
 *  - int 조회할 CCTV 최대 값
 * 
 * paramiter
 *  - cctvMaxCount : NVR로 연결할 수 있는 최대 CCTV 개수 && 제한을 건 Limit 내 연결할 수 있는 최대 CCTV 개수
 *  - cctvLinkedList : 현재 연결되어있는 CCTV 개수
*/

const nvrApi = require("../custom_modules/nvrGetData_modules/callNvrData");
const nvrMapper = require("../mapper/nvrInfo_mapper");

/* CCTV 상태 확인 호출 */
async function cctvStateCheck(checkCctvNo){
    return new Promise(async function(resulove, reject){
        /* NVR Info */
        const nvrVo = await nvrMapper.searchUsedNvrInfo();
        console.log(nvrVo);

        const nvrIp = nvrVo[0].nvr_ip;
        const nvrPort = nvrVo[0].nvr_port;
        const cctvNo = checkCctvNo;

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
            return reject("NVR에 연결할 수 있는 CCTV개수의 범위를 벗어났습니다.");
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
            resulove(false);
        }
    });
}


const cctvstate = cctvStateCheck("3").then(function(res){
    console.log("test결과 >> "+ res);
    console.log(typeof res);
    return res;
}, function(err){
    console.log("test결과 >> "+ err);
    console.log(typeof err);
    console.log(err);
    return err;
});


