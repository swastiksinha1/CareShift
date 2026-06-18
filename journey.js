let currentSlide = 1;
const totalSlides = 5;

// Navigation
function updateSlides() {
    document.querySelectorAll('.slide').forEach((slide, index) => {
        if (index + 1 === currentSlide) {
            slide.classList.add('active');
            gsap.fromTo(slide.querySelector('.slide-content') || slide.querySelector('.chat-container'), 
                { y: 50, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
            );
        } else {
            slide.classList.remove('active');
        }
    });

    // Update Tab Navigation
    document.querySelectorAll('.journey-tabs .tab-btn:not(.exit-btn)').forEach((btn, index) => {
        if (index + 1 === currentSlide) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

window.goToSlide = function(slideNum) {
    if (slideNum >= 1 && slideNum <= totalSlides) {
        currentSlide = slideNum;
        updateSlides();
    }
}

window.nextSlide = function() {
    goToSlide(currentSlide + 1);
}

window.prevSlide = function() {
    goToSlide(currentSlide - 1);
}

// --- Barrier Logic Extracted from Saathi ---
const barriers = [
  {
    id:'fear', label:'Fear of diagnosis',
    title:'The fear is doing its job — just not for you',
    ack:"Not knowing can feel safer than knowing. That's a normal way for a brain to protect itself in the short term — but it doesn't make the worry go away, it just postpones it.",
    step:'Tiny next step: try a 5-minute anonymous symptom check before you commit to anything bigger. You can stop after.',
    res:'Free teleconsults are available via government platforms like eSanjeevani — no clinic visit required.'
  },
  {
    id:'stigma', label:'Social stigma',
    title:'Stigma lives in your neighbourhood, not in your blood test',
    ack:"What people might say isn't really about your health — it's about their comfort. Your health doesn't owe anyone that comfort.",
    step:'Tiny next step: look for a remote-first or phone consult, so no one in your building has to know you went anywhere.',
    res:'Tele-MANAS (14416) and most teleconsult apps never require you to be seen walking in.'
  },
  {
    id:'masculinity', label:'Masculinity norms',
    title:'"I\'ll be fine" was never proof of strength',
    ack:"Somewhere along the way, brushing it off became the only acceptable answer. Real strength is acting on a problem before it controls you — not pretending it isn't there.",
    step:"Tiny next step: tell one person, not a doctor — just one person you trust. Saying it out loud is usually the hardest 10% of the whole problem.",
    res:"For context: roughly 7 in 10 callers to India's KIRAN mental health helpline are men. You'd be in good company."
  },
  {
    id:'cost', label:'Cost concerns',
    title:"Worrying about the bill before the diagnosis is exhausting",
    ack:"That worry is completely rational — and waiting on it usually makes the eventual bill bigger, not smaller.",
    step:'Tiny next step: check if you already qualify for free treatment before assuming you can\'t afford it.',
    res:'Ayushman Bharat (PM-JAY), 14555 — covers treatment at empanelled hospitals at zero cost for eligible families.'
  },
  {
    id:'time', label:'Lack of time',
    title:"This isn't denial. It's triage, and health lost today's round",
    ack:"You're juggling twelve things and health didn't win the slot today. That's a scheduling problem, not a character flaw.",
    step:'Tiny next step: block 10 minutes, not a day. A phone triage call fits inside a lunch break.',
    res:'National Health Helpline, 104 — general advice without leaving your desk.'
  },
  {
    id:'denial', label:'Denial & uncertainty',
    title:'"Probably nothing" is doing a lot of heavy lifting',
    ack:"Maybe it is nothing. The only way to actually stop wondering is to check, once, instead of carrying the question around.",
    step:"Tiny next step: set a 48-hour rule with yourself. If it's still there in 2 days, you call — write the date down now.",
    res:'A 2-day deadline turns an open-ended worry into a closed one.'
  }
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

// --- Saathi Chat Engine ---
const chatLog = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
const quickRow = document.getElementById('quickRow');

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

const CRISIS_WORDS = ['suicide','kill myself','end my life','end it all','dont want to live',"don't want to live",'no reason to live','self harm','self-harm','harm myself','hurt myself','better off dead','cant go on',"can't go on"];
const CATEGORIES = [
  { id:'crisis', words:CRISIS_WORDS },
  { id:'fear', words:['scared','afraid','fear','dont want to know',"don't want to know",'worried it','what if it','diagnosis','test result'] },
  { id:'stigma', words:['what will people say','log kya kahenge','judge','judged','neighbour','neighbor','someone sees','reputation','shame','embarrass'] },
  { id:'masculinity', words:['man up',"i'll be fine",'ill be fine','men dont','men don\'t','weak','be strong','handle it myself','crying'] },
  { id:'cost', words:['afford','money','cost','expensive','bill','cant pay',"can't pay",'no insurance','cheap'] },
  { id:'time', words:['no time','too busy',"don't have time",'dont have time','work','schedule','day off'] },
  { id:'denial', words:['probably nothing',"it's fine",'its fine','not that serious','overreacting','just stress','sure its ok',"sure it's ok"] },
  { id:'mental', words:['anxious','anxiety','depressed','depression','panic','overwhelmed','cant sleep',"can't sleep",'stressed'] }
];

const RESPONSES = {
  crisis: [
    `<b>I hear how heavy this is — and I want you talking to a real person right now, not a screen.</b>Please call <b>Tele-MANAS at 14416</b> or <b>KIRAN at 1800-599-0019</b> — both are free, run by trained counsellors, available right now in many languages. If you're in immediate danger, call <b>108</b>. You don't have to explain yourself first. Just dial.`
  ],
  fear: [
    "That hesitation makes sense — not knowing can feel safer than knowing, even though it usually isn't. You don't have to commit to a diagnosis today. A 5-minute anonymous symptom check is a much smaller ask than 'go to the hospital.' Want me to point you to a no-pressure first step?",
    "Fear of the answer is one of the most common reasons people wait — you're not being dramatic. What if the goal today isn't 'get diagnosed' but just 'ask one question to one helpline'? That's a much smaller door to walk through."
  ],
  stigma: [
    "What people might say is about their comfort, not your health. A lot of people solve this exact worry with a remote or phone consult — nobody has to see you walk anywhere. Would that change things for you?",
    "Stigma is loud, but it's also local — it doesn't follow you onto a phone call. Tele-MANAS (14416) talks to people in total privacy, in their own language, every single day."
  ],
  masculinity: [
    "Brushing it off was never proof of strength — acting on it before it gets worse is. For what it's worth, roughly 7 in 10 callers to India's KIRAN helpline are men. You'd be in good company, not an exception.",
    "You don't have to call yourself 'sick' to make a call. Try telling just one person you trust — not a doctor yet. Saying it out loud tends to be the hardest 10% of this whole thing."
  ],
  cost: [
    "Worrying about the bill before you even know what's wrong is exhausting, and it's a rational worry — but waiting usually makes the eventual cost bigger, not smaller. Check Ayushman Bharat (PM-JAY) at 14555 before assuming you can't afford care — many families already qualify and don't know it.",
    "Cost is a real barrier, not an excuse. One call to 14555 can tell you in minutes whether treatment is already free for your family under PM-JAY."
  ],
  time: [
    "This sounds less like avoidance and more like triage — health just hasn't won a time slot yet. A phone helpline call is 10 minutes, not a day off. The National Health Helpline (104) is built for exactly that.",
    "You don't need a free day. You need a free 10 minutes. Could you find that today, even just to ask one question?"
  ],
  denial: [
    "'Probably nothing' is doing a lot of heavy lifting right now. Here's a trick: give yourself a 48-hour rule. If it's still there in two days, you call — no more re-deciding every morning.",
    "Maybe it really is nothing. The only way to actually stop wondering is to check once — carrying the question around is its own kind of tiring."
  ],
  mental: [
    "That sounds like a lot to be carrying alone. Tele-MANAS (14416) is a free, confidential government helpline, available right now, in most Indian languages — you don't need a 'serious enough' reason to call.",
    "Feeling overwhelmed is a real, valid reason to reach out — not a sign you're being too much. A counsellor at 14416 is trained exactly for this conversation."
  ],
  fallback: [
    "Thank you for putting that into words — that's often the hardest part. Can you tell me a bit more about what's making this feel hard to act on: fear, cost, time, or something else?",
    "I'm listening. If you had to name the one thing actually stopping you from making a call today, what would it be?"
  ]
};

let fallbackIdx = 0;
function classify(text){
  const t = text.toLowerCase();
  for(const cat of CATEGORIES){
    if(cat.words.some(w=>t.includes(w))) return cat.id;
  }
  return 'fallback';
}

function addBubble(html, who){
  if(!chatLog) return;
  const b = document.createElement('div');
  b.className = 'message ' + (who.includes('user') ? 'user-message' : 'bot-message');
  
  let avatar = who.includes('user') ? 'U' : 'C';
  let msgClass = 'msg-content';
  if(who.includes('crisis')) msgClass += ' crisis';

  b.innerHTML = `
      <div class="avatar">${avatar}</div>
      <div class="${msgClass}">
          <p>${html}</p>
      </div>
  `;
  chatLog.appendChild(b);
  chatLog.scrollTop = chatLog.scrollHeight;
  return b;
}

function addTyping(){
  if(!chatLog) return;
  const t=document.createElement('div');
  t.className='message bot-message'; t.id='typingNow';
  t.innerHTML=`
      <div class="avatar">C</div>
      <div class="msg-content typing">
          <span></span><span></span><span></span>
      </div>
  `;
  chatLog.appendChild(t);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function removeTyping(){
  const t=document.getElementById('typingNow');
  if(t) t.remove();
}

function botReply(userText){
  const cat = classify(userText);
  addTyping();
  setTimeout(()=>{
    removeTyping();
    if(cat==='crisis'){
      addBubble(RESPONSES.crisis[0], 'bot crisis');
      return;
    }
    const arr = RESPONSES[cat] || RESPONSES.fallback;
    let msg;
    if(cat==='fallback'){
      msg = RESPONSES.fallback[fallbackIdx % RESPONSES.fallback.length];
      fallbackIdx++;
    } else {
      msg = arr[Math.floor(Math.random()*arr.length)];
    }
    addBubble(msg, 'bot');
  }, 650 + Math.random()*500);
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
    if (e.key === 'Enter') {
        window.sendMessage();
    }
}


// --- Reality Check Logic ---
const rcQuestions = [
    { q: "How long has this symptom or concern been bothering you?", opts: ["Just started", "A few weeks", "Months", "Years"] },
    { q: "How frequently does it occupy your thoughts?", opts: ["Rarely", "A few times a week", "Every single day"] },
    { q: "Is it actively stopping you from doing things you normally do?", opts: ["No", "Sometimes", "Yes, significantly"] },
    { q: "Have you Googled your symptoms multiple times?", opts: ["No", "Once or twice", "Yes, it's a rabbit hole"] },
    { q: "Has someone close to you noticed or asked about it?", opts: ["No", "They've hinted at it", "Yes, they asked directly"] }
];

let currentRcIndex = 0;
const rcContainer = document.getElementById('rc-container');

function renderRcQuestions() {
    if(!rcContainer) return;
    rcContainer.innerHTML = '';
    
    rcQuestions.forEach((item, index) => {
        const qDiv = document.createElement('div');
        qDiv.className = `rc-question ${index === 0 ? 'visible' : ''}`;
        qDiv.id = `rc-q-${index}`;
        
        const qTitle = document.createElement('h3');
        qTitle.textContent = `${index + 1}. ${item.q}`;
        qDiv.appendChild(qTitle);
        
        const optContainer = document.createElement('div');
        optContainer.className = 'rc-options';
        
        item.opts.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'rc-option';
            btn.textContent = opt;
            btn.onclick = () => handleRcSelection(index, btn);
            optContainer.appendChild(btn);
        });
        
        qDiv.appendChild(optContainer);
        rcContainer.appendChild(qDiv);
    });
}

function handleRcSelection(qIndex, btnElem) {
    const qDiv = document.getElementById(`rc-q-${qIndex}`);
    
    // Remove selected class from siblings
    qDiv.querySelectorAll('.rc-option').forEach(el => el.classList.remove('selected'));
    btnElem.classList.add('selected');
    
    // Show next question or results
    if (qIndex + 1 < rcQuestions.length) {
        setTimeout(() => {
            const nextQ = document.getElementById(`rc-q-${qIndex + 1}`);
            if(nextQ && !nextQ.classList.contains('visible')) {
                nextQ.classList.add('visible');
                // Scroll into view gently
                nextQ.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    } else {
        // All answered - show result
        setTimeout(() => {
            showRcResult();
        }, 500);
    }
}

function showRcResult() {
    const resultDiv = document.getElementById('rc-result');
    if(!resultDiv) return;
    
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Animate SVG Meter
    // Circle circumference = 2 * Math.PI * 60 = ~377
    const fillElem = document.getElementById('meterFill');
    const textElem = document.getElementById('meterText');
    
    if(fillElem && textElem) {
        // Trigger reflow
        void fillElem.offsetWidth; 
        
        // Target percentage (e.g., 92%)
        const targetPct = 92;
        const c = 377; // circumference
        const offset = c - (targetPct / 100) * c;
        
        setTimeout(() => {
            fillElem.style.strokeDashoffset = offset;
            textElem.style.opacity = '1';
        }, 100);
    }
}


// Initial initialization
document.addEventListener('DOMContentLoaded', () => {
    updateSlides();
    if(chatLog) {
        addBubble("Hi — I'm CareBot. You don't need to introduce a symptom or a diagnosis. Just tell me what's making this hard to act on, in your own words.", 'bot');
    }
    renderRcQuestions();
});
