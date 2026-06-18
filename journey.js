let currentSlide = 1;
const totalSlides = 8;

// --- Global Navigation & Progress Ring ---
function updateSlides() {
    document.querySelectorAll('.slide').forEach((slide, index) => {
        if (index + 1 === currentSlide) {
            slide.classList.add('active');
            gsap.fromTo(slide,
                { scale: 1.03, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }
            );
            const content = slide.querySelector('.slide-content') || slide.querySelector('.chat-container');
            if (content) {
                gsap.fromTo(content,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 }
                );
            }
        } else if (slide.classList.contains('active')) {
            gsap.to(slide, {
                scale: 0.98, opacity: 0, duration: 0.3, ease: "power2.inOut",
                onComplete: () => slide.classList.remove('active')
            });
        }
    });

    // Update Tab Navigation
    document.querySelectorAll('.journey-tabs .tab-btn:not(.exit-btn)').forEach((btn, index) => {
        if (index + 1 === currentSlide) {
            btn.classList.add('active');
            // ensure tab is visible in scroll area
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            btn.classList.remove('active');
        }
    });

    // Update Progress Ring
    const progFill = document.getElementById('mainProgFill');
    const progText = document.getElementById('progText');
    if (progFill && progText) {
        gsap.to(progText, { y: -5, opacity: 0, duration: 0.2, onComplete: () => {
            progText.textContent = currentSlide;
            gsap.fromTo(progText, { y: 5, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" });
        }});

        // Circle circumference = 2 * Math.PI * 22 = ~138.23
        const c = 138.23;
        const ratio = currentSlide / totalSlides;
        const offset = c - (ratio * c);
        
        gsap.to(progFill, { strokeDashoffset: offset, duration: 1, ease: "power3.out" });
        
        gsap.fromTo('.progress-ring-container', 
            { scale: 1.15, filter: 'drop-shadow(0 0 15px rgba(14,165,233,0.4))' }, 
            { scale: 1, filter: 'drop-shadow(0 0 0px rgba(14,165,233,0))', duration: 1, ease: "power2.out" }
        );
    }
}

window.goToSlide = function(slideNum) {
    if (slideNum >= 1 && slideNum <= totalSlides) {
        currentSlide = slideNum;
        updateSlides();
    }
}

// --- Barrier Logic (Slide 1) ---
const barriers = [
  { id:'fear', label:'Fear of diagnosis', title:'The fear is doing its job — just not for you', ack:"Not knowing can feel safer than knowing.", step:'Tiny next step: try a 5-minute anonymous symptom check.', res:'Free teleconsults via eSanjeevani.' },
  { id:'stigma', label:'Social stigma', title:'Stigma lives in your neighbourhood, not in your blood test', ack:"What people might say isn't really about your health.", step:'Tiny next step: look for a remote-first consult.', res:'Tele-MANAS (14416) never requires walking in.' },
  { id:'masculinity', label:'Masculinity norms', title:'"I\'ll be fine" was never proof of strength', ack:"Somewhere along the way, brushing it off became the answer.", step:"Tiny next step: tell one person you trust.", res:"7 in 10 callers to KIRAN helpline are men." },
  { id:'cost', label:'Cost concerns', title:"Worrying about the bill before the diagnosis is exhausting", ack:"That worry is completely rational.", step:'Tiny next step: check if you qualify for free treatment.', res:'Ayushman Bharat (PM-JAY), 14555.' },
  { id:'time', label:'Lack of time', title:"This isn't denial. It's triage, and health lost today's round", ack:"You're juggling twelve things.", step:'Tiny next step: block 10 minutes.', res:'National Health Helpline, 104.' },
  { id:'denial', label:'Denial & uncertainty', title:'"Probably nothing" is doing a lot of heavy lifting', ack:"Maybe it is nothing. The only way to stop wondering is to check.", step:"Tiny next step: set a 48-hour rule.", res:'A 2-day deadline turns an open-ended worry into a closed one.' }
];

const chipRow = document.getElementById('chipRow');
const pathwayRow = document.getElementById('pathwayRow');
const selected = new Set();

if(chipRow && pathwayRow) {
    barriers.forEach(b=>{
      const chip = document.createElement('div');
      chip.className='chip'; chip.textContent=b.label; chip.dataset.id=b.id;
      chip.onclick=()=>{
        chip.classList.toggle('active');
        selected.has(b.id) ? selected.delete(b.id) : selected.add(b.id);
        renderPathways();
      };
      chipRow.appendChild(chip);
    });

    function renderPathways(){
      pathwayRow.innerHTML='';
      if(selected.size===0){
        pathwayRow.innerHTML = '<div class="empty-state">Pick at least one above — most people end up picking three. Your personal pathway will appear right here.</div>';
        return;
      }
      barriers.filter(b=>selected.has(b.id)).forEach(b=>{
        const card=document.createElement('div');
        card.className='path-card';
        card.innerHTML = `<h3>${b.title}</h3><p>${b.ack}</p><div class="path-step">${b.step}</div><div class="path-res">${b.res}</div>`;
        pathwayRow.appendChild(card);
      });
    }
    renderPathways();
}

// --- CareBot Logic (Slide 3) ---
const chatLog = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
const quickRow = document.getElementById('quickRow');
let botReplyCount = 0;
let bridgeInjected = false;

const quickPrompts = [
  "I think something's wrong but I'm scared to check",
  "I don't want anyone to know",
  "I can't afford a doctor right now",
  "I keep telling myself it's fine"
];
if(quickRow) {
    quickPrompts.forEach(q=>{
      const btn = document.createElement('button'); 
      btn.textContent=q;
      btn.onclick=()=>{ chatInput.value=q; window.sendMessage(); };
      quickRow.appendChild(btn);
    });
}

const CRISIS_WORDS = ['suicide','kill myself','end my life','end it all','dont want to live','self harm','hurt myself'];
const CATEGORIES = [
  { id:'crisis', words:CRISIS_WORDS },
  { id:'fear', words:['scared','afraid','fear','dont want to know','worried','what if','diagnosis','test result'] },
  { id:'cost', words:['afford','money','cost','expensive','bill','cant pay'] },
  { id:'time', words:['no time','busy','work','schedule'] }
];

const RESPONSES = {
  crisis: [`<b>I hear how heavy this is — and I want you talking to a real person right now.</b> Please call <b>Tele-MANAS at 14416</b>. If you're in danger, call <b>108</b>.`],
  fear: ["That hesitation makes sense. Fear of the answer is one of the most common reasons people wait. Want me to point you to a no-pressure first step?"],
  cost: ["Worrying about the bill is exhausting. Check Ayushman Bharat (PM-JAY) at 14555 before assuming you can't afford care."],
  time: ["This sounds like triage. A phone helpline call is 10 minutes, not a day off. Try National Health Helpline (104)."],
  fallback: ["Thank you for sharing that. It's the hardest part. If you had to name the one thing actually stopping you today, what would it be?"]
};

let fallbackIdx = 0;
function classify(text){
  const t = text.toLowerCase();
  for(const cat of CATEGORIES){
    if(cat.words.some(w=>t.includes(w))) return cat.id;
  }
  return 'fallback';
}

function addBubble(html, who, customClass=''){
  if(!chatLog) return;
  const b = document.createElement('div');
  b.className = 'message ' + (who.includes('user') ? 'user-message' : 'bot-message');
  
  let avatar = who.includes('user') ? 'U' : 'C';
  let msgClass = 'msg-content ' + customClass;
  if(who.includes('crisis')) msgClass += ' crisis';

  b.innerHTML = `<div class="avatar">${avatar}</div><div class="${msgClass}"><p>${html}</p></div>`;
  chatLog.appendChild(b);
  chatLog.scrollTop = chatLog.scrollHeight;
  
  gsap.fromTo(b, 
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }
  );
  
  return b;
}

