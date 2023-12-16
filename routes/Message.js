const express = require('express');
const app = express();
const { queryDatabase } = require('./db');
const router = express.Router();

router.post('/sendMessage', async (req, res) => {
    const sendUser = req.body.sendUser;
    const content = req.body.content;
    const getUser = req.body.getUser;
    const query = 'insert into Messageinfo (sendUser, content, sendTime, getUser)\
     VALUES (@sendUser, @content, getdate(), @getUser)';
    const Userquery = 'select LOLname from userstate';
    var count = -1;
    
     try{

    
        if(sendUser == getUser){
            res.status(401).json({message : '보낸 사람과 받는 사람은 같습니다.'}) // 보낸 사람 받는사람 확인
        }
        else if((sendUser!='' && content !='') && getUser != ''){ // 공백없음
            const User = await queryDatabase(Userquery, {});
            for(let i = 0; i < User.length; i++){
                 if(getUser == User[i].LOLname){
                    count = i;
                    break;
                 }
                }
            if(count != -1){ // 받는유저가 존재
                const result = await queryDatabase(query, {
                    sendUser : sendUser,
                    content : content,
                    getUser : getUser
                })
                res.status(200).json({message : '메세지 전송 성공'});
                
            }
            else{ // 존재X
                res.status(404).json({message : '존재하지 않는 받는 사용자 정보입니다.'});
            }
        }
        else{//공백 존재
            res.status(403).json({message : '공백을 입력하지 마세요'});
        }
    
     }
     catch(e){
        res.status(500).json({message : '서버 오류 발생'});
     }
    
});




module.exports = router;