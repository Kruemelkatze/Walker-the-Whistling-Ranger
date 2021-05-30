/******* Add the create scene function ******/
class Credits {

    constructor() {
        this.scene;
    }

    createScene() {

        var scene = new BABYLON.Scene(engine);

        // Add a camera to the scene and attach it to the canvas
        let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -6), scene);
        camera.setTarget(BABYLON.Vector3.Zero());

        this.scene = scene;

        this.hud = new Hud(this.scene);
        var cvas = document.getElementById('renderCanvas');

        // instruction image
        let scale = 0.5;
        let imgW = 1024 * scale;
        let imgH = 1024 * scale;
        this.hud.createImage("myimage", "images/group.jpg", cvas.width / 2 - imgW / 2, cvas.height / 2 - imgH / 2, imgW, imgH);

        var txt = this.hud.createTextElementPos("1", "#FFFFFF", "Team", 0, 0, 50);
        txt.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        var txt = this.hud.createTextElementPos("12", "#FFFFFF", "Andi\nBernd\nFabian\nJürgen\nMathias", 0, 60, 25);
        txt.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;

        this.hud.createTextElementAlign("whistleInfo", "#FFFFFF", "Whistle to continue.", "center", "bottom");

        this.whistleHandler = new WhistleHandler();
        this.whistleHandler.enableWhistleHandler((whistlePattern) => {
            if (whistlePattern.length) {
                setNewScene(menu);
            }
        });

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

        if (this.whistleHandler)
            this.whistleHandler.disableWhistleHandler();
    }
}
