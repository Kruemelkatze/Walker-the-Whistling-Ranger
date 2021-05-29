class Menu {

    constructor() {
        this.scene;
    }

    createScene() {
        // Create the scene space
        let scene = new BABYLON.Scene(engine);
        this.scene = scene;

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        //camera.attachControl(canvas, true);

        var cvas = document.getElementById('renderCanvas');
        var fov = camera.fov;
        var aspectRatio = cvas.width / cvas.height;
        var d = camera.position.length();

        var y = d * Math.tan(fov);
        var x = y * aspectRatio;

        var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: x, height: y}, this.scene); // default plane
        plane.material = new BABYLON.StandardMaterial("mat", this.scene);
        plane.material.diffuseTexture = new BABYLON.VideoTexture("video", "../videos/hallway_small_rev.mp4", this.scene, true);
        plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);


        this.addOverlay(scene, x, y);

        scene.onKeyboardObservable.add(kbInfo => kbInfo.type == BABYLON.KeyboardEventTypes.KEYUP && this.onKeyUp(kbInfo));

    }

    onKeyUp(kbInfo) {
        switch (kbInfo.event.code) {
            case "Space":
                setNewScene(path);
        }
    }

    addOverlay(scene, width, height) {
        var plane = BABYLON.MeshBuilder.CreatePlane("plane_overay", {
            width, height
        }, scene); // default plane

        const video = document.createElement('video');
        video.loop = true;
        video.autoplay = true;
        video.src = "../videos/encounters/misc/Come_Up.webm";

        video.onplay = () => {
            setTimeout(() => {
                video.src = "../videos/encounters/misc/Whistle.webm";
            }, 4400);
        }

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
    }

}
