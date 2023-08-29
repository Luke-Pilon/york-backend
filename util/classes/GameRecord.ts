import Game from "./Game";

class GameRecord {
    game: Game
    wins: number
    losses: number

    constructor(game: Game, wins: number, losses: number){
        this.game = game
        this.wins = wins
        this.losses = losses
    }
}

export default GameRecord;