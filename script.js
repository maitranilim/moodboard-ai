/* ── DOM refs ── */
const queryInput       = document.getElementById('queryInput');
const analyzeBtn       = document.getElementById('analyzeBtn');
const resetBtn         = document.getElementById('resetBtn');
const progressFill     = document.getElementById('progressFill');
const statusText       = document.getElementById('statusText');
const loadingDots      = document.getElementById('loadingDots');
const resultsSection   = document.getElementById('resultsSection');
const needsBars        = document.getElementById('needsBars');
const ringProgress     = document.getElementById('ringProgress');
const likelihoodText   = document.getElementById('likelihoodText');
const insightText      = document.getElementById('insightText');
const historyList      = document.getElementById('historyList');
const charCounter      = document.getElementById('charCounter');
const shareBtn         = document.getElementById('shareBtn');
const exportBtn        = document.getElementById('exportBtn');
const clearHistoryBtn  = document.getElementById('clearHistoryBtn');
const breakdownList    = document.getElementById('breakdownList');
const toast            = document.getElementById('toast');
const radarCanvas      = document.getElementById('radarCanvas');
const barsView         = document.getElementById('barsView');
const radarView        = document.getElementById('radarView');
const vizTabs          = document.querySelectorAll('.viz-tab');
const chips            = document.querySelectorAll('.chip');

/* ── Constants ── */
const NEEDS       = ['Belonging', 'Security', 'Achievement', 'Autonomy', 'Recognition'];
const CIRCUMFERENCE = 2 * Math.PI * 48;

const NEED_DESCRIPTIONS = {
  Belonging:   'A deep drive to connect, belong, and be loved. Your goal may be rooted in wanting to feel included or valued within a group or relationship.',
  Security:    'A need for stability, safety, and predictability. You may be driven by a desire to eliminate uncertainty or protect what you have.',
  Achievement: 'A hunger to accomplish, grow, and excel. This need pushes you to set ambitious targets and measure your progress against them.',
  Autonomy:    'A core desire to direct your own life, make independent choices, and escape constraints that feel limiting or suffocating.',
  Recognition: 'A desire to be seen, validated, and respected by others. Your motivation may include proving your worth or earning admiration.'
};

/* ── State ── */
const state = {
  history: [],
  lastResult: null,
  lastQuery: ''
};

/* ── Utilities ── */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function animateCounter(el, target, suffix = '%') {
  let current = 0;
  const step = target / 28;
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = `${Math.round(current)}${suffix}`;
    if (current >= target) clearInterval(interval);
  }, 28);
}

/* ── Analysis engine ── */
function computeInsights(query) {
  const lower = query.toLowerCase();
  const words  = lower.split(/\s+/).filter(Boolean);

  const cues = {
    belonging:   ['friend', 'family', 'relationship', 'lonely', 'people', 'love', 'partner', 'connect', 'together'],
    security:    ['safe', 'money', 'job', 'future', 'stability', 'risk', 'fear', 'anxious', 'secure', 'stable'],
    achievement: ['goal', 'success', 'win', 'perform', 'improve', 'achieve', 'discipline', 'build', 'productive'],
    autonomy:    ['freedom', 'independent', 'control', 'choice', 'own', 'quit', 'change', 'escape', 'self'],
    recognition: ['respect', 'validation', 'seen', 'status', 'approval', 'prove', 'admire', 'famous', 'known']
  };

  const base = 30 + clamp(words.length * 2.5, 0, 25);

  const scores = {
    Belonging:   base,
    Security:    base,
    Achievement: base,
    Autonomy:    base,
    Recognition: base
  };

  Object.entries(cues).forEach(([need, tokens]) => {
    tokens.forEach((token) => {
      if (lower.includes(token)) {
        const label = need.charAt(0).toUpperCase() + need.slice(1);
        scores[label] += 9;
      }
    });
  });

  const sentimentBooster  = lower.includes('!') || lower.includes('must') ? 6 : 0;
  const uncertaintyPenalty = lower.includes('maybe') || lower.includes('not sure') ? -5 : 0;

  NEEDS.forEach((need) => {
    scores[need] = clamp(
      Math.round(scores[need] + sentimentBooster + uncertaintyPenalty),
      12, 98
    );
  });

  const sorted     = [...NEEDS].sort((a, b) => scores[b] - scores[a]);
  const topNeed    = sorted[0];
  const secondNeed = sorted[1];

  const likelihood = clamp(
    Math.round((scores[topNeed] * 0.62 + scores[secondNeed] * 0.38) + words.length),
    18, 97
  );

  return {
    needs: NEEDS.map((name) => ({ name, score: scores[name] })),
    topNeed,
    secondNeed,
    likelihood
  };
}

