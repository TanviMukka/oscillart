// main variables for drawing waves and input
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var reset = false;
var timepernote = 0;
var length = 0;
const input = document.getElementById('input');

// main variables for music and drawing waves
var amplitude = 40;
var interval = null;
var counter = 0;
var x = 0;
var y = 0;
var freq = 0;

// constants for the music
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
const oscillator = audioCtx.createOscillator();

// producing the music or sounds
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";
oscillator.start();
gainNode.gain.value = 0;

// different frequencies of different musical notes
notenames = new Map();
notenames.set("C", 261.6);
notenames.set("D", 293.7);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);

// function which produces the music
function frequency(pitch) {
    freq = pitch/10000;

    gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + (timepernote / 1000) - 0.1);
}

// function which draws the line
function line() {
    y = height/2 + (amplitude * Math.sin(2 * Math.PI * freq * x * (0.5 * length)));
    ctx.lineTo(x, y);
    ctx.stroke();
    x += 1;
    counter++;

    if (counter > (timepernote / 20)) {
        clearInterval(interval);
    }
}

// function which draws the sine wave
function drawWave() {
    clearInterval(interval);

    counter = 0;
    interval = setInterval(line, 20);

    if (reset) {
        ctx.clearRect(0, 0, width, height);
        x = 0;
        y = height/2;
        ctx.moveTo(x, y);
        ctx.beginPath();
    }
    
    reset = false;
}

// function which runs everything
function handle() {
    audioCtx.resume();
    reset = true;

    var usernotes = String(input.value);
    var noteslist = [];
    length = usernotes.length;
    timepernote = (6000 / length);

    for (i = 0; i < usernotes.length; i++) {
        noteslist.push(notenames.get(usernotes.charAt(i)));
    }

    let j = 0;
    repeat = setInterval(() => {
        if (j < noteslist.length) {
            frequency(parseInt(noteslist[j]));
            drawWave();
        j++
        }
        else {
            clearInterval(repeat)
        }
    }, timepernote)
}