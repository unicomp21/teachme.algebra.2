// Adaptive Algebra 2 Teaching App
// SVG-based interactive learning with touch support

class AlgebraTeachingApp {
    constructor() {
        this.svg = document.getElementById('mainCanvas');
        this.currentTopic = 'quadratic';
        this.currentProblemIndex = 0;
        this.userLevel = 1;
        this.userScore = 0;
        this.userStreak = 0;
        this.hintsUsed = 0;

        // Touch tracking
        this.touchStartPos = null;
        this.isDragging = false;
        this.draggedElement = null;

        // Adaptive learning
        this.performanceHistory = [];
        this.topicMastery = {};

        this.init();
    }

    init() {
        this.drawGrid();
        this.setupEventListeners();
        this.loadTopic(this.currentTopic);
        this.updateUI();
    }

    setupEventListeners() {
        // Touch events for mobile
        this.svg.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.svg.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.svg.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

        // Mouse events for desktop
        this.svg.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.svg.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // UI Controls
        document.getElementById('submitBtn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextProblem());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevProblem());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetProblem());

        // Topic selection
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadTopic(e.target.dataset.topic);
            });
        });

        // Enter key for input
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }

    // Touch Event Handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const point = this.getSVGPoint(touch.clientX, touch.clientY);

        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('draggable')) {
            this.isDragging = true;
            this.draggedElement = element;
            this.touchStartPos = point;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.isDragging && this.draggedElement) {
            const touch = e.touches[0];
            const point = this.getSVGPoint(touch.clientX, touch.clientY);

            this.draggedElement.setAttribute('cx', point.x);
            this.draggedElement.setAttribute('cy', point.y);

            this.onDragUpdate();
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.isDragging = false;
        this.draggedElement = null;
        this.touchStartPos = null;
    }

    // Mouse Event Handlers
    handleMouseDown(e) {
        if (e.target.classList.contains('draggable')) {
            this.isDragging = true;
            this.draggedElement = e.target;
            const point = this.getSVGPoint(e.clientX, e.clientY);
            this.touchStartPos = point;
        }
    }

    handleMouseMove(e) {
        if (this.isDragging && this.draggedElement) {
            const point = this.getSVGPoint(e.clientX, e.clientY);

            this.draggedElement.setAttribute('cx', point.x);
            this.draggedElement.setAttribute('cy', point.y);

            this.onDragUpdate();
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.draggedElement = null;
        this.touchStartPos = null;
    }

    getSVGPoint(clientX, clientY) {
        const rect = this.svg.getBoundingClientRect();
        const viewBox = this.svg.viewBox.baseVal;

        const x = ((clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
        const y = ((clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;

        return { x, y };
    }

    drawGrid() {
        const grid = document.getElementById('grid');
        grid.innerHTML = '';

        // Vertical lines
        for (let x = -300; x <= 300; x += 30) {
            const line = this.createSVGElement('line', {
                x1: x, y1: -300, x2: x, y2: 300,
                class: 'grid-line'
            });
            grid.appendChild(line);
        }

        // Horizontal lines
        for (let y = -300; y <= 300; y += 30) {
            const line = this.createSVGElement('line', {
                x1: -300, y1: y, x2: 300, y2: y,
                class: 'grid-line'
            });
            grid.appendChild(line);
        }
    }

    createSVGElement(type, attrs = {}) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', type);
        for (let key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
        return el;
    }

    loadTopic(topic) {
        this.currentTopic = topic;
        this.currentProblemIndex = 0;

        const topics = {
            quadratic: this.getQuadraticProblems(),
            polynomial: this.getPolynomialProblems(),
            exponential: this.getExponentialProblems(),
            logarithm: this.getLogarithmProblems(),
            rational: this.getRationalProblems(),
            systems: this.getSystemsProblems(),
            conic: this.getConicProblems(),
            sequences: this.getSequencesProblems()
        };

        this.problems = topics[topic] || topics.quadratic;
        this.loadProblem(0);
    }

    getQuadraticProblems() {
        return [
            {
                title: "Quadratic Functions: Standard Form",
                description: "Explore how a, b, and c affect the parabola y = ax² + bx + c",
                question: "For the parabola y = 2x² - 4x + 1, what is the vertex?",
                type: "multiple",
                options: ["(1, -1)", "(1, 1)", "(-1, -1)", "(2, -1)"],
                answer: "(1, -1)",
                hint: "Use the vertex formula: x = -b/(2a), then find y",
                interactive: (app) => app.drawQuadratic(2, -4, 1),
                level: 1
            },
            {
                title: "Quadratic Functions: Vertex Form",
                description: "Understanding vertex form y = a(x - h)² + k",
                question: "What is the vertex of y = -3(x - 2)² + 5?",
                type: "multiple",
                options: ["(2, 5)", "(-2, 5)", "(2, -5)", "(-2, -5)"],
                answer: "(2, 5)",
                hint: "In vertex form, (h, k) is the vertex",
                interactive: (app) => app.drawQuadratic(-3, 12, -7),
                level: 1
            },
            {
                title: "Solving Quadratics",
                description: "Find the roots of a quadratic equation",
                question: "Solve: x² - 5x + 6 = 0",
                type: "multiple",
                options: ["x = 2, 3", "x = -2, -3", "x = 1, 6", "x = -1, -6"],
                answer: "x = 2, 3",
                hint: "Factor: (x - 2)(x - 3) = 0",
                interactive: (app) => app.drawQuadratic(1, -5, 6),
                level: 2
            },
            {
                title: "Quadratic Formula",
                description: "Use the quadratic formula to find roots",
                question: "Using the quadratic formula, find the roots of 2x² + 3x - 2 = 0",
                type: "multiple",
                options: ["x = 0.5, -2", "x = 1, -2", "x = 0.5, 2", "x = -0.5, 2"],
                answer: "x = 0.5, -2",
                hint: "x = (-b ± √(b² - 4ac)) / (2a)",
                interactive: (app) => app.drawQuadratic(2, 3, -2),
                level: 2
            }
        ];
    }

    getPolynomialProblems() {
        return [
            {
                title: "Polynomial Basics",
                description: "Understanding polynomial degree and leading coefficient",
                question: "What is the degree of 3x⁴ - 2x³ + x - 5?",
                type: "multiple",
                options: ["3", "4", "5", "2"],
                answer: "4",
                hint: "The degree is the highest power of x",
                interactive: (app) => app.drawPolynomial([3, -2, 0, 1, -5]),
                level: 1
            },
            {
                title: "Polynomial End Behavior",
                description: "Determine how polynomials behave at extremes",
                question: "For f(x) = -x³ + 2x², as x → ∞, f(x) → ?",
                type: "multiple",
                options: ["-∞", "∞", "0", "2"],
                answer: "-∞",
                hint: "Look at the leading term's coefficient and degree",
                interactive: (app) => app.drawPolynomial([-1, 2, 0, 0]),
                level: 2
            }
        ];
    }

    getExponentialProblems() {
        return [
            {
                title: "Exponential Growth",
                description: "Understanding exponential functions f(x) = a·bˣ",
                question: "If f(x) = 2ˣ, what is f(3)?",
                type: "multiple",
                options: ["6", "8", "9", "16"],
                answer: "8",
                hint: "Calculate 2³",
                interactive: (app) => app.drawExponential(1, 2),
                level: 1
            },
            {
                title: "Exponential Decay",
                description: "Modeling decay with exponential functions",
                question: "Which function represents exponential decay?",
                type: "multiple",
                options: ["f(x) = 2ˣ", "f(x) = (1/2)ˣ", "f(x) = x²", "f(x) = 2x"],
                answer: "f(x) = (1/2)ˣ",
                hint: "Decay occurs when 0 < b < 1",
                interactive: (app) => app.drawExponential(1, 0.5),
                level: 1
            }
        ];
    }

    getLogarithmProblems() {
        return [
            {
                title: "Logarithm Basics",
                description: "Understanding logarithms as inverse of exponentials",
                question: "What is log₂(8)?",
                type: "multiple",
                options: ["2", "3", "4", "16"],
                answer: "3",
                hint: "2 to what power equals 8?",
                interactive: (app) => app.drawLogarithm(2),
                level: 1
            },
            {
                title: "Natural Logarithms",
                description: "Working with ln(x)",
                question: "ln(e²) = ?",
                type: "multiple",
                options: ["e", "2", "2e", "e²"],
                answer: "2",
                hint: "ln and e are inverse functions",
                interactive: (app) => app.drawLogarithm(Math.E),
                level: 2
            }
        ];
    }

    getRationalProblems() {
        return [
            {
                title: "Rational Functions",
                description: "Understanding f(x) = p(x)/q(x)",
                question: "What is the vertical asymptote of f(x) = 1/(x-2)?",
                type: "multiple",
                options: ["x = 2", "x = -2", "x = 0", "x = 1"],
                answer: "x = 2",
                hint: "Set the denominator equal to zero",
                interactive: (app) => app.drawRational([1], [1, -2]),
                level: 2
            }
        ];
    }

    getSystemsProblems() {
        return [
            {
                title: "Systems of Linear Equations",
                description: "Solving two equations simultaneously",
                question: "Solve: y = 2x + 1 and y = -x + 4",
                type: "multiple",
                options: ["(1, 3)", "(3, 1)", "(-1, 3)", "(1, -3)"],
                answer: "(1, 3)",
                hint: "Set the equations equal: 2x + 1 = -x + 4",
                interactive: (app) => app.drawSystem([[2, 1], [-1, 4]]),
                level: 2
            }
        ];
    }

    getConicProblems() {
        return [
            {
                title: "Circles",
                description: "Understanding circle equations",
                question: "What is the radius of (x-2)² + (y-3)² = 25?",
                type: "multiple",
                options: ["5", "25", "10", "√25"],
                answer: "5",
                hint: "r² = 25, so r = ?",
                interactive: (app) => app.drawCircle(2, 3, 5),
                level: 1
            }
        ];
    }

    getSequencesProblems() {
        return [
            {
                title: "Arithmetic Sequences",
                description: "Sequences with constant difference",
                question: "Find the 10th term of: 3, 7, 11, 15, ...",
                type: "multiple",
                options: ["39", "43", "35", "47"],
                answer: "39",
                hint: "aₙ = a₁ + (n-1)d, where d = 4",
                interactive: (app) => app.drawSequence('arithmetic', 3, 4),
                level: 1
            },
            {
                title: "Geometric Sequences",
                description: "Sequences with constant ratio",
                question: "Find the 5th term of: 2, 6, 18, 54, ...",
                type: "multiple",
                options: ["162", "486", "324", "108"],
                answer: "162",
                hint: "aₙ = a₁ · r^(n-1), where r = 3",
                interactive: (app) => app.drawSequence('geometric', 2, 3),
                level: 2
            }
        ];
    }

    loadProblem(index) {
        if (index < 0 || index >= this.problems.length) return;

        this.currentProblemIndex = index;
        const problem = this.problems[index];

        // Update UI
        document.getElementById('lessonTitle').textContent = problem.title;
        document.getElementById('lessonDescription').textContent = problem.description;
        document.getElementById('questionText').textContent = problem.question;

        // Clear previous content
        document.getElementById('graphs').innerHTML = '';
        document.getElementById('interactive').innerHTML = '';
        document.getElementById('labels').innerHTML = '';
        document.getElementById('answerOptions').innerHTML = '';
        document.getElementById('feedback').className = 'feedback';
        document.getElementById('userInput').value = '';

        // Setup answer interface
        if (problem.type === 'multiple') {
            document.getElementById('userInput').style.display = 'none';
            problem.options.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option;
                btn.onclick = () => this.selectOption(btn, option);
                document.getElementById('answerOptions').appendChild(btn);
            });
        } else {
            document.getElementById('userInput').style.display = 'block';
        }

        // Draw interactive visualization
        if (problem.interactive) {
            problem.interactive(this);
        }

        this.hintsUsed = 0;
    }

    selectOption(btn, option) {
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedOption = option;
    }

    // Drawing Functions
    drawQuadratic(a, b, c) {
        const graphs = document.getElementById('graphs');
        const interactive = document.getElementById('interactive');
        const labels = document.getElementById('labels');

        // Draw parabola
        const points = [];
        for (let x = -10; x <= 10; x += 0.1) {
            const y = a * x * x + b * x + c;
            if (Math.abs(y) <= 10) {
                points.push(`${x * 30},${-y * 30}`);
            }
        }

        const path = this.createSVGElement('path', {
            d: `M ${points.join(' L ')}`,
            class: 'graph-line',
            stroke: '#667eea',
            'stroke-width': '3',
            fill: 'none'
        });
        graphs.appendChild(path);

        // Vertex
        const h = -b / (2 * a);
        const k = a * h * h + b * h + c;

        const vertex = this.createSVGElement('circle', {
            cx: h * 30,
            cy: -k * 30,
            r: 6,
            fill: '#ff5722',
            class: 'point draggable'
        });
        interactive.appendChild(vertex);

        // Vertex label
        const label = this.createSVGElement('text', {
            x: h * 30 + 10,
            y: -k * 30 - 10,
            class: 'label-text'
        });
        label.textContent = `Vertex (${h.toFixed(1)}, ${k.toFixed(1)})`;
        labels.appendChild(label);
    }

    drawPolynomial(coeffs) {
        const graphs = document.getElementById('graphs');

        const evalPoly = (x) => {
            let result = 0;
            for (let i = 0; i < coeffs.length; i++) {
                result += coeffs[i] * Math.pow(x, coeffs.length - 1 - i);
            }
            return result;
        };

        const points = [];
        for (let x = -10; x <= 10; x += 0.1) {
            const y = evalPoly(x);
            if (Math.abs(y) <= 10) {
                points.push(`${x * 30},${-y * 30}`);
            }
        }

        if (points.length > 0) {
            const path = this.createSVGElement('path', {
                d: `M ${points.join(' L ')}`,
                class: 'graph-line',
                stroke: '#4CAF50'
            });
            graphs.appendChild(path);
        }
    }

    drawExponential(a, b) {
        const graphs = document.getElementById('graphs');

        const points = [];
        for (let x = -10; x <= 10; x += 0.1) {
            const y = a * Math.pow(b, x);
            if (y > 0 && Math.abs(y) <= 10) {
                points.push(`${x * 30},${-y * 30}`);
            }
        }

        const path = this.createSVGElement('path', {
            d: `M ${points.join(' L ')}`,
            class: 'graph-line',
            stroke: '#ff9800'
        });
        graphs.appendChild(path);
    }

    drawLogarithm(base) {
        const graphs = document.getElementById('graphs');

        const points = [];
        for (let x = 0.1; x <= 10; x += 0.1) {
            const y = Math.log(x) / Math.log(base);
            if (Math.abs(y) <= 10) {
                points.push(`${x * 30},${-y * 30}`);
            }
        }

        const path = this.createSVGElement('path', {
            d: `M ${points.join(' L ')}`,
            class: 'graph-line',
            stroke: '#9c27b0'
        });
        graphs.appendChild(path);
    }

    drawRational(numerator, denominator) {
        const graphs = document.getElementById('graphs');

        const evalPoly = (coeffs, x) => {
            let result = 0;
            for (let i = 0; i < coeffs.length; i++) {
                result += coeffs[i] * Math.pow(x, coeffs.length - 1 - i);
            }
            return result;
        };

        const points = [];
        for (let x = -10; x <= 10; x += 0.1) {
            const denom = evalPoly(denominator, x);
            if (Math.abs(denom) > 0.1) {
                const y = evalPoly(numerator, x) / denom;
                if (Math.abs(y) <= 10) {
                    points.push(`${x * 30},${-y * 30}`);
                }
            }
        }

        // Draw asymptote
        if (denominator.length === 2) {
            const asymptoteX = -denominator[1] / denominator[0];
            const line = this.createSVGElement('line', {
                x1: asymptoteX * 30,
                y1: -300,
                x2: asymptoteX * 30,
                y2: 300,
                stroke: '#f44336',
                'stroke-width': '2',
                'stroke-dasharray': '5,5'
            });
            graphs.appendChild(line);
        }

        if (points.length > 0) {
            const path = this.createSVGElement('path', {
                d: `M ${points.join(' L ')}`,
                class: 'graph-line',
                stroke: '#00bcd4'
            });
            graphs.appendChild(path);
        }
    }

    drawSystem(equations) {
        const graphs = document.getElementById('graphs');
        const interactive = document.getElementById('interactive');

        const colors = ['#667eea', '#4CAF50'];

        equations.forEach((eq, i) => {
            const [m, b] = eq;
            const points = [];

            for (let x = -10; x <= 10; x += 0.1) {
                const y = m * x + b;
                if (Math.abs(y) <= 10) {
                    points.push(`${x * 30},${-y * 30}`);
                }
            }

            const path = this.createSVGElement('path', {
                d: `M ${points.join(' L ')}`,
                class: 'graph-line',
                stroke: colors[i]
            });
            graphs.appendChild(path);
        });

        // Find intersection
        if (equations.length === 2) {
            const [m1, b1] = equations[0];
            const [m2, b2] = equations[1];

            const x = (b2 - b1) / (m1 - m2);
            const y = m1 * x + b1;

            const intersection = this.createSVGElement('circle', {
                cx: x * 30,
                cy: -y * 30,
                r: 6,
                fill: '#ff5722',
                class: 'point'
            });
            interactive.appendChild(intersection);
        }
    }

    drawCircle(h, k, r) {
        const graphs = document.getElementById('graphs');

        const circle = this.createSVGElement('circle', {
            cx: h * 30,
            cy: -k * 30,
            r: r * 30,
            fill: 'none',
            stroke: '#667eea',
            'stroke-width': '3'
        });
        graphs.appendChild(circle);

        const center = this.createSVGElement('circle', {
            cx: h * 30,
            cy: -k * 30,
            r: 5,
            fill: '#ff5722'
        });
        graphs.appendChild(center);
    }

    drawSequence(type, a1, diff) {
        const interactive = document.getElementById('interactive');

        for (let n = 1; n <= 8; n++) {
            let term;
            if (type === 'arithmetic') {
                term = a1 + (n - 1) * diff;
            } else {
                term = a1 * Math.pow(diff, n - 1);
            }

            const x = -240 + (n - 1) * 60;
            const y = -term * 5;

            if (Math.abs(y) <= 300) {
                const point = this.createSVGElement('circle', {
                    cx: x,
                    cy: y,
                    r: 5,
                    fill: '#667eea',
                    class: 'point'
                });
                interactive.appendChild(point);

                const label = this.createSVGElement('text', {
                    x: x,
                    y: y - 15,
                    class: 'label-text',
                    'text-anchor': 'middle'
                });
                label.textContent = term;
                interactive.appendChild(label);
            }
        }
    }

    onDragUpdate() {
        // Update visualization based on dragged element
        // This can be extended for more interactive features
    }

    checkAnswer() {
        const problem = this.problems[this.currentProblemIndex];
        let userAnswer;

        if (problem.type === 'multiple') {
            userAnswer = this.selectedOption;
        } else {
            userAnswer = document.getElementById('userInput').value.trim();
        }

        if (!userAnswer) {
            this.showFeedback('Please provide an answer!', 'incorrect');
            return;
        }

        const isCorrect = this.compareAnswers(userAnswer, problem.answer);

        if (isCorrect) {
            this.handleCorrectAnswer(problem);
        } else {
            this.handleIncorrectAnswer(problem);
        }
    }

    compareAnswers(userAns, correctAns) {
        // Normalize answers for comparison
        const normalize = (str) => str.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
        return normalize(userAns) === normalize(correctAns);
    }

    handleCorrectAnswer(problem) {
        const points = Math.max(10 - this.hintsUsed * 2, 5);
        this.userScore += points;
        this.userStreak++;

        this.showFeedback(`Correct! +${points} points! 🎉`, 'correct');

        if (problem.type === 'multiple') {
            document.querySelectorAll('.option-btn').forEach(btn => {
                if (btn.textContent === problem.answer) {
                    btn.classList.add('correct');
                }
            });
        }

        this.recordPerformance(true, problem.level);
        this.updateUI();

        setTimeout(() => this.nextProblem(), 2000);
    }

    handleIncorrectAnswer(problem) {
        this.userStreak = 0;
        this.showFeedback('Not quite right. Try again!', 'incorrect');

        if (problem.type === 'multiple') {
            document.querySelectorAll('.option-btn').forEach(btn => {
                if (btn.classList.contains('selected')) {
                    btn.classList.add('incorrect');
                }
            });
        }

        this.recordPerformance(false, problem.level);

        // Shake animation
        document.getElementById('feedback').classList.add('shake');
        setTimeout(() => {
            document.getElementById('feedback').classList.remove('shake');
        }, 400);
    }

    showHint() {
        const problem = this.problems[this.currentProblemIndex];
        this.hintsUsed++;
        this.showFeedback(`💡 Hint: ${problem.hint}`, 'hint');
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type} show`;
    }

    nextProblem() {
        if (this.currentProblemIndex < this.problems.length - 1) {
            this.loadProblem(this.currentProblemIndex + 1);
        } else {
            this.showFeedback('You completed this topic! Choose another topic to continue.', 'correct');
        }
    }

    prevProblem() {
        if (this.currentProblemIndex > 0) {
            this.loadProblem(this.currentProblemIndex - 1);
        }
    }

    resetProblem() {
        this.loadProblem(this.currentProblemIndex);
    }

    recordPerformance(correct, level) {
        this.performanceHistory.push({
            topic: this.currentTopic,
            level: level,
            correct: correct,
            timestamp: Date.now()
        });

        // Update topic mastery
        if (!this.topicMastery[this.currentTopic]) {
            this.topicMastery[this.currentTopic] = { correct: 0, total: 0 };
        }

        this.topicMastery[this.currentTopic].total++;
        if (correct) {
            this.topicMastery[this.currentTopic].correct++;
        }

        // Adaptive level adjustment
        const mastery = this.topicMastery[this.currentTopic].correct /
                        this.topicMastery[this.currentTopic].total;

        if (mastery > 0.8 && this.userLevel < 5) {
            this.userLevel++;
        } else if (mastery < 0.4 && this.userLevel > 1) {
            this.userLevel--;
        }

        this.updateUI();
    }

    updateUI() {
        document.getElementById('userLevel').textContent = this.userLevel;
        document.getElementById('userScore').textContent = this.userScore;
        document.getElementById('userStreak').textContent = this.userStreak;

        const progress = Math.min((this.userScore / 1000) * 100, 100);
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.algebraApp = new AlgebraTeachingApp();
});