function botReply(userText){
  const cat = classify(userText);
  
  const t=document.createElement('div');
  t.className='message bot-message'; t.id='typingNow';
  t.innerHTML=`<div class="avatar">C</div><div class="msg-content typing"><span></span><span></span><span></span></div>`;
  chatLog.appendChild(t);
  chatLog.scrollTop = chatLog.scrollHeight;

  setTimeout(()=>{
    if(document.getElementById('typingNow')) document.getElementById('typingNow').remove();
    
    if(cat==='crisis'){
      addBubble(RESPONSES.crisis[0], 'bot crisis');
    } else {
      const arr = RESPONSES[cat] || RESPONSES.fallback;
      const msg = cat==='fallback' ? arr[(fallbackIdx++) % arr.length] : arr[Math.floor(Math.random()*arr.length)];
      addBubble(msg, 'bot');
    }
    
    botReplyCount++;
    if(botReplyCount >= 3 && !bridgeInjected) {
        bridgeInjected = true;
        setTimeout(()=>{
            const bridgeHtml = `
                <div style="text-align:center; padding:10px;">
                    <b style="color:var(--text-color); font-family:'Outfit',sans-serif; font-size:1.1rem; display:block; margin-bottom:8px;">Ready for a real next step?</b>
                    <button onclick="window.openBottomSheet()" class="btn-nav" style="font-size:0.9rem; padding:0.6rem 1.2rem;">Find a Free Clinic Near You &rarr;</button>
                </div>
            `;
            addBubble(bridgeHtml, 'bot', 'bridge-card');
        }, 1000);
    }
  }, 800);
}

