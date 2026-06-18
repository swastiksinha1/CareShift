let currentSlide = 1;
const totalSlides = 3;

// Entrance animation for the first slide
window.onload = () => {
    gsap.from(".slide-barriers .barrier-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5
    });
};

function goToSlide(slideNum) {
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
    document.getElementById(`slide-${slideNum}`).classList.add('active');
    
    // Trigger animations for specific slides
    if (slideNum === 2) {
        gsap.from(".story-card", {
            y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
        });
    } else if (slideNum === 3) {
        gsap.from(".chat-header, .bot-message", {
            y: 20, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
        });
    }
    
    currentSlide = slideNum;
}

function nextSlide(e) {
    if(e) e.stopPropagation();
    if (currentSlide < totalSlides) {
        goToSlide(currentSlide + 1);
    }
}

function prevSlide(e) {
    if(e) e.stopPropagation();
    if (currentSlide > 1) {
        goToSlide(currentSlide - 1);
    }
}

// Barrier Interactions
window.toggleBarrier = function(card) {
    card.classList.toggle('flipped');
};

// CareBot Interactions
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
    
    // Remove quick replies
    const quickReplies = document.querySelector('.quick-replies');
    if(quickReplies) quickReplies.remove();

    chatBody.scrollTop = chatBody.scrollHeight;

    // Bot response
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot-message';
        
        botMsg.innerHTML = `
            <div class="avatar">CB</div>
            <div class="msg-content"><p>I understand completely. The hesitation is natural, but you are already doing great by just being here and exploring this. We have an anonymous symptom checker available—would you like to try it?</p></div>
        `;
        chatBody.appendChild(botMsg);
        
        // Flash animation
        gsap.from(botMsg, { y: 20, opacity: 0, duration: 0.5, ease: "power2.out" });
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1200);
};
