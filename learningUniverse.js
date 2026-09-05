/**
 * ============================================================================
 * GT Study Mentor Pro — Learning Universe (3D Spatial Educational Environment)
 * File: learningUniverse.js
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Powers the dynamic, editorial canvas background:
 * 1. Base atmospheric gradient (Midnight #050814 -> Deep Navy #0A0F24).
 * 2. 3D receding perspective grid with horizon convergence.
 * 3. Semantic CS knowledge nodes (DSA graphs, DBMS tables, CN topology, CPU gates, Math).
 * 4. Orbital JARVIS intelligence rings with gentle rotation.
 * 5. Adaptive device scaling (Reduced motion, Mobile low-power, High-FPS desktop).
 */

(function () {
  'use strict';

  let canvas, ctx;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let animId = null;
  let lastTime = 0;
  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetMouseX = width / 2;
  let targetMouseY = height / 2;

  const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // Semantic Knowledge Nodes Dataset
  const CS_SYMBOLS = ['{ }', 'O(1)', 'O(N)', '∑', 'λ', '0|1', 'π', '->', '&&', '||', '⊕'];
  const nodes = [];
  const nodeCount = isReducedMotion ? 0 : (isMobile ? 18 : 36);

  function init() {
    canvas = document.getElementById('learning-universe-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'learning-universe-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';
      canvas.style.opacity = '0.9';
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    ctx = canvas.getContext('2d');
    resize();

    window.addEventListener('resize', debounce(resize, 200));
    if (!isMobile && !isReducedMotion) {
      window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
      });
    }

    // Initialize knowledge nodes
    nodes.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.4),
        vy: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.4),
        radius: Math.random() * 2.5 + 1.5,
        type: i % 4, // 0: DSA graph, 1: DBMS node, 2: Symbol fragment, 3: Network pulse
        symbol: CS_SYMBOLS[i % CS_SYMBOLS.length],
        alpha: Math.random() * 0.45 + 0.15,
        pulse: Math.random() * Math.PI
      });
    }

    if (!isReducedMotion) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (animId) cancelAnimationFrame(animId);
        } else {
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        }
      });
      lastTime = performance.now();
      animId = requestAnimationFrame(render);
    } else {
      drawStatic();
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    if (isReducedMotion) drawStatic();
  }

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function render(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    // Smooth mouse parallax
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // 1. Atmospheric Deep Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#050814'); // Midnight
    bgGrad.addColorStop(0.5, '#070C1D');
    bgGrad.addColorStop(1, '#0A0F24'); // Deep Navy
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient radial glow behind top center (editorial focal light)
    const focalGrad = ctx.createRadialGradient(
      width * 0.5 + (mouseX - width / 2) * 0.1,
      height * 0.25 + (mouseY - height / 2) * 0.1,
      20,
      width * 0.5,
      height * 0.35,
      width * 0.65
    );
    focalGrad.addColorStop(0, 'rgba(56, 189, 248, 0.07)'); // Soft cyan glow
    focalGrad.addColorStop(0.5, 'rgba(91, 91, 214, 0.04)'); // Indigo glow
    focalGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = focalGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Receding 3D Perspective Grid
    drawPerspectiveGrid(time);

    // 3. Central Orbital JARVIS Resonance Rings
    drawOrbitalResonance(time);

    // 4. Semantic Knowledge Nodes & CS Geometry
    drawKnowledgeNodes(dt, time);

    animId = requestAnimationFrame(render);
  }

  function drawPerspectiveGrid(time) {
    const horizonY = height * 0.55;
    const vanishX = width * 0.5 + (mouseX - width / 2) * 0.08;
    const gridAlpha = isMobile ? 0.03 : 0.06;

    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${gridAlpha})`;
    ctx.lineWidth = 0.75;

    // Longitudinal perspective rays
    const rays = isMobile ? 8 : 16;
    for (let i = -rays; i <= rays; i++) {
      const bottomX = width * 0.5 + i * (width / (rays * 0.8));
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    // Horizontal depth lines (exponential perspective spacing)
    const depthSteps = isMobile ? 5 : 8;
    const offset = (time * 0.015) % 1;
    for (let j = 0; j < depthSteps; j++) {
      const t = Math.pow((j + offset) / depthSteps, 2.2);
      const y = horizonY + t * (height - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawOrbitalResonance(time) {
    const cx = width * 0.5 + (mouseX - width / 2) * 0.04;
    const cy = height * 0.35 + (mouseY - height / 2) * 0.04;
    const baseRadius = isMobile ? 90 : 160;

    ctx.save();
    ctx.lineWidth = 1;

    // Outer orbital ring
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.06)'; // Muted Violet
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseRadius, baseRadius * 0.35, time * 0.0003, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary tilted ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)'; // Soft Cyan
    ctx.beginPath();
    ctx.ellipse(cx, cy, baseRadius * 1.35, baseRadius * 0.45, -time * 0.0002 + 0.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawKnowledgeNodes(dt, time) {
    ctx.save();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // Update position
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += dt * 1.8;

      // Wrap around bounds
      if (n.x < -20) n.x = width + 20;
      if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;

      const currentAlpha = n.alpha + Math.sin(n.pulse) * 0.12;

      // Node shape based on CS domain
      if (n.type === 0) {
        // DSA Graph Node
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.05, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (n.type === 1) {
        // DBMS Cylinder / Relational Token
        ctx.strokeStyle = `rgba(13, 148, 136, ${Math.max(0.05, currentAlpha * 0.8)})`;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(n.x - 4, n.y - 3, 8, 6);
      } else if (n.type === 2 && !isMobile) {
        // Code / Math Symbol Fragment
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(129, 140, 248, ${Math.max(0.05, currentAlpha * 0.65)})`;
        ctx.fillText(n.symbol, n.x, n.y);
      } else {
        // Network Pulse Point
        ctx.fillStyle = `rgba(248, 250, 252, ${Math.max(0.04, currentAlpha * 0.5)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connect adjacent nodes if nearby (DSA tree / CN mesh edge)
      if (!isMobile) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const edgeAlpha = (1 - dist / 110) * 0.08;
            ctx.strokeStyle = `rgba(56, 189, 248, ${edgeAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }
    }
    ctx.restore();
  }

  function drawStatic() {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#050814');
    bgGrad.addColorStop(1, '#0A0F24');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.LearningUniverse = {
    init,
    resize
  };
})();
