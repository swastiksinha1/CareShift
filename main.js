// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- Three.js Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf8fafc, 5, 15);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

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

// Glowing Core (Inner Heart)
const coreGeo = new THREE.SphereGeometry(radius * 0.6, 32, 32);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xff4757, transparent: true, opacity: 0 }); // Hidden initially
const coreMesh = new THREE.Mesh(coreGeo, coreMat);
capsuleGroup.add(coreMesh);

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
function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    capsuleGroup.position.y += Math.sin(t * 2) * 0.005;
    capsuleGroup.rotation.y += 0.005;
    
    // Pulse core
    const scale = 1 + Math.sin(t * 5) * 0.05;
    coreMesh.scale.set(scale, scale, scale);
    
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

tl.to(capsuleGroup.position, { x: window.innerWidth < 768 ? 0 : -2, y: window.innerWidth < 768 ? 2 : 0, ease: "power1.inOut" }, 0);
tl.to(capsuleGroup.rotation, { x: Math.PI * 2, z: -Math.PI / 4, ease: "power1.inOut" }, 0);

// Break capsule apart
tl.to(topPart.position, { y: 2, ease: "power1.inOut" }, 0.3);
tl.to(bottomPart.position, { y: -2, ease: "power1.inOut" }, 0.3);

// Reveal Core
tl.to(coreMat, { opacity: 1, ease: "power1.inOut" }, 0.3);

// Bring back together and move to center
tl.to(capsuleGroup.position, { x: 0, y: 0, z: -2, ease: "power1.inOut" }, 0.6);
tl.to(topPart.position, { y: 0, ease: "power1.inOut" }, 0.6);
tl.to(bottomPart.position, { y: 0, ease: "power1.inOut" }, 0.6);
tl.to(coreMat, { opacity: 0, ease: "power1.inOut" }, 0.6);
tl.to(capsuleGroup.rotation, { x: Math.PI / 2, y: Math.PI * 2, z: 0, ease: "power1.inOut" }, 0.6);

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

// --- Interactive Logic ---
// Barrier Cards
window.toggleBarrier = function(card) {
    card.classList.toggle('flipped');
};

// CareBot
const chatBody = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');

window.handleKeyPress = function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
};

window.sendReply = function(text) {
    chatInput.value = text;
    sendMessage();
};

window.sendMessage = function() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-message';
    userMsg.innerHTML = `
        <div class="avatar">You</div>
        <div class="msg-content"><p>${text}</p></div>
    `;
    chatBody.appendChild(userMsg);
    chatInput.value = '';
    
    // Remove quick replies from DOM
    const quickReplies = document.querySelector('.quick-replies');
    if(quickReplies) quickReplies.remove();

    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate bot response
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        
        let responseText = "I understand. Taking the first step can feel overwhelming. You're in a safe space here. Would you like to try our anonymous symptom checker or just keep talking?";
        
        botMsg.innerHTML = `
            <div class="avatar">CB</div>
            <div class="msg-content"><p>${responseText}</p></div>
        `;
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
};
