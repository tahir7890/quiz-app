// Quiz App - Main JavaScript File
class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.category = '9';
        this.difficulty = 'easy';
        this.timer = null;
        this.timeLeft = 30;
        this.isAnswerSelected = false;
        this.isLocalDevelopment = window.location.protocol === 'file:';
        
        if (this.isLocalDevelopment) {
            console.log('⚠️ Running in local development mode. For best experience, use a local server.');
            console.log('💡 Try: python -m http.server 8000');
            
            // Show local development notice
            setTimeout(() => {
                const localDevNotice = document.getElementById('local-dev-notice');
                if (localDevNotice) {
                    localDevNotice.style.display = 'flex';
                }
            }, 2000);
        }
        
        this.initializeElements();
        this.bindEvents();
        this.showScreen('welcome-screen');
    }

    initializeElements() {
        // Screen elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.resultsScreen = document.getElementById('results-screen');
        this.loadingScreen = document.getElementById('loading-screen');
        
        // Welcome screen elements
        this.categorySelect = document.getElementById('category');
        this.difficultySelect = document.getElementById('difficulty');
        this.questionCountSelect = document.getElementById('question-count');
        this.startBtn = document.getElementById('start-btn');
        
        // Quiz screen elements
        this.questionText = document.getElementById('question-text');
        this.answersContainer = document.getElementById('answers-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.currentScore = document.getElementById('current-score');
        this.timeLeftElement = document.getElementById('time-left');
        this.nextBtn = document.getElementById('next-btn');
        
        // Results screen elements
        this.finalScore = document.getElementById('final-score');
        this.totalQuestionsSpan = document.getElementById('total-questions');
        this.scorePercentage = document.getElementById('score-percentage');
        this.performanceText = document.getElementById('performance-text');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.newQuizBtn = document.getElementById('new-quiz-btn');
    }

    bindEvents() {
        // Welcome screen events
        this.startBtn.addEventListener('click', () => this.startQuiz());
        
        // Quiz screen events
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        
        // Results screen events
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.newQuizBtn.addEventListener('click', () => this.newQuiz());
        
        // Retry API button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'retry-api-btn') {
                this.retryAPI();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async startQuiz() {
        // Get quiz settings
        this.category = this.categorySelect.value;
        this.difficulty = this.difficultySelect.value;
        this.totalQuestions = parseInt(this.questionCountSelect.value);
        
        console.log('Starting quiz with settings:', {
            category: this.category,
            difficulty: this.difficulty,
            totalQuestions: this.totalQuestions
        });
        
        // Show loading screen
        this.showScreen('loading-screen');
        
        try {
            // Fetch questions from API
            await this.fetchQuestions();
            
            // Ensure we have questions before proceeding
            if (!this.questions || this.questions.length === 0) {
                throw new Error('No questions available');
            }
            
            console.log('Quiz ready with', this.questions.length, 'questions');
            
            // Reset quiz state
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.isAnswerSelected = false;
            
            // Start the quiz
            this.showScreen('quiz-screen');
            
            // Show notification if using offline questions
            if (this.questions[0].category === 'Geography' || this.questions[0].category === 'Science') {
                this.showOfflineNotification();
            }
            
            this.displayQuestion();
            this.startTimer();
            
        } catch (error) {
            console.error('Error starting quiz:', error);
            // Don't show alert, just go back to welcome screen
            // The fallback questions should have been loaded automatically
            this.showScreen('welcome-screen');
        }
    }

    async fetchQuestions() {
        try {
            const apiUrl = `https://opentdb.com/api.php?amount=${this.totalQuestions}&category=${this.category}&difficulty=${this.difficulty}&type=multiple`;
            
            console.log('Fetching from API:', apiUrl);
            
            // Add timeout to fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            
            const response = await fetch(apiUrl, {
                signal: controller.signal,
                mode: 'cors'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.response_code === 0 && data.results && data.results.length > 0) {
                this.questions = data.results.map(question => ({
                    question: this.decodeHtml(question.question),
                    correct_answer: this.decodeHtml(question.correct_answer),
                    incorrect_answers: question.incorrect_answers.map(answer => this.decodeHtml(answer)),
                    category: question.category,
                    difficulty: question.difficulty
                }));
                console.log('Questions loaded successfully:', this.questions.length);
            } else {
                console.warn('API returned no questions for this category/difficulty combination, using fallback questions');
                await this.useFallbackQuestions();
                
                // Show offline status
                this.showOfflineStatus();
            }
        } catch (error) {
            console.error('API Error:', error);
            
            if (error.name === 'AbortError') {
                console.log('API request timed out, using fallback questions');
            } else if (error.message.includes('Failed to fetch')) {
                console.log('Network error - API unavailable, using fallback questions');
            } else {
                console.log('API error occurred, using fallback questions');
            }
            
            await this.useFallbackQuestions();
            
            // Show offline status
            this.showOfflineStatus();
        }
    }

    async useFallbackQuestions() {
        // Show notification that fallback questions are being used
        console.log('Using fallback questions - API unavailable');
        
        // Fallback questions if API fails - organized by category
        const fallbackQuestions = [
            {
                question: "What is the capital of France?",
                correct_answer: "Paris",
                incorrect_answers: ["London", "Berlin", "Madrid"],
                category: "Geography",
                difficulty: "easy"
            },
            {
                question: "Which planet is known as the Red Planet?",
                correct_answer: "Mars",
                incorrect_answers: ["Venus", "Jupiter", "Saturn"],
                category: "Science",
                difficulty: "easy"
            },
            {
                question: "What is 2 + 2?",
                correct_answer: "4",
                incorrect_answers: ["3", "5", "6"],
                category: "Mathematics",
                difficulty: "easy"
            },
            {
                question: "Who painted the Mona Lisa?",
                correct_answer: "Leonardo da Vinci",
                incorrect_answers: ["Pablo Picasso", "Vincent van Gogh", "Michelangelo"],
                category: "Art",
                difficulty: "medium"
            },
            {
                question: "What is the largest ocean on Earth?",
                correct_answer: "Pacific Ocean",
                incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
                category: "Geography",
                difficulty: "easy"
            },
            {
                question: "Which element has the chemical symbol 'O'?",
                correct_answer: "Oxygen",
                incorrect_answers: ["Gold", "Silver", "Iron"],
                category: "Science",
                difficulty: "easy"
            },
            {
                question: "What year did World War II end?",
                correct_answer: "1945",
                incorrect_answers: ["1943", "1944", "1946"],
                category: "History",
                difficulty: "medium"
            },
            {
                question: "What is the main ingredient in guacamole?",
                correct_answer: "Avocado",
                incorrect_answers: ["Tomato", "Onion", "Lime"],
                category: "Food",
                difficulty: "easy"
            },
            {
                question: "Which country is home to the kangaroo?",
                correct_answer: "Australia",
                incorrect_answers: ["New Zealand", "South Africa", "Brazil"],
                category: "Geography",
                difficulty: "easy"
            },
            {
                question: "What is the largest mammal in the world?",
                correct_answer: "Blue Whale",
                incorrect_answers: ["African Elephant", "Giraffe", "Hippopotamus"],
                category: "Animals",
                difficulty: "medium"
            },
            {
                question: "What is the chemical symbol for gold?",
                correct_answer: "Au",
                incorrect_answers: ["Ag", "Fe", "Cu"],
                category: "Science",
                difficulty: "medium"
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                correct_answer: "William Shakespeare",
                incorrect_answers: ["Charles Dickens", "Jane Austen", "Mark Twain"],
                category: "Literature",
                difficulty: "medium"
            },
            {
                question: "What is the capital of Japan?",
                correct_answer: "Tokyo",
                incorrect_answers: ["Kyoto", "Osaka", "Yokohama"],
                category: "Geography",
                difficulty: "medium"
            },
            {
                question: "What is the largest planet in our solar system?",
                correct_answer: "Jupiter",
                incorrect_answers: ["Saturn", "Neptune", "Uranus"],
                category: "Science",
                difficulty: "easy"
            },
            {
                question: "What is the main component of the sun?",
                correct_answer: "Hydrogen",
                incorrect_answers: ["Helium", "Oxygen", "Carbon"],
                category: "Science",
                difficulty: "medium"
            },
            {
                question: "What is the largest desert in the world?",
                correct_answer: "Sahara Desert",
                incorrect_answers: ["Antarctic Desert", "Arabian Desert", "Gobi Desert"],
                category: "Geography",
                difficulty: "medium"
            },
            {
                question: "What is the square root of 144?",
                correct_answer: "12",
                incorrect_answers: ["10", "14", "16"],
                category: "Mathematics",
                difficulty: "easy"
            },
            {
                question: "What is the national flower of Japan?",
                correct_answer: "Cherry Blossom",
                incorrect_answers: ["Rose", "Tulip", "Lotus"],
                category: "Nature",
                difficulty: "medium"
            },
            {
                question: "What is the largest ocean on Earth?",
                correct_answer: "Pacific Ocean",
                incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
                category: "Geography",
                difficulty: "easy"
            }
        ];

        // Try to match questions to selected category if possible
        let selectedQuestions = fallbackQuestions;
        
        // Map API category IDs to fallback categories
        const categoryMap = {
            '9': 'General Knowledge',
            '17': 'Science',
            '18': 'Science',
            '19': 'Mathematics',
            '22': 'Geography',
            '23': 'History',
            '25': 'Art',
            '27': 'Animals',
            '10': 'Literature',
            '11': 'Entertainment',
            '12': 'Entertainment',
            '14': 'Entertainment',
            '15': 'Entertainment'
        };
        
        const selectedCategory = categoryMap[this.category] || 'General Knowledge';
        
        // Filter questions by category if possible
        const categoryQuestions = fallbackQuestions.filter(q => 
            q.category === selectedCategory || 
            q.category === 'General Knowledge'
        );
        
        if (categoryQuestions.length >= this.totalQuestions) {
            selectedQuestions = categoryQuestions;
        }
        
        // Shuffle and select the requested number of questions
        const shuffled = this.shuffleArray([...selectedQuestions]);
        this.questions = shuffled.slice(0, this.totalQuestions);
        console.log(`Fallback questions loaded: ${this.questions.length} (Category: ${selectedCategory})`);
        
        // Add a small delay to make the loading experience smoother
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    showOfflineStatus() {
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) {
            loadingStatus.style.display = 'flex';
        }
    }

    async retryAPI() {
        console.log('Retrying API...');
        
        // Hide offline status
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) {
            loadingStatus.style.display = 'none';
        }
        
        // Update loading message
        const loadingText = document.querySelector('#loading-screen p');
        if (loadingText) {
            loadingText.textContent = 'Retrying API...';
        }
        
        try {
            // Try to fetch questions again
            await this.fetchQuestions();
            
            // If successful, start the quiz
            if (this.questions && this.questions.length > 0) {
                this.currentQuestionIndex = 0;
                this.score = 0;
                this.isAnswerSelected = false;
                
                this.showScreen('quiz-screen');
                this.displayQuestion();
                this.startTimer();
            }
        } catch (error) {
            console.error('Retry failed:', error);
            // Show offline status again
            this.showOfflineStatus();
            if (loadingText) {
                loadingText.textContent = 'Using offline questions...';
            }
        }
    }

    showOfflineNotification() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <i class="fas fa-wifi-slash"></i>
            <span>Using offline questions</span>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // Safety checks for DOM elements
        if (this.questionText) {
            this.questionText.textContent = question.question;
        }
        
        // Update progress
        if (this.progressFill && this.progressText) {
            const progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.totalQuestions}`;
        }
        
        // Update score
        if (this.currentScore) {
            this.currentScore.textContent = this.score;
        }
        
        // Create answer buttons
        this.createAnswerButtons(question);
        
        // Reset answer selection
        this.isAnswerSelected = false;
        if (this.nextBtn) {
            this.nextBtn.disabled = true;
        }
        
        // Reset timer
        this.resetTimer();
    }

    createAnswerButtons(question) {
        if (!this.answersContainer) {
            console.error('Answers container not found');
            return;
        }
        
        this.answersContainer.innerHTML = '';
        
        // Combine correct and incorrect answers
        const allAnswers = [...question.incorrect_answers, question.correct_answer];
        
        // Shuffle answers
        const shuffledAnswers = this.shuffleArray(allAnswers);
        
        shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.dataset.answer = answer;
            
            button.addEventListener('click', () => this.selectAnswer(answer, question.correct_answer));
            
            this.answersContainer.appendChild(button);
        });
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    selectAnswer(selectedAnswer, correctAnswer) {
        if (this.isAnswerSelected) return;
        
        this.isAnswerSelected = true;
        this.stopTimer();
        
        const buttons = this.answersContainer.querySelectorAll('.answer-btn');
        
        buttons.forEach(button => {
            const answer = button.dataset.answer;
            
            if (answer === correctAnswer) {
                button.classList.add('correct');
            } else if (answer === selectedAnswer && answer !== correctAnswer) {
                button.classList.add('incorrect');
            }
            
            button.disabled = true;
        });
        
        // Update score
        if (selectedAnswer === correctAnswer) {
            this.score++;
            this.currentScore.textContent = this.score;
        }
        
        // Enable next button
        this.nextBtn.disabled = false;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
            this.startTimer();
        } else {
            this.endQuiz();
        }
    }

    startTimer() {
        this.timeLeft = 30;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.timeLeft = 30;
        console.log('Timer reset to:', this.timeLeft);
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        if (this.timeLeftElement && typeof this.timeLeft === 'number') {
            this.timeLeftElement.textContent = this.timeLeft;
            console.log('Timer display updated:', this.timeLeft);
        } else {
            console.warn('Timer display update failed:', {
                timeLeftElement: !!this.timeLeftElement,
                timeLeft: this.timeLeft,
                timeLeftType: typeof this.timeLeft
            });
        }
    }

    timeUp() {
        this.stopTimer();
        
        if (!this.isAnswerSelected) {
            // Auto-select a random answer
            const buttons = this.answersContainer.querySelectorAll('.answer-btn');
            const randomIndex = Math.floor(Math.random() * buttons.length);
            const randomButton = buttons[randomIndex];
            const selectedAnswer = randomButton.dataset.answer;
            
            const question = this.questions[this.currentQuestionIndex];
            this.selectAnswer(selectedAnswer, question.correct_answer);
        }
    }

    endQuiz() {
        this.stopTimer();
        this.showResults();
    }

    showResults() {
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        
        this.finalScore.textContent = this.score;
        this.totalQuestionsSpan.textContent = this.totalQuestions;
        this.scorePercentage.textContent = `${percentage}%`;
        
        // Set performance message
        if (percentage >= 90) {
            this.performanceText.textContent = 'Excellent! You\'re a quiz master! 🏆';
        } else if (percentage >= 80) {
            this.performanceText.textContent = 'Great job! You really know your stuff! 🌟';
        } else if (percentage >= 70) {
            this.performanceText.textContent = 'Good work! You have solid knowledge! 👍';
        } else if (percentage >= 60) {
            this.performanceText.textContent = 'Not bad! Keep learning and improving! 📚';
        } else if (percentage >= 50) {
            this.performanceText.textContent = 'You passed! Practice makes perfect! 💪';
        } else {
            this.performanceText.textContent = 'Keep studying! Every expert was once a beginner! 📖';
        }
        
        this.showScreen('results-screen');
    }

    playAgain() {
        // Reset quiz with same settings
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isAnswerSelected = false;
        
        this.showScreen('quiz-screen');
        this.displayQuestion();
        this.startTimer();
    }

    newQuiz() {
        // Go back to welcome screen
        this.showScreen('welcome-screen');
    }

    showScreen(screenId) {
        // Hide all screens
        [this.welcomeScreen, this.quizScreen, this.resultsScreen, this.loadingScreen].forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        document.getElementById(screenId).classList.add('active');
    }

    handleKeyboard(e) {
        // Only handle keyboard events on quiz screen
        if (!this.quizScreen.classList.contains('active')) return;
        
        switch(e.key) {
            case '1':
            case '2':
            case '3':
            case '4':
                const answerIndex = parseInt(e.key) - 1;
                const buttons = this.answersContainer.querySelectorAll('.answer-btn');
                if (buttons[answerIndex] && !this.isAnswerSelected) {
                    buttons[answerIndex].click();
                }
                break;
            case 'Enter':
            case ' ':
                if (this.nextBtn.disabled === false) {
                    this.nextBtn.click();
                }
                break;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});

// Add some additional utility functions
function addConfetti() {
    // Simple confetti effect for high scores
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// Add smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll to top when starting new quiz
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Add loading states for better UX
function showLoading(element) {
    element.disabled = true;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
}

function hideLoading(element, originalText) {
    element.disabled = false;
    element.innerHTML = originalText;
}

// Add error handling for network issues
window.addEventListener('online', () => {
    console.log('Network connection restored');
});

window.addEventListener('offline', () => {
    console.log('Network connection lost');
    alert('Network connection lost. Please check your internet connection.');
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
