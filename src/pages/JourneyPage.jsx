import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { LogoIcon, SunIcon } from '../components/Icons';
import { useTheme } from '../context/ThemeContext';
import BarriersSlide from '../components/journey/slides/BarriersSlide';
import StoriesSlide from '../components/journey/slides/StoriesSlide';
import CareBotSlide from '../components/journey/slides/CareBotSlide';
import RealityCheckSlide from '../components/journey/slides/RealityCheckSlide';
import CostImpactSlide from '../components/journey/slides/CostImpactSlide';
import SpecialistSlide from '../components/journey/slides/SpecialistSlide';
import CommunityWallSlide from '../components/journey/slides/CommunityWallSlide';
import ResourcesSlide from '../components/journey/slides/ResourcesSlide';
import BottomSheet from '../components/journey/BottomSheet';
import '../styles/journey.css';

const totalSlides = 8;

export default function JourneyPage() {
    const { toggleTheme } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(1);
    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const progFillRef = useRef(null);
    const progTextRef = useRef(null);
    const prevSlideRef = useRef(1);
    const isTransitioningRef = useRef(false);

    const goToSlide = useCallback((slideNum) => {
        if (slideNum >= 1 && slideNum <= totalSlides && slideNum !== prevSlideRef.current && !isTransitioningRef.current) {
            isTransitioningRef.current = true;

            const oldSlide = document.getElementById(`slide-${prevSlideRef.current}`);

            // Phase 1: Fade out the old slide
            if (oldSlide) {
                gsap.to(oldSlide, {
                    opacity: 0,
                    y: -20,
                    scale: 0.98,
                    filter: 'blur(4px)',
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        oldSlide.classList.remove('active');
                        // Reset the old slide's inline styles so CSS takes over
                        gsap.set(oldSlide, { clearProps: "all" });

                        // Phase 2: Set the new slide active and animate it in
                        prevSlideRef.current = slideNum;
                        setCurrentSlide(slideNum);
                        isTransitioningRef.current = false;
                    }
                });
            } else {
                prevSlideRef.current = slideNum;
                setCurrentSlide(slideNum);
                isTransitioningRef.current = false;
            }
        }
    }, []);

    // Update progress ring
    useEffect(() => {
        const progFill = progFillRef.current;
        const progText = progTextRef.current;
        if (progFill && progText) {
            gsap.to(progText, {
                y: -5, opacity: 0, duration: 0.2, onComplete: () => {
                    progText.textContent = currentSlide;
                    gsap.fromTo(progText, { y: 5, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" });
                }
            });

            const c = 138.23;
            const ratio = currentSlide / totalSlides;
            const offset = c - (ratio * c);
            gsap.to(progFill, { strokeDashoffset: offset, duration: 0.8, ease: "power3.out" });
        }
    }, [currentSlide]);

    // Animate incoming slide
    useEffect(() => {
        const activeSlide = document.getElementById(`slide-${currentSlide}`);
        if (activeSlide) {
            // Ensure it's visible before animating
            activeSlide.classList.add('active');

            gsap.fromTo(activeSlide,
                { opacity: 0, y: 30, scale: 0.97, filter: 'blur(6px)' },
                { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: "power3.out" }
            );

            const content = activeSlide.querySelector('.slide-content') || activeSlide.querySelector('.chat-container');
            if (content) {
                gsap.fromTo(content,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", delay: 0.1 }
                );
            }
        }

        // Scroll active tab into view
        const tabBtns = document.querySelectorAll('.journey-tabs .tab-btn:not(.exit-btn)');
        if (tabBtns[currentSlide - 1]) {
            tabBtns[currentSlide - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [currentSlide]);

    // Page entrance animation
    useEffect(() => {
        document.body.style.animation = 'pageIn 0.5s ease forwards';
        return () => { document.body.style.animation = ''; };
    }, []);

    const tabLabels = [
        'Barriers', 'Stories', 'CareBot', 'Check',
        'Cost', 'Specialist', 'Community', 'Resources'
    ];

    return (
        <div className="journey-page">
            {/* Page Entrance Overlay */}
            <div id="entrance-overlay"></div>

            {/* Progress Ring */}
            <div className="progress-ring-container">
                <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="22" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                    <circle className="prog-fill" ref={progFillRef} cx="24" cy="24" r="22" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="prog-text" ref={progTextRef}>1</div>
            </div>

            {/* Journey Tabs — cleaned up */}
            <div className="journey-tabs" style={{ alignItems: 'center', gap: '0.25rem', padding: '0.8rem 3%' }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '1.2rem', fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-color)', textDecoration: 'none', flexShrink: 0 }}>
                    <LogoIcon size={22} />
                    <span style={{ letterSpacing: '-0.3px' }}>CareShift</span>
                </Link>

                {/* Compact step tabs */}
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1, justifyContent: 'space-evenly', padding: '0 1rem' }}>
                    {tabLabels.map((label, i) => (
                        <button
                            key={i}
                            className={`tab-btn ${currentSlide === i + 1 ? 'active' : ''}`}
                            onClick={() => goToSlide(i + 1)}
                            style={{ padding: '0.4rem 0.7rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '22px', height: '22px', borderRadius: '50%', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                                background: currentSlide === i + 1 ? 'var(--accent-color)' : i + 1 < currentSlide ? 'var(--accent-color)' : 'var(--border-color)',
                                color: currentSlide === i + 1 || i + 1 < currentSlide ? 'white' : '#94a3b8',
                                transition: 'all 0.3s ease'
                            }}>
                                {i + 1 < currentSlide ? '✓' : i + 1}
                            </span>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto', flexShrink: 0 }}>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
                        <SunIcon />
                    </button>
                    <Link to="/" className="tab-btn exit-btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}>Exit</Link>
                </div>
            </div>

            {/* Slides Container */}
            <div className="slides-container">
                <div className={`slide slide-barriers ${currentSlide === 1 ? 'active' : ''}`} id="slide-1">
                    <BarriersSlide goToSlide={goToSlide} />
                </div>

                <div className={`slide slide-stories ${currentSlide === 2 ? 'active' : ''}`} id="slide-2">
                    <StoriesSlide goToSlide={goToSlide} />
                </div>

                <div className={`slide slide-carebot ${currentSlide === 3 ? 'active' : ''}`} id="slide-3">
                    <CareBotSlide goToSlide={goToSlide} openBottomSheet={() => setBottomSheetOpen(true)} />
                </div>

                <div className={`slide slide-reality ${currentSlide === 4 ? 'active' : ''}`} id="slide-4">
                    <RealityCheckSlide goToSlide={goToSlide} />
                </div>

                <div className={`slide slide-cost ${currentSlide === 5 ? 'active' : ''}`} id="slide-5">
                    <CostImpactSlide goToSlide={goToSlide} />
                </div>

                <div className={`slide slide-specialist ${currentSlide === 6 ? 'active' : ''}`} id="slide-6">
                    <SpecialistSlide goToSlide={goToSlide} openBottomSheet={() => setBottomSheetOpen(true)} />
                </div>

                <div className={`slide slide-community ${currentSlide === 7 ? 'active' : ''}`} id="slide-7">
                    <CommunityWallSlide goToSlide={goToSlide} />
                </div>

                <div className={`slide slide-resources ${currentSlide === 8 ? 'active' : ''}`} id="slide-8">
                    <ResourcesSlide goToSlide={goToSlide} />
                </div>
            </div>

            {/* Bottom Sheet */}
            <BottomSheet isOpen={bottomSheetOpen} onClose={() => setBottomSheetOpen(false)} />
        </div>
    );
}
