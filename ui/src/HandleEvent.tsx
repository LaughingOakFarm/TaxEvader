export type EventType = CoinMachineEvent["type"];

export interface PreWheelEvent {
    type: "pre-wheel";
    triggered: true;
}

export interface KnobPressedEvent {
    type: "knob-pressed";
    pressed: boolean;
}

export interface KnobTurnEvent {
    type: "knob-turn";
    direction: "left" | "right";
}

export interface PostWheelBottomEvent {
    type: "post-wheel-bottom";
    triggered: true;
}

export interface PostWheelTopEvent {
    type: "post-wheel-top";
    triggered: true;
}

export type CoinMachineEvent =
    | PreWheelEvent
    | KnobPressedEvent
    | KnobTurnEvent
    | PostWheelBottomEvent
    | PostWheelTopEvent;

export type EventMap = {
    "pre-wheel": PreWheelEvent;
    "knob-pressed": KnobPressedEvent;
    "knob-turn": KnobTurnEvent;
    "post-wheel-bottom": PostWheelBottomEvent;
    "post-wheel-top": PostWheelTopEvent;
};

const listeners: Record<EventType, ((event: CoinMachineEvent) => void)[]> = {
    "pre-wheel": [],
    "knob-pressed": [],
    "knob-turn": [],
    "post-wheel-bottom": [],
    "post-wheel-top": []
};

export function listenToEvent<Type extends EventType>(
    type: Type,
    listener: (event: EventMap[Type]) => void
) {
    listeners[type].push(listener as any);
    return function () {
        const index = listeners[type].indexOf(listener as any);
        if (index !== -1) {
            listeners[type].splice(index, 1);
        }
    };
}

(window as any).handleEvent = handleEvent;
export function handleEvent(event: CoinMachineEvent) {
    if (event.type === "pre-wheel") {
        for (const listener of listeners["pre-wheel"]) {
            listener(event);
        }
    } else if (event.type === "knob-pressed") {
        for (const listener of listeners["knob-pressed"]) {
            listener(event);
        }
    } else if (event.type === "knob-turn") {
        for (const listener of listeners["knob-turn"]) {
            listener(event);
        }
    } else if (event.type === "post-wheel-bottom") {
        for (const listener of listeners["post-wheel-bottom"]) {
            listener(event);
        }
    } else if (event.type === "post-wheel-top") {
        for (const listener of listeners["post-wheel-top"]) {
            listener(event);
        }
    }
}

handleEvent.simulateTurnLeft = function () {
    handleEvent({ type: "knob-turn", direction: "left" });
};
handleEvent.simulateTurnRight = function () {
    handleEvent({ type: "knob-turn", direction: "right" });
};
handleEvent.simulateKnobPress = function () {
    handleEvent({ type: "knob-pressed", pressed: true });
};
handleEvent.simulateKnobRelease = function () {
    handleEvent({ type: "knob-pressed", pressed: false });
};
handleEvent.simulateCoinThru = function () {
    handleEvent({ type: "pre-wheel", triggered: true });
    handleEvent({ type: "post-wheel-bottom", triggered: true });
};
handleEvent.simulateCoinBlocked = function () {
    handleEvent({ type: "pre-wheel", triggered: true });
};
