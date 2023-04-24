import { GameMode } from "./GameModeSelect";

export interface IScore {
    player: string;
    score: number;
}

export function setHighScore(gameMode: GameMode, score: IScore) {
    const highScores = getHighScore(gameMode);
    highScores.push(score);
    highScores.sort((a, b) =>
        gameMode !== GameMode.TenShotChallenge
            ? b.score - a.score
            : a.score - b.score
    );
    highScores.splice(3);
    localStorage.setItem(GameMode[gameMode], JSON.stringify(highScores));
}

export function getHighScore(gameMode: GameMode): IScore[] {
    const highScore = localStorage.getItem(GameMode[gameMode]);
    return highScore
        ? (JSON.parse(highScore) as IScore[])
        : [
              gameMode === GameMode.TenShotChallenge
                  ? { player: "", score: 120_000 }
                  : { player: "___", score: 0 }
          ];
}
