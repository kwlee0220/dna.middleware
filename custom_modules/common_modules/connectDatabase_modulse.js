
/** ### baiscProxy에 입력된 DB정보로 query를 연결해준다. 
 * InputPramiter
 *  - String query 
*/

const PropsReader = require("properties-reader");
const basicProp = PropsReader('properties/basicProxy.properties'); // npm service
//const basicProp = PropsReader('..\\properties\\basicProxy.properties'); // js test용

const { Client, Query } = require('pg');

function databaseMapper(query){

  return new Promise(function(resulove, reject){
    /** DB information 설정 */
    const ip = basicProp.get("DNA_MW_JDBC_CONNECT");
    const databaseName = basicProp.get("DNA_MW_JDBC_DB");

    const postgres = basicProp.get("db.database");
    const username = basicProp.get("DNA_MW_JDBC_USER");
    const password = basicProp.get("DNA_MW_JDBC_PASSWD");
    
    
    const databaseUrl = postgres + "://" + username + ":" + password + "@" + ip + "/" + databaseName;

    const client = new Client(databaseUrl);

    // clinet 연결
    client.connect(err => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('success!')
        console.log("연결된 Database_URL : " + databaseUrl);
      }
    });

    // query 실행
    client.query(query, (err, res)=>{
      let result;
      if(err) {
        console.log(err);
        result = null;
      }else{
        result = res.rows;
 
        if(result != null){
          resulove(result);
        }else{
          reject("조회결과가 없습니다.");
        }
      }
      client.end();
    })
    
  });
}

module.exports = (qeury)=> databaseMapper(qeury);

