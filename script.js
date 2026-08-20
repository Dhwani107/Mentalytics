const form = document.getElementById('predict-form');
const submitBtn = document.getElementById('submit-btn');
const scoreNumber = document.getElementById('score-number');
const scoreBand = document.getElementById('score-band');
const scoreContext = document.getElementById('score-context');
const resetBtn = document.getElementById('reset-btn');
const stressButtons = document.querySelectorAll('.seg-btn');
const hiddenStress = document.getElementById('stress_level');
const gaugePath = document.getElementById('gauge-fill');

function setButtonLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('is-loading', isLoading);
}

function getValidationMessage(field) {
  const value = field.value.trim();
  const name = field.name;

  if (!value && field.required) {
    return 'This field is required.';
  }

  if (name === 'age') {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < 10 || numeric > 100) {
      return 'Age must be between 10 and 100.';
    }
  }

  if (name === 'avg_daily_usage_hours' || name === 'study_hours' || name === 'physical_activity_hours' || name === 'sleep_hours_per_night') {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 24) {
      return 'Value must be between 0 and 24.';
    }
  }

  if (name === 'daily_unlocks') {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < 0) {
      return 'Unlocks cannot be negative.';
    }
  }

  if (name === 'stress_level' && !value) {
    return 'Please choose a stress level.';
  }

  return '';
}

function clearFieldError(field) {
  const errorNode = document.querySelector(`.error-msg[data-for="${field.name}"]`);
  if (errorNode) {
    errorNode.textContent = '';
  }
  field.classList.remove('invalid');
}

function markFieldError(field, message) {
  const errorNode = document.querySelector(`.error-msg[data-for="${field.name}"]`);
  if (errorNode) {
    errorNode.textContent = message;
  }
  field.classList.add('invalid');
}

function validateField(field) {
  const message = getValidationMessage(field);
  if (message) {
    markFieldError(field, message);
    return false;
  }

  clearFieldError(field);
  return true;
}

function validateForm() {
  let isValid = true;
  const fieldsToCheck = form.querySelectorAll('input, select');

  fieldsToCheck.forEach((field) => {
    if (field.type === 'hidden' || field.disabled) {
      return;
    }

    if (!validateField(field)) {
      isValid = false;
    }
  });

  if (!hiddenStress.value) {
    const stressError = document.querySelector('.error-msg[data-for="stress_level"]');
    if (stressError) {
      stressError.textContent = 'Please choose a stress level.';
    }
    isValid = false;
  }

  return isValid;
}

function updateStressSelection(value) {
  hiddenStress.value = value;
  stressButtons.forEach((button) => {
    const isSelected = button.dataset.value === value;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });

  const stressField = document.getElementById('stress_level');
  if (stressField) {
    clearFieldError(stressField);
  }
}

function buildPayload() {
  const payload = {};
  const formData = new FormData(form);

  for (const [key, value] of formData.entries()) {
    if (key === 'age' || key === 'daily_unlocks') {
      payload[key] = Number(value);
      continue;
    }

    if (['avg_daily_usage_hours', 'study_hours', 'physical_activity_hours', 'sleep_hours_per_night'].includes(key)) {
      payload[key] = Number(value);
      continue;
    }

    payload[key] = value;
  }

  return payload;
}

function describeScore(score) {
  if (score >= 7.5) {
    return {
      band: 'Optimal wellness',
      context: 'Your habits look highly balanced. Good sleep and active breaks support a healthy rhythm.',
      color: '#69d8a6'
    };
  }

  if (score >= 6.0) {
    return {
      band: 'Stable baseline',
      context: 'A balanced but active rhythm. Keep your daily sleep and study hours consistent.',
      color: '#7ce5cc'
    };
  }

  if (score >= 4.8) {
    return {
      band: 'Moderate pressure',
      context: 'Increased screen time or lower sleep is building pressure. Protecting your recovery time would help.',
      color: '#f7bf62'
    };
  }

  return {
    band: 'Elevated stress',
    context: 'This pattern suggests a heavier mental load. Consider reducing screen hours and prioritizing sleep.',
    color: '#ef7e76'
  };
}

function updateGauge(score) {
  const capped = Math.max(0, Math.min(10, Number(score || 0)));
  const ratio = capped / 10;
  const circumference = 477.52;
  const offset = circumference - (ratio * circumference);

  if (gaugePath) {
    gaugePath.style.strokeDasharray = `${circumference}`;
    gaugePath.style.strokeDashoffset = `${offset}`;
    gaugePath.style.strokeLinecap = 'round';

    if (capped >= 7.5) gaugePath.style.stroke = '#69d8a6';
    else if (capped >= 6.0) gaugePath.style.stroke = '#7ce5cc';
    else if (capped >= 4.8) gaugePath.style.stroke = '#f7bf62';
    else gaugePath.style.stroke = '#ef7e76';
  }
}

