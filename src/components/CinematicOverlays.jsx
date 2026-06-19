export default function CinematicOverlays() {
    return (
        <>
            {/* Noise Overlay */}
            <svg className="noise-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
            </svg>

            {/* Ambient Orbs */}
            <div className="ambient-orb orb-1"></div>
            <div className="ambient-orb orb-2"></div>

            {/* Custom Cursor Elements */}
            <div className="cursor-dot"></div>
            <div className="cursor-ring"></div>
        </>
    );
}
