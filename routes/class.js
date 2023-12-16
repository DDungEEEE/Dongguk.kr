class GameStats {
    constructor(win, assists, deaths, gameMode, championName, kills, lane, endTimestamp, gameStartTimestamp, gameCreation) {
        this._win = win;
        this._assists = assists;
        this._deaths = deaths;
        this._gameMode = gameMode;
        this._championName = championName;
        this._kills = kills;
        this._lane = lane;
        this._endTimestamp = endTimestamp;
        this._gameStartTimestamp = gameStartTimestamp;
        this._gameCreation = gameCreation;
    }

    // Getters
    get win() {
        return this._win;
    }

    get assists() {
        return this._assists;
    }

    get deaths() {
        return this._deaths;
    }

    get gameMode() {
        return this._gameMode;
    }

    get championName() {
        return this._championName;
    }

    get kills() {
        return this._kills;
    }

    get lane() {
        return this._lane;
    }

    get endTimestamp() {
        return this._endTimestamp;
    }

    get gameStartTimestamp() {
        return this._gameStartTimestamp;
    }

    get gameCreation() {
        return this._gameCreation;
    }

    // Setters
    set win(value) {
        this._win = value;
    }

    set assists(value) {
        this._assists = value;
    }

    set deaths(value) {
        this._deaths = value;
    }

    set gameMode(value) {
        this._gameMode = value;
    }

    set championName(value) {
        this._championName = value;
    }

    set kills(value) {
        this._kills = value;
    }

    set lane(value) {
        this._lane = value;
    }

    set endTimestamp(value) {
        this._endTimestamp = value;
    }

    set gameStartTimestamp(value) {
        this._gameStartTimestamp = value;
    }

    set gameCreation(value) {
        this._gameCreation = value;
    }

    // Method to get all data
    getAllData() {
        return {
            win: this._win,
            assists: this._assists,
            deaths: this._deaths,
            gameMode: this._gameMode,
            championName: this._championName,
            kills: this._kills,
            lane: this._lane,
            endTimestamp: this._endTimestamp,
            gameStartTimestamp: this._gameStartTimestamp,
            gameCreation: this._gameCreation
        };
    }
}

module.exports = GameStats();