/* ── Rendering ── */
function renderNeedBars(needs) {
  needsBars.innerHTML = '';

  needs
    .sort((a, b) => b.score - a.score)
    .forEach((need) => {
      const row = document.createElement('div');
      row.className = 'need-row';

      const labelEl = document.createElement('div');
      labelEl.className = 'need-label';

      const nameSpan  = document.createElement('span');
      nameSpan.textContent = need.name;

      const scoreEl = document.createElement('strong');
      scoreEl.textContent = '0%';

      labelEl.append(nameSpan, scoreEl);

      const track = document.createElement('div');
      track.className = 'need-track';

      const fill = document.createElement('div');
      fill.className = 'need-fill';

      track.appendChild(fill);
      row.append(labelEl, track);
      needsBars.appendChild(row);

      // Animate bar and counter after paint
      requestAnimationFrame(() => {
        setTimeout(() => {
          fill.style.width = `${need.score}%`;
          animateCounter(scoreEl, need.score);
        }, 80);
      });
    });
}

function renderRadarChart(needs) {
  const ctx    = radarCanvas.getContext('2d');
  const cx     = radarCanvas.width  / 2;
  const cy     = radarCanvas.height / 2;
  const radius = Math.min(cx, cy) - 28;
  const n      = needs.length;

  ctx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);

  const angles = needs.map((_, i) => (2 * Math.PI * i) / n - Math.PI / 2);

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach((pct) => {
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const x = cx + Math.cos(angle) * radius * pct;
      const y = cy + Math.sin(angle) * radius * pct;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Spokes
  angles.forEach((angle) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Data polygon
  const grad = ctx.createLinearGradient(0, 0, radarCanvas.width, radarCanvas.height);
  grad.addColorStop(0, 'rgba(122,247,255,0.65)');
  grad.addColorStop(1, 'rgba(168,166,255,0.65)');

  ctx.beginPath();
  needs.sort((a, b) => {
    const ai = NEEDS.indexOf(a.name);
    const bi = NEEDS.indexOf(b.name);
    return ai - bi;
  });

  // re-derive sorted by NEEDS order to match angles
  const ordered = NEEDS.map((name) => needs.find((n) => n.name === name));

  ordered.forEach((need, i) => {
    const pct   = need.score / 100;
    const x     = cx + Math.cos(angles[i]) * radius * pct;
    const y     = cy + Math.sin(angles[i]) * radius * pct;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#7af7ff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#eef3ff';
  ctx.font = '600 11px Manrope, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  NEEDS.forEach((name, i) => {
    const labelRadius = radius + 18;
    const x = cx + Math.cos(angles[i]) * labelRadius;
    const y = cy + Math.sin(angles[i]) * labelRadius;
    ctx.fillText(name, x, y);
  });

  // Dots
  ordered.forEach((need, i) => {
    const pct = need.score / 100;
    const x   = cx + Math.cos(angles[i]) * radius * pct;
    const y   = cy + Math.sin(angles[i]) * radius * pct;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
  });
}

function renderRing(percentage) {
  const offset = CIRCUMFERENCE * (1 - percentage / 100);
  ringProgress.style.strokeDasharray  = CIRCUMFERENCE.toFixed(2);
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE.toFixed(2); // reset first
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ringProgress.style.strokeDashoffset = offset.toFixed(2);
    });
  });
  animateCounter(likelihoodText, percentage);
}

function renderBreakdown(needs, topNeed) {
  breakdownList.innerHTML = '';
  needs
    .sort((a, b) => b.score - a.score)
    .forEach((need) => {
      const li = document.createElement('li');
      li.className = 'breakdown-item' + (need.name === topNeed ? ' top-need' : '');

      const nameEl = document.createElement('div');
      nameEl.className = 'breakdown-name';
      nameEl.textContent = need.name;

      const descEl = document.createElement('div');
      descEl.className = 'breakdown-desc';
      descEl.textContent = NEED_DESCRIPTIONS[need.name];

      li.append(nameEl, descEl);
      breakdownList.appendChild(li);
    });
}

function renderHistory() {
  historyList.innerHTML = '';

  if (!state.history.length) {
    historyList.innerHTML = '<li class="history-empty">No analyses yet.</li>';
    return;
  }

  state.history.forEach((item) => {
    const li = document.createElement('li');

    const inner = document.createElement('div');
    inner.className = 'history-item';

    const meta = document.createElement('div');
    meta.className = 'history-meta';

    const queryEl = document.createElement('div');
    queryEl.className = 'history-query';
    queryEl.textContent = item.query;
    queryEl.title = item.query;

    const detail = document.createElement('div');
    detail.className = 'history-detail';
    detail.textContent = `Top need: ${item.topNeed}  •  Goal likelihood: ${item.likelihood}%`;

    meta.append(queryEl, detail);

    const rerunBtn = document.createElement('button');
    rerunBtn.className = 'history-rerun';
    rerunBtn.textContent = 'Re-run';
    rerunBtn.title = 'Analyze this query again';
    rerunBtn.addEventListener('click', () => {
      queryInput.value = item.query;
      updateCharCounter();
      handleAnalyze();
    });

    inner.append(meta, rerunBtn);
    li.appendChild(inner);
    historyList.appendChild(li);
  });
}

