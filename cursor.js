document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    
    if(!cursorDot || !cursorRing) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    // We use a simple lerp for smooth following
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const renderCursor = () => {
        // Dot follows fast
        dotX = lerp(dotX, mouseX, 0.4);
        dotY = lerp(dotY, mouseY, 0.4);
        
        // Ring follows slower
        ringX = lerp(ringX, mouseX, 0.15);
        ringY = lerp(ringY, mouseY, 0.15);

        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        
        // 3D Tilt for Masonry Cards
        document.querySelectorAll('.masonry-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;
            const dist = Math.sqrt(Math.pow(mouseX - cardX, 2) + Math.pow(mouseY - cardY, 2));
            
            if (dist < 300) {
                const tiltX = (cardY - mouseY) / 15;
                const tiltY = (mouseX - cardX) / 15;
                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
                card.style.zIndex = "10";
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                card.style.zIndex = "1";
            }
        });

        requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Hover effect for interactive elements
    const interactives = document.querySelectorAll('a, button, .chip, .barrier-card, input');
    
    const addHover = () => document.body.classList.add('cursor-hover');
    const removeHover = (e) => {
        document.body.classList.remove('cursor-hover');
        if(e && e.target && e.target.style) {
            gsap.to(e.target, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        }
    };

    const handleMagnetic = (e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.2, ease: "power2.out" });
    };

    const attachListeners = (node) => {
        node.addEventListener('mouseenter', addHover);
        node.addEventListener('mouseleave', removeHover);
        if(node.matches && node.matches('.btn-primary, .btn-nav')) {
            node.addEventListener('mousemove', handleMagnetic);
        }
    };

    interactives.forEach(attachListeners);

    // Handle dynamically added elements using MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches && node.matches('a, button, .chip, .barrier-card, input')) {
                            attachListeners(node);
                        }
                        // Also check children
                        const children = node.querySelectorAll ? node.querySelectorAll('a, button, .chip, .barrier-card, input') : [];
                        children.forEach(attachListeners);
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});
