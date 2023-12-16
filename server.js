// server.js
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const { dbConnection } = require('./routes/db');
app.use(bodyParser.json());
const login = require('./routes/login');
const sha = require('sha256');
const axios = require('axios');
const signup = require('./routes/signup');
const {queryDatabase} = require('./routes/db');
const session = require('express-session'); 
const pgSession = require('connect-pg-simple')(session);
const {getMatchRecord} = require('./routes/LOLapi');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 5500;

const Message = require('./routes/Message');

app.post('/sendMessage', Message);
app.post('/getMessageList', Message);

app.use(express.static(path.join(__dirname, 'views')));

app.use(session({
    secret : 'keyboard cat',
    resave : false,
    saveUninitiaziled: true,
}))

app.get('/', login);
app.post('/login', login);


//채팅 실험

app.route('/register')
    .get((req, res) => {
    res.render('register.ejs');
    })
    .post((req, res) => {
    res.redirect('register');
    });

app.route('/signup')
    .post(signup)


app.get('/getId', async(req, res) => {
    try{
        const pool = await dbConnection;
        const result = await pool.request()
                .query('select id from userstate')
        res.json(result.recordset);
        
    }catch(err){
        res.status(500).send('Server error');
    }
})

    app.get('/getMessageList', async (req, res) => {
        const getUser = req.session.LOLname;
        const query = 'select * from Messageinfo where getUser = @getUser';

        try {
            const result = await queryDatabase(query, {
                getUser: getUser
            });
            if (result.length != 0) {
                res.render('postmglist.ejs', { user: req.session.userId, messages: result });
            } else {
                res.render('postmglist.ejs', { user: req.session.userId, messages: null });
            }
        } catch (e) {
            res.send(e);
        }
    });



app.post('/getinfo', async(req, res) => {
    try{
        const id = req.body.id;
        const LOLname = req.body.LOLname;
        const query = 'select LOLname, id from userstate';
        const result = await queryDatabase(query, {});
        let findId = -1;
        let findLOLname = -1;
        for(let i = 0; i < result.length; i++){
            if(findId == result[i].id){
               findId = i;
            }
            else if(findLOLname == result[i].LOLname)
                findLOLname = i;
           }
    
        if(findId != -1){
            res.status(400).json({message : '중복된 아이디입니다.'});
        }
        else if(findLOLname != -1){
            res.status(401).json({message : '중복된 닉네임입니다.'});
        }
        else{
            res.status(200).json({message : '중복되지 않습니디.'})
        }


    }catch(err){
        res.status(500).json({message : '입력값이 없습니다.'});
    }
})
app.get('/get-lol-data', async (req, res) => {
    try {
        const query = 'SELECT LoLname, Tier, Wins, Losses, WinRate FROM lol_summoners';
        // 소환사 정보를 조회하는 쿼리를 실행합니다.
        const result = await queryDatabase(query, {});
        // 데이터베이스 연결을 해제합니다.

        // 조회 결과를 클라이언트에게 JSON 형식으로 전달합니다.
        res.json(result);
    } catch (err) {
        // 에러 처리
        console.error('Database query failed:', err);
        res.status(500).send('Server error');
    }
});
app.get('/chat', (req, res) => {
    if(req.session && req.session.userId){
        const userId = req.session.userId;
        const LOLname = req.session.LOLname;

        res.render('chat',{
            userId,
            LOLname,
        });
    }else{
        res.render('login');
    }
})
app.get('/chat', (req, res) => {
    if(req.session && req.session.userId){
        const userId = req.session.userId;
        const LOLname = req.session.LOLname;

        res.render('chat',{
            userId,
            LOLname,
        });
    }else{
        res.render('login');
    }
})

app.get('/main', (req, res) => {
    if(req.session && req.session.userId){
        const userInfo = req.session.userId;

        res.render('main.ejs',{
            userInfo,
        });
    }else{
        res.render('login');
    }
 
})

app.get('/logout', (req, res) =>{
    if(req.headers.cookie){
        const [, privatekey] = req.headers.cookie.split('=');
        const userInfo = session[privatekey];
        console.log(req.session);
        req.session.destroy((err) => {
            if(err){
                console.error(err);
                res.status(500).json({message : '서버 에러가 발생하였습니다.'});
            }else{
                res.setHeader('Set-Cookie', 'connect.id = delete;Max-age=0;path=/');
                res.render('login');
            }
        })
    }
    else{
        res.render('login');
    }
})


app.post('/userinfo', async(req, res) => {
    const LOLname = req.body.LOLname;
    const query = 'select * from userstate where LOLname = @LOLname';
    const result = await queryDatabase(query, {LOLname});
})
app.get('/home', (req, res) => {
    res.render('home',{userId: req.session.userId});
    
})



