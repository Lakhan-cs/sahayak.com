// ---- service category data ----
const services = [
  { name: 'Painter', bg: 'bg-purple', icon: '<path d="M9 3h6l1 4H8z"/><path d="M8 7h8v6a2 2 0 0 1-2 2h-1v5a1 1 0 0 1-2 0v-5h-1a2 2 0 0 1-2-2z"/>' },
  { name: 'AC repair', bg: 'bg-amber', icon: '<rect x="2" y="6" width="20" height="9" rx="2"/><path d="M6 19v-4M10 19v-4M14 19v-4M18 19v-4"/>' },
  { name: 'Cleaners', bg: 'bg-purple', icon: '<path d="M4 4l7 7"/><path d="M9 3l4 4-8 8-4-1 1-4z"/><path d="M15 9l6 6-2 2-6-6z"/>' },
  { name: 'Gardeners', bg: 'bg-amber', icon: '<path d="M12 22s8-4.5 8-11.8A8 8 0 0 0 4 10.2C4 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="2.5"/>' },
  { name: 'Drivers', bg: 'bg-purple', icon: '<path d="M3 13l2-5a2 2 0 0 1 2-1.4h10A2 2 0 0 1 19 8l2 5"/><rect x="2" y="13" width="20" height="6" rx="2"/><circle cx="7" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/>' },
  { name: 'Electrician', bg: 'bg-amber', icon: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>' },
  { name: 'Plumbers', bg: 'bg-purple', icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a4 4 0 0 1-4.8 4.8L7 19l-4-1 1-4L13.7 4.7a4 4 0 0 1 4.8 4.8"/>' },
  { name: 'Cooking', bg: 'bg-amber', icon: '<path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M8 12V7a4 4 0 0 1 8 0v5"/><path d="M2 12h20"/>' },
  { name: 'Pest control', bg: 'bg-purple', icon: '<circle cx="12" cy="13" r="3"/><path d="M12 4v3M6 8l2 2M18 8l-2 2M4 15h3M17 15h3M8 20l1.5-3M16 20l-1.5-3"/>' },
  { name: 'Tech help', bg: 'bg-amber', icon: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>' }
];

const grid = document.getElementById('serviceGrid');
grid.innerHTML = services.map(s => `
    <div class="service-card" data-page="login.html" data-service="${s.name}">
      <div class="service-ic ${s.bg}" >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      </div>
      <p>${s.name}</p>
    </div>
  `).join('');
let isexpanded = false;
const servicecard = document.querySelectorAll(".service-card");
const view = document.querySelector(".view-all")
servicecard.forEach((cards, index) => {
  if (index >= 4) {
    cards.hidden = true;
  };
});

view.addEventListener("click", () => {

  if (!isexpanded) {
    servicecard.forEach((cards) => {
      cards.hidden = false;
    });
    view.innerHTML = "view less"
    isexpanded = true;
  }


  else {
    servicecard.forEach((cards, index) => {
      if (index >= 4) {
        cards.hidden = true;
      };
    });
    view.innerHTML = "View all"
    isexpanded = false;
  };
});




// ---- scroll reveal ----
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('.service-card, .stat-card');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 40 % 400);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(t => io.observe(t));
} else {
  revealTargets.forEach(t => t.classList.add('in'));
}

// ---- hero collage parallax tilt ----
const heroVisual = document.getElementById('heroVisual');
const cards = heroVisual.querySelectorAll('.collage-card');
const baseRot = [-7, 6, -4, 9];
if (!reduceMotion) {
  heroVisual.addEventListener('mousemove', (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cards.forEach((card, i) => {
      const depth = (i + 1) * 6;
      card.style.transform = `rotate(${baseRot[i]}deg) translate(${px * depth}px, ${py * depth}px)`;
    });
  });
  heroVisual.addEventListener('mouseleave', () => {
    cards.forEach((card, i) => {
      card.style.transform = `rotate(${baseRot[i]}deg) translate(0,0)`;
    });
  });
}


servicecard.forEach((cards) => {
  cards.addEventListener("click", () => {
    window.location.href = cards.dataset.page;
 });
})

