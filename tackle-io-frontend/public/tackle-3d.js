// Tackle.IO 3D Builder Logic
// Loaded as ES module

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/SSAOPass.js';
import { OutputPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/OutputPass.js';
import gsap from 'https://cdn.skypack.dev/gsap';

// --- CONFIG ---
const CONFIG = {
    blockWidth: 2,
    blockDepth: 1,
    colors: {
        bg: 0x050505, 
        blockColor: 0xffffff,
        blockEmissive: 0xffffff, 
    },
    MAX_FLOORS: 12,
    MAX_SIZE_LEVEL: 3
};

const state = {
    floors: 6,      
    sizeLevel: 2,   
    gap: 0.6,
    height: 0.8,
    view: 'index', 
    expansion: 0, 
    chaos: 0,
    visualFloors: 6,
    lightIntensity: 6.0,
    conceptIndex: 0
};

// --- SETUP ---
const canvas = document.querySelector('#gl');
if (!canvas) {
    console.error('Canvas not found');
    throw new Error('Canvas element #gl not found');
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.colors.bg);
scene.fog = new THREE.Fog(CONFIG.colors.bg, 10, 50);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(16, 12, 16); 

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 1.9;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// --- LIGHTING ---
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111111, 0.3);
scene.add(hemiLight);
const mainLight = new THREE.DirectionalLight(0xffffff, state.lightIntensity);
mainLight.position.set(10, 20, 10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.bias = -0.0001;
mainLight.shadow.radius = 4;
scene.add(mainLight);
const rimLight = new THREE.SpotLight(0xccddff, 2.0);
rimLight.position.set(-15, 10, -10);
rimLight.lookAt(0, 0, 0);
scene.add(rimLight);

// --- MATERIAL & GEOMETRY ---
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhysicalMaterial({
    color: CONFIG.colors.blockColor,
    emissive: CONFIG.colors.blockEmissive,
    emissiveIntensity: 0.15,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transmission: 0.0,
});

// --- DATA GENERATION ---
function generateMaxTatamiLayout() {
    const blocks = [];
    const maxLevel = CONFIG.MAX_SIZE_LEVEL;
    blocks.push({ x: 0, z: -0.5, rot: 0, ring: 0 });
    blocks.push({ x: 0, z: 0.5, rot: 0, ring: 0 });

    for (let r = 1; r <= maxLevel; r++) {
        if (r % 2 !== 0) {
            const zPos = r + 0.5;
            for (let i = 0; i < r + 1; i++) {
                const x = -r + (i * 2);
                blocks.push({ x: x, z: -zPos, rot: 0, ring: r }); 
                blocks.push({ x: x, z: zPos, rot: 0, ring: r }); 
            }
            const xPos = r + 0.5;
            for (let i = 0; i < r; i++) {
                const z = -(r - 1) + (i * 2);
                blocks.push({ x: -xPos, z: z, rot: Math.PI / 2, ring: r }); 
                blocks.push({ x: xPos, z: z, rot: Math.PI / 2, ring: r }); 
            }
        } else {
            const xPos = r + 0.5;
            for (let i = 0; i < r + 1; i++) {
                const z = -r + (i * 2);
                blocks.push({ x: -xPos, z: z, rot: Math.PI / 2, ring: r }); 
                blocks.push({ x: xPos, z: z, rot: Math.PI / 2, ring: r }); 
            }
            const zPos = r + 0.5;
            for (let i = 0; i < r; i++) {
                const x = -(r - 1) + (i * 2);
                blocks.push({ x: x, z: -zPos, rot: 0, ring: r }); 
                blocks.push({ x: x, z: zPos, rot: 0, ring: r }); 
            }
        }
    }
    return blocks;
}

const maxLayout = generateMaxTatamiLayout();
const totalMaxBlocks = maxLayout.length * CONFIG.MAX_FLOORS;

const chaosData = [];
for (let i = 0; i < totalMaxBlocks; i++) {
    const r = 8 + Math.random() * 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    chaosData.push({
        pos: new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            (Math.random() - 0.5) * 16,
            r * Math.sin(phi) * Math.sin(theta)
        ),
        rot: new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        )
    });
}

