import GameRecord from "./GameRecord";

class User {
    name: string
    id: string
    gameRecords?: GameRecord[]

    constructor(name:string, id:string, gameRecords?: GameRecord[]){
        this.name = name
        this.id = id
        if(gameRecords){
            this.gameRecords = gameRecords
        }
    }
}

export default User;
