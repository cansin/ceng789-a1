import {
    AmbientLight,
    LoadingManager,
    PerspectiveCamera,
    PointLight,
    Scene,
    TextureLoader,
    WebGLRenderer,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import dragon from "./models/dragon.obj";
import uvGridSm from "./textures/UV_Grid_Sm.jpg";
import "./index.less";

let container;
let camera, scene, renderer;
let mouseX = 0,
    mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let object;

init();

animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);
    camera = new PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        2000,
    );
    camera.position.z = 250;
    // scene
    scene = new Scene();
    const ambientLight = new AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);
    const pointLight = new PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);
    // manager
    function loadModel() {
        object.traverse(function(child) {
            if (child.isMesh) child.material.map = texture;
        });
        object.position.y = -95;
        scene.add(object);
    }
    const manager = new LoadingManager(loadModel);
    manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };
    // texture
    const textureLoader = new TextureLoader(manager);
    const texture = textureLoader.load(uvGridSm);
    // model
    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(
                "model " + Math.round(percentComplete, 2) + "% downloaded",
            );
        }
    }
    function onError() {}
    const loader = new OBJLoader(manager);
    loader.load(
        dragon,
        function(obj) {
            object = obj;
        },
        onProgress,
        onError,
    );
    //
    renderer = new WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    //
    window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
