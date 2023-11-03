import GameRecord from "./GameRecord";

class User {
    name: string
    _id: string
    gameRecords?: GameRecord[]

    constructor(name:string, id:string, gameRecords?: GameRecord[]){
        this.name = name
        this._id = id
        if(gameRecords){
            this.gameRecords = gameRecords
        }
    }
}

export default User;
