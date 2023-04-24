import { useEffect, useState } from "react";
import { HighScoreTable } from "./HighScoreTable";
import { GameMode } from "./GameModeSelect";
import { usePointScored } from "./UsePointScored";
import { listenToEvent } from "./HandleEvent";

interface IHotStreakProps {
    onNewScore: (score: number) => void;
    onExit: () => void;
}

export function HotStreak({ onNewScore, onExit }: IHotStreakProps) {
    const [streak, setStreak] = useState(0);
    const flash = usePointScored(
        function _onSuccess() {
            setStreak((s) => s + 1);
        },
        function _onError() {
            onNewScore(streak);
            setStreak(0);
        }
    );
    useEffect(
        function () {
            return listenToEvent("knob-pressed", function (event) {
                if (event.pressed) {
                    onExit();
                }
            });
        },
        [onExit]
    );

    return (
        <div className={"game-screen"}>
            <div className={`game-screen-left${flash ? " animate-shake" : ""}`}>
                <div className={"game-screen-title"}>Hot Streak</div>
                <div
                    className={"game-screen-detail font-mono"}
                    style={{ fontSize: 200, lineHeight: 1 }}
                >
                    {streak}
                </div>
                <HighScoreTable
                    className={"game-screen-score-table"}
                    gameMode={GameMode.HotStreak}
                />
            </div>
            <div
                className={"game-screen-right"}
                style={{ backgroundImage: "url('hot-streak.png')" }}
            />
        </div>
    );
}
