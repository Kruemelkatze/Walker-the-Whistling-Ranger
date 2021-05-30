class Hud {
    constructor(name="UI") {
        this.name = name;
        this.hud = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(name);
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

    updateText(key, text="") {
        this.getTextControl(key).text = text;
    }

    dispose() {
        this.hud.dispose();
    }
}