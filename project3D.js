// ══════════════════════════════════════════════════════════════
// GT Study Mentor Pro v3.0 — project3D.js
// Flagship 3D Portfolio Project: "Vortex-3D Distributed Cluster Visualizer"
// Simulates Raft Consensus, Leader Election, Heartbeats & Network Partitions
// In Lightweight 60 FPS Canvas 3D (No heavy Three.js dependencies)
// ══════════════════════════════════════════════════════════════

const Vortex3D = (function () {
  let canvas = null;
  let ctx = null;
  let animId = null;
  let isRunning = false;

  // Camera & Orbit state
  let rotX = 0.35;
  let rotY = 0.45;
  let targetRotX = 0.35;
  let targetRotY = 0.45;
  let zoom = 320;
  let targetZoom = 320;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Raft Simulation State
  let currentTerm = 1;
  let leaderId = 'Node-1';
  let isPartitioned = false;
  let simulationSpeed = 1.0;

  let nodes = [
    { id: 'Node-1', role: 'LEADER', x: 0, y: 0, z: 0, angle: 0, term: 1, logs: 5, heartbeatTimer: 0, color: '#F59E0B', status: 'Active' },
    { id: 'Node-2', role: 'FOLLOWER', x: 0, y: 0, z: 0, angle: (2 * Math.PI / 5) * 1, term: 1, logs: 5, heartbeatTimer: 30, color: '#38BDF8', status: 'Active' },
    { id: 'Node-3', role: 'FOLLOWER', x: 0, y: 0, z: 0, angle: (2 * Math.PI / 5) * 2, term: 1, logs: 5, heartbeatTimer: 45, color: '#38BDF8', status: 'Active' },
    { id: 'Node-4', role: 'FOLLOWER', x: 0, y: 0, z: 0, angle: (2 * Math.PI / 5) * 3, term: 1, logs: 5, heartbeatTimer: 60, color: '#38BDF8', status: 'Active' },
    { id: 'Node-5', role: 'FOLLOWER', x: 0, y: 0, z: 0, angle: (2 * Math.PI / 5) * 4, term: 1, logs: 5, heartbeatTimer: 20, color: '#38BDF8', status: 'Active' }
  ];

  let packets = []; // { from, to, progress, type: 'heartbeat'|'log', color }
  let logHistory = [
    { time: '00:00:01', text: 'Cluster initialized with 5 nodes. Node-1 elected LEADER for Term 1.' }
  ];

  const RING_RADIUS = 140;

  function updateNodePositions() {
    nodes.forEach((n, i) => {
      n.x = Math.cos(n.angle) * RING_RADIUS;
      n.y = (i % 2 === 0 ? 25 : -25);
      n.z = Math.sin(n.angle) * RING_RADIUS;
    });
  }

  // 3D Projection math
  function project(x, y, z) {
    // Rotate Y
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    // Rotate X
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    // Perspective divide
    const dist = 500;
    const scale = zoom / (dist + z2);
    const px = canvas.width / 2 + x1 * scale;
    const py = canvas.height / 2 + y2 * scale;

    return { x: px, y: py, scale, depth: z2 };
  }

  function addLog(msg) {
    const time = new Date().toTimeString().split(' ')[0];
    logHistory.unshift({ time, text: msg });
    if (logHistory.length > 20) logHistory.pop();

    const list = document.getElementById('vortex-log-list');
    if (list) {
      list.innerHTML = logHistory.map(l => `
        <div style="font-size:11px;font-family:var(--font-mono);margin-bottom:4px;color:var(--text-sub);">
          <span style="color:var(--primary-light);">[${l.time}]</span> ${l.text}
        </div>`).join('');
    }
  }

  function sendHeartbeats() {
    const leader = nodes.find(n => n.role === 'LEADER');
    if (!leader || leader.status !== 'Active') return;

    nodes.forEach(target => {
      if (target.id !== leader.id && target.status === 'Active') {
        // If partitioned, don't reach minority partition (Nodes 4 & 5)
        if (isPartitioned && (target.id === 'Node-4' || target.id === 'Node-5')) return;

        packets.push({
          from: leader,
          to: target,
          progress: 0,
          type: 'heartbeat',
          color: '#F59E0B'
        });
      }
    });
  }

  let heartbeatInterval = 0;

  function tickSimulation() {
    heartbeatInterval++;
    if (heartbeatInterval % 80 === 0) {
      sendHeartbeats();
    }

    // Update packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.progress += 0.02 * simulationSpeed;
      if (p.progress >= 1) {
        // Packet arrived
        if (p.type === 'log') {
          p.to.logs += 1;
        }
        packets.splice(i, 1);
      }
    }

    // Smooth camera interpolation
    rotX += (targetRotX - rotX) * 0.1;
    rotY += (targetRotY - rotY) * 0.1;
    zoom += (targetZoom - zoom) * 0.1;
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background 3D grid plane
    ctx.save();
    ctx.strokeStyle = 'rgba(91, 91, 214, 0.07)';
    ctx.lineWidth = 1;
    const gridSize = 240;
    const gridStep = 40;
    for (let g = -gridSize; g <= gridSize; g += gridStep) {
      const p1 = project(g, 60, -gridSize);
      const p2 = project(g, 60, gridSize);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const p3 = project(-gridSize, 60, g);
      const p4 = project(gridSize, 60, g);
      ctx.beginPath();
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.stroke();
    }
    ctx.restore();

    // Draw 3D network connection lines between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const p1 = project(n1.x, n1.y, n1.z);
        const p2 = project(n2.x, n2.y, n2.z);

        const isBroken = isPartitioned && 
          (((n1.id === 'Node-4' || n1.id === 'Node-5') && (n2.id !== 'Node-4' && n2.id !== 'Node-5')) ||
          ((n2.id === 'Node-4' || n2.id === 'Node-5') && (n1.id !== 'Node-4' && n1.id !== 'Node-5')));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = isBroken ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = isBroken ? 1 : 1.5;
        if (isBroken) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw packets flying in 3D
    packets.forEach(p => {
      const fromP = project(p.from.x, p.from.y, p.from.z);
      const toP = project(p.to.x, p.to.y, p.to.z);
      const curX = fromP.x + (toP.x - fromP.x) * p.progress;
      const curY = fromP.y + (toP.y - fromP.y) * p.progress;

      ctx.beginPath();
      ctx.arc(curX, curY, p.type === 'log' ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Sort nodes by depth for correct 3D overlap rendering
    const projectedNodes = nodes.map(n => ({
      node: n,
      proj: project(n.x, n.y, n.z)
    })).sort((a, b) => b.proj.depth - a.proj.depth);

    // Draw 3D nodes
    projectedNodes.forEach(({ node, proj }) => {
      const baseRadius = 18;
      const r = Math.max(8, baseRadius * proj.scale);

      // Node shadow
      const shadowP = project(node.x, 60, node.z);
      ctx.beginPath();
      ctx.ellipse(shadowP.x, shadowP.y, r * 1.2, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();

      // Outer glow halo
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = node.role === 'LEADER' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.12)';
      ctx.fill();

      // Node sphere body
      const grad = ctx.createRadialGradient(proj.x - r * 0.3, proj.y - r * 0.3, r * 0.1, proj.x, proj.y, r);
      if (node.status !== 'Active') {
        grad.addColorStop(0, '#64748B');
        grad.addColorStop(1, '#1E293B');
      } else if (node.role === 'LEADER') {
        grad.addColorStop(0, '#FDE68A');
        grad.addColorStop(1, '#D97706');
      } else if (node.role === 'CANDIDATE') {
        grad.addColorStop(0, '#E9D5FF');
        grad.addColorStop(1, '#9333EA');
      } else {
        grad.addColorStop(0, '#BAE6FD');
        grad.addColorStop(1, '#0284C7');
      }

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = node.role === 'LEADER' ? '#F59E0B' : '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold ' + Math.max(9, Math.round(11 * proj.scale)) + 'px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.id, proj.x, proj.y - r - 8);

      // Node Role Badge
      ctx.font = '600 ' + Math.max(8, Math.round(9 * proj.scale)) + 'px Inter, sans-serif';
      ctx.fillStyle = node.role === 'LEADER' ? '#FBBF24' : node.role === 'CANDIDATE' ? '#C084FC' : '#7DD3FC';
      ctx.fillText(node.role, proj.x, proj.y + r + 14);

      // Log count
      ctx.font = '500 9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`Logs: ${node.logs}`, proj.x, proj.y + r + 26);
    });
  }

  function loop() {
    if (!isRunning) return;
    tickSimulation();
    render();
    animId = requestAnimationFrame(loop);
  }

  function setupEvents() {
    if (!canvas) return;
    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.008;
      targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX));
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      targetZoom += (e.deltaY < 0 ? 30 : -30);
      targetZoom = Math.max(160, Math.min(500, targetZoom));
    }, { passive: false });

    // Touch support for mobile
    let lastTouchX = 0, lastTouchY = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        targetRotY += dx * 0.01;
        targetRotX += dy * 0.01;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    });
  }

  return {
    init: function (canvasId) {
      canvas = document.getElementById(canvasId);
      if (!canvas) return;
      ctx = canvas.getContext('2d');

      // Adjust canvas resolution
      const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
      canvas.width = Math.min(840, rect.width || 760);
      canvas.height = 420;

      updateNodePositions();
      setupEvents();
      isRunning = true;
      cancelAnimationFrame(animId);
      loop();
      this.updateHUD();
    },

    stop: function () {
      isRunning = false;
      cancelAnimationFrame(animId);
    },

    // ── Interactive Fault Injection & Raft Controls ──
    proposeClientWrite: function () {
      const leader = nodes.find(n => n.role === 'LEADER');
      if (!leader || leader.status !== 'Active') {
        addLog('⚠️ Write rejected: No active cluster LEADER elected!');
        return;
      }

      leader.logs += 1;
      addLog(`📝 Client write proposed to ${leader.id}. Replicating to followers...`);

      // Spawn replication packets
      nodes.forEach(target => {
        if (target.id !== leader.id && target.status === 'Active') {
          if (isPartitioned && (target.id === 'Node-4' || target.id === 'Node-5')) return;
          packets.push({
            from: leader,
            to: target,
            progress: 0,
            type: 'log',
            color: '#10B981'
          });
        }
      });
      this.updateHUD();
    },

    killLeader: function () {
      const leader = nodes.find(n => n.role === 'LEADER');
      if (!leader) return;

      leader.role = 'FOLLOWER';
      leader.status = 'Crashed';
      addLog(`💥 Leader ${leader.id} crashed! Heartbeats ceased. Follower election timeout triggered.`);

      // Elect new leader after timeout
      setTimeout(() => {
        const active = nodes.filter(n => n.status === 'Active');
        if (active.length === 0) return;
        currentTerm += 1;
        const nextLeader = active[0];
        nextLeader.role = 'LEADER';
        nextLeader.term = currentTerm;
        leaderId = nextLeader.id;
        addLog(`👑 ${nextLeader.id} received majority votes and is elected LEADER for Term ${currentTerm}!`);
        Vortex3D.updateHUD();
      }, 1200);

      this.updateHUD();
    },

    togglePartition: function () {
      isPartitioned = !isPartitioned;
      if (isPartitioned) {
        addLog('⚡ Network partition injected: Majority {N1, N2, N3} | Minority {N4, N5}.');
      } else {
        addLog('🔄 Network partition healed. Cluster reconnected with single linear log.');
        nodes.forEach(n => { n.status = 'Active'; });
      }
      this.updateHUD();
    },

    resetCluster: function () {
      currentTerm = 1;
      isPartitioned = false;
      nodes.forEach((n, i) => {
        n.role = i === 0 ? 'LEADER' : 'FOLLOWER';
        n.term = 1;
        n.logs = 5;
        n.status = 'Active';
      });
      leaderId = 'Node-1';
      packets = [];
      addLog('🔄 Cluster state reset to baseline (5 nodes, 1 leader, Term 1).');
      this.updateHUD();
    },

    updateHUD: function () {
      const termEl = document.getElementById('vortex-hud-term');
      if (termEl) termEl.textContent = 'Term ' + currentTerm;

      const leaderEl = document.getElementById('vortex-hud-leader');
      if (leaderEl) {
        const activeLeader = nodes.find(n => n.role === 'LEADER');
        leaderEl.textContent = activeLeader ? activeLeader.id : 'None (Electing...)';
        leaderEl.style.color = activeLeader ? '#F59E0B' : '#EF4444';
      }

      const quorumEl = document.getElementById('vortex-hud-quorum');
      if (quorumEl) {
        quorumEl.textContent = isPartitioned ? 'Split-Brain Protected (3/5 Quorum)' : 'Full Quorum (5/5)';
        quorumEl.style.color = isPartitioned ? 'var(--warning)' : 'var(--success)';
      }

      const partBtn = document.getElementById('vortex-partition-btn');
      if (partBtn) {
        partBtn.textContent = isPartitioned ? '🔄 Heal Partition' : '⚡ Split Partition';
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.Vortex3D = Vortex3D;
}
