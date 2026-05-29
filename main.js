// =====================
// NAV: SCROLL + SECCIÓN ACTIVA
// =====================
const nav = document.querySelector('header nav');
const navLinks = document.querySelectorAll('header nav ul li a');

// Transparente → opaco al hacer scroll
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Marcar sección activa con IntersectionObserver
const secciones = document.querySelectorAll('main section[id], footer[id]');

const observador = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.remove('activo');
                if (link.getAttribute('href') === `#${entry.target.id}`) {
                    link.classList.add('activo');
                }
            });
        }
    });
}, { threshold: 0.35 });

secciones.forEach(s => observador.observe(s));

// =====================
// FORMULARIO DE CONTACTO
// =====================
const form = document.getElementById('form-contacto');
const toast = document.getElementById('toast');
let toastTimer;

form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = new FormData(form);
    data.append('access_key', '465284eb-a1c9-4fd9-836b-81876c5b094c');

    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: data
        });

        if (res.ok) {
            form.reset();
            showToast('success');
        } else {
            showToast('error');
        }
    } catch {
        showToast('error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar';
    }
});

function showToast(tipo) {
    clearTimeout(toastTimer);

    const icono = toast.querySelector('.toast-icon');
    const titulo = toast.querySelector('strong');
    const subtitulo = toast.querySelector('span:last-child');

    if (tipo === 'success') {
        icono.textContent = '✦';
        titulo.textContent = '¡Mensaje enviado!';
        subtitulo.textContent = 'Me voy a poner en contacto pronto.';
        toast.classList.remove('toast-error');
    } else {
        icono.textContent = '✕';
        titulo.textContent = 'Algo salió mal';
        subtitulo.textContent = 'Intentá de nuevo en un momento.';
        toast.classList.add('toast-error');
    }

    toast.classList.add('toast-visible');
    toastTimer = setTimeout(() => toast.classList.remove('toast-visible'), 4500);
}

// =====================
// STARFIELD
// =====================
(function () {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');

    const COLORS = [
        'rgba(255,255,255,{a})',
        'rgba(255,255,255,{a})',
        'rgba(255,255,255,{a})',
        'rgba(129,140,248,{a})',
        'rgba(192,132,252,{a})',
    ];

    let W, H, stars = [], mouse = { x: 0, y: 0 };

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = document.documentElement.scrollHeight;
    }

    function randomColor(alpha) {
        return COLORS[Math.floor(Math.random() * COLORS.length)]
            .replace('{a}', alpha);
    }

    function createStar() {
        const radius = Math.random() < 0.15
            ? Math.random() * 1.8 + 1.2
            : Math.random() * 0.9 + 0.2;

        const baseAlpha = Math.random() * 0.5 + 0.25;

        return {
            x:            Math.random() * W,
            y:            Math.random() * H,
            radius,
            baseAlpha,
            alpha:        baseAlpha,
            vx:           (Math.random() - 0.5) * 0.12,
            vy:           (Math.random() - 0.5) * 0.12,
            twinkleSpeed: Math.random() * 0.008 + 0.003,
            twinkleDir:   Math.random() < 0.5 ? 1 : -1,
            depth:        Math.random(),
            color:        randomColor(1),
            isAccent:     Math.random() < 0.12,
        };
    }

    function init() {
        resize();
        const count = Math.floor((W * H) / 6000);
        stars = Array.from({ length: count }, createStar);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        const scrollY = window.scrollY;
        const px = (mouse.x / W - 0.5);
        const py = (mouse.y / H - 0.5);

        for (const s of stars) {
            s.alpha += s.twinkleSpeed * s.twinkleDir;
            if (s.alpha > s.baseAlpha + 0.25 || s.alpha < s.baseAlpha - 0.2) {
                s.twinkleDir *= -1;
            }
            s.alpha = Math.max(0.05, Math.min(1, s.alpha));

            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x = W;
            if (s.x > W) s.x = 0;
            if (s.y < 0) s.y = H;
            if (s.y > H) s.y = 0;

            const ox    = px * s.depth * 18;
            const oy    = py * s.depth * 18;
            const drawX = s.x + ox;
            const drawY = s.y + oy - scrollY * s.depth * 0.05;

            if (s.isAccent && s.radius > 1) {
                const grd  = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, s.radius * 4);
                const base = s.color.includes('129') ? '129,140,248' : '192,132,252';
                grd.addColorStop(0, `rgba(${base},${(s.alpha * 0.35).toFixed(2)})`);
                grd.addColorStop(1, `rgba(${base},0)`);
                ctx.beginPath();
                ctx.arc(drawX, drawY, s.radius * 4, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(drawX, drawY, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = s.isAccent
                ? s.color.replace('rgba(', '').replace('1)', `${s.alpha.toFixed(2)})`).replace(/^/, 'rgba(')
                : `rgba(255,255,255,${s.alpha.toFixed(2)})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('resize', () => {
        init();
    });

    init();
    draw();
})();
