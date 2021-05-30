var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine


/******* End of the create scene function ******/

let instructions = new Instructions();
let credits = new Credits();
let menu = new Menu();
let game = new Game();
let path = new Path();
let endfail = new TheEndFail();
let endsuccess = new TheEndSuccess();

let currentScene = null;
setNewScene(menu);

function handleKeyPress(event) {
    if (document.querySelector("#userInfo")) document.querySelector("#userInfo").remove();

    handleSceneKeys(event);
    handleActionKeys(event);
}

function handleSceneKeys(event) {
    let newScene = null;

    switch (event.key) {
        case "1":
            newScene = instructions;
            break;
        case "2":
            newScene = menu;
            break;
        case "3":
            newScene = game;
            break;
        case "4":
            newScene = path;
            break;
        case "5":
            newScene = endfail;
            break;
        case "6":
            newScene = endsuccess;
            break;
        case "Escape":
            newScene = menu;
            break;
        default:
            break;
    }

    setNewScene(newScene);
}


function setNewScene(newScene) {
    if(!newScene)
        return;

    console.log(newScene);
    if (newScene != null) {
        if (currentScene) {
            currentScene.dispose();
        }
        currentScene = newScene;
        currentScene.createScene();
        currentScene.onLoad();
    }
}

function handleActionKeys(event) {
    //console.log(event.key)
}


engine.runRenderLoop(function () {
    if (currentScene && currentScene.isReady()) {
        currentScene.render();
    }
});


// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

