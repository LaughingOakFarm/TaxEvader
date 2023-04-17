import { Gpio } from 'onoff';
import WebSocket, { Server } from 'ws';

const wss = new Server({ port: 8080 });

// Rotary Encoder
const clk = new Gpio(23, 'in', 'both');
const dt = new Gpio(24, 'in', 'both');
const sw = new Gpio(12, 'in', 'rising', { debounceTimeout: 10 });

// Optocouplers
const optoOutPre = new Gpio(25, 'in', 'falling');
const optoOutPost = new Gpio(6, 'in', 'falling');

// Stepper motor
const DIR_PIN = 20;
const PUL_PIN = 21;
const ENA_PIN = 16;
const dir = new Gpio(DIR_PIN, 'out');
const pul = new Gpio(PUL_PIN, 'out');
const en = new Gpio(ENA_PIN, 'out');

let counter = 0;

// Stepper motor rotation parameters
const stepDelay = .45; // Default delay between steps (microseconds)
const direction: 0 | 1 = 1; // Default direction: 1 for clockwise, 0 for counterclockwise

// Debounce configuration
const DEBOUNCE_TIME = 50; // Debounce time in milliseconds
let buttonPressTimestamp: number | null = null;

let firstSensorTime: Date = new Date();
let secondSensorTime: Date = new Date();
let score = 0;
let updateInProgress = false;

const clients = new Set<WebSocket>();

// Stepper motor rotation loop
async function rotateStepper() {
    en.writeSync(0);
    // noinspection InfiniteLoopJS
    while (true) {
        dir.writeSync(direction);

        pul.writeSync(1);
        await sleep(stepDelay);
        pul.writeSync(0);
        await sleep(stepDelay);
    }
}

function updateScore() {
    const timeDiff: number = Math.abs(secondSensorTime.valueOf() - firstSensorTime.valueOf());
    if(timeDiff < 1000) {
        score++;
        console.log("New Score", score);
    } else {
        score = 0;
        console.log("Score Cleared", score);
    }
}

clk.watch((err, value) => {
    if (err) throw err;

    const dtValue = dt.readSync();
    if (value !== dtValue) {
        counter++;
    } else {
        counter--;
    }

    // Send update to all connected clients
    clients.forEach((client) => {
        client.send(JSON.stringify({ type: 'encoder', counter: counter }));
    });
});

// Handle button press event for rotary encoder
sw.watch((err, value) => {
    if (err) throw err;

    if (value === 0) { // Button press detected
        const currentTime = Date.now();
        if (!buttonPressTimestamp || currentTime - buttonPressTimestamp > DEBOUNCE_TIME) {
            buttonPressTimestamp = currentTime;

            // Handle button press event
            console.log('Button pressed');
            clients.forEach((client) => {
                client.send(JSON.stringify({ type: 'button', state: 'pressed' }));
            });
        }
    }
});

// Pre-Wheel Sensor
optoOutPre.watch((err) => {
    if (err) throw err;
    firstSensorTime = new Date();

    clients.forEach((client) => {
        client.send(JSON.stringify({ type: 'pre-wheel', triggered: true }));
    });

    if (!updateInProgress) {
        updateInProgress = true;
        setTimeout(function () {
            updateScore();
            clients.forEach((client) => {
                client.send(JSON.stringify({ type: 'score', score }));
            });
            updateInProgress = false;
        }, 1000);
    }
});

// Post-Wheel Sensor
optoOutPost.watch((err) => {
    if (err) throw err;
    secondSensorTime = new Date();

    clients.forEach((client) => {
        client.send(JSON.stringify({ type: 'post-wheel', triggered: true }));
    });
});

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'score', score }));
    
    clients.add(ws);

    // ... (Other code remains the same)

    ws.on('close', () => {
        clients.delete(ws);
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start the stepper motor rotation loop
// noinspection JSIgnoredPromiseFromCall
rotateStepper();