app.post('/getMatchRecord', async(req, res) => {
    try{
        const LOLname = req.body.lolname;
        const query = "select * from lol_summoners where LOLname = @LOLname";
        const dbresult = await queryDatabase(query, {LOLname});
        const result = await getMatchRecord(LOLname);
    
        const data = {
            profile: dbresult,
            matches: result,
            userId: req.session.userId
        };


        res.render('usinfo', { data: data });
        
    }
    catch(err){
        const data={   profile: null,
            matches:null,
            userId: req.session.userId};
        res.render('usinfo', { data: data});
        console.error(err);
    }    
})

// app.get('/userinfo', (req, res) => {
//     res.render('userinfo',{result})
// })

app.post('/getUserDetail', async(req, res) => {
    try{
        const id = req.session.userId;
        const query = "select lol.*, us.id from lol_summoners lol, userstate us where lol.LOLname = (select LOLname from userstate where id = @id) and us.LOLname = lol.LOLname";
        const result = await queryDatabase(query, {id});
        if(result.length == 0){
            res.status(404).json({message : '소환사 정보를 찾을수 없습니다.'});
        }
        else{
            res.status(200).json(result);
        }

    }
    catch(err){
        res.status(500).json({message : '오류 발생'});
        console.error(err);
    }    
})
io.on('connection', async function(socket){
    console.log('클라이언트 연결');
    
        const userId = socket.request.session?.userId;
        const LOLname = socket.request.session?.LOLname;
        // 클라이언트에게 로그인 정보 전송
        if(userId !=undefined && LOLname != undefined){
            io.emit('login', {
                LOLname: LOLname,
                userid: userId,});
        }
      
        
    
    socket.on('login',async function(data) {
        console.log('Client chat: ', data.LOLname, 'userid: ', data.userId);
            const query = 'select * from chatinfo order by writeTime'
            const result = await queryDatabase(query, {});
            
            for(let i=0; i<result.length; i++){
                var recentChats = {
                    from: {
                        LOLname : result[i].username
                    },
                    msg : result[i].chat
                }
                socket.emit('login',recentChats);
            }
            socket.LOLname = data.LOLname;
            socket.userId = data.userId;
            io.emit('login', `${socket.LOLname}님이 접속하였습니다.`);
    });

    socket.on('chat', async function(data) {
        const username = socket.LOLname;
        const chat = data.msg;
        const query = 'insert into chatinfo (username, chat,writeTime) VALUES (@username, @chat, getdate())'
        var msg = {
            from: {
                LOLname: socket.LOLname,
                userId: socket.userId
            },
            msg: data.msg
        };

        io.emit('chat', msg);
        const result = await queryDatabase(query, {
            username : username, 
            chat : chat
        });
    });


    socket.on('forceDisconnect', function () {
        socket.disconnect();
    });
    socket.on('logout', function() {
       
        io.emit('logout');
    });

    socket.on('disconnect', function () {
        console.log('user disconnected: ' + socket.LOLname);
    });
});

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://a28434791:sung0714@cluster0.375rbw4.mongodb.net/?retryWrites=true&w=majority');
const PostSchema = new mongoose.Schema({
    num: Number,
    title: String,
    writer:String,
    content: String,
    date: String,
  });
  const Post = mongoose.model('Post', PostSchema);
app.get('/list', async (req, res) => {
    try {
        const posts = await Post.find();
        res.render('list', { posts: posts ,userInfo:req.session.userId }); // 'list' 템플릿으로 posts 데이터를 전달
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.get('/write',function(req,res)
{
    res.render('write.ejs',{userInfo:req.session.userId,lol:req.session.LOLname});
})
app.post('/write', async (req, res) => {
    const { title, writer, content, date } = req.body;

    try {
        const newPost = new Post({ title, writer, content, date });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/preview/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        console.log(post);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        const isUser = req.session.LOLname== post.writer; 
        console.log(isUser);

        res.render('preview', { userInfo:req.session.userId,post: post,isUser: isUser }); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/edit/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);


        res.render('edit', {userInfo:req.session.userId, post: post });
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.post('/update/:id', async (req, res) => {
    try {
      const postId = req.params.id;
      const { title, content } = req.body;
  
    
      const post = await Post.findById(postId);

      post.title = title;
      post.content = content;

      await post.save();
  
      return res.status(200).json(post);
    } catch (error) {
      console.error('오류 발생:', error);
      return res.status(500).json({ error: '서버 오류 발생' });
    }
  });

  app.post('/delete/:id', async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);
  
      const result = await Post.deleteOne({ _id: postId });
  
      if (result.deletedCount === 1) {
        return res.status(200).json({ message: '게시물이 삭제되었습니다.' });
      } else {
        return res.status(500).json({ error: '게시물 삭제에 실패했습니다.' });
      }
    } catch (error) {
      console.error('오류 발생:', error);
      return res.status(500).json({ error: '서버 오류 발생' });
    }
  });

  app.get('/postmg',function(req,res)
  {
    res.render('postmg.ejs',{userInfo:req.session.userId,userId:req.session.LOLname});
  })

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

