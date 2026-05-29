const character = document.getElementById("character");
const textbox = document.getElementById("textbox");
const background = document.getElementById("background");
const upgradeButton = document.getElementById("upgradeButton");
const bgm = document.getElementById("bgm");
const talkSound = document.getElementById("talkSound");
const pointsDisplay = document.getElementById("pointsDisplay");
let talkSoundAllowed = false;

/*
========================================
STATE
========================================
*/

let currentPhase = 1;
let isTalking = false;
let audioUnlocked = false;

let points = 0;
let pointsPerClick = 1;
let upgradeLevel = 0;
let upgradeCost = 50;

let currentMusic = ""; // ✅ prevents music restarting
let musicStarted = false;

/*
========================================
PHASE DATA
========================================
*/

const phaseSettings = {
    1: {
        folder: "sprites/phase1",
        background: "backgrounds/bg1.gif",
        music: "audio/phase1music.mp3"
    },
    2: {
        folder: "sprites/phase2",
        background: "backgrounds/bg2.gif",
        music: "audio/phase2music.mp3"
    },
    3: {
        folder: "sprites/phase3",
        background: "backgrounds/bg3.gif",
        music: "audio/phase3music.mp3"
    }
};

/*
========================================
UI
========================================
*/

function updateUI() {
    pointsDisplay.innerText = `Points: ${points}`;
    upgradeButton.innerText = `Upgrade (${upgradeCost})`;
}

bgm.loop = true;
bgm.volume = 0.6;

/*
========================================
SPRITES
========================================
*/

function getSprite(name) {

    const folder = phaseSettings[currentPhase].folder;

    const map = {
        idle: `phase${currentPhase}.svg`,
        talk: `phase${currentPhase}talk.svg`,
        blank: `phase${currentPhase}blank.svg`,
        awktalk: `phase${currentPhase}awktalk.svg`,
        happytalk: `phase${currentPhase}happytalk.svg`,
        surprise: `phase${currentPhase}surprise.svg`
    };

    return `${folder}/${map[name] || map.idle}`;
}

function setIdle() {
    character.src = getSprite("idle");
}

/*
========================================
DIALOGUE
========================================
*/

const monologues = [
    {
        phase: 1,
        weight: 50,
        sequence: [
            { sprite: "talk", text: "Good morning.", pause: 1500 },
            { sprite: "happytalk", text: "Samuel Seabury, at your service.", pause: 2200 },
            { sprite: "blank", text: "Or, well, as much as I can be...", pause: 1500 },
            { sprite: "awktalk", text:"Considering I'm kind of stuck in your computer.", pause:3000 }
        ]
    },
    {
        phase: 1,
        weight: 25,
        sequence: [
            { sprite: "blank", text: "... *he is secretly judging you.*", pause: 2500 }
        ]
    },
    {
        phase: 1,
        weight: 30,
        sequence: [
            { sprite: "talk", text: "Say...", pause: 1500 },
            { sprite: "awktalk", text: "Have you ever considered doing something better with your life?", pause: 2000 },
            { sprite: "blank", text: "Like.. actually bothering to learn JavaScript?", pause: 3000}
        ]
    },
    {
        phase: 1,
        weight: 33,
        sequence: [
            { sprite: "blank", text: "Eurgh...", pause: 1000 },
            { sprite: "awktalk", text: "Just remembered Hamilton exists.", pause: 1500 },
            { sprite: "idle", text: "You don't like him.", pause: 1500 },
            { sprite: "surprise", text: "Do you...?", pause: 2500 }
        ]
    },
    {
        phase: 2,
        weight: 40,
        sequence: [
            { sprite: "talk", text: "Huh.", pause: 2000 },
            { sprite: "surprise", text: "Thanks for giving me my reading glasses.", pause: 3000 }
        ]
    },
    {
        phase: 2,
        weight: 15,
        sequence: [
            { sprite: "blank", text: "You are persistent.", pause: 2500 }
        ]
    },
    {
        phase: 2,
        weight: 20,
        sequence: [
            { sprite: "happytalk", text: "Be who you are!", pause: 2500 },
            { sprite: "happytalk", text: "For your priiiiiiiiiiiiiide!~ ♫", pause: 2500 }
        ]
    }, 
    {
        phase: 2,
        weight: 25,
        sequence: [
            { sprite: "idle", text: "I don't like women", pause: 2500 },
            { sprite: "awktalk", text: "A peak woman, that's the shit I DON'T LIKE.", pause: 2500 }
        ]
    },       
    {
        phase: 2,
        weight: 30,
        sequence: [
            { sprite: "blank", text: "So...", pause: 2500 },
            { sprite: "talk", text: "What are your plans today?", pause: 2500 }
        ]
    },  
    {
        phase: 2,
        weight: 35,
        sequence: [
            { sprite: "blank", text: "...", pause: 2500 },
            { sprite: "blank", text: "*He appears to be in deep thought.*", pause: 2500 }
        ]
    },
    {
        phase: 3,
        weight: 10,
        sequence: [
            { sprite: "blank", text: "...", pause: 3500 },
            { sprite: "talk", text: "I know what you are.", pause: 3500 }
        ]
    },
    {
        phase: 3,
        weight: 5,
        sequence: [
            { sprite: "surprise", text: "I'd call you a slur if I could.", pause: 3000 },
            { sprite: "awktalk", text: "But this is for some lousy school assignment.", pause: 3000}
        ]
    },
    {
        phase: 3,
        weight: 12,
        sequence: [
            { sprite: "surprise", text: "You know, I was meant to have an extra outfit.", pause: 3000 },
            { sprite: "surprise", text: "And a cool new pose!", pause: 3000},
            { sprite: "awktalk", text: "Don't rush your assignments, kids.", pause: 3000}
        ]
    }
];

