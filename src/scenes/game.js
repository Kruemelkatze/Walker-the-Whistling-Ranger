class Game {
    constructor() {
        this.scene;
        this.hud;
     }

    /**
     * Builds the stage and all it's components
     */
    createScene() {

        // Create the scene space
        var scene = new BABYLON.Scene(engine);

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -6), scene);
        camera.setTarget(BABYLON.Vector3.Zero());

        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {
            width: 4, height: 2
        }, scene); // default plane
        plane.material = new BABYLON.StandardMaterial("mat", scene);
        plane.material.diffuseTexture = new BABYLON.VideoTexture("video", "../videos/hallway_small.mp4", scene, true);
        plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);

        this.createHUD();
        this.getTextControl("whistleInfo").text = "tesst";

        // TODO make magic

        var ourGreen = BABYLON.Color3(102, 206, 16)
        // this.overlay = this.getOverlayPlane("../videos/dancer1.webm", scene)

        // misc
        // this.overlay = this.getOverlayPlane("../videos/encounters/misc/Whistle.webm", scene)

        // encounters
        this.overlay = this.getOverlayPlane("../videos/encounters/fabian.webm", scene)


        this.scene = scene;
        console.log("START");
    }

    getOverlayPlane(file, scene, transColor = BABYLON.Color3.Black()) {

        var plane = BABYLON.MeshBuilder.CreatePlane("plane_overay", {
            width: 4, height: 2
        }, scene); // default plane

        const video = document.createElement('video');
        video.loop = true;
        video.autoplay = true;
        video.src = file;

        const videoMaterial = new BABYLON.PBRMaterial('VideoMaterial', scene);
        videoMaterial.albedoTexture = undefined;
        // videoMaterial.reflectivityColor = transColor;
        // videoMaterial.reflectionColor = transColor;
        videoMaterial.albedoColor = transColor;
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

    getTextControl(key) {
        for (let e of this.hud.getDescendants()) {
            if (e.name == key) {
                return e;
            }
        }
        return null;
    }

    createTextElement(key, color="#FFFFFF", msg="", padLeft=0, padTop=0, padRight=0, padBottom=0) {
        let textElement = new BABYLON.GUI.TextBlock(key);
        textElement.text = msg;
        textElement.fontSize = 50;
        textElement.color = color;
        textElement.fontFamily = 'New Rocker';
        textElement.shadowBlur = 3;
        textElement.shadowColor = "#000";
        textElement.textVerticalAlignment = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;
        textElement.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
        textElement.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        textElement.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textElement.paddingLeft = `${padLeft}px`;
        textElement.paddingRight = `${padRight}px`;
        textElement.paddingTop = `${padTop}px`;
        textElement.paddingBottom = `${padBottom}px`;
        return textElement;
    }

    createHUD() {
        // GUI
        this.hud = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var whistleText = this.createTextElement("whistleInfo", "#FFFFFF", "", 0, 0, 200, 200);

        this.hud.addControl(whistleText);

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

    render() {

        if (this.scene)
            this.scene.render();

        if (this.gameOver)
            return;

        // TODO do something


    }

    /**
     * Cleanup which should be called when scene is dispatched
     */
    dispose() {
        // TODO cleanup
        this.hud.dispose();
        this.scene.dispose();
    }

}
