const getDatabase = require("../custom_modules/common_modules/connectDatabase_modulse");

/** 사용중인 NVR정보 조회 */
async function searchUsedNvrInfo(){

    let query = "";
    query += "SELECT INNER_TABLE.* FROM (                   ";
    query += "  SELECT NVR_IP,                    ";
    query += "       NVR_PORT,                   ";
    query += "       NVR_NAME,                   ";
    query += "       NVR_USERNAME,                    ";
    query += "       NVR_PASSWORD,                    ";
    query += "       ST_X(NVR_GEOM) AS NVR_LAT,                    ";
    query += "       ST_Y(NVR_GEOM) AS NVR_LNG,                    ";
    query += "       NVR_USE,                    ";
    query += "       REGIST_DATE,                    ";
    query += "       REGIST_USER,                    ";
    query += "       UPDATE_DATE,                    ";
    query += "       UPDATE_USER                   ";
    query += "    FROM PUBLIC.TB_NVR_INFO                   ";
    query += "   WHERE NVR_USE = TRUE                   ";
    query += ") INNER_TABLE                   ";

    const nvrVo = await getDatabase(query).then(function(res){
        console.log("????");
        return res;
    }, function(err){
        console.log("2222");
        return err;
    });
    console.log("\r\n");
    console.log(nvrVo);
    console.log("\r\n");
    return nvrVo;
}

module.exports.searchUsedNvrInfo = () => searchUsedNvrInfo();

