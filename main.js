// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- Three.js Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const isInitiallyDark = document.documentElement.classList.contains('dark-mode');
scene.fog = new THREE.Fog(isInitiallyDark ? 0x0f172a : 0xf8fafc, 5, 15);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Listen for theme toggle
window.addEventListener('themeChanged', (e) => {
    const color = e.detail.isDark ? 0x0f172a : 0xf8fafc;
    gsap.to(scene.fog.color, {
        r: new THREE.Color(color).r,
        g: new THREE.Color(color).g,
        b: new THREE.Color(color).b,
        duration: 0.4
    });
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const backLight = new THREE.DirectionalLight(0x0ea5e9, 0.5);
backLight.position.set(-5, -5, -5);
scene.add(backLight);

// Create Medicine Capsule
const capsuleGroup = new THREE.Group();
scene.add(capsuleGroup);

const mat1 = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.2, clearcoat: 1.0 });
const mat2 = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, metalness: 0.1, roughness: 0.2, clearcoat: 1.0 });

const radius = 0.8;
const height = 1.6;

// Top half
const topGeo = new THREE.CylinderGeometry(radius, radius, height/2, 32);
topGeo.translate(0, height/4, 0);
const topMesh = new THREE.Mesh(topGeo, mat2);
const topDomeGeo = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
topDomeGeo.translate(0, height/2, 0);
const topDomeMesh = new THREE.Mesh(topDomeGeo, mat2);
const topPart = new THREE.Group();
topPart.add(topMesh);
topPart.add(topDomeMesh);

// Bottom half
const bottomGeo = new THREE.CylinderGeometry(radius, radius, height/2, 32);
bottomGeo.translate(0, -height/4, 0);
const bottomMesh = new THREE.Mesh(bottomGeo, mat1);
const bottomDomeGeo = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
bottomDomeGeo.translate(0, -height/2, 0);
const bottomDomeMesh = new THREE.Mesh(bottomDomeGeo, mat1);
const bottomPart = new THREE.Group();
bottomPart.add(bottomMesh);
bottomPart.add(bottomDomeMesh);

capsuleGroup.add(topPart);
capsuleGroup.add(bottomPart);

capsuleGroup.position.set(2, 0, 0);
capsuleGroup.rotation.z = Math.PI / 4;
capsuleGroup.rotation.x = Math.PI / 6;

// Floating animation
let clock = new THREE.Clock();
let isJourneyStarting = false;

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    
    if (!isJourneyStarting) {
        capsuleGroup.position.y += Math.sin(t * 2) * 0.005;
        capsuleGroup.rotation.y += 0.005;
    }
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- GSAP Scroll Animations ---
let tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// 1. Move left for "Fear of Diagnosis"
tl.to(capsuleGroup.position, { x: window.innerWidth < 768 ? 0 : -2, y: 0, z: 0, ease: "power1.inOut" }, 0);
tl.to(capsuleGroup.rotation, { x: Math.PI, y: Math.PI / 2, z: 0, ease: "power1.inOut" }, 0);

// 2. Center and break apart for "Breaking the Stigma"
tl.to(capsuleGroup.position, { x: 0, y: 0, z: 2, ease: "power1.inOut" }, 0.33);
tl.to(capsuleGroup.rotation, { x: Math.PI * 1.5, y: Math.PI, z: 0, ease: "power1.inOut" }, 0.33);
tl.to(topPart.position, { y: 0.6, ease: "power1.inOut" }, 0.33);
tl.to(bottomPart.position, { y: -0.6, ease: "power1.inOut" }, 0.33);

// 3. Move left and close for "CareShift Solution"
tl.to(capsuleGroup.position, { x: window.innerWidth < 768 ? 0 : -2, y: 0, z: 0, ease: "power1.inOut" }, 0.66);
tl.to(capsuleGroup.rotation, { x: Math.PI * 2, y: Math.PI * 1.5, z: Math.PI / 4, ease: "power1.inOut" }, 0.66);
tl.to(topPart.position, { y: 0, ease: "power1.inOut" }, 0.66);
tl.to(bottomPart.position, { y: 0, ease: "power1.inOut" }, 0.66);

// HTML Elements
gsap.utils.toArray('.stagger-text').forEach((elem, i) => {
    gsap.from(elem, { y: 50, opacity: 0, duration: 1, ease: "power3.out", delay: i * 0.2 });
});

gsap.utils.toArray('.slide-up').forEach((elem) => {
    gsap.from(elem, {
        scrollTrigger: { trigger: elem, start: "top 80%", toggleActions: "play none none reverse" },
        y: 60, opacity: 0, duration: 1, ease: "power3.out"
    });
});

// --- Journey Transition ---
window.startJourney = function(e) {
    if(e) e.preventDefault();
    isJourneyStarting = true;
    
    // Stop scroll interactions
    document.body.style.overflow = 'hidden';
    
    const transitionTl = gsap.timeline({
        onComplete: () => {
            window.location.href = 'journey.html';
        }
    });

    // Animate pill flying into camera
    transitionTl.to(capsuleGroup.position, {
        z: camera.position.z - 0.5,
        x: 0,
        y: 0,
        duration: 1.5,
        ease: "power2.in"
    }, 0);
    
    transitionTl.to(capsuleGroup.rotation, {
        x: Math.PI * 4,
        y: Math.PI * 4,
        duration: 1.5,
        ease: "power2.in"
    }, 0);

    // Fade screen to white
    transitionTl.to("#whiteout", {
        opacity: 1,
        duration: 0.5,
        ease: "power1.in"
    }, 1.0);
};