const residents = []; 
function createPersonTexture() {
    const size = 128;
    const cvs = document.createElement('canvas');
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext('2d');
    
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(size/2, 28, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(size/2 - 22, 52, 44, 60, 10);
    } else {
        ctx.fillRect(size/2 - 22, 52, 44, 60);
    }
    ctx.fill();

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

const personMaterial = new THREE.SpriteMaterial({ 
    map: createPersonTexture(), 
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    depthTest: true
});

let instancedMesh;
const dummy = new THREE.Object3D();
const currentScales = new Float32Array(totalMaxBlocks).fill(0);

function initSceneObjects() {
    instancedMesh = new THREE.InstancedMesh(geometry, material, totalMaxBlocks);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    for(let f = 0; f < CONFIG.MAX_FLOORS; f++) {
        const occupied = []; 

        maxLayout.forEach((block, bIdx) => {
            if (Math.random() < 0.15) {
                const spread = 1.0; 
                const x = block.x * spread;
                const z = block.z * spread;

                const tooClose = occupied.some(pos => {
                    const dx = pos.x - x;
                    const dz = pos.z - z;
                    return Math.sqrt(dx*dx + dz*dz) < 2.0; 
                });

                if (!tooClose) {
                    const sprite = new THREE.Sprite(personMaterial);
                    sprite.scale.set(0.6, 0.6, 0.6); 
                    sprite.visible = false; 
                    scene.add(sprite);
                    
                    residents.push({
                        floorIndex: f,
                        blockIndex: bIdx,
                        sprite: sprite,
                        baseBlock: block
                    });
                    occupied.push({x, z});
                }
            }
        });
    }
}

function updateInstances() {
    if (!instancedMesh) return;

    const gap = state.gap;
    const h = state.height;
    const expansionY = state.expansion * 1.1; 
    const chaos = state.chaos;
    
    state.visualFloors = THREE.MathUtils.lerp(state.visualFloors, state.floors, 0.08);

    const blockW = Math.max(0.1, CONFIG.blockWidth - (gap * 0.5)); 
    const blockD = Math.max(0.1, CONFIG.blockDepth - (gap * 0.5));
    const blockH = Math.max(0.1, h);
    const spread = 1.0 + (gap * 0.2); 

    let instanceIdx = 0;

    residents.forEach(r => { r.sprite.visible = false; });

    for (let f = 0; f < CONFIG.MAX_FLOORS; f++) {
        const floorHeightWithGap = blockH + gap;
        const stackHeight = state.visualFloors * floorHeightWithGap;
        const baseY = (f * floorHeightWithGap) - (stackHeight / 2);
        
        const expansionOffset = (f - (state.visualFloors-1)/2) * expansionY;
        const y = baseY + expansionOffset;

        for (let b = 0; b < maxLayout.length; b++) {
            const block = maxLayout[b];
            const isWithinFloors = f < state.floors;
            const isWithinSize = block.ring <= state.sizeLevel;
            const targetScale = (isWithinFloors && isWithinSize) ? 1.0 : 0.0;

            currentScales[instanceIdx] = THREE.MathUtils.lerp(currentScales[instanceIdx], targetScale, 0.1);
            const s = currentScales[instanceIdx];

            const posX = block.x * spread;
            const posZ = block.z * spread;

            let tx = posX;
            let ty = y;
            let tz = posZ;
            let rx = 0;
            let ry = block.rot;
            let rz = 0;

            if (chaos > 0.001) {
                const cData = chaosData[instanceIdx];
                tx = THREE.MathUtils.lerp(posX, cData.pos.x, chaos);
                ty = THREE.MathUtils.lerp(y, cData.pos.y, chaos);
                tz = THREE.MathUtils.lerp(posZ, cData.pos.z, chaos);
                rx = THREE.MathUtils.lerp(0, cData.rot.x, chaos);
                ry = THREE.MathUtils.lerp(block.rot, cData.rot.y, chaos);
                rz = THREE.MathUtils.lerp(0, cData.rot.z, chaos);
            }

            dummy.position.set(tx, ty, tz);
            dummy.rotation.set(rx, ry, rz);

            if (s < 0.01) {
                 dummy.scale.set(0, 0, 0);
            } else {
                dummy.scale.set(blockW * s, blockH * s, blockD * s);
            }
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(instanceIdx, dummy.matrix);

            if (s > 0.8 && chaos < 0.1) { 
                const res = residents.find(r => r.floorIndex === f && r.blockIndex === b);
                if (res) {
                    res.sprite.visible = true;
                    res.sprite.position.set(
                        tx, 
                        ty + (blockH * 0.5) + 0.3, 
                        tz
                    );
                    res.sprite.material.opacity = (state.view === 'concept') ? (1.0 - chaos) : 0; 
                }
            }

            instanceIdx++;
        }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
}

// --- POST PROCESSING ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const width = window.innerWidth;
const height = window.innerHeight;
const ssaoPass = new SSAOPass(scene, camera, width, height);
ssaoPass.kernelRadius = 8;
ssaoPass.minDistance = 0.001;
ssaoPass.maxDistance = 0.08;
composer.addPass(ssaoPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.85;
bloomPass.strength = 0.3;
bloomPass.radius = 0.8;
composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);
    updateInstances();
    
    if (state.view === 'index') {
        controls.autoRotate = true;
        controls.update();
    } else if (state.view === 'concept') {
        camera.lookAt(0, camera.position.y * 0.1, 0); 
    } else if (state.view === 'contact') {
        controls.autoRotate = false;
        controls.update();
    }

    composer.render();
}

// --- UI LOGIC ---
const sliderFloors = document.getElementById('input-floors');
const sliderSize = document.getElementById('input-size');
const sliderGap = document.getElementById('input-gap');
const sliderHeight = document.getElementById('input-height');

const valFloors = document.getElementById('val-floors');
const valSize = document.getElementById('val-size');
const valGap = document.getElementById('val-gap');
const valHeight = document.getElementById('val-height');

const btnHome = document.getElementById('nav-home');
const btnConcept = document.getElementById('nav-concept');
const btnContact = document.getElementById('nav-contact');

const builderUI = document.getElementById('builder-ui');
const conceptUI = document.getElementById('concept-container');
const contactUI = document.getElementById('contact-container');
const conceptOverlay = document.getElementById('concept-overlay');

const sections = [
    document.getElementById('c-sect-0'),
    document.getElementById('c-sect-1'),
    document.getElementById('c-sect-2')
];

const btnLightStudio = document.getElementById('light-studio');
const btnLightWarm = document.getElementById('light-warm');
const btnLightNeon = document.getElementById('light-neon');
const lightingButtons = [btnLightStudio, btnLightWarm, btnLightNeon];

function setLighting(type) {
    lightingButtons.forEach(b => {
        if (b) {
            b.classList.remove('bg-white/10', 'text-white');
            b.classList.add('text-white/50');
        }
    });
    const active = type === 'warm' ? btnLightWarm : type === 'neon' ? btnLightNeon : btnLightStudio;
    if (active) {
        active.classList.remove('text-white/50');
        active.classList.add('bg-white/10', 'text-white');
    }
    
    if (type === 'studio') {
        gsap.to(mainLight.color, { r: 1, g: 1, b: 1, duration: 1 });
        gsap.to(mainLight, { intensity: 6.0, duration: 1 });
        gsap.to(hemiLight.color, { r: 1, g: 1, b: 1, duration: 1 });
        gsap.to(rimLight.color, { r: 0.8, g: 0.87, b: 1, duration: 1 });
    } else if (type === 'warm') {
        gsap.to(mainLight.color, { r: 1, g: 0.9, b: 0.8, duration: 1 });
        gsap.to(mainLight, { intensity: 4.0, duration: 1 });
        gsap.to(hemiLight.color, { r: 1, g: 0.8, b: 0.6, duration: 1 });
        gsap.to(rimLight.color, { r: 1, g: 0.6, b: 0.2, duration: 1 });
    } else if (type === 'neon') {
        gsap.to(mainLight.color, { r: 0.8, g: 0.5, b: 1, duration: 1 });
        gsap.to(mainLight, { intensity: 5.0, duration: 1 });
        gsap.to(hemiLight.color, { r: 0.2, g: 0.2, b: 0.8, duration: 1 });
        gsap.to(rimLight.color, { r: 0.0, g: 1, b: 1, duration: 1 });
    }
}

let isScrolling = false;
function updateConceptSection(index) {
    sections.forEach((sec, i) => {
        if (sec) {
            if(i === index) {
                sec.classList.remove('opacity-0', 'translate-y-8');
                sec.classList.add('opacity-100', 'translate-y-0');
                sec.style.pointerEvents = 'auto';
            } else {
                sec.classList.add('opacity-0', 'translate-y-8');
                sec.classList.remove('opacity-100', 'translate-y-0');
                sec.style.pointerEvents = 'none';
            }
        }
    });

    const targetY = 5 - (index * 5); 
    
    gsap.to(camera.position, {
        x: 10, 
        y: targetY,
        z: 10, 
        duration: 1.2,
        ease: "power2.inOut"
    });
    gsap.to(controls.target, {
        x: 0, y: targetY * 0.2, z: 0,
        duration: 1.2, ease: "power2.inOut"
    });
}

function handleConceptScroll(e) {
    if (state.view !== 'concept' || isScrolling) return;
    if (Math.abs(e.deltaY) < 30) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.min(Math.max(state.conceptIndex + direction, 0), 2);
    if (nextIndex !== state.conceptIndex) {
        isScrolling = true;
        state.conceptIndex = nextIndex;
        updateConceptSection(state.conceptIndex);
        setTimeout(() => { isScrolling = false; }, 1000);
    }
}
window.addEventListener('wheel', handleConceptScroll);

const setHomeState = () => {
    state.view = 'index';
    controls.enabled = true;
    controls.autoRotate = true;

    gsap.to(camera.position, { duration: 1.5, x: 16, y: 12, z: 16, ease: "power3.inOut" });
    gsap.to(controls.target, { duration: 1.5, x: 0, y: 0, z: 0, ease: "power3.inOut" });
    gsap.to(state, { duration: 1.2, expansion: 0, chaos: 0, ease: "power2.inOut" });
    
    if (btnHome) btnHome.classList.replace('text-white/50', 'text-white');
    if (btnConcept) btnConcept.classList.replace('text-white', 'text-white/50');
    if (btnContact) btnContact.classList.replace('text-white', 'text-white/50');
    
    if (builderUI) builderUI.classList.remove('opacity-0', 'pointer-events-none');
    if (conceptUI) conceptUI.classList.add('hidden');
    if (contactUI) {
        contactUI.classList.add('hidden');
        contactUI.classList.add('opacity-0', 'translate-y-4');
    }
    
    if (conceptOverlay) {
        conceptOverlay.classList.remove('opacity-100');
        conceptOverlay.classList.add('opacity-0');
    }
};

const setConceptState = () => {
    state.view = 'concept';
    state.conceptIndex = 0; 
    controls.enabled = false;
    
    gsap.to(state, { duration: 1.5, expansion: 1.2, chaos: 0, ease: "power2.out" });
    updateConceptSection(0);

    if (btnHome) btnHome.classList.replace('text-white', 'text-white/50');
    if (btnConcept) btnConcept.classList.replace('text-white/50', 'text-white');
    if (btnContact) btnContact.classList.replace('text-white', 'text-white/50');
    
    if (builderUI) builderUI.classList.add('opacity-0', 'pointer-events-none');
    if (conceptUI) conceptUI.classList.remove('hidden');
    if (contactUI) {
        contactUI.classList.add('hidden');
        contactUI.classList.add('opacity-0', 'translate-y-4');
    }

    if (conceptOverlay) {
        conceptOverlay.classList.remove('opacity-0');
        conceptOverlay.classList.add('opacity-100');
    }
};

const setContactState = () => {
     state.view = 'contact';
     controls.enabled = true;
     gsap.to(camera.position, { duration: 2.0, x: -18, y: 8, z: -10, ease: "power3.inOut" });
     gsap.to(controls.target, { duration: 2.0, x: 0, y: 0, z: 0, ease: "power3.inOut" });
     gsap.to(state, { duration: 2.0, chaos: 1.0, expansion: 0.5, ease: "power3.out" });
     
    if (btnHome) btnHome.classList.replace('text-white', 'text-white/50');
    if (btnConcept) btnConcept.classList.replace('text-white', 'text-white/50');
    if (btnContact) btnContact.classList.replace('text-white/50', 'text-white');
    
    if (builderUI) builderUI.classList.add('opacity-0', 'pointer-events-none');
    if (conceptUI) conceptUI.classList.add('hidden');
    if (contactUI) {
        contactUI.classList.remove('hidden');
        setTimeout(() => {
            contactUI.classList.remove('opacity-0', 'translate-y-4');
        }, 100);
    }

    if (conceptOverlay) {
        conceptOverlay.classList.remove('opacity-100');
        conceptOverlay.classList.add('opacity-0');
    }
};

if (sliderFloors) {
    sliderFloors.addEventListener('input', (e) => {
        state.floors = parseInt(e.target.value);
        if (valFloors) valFloors.innerText = state.floors;
        updateXYThumb();
    });
}
if (sliderSize) {
    sliderSize.addEventListener('input', (e) => {
        state.sizeLevel = parseInt(e.target.value);
        if (valSize) valSize.innerText = "L" + (state.sizeLevel + 1);
        updateXYThumb();
    });
}
if (sliderGap) {
    sliderGap.addEventListener('input', (e) => { 
        state.gap = parseFloat(e.target.value); 
        if (valGap) valGap.innerText = state.gap.toFixed(1); 
    });
}
if (sliderHeight) {
    sliderHeight.addEventListener('input', (e) => { 
        state.height = parseFloat(e.target.value); 
        if (valHeight) valHeight.innerText = state.height.toFixed(1); 
    });
}

const xyPad = document.getElementById('xy-pad');
const xyThumb = document.getElementById('xy-thumb');
let isDraggingPad = false;
function updateFromXY(clientX, clientY) {
    if (!xyPad) return;
    const rect = xyPad.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    x = Math.max(0, Math.min(1, x)); 
    y = Math.max(0, Math.min(1, y));
    const newSize = Math.round(x * 3);
    if (newSize !== state.sizeLevel) { 
        state.sizeLevel = newSize; 
        if (sliderSize) sliderSize.value = newSize; 
        if (valSize) valSize.innerText = "L" + (newSize + 1); 
    }
    const newFloors = Math.max(1, Math.round((1 - y) * 11 + 1));
    if (newFloors !== state.floors) { 
        state.floors = newFloors; 
        if (sliderFloors) sliderFloors.value = newFloors; 
        if (valFloors) valFloors.innerText = newFloors; 
    }
    updateXYThumb();
}
function updateXYThumb() {
    if (!xyThumb) return;
    const xPct = (state.sizeLevel / 3) * 100;
    const yPct = (1 - ((state.floors - 1) / 11)) * 100;
    xyThumb.style.left = `${xPct}%`; 
    xyThumb.style.top = `${yPct}%`;
}
if (xyPad) {
    xyPad.addEventListener('pointerdown', (e) => { 
        isDraggingPad = true; 
        xyPad.setPointerCapture(e.pointerId); 
        updateFromXY(e.clientX, e.clientY); 
    });
    xyPad.addEventListener('pointermove', (e) => { 
        if (isDraggingPad) updateFromXY(e.clientX, e.clientY); 
    });
    xyPad.addEventListener('pointerup', (e) => { 
        isDraggingPad = false; 
        xyPad.releasePointerCapture(e.pointerId); 
    });
}

if (btnLightStudio) btnLightStudio.addEventListener('click', () => setLighting('studio'));
if (btnLightWarm) btnLightWarm.addEventListener('click', () => setLighting('warm'));
if (btnLightNeon) btnLightNeon.addEventListener('click', () => setLighting('neon'));
if (btnHome) btnHome.addEventListener('click', setHomeState);
if (btnConcept) btnConcept.addEventListener('click', setConceptState);
if (btnContact) btnContact.addEventListener('click', setContactState);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    ssaoPass.setSize(window.innerWidth, window.innerHeight);
});

initSceneObjects();
animate();
setHomeState(); 
if (window.lucide) window.lucide.createIcons();
updateXYThumb();

