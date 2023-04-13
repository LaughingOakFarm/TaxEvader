import { Gpio } from 'onoff';
import WebSocket, { Server } from 'ws';

const wss = new Server({ port: 8080 });

// Rotary Encoder
const clk = new Gpio(23, 'in', 'both');
const dt = new Gpio(24, 'in', 'both');
const sw = new Gpio(12, 'in', 'rising', { debounceTimeout: 10 });

// Ultrasonic Sensor
const trig = new Gpio(5, 'out');
const echo = new Gpio(6, 'in', 'both');

// Optocoupler
const optoOut = new Gpio(25, 'in', 'falling');

// Stepper motor
const dir = new Gpio(17, 'out');
const pul = new Gpio(27, 'out');
const en = new Gpio(22, 'out');

let counter = 0;

// Stepper motor rotation parameters
let stepDelay = 1000; // Default delay between steps (microseconds)
let direction: 0 | 1 = 1; // Default direction: 1 for clockwise, 0 for counterclockwise

// Stepper motor rotation loop
async function rotateStepper() {
    // noinspection InfiniteLoopJS
    while (true) {
        dir.writeSync(direction);
        en.writeSync(0);

        pul.writeSync(1);
        await sleep(1);
        pul.writeSync(0);

        await sleep(stepDelay);
    }
}

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    // Rotary Encoder
    clk.watch((err, value) => {
        if (err) throw err;

        const dtValue = dt.readSync();
        if (value !== dtValue) {
            counter++;
        } else {
            counter--;
        }

        ws.send(JSON.stringify({ type: 'encoder', counter: counter }));
    });

    sw.watch((err) => {
        if (err) throw err;
        ws.send(JSON.stringify({ type: 'encoderButton', pressed: true }));
    });

    // Optocoupler
    optoOut.watch((err) => {
        if (err) throw err;
        ws.send(JSON.stringify({ type: 'optocoupler', triggered: true }));
    });

    ws.on('message', async (message: WebSocket.Data) => {
        const data = JSON.parse(message.toString());

        // Update stepper motor direction
        if (data.type === 'updateStepperDirection') {
            direction = data.direction as 0 | 1;
        }

        // Update stepper motor step delay (speed)
        if (data.type === 'updateStepperSpeed') {
            stepDelay = data.stepDelay;
        }

        // Ultrasonic sensor
        if (data.type === 'measureDistance') {
            const distance = await measureDistance();
            ws.send(JSON.stringify({ type: 'distance', distance: distance }));
        }
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function measureDistance(): Promise<number> {
    return new Promise((resolve, reject) => {
        let start: bigint;
        let end: bigint;

        echo.watch((err, value) => {
            if (err) reject(err);

            if (value === 1) {
                start = process.hrtime.bigint();
            } else {
                end = process.hrtime.bigint();
                echo.unwatchAll();
                resolve(Number(end - start) / 1e6 / 2 / 29.1);
            }
        });

        trig.writeSync(1);
        setTimeout(() => {
            trig.writeSync(0);
        }, 10);
    });
}

// Start the stepper motor rotation loop
// noinspection JSIgnoredPromiseFromCall
rotateStepper();

