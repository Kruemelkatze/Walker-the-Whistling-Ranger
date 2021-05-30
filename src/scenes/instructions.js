/******* Add the create scene function ******/
class Instructions {

    constructor() {
        this.scene;
        this.video;
    }

    createScene() {

        var scene = new BABYLON.Scene(engine);
        this.scene = scene;

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -6), scene);
        camera.setTarget(BABYLON.Vector3.Zero());

        var cvas = document.getElementById('renderCanvas');
        var fov = camera.fov;
        var aspectRatio = cvas.width / cvas.height;
        var d = camera.position.length();

        var y = d * Math.tan(fov);
        var x = y * aspectRatio;

        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: x, height: y}, this.scene); // default plane
        plane.material = new BABYLON.StandardMaterial("mat", this.scene);
        plane.material.diffuseTexture = new BABYLON.VideoTexture("video", "videos/Walker-intro.mp4", this.scene, true);
        plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);

        var music = new BABYLON.Sound("Music", "audio/background_athmosphere.mp3", scene, null, {
            loop: true,
            autoplay: true,
            volume: 0.66
        });

        scene.onKeyboardObservable.add(kbInfo => kbInfo.type == BABYLON.KeyboardEventTypes.KEYUP && this.onKeyUp(kbInfo));

    }

    onKeyUp(kbInfo) {
        console.log(kbInfo.event.code);
        switch (kbInfo.event.code) {
            case "Esc":
                setNewScene(menu)
                break;
        }
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
