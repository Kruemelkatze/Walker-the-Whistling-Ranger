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

    get currentVideo() {
        return this.videoPlane.material.diffuseTexture ? this.videoPlane.material.diffuseTexture.video : null;
    }

    constructor() {
        this.scene;
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
//        plane.material = new BABYLON.StandardMaterial("mat", this.scene);
        // plane.material.diffuseTexture = new BABYLON.VideoTexture("video", "../videos/hallway_small.mp4", this.scene, true);
        // plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        this.videoPlane = plane;

        this.addHUD()

        scene.onKeyboardObservable.add(kbInfo => kbInfo.type == BABYLON.KeyboardEventTypes.KEYUP && this.onKeyUp(kbInfo));


        fetch(`${this.videoFolder}/path.json`)
            .then(response => response.json())
            .then(json => this.fetchedData(json));

        // TODO make magic

        //this.overlay = this.getOverlayPlane("../videos/dancer1.webm", scene)


        console.log("START");
    }

    onKeyUp(kbInfo) {
        console.log(kbInfo.event.code);

        switch (kbInfo.event.code) {
            case "ArrowUp":
                this.videoSpeed *= 2;
                this.videoSpeed = Math.min(this.videoSpeed, 16);
                if (this.currentVideo && !this.encounterActive) {
                    this.currentVideo.playbackRate = this.videoSpeed;
                }
                break;
            case "ArrowDown":
                this.videoSpeed /= 2;
                if (this.currentVideo && !this.encounterActive) {
                    this.currentVideo.playbackRate = this.videoSpeed;
                }
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

    onCommandReceived(type, val) {
        switch (type) {
            case "turn":
                if (this.waitForTurn) {
                    this.nextTurnRight = val;
                }
                break;
        }
    }

    fetchedData(pathData) {
        this.pathData = pathData;

        var first = pathData[0];
        this.setVideo(first);
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

        this.resolveEncounter();
        this.currentVideo.playbackRate = this.videoSpeed;
    }

    nextVideo(right) {
        var { nextLeft, nextRight } = this.currentVideoData;

        var nextId = right ? nextRight : nextLeft;
        var nextData = this.pathData.find(v => v.id == nextId);

        if (nextData) {
            this.setVideo(nextData);
        }
    }



    getOverlayPlane(file, scene) {

        var plane = BABYLON.MeshBuilder.CreatePlane("plane_overay", {
            width: 4, height: 2
        }, scene); // default plane

        const video = document.createElement('video');
        video.loop = true;
        video.autoplay = true;
        video.src = file;

        const videoMaterial = new BABYLON.PBRMaterial('VideoMaterial', scene);
        videoMaterial.albedoTexture = undefined;
        videoMaterial.reflectivityColor = BABYLON.Color3.Black();
        videoMaterial.reflectionColor = BABYLON.Color3.Black();
        videoMaterial.albedoColor = BABYLON.Color3.Black();
        videoMaterial.emissiveColor = BABYLON.Color3.White();
        videoMaterial.unlit = true;

        const videoTexture = new BABYLON.VideoTexture(
            'VideoTexture',
            video,
            scene,
            true,
            undefined,
            undefined,
            {
                autoPlay: true,
                loop: true,
                autoUpdateTexture: true
            }
        );
        videoMaterial.emissiveTexture = videoTexture;
        videoMaterial.opacityTexture = videoTexture;
        // ground.material = videoMaterial;

        plane.material = videoMaterial;
        plane.material.diffuseTexture = videoTexture;
        plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);

        return plane;
    }

    addHUD() {

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

        console.log("Encounter!")
        this.encounterActive = true;
        this.lastEncounter = Date.now();
        this.currentVideo.playbackRate = 1;
    }

    resolveEncounter(success) {
        if (!this.encounterActive)
            return;

        console.log("Encounter Resolved!")
        this.encounterActive = false;
        this.lastEncounter = 0;
        this.currentVideo.playbackRate = this.videoSpeed;
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
            this.waitForTurn = true;
        } else {
            this.waitForTurn = false;
        }

        if (!this.encounterActive && !this.waitForTurn && Date.now() - this.lastEncounter > this.minTimeBetweenEncounters * 1000) {
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
