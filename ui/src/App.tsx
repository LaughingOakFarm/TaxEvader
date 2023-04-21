import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

interface EventData {
    type: string;
    [key: string]: any;
}

function App() {
    const [score, setScore] = useState(0);
    const [isUpdated, setIsUpdated] = useState(false);

    useEffect(() => {
        if (isUpdated) {
            const timeoutId = setTimeout(() => setIsUpdated(false), 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [isUpdated]);

    const handleScoreChange = (score: number) => {
        if(score === 0) {
            window.location.reload();
            return;
        }

        setScore(score);
        setIsUpdated(true);

        const duration = Math.min((score * 1000)/2, 3000);
        const end = Date.now() + duration;
        const particleCount = Math.min(score*2, 20);

        (function frame() {
            // launch a few confetti from the left edge
            confetti({
                angle: 45,
                spread: 55,
                origin: { x: 0, y:1 },
                gravity: .75,

                startVelocity: 100,
                particleCount: particleCount,
                colors: [ '#ff3860', '#e85a74', '#960e28'],
            });

            // and launch a few from the right edge
            confetti({
                angle: 135,
                spread: 55,
                origin: { x: 1, y:1 },
                gravity: .75,

                startVelocity: 100,
                particleCount: particleCount,
                colors: [ '#ff3860', '#e85a74', '#960e28'],
            });

            // keep going until we are out of time
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data) as EventData;
            console.log("new event", data);
            if(data.type === "score") {
                handleScoreChange(data.score);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                backgroundImage: 'url(TaxEvader.jpg)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                justifyContent: 'center',
                alignItems: 'center'
            }} onClick={function() {
            const newScore = score + 1;
            handleScoreChange(newScore);
        }}>
            <div className={`number ${isUpdated ? 'pop' : ''}`}>{score}</div>
        </div>
    );
}

export default App;
