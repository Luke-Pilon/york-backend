import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { ObjectId } from "mongodb";

import GameResultDto from "../util/dto/GameResultDto";
import User from "../util/classes/User";
import Game from "../util/classes/Game";
import errorResponseBuilder from "../util/errorResponseBuilder";
import GameRecord from "../util/classes/GameRecord";
const getDb = require('../util/getDb')

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const db = await getDb();
        const users = db.collection(process.env.MONGODB_USERS);
        const games = db.collection(process.env.MONGODB_GAMES);
        if(!req.body.userId){
            context.res = errorResponseBuilder(400, "user id field is required")
            return;
        }
        if(!req.body.gameId){
            context.res = errorResponseBuilder(400, "game id field is required")
            return;
        }
        if(req.body.isWin == null){
            context.res = errorResponseBuilder(400, "isWin field is required")
            return;
        }

        const gameResult: GameResultDto = new GameResultDto(req.body.userId, req.body.gameId, req.body.isWin)
        const user: User = await users.findOne({_id: new ObjectId(gameResult.userId)})
        const game: Game = await games.findOne({_id: new ObjectId(gameResult.gameId)})
        const isWin: boolean = req.body.isWin
        if(!user){
            context.res = errorResponseBuilder(404, "Specified user not found")
            return;
        }
        if(!game){
            context.res = errorResponseBuilder(404, "Specified game not found")
            return;
        }
        if(user.gameRecords && user.gameRecords.length>0){
            const gameRecord: GameRecord = user.gameRecords.find(gameRecord => gameRecord.game._id === game._id)
            if(gameRecord){
                isWin ? gameRecord.wins += 1 : gameRecord.losses += 1
            } else {
                const wins = isWin ? 1 : 0
                const losses = isWin ? 0 : 1
                user.gameRecords.push(new GameRecord(game, wins, losses))
            }
        } else {
            const wins = isWin ? 1 : 0
            const losses = isWin ? 0 : 1
            const gameRecord: GameRecord = new GameRecord(game, wins, losses)
            user.gameRecords = [gameRecord]
        }
        
        //Update db document with new game results 
        const filter = {_id: user._id}
        const updateDocument = {
            $set: {
                gameRecords: user.gameRecords
            }
        }
        const result = await users.updateOne(filter, updateDocument);
        
        if(!result){
            throw new Error("internal database error")
        }
        context.res = {
            "headers": {
                "Content-Type": "application/json"
            },
            "body": user
        }
    } catch(error){
        context.res = errorResponseBuilder(500, error.toString())
    }
};

export default httpTrigger;