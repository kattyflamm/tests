// Структура предметов и их вопросов
const SUBJECTS = {
    philosophy: {
        name: 'Философия',
        questions: philosophyQuestionsDB
    },
    modularSubjects: { // Новая дисциплина
        name: 'Модульные предметы',
        questions: modularSubjectsQuestionsDB // Здесь будет новая база данных
    },
    kulturology: { // Новая дисциплина
        name: 'Культурология',
        questions: kulturologyQuestionsDB // Здесь будет база данных для культурологии
    },
    psychology: { // Новая дисциплина
        name: 'Психология',
        questions: psyhologyQuestionsDB // Здесь будет база данных для психологии
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
    // Проверка, если мы выходим из викторины
    if (section === 'main' && isQuizMode) {
        const confirmExit = confirm("Вы уверены, что хотите выйти?");
        if (!confirmExit) {
            return; // Если пользователь не подтвердил, не выходим
        }
    }

    // Очищаем результаты поиска при любом переключении
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = '';
    }

    // Сбрасываем фильтры при выходе из библиотеки
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

    switch(section) {
        case 'main':
            document.getElementById('mainMenu').style.display = 'block';
            break;
        case 'quiz':
            isQuizMode = true; // Устанавливаем режим викторины
            document.getElementById('quizSection').style.display = 'block';
            break;
        case 'library':
            document.getElementById('librarySection').style.display = 'block';
            break;
    }
}
// Функции викторины
function startQuiz() {
    quizResults = [];
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    currentSubject = document.getElementById('quizSubjectSelect').value;
    nextQuestion();
}

function nextQuestion() {
    const availableQuestions = currentSubject === 'all' ? 
        allQuestions : 
        allQuestions.filter(q => q.subject === currentSubject);

    if (availableQuestions.length === 0) {
        alert('Нет доступных вопросов для выбранного предмета');
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
    
    document.getElementById('resultMessage').textContent = '';
    document.getElementById('nextQuestion').style.display = 'none';
}

function checkAnswer(selectedAnswer) {
    const buttons = document.querySelectorAll('.option-btn');
    const resultMessage = document.getElementById('resultMessage');
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
    
    quizResults.push({
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correct_answer,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        resultMessage.className = 'result-message correct';
    } else {
        resultMessage.className = 'result-message incorrect';
    }

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
                    ${result.userAnswer === result.correctAnswer ? '' : `<p>Ваш ответ: ${result.userAnswer}</p>`}
                    <p>✓: ${result.correctAnswer}</p>
                </div>
            `).join('')}
        </div>
        <button onclick="startQuiz()" class="restart-btn">Начать заново</button>
    `;
}

// Функции библиотеки
function initializeFilterHandlers() {
    // Обработчики для основных фильтров
    document.getElementById('searchInput').addEventListener('input', updateResults);
    document.getElementById('subjectFilter').addEventListener('change', updateResults);
    
    // Обработчики для радио-кнопок
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => input.addEventListener('change', updateResults));
    
    // Обработчики для чекбоксов
    const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
    checkboxInputs.forEach(input => input.addEventListener('change', updateResults));

    // Обработчик для поля повторяющихся слов
    const multipleAnswersFilter = document.getElementById('multipleAnswersFilter');
    const repeatedWordsInput = document.getElementById('repeatedWordsInput');
    
    // Активация/деактивация поля ввода при изменении чекбокса
    multipleAnswersFilter.addEventListener('change', function() {
        repeatedWordsInput.disabled = !this.checked;
        if (!this.checked) {
            repeatedWordsInput.value = '';
        }
        updateResults();
    });

    // Обработчик изменения текста в поле ввода
    repeatedWordsInput.addEventListener('input', updateResults);
}

// Функция переключения расширенных фильтров
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
    const repeatedWordsInput = document.getElementById('repeatedWordsInput').value.toLowerCase().trim();
    const numbersFilter = document.getElementById('numbersFilter')?.checked || false;

    let filtered = allQuestions;

    // Фильтр по предмету
    if (subject !== 'all') {
        filtered = filtered.filter(q => q.subject === subject);
    }

    // Текстовый поиск
    if (searchText) {
        filtered = filtered.filter(q => 
            q.question.toLowerCase().includes(searchText) ||
            q.options.some(opt => opt.toLowerCase().includes(searchText))
        );
    }

    // Применяем фильтрацию по длине правильных ответов
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
            case 'correct_asc':
                filtered = filtered.filter(q => 
                    q.options.length > 0 && 
                    q.correct_answer.length < Math.min(...q.options.filter(opt => opt !== q.correct_answer).map(opt => opt.length))
                ).sort((a, b) => a.correct_answer.length - b.correct_answer.length);
                break;
            case 'correct_desc':
                filtered = filtered.filter(q => 
                    q.options.length > 0 && 
                    q.correct_answer.length > Math.max(...q.options.filter(opt => opt !== q.correct_answer).map(opt => opt.length))
                ).sort((a, b) => b.correct_answer.length - a.correct_answer.length);   
                break;
    }

    // Фильтр повторяющихся слов
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

    // Остальные фильтры...
    if (romanFilter && subject === 'philosophy') {
        filtered = filtered.filter(q => /\b[IVXLCDM]+\b/.test(q.question));
    }

    if (numbersFilter) {
        filtered = filtered.filter(q => /\d+/.test(q.question));
    }

    // Подготовка данных для отображения
    filtered = filtered.map(q => ({
        ...q,
        optionsWithLength: q.options.map(opt => ({
            text: opt,
            length: opt.length,
            isCorrect: opt === q.correct_answer
        }))
    }));

    // Отображение результатов
    displayResults(filtered);
}
function displayResults(questions, highlightLength = false) {
    const resultsContainer = document.getElementById('searchResults');
    
    // Если мы на главной странице, не показываем результаты
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
// Экспорт функций для использования в HTML
window.showSection = showSection;
window.startQuiz = startQuiz;
window.nextQuestion = nextQuestion;
window.checkAnswer = checkAnswer;
window.finishQuiz = finishQuiz;
window.toggleAdvancedFilters = toggleAdvancedFilters;

