const encounterRootFolder = "../videos/encounters"
const encounterData = [
    { name: "andi", video: "andi.webm", soundTime: 6.6, attackTime: 7 },
    { name: "bernd", video: "bernd.webm", soundTime: 6.1, attackTime: 6.4 },
    { name: "fabian", video: "fabian.webm", soundTime: 4.4, attackTime: 6 },
]

class Path {

    scene;
    videoPlane;
    videoFolder = "../videos/lakeside";
    pathData;
    currentVideoData;
    videoSpeed = 1;
    nextTurnRight = null;
    waitforTurn = false;

    encounterAfterXSeconds = 20;
    minTimeBetweenEncounters = 5;
    encounterActive = false;
    lastEncounter = 0;
    currentEncounter;
    currentEncounterIsLeft;

    get currentVideo() {
        return this.videoPlane.material.diffuseTexture ? this.videoPlane.material.diffuseTexture.video : null;
    }

    get currentEncounterVideo() {
        return this.encounterPlane.material.diffuseTexture ? this.encounterPlane.material.diffuseTexture.video : null;
    }

    constructor() {
        this.scene;
        this.whistleHandler;
        this.hud;
    }

    /**
     * Builds the stage and all it's components
     */
    createScene() {

        // Create the scene space
        var scene = new BABYLON.Scene(engine);
        this.scene = scene;

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        //camera.attachControl(canvas, true);

        var cvas = document.getElementById('renderCanvas');
        var fov = camera.fov;
        var aspectRatio = cvas.width / cvas.height;
        var d = camera.position.length();

        console.log("FOV:" + fov, "aspectRatio:" + aspectRatio, "d:" + d);

        var y = d * Math.tan(fov);
        var x = y * aspectRatio;

        var plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: x, height: y }, this.scene); // default plane
        // projection on a sphere ...
        //        var plane = BABYLON.MeshBuilder.CreateSphere("plane", { arc:0.5, diameterY:9, diameterX: 16, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene); // default plane
        //        plane.rotation.z = Math.PI;
        //        plane.rotation.y = Math.PI;
        plane.material = new BABYLON.StandardMaterial("mat", this.scene);
        plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        this.videoPlane = plane;

        //Overlay Plane
        var encounterPlane = BABYLON.MeshBuilder.CreatePlane("plane_overay", {
            width: x, height: y
        }, this.scene); // default plane
        this.encounterPlane = encounterPlane;

        const videoMaterial = new BABYLON.PBRMaterial('VideoMaterial', scene);
        videoMaterial.albedoTexture = undefined;
        // videoMaterial.reflectivityColor = BABYLON.Color3.Black();
        // videoMaterial.reflectionColor = BABYLON.Color3.Black();
        videoMaterial.albedoColor = BABYLON.Color3.Black();
        videoMaterial.emissiveColor = BABYLON.Color3.White();
        videoMaterial.unlit = true;
        encounterPlane.material = videoMaterial;
        encounterPlane.setEnabled(false);

        // this.setEncounterOverlay(encounterData[0]);

        // Rest
        this.hud = new Hud(this.scene);
        this.hud.createTextElementAlign("whistleInfo", "#FFFFFF", "",  "right", "bottom");
        this.hud.createTextElementAlign("userInfo", "#FFFFFF", "", "right", "top");
        this.remainingHearts = 3;
        this.gameOver = false;
        this.hud.createTextElementAlign("heartInfo", "#FFFFFF", this.getHeartsText(), "left", "top");

        // this.hud.createTextElementAlign("test", "#FFFFFF", "TEST", "left", "top");
        // this.hud.createTextElementPos("test", "#FFFFFF", "TEST", 200, 200);
        // this.hud.updateText("userInfo", "testtt", true);

        scene.onKeyboardObservable.add(kbInfo => kbInfo.type == BABYLON.KeyboardEventTypes.KEYUP && this.onKeyUp(kbInfo));

        fetch(`${this.videoFolder}/path.json`)
            .then(response => response.json())
            .then(json => {
                this.fetchedData(json)
            });

        // TODO make magic

        //this.overlay = this.getOverlayPlane("../videos/dancer1.webm", scene)


        console.log("START");
    }

    onKeyUp(kbInfo) {
        console.log(kbInfo.event.code);

        switch (kbInfo.event.code) {
            case "ArrowUp":
                this.speedUp();
                break;
            case "ArrowDown":
                this.slowDown();
                break;
            case "ArrowRight":
                this.onCommandReceived("turn", true);
                break;
            case "ArrowLeft":
                this.onCommandReceived("turn", false);
                break;
            case "KeyR":
                this.setVideo(this.pathData[0]);
                break;
            case "KeyE":
                if (this.encounterActive) {
                    this.resolveEncounter();
                } else {
                    this.setEncounter();
                }
                break;
        }
    }

    getHeartsText() {
        let txt = "";
        for (let i = 0; i<this.remainingHearts; i++) {
            txt += "♡";
        }
        return txt;
    }

    speedUp() {
        this.videoSpeed++;
        this.videoSpeed = Math.min(this.videoSpeed, 3);
        console.log("speed up: " + this.videoSpeed);
        this.setPlaybackRate();
    }

    slowDown() {
        this.videoSpeed--;
        this.videoSpeed = Math.max(this.videoSpeed, 1);

        console.log("slow down: " + this.videoSpeed);
        this.setPlaybackRate();
    }

    onCommandReceived(type, val) {
        switch (type) {
            case "turn":
                if (this.waitForTurn) {
                    this.nextTurnRight = val;
                }
                break;
        }
    }

    setPlaybackRate() {
        if (!this.currentVideo || this.encounterActive)
            return;

        switch (this.videoSpeed) {
            case 1:
                this.currentVideo.playbackRate = 1;
                break;
            case 2:
                this.currentVideo.playbackRate = 3;
                break;
            case 3:
                this.currentVideo.playbackRate = 6;
                break;
        }
    }

    fetchedData(pathData) {
        this.pathData = pathData;

        var first = pathData[0];
        this.setVideo(first);

        this.whistleHandler = new WhistleHandler();
        this.whistleHandler.enableWhistleHandler((whistlePattern) => {
            switch (whistlePattern.length) {
                case 0:
                    break;
                case 1:
                    if (whistlePattern[0] == -1) {
                        this.onCommandReceived("turn", false);
                        this.hud.updateText("whistleInfo", "turn left", true);
                        console.log("turn left");
                        return;
                    } else if (whistlePattern[0] == 1) {
                        this.onCommandReceived("turn", true);
                        this.hud.updateText("whistleInfo", "turn right", true);
                        console.log("turn right");
                        return;
                    }
                    break;
                case 2:
                    if (whistlePattern[0] == 1 && whistlePattern[1] == -1) {
                        this.speedUp();
                        return;
                    } else if (whistlePattern[0] == -1 && whistlePattern[1] == 1) {
                        this.slowDown();
                        return;
                    } else if (whistlePattern[0] == 1 && whistlePattern[1] == 1) {
                        this.hud.updateText("whistleInfo", "defend right", true);
                        console.log("defend right");

                        if (this.currentEncounterIsLeft === false)
                            this.resolveEncounter(true);
                        return;
                    } else if (whistlePattern[0] == -1 && whistlePattern[1] == -1) {
                        this.hud.updateText("whistleInfo", "defend left", true);
                        console.log("defend left");

                        if (this.currentEncounterIsLeft === true)
                            this.resolveEncounter(true);
                        return;
                    }
                    break;
            }

            this.hud.updateText("whistleInfo", "did not recognize", true);
            console.log("did not recognize")

        });
    }



    setVideo(videoData) {
        this.nextTurnRight = null;
        this.currentVideoData = videoData;

        if (this.videoPlane.material.diffuseTexture) {
            this.videoPlane.material.diffuseTexture.dispose();
        } else {
            this.videoPlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        }
        this.videoPlane.material.diffuseTexture = new BABYLON.VideoTexture("video", `${this.videoFolder}/${videoData.videoFile}`, this.scene, true);
        this.currentVideo.loop = false;

        this.lastEncounter = 0;
        this.resolveEncounter();
        this.setPlaybackRate();
    }

    nextVideo(right) {
        var { nextLeft, nextRight } = this.currentVideoData;

        var nextId = right ? nextRight : nextLeft;
        var nextData = this.pathData.find(v => v.id == nextId);

        if (nextData) {
            this.setVideo(nextData);
        }
    }


    setEncounterOverlay(encounterData, isLeft) {
        var videoSrc = `${encounterRootFolder}/${encounterData.video}`;

        if (this.encounterPlane.material.diffuseTexture) {
            this.encounterPlane.material.diffuseTexture.dispose();
        }

        var videoMaterial = this.encounterPlane.material;

        var overlayVideoTexture = new BABYLON.VideoTexture(
            'VideoTexture',
            videoSrc,
            this.scene,
            true,
        );

        videoMaterial.emissiveTexture = overlayVideoTexture;
        videoMaterial.opacityTexture = overlayVideoTexture;
        videoMaterial.diffuseTexture = overlayVideoTexture;
        overlayVideoTexture.video.loop = false;
        overlayVideoTexture.video.muted = true;

        this.encounterPlane.scaling.x = isLeft ? -1 : 1;

        this.encounterPlane.setEnabled(true);
    }

    fadeoutEncounterOverlay() {
        if (!this.encounterPlane.material.diffuseTexture)
            return;

        this.encounterPlane.setEnabled(false);
    }

    resetEncounterOverlay() {

    }

    /**
     * Is triggered to start the game when the scene is loaded
     */
    onLoad() {

        // TODO do something

    }

    /**
     * Is a check for switching scenes. Scene switching should only be done if scene is ready.
     * @returns {*}
     */
    isReady() {
        return (this.scene && this.scene.isReady());
    }

    setEncounter() {
        if (this.encounterActive)
            return;

        this.hud.updateText("userInfo", "You are getting attacked!", true);
        console.log("Encounter!")
        this.encounterActive = true;
        this.lastEncounter = this.currentVideo.currentTime;
        this.currentVideo.playbackRate = 1;

        var encounter = encounterData[Math.floor(Math.random() * encounterData.length)];
        this.currentEncounter = encounter;
        this.currentEncounterIsLeft = Math.random() < 0.5;

        this.setEncounterOverlay(encounter, this.currentEncounterIsLeft);

        this.currentEncounterVideo.onloadeddata = () => {
            this.encounterCallback = setTimeout(() => {
                this.resolveEncounter(false);
            }, encounter.attackTime * 1000);
        }
    }

    resolveEncounter(success) {
        if (!this.encounterActive)
            return;

        if (this.encounterCallback) {
            clearTimeout(this.encounterCallback);
        }

        this.hud.updateText("userInfo", "You beat the foe!", true);
        console.log("Encounter Resolved!")
        this.encounterActive = false;
        this.lastEncounter = this.currentVideo.currentTime;
        this.currentEncounter = null;
        this.setPlaybackRate();
        this.fadeoutEncounterOverlay();

        if (success === false) {
            this.penalty();
        }
    }

    penalty() {
        this.hud.updateText("userInfo", "You got hit!", true);
        this.remainingHearts--;
        this.hud.updateText("heartInfo", this.getHeartsText());
        console.log("Penalty!")
        if (this.remainingHearts == 0) {
            this.hud.createTextElementAlign("lostInfo", "#FF0000", "You die!", "center", "center");
            this.gameOver = true;
            setTimeout(() => {
                setNewScene(endfail);
            }, 5000
            );
        }
    }

    render() {

        if (this.scene)
            this.scene.render();

        if (this.gameOver)
            return;

        // TODO do something
        var vid = this.currentVideo;
        if (vid && vid.currentTime >= vid.duration && this.nextTurnRight != null && !this.encounterActive) {
            this.nextVideo(this.nextTurnRight);
        } else if (vid && vid.duration - vid.currentTime < 5) {
            if (!this.waitForTurn) {
                this.hud.updateText("userInfo", "Choose a path...");
                console.log("waiting for turn")
            }
            this.waitForTurn = true;
        } else {
            this.waitForTurn = false;
        }

        if (!this.encounterActive && !this.waitForTurn && this.currentVideo.currentTime - this.lastEncounter > this.minTimeBetweenEncounters) {
            var enc = Math.random() < (this.videoSpeed / this.encounterAfterXSeconds / engine._fps);
            if (enc) {
                this.setEncounter();
            }
        }

    }

    /**
     * Cleanup which should be called when scene is dispatched
     */
    dispose() {
        // TODO cleanup
        this.scene.dispose();
    }

}
