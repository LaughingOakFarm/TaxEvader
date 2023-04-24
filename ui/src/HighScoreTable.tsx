import { GameMode } from "./GameModeSelect";
import React, { useMemo } from "react";
import { getHighScore, IScore } from "./storage";

interface IHighScoreTableProps {
    gameMode: GameMode;
    className?: string;
    style?: React.CSSProperties;
}

export function HighScoreTable({
    gameMode,
    className = "",
    style
}: IHighScoreTableProps) {
    const highScores = useMemo(
        function (): IScore[] {
            return getHighScore(gameMode);
        },
        [gameMode]
    );
    return (
        <table className={`high-score-table ${className}`} style={style}>
            <tbody>
                {highScores.map((score, i) => (
                    <tr key={i}>
                        <td>#{i + 1}</td>
                        <td>
                            {gameMode === GameMode.TenShotChallenge
                                ? `${score.score / 1000}s`
                                : score.score}
                        </td>
                        <td>{score.player.padEnd(3, "_")}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
