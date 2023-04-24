const highScore = new Audio("high-score.ogg");
highScore.volume = 0.5;
const click = new Audio("click.ogg");
click.volume = 0.5;
const marioCoin = new Audio("mario-coin.ogg");
marioCoin.volume = 0.5;
const menuSelect = new Audio("menu-select.ogg");
menuSelect.volume = 0.5;
const error = new Audio("error.ogg");
error.volume = 0.5;

export const sounds = {
    highScore: () => void highScore.play(),
    click: () => void click.play(),
    marioCoin: () => void marioCoin.play(),
    menuSelect: () => void menuSelect.play(),
    error: () => void error.play()
};
