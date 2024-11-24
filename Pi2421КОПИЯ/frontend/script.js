// Структура предметов и их вопросов
const SUBJECTS = {
    philosophy: {
        name: 'Философия',
        questions: philosophyQuestionsDB
    },
    kulturology: {
        name: 'Культурология',
        questions: kulturologyQuestionsDB
    },
    psychology: {
        name: 'Психология',
        questions: psyhologyQuestionsDB
    }
};

// Объединяем все вопросы и добавляем информацию о предмете
const allQuestions = Object.entries(SUBJECTS).reduce((acc, [key, subject]) => 
    [...acc, ...subject.questions.map(q => ({...q, subject: key}))], 
[]);

// Состояние приложения
let currentQuestion = null;
let currentSubject = 'all';
let isQuizMode = false;
let quizResults = [];
let answeredQuestions = new Set();

// Функция перемешивания массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    showSection('main');
    initializeFilterHandlers();
    updateResults();
});

function showSection(section) {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = '';
    }

    if (section !== 'library') {
        const subjectFilter = document.getElementById('subjectFilter');
        const searchInput = document.getElementById('searchInput');
        const advancedFilters = document.getElementById('advancedFilters');
        
        if (subjectFilter) subjectFilter.value = 'all';
        if (searchInput) searchInput.value = '';
        if (advancedFilters) {
            const radioInputs = advancedFilters.querySelectorAll('input[type="radio"]');
            const checkboxInputs = advancedFilters.querySelectorAll('input[type="checkbox"]');
            
            radioInputs.forEach(input => {
                if (input.value === 'none') input.checked = true;
                else input.checked = false;
            });
            
            checkboxInputs.forEach(input => input.checked = false);
        }
    }

    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('librarySection').style.display = 'none';
    document.getElementById('cheatsheetSection').style.display = 'none';

    switch(section) {
        case 'main':
            document.getElementById('mainMenu').style.display = 'block';
            isQuizMode = false;
            break;
        case 'quiz':
            document.getElementById('quizSection').style.display = 'block';
            isQuizMode = true;
            startQuiz();
            break;
        case 'library':
            document.getElementById('librarySection').style.display = 'block';
            isQuizMode = false;
            break;
        case 'cheatsheet':
            document.getElementById('cheatsheetSection').style.display = 'block';
            isQuizMode = false;
            updateCheatsheet();
            break;
    }
}

function startQuiz() {
    quizResults = [];
    answeredQuestions.clear();
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    currentSubject = document.getElementById('quizSubjectSelect').value;
    nextQuestion();
}

function nextQuestion() {
    const availableQuestions = currentSubject === 'all' ? 
        allQuestions.filter(q => !answeredQuestions.has(q.question)) : 
        allQuestions.filter(q => q.subject === currentSubject && !answeredQuestions.has(q.question));

    if (availableQuestions.length === 0) {
        finishQuiz();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = {...availableQuestions[randomIndex]};
    currentQuestion.options = shuffleArray([...currentQuestion.options]);
    
    displayQuizQuestion(currentQuestion);
}

function displayQuizQuestion(question) {
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    
    questionText.textContent = question.question;
    optionsContainer.innerHTML = question.options.map(option => `
        <button class="option-btn" onclick="checkAnswer('${option}')">${option}</button>
    `).join('');
    
    document.getElementById('nextQuestion').style.display = 'none';
}

function checkAnswer(selectedAnswer) {
    const buttons = document.querySelectorAll('.option-btn');
    const nextButton = document.getElementById('nextQuestion');

    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === currentQuestion.correct_answer) {
            button.classList.add('correct');
        } else if (button.textContent === selectedAnswer && 
                   selectedAnswer !== currentQuestion.correct_answer) {
            button.classList.add('incorrect');
        }
    });

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    answeredQuestions.add(currentQuestion.question);
    
    quizResults.push({
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correct_answer,
        isCorrect: isCorrect
    });

    nextButton.style.display = 'block';
}

function finishQuiz() {
    const quizContent = document.getElementById('quizContent');
    const quizResultsDiv = document.getElementById('quizResults');
    
    quizContent.style.display = 'none';
    quizResultsDiv.style.display = 'block';

    const correctAnswers = quizResults.filter(r => r.isCorrect).length;
    
    quizResultsDiv.innerHTML = `
        <h3>Результаты викторины</h3>
        <p>Правильных ответов: ${correctAnswers} из ${quizResults.length}</p>
        <div class="results-list">
            ${quizResults.map((result, index) => `
                <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <p class="question-text">${result.question}</p>
                    
                </div>
            `).join('')}
        </div>
        <button onclick="startQuiz()" class="restart-btn">Начать заново</button>
    `;
}

function initializeFilterHandlers() {
    document.getElementById('searchInput').addEventListener('input', updateResults);
    document.getElementById('subjectFilter').addEventListener('change', updateResults);
    
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => input.addEventListener('change', updateResults));
    
    const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
    checkboxInputs.forEach(input => input.addEventListener('change', updateResults));

    const multipleAnswersFilter = document.getElementById('multipleAnswersFilter');
    const repeatedWordsInput = document.getElementById('repeatedWordsInput');
    
    if (multipleAnswersFilter && repeatedWordsInput) {
        multipleAnswersFilter.addEventListener('change', function() {
            repeatedWordsInput.disabled = !this.checked;
            if (!this.checked) {
                repeatedWordsInput.value = '';
            }
            updateResults();
        });

        repeatedWordsInput.addEventListener('input', updateResults);
    }
}

