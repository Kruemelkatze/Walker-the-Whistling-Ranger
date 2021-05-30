class Hud {
    constructor(scene, name="UI") {
        this.scene = scene;
        this.name = name;
        this.hud = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(name);
        this.fps = 30;
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
        this.hud.addControl(textElement);
    }

    getTextControl(key) {
        for (let e of this.hud.getDescendants()) {
            if (e.name == key) {
                return e;
            }
        }
        return null;
    }

    updateText(key, text="", fadeOut=false) {
        this.getTextControl(key).text = text;
        this.getTextControl(key).alpha = 1;
        if (fadeOut) {
            let secs = 2 * this.fps;
            this.fadeOutText(key, secs);
        }
    }

    fadeOutText(key, num_frames) {
        var animationHideText = new BABYLON.Animation(key + "_anim", "alpha", this.fps, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        var keys = [];

        keys.push({
            frame: 0,
            value: 1
        });

        keys.push({
            frame: num_frames,
            value: 0
        });

        animationHideText.setKeys(keys);

        let el = this.getTextControl(key);
        el.animations = [];
        el.animations.push(animationHideText);
        // object to animate, first frame, last frame and loop if true
        this.scene.beginAnimation(el, 0, num_frames, false);
    }

    dispose() {
        this.hud.dispose();
    }
}