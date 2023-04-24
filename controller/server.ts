import { Gpio } from "onoff";
import WebSocket, { Server } from "ws";
import { CoinMachineEvent } from "../ui/src/HandleEvent";

const wss = new Server({ port: 8080 });

// Rotary Encoder
const clk = new Gpio(23, "in", "both");
const dt = new Gpio(24, "in", "both");
const sw = new Gpio(12, "in", "both");

// Optocouplers
const optoOutPre = new Gpio(25, "in", "falling");
const optoOutPost = new Gpio(6, "in", "falling");
const optoOutPostTop = new Gpio(5, "in", "falling");

// Stepper motor
const DIR_PIN = 20;
const PUL_PIN = 21;
const ENA_PIN = 16;
const dir = new Gpio(DIR_PIN, "out");
const pul = new Gpio(PUL_PIN, "out");
const en = new Gpio(ENA_PIN, "out");

// Stepper motor rotation parameters
const stepDelay = 0.45; // Default delay between steps (microseconds)
const direction: 0 | 1 = 1; // Default direction: 1 for clockwise, 0 for counterclockwise

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

let turnEventCounter = 0;
// Handle knob turn event for rotary encoder
clk.watch(function _knobTurnEvent(err, clockValue) {
    if (err) throw err;
    if (++turnEventCounter % 2 !== 0) {
        return;
    }
    const direction = dt.readSync();
    notifyClients({
        type: "knob-turn",
        direction: direction === clockValue ? "left" : "right"
    });
});

let pressed = false;
let pressEventTimeout: NodeJS.Timeout;
// Handle button press event for rotary encoder
sw.watch(function _knobPressedEvent(err) {
    if (err) throw err;
    if (pressEventTimeout) {
        clearTimeout(pressEventTimeout);
    }
    if (pressed) {
        pressed = false;
        notifyClients({ type: "knob-pressed", pressed });
    } else {
        pressEventTimeout = setTimeout(function () {
            pressed = true;
            notifyClients({ type: "knob-pressed", pressed });
        }, 100);
    }
});

// Pre-Wheel Sensor
optoOutPre.watch(function PreWheelEvent(err) {
    if (err) throw err;
    notifyClients({ type: "pre-wheel", triggered: true });
});

// Post-Wheel Sensor (bottom)
optoOutPost.watch(function _postWheelEventBottom(err) {
    if (err) throw err;
    notifyClients({ type: "post-wheel-bottom", triggered: true });
});

// Post-Wheel Sensor (Top)
optoOutPostTop.watch(function _postWheelEventTop(err) {
    if (err) throw err;
    notifyClients({ type: "post-wheel-top", triggered: true });
});

wss.on("connection", function _connectionEvent(ws: WebSocket) {
    console.log("Client connected");
    clients.add(ws);

    // ... (Other code remains the same)

    ws.on("close", function () {
        clients.delete(ws);
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise<any>((resolve) => setTimeout(resolve, ms));
}

// Start the stepper motor rotation loop
// noinspection JSIgnoredPromiseFromCall
rotateStepper();

function notifyClients(event: CoinMachineEvent) {
    const stringifiedEvent = JSON.stringify(event);
    for (const client of clients) {
        client.send(stringifiedEvent);
    }
}
