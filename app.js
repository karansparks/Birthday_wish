import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
    10,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 20;


// ================= SCENE =================
const scene = new THREE.Scene();
let bee, garden, butterfly,cloud;
let mixer, mixers, mixers1,mixers2;

// ================= LOADERS =================
const loader = new GLTFLoader();

// ---- Dog ----
loader.load('/playful_dog.glb',
    function (gltf) {
        bee = gltf.scene;
        bee.position.set(0.07, -1.7, 0);
        scene.add(bee);

        mixer = new THREE.AnimationMixer(bee);
        mixer.clipAction(gltf.animations[2]).play();
        modelMove();
    }
);

// ---- Garden ----
loader.load('/garden_3d_fbx.glb', function (gltf) {
    garden = gltf.scene;
    garden.scale.set(0.09, 0.09, 0.09);
    garden.position.set(0.5, -1.8, 0);

    garden.traverse((child) => {
        if (child.isMesh) {
            child.material.metalness = 0.3;
            child.material.roughness = 0.4;
        }
    });

    scene.add(garden);

    mixers = new THREE.AnimationMixer(garden);
    mixers.clipAction(gltf.animations[0]).play();
    modelMove();
});

// ---- Butterfly ----
loader.load('/animated_butterfly.glb', function (gltf) {
    butterfly = gltf.scene;
    butterfly.scale.set(0.09, 0.09, 0.09);
    butterfly.position.set(0.5, -1.2, 0);
    scene.add(butterfly);

    mixers1 = new THREE.AnimationMixer(butterfly);
    mixers1.clipAction(gltf.animations[0]).play();
    modelMove();
});

// ---- Garden ----
loader.load('/gift.glb', function (gltf) {
    garden = gltf.scene;
    garden.position.set(0.4, -1.7, 0);

    garden.traverse((child) => {
        if (child.isMesh) {
            child.material.metalness = 0.3;
            child.material.roughness = 0.4;
        }
    });

    scene.add(garden);


});

// loader.load('/riverwood_tree.glb', function (gltf) {
//     garden = gltf.scene;
//     garden.scale.set(0.4,0.4, 1);

//     garden.position.set(-1, -1.7, 0);

//     garden.traverse((child) => {
//         if (child.isMesh) {
//             child.material.metalness = 0.3;
//             child.material.roughness = 0.4;
//         }
//     });

//     scene.add(garden);
//        mixers2 = new THREE.AnimationMixer(garden);
//     mixers2.clipAction(gltf.animations[0]).play();
//     modelMove();


// });




// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// ================= LIGHTS =================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(100, 100, 100);
topLight.castShadow = true;
scene.add(topLight);

// ================= ANIMATION LOOP =================
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (mixer) mixer.update(0.02);
    if (mixers) mixers.update(0.02);
    if (mixers1) mixers1.update(0.02);
    if (mixers2) mixers2.update(0.02);

};
reRender3D();

// ================= CAMERA FOCUS HELPER =================
function focusOnModel(model, offset = { x: 0, y: 2, z: 10 }, duration = 2) {
    if (!model) return;

    // Get model center
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    gsap.to(camera.position, {
        x: center.x + offset.x,
        y: center.y + offset.y,
        z: center.z + offset.z,
        duration: duration,
        ease: "power1.out",
        onUpdate: () => {
            camera.lookAt(center);
        }
    });
}

// ================= SECTIONS CONFIG =================
let arrPositionModel = [
    {
        id: 'banner',
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: 0, y: 1.5, z: 0 },
        focus: "bee" // focus on dog
    },
    {
        id: "intro",
        position: { x: 1, y: -1, z: -5 },
        rotation: { x: 0.5, y: -0.5, z: 0 },
        focus: "garden" // focus on garden
    },
    {
        id: "description",
        position: { x: -1, y: -1, z: -5 },
        rotation: { x: 0, y: 0.5, z: 0 },
        focus: "butterfly" // focus on butterfly
    },
    {
        id: "contact",
        position: { x: 0.8, y: -1, z: 0 },
        rotation: { x: 0.3, y: -0.5, z: 0 },
        focus: "bee" // back to dog
    },
];

// ================= MODEL MOVE ON SCROLL =================
const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSection;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });

    let position_active = arrPositionModel.findIndex(
        (val) => val.id == currentSection
    );

    if (position_active >= 0) {
        let new_coordinates = arrPositionModel[position_active];

        // Move the dog (bee) according to scroll
        if (bee) {
            gsap.to(bee.position, {
                x: new_coordinates.position.x,
                y: new_coordinates.position.y,
                z: new_coordinates.position.z,
                duration: 3,
                ease: "power1.out"
            });
            gsap.to(bee.rotation, {
                x: new_coordinates.rotation.x,
                y: new_coordinates.rotation.y,
                z: new_coordinates.rotation.z,
                duration: 3,
                ease: "power1.out"
            });
        }

        // Focus camera on correct model
        if (new_coordinates.focus === "bee") focusOnModel(bee);
        if (new_coordinates.focus === "garden") focusOnModel(garden, { x: 0, y: 3, z: 15 });
        if (new_coordinates.focus === "butterfly") focusOnModel(butterfly, { x: -1, y: 2, z: -10 });
    }
};

// ================= EVENTS =================
window.addEventListener('scroll', () => {
    modelMove();
});

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
