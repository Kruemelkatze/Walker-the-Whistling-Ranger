const fps = 30;
const queue = new Queue();
const data = [];

var interval;

function startApp() {
    startDetection();

    interval = setInterval(loop, 1000 / fps);
}


function loop() {
    var pitch = getPitch();
    var log = pitch > 0 ? Math.round(Math.log2(pitch) * 100) / 100 : -1;

    var d = [Date.now(), log];
    data.push(d);
}

function stopApp() {
    clearInterval(interval);
}

function saveData() {
    var csvString = "Time,Log\n";
    for (let d of data) {
        csvString += `${d[0]},${d[1]}\n`;
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