function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advancedFilters');
    const toggleButton = document.querySelector('.advanced-filters-toggle');
    
    if (advancedFilters.classList.contains('show')) {
        advancedFilters.classList.remove('show');
        toggleButton.textContent = 'Расширенные фильтры ▼';
    } else {
        advancedFilters.classList.add('show');
        toggleButton.textContent = 'Расширенные фильтры ▲';
    }
}

function updateResults() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const subject = document.getElementById('subjectFilter').value;
    const lengthFilter = document.querySelector('input[name="lengthFilter"]:checked')?.value || 'none';
    const romanFilter = document.getElementById('romanFilter')?.checked || false;
    const multipleAnswersFilter = document.getElementById('multipleAnswersFilter')?.checked || false;
    const repeatedWordsInput = document.getElementById('repeatedWordsInput')?.value.toLowerCase().trim();
    const numbersFilter = document.getElementById('numbersFilter')?.checked || false;

    let filtered = allQuestions;

    if (subject !== 'all') {
        filtered = filtered.filter(q => q.subject === subject);
    }

    if (searchText) {
        filtered = filtered.filter(q => 
            q.question.toLowerCase().includes(searchText) ||
            q.options.some(opt => opt.toLowerCase().includes(searchText))
        );
    }

    if (multipleAnswersFilter) {
        filtered = filtered.filter(q => {
            const allOptionsText = q.options.join(' ').toLowerCase();
            
            if (repeatedWordsInput) {
                return allOptionsText.split(/\s+/).filter(word => 
                    word === repeatedWordsInput
                ).length > 1;
            } else {
                const words = allOptionsText.split(/\s+/);
                return words.some(word => 
                    word.length > 3 && 
                    words.filter(w => w === word).length > 1
                );
            }
        });
    }

    if (romanFilter && subject === 'philosophy') {
        filtered = filtered.filter(q => /\b[IVXLCDM]+\b/.test(q.question));
    }

    if (numbersFilter) {
        filtered = filtered.filter(q => /\d+/.test(q.question));
    }

    filtered = filtered.map(q => ({
        ...q,
        optionsWithLength: q.options.map(opt => ({
            text: opt,
            length: opt.length,
            isCorrect: opt === q.correct_answer
        }))
    }));

    switch (lengthFilter) {
        case 'options_asc':
            filtered.forEach(q => {
                q.optionsWithLength.sort((a, b) => a.length - b.length);
            });
            break;
        case 'options_desc':
            filtered.forEach(q => {
                q.optionsWithLength.sort((a, b) => b.length - a.length);
            });
            break;
        case 'correct_asc':
            filtered.sort((a, b) => a.lengthDifference - b.lengthDifference);
            break;
        case 'correct_desc':
            filtered.sort((a, b) => b.lengthDifference - a.lengthDifference);
            break;
    }

    displayResults(filtered);
}

function displayResults(questions) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (document.getElementById('mainMenu').style.display === 'block') {
        return;
    }
    
    if (questions.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">Вопросы не найдены</p>';
        return;
    }

    resultsContainer.innerHTML = questions.map(q => `
        <div class="question-item">
            <p class="question-text">${q.question}</p>
            <div class="options-list">
                ${q.optionsWithLength.map(option => `
                    <div class="option ${option.isCorrect ? 'correct' : ''}">
                        ${option.text}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Функции для режима шпаргалки
function updateCheatsheet() {
    const subject = document.getElementById('cheatsheetSubject').value;
    const isCompact = document.getElementById('compactView').checked;
    const searchText = document.getElementById('cheatsheetSearch').value.toLowerCase();
    const cheatsheetContent = document.getElementById('cheatsheetContent');
    
    let questions = [];
    if (subject === 'all') {
        questions = allQuestions;
    } else {
        questions = allQuestions.filter(q => q.subject === subject);
    }

    // Добавляем фильтрацию по поисковому запросу
    if (searchText) {
        questions = questions.filter(q => 
            q.question.toLowerCase().includes(searchText) || 
            q.correct_answer.toLowerCase().includes(searchText)
        );
    }

    // Сортируем вопросы по длине для компактности
    questions.sort((a, b) => a.question.length - b.question.length);

    cheatsheetContent.innerHTML = questions.length > 0 ? 
        questions.map(q => `
            <div class="cheatsheet-item">
                <span class="cheatsheet-question">${q.question}</span>
                <span class="cheatsheet-answer">${q.correct_answer}</span>
            </div>
        `).join('') :
        '<p class="no-results">Ничего не найдено</p>';

    if (isCompact) {
        cheatsheetContent.classList.add('compact-view');
    } else {
        cheatsheetContent.classList.remove('compact-view');
    }
}

function copyCheatsheet() {
    const cheatsheetContent = document.getElementById('cheatsheetContent');
    const items = Array.from(cheatsheetContent.querySelectorAll('.cheatsheet-item'));
    
    const text = items.map(item => {
        const question = item.querySelector('.cheatsheet-question').textContent.trim();
        const answer = item.querySelector('.cheatsheet-answer').textContent.trim();
        return `${question} -> ${answer}`;
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Добавляем обработчик для горячих клавиш
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
        document.getElementById('cheatsheetSection').style.display === 'block') {
        e.preventDefault();
        copyCheatsheet();
    }
});

// Экспорт функций для использования в HTML
window.showSection = showSection;
window.startQuiz = startQuiz;
window.nextQuestion = nextQuestion;
window.checkAnswer = checkAnswer;
window.finishQuiz = finishQuiz;
window.toggleAdvancedFilters = toggleAdvancedFilters;
window.updateCheatsheet = updateCheatsheet;
window.copyCheatsheet = copyCheatsheet;