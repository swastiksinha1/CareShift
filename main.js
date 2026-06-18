// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- Three.js Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const isInitiallyDark = document.documentElement.classList.contains('dark-mode');
scene.fog = new THREE.Fog(isInitiallyDark ? 0x050505 : 0xf8fafc, 5, 15);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Listen for theme toggle
window.addEventListener('themeChanged', (e) => {
    const color = e.detail.isDark ? 0x050505 : 0xf8fafc;
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

const parentGroup = new THREE.Group();
scene.add(parentGroup);
parentGroup.add(capsuleGroup);

capsuleGroup.position.set(2, 0, 0);
capsuleGroup.rotation.z = Math.PI / 4;
capsuleGroup.rotation.x = Math.PI / 6;

// Floating animation
let clock = new THREE.Clock();
let isJourneyStarting = false;

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
});

function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    
    if (!isJourneyStarting) {
        // Continuous float & spin
        capsuleGroup.position.y = Math.sin(t * 2) * 0.1;
        capsuleGroup.rotation.y += 0.005;
        
        // Mouse Parallax applied to parent to avoid fighting ScrollTrigger
        targetX = mouseX;
        targetY = mouseY;
        parentGroup.rotation.y += (targetX - parentGroup.rotation.y) * 0.05;
        parentGroup.rotation.x += (targetY - parentGroup.rotation.x) * 0.05;
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
    gsap.fromTo(elem, 
        { y: 60, opacity: 0, clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' }, 
        { y: 0, opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1.2, ease: "power4.out", delay: i * 0.15 }
    );
});

gsap.utils.toArray('.slide-up').forEach((elem) => {
    gsap.fromTo(elem, 
        { y: 80, opacity: 0, scale: 0.95 },
        {
            scrollTrigger: { trigger: elem, start: "top 85%", toggleActions: "play none none reverse" },
            y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out"
        }
    );
});

// --- Journey Transition ---
window.startJourney = function(e) {
    if(e) e.preventDefault();
    isJourneyStarting = true;
    
    // Stop scroll interactions and kill scroll trigger to prevent fighting
    document.body.style.overflow = 'hidden';
    if (tl) tl.kill();
    
    const transitionTl = gsap.timeline({
        onComplete: () => {
            window.location.href = 'journey.html';
        }
    });

    // Fade out HTML content immediately
    transitionTl.to('main', { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 0);

    // Animate pill popping into center
    transitionTl.to(capsuleGroup.position, {
        x: 0,
        y: 0,
        z: 6, // Pop towards camera
        duration: 1.2,
        ease: "back.out(1.2)"
    }, 0);
    
    // Spin rapidly
    transitionTl.to(capsuleGroup.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 4,
        z: 0,
        duration: 1.2,
        ease: "power3.inOut"
    }, 0);

    // Fade into the void
    transitionTl.to(scene.fog, {
        near: 0.1,
        far: 2,
        duration: 0.8,
        ease: "power2.in"
    }, 0.6);
};
