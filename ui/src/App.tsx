import { useEffect, useState } from "react";
import "./App.css";
import { CoinMachineEvent, handleEvent } from "./HandleEvent";
import { GameMode, GameModeSelect } from "./GameModeSelect";
import { HotStreak } from "./HotStreak";
import { getHighScore, setHighScore } from "./storage";
import { EnterInitialsScreen } from "./EnterInitialsScreen";
import { HighScoreHustle } from "./HighScoreHustle";
import { TenShotChallenge } from "./TenShotChallenge";

enum Screens {
    GameModeSelect,
    EnterInitials,
    HotStreak,
    HighScoreHustle,
    TenShotChallenge
}

function App() {
    const [screen, setScreen] = useState(Screens.GameModeSelect);
    const [gameMode, setGameMode] = useState<GameMode | null>(null);
    const [newHighScore, setNewHighScore] = useState(0);
    useEffect(
        function () {
            if (gameMode === GameMode.HotStreak) {
                setScreen(Screens.HotStreak);
            } else if (gameMode === GameMode.HighScoreHustle) {
                setScreen(Screens.HighScoreHustle);
            } else if (gameMode === GameMode.TenShotChallenge) {
                setScreen(Screens.TenShotChallenge);
            }
        },
        [gameMode]
    );
    useEffect(() => {
        const ws = new WebSocket("ws://192.168.1.9:8080");
        ws.onopen = () => {
            console.log("Connected to WebSocket server");
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data) as CoinMachineEvent;
            handleEvent(data);
        };
        ws.onclose = () => {
            console.log("Disconnected from WebSocket server");
        };
        return () => {
            ws.close();
        };
    }, []);

    if (screen === Screens.GameModeSelect) {
        return (
            <GameModeSelect
                onSelection={(gameMode) => {
                    setGameMode(gameMode);
                }}
            />
        );
    } else if (screen === Screens.HotStreak) {
        return (
            <HotStreak
                onNewScore={function (score) {
                    const scores = getHighScore(GameMode.HotStreak);
                    if (scores.some((s) => s.score < score)) {
                        setNewHighScore(score);
                        setScreen(Screens.EnterInitials);
                    }
                }}
                onExit={function () {
                    setScreen(Screens.GameModeSelect);
                    setGameMode(null);
                }}
            />
        );
    } else if (screen === Screens.HighScoreHustle) {
        return (
            <HighScoreHustle
                onNewScore={function (score) {
                    const scores = getHighScore(GameMode.HighScoreHustle);
                    if (scores.some((s) => s.score < score)) {
                        setNewHighScore(score);
                        setScreen(Screens.EnterInitials);
                    }
                }}
                onExit={function () {
                    setScreen(Screens.GameModeSelect);
                    setGameMode(null);
                }}
            />
        );
    } else if (screen === Screens.TenShotChallenge) {
        return (
            <TenShotChallenge
                onNewScore={function (score) {
                    const scores = getHighScore(GameMode.TenShotChallenge);
                    if (scores.some((s) => s.score > score)) {
                        setNewHighScore(score);
                        setScreen(Screens.EnterInitials);
                    }
                }}
                onExit={function () {
                    setScreen(Screens.GameModeSelect);
                    setGameMode(null);
                }}
            />
        );
    } else if (screen === Screens.EnterInitials) {
        return (
            <EnterInitialsScreen
                onNameEntered={function (name) {
                    if (gameMode === null) throw new Error("Game mode is null");
                    setHighScore(gameMode, {
                        score: newHighScore,
                        player: name
                    });
                    setScreen(Screens.GameModeSelect);
                    setGameMode(null);
                }}
            />
        );
    }

    return <div>Hey</div>;
}

export default App;
