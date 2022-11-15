const getDatabase = require("../custom_modules/common_modules/connectDatabase_modulse");

/** 사용중인 NVR정보 조회 */
async function searchUsedKafkaInfo(nvrSetVO){
    const nvrIp = nvrSetVO.nvrIp;
    const nvrPort = nvrSetVO.nvrPort;


    let query = "";
    query += "SELECT INNER_TABLE.*           ";
    query += ", (ROW_NUMBER() OVER()) AS ROW_NUM           ";
    query += "  FROM(           ";
    query += "     SELECT NVR_IP,            ";
    query += "            NVR_PORT,           ";
    query += "            KAFKA_IP,            ";
    query += "            KAFKA_PORT,           ";
    query += "            KAFKA_NAME,           ";
    query += "            KAFKA_USE,           ";
    query += "            REGIST_DATE,           ";
    query += "            REGIST_USER,           ";
    query += "            UPDATE_DATE,           ";
    query += "            UPDATE_USER           ";
    query += "       FROM PUBLIC.TB_KAFKA_INFO           ";
    query += "      WHERE NVR_IP='" + nvrIp + "'";
    query += "        AND NVR_PORT='" + nvrPort + "'";
    query += "        AND KAFKA_USE = TRUE         ";
    query += "       ORDER BY REGIST_DATE           ";
    query += " ) INNER_TABLE           ";


    const nvrVo = await getDatabase(query).then(function(res){
        return res;
    }, function(err){
        return err;
    });
    console.log(nvrVo)
    return nvrVo;
}

// test_code
/*
const nvrSetVO = {
     nvrIp: "192.168.35.150"
     , nvrPort: "28080"
 }
 searchUsedNvrInfo(nvrSetVO);
*/
module.exports.searchUsedKafkaInfo = () => searchUsedNvrInfo();

