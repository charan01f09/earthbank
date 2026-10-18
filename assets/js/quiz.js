import { QUIZ } from './data.js';

const root = document.querySelector('#quiz-content');
const progress = document.querySelector('#quiz-progress');
const scoreLine = document.querySelector('#quiz-score');
let current = 0;
let score = 0;
let locked = false;

function render() {
  const item = QUIZ[current];
  if (!item) {
    root.innerHTML = `
      <div class="quiz-finish" role="status">
        <span class="eyebrow">Field notes complete</span>
        <h3>You scored <strong>${score} / ${QUIZ.length}</strong></h3>
        <p>${score === QUIZ.length ? 'A perfect cycle.' : 'Every answer is a chance to make the connections clearer.'}</p>
        <button class="button button--outline" id="quiz-restart" type="button">Try again</button>
      </div>`;
    progress.textContent = 'Quiz complete';
    scoreLine.textContent = `${score} correct`;
    root.querySelector('#quiz-restart').addEventListener('click', () => {
      current = 0;
      score = 0;
      locked = false;
      render();
    });
    return;
  }

  locked = false;
  progress.textContent = `Question ${current + 1} of ${QUIZ.length}`;
  scoreLine.textContent = `${score} correct so far`;
  root.innerHTML = `
    <fieldset class="quiz-question">
      <legend>${item.question}</legend>
      <div class="quiz-options">${item.options.map((option, index) => `
        <button class="quiz-option" type="button" data-answer="${index}" aria-label="${option}">
          <span class="quiz-option__letter">${String.fromCharCode(65 + index)}</span><span>${option}</span>
        </button>`).join('')}
      </div>
      <div class="quiz-feedback" aria-live="polite"></div>
    </fieldset>`;

  root.querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      if (locked) return;
      locked = true;
      const isCorrect = Number(button.dataset.answer) === item.answer;
      if (isCorrect) score += 1;
      button.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
      const correctButton = root.querySelector(`[data-answer="${item.answer}"]`);
      correctButton.classList.add('is-correct');
      root.querySelector('.quiz-feedback').innerHTML = `
        <p class="${isCorrect ? 'text-success' : 'text-note'}"><strong>${isCorrect ? 'That’s right.' : 'Not quite.'}</strong> ${item.explanation}</p>
        <button class="button button--small" id="quiz-next" type="button">${current === QUIZ.length - 1 ? 'See my score' : 'Next question'} <span aria-hidden="true">→</span></button>`;
      scoreLine.textContent = `${score} correct so far`;
      root.querySelector('#quiz-next').addEventListener('click', () => {
        current += 1;
        render();
        root.querySelector('legend')?.focus?.();
      });
    });
  });
}

render();