window.sendMessage = function(){
  if(!chatInput) return;
  const val = chatInput.value.trim();
  if(!val) return;
  addBubble(val.replace(/</g,'&lt;'), 'user');
  chatInput.value='';
  botReply(val);
}

window.handleKeyPress = function(e) {
    if (e.key === 'Enter') window.sendMessage();
}


// --- Reality Check Logic (Slide 4) ---
const rcQuestions = [
    { q: "How long has this symptom or concern been bothering you?", opts: ["Just started", "A few weeks", "Months", "Years"] },
    { q: "How frequently does it occupy your thoughts?", opts: ["Rarely", "A few times a week", "Every single day"] },
    { q: "Is it actively stopping you from doing things you normally do?", opts: ["No", "Sometimes", "Yes, significantly"] },
    { q: "Have you Googled your symptoms multiple times?", opts: ["No", "Once or twice", "Yes, it's a rabbit hole"] },
    { q: "Has someone close to you noticed or asked about it?", opts: ["No", "They've hinted at it", "Yes, they asked directly"] }
];
const rcContainer = document.getElementById('rc-container');

function renderRcQuestions() {
    if(!rcContainer) return;
    rcContainer.innerHTML = '';
    rcQuestions.forEach((item, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = `rc-question ${index === 0 ? 'visible' : ''}`;
        qDiv.id = `rc-q-${index}`;
        qDiv.innerHTML = `<h3>${index + 1}. ${item.q}</h3><div class="rc-options"></div>`;
        
        const optContainer = qDiv.querySelector('.rc-options');
        item.opts.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'rc-option'; btn.textContent = opt;
            btn.onclick = () => {
                gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
                qDiv.querySelectorAll('.rc-option').forEach(el => el.classList.remove('selected'));
                btn.classList.add('selected');
                if (index + 1 < rcQuestions.length) {
                    setTimeout(() => {
                        const nextQ = document.getElementById(`rc-q-${index + 1}`);
                        if(nextQ && !nextQ.classList.contains('visible')) {
                            nextQ.classList.add('visible');
                            nextQ.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 300);
                } else {
                    setTimeout(() => showRcResult(), 500);
                }
            };
            optContainer.appendChild(btn);
        });
        rcContainer.appendChild(qDiv);
    });
}

function showRcResult() {
    const resultDiv = document.getElementById('rc-result');
    if(!resultDiv) return;
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const fillElem = document.getElementById('meterFill');
    const textElem = document.getElementById('meterText');
    if(fillElem && textElem) {
        void fillElem.offsetWidth; 
        fillElem.style.strokeDashoffset = 377 - (0.92 * 377);
        textElem.style.opacity = '1';
    }
}


// --- Cost Impact Logic (Slide 5) ---
window.updateCostSlider = function(val) {
    document.getElementById('mo-val').textContent = val;
    
    // Formula simulation
    const early = 500 + (val * 10); // Slight creep
    const late = 5000 * Math.pow(1.05, val); // Exponential creep
    
    const earlyCostObj = { val: parseInt(document.getElementById('earlyCost').textContent.replace(/,/g,'')) || 500 };
    const lateCostObj = { val: parseInt(document.getElementById('lateCost').textContent.replace(/,/g,'')) || 5000 };
    
    gsap.to(earlyCostObj, {
        val: Math.round(early),
        duration: 0.3,
        onUpdate: () => { document.getElementById('earlyCost').textContent = earlyCostObj.val.toLocaleString(); }
    });
    
    gsap.to(lateCostObj, {
        val: Math.round(late),
        duration: 0.3,
        onUpdate: () => { document.getElementById('lateCost').textContent = lateCostObj.val.toLocaleString(); }
    });
    
    const moto = document.getElementById('costMoto');
    if(val <= 3) moto.textContent = "You're in the best window. Act now.";
    else if(val <= 12) moto.textContent = "Waiting is starting to compound costs. Don't delay.";
    else moto.textContent = "Costs can be significantly higher at this stage. Intercept it now.";
}


// --- Specialist Finder Logic (Slide 6) ---
const specialities = [
    { symp: "Chest Pain", spec: "Cardiologist" },
    { symp: "Persistent Cough", spec: "Pulmonologist" },
    { symp: "Skin Rash", spec: "Dermatologist" },
    { symp: "Anxiety/Low Mood", spec: "Psychiatrist / Therapist" },
    { symp: "Joint Pain", spec: "Rheumatologist / Orthopedist" },
    { symp: "Digestive Issues", spec: "Gastroenterologist" },
    { symp: "Headaches", spec: "Neurologist" },
    { symp: "Vision Problems", spec: "Ophthalmologist" }
];
const specChipsContainer = document.getElementById('specChips');
const specSelected = new Set();

