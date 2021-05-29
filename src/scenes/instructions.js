/******* Add the create scene function ******/
class Instructions {

    constructor() {
        this.scene;
        this.video;
    }

    createScene() {

        var scene = new BABYLON.Scene(engine);

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -6), scene);
        camera.setTarget(BABYLON.Vector3.Zero());


        this.scene = scene;

    }

    isReady() {
        return (this.scene && this.scene.isReady());
    }

    onLoad() {
    }

    render() {
        this.scene.render();
    }

    dispose() {
        this.scene.dispose();
    }
}
