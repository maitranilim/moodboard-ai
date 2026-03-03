const queryInput = document.getElementById('queryInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const progressFill = document.getElementById('progressFill');
const statusText = document.getElementById('statusText');
const loadingDots = document.getElementById('loadingDots');
const resultsSection = document.getElementById('resultsSection');
const needsBars = document.getElementById('needsBars');
const ringProgress = document.getElementById('ringProgress');
const likelihoodText = document.getElementById('likelihoodText');
const insightText = document.getElementById('insightText');
const historyList = document.getElementById('historyList');

const NEEDS = ['Belonging', 'Security', 'Achievement', 'Autonomy', 'Recognition'];
const CIRCUMFERENCE = 2 * Math.PI * 48;

const state = {
  history: []
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeInsights(query) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  const cues = {
    belonging: ['friend', 'family', 'relationship', 'lonely', 'people', 'love', 'partner'],
    security: ['safe', 'money', 'job', 'future', 'stability', 'risk', 'fear', 'anxious'],
    achievement: ['goal', 'success', 'win', 'perform', 'improve', 'achieve', 'discipline'],
    autonomy: ['freedom', 'independent', 'control', 'choice', 'own', 'quit', 'change'],
    recognition: ['respect', 'validation', 'seen', 'status', 'approval', 'prove']
  };

  const base = 30 + clamp(words.length * 2.5, 0, 25);

  const scores = {
    Belonging: base,
    Security: base,
    Achievement: base,
    Autonomy: base,
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

  const sentimentBooster = lower.includes('!') || lower.includes('must') ? 6 : 0;
  const uncertaintyPenalty = lower.includes('maybe') || lower.includes('not sure') ? -5 : 0;

  NEEDS.forEach((need) => {
    scores[need] = clamp(Math.round(scores[need] + sentimentBooster + uncertaintyPenalty), 12, 98);
  });

  const sorted = [...NEEDS].sort((a, b) => scores[b] - scores[a]);
  const topNeed = sorted[0];
  const secondNeed = sorted[1];

  const likelihood = clamp(
    Math.round((scores[topNeed] * 0.62 + scores[secondNeed] * 0.38) + words.length),
    18,
    97
  );

  return {
    needs: NEEDS.map((name) => ({ name, score: scores[name] })),
    topNeed,
    secondNeed,
    likelihood
  };
}

function renderNeedBars(needs) {
  needsBars.innerHTML = '';

  needs
    .sort((a, b) => b.score - a.score)
    .forEach((need) => {
      const row = document.createElement('div');
      row.className = 'need-row';

      row.innerHTML = `
        <div class="need-label">
          <span>${need.name}</span>
          <strong>${need.score}%</strong>
        </div>
        <div class="need-track">
          <div class="need-fill" style="width: ${need.score}%"></div>
        </div>
      `;

      needsBars.appendChild(row);
    });
}

function renderRing(percentage) {
  const offset = CIRCUMFERENCE * (1 - percentage / 100);
  ringProgress.style.strokeDasharray = CIRCUMFERENCE.toFixed(2);
  ringProgress.style.strokeDashoffset = offset.toFixed(2);
  likelihoodText.textContent = `${percentage}%`;
}

function renderHistory() {
  historyList.innerHTML = '';

  if (!state.history.length) {
    historyList.innerHTML = '<li class="history-empty">No analyses yet.</li>';
    return;
  }

  state.history.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.query}</strong><br/>Top need: ${item.topNeed} • Goal likelihood: ${item.likelihood}%`;
    historyList.appendChild(li);
  });
}

async function animateAnalysis() {
  const stages = [
    { until: 18, text: 'Parsing intent signals...' },
    { until: 47, text: 'Mapping emotional cues...' },
    { until: 78, text: 'Estimating hidden motivations...' },
    { until: 100, text: 'Preparing visual insight report...' }
  ];

  progressFill.style.width = '0%';
  loadingDots.hidden = false;

  let progress = 0;
  let stageIndex = 0;

  while (progress < 100) {
    progress += Math.random() * 10 + 2;
    progress = Math.min(progress, 100);

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
  resetBtn.disabled = true;
  resultsSection.hidden = true;
  statusText.textContent = 'Starting analysis...';

  await animateAnalysis();

  const result = computeInsights(query);
  renderNeedBars(result.needs);
  renderRing(result.likelihood);
  insightText.textContent = `Most likely driver: ${result.topNeed}. Secondary driver: ${result.secondNeed}.`;

  state.history.unshift({
    query,
    topNeed: result.topNeed,
    likelihood: result.likelihood
  });
  state.history = state.history.slice(0, 8);
  renderHistory();

  resultsSection.hidden = false;
  statusText.textContent = 'Analysis complete. Explore your visual profile below.';

  analyzeBtn.disabled = false;
  resetBtn.disabled = false;
}

function handleReset() {
  queryInput.value = '';
  progressFill.style.width = '0%';
  loadingDots.hidden = true;
  statusText.textContent = 'Ready to analyze your next query.';
  resultsSection.hidden = true;
  state.history = [];
  renderHistory();
}

analyzeBtn.addEventListener('click', handleAnalyze);
resetBtn.addEventListener('click', handleReset);
queryInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleAnalyze();
  }
});

renderHistory();
