var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
const input = document.getElementById('input');

var amplitude = 40;
var interval = null;
var counter = 0;
var x = 0;
var y = 0;
var freq = 0;

const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
const oscillator = audioCtx.createOscillator();

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";
oscillator.start();
gainNode.gain.value = 0;

notenames = new Map();
notenames.set("C", 261.6);
notenames.set("D", 293.7);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);

function frequency(pitch) {
    freq = pitch/10000;

    gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 1);
}

function line() {
    y = height/2 + (amplitude * Math.sin(2 * Math.PI * freq * x));
    ctx.lineTo(x, y);
    ctx.stroke();
    x += 1;
    counter++;

    if (counter > 50) {
        clearInterval(interval);
    }
}

function drawWave() {
    clearInterval(interval);
    counter = 0;

    ctx.clearRect(0, 0, width, height);
    x = 0;
    y = height/2;

    ctx.beginPath();
    ctx.moveTo(x, y);

    interval = setInterval(line, 20);
}

function handle() {
    audioCtx.resume();

    var usernotes = String(input.value);
    var pitch = notenames.get(usernotes);

    frequency(pitch);
    drawWave();
}