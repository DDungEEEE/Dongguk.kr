const axios = require('axios');
const api = 'RGAPI-dbbd8030-9479-4d8a-aa72-21fa17012bbe';

async function getLOLuserinfo(LOLname) {
    const riotApiUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(LOLname)}`;
    const response = await axios.get(riotApiUrl, {
        headers: { 'X-Riot-Token': api }
    });

    // 소환사의 랭크 정보를 가져오는 추가 API 요청
    const summonerId = response.data.id;
    const userIcon = response.data.profileIconId;
    const puuId = response.data.puuid;



    const rankedStatsResponse = await axios.get(`https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`, {
        headers: { 'X-Riot-Token': api}
    });

    const getMatchID = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuId}/ids?start=0&count=20`, {
        headers : { 'X-Riot-Token' : api}

    }); //input : puuid output : matchid


    
    const SolorankedStats = rankedStatsResponse.data.find(queue => queue.queueType === 'RANKED_SOLO_5x5');
    const TeamrankedStats = rankedStatsResponse.data.find(queue => queue.queueType === 'RANKED_FLEX_SR');
    
    

    if((SolorankedStats || TeamrankedStats) != undefined){
        if (!SolorankedStats ){
            return {
                name: LOLname, // 소환사 이름
                tier: `${TeamrankedStats.tier} ${TeamrankedStats.rank}`, // 티어
                wins: TeamrankedStats.wins, // 승리 수
                losses: TeamrankedStats.losses, // 패배 수
                winRate: ((TeamrankedStats.wins / (TeamrankedStats.wins + TeamrankedStats.losses)) * 100).toFixed(2), // 승률
                userIcon : `https://ddragon.leagueoflegends.com/cdn/13.23.1/img/profileicon/${userIcon}.png`,
                

                
            };
        }
        else {
            
            return {
                name: LOLname, // 소환사 이름
                tier: `${SolorankedStats.tier} ${SolorankedStats.rank}`, // 티어
                wins: SolorankedStats.wins, // 승리 수
                losses: SolorankedStats.losses, // 패배 수
                winRate: ((SolorankedStats.wins / (SolorankedStats.wins + SolorankedStats.losses)) * 100).toFixed(2),
                userIcon : `https://ddragon.leagueoflegends.com/cdn/13.23.1/img/profileicon/${userIcon}.png`,
                
                
            }
        }
    }
    else{
        return null;
    }

}

async function getMatchRecord(LOLname){

    const riotApiUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(LOLname)}`;
    const response = await axios.get(riotApiUrl, {
        headers: { 'X-Riot-Token': api }
    });

    // 소환사의 랭크 정보를 가져오는 추가 API 요청
    const summonerId = response.data.id;
    const userIcon = response.data.profileIconId;
    const puuId = response.data.puuid;
    const MatchData = [];
    const assists = [];
    const win = [];
    const deaths = [];
    const gameMode = [];
    const championName = [];
    const kills = [];
    const lane = [];
    const gameStartTimestamp = [];
    const gameDuration = [];
    const Championurl = [];
    
    const getMatchID = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuId}/ids?start=0&count=20`, {
        headers : { 'X-Riot-Token' : api}

    }); //input : puuid output : matchid

   let length = getMatchID.data.length;
    if(length >= 10){
        for(i = 0; i < 10; i++){
        
            MatchData[i] = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/${getMatchID.data[i]}`,{
               headers : {'X-Riot-Token' : api}
               })
               gameStartTimestamp[i] = new Date(MatchData[i].data.info.gameStartTimestamp).toLocaleString();
               gameMode[i] = MatchData[i].data.info.gameMode;
               gameDuration[i] = (MatchData[i].data.info.gameDuration)/60;
               
       
   
           for(j=0; j<10; j++){
               if(MatchData[i].data.info.participants[j].puuid == puuId){
                   kills[i] = MatchData[i].data.info.participants[j].kills;
                   assists[i] = MatchData[i].data.info.participants[j].assists;
                   deaths[i] =MatchData[i].data.info.participants[j].deaths;
                   win[i] = MatchData[i].data.info.participants[j].win;
                   championName[i] = MatchData[i].data.info.participants[j].championName;
                   lane[i] = MatchData[i].data.info.participants[j].lane;
                   Championurl[i] = `https://ddragon.leagueoflegends.com/cdn/13.23.1/img/champion/${championName[i]}.png`
   
                   break;
               }
           }    
        }
    }
    else if(length >=0 && length <10){
        for(i = 0; i < length; i++){
        
            MatchData[i] = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/${getMatchID.data[i]}`,{
               headers : {'X-Riot-Token' : api}
               })
               gameStartTimestamp[i] = new Date(MatchData[i].data.info.gameStartTimestamp).toLocaleString();
               gameMode[i] = MatchData[i].data.info.gameMode;
               gameDuration[i] = (MatchData[i].data.info.gameDuration)/60;
               
       
   
           for(j=0; j<10; j++){
               if(MatchData[i].data.info.participants[j].puuid == puuId){
                   kills[i] = MatchData[i].data.info.participants[j].kills;
                   assists[i] = MatchData[i].data.info.participants[j].assists;
                   deaths[i] =MatchData[i].data.info.participants[j].deaths;
                   win[i] = MatchData[i].data.info.participants[j].win;
                   championName[i] = MatchData[i].data.info.participants[j].championName;
                   lane[i] = MatchData[i].data.info.participants[j].lane;
                   Championurl[i] = `https://ddragon.leagueoflegends.com/cdn/13.23.1/img/champion/${championName[i]}.png`
   
                   break;
               }
           }    
        }
    }
    else{
        console.log('사용자 최근 전적 없음');
    }
    const result = {
        assists,
        win,
        deaths,
        gameMode,
        championName,
        kills,
        lane,
        gameStartTimestamp,
        gameDuration,
        Championurl,
    };
    return result;
}

module.exports = {
    getLOLuserinfo,
    getMatchRecord,
}