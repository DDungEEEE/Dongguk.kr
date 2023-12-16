const {ConnectionPool} = require('mssql');
const axios = require('axios');
const config = {
        user : 'sa',
        password : '1234',
        database : 'Node',
        server : 'localhost',
        options: {
            trustServerCertificate: true
        },
}

const dbConnection = new ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log('connection complete');
        return pool;
    })
    .catch((err) => {
        console.log(err);
    })

async function queryDatabase(query, parameters){
    const pool = await dbConnection;
    try{
        const result = await pool.request()
            .input('id', parameters.id)
            .input('password', parameters.password)
            .input('LOLname', parameters.LOLname)
            .input('Tier', parameters.Tier)  // 'Tier'에 대한 입력 추가
            .input('Wins', parameters.Wins)  // 'Wins'에 대한 입력 추가
            .input('Losses', parameters.Losses)  // 'Losses'에 대한 입력 추가
            .input('WinRate', parameters.WinRate)  // 'WinRate'에 대한 입력 추가
            .input('userIcon', parameters.userIcon)
            .input('username', parameters.username)
            .input('chat', parameters.chat)
            .input('sendUser', parameters.sendUser)
            .input('content', parameters.content)
            .input('getUser', parameters.getUser)
            .query(query);
        return result.recordset;
       
    }
    catch(err){
        console.log(err);

    }
} 




module.exports = {
    queryDatabase,

};

