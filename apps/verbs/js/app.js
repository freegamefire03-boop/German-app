        // ─── DATA ──────────────────────────────────────────────────────────
        const VERBS = [
            { infinitive: "sein", english: "to be", auxiliary: "sein",
              forms: { ich: "bin", du: "bist", "er/sie/es": "ist", wir: "sind", ihr: "seid", "sie/Sie": "sind" } },
            { infinitive: "haben", english: "to have", auxiliary: "haben",
              forms: { ich: "habe", du: "hast", "er/sie/es": "hat", wir: "haben", ihr: "habt", "sie/Sie": "haben" } },
            { infinitive: "werden", english: "to become", auxiliary: "sein",
              forms: { ich: "werde", du: "wirst", "er/sie/es": "wird", wir: "werden", ihr: "werdet", "sie/Sie": "werden" } },
            { infinitive: "gehen", english: "to go", auxiliary: "sein",
              forms: { ich: "gehe", du: "gehst", "er/sie/es": "geht", wir: "gehen", ihr: "geht", "sie/Sie": "gehen" } },
            { infinitive: "kommen", english: "to come", auxiliary: "sein",
              forms: { ich: "komme", du: "kommst", "er/sie/es": "kommt", wir: "kommen", ihr: "kommt", "sie/Sie": "kommen" } },
            { infinitive: "machen", english: "to do/make", auxiliary: "haben",
              forms: { ich: "mache", du: "machst", "er/sie/es": "macht", wir: "machen", ihr: "macht", "sie/Sie": "machen" } },
            { infinitive: "sagen", english: "to say", auxiliary: "haben",
              forms: { ich: "sage", du: "sagst", "er/sie/es": "sagt", wir: "sagen", ihr: "sagt", "sie/Sie": "sagen" } },
            { infinitive: "wissen", english: "to know", auxiliary: "haben",
              forms: { ich: "weiß", du: "weißt", "er/sie/es": "weiß", wir: "wissen", ihr: "wisst", "sie/Sie": "wissen" } },
            { infinitive: "sehen", english: "to see", auxiliary: "haben",
              forms: { ich: "sehe", du: "siehst", "er/sie/es": "sieht", wir: "sehen", ihr: "seht", "sie/Sie": "sehen" } },
            { infinitive: "geben", english: "to give", auxiliary: "haben",
              forms: { ich: "gebe", du: "gibst", "er/sie/es": "gibt", wir: "geben", ihr: "gebt", "sie/Sie": "geben" } },
            { infinitive: "nehmen", english: "to take", auxiliary: "haben",
              forms: { ich: "nehme", du: "nimmst", "er/sie/es": "nimmt", wir: "nehmen", ihr: "nehmt", "sie/Sie": "nehmen" } },
            { infinitive: "sprechen", english: "to speak", auxiliary: "haben",
              forms: { ich: "spreche", du: "sprichst", "er/sie/es": "spricht", wir: "sprechen", ihr: "sprecht", "sie/Sie": "sprechen" } },
            { infinitive: "lesen", english: "to read", auxiliary: "haben",
              forms: { ich: "lese", du: "liest", "er/sie/es": "liest", wir: "lesen", ihr: "lest", "sie/Sie": "lesen" } },
            { infinitive: "fahren", english: "to drive", auxiliary: "sein",
              forms: { ich: "fahre", du: "fährst", "er/sie/es": "fährt", wir: "fahren", ihr: "fahrt", "sie/Sie": "fahren" } },
            { infinitive: "laufen", english: "to run", auxiliary: "sein",
              forms: { ich: "laufe", du: "läufst", "er/sie/es": "läuft", wir: "laufen", ihr: "lauft", "sie/Sie": "laufen" } },
            { infinitive: "können", english: "can/to be able", auxiliary: "haben",
              forms: { ich: "kann", du: "kannst", "er/sie/es": "kann", wir: "können", ihr: "könnt", "sie/Sie": "können" } },
            { infinitive: "müssen", english: "must/to have to", auxiliary: "haben",
              forms: { ich: "muss", du: "musst", "er/sie/es": "muss", wir: "müssen", ihr: "müsst", "sie/Sie": "müssen" } },
            { infinitive: "wollen", english: "to want", auxiliary: "haben",
              forms: { ich: "will", du: "willst", "er/sie/es": "will", wir: "wollen", ihr: "wollt", "sie/Sie": "wollen" } },
            { infinitive: "dürfen", english: "may/to be allowed", auxiliary: "haben",
              forms: { ich: "darf", du: "darfst", "er/sie/es": "darf", wir: "dürfen", ihr: "dürft", "sie/Sie": "dürfen" } },
            { infinitive: "sollen", english: "should/to be supposed", auxiliary: "haben",
              forms: { ich: "soll", du: "sollst", "er/sie/es": "soll", wir: "sollen", ihr: "sollt", "sie/Sie": "sollen" } },
            { infinitive: "mögen", english: "to like", auxiliary: "haben",
              forms: { ich: "mag", du: "magst", "er/sie/es": "mag", wir: "mögen", ihr: "mögt", "sie/Sie": "mögen" } },
            { infinitive: "essen", english: "to eat", auxiliary: "haben",
              forms: { ich: "esse", du: "isst", "er/sie/es": "isst", wir: "essen", ihr: "esst", "sie/Sie": "essen" } },
            { infinitive: "schlafen", english: "to sleep", auxiliary: "haben",
              forms: { ich: "schlafe", du: "schläfst", "er/sie/es": "schläft", wir: "schlafen", ihr: "schlaft", "sie/Sie": "schlafen" } },
            { infinitive: "heißen", english: "to be called", auxiliary: "haben",
              forms: { ich: "heiße", du: "heißt", "er/sie/es": "heißt", wir: "heißen", ihr: "heißt", "sie/Sie": "heißen" } },
            { infinitive: "tragen", english: "to carry/wear", auxiliary: "haben",
              forms: { ich: "trage", du: "trägst", "er/sie/es": "trägt", wir: "tragen", ihr: "tragt", "sie/Sie": "tragen" } },
            { infinitive: "halten", english: "to hold/stop", auxiliary: "haben",
              forms: { ich: "halte", du: "hältst", "er/sie/es": "hält", wir: "halten", ihr: "haltet", "sie/Sie": "halten" } },
            { infinitive: "schreiben", english: "to write", auxiliary: "haben",
              forms: { ich: "schreibe", du: "schreibst", "er/sie/es": "schreibt", wir: "schreiben", ihr: "schreibt", "sie/Sie": "schreiben" } },
            { infinitive: "finden", english: "to find", auxiliary: "haben",
              forms: { ich: "finde", du: "findest", "er/sie/es": "findet", wir: "finden", ihr: "findet", "sie/Sie": "finden" } },
            { infinitive: "denken", english: "to think", auxiliary: "haben",
              forms: { ich: "denke", du: "denkst", "er/sie/es": "denkt", wir: "denken", ihr: "denkt", "sie/Sie": "denken" } },
            { infinitive: "helfen", english: "to help", auxiliary: "haben",
              forms: { ich: "helfe", du: "hilfst", "er/sie/es": "hilft", wir: "helfen", ihr: "helft", "sie/Sie": "helfen" } },
            { infinitive: "bringen", english: "to bring", auxiliary: "haben",
              forms: { ich: "bringe", du: "bringst", "er/sie/es": "bringt", wir: "bringen", ihr: "bringt", "sie/Sie": "bringen" } },
            { infinitive: "tun", english: "to do", auxiliary: "haben",
              forms: { ich: "tue", du: "tust", "er/sie/es": "tut", wir: "tun", ihr: "tut", "sie/Sie": "tun" } }
        ];

        const CUSTOM_QUIZ_SENTENCES = [
            { verb: "machen", sentence: "Was {{blank}} du heute Abend?", answer: "machst", translation: "What are you doing tonight?" },
            { verb: "sein", sentence: "Ich {{blank}} müde.", answer: "bin", translation: "I am tired." },
            { verb: "haben", sentence: "Du {{blank}} kein Geld.", answer: "hast", translation: "You have no money." },
            { verb: "gehen", sentence: "Wir {{blank}} nach Hause.", answer: "gehen", translation: "We are going home." },
            { verb: "kommen", sentence: "Woher {{blank}} du?", answer: "kommst", translation: "Where are you from?" },
            { verb: "essen", sentence: "Er {{blank}} gern Pizza.", answer: "isst", translation: "He likes to eat pizza." },
            { verb: "trinken", sentence: "Sie {{blank}} einen Kaffee.", answer: "trinkt", translation: "She is drinking a coffee." },
            { verb: "sprechen", sentence: "{{blank}} Sie Deutsch?", answer: "Sprechen", translation: "Do you speak German?" },
            { verb: "lesen", sentence: "Ich {{blank}} ein Buch.", answer: "lese", translation: "I am reading a book." },
            { verb: "schreiben", sentence: "Du {{blank}} eine E-Mail.", answer: "schreibst", translation: "You are writing an email." }
        ];

        const PRONOUNS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];

        // ─── STATE ──────────────────────────────────────────────────────────
        let idx = 0;
        let mastered = new Set();
        let sessionCount = 0;
        let streak = 0;
        let currentVerb = null;
        let checked = false;

        let customQuizData = [];
        let customQuizChecked = false;

        const LS_VERBS_MASTERED = 'chronos_mastered';
        const LS_VERBS_INDEX = 'chronos_index';
        const LS_VERBS_STREAK = 'chronos_streak';

        function loadState() {
            try {
                const m = localStorage.getItem(LS_VERBS_MASTERED);
                if (m) mastered = new Set(JSON.parse(m));
                const i = localStorage.getItem(LS_VERBS_INDEX);
                if (i !== null) idx = parseInt(i, 10);
                const s = localStorage.getItem(LS_VERBS_STREAK);
                if (s !== null) streak = parseInt(s, 10);
            } catch(e) {}
        }

        function saveState() {
            localStorage.setItem(LS_VERBS_MASTERED, JSON.stringify([...mastered]));
            localStorage.setItem(LS_VERBS_INDEX, idx.toString());
            localStorage.setItem(LS_VERBS_STREAK, streak.toString());
        }

        // ─── RENDER ──────────────────────────────────────────────────────────
        function renderStats() {
            const el = document.getElementById('statTotal');
            if (!el) return;
            el.textContent = VERBS.length;
            document.getElementById('statMastered').textContent = mastered.size;
            document.getElementById('statStreak').textContent = streak;
            document.getElementById('statSession').textContent = sessionCount;

            const pct = VERBS.length > 0 ? (mastered.size / VERBS.length) * 100 : 0;
            document.getElementById('progressFill').style.width = pct + '%';
        }

        function getNextVerb() {
            let available = [];
            for (let i = 0; i < VERBS.length; i++) {
                if (!mastered.has(i)) available.push(i);
            }
            if (available.length === 0) return null;
            if (idx >= available.length) {
                idx = 0;
            }
            return available[idx % available.length];
        }

        function loadVerb(verbIdx) {
            checked = false;
            currentVerb = verbIdx;
            const verb = VERBS[verbIdx];
            if (!verb) return;
            const btnCheck = document.getElementById('btnCheck');
            if (btnCheck) btnCheck.disabled = false;

            const badge = document.getElementById('verbBadge');
            const aux = verb.auxiliary;
            badge.className = 'verb-badge badge-' + aux;
            badge.textContent = aux === 'haben' ? 'mit haben' : aux === 'sein' ? 'mit sein' : aux;

            document.getElementById('verbInfinitive').textContent = verb.infinitive;
            document.getElementById('verbEnglish').textContent = verb.english;

            const table = document.getElementById('conjTable');
            const toConceal = Math.min(3, PRONOUNS.length);
            const indices = [...Array(PRONOUNS.length).keys()];
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            const concealSet = new Set(indices.slice(0, toConceal));

            table.innerHTML = PRONOUNS.map((pronoun, i) => {
                const form = verb.forms[pronoun];
                const concealed = concealSet.has(i);
                return `<div class="conj-row">
                    <span class="conj-pronoun">${pronoun}</span>
                    <div class="conj-form${concealed ? ' concealed' : ''}" data-pronoun="${pronoun}" data-correct="${form}">
                        ${concealed ? `<input type="text" placeholder="\u2026" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="text" />` : form}
                    </div>
                </div>`;
            }).join('');

            document.getElementById('btnNext').disabled = true;
            document.getElementById('msgArea').textContent = '';
            document.getElementById('msgArea').className = 'msg-area';
        }

        // ─── CHECK ──────────────────────────────────────────────────────────
        function vibrate(pattern) {
            if (navigator.vibrate) navigator.vibrate(pattern);
        }

        function checkAnswers() {
            if (checked) return;
            checked = true;

            const rows = document.querySelectorAll('.conj-form.concealed');
            let allCorrect = true;

            rows.forEach(row => {
                const input = row.querySelector('input');
                const correct = row.dataset.correct;
                if (!input) return;
                const val = input.value.trim().toLowerCase();
                if (val === correct.toLowerCase()) {
                    row.classList.remove('concealed');
                    row.classList.add('revealed');
                    row.textContent = correct;
                } else {
                    row.classList.remove('concealed');
                    row.classList.add('wrong');
                    row.textContent = input.value.trim() + ' \u2192 ' + correct;
                    allCorrect = false;
                }
            });

            const msg = document.getElementById('msgArea');
            if (allCorrect) {
                msg.textContent = '\u2713 Perfect!';
                msg.className = 'msg-area success';
                if (!mastered.has(currentVerb)) {
                    mastered.add(currentVerb);
                    sessionCount++;
                    streak++;
                    sessionStats.wordsPassed++;
                    saveState();
                }
                vibrate(CONFIG.VIBRATE_SUCCESS);
            } else {
                msg.textContent = '\u2717 Some incorrect \u2014 try again next time';
                msg.className = 'msg-area error';
                streak = 0;
                saveState();
                vibrate(CONFIG.VIBRATE_ERROR);
            }

            document.getElementById('btnCheck').disabled = true;
            document.getElementById('btnNext').disabled = false;
            renderStats();
        }

        // ─── NAVIGATION ─────────────────────────────────────────────────────
        function nextVerb() {
            const next = getNextVerb();
            if (next === null || next === undefined) {
                document.getElementById('mainContent').innerHTML = `
                    <div class="splash">
                        <div class="splash-icon">\uD83C\uDFC6</div>
                        <h2>Alle gelernt!</h2>
                        <p>You've mastered all ${VERBS.length} verbs! Come back for review anytime.</p>
                        <button class="start-btn" onclick="location.reload()">Review Again</button>
                    </div>`;
                return;
            }
            loadVerb(next);
        }

        // ─── MODAL ───────────────────────────────────────────────────────────
        function showModal() {
            const masteredList = [...mastered].map(i => VERBS[i].infinitive).join(', ') || 'none yet';
            document.getElementById('modalBody').innerHTML = `
                <strong>Mastered (${mastered.size}/${VERBS.length}):</strong><br>
                <span style="font-size:0.8rem;color:var(--text-dim)">${masteredList}</span>
            `;
            document.getElementById('modalOverlay').classList.add('open');
        }

        document.getElementById('btnProgress').addEventListener('click', showModal);
        document.getElementById('modalClose').addEventListener('click', () => {
            document.getElementById('modalOverlay').classList.remove('open');
        });
        document.getElementById('modalReset').addEventListener('click', () => {
            if (confirm('Reset all verb progress?')) {
                mastered.clear();
                sessionCount = 0;
                streak = 0;
                idx = 0;
                saveState();
                renderStats();
                document.getElementById('modalOverlay').classList.remove('open');
                loadVerb(getNextVerb());
            }
        });

        document.getElementById('btnStart').addEventListener('click', () => {
            document.getElementById('splashScreen').style.display = 'none';
            document.getElementById('mainContent').classList.add('visible');
            loadVerb(getNextVerb());
            if (typeof loadTimer === 'function') {
              loadTimer();
              if (!timerState.completed && !timerState.running) {
                startTimer();
              } else if (timerState.running) {
                clearInterval(timerInterval);
                timerInterval = setInterval(timerTick, 1000);
                if (timerTickCb) timerTickCb(getRemainingSeconds());
              }
            }
        });

        document.getElementById('btnCheck').addEventListener('click', checkAnswers);
        document.getElementById('btnNext').addEventListener('click', () => {
            idx++;
            nextVerb();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const main = document.getElementById('mainContent');
                if (main && main.classList.contains('visible')) {
                    if (!checked && !document.getElementById('btnCheck').disabled) {
                        checkAnswers();
                    } else if (!document.getElementById('btnNext').disabled) {
                        document.getElementById('btnNext').click();
                    }
                }
            }
        });

        function createParticles() {
            const container = document.getElementById('particles');
            if (!container) return;
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDuration = (8 + Math.random() * 12) + 's';
                p.style.animationDelay = (Math.random() * 10) + 's';
                p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
                container.appendChild(p);
            }
        }

        // ─── TIMER ──────────────────────────────────────────────────────────
        const timerPill = document.getElementById('timerPill');
        if (timerPill) {
            timerTickCb = (remaining) => {
                const display = getTimerDisplay();
                timerPill.textContent = '\u23F1 ' + display;
                timerPill.style.color = remaining <= 120 ? 'var(--orange)' : (remaining <= 60 ? 'var(--rose)' : '');
            };
        }

        // ─── CUSTOM QUIZ SENTENCE SYSTEM ─────────────────────────────────────
        function shuffleArray(arr) {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        function openAddQuizModal() {
            document.getElementById('addQuizModal').classList.add('open');
            document.getElementById('jsonPasteInput').value = '';
        }

        function closeAddQuizModal() {
            document.getElementById('addQuizModal').classList.remove('open');
        }

        function copyJsonTemplate() {
            const template = `[
  {
    "verb": "machen",
    "sentence": "Was {{blank}} du heute Abend?",
    "answer": "machst",
    "translation": "What are you doing tonight?"
  }
]`;
            navigator.clipboard.writeText(template).then(() => {
                const btn = document.getElementById('btnCopyJson');
                btn.textContent = '\u2713 Copied!';
                setTimeout(() => { btn.textContent = '\ud83d\udccb Copy'; }, 2000);
            }).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = template;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                const btn = document.getElementById('btnCopyJson');
                btn.textContent = '\u2713 Copied!';
                setTimeout(() => { btn.textContent = '\ud83d\udccb Copy'; }, 2000);
            });
        }

        function loadCustomQuiz() {
            const pasteInput = document.getElementById('jsonPasteInput');
            const raw = pasteInput.value.trim();

            let data;
            try {
                data = JSON.parse(raw);
            } catch (e) {
                if (CUSTOM_QUIZ_SENTENCES.length >= 3) {
                    data = [...CUSTOM_QUIZ_SENTENCES];
                } else {
                    alert('Invalid JSON. Please paste valid JSON or use the default quiz.');
                    return;
                }
            }

            if (!Array.isArray(data) || data.length === 0) {
                alert('JSON must be an array with at least one sentence.');
                return;
            }

            for (const item of data) {
                if (!item.verb || !item.sentence || !item.answer || !item.translation) {
                    alert('Each item must have: verb, sentence, answer, translation');
                    return;
                }
                if (!item.sentence.includes('{{blank}}')) {
                    alert('Each sentence must contain the {{blank}} placeholder.');
                    return;
                }
            }

            customQuizData = shuffleArray(data).slice(0, 3);
            closeAddQuizModal();
            renderCustomQuiz();
        }

        function renderCustomQuiz() {
            customQuizChecked = false;
            const content = document.getElementById('customQuizContent');
            const msg = document.getElementById('customQuizMsg');
            msg.textContent = '';
            msg.className = 'msg-area';

            let html = '';
            customQuizData.forEach((item, index) => {
                const parts = item.sentence.split('{{blank}}');
                html += `<div class="custom-quiz-sentence" data-index="${index}">
                    <div class="sentence-verb">${item.verb}</div>
                    <div class="sentence-text">
                        <span>${parts[0]}</span>
                        <input type="text" class="blank-input" data-index="${index}" data-answer="${item.answer}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="text" placeholder="..." />
                        <span>${parts[1] || ''}</span>
                    </div>
                    <div class="sentence-translation">${item.translation}</div>
                </div>`;
            });

            content.innerHTML = html;

            const inputs = content.querySelectorAll('.blank-input');
            inputs.forEach(input => {
                input.addEventListener('input', checkCustomQuizInputsFilled);
                input.addEventListener('click', handleCustomQuizInputClick);
            });

            document.getElementById('btnCheckCustomQuiz').disabled = true;
            document.getElementById('customQuizModal').classList.add('open');
        }

        function checkCustomQuizInputsFilled() {
            const inputs = document.querySelectorAll('#customQuizContent .blank-input');
            let allFilled = true;
            inputs.forEach(input => {
                if (input.value.trim() === '') {
                    allFilled = false;
                }
            });
            document.getElementById('btnCheckCustomQuiz').disabled = !allFilled;
        }

        function handleCustomQuizInputClick(e) {
            if (!customQuizChecked) return;
            const input = e.target;
            if (input.classList.contains('incorrect')) {
                const correctAnswer = input.dataset.answer;
                if (input.value.trim().toLowerCase() === correctAnswer.toLowerCase()) {
                    input.value = input.dataset.userAnswer || '';
                } else {
                    input.dataset.userAnswer = input.value;
                    input.value = correctAnswer;
                }
            }
        }

        function checkCustomQuizAnswers() {
            if (customQuizChecked) return;
            customQuizChecked = true;

            const inputs = document.querySelectorAll('#customQuizContent .blank-input');
            let allCorrect = true;

            inputs.forEach(input => {
                const userAnswer = input.value.trim();
                const correctAnswer = input.dataset.answer;
                input.dataset.userAnswer = userAnswer;

                if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                    input.classList.remove('incorrect');
                    input.classList.add('correct');
                    input.readOnly = true;
                } else {
                    input.classList.remove('correct');
                    input.classList.add('incorrect');
                    allCorrect = false;
                }
            });

            const msg = document.getElementById('customQuizMsg');
            if (allCorrect) {
                msg.textContent = '\u2713 Perfect! All answers correct!';
                msg.className = 'msg-area success';
                vibrate(CONFIG.VIBRATE_SUCCESS);
            } else {
                msg.textContent = '\u2717 Some incorrect \u2014 click on a wrong answer to toggle and see the correct one.';
                msg.className = 'msg-area error';
                vibrate(CONFIG.VIBRATE_ERROR);
            }

            document.getElementById('btnCheckCustomQuiz').disabled = true;
        }

        function closeCustomQuiz() {
            document.getElementById('customQuizModal').classList.remove('open');
            customQuizData = [];
            customQuizChecked = false;
        }

        document.getElementById('btnAddQuiz').addEventListener('click', openAddQuizModal);
        document.getElementById('btnCancelQuiz').addEventListener('click', closeAddQuizModal);
        document.getElementById('btnCopyJson').addEventListener('click', copyJsonTemplate);
        document.getElementById('btnLoadQuiz').addEventListener('click', loadCustomQuiz);
        document.getElementById('btnCheckCustomQuiz').addEventListener('click', checkCustomQuizAnswers);
        document.getElementById('btnCloseCustomQuiz').addEventListener('click', closeCustomQuiz);

        document.getElementById('addQuizModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('addQuizModal')) closeAddQuizModal();
        });
        document.getElementById('customQuizModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('customQuizModal')) closeCustomQuiz();
        });

        // ─── INIT ────────────────────────────────────────────────────────────
        const app = {
            init() {
                createParticles();
                loadState();
                renderStats();

                if (mastered.size >= VERBS.length) {
                    const h2 = document.getElementById('splashScreen').querySelector('h2');
                    const p = document.getElementById('splashScreen').querySelector('p');
                    if (h2) h2.textContent = '\uD83C\uDFC6 Welcome Back!';
                    if (p) p.textContent = `You've mastered all ${VERBS.length} verbs! Review them or reset your progress.`;
                }
            }
        };

        app.init();
