import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

const ThreeScene = forwardRef(function ThreeScene(props, ref) {
    const containerRef = useRef(null);
    const sceneRef = useRef({});

    useImperativeHandle(ref, () => ({
        getSceneObjects: () => sceneRef.current
    }));

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isMobile = window.innerWidth < 768;

        const scene = new THREE.Scene();
        const isInitiallyDark = document.documentElement.classList.contains('dark-mode');
        scene.fog = new THREE.Fog(isInitiallyDark ? 0x050505 : 0xf8fafc, 5, 18);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = isMobile ? 10 : 8;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // Listen for theme toggle
        const handleThemeChange = (e) => {
            const color = e.detail.isDark ? 0x050505 : 0xf8fafc;
            const targetColor = new THREE.Color(color);
            scene.fog.color.copy(targetColor);
        };
        window.addEventListener('themeChanged', handleThemeChange);

        // --- Enhanced Lighting Rig ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        // Key light (warm white from top-right)
        const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
        keyLight.position.set(4, 6, 5);
        scene.add(keyLight);

        // Fill light (cool blue from left)
        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.5);
        fillLight.position.set(-4, 2, 3);
        scene.add(fillLight);

        // Rim/back light (accent color glow from behind)
        const rimLight = new THREE.DirectionalLight(0x0ea5e9, 0.8);
        rimLight.position.set(-2, -3, -5);
        scene.add(rimLight);

        // Top highlight
        const topLight = new THREE.PointLight(0xffffff, 0.6, 20);
        topLight.position.set(0, 8, 2);
        scene.add(topLight);

        // --- Create Premium Medicine Capsule ---
        const capsuleGroup = new THREE.Group();
        scene.add(capsuleGroup);

        // Higher poly count for smoother look
        const segments = isMobile ? 24 : 48;
        const domeSegments = isMobile ? 16 : 32;

        // Premium materials with better reflections
        const matWhite = new THREE.MeshPhysicalMaterial({
            color: 0xfafafa,
            metalness: 0.05,
            roughness: 0.15,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
            reflectivity: 0.6,
            envMapIntensity: 1.0,
        });

        const matBlue = new THREE.MeshPhysicalMaterial({
            color: 0x0ea5e9,
            metalness: 0.1,
            roughness: 0.12,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            reflectivity: 0.8,
            envMapIntensity: 1.2,
        });

        // Responsive sizing
        const scale = isMobile ? 0.7 : 1.0;
        const radius = 0.85 * scale;
        const height = 1.8 * scale;

        // --- Seam ring at the center join ---
        const seamGeo = new THREE.TorusGeometry(radius + 0.01, 0.025 * scale, 12, segments);
        const seamMat = new THREE.MeshPhysicalMaterial({
            color: 0xcccccc,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 0.5,
        });
        const seamMesh = new THREE.Mesh(seamGeo, seamMat);
        seamMesh.rotation.x = Math.PI / 2;

        // Top half (blue)
        const topGeo = new THREE.CylinderGeometry(radius, radius, height / 2, segments);
        topGeo.translate(0, height / 4, 0);
        const topMesh = new THREE.Mesh(topGeo, matBlue);
        const topDomeGeo = new THREE.SphereGeometry(radius, segments, domeSegments, 0, Math.PI * 2, 0, Math.PI / 2);
        topDomeGeo.translate(0, height / 2, 0);
        const topDomeMesh = new THREE.Mesh(topDomeGeo, matBlue);
        const topPart = new THREE.Group();
        topPart.add(topMesh);
        topPart.add(topDomeMesh);

        // Bottom half (white)
        const bottomGeo = new THREE.CylinderGeometry(radius, radius, height / 2, segments);
        bottomGeo.translate(0, -height / 4, 0);
        const bottomMesh = new THREE.Mesh(bottomGeo, matWhite);
        const bottomDomeGeo = new THREE.SphereGeometry(radius, segments, domeSegments, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        bottomDomeGeo.translate(0, -height / 2, 0);
        const bottomDomeMesh = new THREE.Mesh(bottomDomeGeo, matWhite);
        const bottomPart = new THREE.Group();
        bottomPart.add(bottomMesh);
        bottomPart.add(bottomDomeMesh);

        capsuleGroup.add(topPart);
        capsuleGroup.add(bottomPart);
        capsuleGroup.add(seamMesh);

        const parentGroup = new THREE.Group();
        scene.add(parentGroup);
        parentGroup.add(capsuleGroup);

        // Mobile: center the capsule; Desktop: offset right
        capsuleGroup.position.set(isMobile ? 0 : 2.5, isMobile ? 0.5 : 0, 0);
        capsuleGroup.rotation.z = Math.PI / 4;
        capsuleGroup.rotation.x = Math.PI / 6;

        // Store refs for external access
        sceneRef.current = {
            scene,
            camera,
            renderer,
            capsuleGroup,
            topPart,
            bottomPart,
            parentGroup
        };

        // Floating animation
        const clock = new THREE.Clock();
        let isJourneyStarting = false;
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const onMouseMove = (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
        };
        window.addEventListener('mousemove', onMouseMove);

        // Allow external code to stop floating
        sceneRef.current.setJourneyStarting = (val) => { isJourneyStarting = val; };

        let animId;
        function animate() {
            animId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            if (!isJourneyStarting) {
                // Multi-axis gentle float (more organic motion)
                capsuleGroup.position.y = (isMobile ? 0.5 : 0) + Math.sin(t * 1.5) * 0.12 + Math.sin(t * 0.7) * 0.04;
                capsuleGroup.rotation.y += 0.004;

                // Subtle breathing scale
                const breathe = 1 + Math.sin(t * 1.2) * 0.008;
                capsuleGroup.scale.set(breathe, breathe, breathe);

                targetX = mouseX;
                targetY = mouseY;
                parentGroup.rotation.y += (targetX - parentGroup.rotation.y) * 0.05;
                parentGroup.rotation.x += (targetY - parentGroup.rotation.x) * 0.05;
            }

            renderer.render(scene, camera);
        }
        animate();

        const onResize = () => {
            const nowMobile = window.innerWidth < 768;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.position.z = nowMobile ? 10 : 8;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

            // Reposition capsule on resize
            capsuleGroup.position.x = nowMobile ? 0 : 2.5;
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('themeChanged', handleThemeChange);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div id="canvas-container" ref={containerRef}></div>;
});

export default ThreeScene;
