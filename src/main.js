const fps = 30;
const queue = new Queue();
const data = [];
const minLengthForNote = (5 / 30) * fps;
const mitNoteDiffLog = 0.3;

const cutoffFrequency = 5000;
const idleTimeForStop = 500;
var interval;

var start = 0;
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
        log = Math.round(pitch * 100) / 100;
    }

    if (log > 0) {
        if (idle) {
            idle = false;
            console.log("Started")
            start = now;
            data.length = 0;
        }
        hasBeenIdleSince = null;
        var d = [log, (now - start)];
        data.push(d);

    } else if (hasBeenIdleSince == null && log < 0) {
        hasBeenIdleSince = now;
    } else if (!idle && now - hasBeenIdleSince > idleTimeForStop) {
        idle = true;
        console.log("stopped");
        processData(data);
    }
}

function processData(windowData) {
    // Quantize
    // var quantizedData = windowData.map(x => Math.floor(x[0] * 4) / 4);

    // //Filter out ausreißer
    // for (let i = 1; i < quantizedData.length - 1; i++) {
    //     var e = quantizedData[i];

    //     if (e != quantizedData[i - 1] && e != quantizedData[i + 1]) {
    //         quantizedData[i] = quantizedData[i - 1];
    //     }
    // }

    // if (quantizedData[quantizedData.length - 1] != quantizedData[quantizedData.length - 2]) {
    //     quantizedData[quantizedData.length - 1] = quantizedData[quantizedData.length - 2];
    // }

    // // get notes
    // var notes = [];
    // var previousNote = quantizedData[0];
    // var previousNoteCount = 0;
    // for (let i = 0; i < quantizedData.length; i++) {
    //     const element = quantizedData[i];
    //     if (element == previousNote) {
    //         previousNoteCount++;
    //         continue
    //     }

    //     if (previousNoteCount >= minLengthForNote) {
    //         notes.push(previousNote);
    //     }

    //     previousNote = element;
    //     previousNoteCount = 0;
    // }

    // if (previousNoteCount >= minLengthForNote) {
    //     notes.push(previousNote);
    // }

    var clusters = figue.kmeans(3, windowData);
    var clusteredNotes = [];
    for (let ass of clusters.assignments) {
        if (!clusteredNotes.includes(ass)) {
            clusteredNotes.push(ass);
        }
    }

    clusteredNotes = clusteredNotes.map(i => Math.log2(clusters.centroids[i][0]));

    // console.dir(windowData)
    // console.dir(notes)
    console.dir(clusteredNotes)
    // console.dir(clusters)

    var directions = [];
    for (let i = 0; i < clusteredNotes.length - 1; i++) {
        var diff = clusteredNotes[i + 1] - clusteredNotes[i];
        if (diff > mitNoteDiffLog) {
            directions.push(1);
        } else if (diff < -mitNoteDiffLog) {
            directions.push(-1);
        } else {
            directions.push(0);
        }
    }

    console.dir(directions);
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