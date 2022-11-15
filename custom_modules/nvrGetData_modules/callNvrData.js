/** ## callNvrData.js : cctv Digest auth 통신 기능 */

const nvrMapper = require("../../mapper/nvrInfo_mapper");

async function get_NvrData(nvrAPI_Address){
    const request = require('request');

    // [digest] auth info
    const nvrVo = await nvrMapper.searchUsedNvrInfo();
    const nvrAuthName = nvrVo[0].nvr_username;
    const nvrAuthPass = nvrVo[0].nvr_password;
    
    return new Promise(function(resolve, reject){
        // function : url을 통한 nvr 정보 호출 (digest-auth방식)
        request.get(nvrAPI_Address, function(err, res, body){
        
            console.log(nvrAPI_Address);
            if (!err && res.statusCode == 200){
                const bodyString = body;
                console.log("NVR 정보 호출 성공");
                resolve(bodyString);
            }
            else {
                console.log("NVR 정보 호출 실패");
                console.log(err);
                reject(err);
            }

        }).auth(nvrAuthName, nvrAuthPass, false);

    }); 

}

module.exports = (nvrAPI_Address) => get_NvrData(nvrAPI_Address);