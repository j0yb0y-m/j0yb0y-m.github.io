/* =============================================
   Hacker Portfolio — r0g3r
   ============================================= */

// ========== TYPEWRITER ==========

const typewriterEl = document.getElementById('typewriter');
const phrases = [
  'cat /etc/passwd  # just kidding',
  'nmap -sV -sC target',
  'hydra -l admin -P rockyou.txt ssh://target',
  'python3 exploit.py --target 10.0.0.1',
  'Hello, World! (in assembly)',
  'j0yb0y@site:~$ whoami',
];
let phraseIdx = 0;
let charIdx = 0;
let isDeleting = false;
let currentText = '';

function typeEffect() {
  const currentPhrase = phrases[phraseIdx];
  const speed = isDeleting ? 30 : 80;

  if (!isDeleting) {
    currentText = currentPhrase.substring(0, charIdx + 1);
    charIdx++;
    if (charIdx === currentPhrase.length) {
      typewriterEl.textContent = currentText;
      isDeleting = true;
      setTimeout(typeEffect, 2000);
      return;
    }
  } else {
    currentText = currentPhrase.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typeEffect, 500);
      return;
    }
  }

  typewriterEl.textContent = currentText;
  setTimeout(typeEffect, speed);
}

typeEffect();

// ========== MATRIX RAIN ==========

const canvas = document.createElement('canvas');
const matrixContainer = document.getElementById('matrix-canvas');
if (matrixContainer) {
  canvas.style.display = 'block';
  matrixContainer.appendChild(canvas);
}

const ctx = canvas.getContext('2d');
let matrixDrops = [];

function initMatrix() {
  const container = document.getElementById('matrix-canvas');
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;

  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  matrixDrops = Array(columns).fill(1);
}

const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]|&^%$#@!';

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00ff41';
  ctx.font = '14px monospace';

  for (let i = 0; i < matrixDrops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * 14, matrixDrops[i] * 14);

    if (matrixDrops[i] * 14 > canvas.height && Math.random() > 0.975) {
      matrixDrops[i] = 0;
    }
    matrixDrops[i]++;
  }
}

let matrixInterval;

function startMatrix() {
  initMatrix();
  if (matrixInterval) clearInterval(matrixInterval);
  matrixInterval = setInterval(drawMatrix, 50);
}

function stopMatrix() {
  if (matrixInterval) {
    clearInterval(matrixInterval);
    matrixInterval = null;
  }
}

startMatrix();

window.addEventListener('resize', () => {
  initMatrix();
});

// ========== OBSERVER FOR SKILL ANIMATIONS ==========

const skillFills = document.querySelectorAll('.skill-fill');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'none';
        void entry.target.offsetHeight;
        entry.target.style.animation = '';
      }
    });
  },
  { threshold: 0.3 }
);

skillFills.forEach((el) => observer.observe(el));

// ========== SMOOTH NAV HIGHLIGHT ==========

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightNav() {
  let current = '';
  sections.forEach((section) => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach((link) => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--green)' : '';
  });
}

window.addEventListener('scroll', highlightNav);

// ========== CONSOLE EASTER EGG ==========

console.log(
  '%c j0yb0y ',
  'background: #00ff41; color: #000; font-size: 1.2rem; font-weight: bold; padding: 4px 8px;'
);
console.log(
  '%c Welcome to my terminal. Feel free to look around. ',
  'color: #00ff41; font-size: 0.8rem;'
);
console.log(
  '%c >_ "The quieter you become, the more you can hear." ',
  'color: #666; font-size: 0.75rem; font-style: italic;'
);
