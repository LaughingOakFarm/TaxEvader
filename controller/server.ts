import { Gpio } from 'onoff';
import WebSocket, { Server } from 'ws';

const wss = new Server({ port: 8080 });

// Rotary Encoder
const clk = new Gpio(23, 'in', 'both');
const dt = new Gpio(24, 'in', 'both');
const sw = new Gpio(12, 'in', 'rising', { debounceTimeout: 10 });

// Limit Switch
const LIMIT_SWITCH_PIN = 24;
const limitSwitch = new Gpio(LIMIT_SWITCH_PIN, 'in', 'both');

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

// Debounce configuration
const DEBOUNCE_TIME = 50; // Debounce time in milliseconds
let buttonPressTimestamp: number | null = null;

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

    // Handle button press event for rotary encoder
    sw.watch((err, value) => {
        if (err) throw err;

        if (value === 0) { // Button press detected
            const currentTime = Date.now();
            if (!buttonPressTimestamp || currentTime - buttonPressTimestamp > DEBOUNCE_TIME) {
                buttonPressTimestamp = currentTime;

                // Handle button press event
                console.log('Button pressed');
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'button', state: 'pressed' }));
                    }
                });
            }
        }
    });

    // Handle Limit Switch state changes
    limitSwitch.watch((err, value) => {
        if (err) throw err;

        const state = value === 1 ? 'open' : 'closed';
        console.log(`Limit Switch: ${state}`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'limitSwitch', state }));
            }
        });
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
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start the stepper motor rotation loop
// noinspection JSIgnoredPromiseFromCall
rotateStepper();

