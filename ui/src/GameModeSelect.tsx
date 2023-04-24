import { useEffect, useState } from "react";
import { listenToEvent } from "./HandleEvent";
import { HighScoreTable } from "./HighScoreTable";
import { sounds } from "./sounds";

interface IGameModeSelectProps {
    onSelection: (gameMode: GameMode) => void;
}

export function GameModeSelect({ onSelection }: IGameModeSelectProps) {
    const [selection, setSelection] = useState<GameMode>(GameMode.HotStreak);
    useEffect(() => void sounds.menuSelect(), []);
    useEffect(function _onKnobTurn() {
        return listenToEvent("knob-turn", function (event) {
            if (event.direction === "left") {
                setSelection(function (sel) {
                    return sel <= 0 ? GameMode.TenShotChallenge : sel - 1;
                });
            } else {
                setSelection(function (sel) {
                    return sel >= 2 ? GameMode.HotStreak : sel + 1;
                });
            }
            sounds.click();
        });
    }, []);
    useEffect(
        function _onKnobPress() {
            return listenToEvent("knob-pressed", function (event) {
                if (event.pressed) {
                    onSelection(selection);
                    sounds.menuSelect();
                }
            });
        },
        [selection, onSelection]
    );
    useEffect(
        function () {
            return listenToEvent("pre-wheel", function () {
                onSelection(selection);
                sounds.menuSelect();
            });
        },
        [selection]
    );
    return (
        <div>
            <div className={"game-selection-buttons"}>
                <button
                    style={{ backgroundImage: "url('hot-streak.png')" }}
                    className={`game-selection-button${
                        selection === GameMode.HotStreak ? " is-active" : ""
                    }`}
                    onClick={() => onSelection(GameMode.HotStreak)}
                >
                    <div className={"game-selection-button-title"}>
                        Hot Streak
                    </div>
                    <div className={"game-selection-button-description"}>
                        You're on fire, player! Your score is determined by the
                        number of times you can successfully blaze through the
                        challenge in a row. Keep up the momentum and keep that
                        score climbing!
                    </div>
                    {selection === GameMode.HotStreak && (
                        <div className={"game-selection-start animate-hover"}>
                            START!
                        </div>
                    )}
                    <HighScoreTable
                        gameMode={GameMode.HotStreak}
                        className={"game-selection-button-high-score"}
                    />
                </button>
                <button
                    style={{ backgroundImage: "url('high-score-hustle.png')" }}
                    className={`game-selection-button${
                        selection === GameMode.HighScoreHustle
                            ? " is-active"
                            : ""
                    }`}
                    onClick={() => onSelection(GameMode.HighScoreHustle)}
                >
                    <div className={"game-selection-button-title"}>
                        High Score Hustle
                    </div>
                    <div className={"game-selection-button-description"}>
                        Time to light it up, player! You've got a full minute to
                        toke up and score as many points as possible. Can you
                        handle the heat and reach the top of the leaderboard?
                    </div>
                    '
                    {selection === GameMode.HighScoreHustle && (
                        <div className={"game-selection-start animate-hover"}>
                            START!
                        </div>
                    )}
                    <HighScoreTable
                        gameMode={GameMode.HighScoreHustle}
                        className={"game-selection-button-high-score"}
                    />
                </button>
                <button
                    style={{ backgroundImage: "url('ten-shot-challenge.png')" }}
                    className={`game-selection-button${
                        selection === GameMode.TenShotChallenge
                            ? " is-active"
                            : ""
                    }`}
                    onClick={() => onSelection(GameMode.TenShotChallenge)}
                >
                    <div className={"game-selection-button-title"}>
                        Ten Shot Challenge
                    </div>
                    <div className={"game-selection-button-description"}>
                        Ready, aim, fire up! Your mission, should you choose to
                        accept it, is to hit ten shots in record time. You've
                        got two minutes to spark it up and blaze through this
                        challenge. Think you have what it takes to come out on
                        top?
                    </div>
                    {selection === GameMode.TenShotChallenge && (
                        <div className={"game-selection-start animate-hover"}>
                            START!
                        </div>
                    )}
                    <HighScoreTable
                        gameMode={GameMode.TenShotChallenge}
                        className={"game-selection-button-high-score"}
                    />
                </button>
            </div>
        </div>
    );
}

export enum GameMode {
    HotStreak,
    HighScoreHustle,
    TenShotChallenge
}
