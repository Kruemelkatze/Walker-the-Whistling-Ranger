class TheEndSuccess {
    constructor() {
        this.scene;
    }

    createScene() {
        // Create the scene space
        var scene = new BABYLON.Scene(engine);

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -6), scene);
        camera.setTarget(BABYLON.Vector3.Zero());

        this.scene = scene;

        this.hud = new Hud(this.scene);
        this.hud.createTextElementAlign("whistleInfo", "#FFFFFF", "♡♡♡ You win! ♡♡♡\n\nWhistle to continue.", "center", "center");

        this.whistleHandler = new WhistleHandler();
        this.whistleHandler.enableWhistleHandler((whistlePattern) => {
            if (whistlePattern.length) {
                setNewScene(menu);
            }
        });
    }

    onLoad() {
    }

    isReady() {
        return (this.scene && this.scene.isReady());
    }

    render() {
        this.scene.render();
    }

    dispose() {
        this.scene.dispose();
        if (this.whistleHandler)
            this.whistleHandler.disableWhistleHandler();
    }

}
