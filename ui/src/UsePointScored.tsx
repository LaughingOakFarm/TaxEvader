import { useCallback, useEffect, useRef, useState } from "react";
import { listenToEvent } from "./HandleEvent";
import { sounds } from "./sounds";

export function usePointScored(onSuccess: () => void, onError?: () => void) {
    const [flash, setFlash] = useState(false);
    const isThrough = useRef(false);
    useEffect(
        function () {
            return listenToEvent("pre-wheel", function () {
                isThrough.current = true;
                setTimeout(function () {
                    if (isThrough.current) {
                        sounds.error();
                        onError?.();
                    }
                    isThrough.current = false;
                }, 500);
            });
        },
        [onError]
    );
    const onAfter = useCallback(
        function () {
            if (isThrough.current) {
                isThrough.current = false;
                onSuccess();
                setFlash(true);
                sounds.marioCoin();
            }
        },
        [onSuccess]
    );
    useEffect(
        function () {
            if (flash) {
                setTimeout(function () {
                    setFlash(false);
                }, 300);
            }
        },
        [flash]
    );
    useEffect(
        function () {
            return listenToEvent("post-wheel-bottom", onAfter);
        },
        [onAfter]
    );
    useEffect(
        function () {
            return listenToEvent("post-wheel-top", onAfter);
        },
        [onAfter]
    );
    return flash;
}
