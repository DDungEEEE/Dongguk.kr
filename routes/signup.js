const express = require('express');
const app = express();
const router = express.Router();
const {dbConnection} = require('./db');
const {getLOLuserinfo} = require('./LOLapi');
const sha = require('sha256');
const {queryDatabase} = require('./db');
const { generatePrimeSync } = require('crypto');

router.post('/signup', async(req, res) => {
    
    const id = req.body.id;
    const password = sha(req.body.password);
    const LOLname = req.body.LOLname;
    console.log(id, password, LOLname);

    try {
        const query = 'select id, LOLname from userstate'
        
        let result = await queryDatabase(query, {
            id : id,
            LOLname : LOLname,
        });
        const idQuery = 'SELECT id FROM userstate WHERE id = @id';
        let idResult = await queryDatabase(idQuery, { id: id });
        if (idResult.length > 0) {
            return res.status(400).json({ message: '중복된 아이디 입니다.' });
        }
    
        // LOLname 중복 검사 쿼리
        const lolNameQuery = 'SELECT LOLname FROM userstate WHERE LOLname = @LOLname';
        let lolNameResult = await queryDatabase(lolNameQuery, { LOLname: LOLname });
        if (lolNameResult.length > 0) {
            return res.status(401).json({ message: '중복된 닉네임입니다.' });
        }
    
        
            const summonerData = await getLOLuserinfo(LOLname);
            if(summonerData){
                let insertquery = 'INSERT INTO lol_summoners (LOLname, Tier, Wins, Losses, WinRate, userIcon) VALUES (@LOLname, @Tier, @Wins, @Losses, @WinRate, @userIcon)'
                const summonerresult = await queryDatabase(insertquery, {
                                LOLname: summonerData.name,
                                Tier: summonerData.tier,
                                Wins: summonerData.wins,
                                Losses: summonerData.losses,
                                WinRate: summonerData.winRate,
                                userIcon : summonerData.userIcon,
                            })
                const query = 'INSERT INTO userstate (id, password, LOLname) VALUES (@id, @password, @LOLname)'
                const result = await queryDatabase(query, {
                    id : id,
                    password : password,
                    LOLname : LOLname,
                })

                
                
                res.status(200).json({message:'성공!'});
            }
            else{
                res.status(500).json({message : '리그오브레전드 서버에 존재하지 않거나 랭크 정보가 없는 계정입니다.'});
            }
        
       

    
    } catch (error) {
        console.error(error);
        res.status(500).json();
    }
});


module.exports = router;