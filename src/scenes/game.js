class Game {
    constructor() {
        this.scene;
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

        this.addHUD()

        // TODO make magic


        this.scene = scene;
        console.log("START");
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
        this.scene.dispose();
    }

}