function renderContributingFactors(payload) {
  const grid = document.getElementById('factors-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const metrics = [
    {
      label: 'Screen Time',
      value: `${payload.avg_daily_usage_hours} hrs`,
      badge: payload.avg_daily_usage_hours >= 8 ? 'High Load' : (payload.avg_daily_usage_hours >= 4 ? 'Moderate' : 'Healthy'),
      class: payload.avg_daily_usage_hours >= 8 ? 'load-high' : (payload.avg_daily_usage_hours >= 4 ? 'load-mod' : 'load-healthy')
    },
    {
      label: 'Daily Unlocks',
      value: `${payload.daily_unlocks}`,
      badge: payload.daily_unlocks >= 100 ? 'High Load' : (payload.daily_unlocks >= 50 ? 'Moderate' : 'Healthy'),
      class: payload.daily_unlocks >= 100 ? 'load-high' : (payload.daily_unlocks >= 50 ? 'load-mod' : 'load-healthy')
    },
    {
      label: 'Nightly Sleep',
      value: `${payload.sleep_hours_per_night} hrs`,
      badge: payload.sleep_hours_per_night < 6 ? 'High Load' : (payload.sleep_hours_per_night < 8 ? 'Moderate' : 'Healthy'),
      class: payload.sleep_hours_per_night < 6 ? 'load-high' : (payload.sleep_hours_per_night < 8 ? 'load-mod' : 'load-healthy')
    },
    {
      label: 'Physical Activity',
      value: `${payload.physical_activity_hours} hrs`,
      badge: payload.physical_activity_hours < 1 ? 'High Load' : (payload.physical_activity_hours >= 2 ? 'Healthy' : 'Moderate'),
      class: payload.physical_activity_hours < 1 ? 'load-high' : (payload.physical_activity_hours >= 2 ? 'load-healthy' : 'load-mod')
    }
  ];

  metrics.forEach(metric => {
    const card = document.createElement('div');
    card.className = 'factor-card';
    card.innerHTML = `
      <span class="factor-label">${metric.label}: <strong>${metric.value}</strong></span>
      <span class="factor-badge ${metric.class}">${metric.badge}</span>
    `;
    grid.appendChild(card);
  });
}

async function handleSubmit(event) {
  if (event) {
    event.preventDefault();
  }

  if (!validateForm()) {
    scoreNumber.textContent = '—';
    scoreBand.textContent = 'Invalid Input';
    scoreBand.style.color = '#ef7e76';
    scoreContext.textContent = 'Please fix the highlighted fields and try again.';
    const statusCard = document.getElementById('status-card');
    if (statusCard) {
      statusCard.style.borderColor = 'rgba(239, 126, 118, 0.4)';
      statusCard.style.backgroundColor = 'rgba(239, 126, 118, 0.05)';
    }
    updateGauge(0);
    return;
  }

  const payload = buildPayload();
  setButtonLoading(true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Prediction request failed.');
    }

    const result = await response.json();
    const score = Number(result.predicted_mental_health_score || 0);
    const details = describeScore(score);

    scoreNumber.textContent = score.toFixed(1);
    scoreBand.textContent = details.band;
    scoreBand.style.color = details.color;
    scoreContext.textContent = details.context;

    const statusCard = document.getElementById('status-card');
    if (statusCard) {
      statusCard.style.borderColor = `${details.color}40`;
      statusCard.style.backgroundColor = `${details.color}0a`;
    }

    renderContributingFactors(payload);
    updateGauge(score);
  } catch (error) {
    scoreNumber.textContent = '—';
    scoreBand.textContent = 'Read Error';
    scoreBand.style.color = '#ef7e76';
    if (error.name === 'AbortError') {
      scoreContext.textContent = 'The prediction request timed out. Please check that the backend is running.';
    } else {
      scoreContext.textContent = error.message || 'The model could not process this request.';
    }
    const statusCard = document.getElementById('status-card');
    if (statusCard) {
      statusCard.style.borderColor = 'rgba(239, 126, 118, 0.4)';
      statusCard.style.backgroundColor = 'rgba(239, 126, 118, 0.05)';
    }
    updateGauge(0);
  } finally {
    clearTimeout(timeoutId);
    setButtonLoading(false);
  }
}

function resetForm() {
  form.reset();
  hiddenStress.value = '';
  stressButtons.forEach((button) => {
    button.classList.remove('is-selected');
    button.setAttribute('aria-pressed', 'false');
  });

  form.querySelectorAll('input, select').forEach((field) => {
    clearFieldError(field);
    field.classList.remove('invalid');
  });

  document.querySelectorAll('.error-msg').forEach((node) => {
    node.textContent = '';
  });

  // Reset results panel to initial placeholders
  scoreNumber.textContent = '—';
  scoreBand.textContent = 'Signal Pending';
  scoreBand.style.color = 'var(--muted)';
  scoreContext.textContent = 'Fill in the habits form and submit to calculate your score.';

  const statusCard = document.getElementById('status-card');
  if (statusCard) {
    statusCard.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    statusCard.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
  }

  // Reset factors to pending
  const grid = document.getElementById('factors-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="factor-card">
        <span class="factor-label">Screen Time: <strong>—</strong></span>
        <span class="factor-badge">Pending</span>
      </div>
      <div class="factor-card">
        <span class="factor-label">Daily Unlocks: <strong>—</strong></span>
        <span class="factor-badge">Pending</span>
      </div>
      <div class="factor-card">
        <span class="factor-label">Nightly Sleep: <strong>—</strong></span>
        <span class="factor-badge">Pending</span>
      </div>
      <div class="factor-card">
        <span class="factor-label">Physical Activity: <strong>—</strong></span>
        <span class="factor-badge">Pending</span>
      </div>
    `;
  }

  updateGauge(0);
}

form.addEventListener('submit', (event) => event.preventDefault());
submitBtn.addEventListener('click', handleSubmit);
resetBtn.addEventListener('click', resetForm);

stressButtons.forEach((button) => {
  button.addEventListener('click', () => {
    updateStressSelection(button.dataset.value);
  });
});

form.querySelectorAll('input, select').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('invalid')) {
      validateField(field);
    }
  });
});

updateGauge(0);
