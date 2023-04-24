import { useEffect, useState } from "react";
import { listenToEvent } from "./HandleEvent";
import { sounds } from "./sounds";

interface IEnterInitialsScreenProps {
    onNameEntered: (name: string) => void;
}

export function EnterInitialsScreen({
    onNameEntered
}: IEnterInitialsScreenProps) {
    const [name, setName] = useState("");
    const [highLightPosition, setHighlightPosition] = useState(0);
    const btnCount = characters.length + 2;
    useEffect(() => void sounds.highScore(), []);
    useEffect(function () {
        return listenToEvent("knob-turn", function (event) {
            if (event.direction === "left") {
                setHighlightPosition(function (position) {
                    return position <= 0
                        ? btnCount - 1
                        : (position - 1) % btnCount;
                });
            } else {
                setHighlightPosition(function (position) {
                    return position >= btnCount ? 0 : (position + 1) % btnCount;
                });
            }
        });
    }, []);
    useEffect(
        function () {
            return listenToEvent("knob-pressed", function (event) {
                if (!event.pressed) {
                    return;
                }
                if (highLightPosition < characters.length) {
                    if (name.length < 3) {
                        setName(name + characters[highLightPosition]);
                    }
                } else if (highLightPosition === characters.length) {
                    setName(name.slice(0, -1));
                } else if (highLightPosition === characters.length + 1) {
                    onNameEntered(name.padEnd(3, " "));
                }
            });
        },
        [name, highLightPosition, onNameEntered]
    );

    return (
        <div
            className={"enter-initials-screen"}
            style={{ backgroundImage: "url('enter-initials.png')" }}
        >
            <div className={"enter-initials-screen-title black-stroke"}>
                HIGH SCORE!!! Enter Initials
            </div>
            <div className={"enter-initials-screen-name"}>
                {name.padEnd(3, "_")}
            </div>
            <div className={"enter-initials-screen-name-characters"}>
                {characters.map((c, i) => (
                    <button
                        key={i}
                        className={`enter-initials-screen-character black-stroke${
                            i === highLightPosition ? " is-active" : ""
                        }`}
                        onClick={function () {
                            if (name.length < 3) {
                                setName(name + c);
                            }
                        }}
                    >
                        {c}
                    </button>
                ))}
                <br />
                <button
                    className={`enter-initials-screen-character black-stroke${
                        characters.length === highLightPosition
                            ? " is-active"
                            : ""
                    }`}
                    onClick={function () {
                        setName(name.slice(0, -1));
                    }}
                >
                    <img
                        className={"enter-initials-screen-icon"}
                        src={"backspace-icon.png"}
                        alt={"backspace"}
                    />
                </button>
                <button
                    className={`enter-initials-screen-character black-stroke${
                        characters.length + 1 === highLightPosition
                            ? " is-active"
                            : ""
                    }`}
                    onClick={function () {
                        onNameEntered(name.padEnd(3, " "));
                    }}
                >
                    <img
                        className={"enter-initials-screen-icon"}
                        src={"checkmark-icon.png"}
                        alt={"checkmark"}
                    />
                </button>
            </div>
        </div>
    );
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
