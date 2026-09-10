// variables for drawing waves and input
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var reset = false;
var timepernote = 0;
var length = 0;

// constants and variables linking html
const input = document.getElementById("input");
const color_picker = document.getElementById("color");
const vol_slider = document.getElementById("vol-slider");
const recording_toggle = document.getElementById("record");

// variables for music and drawing waves
var interval = null;
var counter = 0;
var x = 0;
var y = 0;
var freq = 0;
var blob, recorder = null;
var chunks = [];

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

    gainNode.gain.setValueAtTime(vol_slider.value, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);

    setTimeout(() => {
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    }, timepernote - 10);
}

// function which draws the line
function line() {
    y = height/2 + ((vol_slider.value/100) * 40 * Math.sin(2 * Math.PI * freq * x * (0.5 * length)));
    ctx.lineTo(x, y);
    ctx.lineWidth = 3;
    ctx.stroke();
    x += 1;
    counter++;

    if (counter > (timepernote / 20)) {
        clearInterval(interval);
    }

    ctx.strokeStyle = color_picker.value;
    ctx.stroke();
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

// function to record the screen
function startRecording() {
    const canvasStream = canvas.captureStream(20);
    const combinedStream = new MediaStream();
    const audioDestination = audioCtx.createMediaStreamDestination();

    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    gainNode.connect(audioDestination);

    recorder = new MediaRecorder(combinedStream, {mimeType: 'video/webm'});
    recorder.ondataavailable = e => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };
    recorder.onstop = () => {
        const blob = new Blob(chunks, {type: 'video/webm'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
    };

    recorder.start();
}

// function which runs the recording
var is_recording = false;
function toggle() {
    is_recording = !is_recording;
    if (is_recording) {
        recording_toggle.innerHTML = "stop recording";
        startRecording();
    }
    else {
        recording_toggle.innerHTML = "start recording";
        recorder.stop();
    }
}