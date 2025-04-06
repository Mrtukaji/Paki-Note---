document.addEventListener('DOMContentLoaded', function() {
    const categorySelect = document.getElementById('categorySelect');
    const questionCount = document.getElementById('questionCount');
    const quizType = document.getElementById('quizType');
    const startQuizBtn = document.getElementById('startQuiz');
    const quizContainer = document.getElementById('quizContainer');
    const quizResults = document.getElementById('quizResults');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    let currentQuiz = [];
    let userAnswers = [];

    function initializeCategories() {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    function generateQuestion(note, type) {
        const text = note.text;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        if (sentences.length === 0) return null;
        
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        
        switch(type) {
            case 'multiple':
                return generateMultipleChoice(randomSentence, note.category);
            case 'truefalse':
                return generateTrueFalse(randomSentence);
            case 'fillblank':
                return generateFillInBlank(randomSentence);
            default:
                return null;
        }
    }

    function generateMultipleChoice(sentence, category) {
        const words = sentence.split(' ').filter(w => w.length > 3);
        if (words.length < 4) return null;

        const targetWord = words[Math.floor(Math.random() * words.length)];
        const question = sentence.replace(targetWord, '_____');
        
        const otherWords = notes
            .filter(n => n.category === category)
            .map(n => n.text.split(' '))
            .flat()
            .filter(w => w.length > 3 && w !== targetWord);

        const options = [targetWord];
        while (options.length < 4 && otherWords.length > 0) {
            const randomWord = otherWords.splice(Math.floor(Math.random() * otherWords.length), 1)[0];
            if (!options.includes(randomWord)) {
                options.push(randomWord);
            }
        }

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return {
            type: 'multiple',
            question: question,
            options: options,
            correctAnswer: targetWord
        };
    }

    function generateTrueFalse(sentence) {
        const makeItFalse = Math.random() < 0.5;
        let question = sentence;
        let correctAnswer = 'true';

        if (makeItFalse) {
            const words = sentence.split(' ');
            const randomIndex = Math.floor(Math.random() * words.length);
            words[randomIndex] = 'NOT' + words[randomIndex];
            question = words.join(' ');
            correctAnswer = 'false';
        }

        return {
            type: 'truefalse',
            question: question,
            options: ['true', 'false'],
            correctAnswer: correctAnswer
        };
    }

    function generateFillInBlank(sentence) {
        const words = sentence.split(' ').filter(w => w.length > 3);
        if (words.length < 2) return null;

        const targetWord = words[Math.floor(Math.random() * words.length)];
        const question = sentence.replace(targetWord, '_____');

        return {
            type: 'fillblank',
            question: question,
            correctAnswer: targetWord
        };
    }

    function generateQuiz() {
        const count = parseInt(questionCount.value);
        const type = quizType.value;
        const category = categorySelect.value;
        
        let availableNotes = notes;
        if (category !== 'all') {
            availableNotes = notes.filter(n => n.category.toLowerCase() === category);
        }

        if (availableNotes.length === 0) {
            alert('No notes available for the selected category!');
            return;
        }

        currentQuiz = [];
        let attempts = 0;
        const maxAttempts = count * 3;

        while (currentQuiz.length < count && attempts < maxAttempts) {
            const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
            const question = generateQuestion(randomNote, type);
            
            if (question) {
                currentQuiz.push(question);
            }
            attempts++;
        }

        if (currentQuiz.length === 0) {
            alert('Could not generate questions. Try adding more detailed notes!');
            return;
        }

        displayQuiz();
    }

    function displayQuiz() {
        quizContainer.style.display = 'block';
        quizResults.style.display = 'none';
        quizContainer.innerHTML = '';
        userAnswers = [];

        currentQuiz.forEach((question, index) => {
            const questionCard = document.createElement('div');
            questionCard.className = 'question-card';
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = `${index + 1}. ${question.question}`;
            
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';

            if (question.type === 'fillblank') {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'fill-blank-input';
                input.placeholder = 'Type your answer...';
                input.dataset.questionIndex = index;
                optionsContainer.appendChild(input);
            } else {
                question.options.forEach((option, optionIndex) => {
                    const button = document.createElement('button');
                    button.className = 'option-btn';
                    button.textContent = option;
                    button.dataset.questionIndex = index;
                    button.dataset.optionIndex = optionIndex;
                    button.onclick = () => selectAnswer(index, option);
                    optionsContainer.appendChild(button);
                });
            }

            questionCard.appendChild(questionText);
            questionCard.appendChild(optionsContainer);
            quizContainer.appendChild(questionCard);
        });

        // Add submit button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'primary-btn';
        submitBtn.textContent = 'Submit Quiz';
        submitBtn.onclick = checkAnswers;
        quizContainer.appendChild(submitBtn);
    }

    function selectAnswer(questionIndex, answer) {
        userAnswers[questionIndex] = answer;
        
        const options = document.querySelectorAll(`button[data-question-index="${questionIndex}"]`);
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.textContent === answer) {
                option.classList.add('selected');
            }
        });
    }

    function checkAnswers() {
        const fillBlankInputs = document.querySelectorAll('.fill-blank-input');
        fillBlankInputs.forEach(input => {
            userAnswers[input.dataset.questionIndex] = input.value.trim();
        });

        if (userAnswers.length !== currentQuiz.length || userAnswers.includes(undefined)) {
            alert('Please answer all questions!');
            return;
        }

        let score = 0;
        const results = currentQuiz.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
            if (isCorrect) score++;
            
            return {
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect
            };
        });

        displayResults(score, results);
    }

    function displayResults(score, results) {
        quizContainer.style.display = 'none';
        quizResults.style.display = 'block';
        
        const percentage = (score / currentQuiz.length) * 100;
        let feedback = '';
        if (percentage >= 90) feedback = 'Excellent! Keep up the great work!';
        else if (percentage >= 70) feedback = 'Good job! Room for improvement!';
        else if (percentage >= 50) feedback = 'Not bad! Keep practicing!';
        else feedback = 'Keep studying! You\'ll do better next time!';

        quizResults.innerHTML = `
            <div class="result-score">Score: ${score}/${currentQuiz.length} (${percentage.toFixed(1)}%)</div>
            <div class="result-feedback">${feedback}</div>
            <div class="result-details">
                ${results.map((result, index) => `
                    <div class="question-result ${result.isCorrect ? 'correct-answer' : 'wrong-answer'}">
                        <p><strong>Question ${index + 1}:</strong> ${result.question}</p>
                        <p>Your answer: ${result.userAnswer}</p>
                        ${!result.isCorrect ? `<p>Correct answer: ${result.correctAnswer}</p>` : ''}
                    </div>
                `).join('')}
            </div>
            <button class="retry-btn" onclick="location.reload()">Try Another Quiz</button>
        `;
    }

    startQuizBtn.addEventListener('click', generateQuiz);

    initializeCategories();
});
