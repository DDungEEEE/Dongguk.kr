function pro(pid){
 return new Promise(function(resolve, reject){
    setTimeout(function(){
        if(pid == '원익'){
            resolve('아이디 일치');
        }
        else{
            reject('아이디 일치 x');
        }
    },1000);
})
}

function pro2(ppw){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            if(ppw == '1111'){
                resolve('로그인 성공');
            }
            else{
                reject('로그인 실패')
            }
        },3000)
    })
}
const pid = '원익';
const pwd = '1111';

pro(pid)
.then(function(result){
    console.log(result);
    return pro2(pwd);
})
.catch(function(err){
    console.log(err);
    return Promise.reject(err);
})
.then(function(result){
    console.log(result);
})
.catch(function(err){
    console.log(err);
})
