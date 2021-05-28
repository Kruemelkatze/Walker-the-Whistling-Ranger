const fps = 30;
const queue = new Queue();
const data = [];

const cutoffFrequency = 5000;
const idleTimeForStop = 400;
var interval;

var idle = true;
var hasBeenIdleSince = null;

function startApp() {
    startDetection();

    interval = setInterval(loop, 1000 / fps);
}


function loop() {
    var pitch = getPitch();
    var now = Date.now();

    var log;
    if (pitch > cutoffFrequency) {
        log = -2;
    } else if (pitch < 0) {
        log = -1;
    } else {
        log = Math.round(Math.log2(pitch) * 100) / 100;
    }

    if (log > 0) {
        if (idle) {
            idle = false;
            console.log("Started")
            data.length = 0;
        }
        hasBeenIdleSince = null;
        var d = log;//[now, log];
        data.push(d);

    } else if (hasBeenIdleSince == null && log < 0) {
        hasBeenIdleSince = now;
    } else if (!idle && now - hasBeenIdleSince > idleTimeForStop) {
        idle = true;
        console.log("stopped");
        console.dir(data);
    }
}

function stopApp() {
    clearInterval(interval);
}

function saveData() {
    var csvString = "";
    for (let d of data) {
        csvString += `${d[1]}\n`.replace(".", ",");
    }

    console.log(csvString)
    download("pitches.csv", csvString);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}