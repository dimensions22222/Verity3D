import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("product-canvas");
const stage = document.getElementById("modelStage");
const fallback = document.getElementById("modelFallback");
const status = document.getElementById("modelStatus");

if (canvas && stage && fallback && status) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6);
    scene.add(new THREE.HemisphereLight(0xf4f2ec, 0x55534d, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd5d1c6, 1.7);
    fillLight.position.set(4, -2, 3);
    scene.add(fillLight);

    let model;
    let isSpinning = true;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let resizeObserver;

    const resize = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    new GLTFLoader().load(
      "moon%203d/Moon.glb",
      gltf => {
        model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const largestDimension = Math.max(size.x, size.y, size.z);

        model.position.sub(center);
        model.scale.setScalar(2.55 / largestDimension);
        model.rotation.x = -0.12;
        model.traverse(object => {
          if (!object.isMesh) return;
          object.castShadow = false;
          object.receiveShadow = false;
          if (object.material) {
            object.material.roughness = Math.max(object.material.roughness ?? 0.8, 0.72);
          }
        });

        scene.add(model);
        fallback.hidden = true;
        status.textContent = "Drag to explore";
      },
      undefined,
      error => {
        console.error("Unable to load the Moon GLB model.", error);
        fallback.querySelector("p").textContent = "The 3D model could not load. Run this page from a local web server and check the Moon GLB path.";
        status.textContent = "3D model unavailable";
      }
    );

    canvas.addEventListener("pointerdown", event => {
      if (!model) return;
      isDragging = true;
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", event => {
      if (!isDragging || !model) return;
      model.rotation.y += (event.clientX - previousPointerX) * 0.008;
      model.rotation.x += (event.clientY - previousPointerY) * 0.005;
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
    });

    const stopDragging = () => { isDragging = false; };
    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("lostpointercapture", stopDragging);

    window.addEventListener("velox-spin-change", event => {
      isSpinning = event.detail.isSpinning;
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) isSpinning = false;

    const render = () => {
      if (model && isSpinning && !isDragging) model.rotation.y += 0.0025;
      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };
    render();
  } catch (error) {
    console.error("Unable to initialize the 3D product viewer.", error);
    fallback.querySelector("p").textContent = "3D preview is unavailable in this browser.";
    status.textContent = "3D preview unavailable";
  }
}
