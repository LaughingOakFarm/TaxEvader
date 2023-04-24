import { listenToEvent } from "./HandleEvent";
import { useEffect, useRef, useState } from "react";
import { usePointScored } from "./UsePointScored";
import { sounds } from "./sounds";
import { HighScoreTable } from "./HighScoreTable";
import { GameMode } from "./GameModeSelect";

const second = 1000;
const minute = 60 * second;

interface ITenShotChallengeProps {
    onNewScore: (score: number) => void;
    onExit: () => void;
}

export function TenShotChallenge({
    onNewScore,
    onExit
}: ITenShotChallengeProps) {
    const [score, setScore] = useState(0);
    const countingDown = useRef(false);
    const startTime = useRef(0);
    const timeLimit = minute * 2;
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
                    sounds.error();
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
    useEffect(
        function () {
            if (score >= 10) {
                countingDown.current = false;
                const elapsed = Date.now() - startTime.current;
                onNewScore(elapsed);
                setScore(0);
                setRemaining(timeLimit);
            }
        },
        [score, onNewScore]
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
                <div className={"game-screen-title"}>Ten Shot Challenge</div>
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
                    gameMode={GameMode.TenShotChallenge}
                />
            </div>
            <div
                className={"game-screen-right"}
                style={{ backgroundImage: "url('ten-shot-challenge.png')" }}
            />
        </div>
    );
}
