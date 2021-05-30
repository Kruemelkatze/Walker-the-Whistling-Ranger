class Menu {

    constructor() {
        this.scene;
        this.selectedIdx = 0;
        this.menuItems = ["instructions", "game", "credits"];

        this.textColor = "#FFFFFF";
        this.highlightColor = "#FFD700";
    }


    createScene() {
        // Create the scene space
        let scene = new BABYLON.Scene(engine);
        this.scene = scene;

        this.hud = new Hud(this.scene);
        // this.hud.createImage("myimage", "images/left.png", 0, 0, 100, 100);

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        //camera.attachControl(canvas, true);

        this.hud.createTextElementPos("instructions", this.highlightColor, "Intro", 50, 50);
        this.hud.createTextElementPos("game", this.textColor, "Start Game", 50, 150);
        this.hud.createTextElementPos("credits", this.textColor, "Credits", 50, 250);

        this.whistleHandler = new WhistleHandler();
        this.whistleHandler.enableWhistleHandler((whistlePattern) => {
            switch (whistlePattern.length) {
                case 1:
                    if (whistlePattern[0] == -1) {
                        this.nextItem();
                    } else if (whistlePattern[0] == 1) {
                        this.previousItem();
                    }
                    break;
                case 2:
                    if (whistlePattern[0] == 1 && whistlePattern[1] == 1) {
                        this.startSelectedScene();
                    }
                    break;
            }
        });

        scene.onKeyboardObservable.add(kbInfo => kbInfo.type == BABYLON.KeyboardEventTypes.KEYUP && this.onKeyUp(kbInfo));


        // var cvas = document.getElementById('renderCanvas');
        // var fov = camera.fov;
        // var aspectRatio = cvas.width / cvas.height;
        // var d = camera.position.length();
        //
        // var y = d * Math.tan(fov);
        // var x = y * aspectRatio;
        //
        // var plane = BABYLON.MeshBuilder.CreatePlane("plane", {width: x, height: y}, this.scene); // default plane
        // plane.material = new BABYLON.StandardMaterial("mat", this.scene);
        // plane.material.diffuseTexture = new BABYLON.VideoTexture("video", "videos/hallway_small_rev.mp4", this.scene, true);
        // plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);

        // this.addOverlay(scene, x, y);

        // scene.onKeyboardObservable.add(kbInfo => kbInfo.type == BABYLON.KeyboardEventTypes.KEYUP && this.onKeyUp(kbInfo));


    }

    onKeyUp(kbInfo) {
        console.log(kbInfo.event.code);

        switch (kbInfo.event.code) {
            case "ArrowUp":
                this.previousItem()
                break;
            case "ArrowDown":
                this.nextItem()
                break;
            case "Space":
                this.startSelectedScene();
                break;
        }
    }

    nextItem() {
        this.selectedIdx = Math.min(this.selectedIdx + 1, this.menuItems.length - 1);
        this.selectItem(this.selectedIdx);
    }

    previousItem() {
        this.selectedIdx = Math.max(this.selectedIdx - 1, 0);
        this.selectItem(this.selectedIdx);
    }

    selectItem(index) {
        for (let item of this.menuItems) {
            this.hud.updateColor(item, this.textColor);
        }
        this.hud.updateColor(this.menuItems[index], this.highlightColor);
    }

    startSelectedScene() {
        switch (this.selectedIdx) {
            case 0:
                setNewScene(instructions);
                break;
            case 1:
                setNewScene(path);
                break;
            case 2:
                setNewScene(credits)
                break;
        }
    }

    // addOverlay(scene, width, height) {
    //     var plane = BABYLON.MeshBuilder.CreatePlane("plane_overay", {
    //         width, height
    //     }, scene); // default plane
    //
    //     const video = document.createElement('video');
    //     video.loop = true;
    //     video.autoplay = true;
    //     video.src = "videos/encounters/misc/Come_Up.webm";
    //
    //     video.onplay = () => {
    //         setTimeout(() => {
    //             video.src = "videos/encounters/misc/Whistle.webm";
    //         }, 4400);
    //     }
    //
    //     const videoMaterial = new BABYLON.PBRMaterial('VideoMaterial', scene);
    //     videoMaterial.albedoTexture = undefined;
    //     videoMaterial.reflectivityColor = BABYLON.Color3.Black();
    //     videoMaterial.reflectionColor = BABYLON.Color3.Black();
    //     videoMaterial.albedoColor = BABYLON.Color3.Black();
    //     videoMaterial.emissiveColor = BABYLON.Color3.White();
    //     videoMaterial.unlit = true;
    //
    //     const videoTexture = new BABYLON.VideoTexture(
    //         'VideoTexture',
    //         video,
    //         scene,
    //         true,
    //         undefined,
    //         undefined,
    //         {
    //             autoPlay: true,
    //             loop: true,
    //             autoUpdateTexture: true
    //         }
    //     );
    //     videoMaterial.emissiveTexture = videoTexture;
    //     videoMaterial.opacityTexture = videoTexture;
    //     // ground.material = videoMaterial;
    //
    //     plane.material = videoMaterial;
    //     plane.material.diffuseTexture = videoTexture;
    //     plane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    // }


    onLoad() {

    }

    isReady() {
        return (this.scene && this.scene.isReady());
    }

    render() {
        this.scene.render();
    }

    dispose() {
        if (this.overlayPlane) {
            this.overlayPlane.material.diffuseTexture.dispose();
            this.overlayPlane.material.dispose();
            this.overlayPlane.material = null;
        }
        this.whistleHandler.disableWhistleHandler();
        this.scene.dispose();
    }

}
