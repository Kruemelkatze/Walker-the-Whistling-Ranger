class Hud {
    constructor(scene, name="UI") {
        this.scene = scene;
        this.name = name;

        this.fps = 30;
        this.fadeTime = 3 * this.fps;

        this.hud = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(name);
        this.font = 'Londrina Solid';

    }

    createTextElementPos(key, color="#FFFFFF", msg="", left=0, top=0, size = 50) {
        let textElement = new BABYLON.GUI.TextBlock(key);
        textElement.text = msg;
        textElement.fontSize = size;
        textElement.color = color;
        textElement.fontFamily = this.font;
        textElement.shadowBlur = 3;
        textElement.shadowColor = "#000";
        textElement.textVerticalAlignment = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;
        textElement.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        // textElement.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        // textElement.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textElement.left = left;
        textElement.top = top;
        // textElement.transformCenterX = 1;
        // textElement.transformCenterY = 1;
        // if (padLeft) textElement.paddingLeft = `0px`;
        // if (padTop) textElement.paddingTop = `0px`;
        // if (padRight) textElement.paddingRight = `${padRight}px`;
        // if (padBottom) textElement.paddingBottom = `${padBottom}px`;
        this.hud.addControl(textElement);
        return textElement;
    }

    // alignX = left|right|center
    // alignY = top|bottom|center
    createTextElementAlign(key, color="#FFFFFF", msg="", alignX="left", alignY="top") {
        let textElement = new BABYLON.GUI.TextBlock(key);
        textElement.text = msg;
        textElement.fontSize = 64;
        textElement.color = color;
        textElement.fontFamily = this.font;
        textElement.shadowBlur = 3;
        textElement.shadowColor = "#000";

        let xAlign = null;
        let yAlign = null;

        switch(alignX) {
            case "left":
                xAlign = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
                break;
            case "right":
                xAlign = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
                break;
            case "center":
                xAlign = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
                break;
        }
        switch(alignY) {
            case "top":
                yAlign = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;
                break;
            case "bottom":
                yAlign = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
                break;
            case "center":
                yAlign = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_CENTER;
                break;
        }

        textElement.textHorizontalAlignment = xAlign;
        textElement.textVerticalAlignment = yAlign;
        // textElement.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        // textElement.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

        textElement.paddingLeft = `5px`;
        textElement.paddingTop = `5px`;
        textElement.paddingRight = `5px`;
        textElement.paddingBottom = `5px`;

        this.hud.addControl(textElement);
    }

    createImage(key, file, x, y, w, h) {
        var image = new BABYLON.GUI.Image(key, file);
        image.left = x;
        image.top = y;
        image.width = `${w}px`;
        image.height = `${h}px`;
        image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAlALIGNMENT_LEFT;
        image.verticalAlignment = BABYLON.GUI.Control.VERTICAlALIGNMENT_TOP;
        this.hud.addControl(image);
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
        // console.log(`Update text ${key}: '${text}'`)
        this.getTextControl(key).text = text;
        this.getTextControl(key).animations = [];
        this.getTextControl(key).alpha = 1;
        if (fadeOut) {
            this.fadeOutText(key, this.fadeTime);
        }
    }

    updateColor(key, color) {
        this.getTextControl(key).color = color;
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