/*
========================================
UTIL
========================================
*/

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/*
========================================
AUDIO
========================================
*/

async function safePlay(audio) {
    if (!audio) return;
    try {
        audio.currentTime = 0;
        await audio.play();
    } catch (e) {}
}

/*
========================================
PHASE SYSTEM (FIXED MUSIC)
========================================
*/

function setPhase() {

    const phase = phaseSettings[currentPhase];

    background.style.backgroundImage =
        `url('${phase.background}')`;

    // only change track if needed
    if (currentMusic !== phase.music) {
        bgm.src = phase.music;
        currentMusic = phase.music;
        musicStarted = false;
    }

    setIdle();
    textbox.textContent = "Samuel's waiting on you. What are you waiting for? Click!";
}

/*
========================================
MONOLOGUE PICKER
========================================
*/

function pickMonologue() {

    const available = monologues.filter(m => m.phase === currentPhase);
    if (!available.length) return null;

    let total = available.reduce((sum, m) => sum + m.weight, 0);
    let r = Math.random() * total;

    for (const m of available) {
        r -= m.weight;
        if (r <= 0) return m;
    }

    return available[0];
}

/*
========================================
TYPEWRITER
========================================
*/

async function typeText(text) {

    textbox.textContent = "";

    for (const char of text) {

        textbox.textContent += char;

        playTalkTick(); // 🔥 controlled sound

        await wait(28);
    }
}

function playTalkTick() {

    if (!talkSoundAllowed) return;

    talkSound.pause();       // stop current playback
    talkSound.currentTime = 0;

    talkSound.play().catch(() => {});
}

/*
========================================
MONOLOGUE PLAYER
========================================
*/

async function playMonologue(monologue) {

    if (!monologue) return;

    isTalking = true;
    talkSoundAllowed = true; // 🔥 enable sound

    try {

        for (const line of monologue.sequence) {

            character.src = getSprite(line.sprite);

            await typeText(line.text);
            await wait(line.pause);

        }

    } finally {

        isTalking = false;
        talkSoundAllowed = false;

        talkSound.pause();
        talkSound.currentTime = 0;

        await wait(50);

        setIdle();
        textbox.textContent = "He's thinking about his next move.";
    }
}

/*
========================================
CLICK SYSTEM
========================================
*/

character.addEventListener("click", async () => {

    audioUnlocked = true;

    // 🔥 FIRST USER INTERACTION STARTS MUSIC
    if (!musicStarted) {
        bgm.play()
            .then(() => {
                musicStarted = true;
            })
            .catch(() => {
                // retry fallback
                setTimeout(() => {
                    bgm.play().then(() => {
                        musicStarted = true;
                    }).catch(() => {});
                }, 200);
            });
    }

    if (isTalking) return;

    if (Math.random() <= 0.05) {
        const monologue = pickMonologue();
        await playMonologue(monologue);
    }

    points += pointsPerClick;
    updateUI();
});

/*
========================================
UPGRADE SYSTEM
========================================
*/

upgradeButton.addEventListener("click", () => {

    if (points < upgradeCost) return;

    points -= upgradeCost;
    upgradeLevel++;

    currentPhase = Math.min(3, currentPhase + 1);

    pointsPerClick = currentPhase;

    upgradeCost += (upgradeLevel % 2 === 0) ? 100 : 50;

    setPhase();
    updateUI();
});

/*
========================================
START
========================================
*/

setPhase();
updateUI();