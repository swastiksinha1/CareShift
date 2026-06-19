import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeScene from '../components/landing/ThreeScene';
import { LogoIcon, SunIcon } from '../components/Icons';
import { useTheme } from '../context/ThemeContext';
import '../styles/landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
    const { toggleTheme } = useTheme();
    const navigate = useNavigate();
    const threeRef = useRef(null);
    const tlRef = useRef(null);

    useEffect(() => {
        // Wait a tick for ThreeScene to mount
        const timer = setTimeout(() => {
            const sceneData = threeRef.current?.getSceneObjects();
            if (!sceneData || !sceneData.capsuleGroup) return;

            const { capsuleGroup, topPart, bottomPart } = sceneData;

            // --- GSAP Scroll Animations ---
            const tl = gsap.timeline({
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

            tlRef.current = tl;

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
        }, 100);

        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(t => t.kill());
            if (tlRef.current) tlRef.current.kill();
        };
    }, []);

    const startJourney = (e) => {
        if (e) e.preventDefault();

        const sceneData = threeRef.current?.getSceneObjects();
        if (!sceneData) {
            navigate('/journey');
            return;
        }

        const { capsuleGroup, topPart, bottomPart } = sceneData;
        sceneData.setJourneyStarting(true);

        // Kill all scroll triggers and stop scroll
        document.body.style.overflow = 'hidden';
        ScrollTrigger.getAll().forEach(t => t.kill());
        if (tlRef.current) tlRef.current.kill();

        const overlay = document.getElementById('whiteout');
        const transitionTl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = '';
                navigate('/journey');
            }
        });

        // 1. Fade out HTML text instantly
        transitionTl.to('main', { opacity: 0, duration: 0.3, ease: "power2.out" }, 0);

        // 2. Close pill halves if broken
        transitionTl.to(topPart.position, { y: 0, duration: 0.3, ease: "power2.out" }, 0);
        transitionTl.to(bottomPart.position, { y: 0, duration: 0.3, ease: "power2.out" }, 0);

        // 3. Snap pill to dead center quickly with a couple of spins
        transitionTl.to(capsuleGroup.position, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power3.out" }, 0);
        transitionTl.to(capsuleGroup.rotation, { x: "+=6.28", y: "+=6.28", duration: 0.7, ease: "power2.inOut" }, 0);

        // 4. Pure CSS overlay flash
        transitionTl.call(() => {
            if (overlay) overlay.style.opacity = '1';
        }, [], 0.6);

        // 5. Wait for the CSS transition to finish before navigating
        transitionTl.to({}, { duration: 0.55 }, 0.6);
    };

    return (
        <>
            <div id="whiteout"></div>
            <ThreeScene ref={threeRef} />

            <nav>
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LogoIcon size={28} />
                    CareShift
                </div>
                <div className="nav-links">
                    <a href="#about" className="nav-link">About</a>
                    <a href="#solution" className="nav-link">Solution</a>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
                        <SunIcon />
                    </button>
                    <a href="#" onClick={startJourney} className="btn-nav">Begin Journey</a>
                </div>
            </nav>

            <main>
                <section id="hero" className="panel">
                    <div className="content">
                        <h1 className="stagger-text hero-title">Health is a choice.<br />Make it today.</h1>
                        <p className="stagger-text hero-subtitle">Breaking down the emotional and psychological barriers to healthcare. No jargon, no stigma—just simple steps to a better you.</p>
                        <div className="cta-group stagger-text">
                            <a href="#about" className="btn-primary">Learn More<span className="arrow">&rarr;</span></a>
                        </div>
                    </div>
                </section>

                <section id="about" className="panel right-align">
                    <div className="content">
                        <h2 className="slide-up">The Fear of Diagnosis</h2>
                        <p className="slide-up">We often avoid tests because we're afraid of the answers. But knowing early is your biggest advantage. Let's shift the perspective.</p>
                    </div>
                </section>

                <section id="stigma" className="panel">
                    <div className="content">
                        <h2 className="slide-up">Breaking the Stigma</h2>
                        <p className="slide-up">It's time to stop letting society dictate your health. Your well-being comes before anyone else's opinions or assumptions.</p>
                    </div>
                </section>

                <section id="solution" className="panel right-align">
                    <div className="content">
                        <h2 className="slide-up">The CareShift Solution</h2>
                        <p className="slide-up">A guided path to overcoming your hesitation. We build trust, provide comfort, and help you take actionable steps without feeling overwhelmed.</p>
                    </div>
                </section>

                <section id="contact" className="panel centered">
                    <div className="content box transition-box">
                        <h2 className="slide-up">Ready to take control?</h2>
                        <p className="slide-up">Step into our immersive diagnostic journey. It's fully anonymous and built just for you.</p>
                        <button className="btn-primary slide-up mt-2" onClick={startJourney}>Begin the Journey</button>
                    </div>
                </section>
            </main>

            <footer className="landing-footer" style={{
                position: 'relative',
                zIndex: 10,
                padding: '4rem 5%',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--glass-bg, rgba(255,255,255,0.5))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: '1.6'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '0.5rem', fontWeight: 800 }}>DesignVerse 2026 · Real Ideas. Real Impact.</h3>
                    <p style={{ fontWeight: 600, color: 'var(--accent-color)', marginBottom: '2rem', fontSize: '1rem' }}>Be the reason someone chooses their health today, not tomorrow.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ textAlign: 'center', background: 'var(--card-bg)', padding: '1.5rem 3rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <strong style={{ color: 'var(--text-color)', display: 'block', marginBottom: '0.8rem', fontSize: '1.1rem' }}>Team Tech Tinkerers</strong>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <li>Rishi Raj — 24BCE10149</li>
                                <li>Swastik Sinha — 24BEY10075</li>
                                <li>Abhilash Singh — 24BCE10706</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', fontSize: '0.85rem', border: '1px dashed var(--border-color)', opacity: 0.9 }}>
                        <strong style={{ color: 'var(--text-color)' }}>Care Shift</strong> identifies emotional and psychological barriers to healthcare-seeking and nudges people toward small, low-pressure actions. It does not diagnose and is not a substitute for professional medical or mental health care. Built in 48 hours for VIT Bhopal DesignVerse 2026.
                    </div>
                </div>
            </footer>
        </>
    );
}
