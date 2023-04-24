import { useEffect, useRef, useState } from "react";
import { usePointScored } from "./UsePointScored";
import { listenToEvent } from "./HandleEvent";
import { GameMode } from "./GameModeSelect";
import { HighScoreTable } from "./HighScoreTable";

const second = 1000;
const minute = 60 * second;

interface IHighScoreHustleProps {
    onNewScore: (score: number) => void;
    onExit: () => void;
}

export function HighScoreHustle({ onNewScore, onExit }: IHighScoreHustleProps) {
    const [score, setScore] = useState(0);
    const countingDown = useRef(false);
    const startTime = useRef(0);
    const timeLimit = minute;
    const [remaining, setRemaining] = useState(timeLimit);
    const minutes = Math.floor(remaining / minute);
    const seconds = Math.floor((remaining % minute) / second);
    useEffect(
        function () {
            const unListen = listenToEvent("pre-wheel", function () {
                if (!countingDown.current) {
                    countingDown.current = true;
                    startTime.current = Date.now();
                }
            });
            const interval = setInterval(function () {
                if (!countingDown.current) {
                    return;
                }
                const elapsed = Date.now() - startTime.current;
                const remaining = timeLimit - elapsed;
                if (remaining <= 0) {
                    countingDown.current = false;
                    onNewScore(score);
                    setScore(0);
                    setRemaining(timeLimit);
                } else {
                    setRemaining(remaining);
                }
            }, 1000);
            return function () {
                unListen();
                clearInterval(interval);
            };
        },
        [score]
    );
    const flash = usePointScored(function _onScore() {
        setScore((s) => s + 1);
    });
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
                <div className={"game-screen-title"}>High Score Hustle</div>
                <div
                    className={"game-screen-detail font-mono"}
                    style={{ lineHeight: 1 }}
                >
                    Count Down {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
                <div
                    className={"game-screen-detail font-mono"}
                    style={{ fontSize: 200, lineHeight: 1 }}
                >
                    {score}
                </div>
                <HighScoreTable
                    className={"game-screen-score-table"}
                    gameMode={GameMode.HighScoreHustle}
                />
            </div>
            <div
                className={"game-screen-right"}
                style={{ backgroundImage: "url('high-score-hustle.png')" }}
            />
        </div>
    );
}
