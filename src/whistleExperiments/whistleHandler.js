class WhistleHandler {
    cutoffFrequency = 5000;
    idleTimeForStop = 250;

    data = [];
    fps;

    start = 0;
    idle = true;
    hasBeenIdleSince = null;

    whistleCommandCallback;
    interval;

    minClusterDistance = 75;

    constructor(fps=30) {
        this.fps = fps;
    }

    /**
     *
     * @param reactOnWhistleCommandCallback callback that handles the result as array
     */
    enableWhistleHandler(reactOnWhistleCommandCallback) {
        this.whistleCommandCallback = reactOnWhistleCommandCallback;
        startDetection();

        this.interval = setInterval(this.loop, 1000/this.fps);
    }

    disableWhistleHandler() {
        clearInterval(this.interval);
    }

    loop = () => {
        let pitch = getPitch();
        let now = Date.now();

        let log;
        if (pitch > this.cutoffFrequency) {
            log = -2;
        } else if (pitch < 0) {
            log = -1;
        } else {
            log = pitch;
        }

        if (log > 0) {
            if (this.idle) {
                this.idle = false;
                console.log("Started")
                this.start = now;
                this.data.length = 0;
            }
            this.hasBeenIdleSince = null;
            //let d = [log, (now - this.start)];
            this.data.push([log]);

        } else if (this.hasBeenIdleSince == null && log < 0) {
            this.hasBeenIdleSince = now;
        } else if (!this.idle && now - this.hasBeenIdleSince > this.idleTimeForStop) {
            this.idle = true;
            this.extractWhistleCommand(this.data, 5);
        }
    };

    extractWhistleCommand(windowData, maxPitches = 3) {
        if(windowData.length < 3) return;
        let pitchTestResult = [];
        let detectedPitchSet = [];
        let finalCommand = [];
        for (let i = 0; i < maxPitches; i++) {
            let clusters = figue.kmeans(i + 1, windowData);
            if(clusters === null) break;
            let isClusterToClose = false;
            for (let j = 0; j < clusters.centroids.length; j++) {
                for (let k = j + 1; k < clusters.centroids.length; k++) {
                    if (Math.abs(clusters.centroids[j][0] - clusters.centroids[k][0]) < this.minClusterDistance) {
                        isClusterToClose = true;
                    }
                }
            }
            if (!isClusterToClose) {
                pitchTestResult.push({ "clusters": clusters });
            }
        }

        let pitchCount = 0;

        for (let i = 0; i < pitchTestResult.length; i++) {
            let ass = pitchTestResult[i].clusters.assignments[0];
            let countAssignmentChange = 0;
            let countAssignment = 0;
            let clusterCountMap = [];

            let clusterToSmall = false;
            for (let a of pitchTestResult[i].clusters.assignments) {
                if (ass !== a) {
                    if(countAssignment <= 2) clusterToSmall = true;
                    clusterCountMap.push({ "id": ass, "count": countAssignment, "centroid": pitchTestResult[i].clusters.centroids[ass][0] });
                    countAssignmentChange++;
                    countAssignment = 1;
                } else {
                    countAssignment++;
                }
                ass = a;
            }
            if(countAssignment <= 2) clusterToSmall = true;
            if(clusterToSmall) continue;
            
            clusterCountMap.push({ "id": ass, "count": countAssignment, "centroid": pitchTestResult[i].clusters.centroids[ass][0] });

            console.log("ClusterCountMap", clusterCountMap);

            pitchCount = pitchTestResult[i].clusters.centroids.length;
            detectedPitchSet = clusterCountMap;
        }

        for (let i = 0; i < detectedPitchSet.length - 1; i++) {
            if (detectedPitchSet[i].centroid >= detectedPitchSet[i + 1].centroid) {
                finalCommand.push(-1);
            } else {
                finalCommand.push(1);
            }
        }
        this.whistleCommandCallback(finalCommand);
    }
}