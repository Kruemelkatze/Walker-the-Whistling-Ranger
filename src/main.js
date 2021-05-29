const fps = 30;
const queue = new Queue();
const data = [];
const minLengthForNote = (5 / 30) * fps;
const mitNoteDiffLog = 0.3;

const cutoffFrequency = 5000;
const idleTimeForStop = 500;
var interval;

let minClusterDistance = 100;

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
        data.push([log]);

    } else if (hasBeenIdleSince == null && log < 0) {
        hasBeenIdleSince = now;
    } else if (!idle && now - hasBeenIdleSince > idleTimeForStop) {
        idle = true;
        console.log("stopped");
        processData(data);
    }
}

function howManyPitches(windowData, maxPitches=3) {
    let pitchTestResult = [];
    let detectedPitchSet = [];
    let finalCommand = [];
    for (let i = 0 ; i < maxPitches ; i++) {
        let clusters = figue.kmeans(i + 1, windowData);
        //console.log(clusters);
        //let deviations = calculateStdDeviation(clusters, windowData);
        //pitchTestResult.push({"clusters": clusters, "deviations": deviations});
        let isClusterToClose = false;
        for(let j = 0; j < clusters.centroids.length; j++) {
            for(let k = j + 1; k < clusters.centroids.length; k++) {
                if(Math.abs(clusters.centroids[j][0] - clusters.centroids[k][0]) < minClusterDistance) {
                    isClusterToClose = true;
                }
            }
        }
        if(!isClusterToClose) {
            pitchTestResult.push({"clusters": clusters});
        }
    }

    let pitchCount = 0;

    //let devMax = Number.MAX_VALUE;
    for (let i = 0; i < pitchTestResult.length; i++) {
        // let sum = 0.0;
        // for(let p of pitchTestResult[i].deviations) {
        //     sum += p;
        // }
        // console.log("SUM: " + sum);

        let ass = pitchTestResult[i].clusters.assignments[0];
        let countAssignmentChange = 0;
        let countAssignment = 0;
        let clusterCountMap = [];
        for(let a of pitchTestResult[i].clusters.assignments) {
            if(ass != a) {
                clusterCountMap.push({"id": ass, "count": countAssignment, "centroid": pitchTestResult[i].clusters.centroids[ass][0]});
                countAssignmentChange++;
                countAssignment = 1;
            } else {
                countAssignment++;
            }
            ass = a;
        }
        clusterCountMap.push({"id": ass, "count": countAssignment, "centroid": pitchTestResult[i].clusters.centroids[ass][0]});

        // console.log(clusterCountMap);

        //console.log(pitchTestResult[i]);

        let cleanedMapCount = 0;
        for (let c of clusterCountMap) {
            if(c.count > 1) {
                cleanedMapCount++;
            }
        }

        //if((sum * 1.1) < devMax && countAssignmentChange < pitchTestResult[i].clusters.centroids.length) {
        if(cleanedMapCount <= pitchTestResult[i].clusters.centroids.length + 1) {
            //devMax = sum;
            pitchCount = pitchTestResult[i].clusters.centroids.length;
            detectedPitchSet = clusterCountMap;
        }
    }

    for(var i = 0; i < detectedPitchSet.length - 1; i++) {
        if (detectedPitchSet[i].centroid >= detectedPitchSet[i + 1].centroid) {
            finalCommand.push(-1);
        } else {
            finalCommand.push(1);
        }
    }


    console.log("pitches: " + pitchCount);
    console.log(finalCommand);
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

    // var clusters = figue.kmeans(3, windowData);
    // var clusteredNotes = [];
    // for (let ass of clusters.assignments) {
    //     if (!clusteredNotes.includes(ass)) {
    //         clusteredNotes.push(ass);
    //     }
    // }
    //
    // clusteredNotes = clusteredNotes.map(i => Math.log2(clusters.centroids[i][0]));
    //
    // // console.dir(windowData)
    // // console.dir(notes)
    // console.dir(clusteredNotes)
    // // console.dir(clusters)
    //
    // var directions = [];
    // for (let i = 0; i < clusteredNotes.length - 1; i++) {
    //     var diff = clusteredNotes[i + 1] - clusteredNotes[i];
    //     if (diff > mitNoteDiffLog) {
    //         directions.push(1);
    //     } else if (diff < -mitNoteDiffLog) {
    //         directions.push(-1);
    //     } else {
    //         directions.push(0);
    //     }
    // }
    //
    // console.dir(directions);
    howManyPitches(windowData, 3);

    //console.log(windowData);
    /*let onethird = windowData.length / 3;
    let onethirdFloor = Math.floor(onethird);
    let onethirdCeil = Math.ceil(onethird);
    let first = 0.0, second = 0.0, third = 0.0;
    let count = 0;
    for (let i = 0; i < onethirdCeil; i++) {
        first += windowData[i][0];
        count++;
    }
    first /= count;
    count = 0;
    for(let i = onethirdFloor; i < onethirdFloor + onethirdCeil; i++) {
        second += windowData[i][0];
        count++;
    }
    second /= count;
    count = 0;
    for(let i = onethirdFloor + onethirdCeil; i < windowData.length; i++) {
        third += windowData[i][0];
        count++;
    }
    third /= count;

    console.log("first: " + first + ", second: " + second + ", third: " + third);*/

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

// only for check if centroids equal to mean
function calculateMean(clusters, data) {
    let mean = [];
    for (let i = 0; i < clusters.centroids.length; i++) {
        let sum = 0.0;
        let count = 0;
        for (let j = 0; j < clusters.assignments.length; j++) {
            if(clusters.assignments[j] === i) {
                sum += data[j][0];
                count++;
            }
        }
        mean.push(sum / count);
    }
    console.log(mean);
}

function calculateStdDeviation(clusters, data) {
    let deviations = [];
    for (let i = 0; i < clusters.centroids.length; i++) {
        let diff = 0.0;
        let count = 0;
        for (let j = 0; j < clusters.assignments.length; j++) {
            if(clusters.assignments[j] === i) {
                diff += Math.pow(data[j][0] - clusters.centroids[i], 2.0);
                count++;
            }
        }
        deviations.push(Math.sqrt(diff / count));
    }
    return deviations;
}