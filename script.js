const container = document.getElementById('background-container');
const flowerCount = 30;

const flowerPaths = [
    "M25,5 C30,15 45,15 45,25 C45,35 35,45 25,45 C15,45 5,35 5,25 C5,15 20,15 25,5 Z", // Simple flower
    "M25,0 C35,10 50,10 50,25 C50,40 35,50 25,50 C15,50 0,40 0,25 C0,10 15,0 25,0 Z", // Rounder blossom
    "M25,5 L30,20 L45,20 L35,30 L40,45 L25,35 L10,45 L15,30 L5,20 L20,20 Z" // Star-like flower
];

const colors = ['#ffb7c5', '#ff9a9e', '#fad0c4', '#ffdde1', '#ee9ca7'];

function createFlower() {
    const flower = document.createElement('div');
    flower.className = 'flower';

    const size = Math.random() * 30 + 20; // 20px to 50px
    const left = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 5 + 10; // 10s to 15s
    const delay = Math.random() * 10;
    const rotation = (Math.random() - 0.5) * 720; // -360 to 360
    const drift = (Math.random() - 0.5) * 200; // -100px to 100px
    const path = flowerPaths[Math.floor(Math.random() * flowerPaths.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    flower.style.left = `${left}%`;
    flower.style.width = `${size}px`;
    flower.style.height = `${size}px`;
    flower.style.setProperty('--duration', `${duration}s`);
    flower.style.setProperty('--rotation', `${rotation}deg`);
    flower.style.setProperty('--drift', `${drift}px`);
    flower.style.animationDelay = `${delay}s`;

    flower.innerHTML = `
        <svg viewBox="0 0 50 50" width="100%" height="100%">
            <path d="${path}" fill="${color}" />
        </svg>
    `;

    container.appendChild(flower);

    // Remove flower after animation finishes to keep DOM clean
    setTimeout(() => {
        flower.remove();
        createFlower();
    }, (duration + delay) * 1000);
}

// Initial spawn
for (let i = 0; i < flowerCount; i++) {
    createFlower();
}

// --- CONFIGURATION ---
// 1. EDIT GIFTS: Change names and emojis here.
// 2. EDIT CHANCES: Set mode to 'weighted' and update the weights (sum should ideally be 100).
// 3. EDIT ORDER: Set mode to 'sequential' to pick gifts in the order they appear.
const CONFIG = {
    mode: 'sequential', // Options: 'random', 'weighted', 'sequential'
    gifts: [
        { name: "= 💎 *0*", emoji: "🎁" },
        { name: "= 🎒 Meow", emoji: "🎒" },
        { name: "= 🌐 https://hydria-88yj.onrender.com", emoji: "🌐" }
    ],
    weights: [50, 35, 15] // Only used if mode is 'weighted'
};

// --- STATE ---
let currentRotation = 0;
let availableIndices = [0, 1, 2]; // Track gifts that haven't been picked

// --- INITIALIZATION ---
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const resultMsg = document.getElementById('result-message');
const cabins = document.querySelectorAll('.wheel-cabin');

// Emojis are now read directly from your index.html! 
// No need to edit emojis in the CONFIG object anymore.

function updateCabins(rotation) {
    const style = getComputedStyle(document.documentElement);
    const radius = style.getPropertyValue('--wheel-radius').trim();
    cabins.forEach((cabin, index) => {
        const cabinAngle = index * 120; // 0, 120, 240
        cabin.style.transform = `rotate(${cabinAngle}deg) translateY(${radius}) rotate(${-cabinAngle - rotation}deg)`;
    });
}

function getWinnerIndex() {
    if (availableIndices.length === 0) return -1;

    if (CONFIG.mode === 'sequential') {
        return availableIndices[0];
    }

    if (CONFIG.mode === 'weighted') {
        const currentWeights = availableIndices.map(i => CONFIG.weights[i] || 0);
        const totalWeight = currentWeights.reduce((a, b) => a + b, 0);

        let random = Math.random() * totalWeight;
        for (let i = 0; i < availableIndices.length; i++) {
            const weight = currentWeights[i];
            if (random < weight) return availableIndices[i];
            random -= weight;
        }
    }

    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIndex];
}

updateCabins(0);

spinBtn.addEventListener('click', () => {
    const winnerIndex = getWinnerIndex();

    if (winnerIndex === -1) {
        resultMsg.textContent = "All gifts collected!";
        spinBtn.disabled = true;
        return;
    }

    spinBtn.disabled = true;
    resultMsg.textContent = "Spinning...";

    // Calculate exact rotation for 3 segments (120deg each)
    const targetNormalizedRotation = (90 - (winnerIndex * 120) + 360) % 360;
    const fullRotations = (5 + Math.floor(Math.random() * 3)) * 360;
    const currentNormalized = currentRotation % 360;
    let rotationToAdd = (targetNormalizedRotation - currentNormalized + 360) % 360;
    if (rotationToAdd < 360) rotationToAdd += fullRotations;

    currentRotation += rotationToAdd;

    // Apply animation
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    updateCabins(currentRotation);

    setTimeout(() => {
        // Mark as picked
        const winningCabin = cabins[winnerIndex];
        const winningEmoji = winningCabin.textContent;

        availableIndices = availableIndices.filter(i => i !== winnerIndex);
        winningCabin.classList.add('picked');

        // Show result
        const winner = CONFIG.gifts[winnerIndex];
        let displayName = winner.name;

        // If the name contains a link, wrap it in an anchor tag
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        displayName = displayName.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);

        resultMsg.innerHTML = `You won: <span>${winningEmoji} ${displayName}</span>!`;
        resultMsg.style.transform = 'scale(1.2)';
        setTimeout(() => resultMsg.style.transform = 'scale(1)', 200);

        // Check if finished
        if (availableIndices.length === 0) {
            spinBtn.disabled = true;
            spinBtn.textContent = "Finished!";
            setTimeout(() => {
                resultMsg.innerHTML += "<br><small>All gifts have been collected! ✨</small>";
            }, 500);
        } else {
            spinBtn.disabled = false;
        }
    }, 5000);
});
