// =========================================================
// SHARED NAVIGATION, HERO SLIDER & FOOTER
// =========================================================
function initSiteChrome() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');

  if (toggleBtn && mobileDrawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      toggleBtn.setAttribute(
        'aria-label',
        isOpen ? 'Close navigation menu' : 'Open navigation menu'
      );
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const heroTrack = document.getElementById('hero-info-track');
  if (heroTrack && heroTrack.firstElementChild) {
    const clone = heroTrack.firstElementChild.cloneNode(true);
    if (clone instanceof HTMLElement) {
      clone.setAttribute('aria-hidden', 'true');
      heroTrack.appendChild(clone);
      heroTrack.classList.add('is-animating');
    }
  }

  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

// =========================================================
// STUDENT PLANNER (planner.html)
// =========================================================
const PLANNER_STORAGE_KEY = 'ezekiel_student_planner_tasks_v1';

const DEFAULT_PLANNER_TASKS = [
  {
    id: 'task-1',
    title: 'Review Computer Science module readings',
    priority: 'High',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Outline database schema notes for Poultry Farm concept',
    priority: 'Medium',
    completed: false,
  },
];

function loadPlannerTasks() {
  try {
    const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (!raw) return DEFAULT_PLANNER_TASKS.slice();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PLANNER_TASKS.slice();
  } catch {
    return DEFAULT_PLANNER_TASKS.slice();
  }
}

function savePlannerTasks(tasks) {
  try {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors
  }
}

function createTrashIconSvg() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '17');
  svg.setAttribute('height', '17');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.9');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const path1 = document.createElementNS(ns, 'polyline');
  path1.setAttribute('points', '3 6 5 6 21 6');
  const path2 = document.createElementNS(ns, 'path');
  path2.setAttribute('d', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6');
  const path3 = document.createElementNS(ns, 'path');
  path3.setAttribute('d', 'M10 11v6');
  const path4 = document.createElementNS(ns, 'path');
  path4.setAttribute('d', 'M14 11v6');
  const path5 = document.createElementNS(ns, 'path');
  path5.setAttribute('d', 'M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2');

  svg.appendChild(path1);
  svg.appendChild(path2);
  svg.appendChild(path3);
  svg.appendChild(path4);
  svg.appendChild(path5);
  return svg;
}

function initPlanner() {
  const form = document.getElementById('planner-form');
  const titleInput = document.getElementById('task-title');
  const priorityInput = document.getElementById('task-priority');
  const titleError = document.getElementById('task-title-error');
  const listEl = document.getElementById('task-list');

  if (!form || !listEl) return;

  let tasks = loadPlannerTasks();

  function render() {
    listEl.innerHTML = '';

    if (tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No tasks added yet. Use the form to add a task.';
      listEl.appendChild(empty);
      return;
    }

    tasks.forEach((task) => {
      const row = document.createElement('article');
      row.className = `task-row${task.completed ? ' is-completed' : ''}`;

      const main = document.createElement('div');
      main.className = 'task-main';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = Boolean(task.completed);
      checkbox.setAttribute('aria-label', `Mark "${task.title}" as completed`);
      checkbox.addEventListener('change', () => {
        tasks = tasks.map((t) =>
          t.id === task.id ? { ...t, completed: checkbox.checked } : t
        );
        savePlannerTasks(tasks);
        render();
      });

      const titleEl = document.createElement('h3');
      titleEl.className = 'task-title';
      titleEl.textContent = task.title;

      main.appendChild(checkbox);
      main.appendChild(titleEl);

      const rightControls = document.createElement('div');
      rightControls.className = 'task-right-controls';

      const priority = task.priority || 'Medium';
      const priorityBadge = document.createElement('span');
      const level = priority.toLowerCase();
      priorityBadge.className = `priority-badge priority-badge--${
        level === 'high' || level === 'medium' || level === 'low' ? level : 'medium'
      }`;
      priorityBadge.textContent = priority;

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'task-delete-glass';
      deleteBtn.setAttribute('aria-label', `Delete "${task.title}"`);
      deleteBtn.title = 'Delete task';
      deleteBtn.appendChild(createTrashIconSvg());
      deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        savePlannerTasks(tasks);
        render();
      });

      rightControls.appendChild(priorityBadge);
      rightControls.appendChild(deleteBtn);

      row.appendChild(main);
      row.appendChild(rightControls);
      listEl.appendChild(row);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput ? titleInput.value.trim() : '';

    if (!title) {
      if (titleError) titleError.textContent = 'Please enter a task.';
      if (titleInput) titleInput.focus();
      return;
    }

    if (titleError) titleError.textContent = '';

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      priority: priorityInput ? priorityInput.value : 'Medium',
      completed: false,
    };

    tasks = [newTask, ...tasks];
    savePlannerTasks(tasks);
    form.reset();
    if (priorityInput) priorityInput.value = 'Medium';
    render();
  });

  if (titleInput && titleError) {
    titleInput.addEventListener('input', () => {
      if (titleInput.value.trim()) {
        titleError.textContent = '';
      }
    });
  }

  render();
}

// =========================================================
// CONTACT FORM (contact.html)
// =========================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');

  const nameError = document.getElementById('error-name');
  const emailError = document.getElementById('error-email');
  const subjectError = document.getElementById('error-subject');
  const messageError = document.getElementById('error-message');

  const feedbackBox = document.getElementById('contact-feedback');
  const feedbackPreview = document.getElementById('contact-preview');
  const copyBtn = document.getElementById('copy-message-btn');
  const resetBtn = document.getElementById('reset-contact-btn');

  if (!form) return;

  let lastFormattedText = '';

  function clearErrors() {
    [nameError, emailError, subjectError, messageError].forEach((el) => {
      if (el) el.textContent = '';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    let valid = true;

    if (!name) {
      if (nameError) nameError.textContent = 'Please enter your name.';
      valid = false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      valid = false;
    }

    if (!subject) {
      if (subjectError) subjectError.textContent = 'Please enter a subject.';
      valid = false;
    }

    if (message.length < 10) {
      if (messageError) {
        messageError.textContent = 'Please write a message of at least 10 characters.';
      }
      valid = false;
    }

    if (!valid) return;

    lastFormattedText = [
      `To: Ezekiel Johnson Tunde ([Your email address])`,
      `From: ${name} <${email}>`,
      `Subject: ${subject}`,
      '',
      message,
    ].join('\n');

    if (feedbackPreview) {
      feedbackPreview.textContent = lastFormattedText;
    }

    form.hidden = true;
    if (feedbackBox) {
      feedbackBox.hidden = false;
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!lastFormattedText) return;
      try {
        await navigator.clipboard.writeText(lastFormattedText);
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Message';
        }, 2000);
      } catch {
        copyBtn.textContent = 'Copy Unavailable';
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      clearErrors();
      form.hidden = false;
      if (feedbackBox) {
        feedbackBox.hidden = true;
      }
    });
  }
}

// =========================================================
// INITIALIZE APPLICATION
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  initSiteChrome();
  initPlanner();
  initContactForm();
});