if(specChipsContainer) {
    specialities.forEach(s => {
        const chip = document.createElement('div');
        chip.className='chip'; chip.textContent = s.symp;
        chip.onclick = () => {
            chip.classList.toggle('active');
            specSelected.has(s.symp) ? specSelected.delete(s.symp) : specSelected.add(s.symp);
            
            const res = document.getElementById('specResult');
            if(specSelected.size > 0) {
                // Just grab the first mapped specialist for simplicity
                const firstSymp = Array.from(specSelected)[0];
                const matched = specialities.find(x => x.symp === firstSymp).spec;
                let txt = matched;
                if(specSelected.size > 1) txt += " or General Physician";
                document.getElementById('specType').textContent = txt;
                res.style.display = 'block';
                gsap.fromTo(res, {y:20, opacity:0}, {y:0, opacity:1, duration:0.4});
            } else {
                res.style.display = 'none';
            }
        };
        specChipsContainer.appendChild(chip);
    });
}


// --- Community Wall Logic (Slide 7) ---
const masonryGrid = document.getElementById('masonryGrid');
const pastelColors = ['#bae6fd', '#bbf7d0', '#e9d5ff', '#fef08a', '#fbcfe8'];
let colorIdx = 0;

const storiesData = [
    { text: "I kept putting off my checkup because I felt fine. Turns out, catching my high blood pressure early saved me from a major stroke. The hardest part was just making the appointment.", name: "Marcus, 42" },
    { text: "I was terrified of finding out I had diabetes like my father. The anxiety of not knowing was actually worse than the diagnosis. Now, it's totally managed and I feel in control.", name: "Sarah, 35" },
    { text: "I thought taking time off work for tests was a luxury I couldn't afford. But investing that one afternoon gave me peace of mind for the whole year. Worth every second.", name: "David, 50" },
    { text: "As a young guy, I thought I was invincible. Getting a routine blood test felt like something only older people did. Finding out I had a severe vitamin deficiency explained my constant fatigue. I'm literally a new person now.", name: "Leo, 28" },
    { text: "I ignored the mild chest pains because I didn't want to be 'that dramatic person' at the ER. My wife finally forced me to go. It was early stage heart disease. Speaking up saved my life.", name: "James, 55" },
    { text: "I was so embarrassed about my weight that I avoided doctors for five years. When I finally went, the doctor didn't judge me at all—she just gave me a plan. The relief of just facing it was incredible.", name: "Elena, 39" }
];

function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'masonry-card';
    card.style.borderLeftColor = pastelColors[colorIdx % pastelColors.length];
    colorIdx++;
    // Support either object format or plain string (from user input)
    const text = typeof story === 'string' ? story : story.text;
    const name = typeof story === 'string' ? 'Anonymous' : story.name;
    card.innerHTML = `<p>"${text}"</p><div style="margin-top: 1rem; font-weight: 600; opacity: 0.8; font-size: 0.9rem;">— ${name}</div>`;
    return card;
}

if(masonryGrid) {
    storiesData.forEach(s => {
        masonryGrid.appendChild(createStoryCard(s));
    });
}

window.submitStory = function() {
    const inp = document.getElementById('commInput');
    if(!inp || !inp.value.trim()) return;
    const card = createStoryCard(inp.value.trim());
    masonryGrid.insertBefore(card, masonryGrid.firstChild);
    inp.value = '';
    masonryGrid.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- Bottom Sheet Logic ---
window.openBottomSheet = function() {
    const overlay = document.getElementById('bottomSheetOverlay');
    const sheet = document.getElementById('bottomSheet');
    if(overlay && sheet) {
        overlay.style.display = 'block';
        setTimeout(() => sheet.style.bottom = '0', 10);
    }
}
window.closeBottomSheet = function() {
    const overlay = document.getElementById('bottomSheetOverlay');
    const sheet = document.getElementById('bottomSheet');
    if(overlay && sheet) {
        sheet.style.bottom = '-100%';
        setTimeout(() => overlay.style.display = 'none', 400);
    }
}


// --- Initial initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateSlides();
    renderRcQuestions();
    if(chatLog) {
        addBubble("Hi — I'm CareBot. You don't need to introduce a symptom or a diagnosis. Just tell me what's making this hard to act on, in your own words.", 'bot');
    }
});