/* ── Char counter ── */
function updateCharCounter() {
  const len = queryInput.value.length;
  charCounter.textContent = `${len} / 280`;
  charCounter.classList.toggle('near-limit', len >= 220 && len < 280);
  charCounter.classList.toggle('at-limit',   len >= 280);
}

/* ── Share / Export ── */
function buildResultText(query, result) {
  const lines = [
    'GoalFinder — Analysis Report',
    '─────────────────────────────',
    `Query: "${query}"`,
    '',
    'Core Need Profile:'
  ];
  result.needs
    .sort((a, b) => b.score - a.score)
    .forEach((n) => lines.push(`  ${n.name.padEnd(14)} ${n.score}%`));
  lines.push('');
  lines.push(`Goal Likelihood : ${result.likelihood}%`);
  lines.push(`Primary Driver  : ${result.topNeed}`);
  lines.push(`Secondary Driver: ${result.secondNeed}`);
  return lines.join('\n');
}

function handleShare() {
  if (!state.lastResult) return;
  const text = buildResultText(state.lastQuery, state.lastResult);
  navigator.clipboard.writeText(text)
    .then(() => showToast('Results copied to clipboard!'))
    .catch(() => showToast('Could not access clipboard.'));
}

function handleExport() {
  if (!state.lastResult) return;
  const text = buildResultText(state.lastQuery, state.lastResult);
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'goalfinder-report.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Report downloaded!');
}

/* ── Analysis flow ── */
async function animateAnalysis() {
  const stages = [
    { until: 18, text: 'Parsing intent signals...' },
    { until: 47, text: 'Mapping emotional cues...' },
    { until: 78, text: 'Estimating hidden motivations...' },
    { until: 100, text: 'Preparing visual insight report...' }
  ];

  progressFill.style.width = '0%';
  loadingDots.hidden = false;

  let progress   = 0;
  let stageIndex = 0;

  while (progress < 100) {
    progress += Math.random() * 10 + 2;
    progress  = Math.min(progress, 100);

    if (stageIndex < stages.length && progress >= stages[stageIndex].until) {
      statusText.textContent = stages[stageIndex].text;
      stageIndex += 1;
    }

    progressFill.style.width = `${progress}%`;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  loadingDots.hidden = true;
}

async function handleAnalyze() {
  const query = queryInput.value.trim();
  if (!query) {
    statusText.textContent = 'Please enter a query to analyze.';
    return;
  }

  analyzeBtn.disabled = true;
  resetBtn.disabled   = true;
  resultsSection.hidden = true;
  statusText.textContent = 'Starting analysis...';

  await animateAnalysis();

  const result = computeInsights(query);

  state.lastResult = result;
  state.lastQuery  = query;

  renderNeedBars(result.needs);
  renderRing(result.likelihood);
  renderRadarChart(result.needs);
  renderBreakdown(result.needs, result.topNeed);

  insightText.textContent =
    `Most likely driver: ${result.topNeed}. Secondary driver: ${result.secondNeed}.`;

  state.history.unshift({ query, topNeed: result.topNeed, likelihood: result.likelihood });
  state.history = state.history.slice(0, 8);
  renderHistory();

  resultsSection.hidden = false;
  statusText.textContent = 'Analysis complete. Explore your visual profile below.';

  analyzeBtn.disabled = false;
  resetBtn.disabled   = false;
}

function handleReset() {
  queryInput.value = '';
  updateCharCounter();
  progressFill.style.width = '0%';
  loadingDots.hidden = true;
  statusText.textContent = 'Ready to analyze your next query.';
  resultsSection.hidden = true;
  state.history    = [];
  state.lastResult = null;
  state.lastQuery  = '';
  renderHistory();
}

/* ── Viz tab switch ── */
vizTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    vizTabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const which = tab.dataset.tab;
    barsView.hidden  = which !== 'bars';
    radarView.hidden = which !== 'radar';

    // Redraw radar when switching to it (canvas may have been hidden)
    if (which === 'radar' && state.lastResult) {
      renderRadarChart(state.lastResult.needs);
    }
  });
});

/* ── Chips ── */
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    queryInput.value = chip.dataset.prompt;
    updateCharCounter();
    queryInput.focus();
  });
});

/* ── Event wiring ── */
analyzeBtn.addEventListener('click', handleAnalyze);
resetBtn.addEventListener('click', handleReset);
shareBtn.addEventListener('click', handleShare);
exportBtn.addEventListener('click', handleExport);
clearHistoryBtn.addEventListener('click', () => {
  state.history = [];
  renderHistory();
  showToast('History cleared.');
});

queryInput.addEventListener('input', updateCharCounter);
queryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAnalyze();
});

/* ── Init ── */
updateCharCounter();
renderHistory();
