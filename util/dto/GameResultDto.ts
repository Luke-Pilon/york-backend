class GameResultDto {
    userId: string
    gameId: string
    isWin: boolean
    constructor(userId: string, gameId: string, isWin: boolean){
        this.userId = userId
        this.gameId = gameId
        this.isWin = isWin
    }
}

export default GameResultDto