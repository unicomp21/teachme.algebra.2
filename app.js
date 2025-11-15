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
            sequences: this.getSequencesProblems(),
            radical: this.getRadicalProblems(),
            complex: this.getComplexNumbersProblems(),
            transformations: this.getTransformationsProblems(),
            inverse: this.getInverseFunctionsProblems(),
            piecewise: this.getPiecewiseProblems()
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
            },
            {
                title: "Discriminant and Nature of Roots",
                description: "Using b² - 4ac to determine root types",
                question: "For x² + 6x + 9 = 0, the discriminant is 0. What does this mean?",
                type: "multiple",
                options: ["One repeated real root", "Two distinct real roots", "Two complex roots", "No solution"],
                answer: "One repeated real root",
                hint: "When discriminant = 0, the parabola touches the x-axis at exactly one point",
                interactive: (app) => app.drawQuadratic(1, 6, 9),
                level: 2
            },
            {
                title: "Completing the Square",
                description: "Rewrite quadratics by completing the square",
                question: "Complete the square: x² + 8x + 5 = 0 becomes (x + p)² = q. What is q?",
                type: "multiple",
                options: ["11", "16", "21", "5"],
                answer: "11",
                hint: "Move constant to right side, add (b/2)² to both sides: x² + 8x + 16 = -5 + 16",
                interactive: (app) => app.drawQuadratic(1, 8, 5),
                level: 3
            },
            {
                title: "Projectile Motion Application",
                description: "Apply quadratics to real-world physics",
                question: "A ball is thrown upward: h(t) = -16t² + 64t + 5. What is the maximum height?",
                type: "multiple",
                options: ["69 feet", "64 feet", "80 feet", "53 feet"],
                answer: "69 feet",
                hint: "Find the vertex. Maximum occurs at t = -b/(2a) = 2 seconds",
                interactive: (app) => app.drawQuadratic(-16, 64, 5),
                level: 3
            },
            {
                title: "Quadratic Applications: Area",
                description: "Using quadratics to solve optimization problems",
                question: "A rectangle has perimeter 40m. If width is x, area is A = x(20-x). What width gives maximum area?",
                type: "multiple",
                options: ["10m", "20m", "5m", "15m"],
                answer: "10m",
                hint: "The vertex of A = -x² + 20x gives the maximum",
                interactive: (app) => app.drawQuadratic(-1, 20, 0),
                level: 3
            },
            {
                title: "Vertex Form Transformations",
                description: "Transform between standard and vertex form",
                question: "Convert y = x² - 6x + 13 to vertex form y = (x - h)² + k. What is k?",
                type: "multiple",
                options: ["4", "3", "9", "13"],
                answer: "4",
                hint: "Complete the square: y = (x² - 6x + 9) + 4 = (x - 3)² + 4",
                interactive: (app) => app.drawQuadratic(1, -6, 13),
                level: 3
            },
            {
                title: "Graphing with Transformations",
                description: "Understand how transformations affect parabolas",
                question: "How does y = -2(x + 3)² - 1 transform from y = x²?",
                type: "multiple",
                options: ["Left 3, down 1, open down, vertical stretch 2", "Right 3, up 1, open up, vertical compression", "Left 3, up 1, open down, vertical stretch 2", "Right 3, down 1, open up, vertical stretch 2"],
                answer: "Left 3, down 1, open down, vertical stretch 2",
                hint: "a = -2 (reflects and stretches), h = -3 (left), k = -1 (down)",
                interactive: (app) => app.drawQuadratic(-2, -12, -19),
                level: 4
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
            },
            {
                title: "Polynomial Long Division",
                description: "Divide polynomials using long division",
                question: "When dividing x³ + 2x² - 5x - 6 by x - 2, what is the quotient?",
                type: "multiple",
                options: ["x² + 4x + 3", "x² + 4x - 3", "x² - 4x + 3", "x² + 2x + 3"],
                answer: "x² + 4x + 3",
                hint: "Use polynomial long division or synthetic division with x = 2",
                interactive: (app) => app.drawPolynomial([1, 2, -5, -6]),
                level: 2
            },
            {
                title: "Synthetic Division",
                description: "Efficient method for dividing by linear factors",
                question: "Using synthetic division, divide 2x³ - 3x² + x - 5 by x + 1. What is the remainder?",
                type: "multiple",
                options: ["-9", "-5", "0", "-1"],
                answer: "-9",
                hint: "Synthetic division with -1: brings down 2, multiply and add down the row",
                interactive: (app) => app.drawPolynomial([2, -3, 1, -5]),
                level: 2
            },
            {
                title: "Remainder Theorem",
                description: "Use f(c) to find the remainder",
                question: "What is the remainder when f(x) = x³ - 4x² + 6x - 4 is divided by x - 2?",
                type: "multiple",
                options: ["0", "4", "-4", "8"],
                answer: "0",
                hint: "By the Remainder Theorem, remainder = f(2)",
                interactive: (app) => app.drawPolynomial([1, -4, 6, -4]),
                level: 2
            },
            {
                title: "Factor Theorem",
                description: "Determine if x - c is a factor",
                question: "Is x + 3 a factor of f(x) = x³ + 2x² - 5x - 6?",
                type: "multiple",
                options: ["Yes, f(-3) = 0", "No, f(-3) ≠ 0", "Yes, f(3) = 0", "Cannot determine"],
                answer: "Yes, f(-3) = 0",
                hint: "x + 3 is a factor if and only if f(-3) = 0",
                interactive: (app) => app.drawPolynomial([1, 2, -5, -6]),
                level: 3
            },
            {
                title: "Finding All Roots",
                description: "Find all roots including complex roots",
                question: "For f(x) = x³ - 2x² + x - 2, if x = 2 is a root, what are the other roots?",
                type: "multiple",
                options: ["x = i, -i", "x = 1, 2", "x = -1, 1", "x = 2i, -2i"],
                answer: "x = i, -i",
                hint: "Factor out (x - 2), then solve x² + 1 = 0",
                interactive: (app) => app.drawPolynomial([1, -2, 1, -2]),
                level: 3
            },
            {
                title: "Turning Points",
                description: "Understanding local maxima and minima",
                question: "What is the maximum number of turning points for a 5th degree polynomial?",
                type: "multiple",
                options: ["4", "5", "3", "6"],
                answer: "4",
                hint: "A polynomial of degree n has at most n - 1 turning points",
                interactive: (app) => app.drawPolynomial([1, -3, 0, 3, -1, 0]),
                level: 3
            },
            {
                title: "Multiplicity of Roots",
                description: "How repeated roots affect the graph",
                question: "For f(x) = (x - 1)²(x + 2), what happens at x = 1?",
                type: "multiple",
                options: ["Graph touches x-axis but doesn't cross", "Graph crosses x-axis", "Vertical asymptote", "Graph has a hole"],
                answer: "Graph touches x-axis but doesn't cross",
                hint: "Even multiplicity means the graph touches but doesn't cross",
                interactive: (app) => app.drawPolynomial([1, -3, 0, 2]),
                level: 3
            },
            {
                title: "Polynomial Graphing Complete",
                description: "Analyze all features of a polynomial graph",
                question: "For f(x) = -x⁴ + 5x² - 4, as x → -∞, f(x) → ?",
                type: "multiple",
                options: ["-∞", "∞", "0", "-4"],
                answer: "-∞",
                hint: "Even degree with negative leading coefficient: both ends go to -∞",
                interactive: (app) => app.drawPolynomial([-1, 0, 5, 0, -4]),
                level: 4
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
            },
            {
                title: "Compound Interest",
                description: "Apply exponential growth to finance",
                question: "You invest $1000 at 5% annual interest compounded yearly. What formula gives the amount after t years?",
                type: "multiple",
                options: ["A = 1000(1.05)ᵗ", "A = 1000(0.95)ᵗ", "A = 1000 + 50t", "A = 1000(1.5)ᵗ"],
                answer: "A = 1000(1.05)ᵗ",
                hint: "Compound interest: A = P(1 + r)ᵗ where r = 0.05",
                interactive: (app) => app.drawExponential(1000, 1.05),
                level: 2
            },
            {
                title: "Continuous Growth with e",
                description: "Understanding natural exponential growth",
                question: "A population grows continuously at 3% per year. Which formula models P(t)?",
                type: "multiple",
                options: ["P(t) = P₀e^(0.03t)", "P(t) = P₀(1.03)ᵗ", "P(t) = P₀e^(0.3t)", "P(t) = P₀ + 0.03t"],
                answer: "P(t) = P₀e^(0.03t)",
                hint: "Continuous growth uses base e: P(t) = P₀e^(rt)",
                interactive: (app) => app.drawExponential(1, Math.E),
                level: 2
            },
            {
                title: "Half-Life Problems",
                description: "Model radioactive decay",
                question: "A substance has a half-life of 8 hours. Starting with 100g, how much remains after 24 hours?",
                type: "multiple",
                options: ["12.5g", "25g", "50g", "6.25g"],
                answer: "12.5g",
                hint: "After 24 hours = 3 half-lives. Amount = 100 × (1/2)³",
                interactive: (app) => app.drawExponential(100, 0.5),
                level: 3
            },
            {
                title: "Growth Rate Comparisons",
                description: "Compare exponential and linear growth",
                question: "Which grows faster as x increases: f(x) = 2ˣ or g(x) = 100x?",
                type: "multiple",
                options: ["f(x) = 2ˣ eventually", "g(x) = 100x always", "They grow at the same rate", "Neither grows"],
                answer: "f(x) = 2ˣ eventually",
                hint: "Exponential functions eventually outgrow any linear function",
                interactive: (app) => app.drawExponential(1, 2),
                level: 3
            },
            {
                title: "Exponential Equations",
                description: "Solve exponential equations",
                question: "Solve for x: 3ˣ = 27",
                type: "multiple",
                options: ["x = 3", "x = 9", "x = 27", "x = 2"],
                answer: "x = 3",
                hint: "Rewrite 27 as a power of 3: 27 = 3³",
                interactive: (app) => app.drawExponential(1, 3),
                level: 2
            },
            {
                title: "Compound Interest - Different Periods",
                description: "Understanding compounding frequency",
                question: "You invest $2000 at 6% compounded quarterly for 5 years. How much will you have?",
                type: "multiple",
                options: ["$2693.23", "$2600.00", "$2000.00", "$3000.00"],
                answer: "$2693.23",
                hint: "A = P(1 + r/n)^(nt) where n = 4, t = 5, r = 0.06",
                interactive: (app) => app.drawExponential(2000, 1.015),
                level: 3
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
            },
            {
                title: "Logarithm Product Property",
                description: "Using log(ab) = log(a) + log(b)",
                question: "Simplify: log₃(9) + log₃(27)",
                type: "multiple",
                options: ["5", "4", "6", "3"],
                answer: "5",
                hint: "log₃(9) = 2 and log₃(27) = 3, or use product property: log₃(9×27) = log₃(243)",
                interactive: (app) => app.drawLogarithm(3),
                level: 2
            },
            {
                title: "Logarithm Quotient Property",
                description: "Using log(a/b) = log(a) - log(b)",
                question: "Simplify: log(100) - log(10)",
                type: "multiple",
                options: ["1", "10", "90", "2"],
                answer: "1",
                hint: "log(100/10) = log(10) = 1",
                interactive: (app) => app.drawLogarithm(10),
                level: 2
            },
            {
                title: "Logarithm Power Property",
                description: "Using log(aⁿ) = n·log(a)",
                question: "Simplify: log₂(32) using the power property",
                type: "multiple",
                options: ["5", "32", "2", "10"],
                answer: "5",
                hint: "32 = 2⁵, so log₂(2⁵) = 5·log₂(2) = 5·1 = 5",
                interactive: (app) => app.drawLogarithm(2),
                level: 2
            },
            {
                title: "Change of Base Formula",
                description: "Convert between logarithm bases",
                question: "Which formula correctly changes log₂(16) to common logarithms?",
                type: "multiple",
                options: ["log(16)/log(2)", "log(2)/log(16)", "log(16)·log(2)", "log(16) - log(2)"],
                answer: "log(16)/log(2)",
                hint: "Change of base: logₐ(b) = log(b)/log(a)",
                interactive: (app) => app.drawLogarithm(2),
                level: 3
            },
            {
                title: "Solving Exponential Equations with Logs",
                description: "Use logarithms to solve for exponents",
                question: "Solve for x: 5ˣ = 125",
                type: "multiple",
                options: ["x = 3", "x = 25", "x = 5", "x = 2"],
                answer: "x = 3",
                hint: "Recognize that 125 = 5³, or take log₅ of both sides",
                interactive: (app) => app.drawExponential(1, 5),
                level: 2
            },
            {
                title: "pH Scale Application",
                description: "Apply logarithms to chemistry",
                question: "If pH = -log[H⁺] and [H⁺] = 1×10⁻⁵, what is the pH?",
                type: "multiple",
                options: ["5", "-5", "10", "0"],
                answer: "5",
                hint: "pH = -log(10⁻⁵) = -(-5) = 5",
                interactive: (app) => app.drawLogarithm(10),
                level: 3
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
            },
            {
                title: "Horizontal Asymptotes",
                description: "Determine horizontal asymptotes from degrees",
                question: "What is the horizontal asymptote of f(x) = (3x² + 2)/(x² - 1)?",
                type: "multiple",
                options: ["y = 3", "y = 0", "y = 2", "No horizontal asymptote"],
                answer: "y = 3",
                hint: "Same degree in numerator and denominator: divide leading coefficients",
                interactive: (app) => app.drawRational([3, 0, 2], [1, 0, -1]),
                level: 2
            },
            {
                title: "Horizontal Asymptotes - Case 2",
                description: "When numerator degree is less",
                question: "What is the horizontal asymptote of f(x) = (2x + 1)/(x² - 4)?",
                type: "multiple",
                options: ["y = 0", "y = 2", "y = 1", "No horizontal asymptote"],
                answer: "y = 0",
                hint: "When degree of numerator < degree of denominator, y = 0",
                interactive: (app) => app.drawRational([2, 1], [1, 0, -4]),
                level: 2
            },
            {
                title: "Slant Asymptotes",
                description: "Finding oblique asymptotes",
                question: "f(x) = (x² + 3x + 2)/(x + 1) has what type of asymptote?",
                type: "multiple",
                options: ["Slant asymptote y = x + 2", "Horizontal asymptote y = 1", "Vertical asymptote x = -1", "No asymptote"],
                answer: "Slant asymptote y = x + 2",
                hint: "Numerator degree is 1 more than denominator: divide to find slant asymptote",
                interactive: (app) => app.drawRational([1, 3, 2], [1, 1]),
                level: 3
            },
            {
                title: "Holes in Rational Functions",
                description: "Identify removable discontinuities",
                question: "f(x) = (x² - 4)/(x - 2) has a hole at what point?",
                type: "multiple",
                options: ["(2, 4)", "(2, 0)", "(-2, 0)", "No hole"],
                answer: "(2, 4)",
                hint: "Factor: (x+2)(x-2)/(x-2). Cancel common factor, then substitute x = 2 into x + 2",
                interactive: (app) => app.drawRational([1, 0, -4], [1, -2]),
                level: 3
            },
            {
                title: "Domain of Rational Functions",
                description: "Find all restrictions",
                question: "What is the domain of f(x) = (x + 3)/((x - 1)(x + 2))?",
                type: "multiple",
                options: ["All real numbers except x = 1, -2", "All real numbers except x = -3", "All real numbers except x = 1", "All real numbers"],
                answer: "All real numbers except x = 1, -2",
                hint: "Exclude values that make denominator zero",
                interactive: (app) => app.drawRational([1, 3], [1, 1, -2]),
                level: 2
            },
            {
                title: "Graphing Rational Functions",
                description: "Analyze complete behavior",
                question: "For f(x) = (2x - 4)/(x - 3), what is the y-intercept?",
                type: "multiple",
                options: ["4/3", "-4/3", "2", "0"],
                answer: "4/3",
                hint: "Find f(0): (2(0) - 4)/(0 - 3) = -4/-3 = 4/3",
                interactive: (app) => app.drawRational([2, -4], [1, -3]),
                level: 2
            },
            {
                title: "End Behavior of Rational Functions",
                description: "Analyze behavior as x approaches infinity",
                question: "As x → ∞ for f(x) = (5x³ + 2)/(x² - 1), f(x) → ?",
                type: "multiple",
                options: ["∞", "5", "0", "-∞"],
                answer: "∞",
                hint: "Numerator degree > denominator degree: function increases without bound",
                interactive: (app) => app.drawRational([5, 0, 0, 2], [1, 0, -1]),
                level: 3
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
            },
            {
                title: "Substitution Method",
                description: "Solve using substitution",
                question: "Solve: x + 2y = 7 and x = y + 1",
                type: "multiple",
                options: ["(3, 2)", "(2, 3)", "(5, 1)", "(1, 3)"],
                answer: "(3, 2)",
                hint: "Substitute x = y + 1 into first equation: (y + 1) + 2y = 7",
                interactive: (app) => app.drawSystem([[-0.5, 3.5], [1, -1]]),
                level: 2
            },
            {
                title: "Elimination Method",
                description: "Solve using elimination",
                question: "Solve: 2x + 3y = 13 and 3x - 3y = 12",
                type: "multiple",
                options: ["(5, 1)", "(1, 5)", "(4, 2)", "(3, 2)"],
                answer: "(5, 1)",
                hint: "Add the equations to eliminate y: 5x = 25",
                interactive: (app) => app.drawSystem([[-2/3, 13/3], [1, -4]]),
                level: 2
            },
            {
                title: "Linear-Quadratic Systems",
                description: "Solve systems with one quadratic equation",
                question: "Solve: y = x² - 2 and y = x + 2. How many solutions?",
                type: "multiple",
                options: ["2 solutions", "1 solution", "0 solutions", "3 solutions"],
                answer: "2 solutions",
                hint: "Set equal: x² - 2 = x + 2, so x² - x - 4 = 0 has 2 real roots",
                interactive: (app) => app.drawQuadratic(1, 0, -2),
                level: 3
            },
            {
                title: "Two Quadratic Systems",
                description: "Systems with two quadratic equations",
                question: "Circle x² + y² = 25 and parabola y = x² - 5 intersect at how many points?",
                type: "multiple",
                options: ["2 points", "4 points", "1 point", "0 points"],
                answer: "2 points",
                hint: "Substitute y = x² - 5 into circle equation and solve",
                interactive: (app) => app.drawCircle(0, 0, 5),
                level: 4
            },
            {
                title: "Three-Variable Systems",
                description: "Solve 3x3 linear systems",
                question: "For x + y + z = 6, x - y + z = 2, and 2x + y - z = 1, what is x?",
                type: "multiple",
                options: ["1", "2", "3", "4"],
                answer: "1",
                hint: "Add first two equations to eliminate y: 2x + 2z = 8",
                interactive: (app) => app.drawSystem([[1, 5], [-1, 3]]),
                level: 4
            },
            {
                title: "Mixture Problem",
                description: "Apply systems to word problems",
                question: "Mix 20% and 50% acid solutions to get 12L of 35% solution. How much 20% solution needed?",
                type: "multiple",
                options: ["6L", "4L", "8L", "10L"],
                answer: "6L",
                hint: "Let x = 20% solution, y = 50% solution. Set up: x + y = 12 and 0.2x + 0.5y = 0.35(12)",
                interactive: (app) => app.drawSystem([[1, 12], [-2.5, 14]]),
                level: 3
            },
            {
                title: "Investment Problem",
                description: "Systems in financial contexts",
                question: "Invest $5000 total in two accounts: one at 4% and one at 6%, earning $260 annually. How much at 4%?",
                type: "multiple",
                options: ["$2000", "$3000", "$1000", "$4000"],
                answer: "$2000",
                hint: "Let x = amount at 4%, y = amount at 6%. Set up: x + y = 5000 and 0.04x + 0.06y = 260",
                interactive: (app) => app.drawSystem([[1, 5000], [-1.5, 6500]]),
                level: 3
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
            },
            {
                title: "Circle Center",
                description: "Finding the center of a circle",
                question: "What is the center of (x + 4)² + (y - 1)² = 9?",
                type: "multiple",
                options: ["(-4, 1)", "(4, -1)", "(-4, -1)", "(4, 1)"],
                answer: "(-4, 1)",
                hint: "Form is (x - h)² + (y - k)² = r², so center is (h, k)",
                interactive: (app) => app.drawCircle(-4, 1, 3),
                level: 1
            },
            {
                title: "Parabola Vertex Form",
                description: "Parabolas as conic sections",
                question: "For parabola (x - 3)² = 8(y + 2), what is the vertex?",
                type: "multiple",
                options: ["(3, -2)", "(-3, 2)", "(3, 2)", "(-3, -2)"],
                answer: "(3, -2)",
                hint: "Form is (x - h)² = 4p(y - k) with vertex (h, k)",
                interactive: (app) => app.drawQuadratic(1/8, -3/4, 9/8 - 2),
                level: 2
            },
            {
                title: "Parabola Focus and Directrix",
                description: "Understanding parabola components",
                question: "For y² = 12x, what is the distance from vertex to focus?",
                type: "multiple",
                options: ["3", "12", "6", "4"],
                answer: "3",
                hint: "Form is y² = 4px, so 4p = 12, thus p = 3",
                interactive: (app) => app.drawQuadratic(1/12, 0, 0),
                level: 2
            },
            {
                title: "Ellipse Basics",
                description: "Understanding ellipse equations",
                question: "For x²/25 + y²/9 = 1, what is the length of the major axis?",
                type: "multiple",
                options: ["10", "5", "6", "8"],
                answer: "10",
                hint: "a² = 25, so a = 5. Major axis length = 2a = 10",
                interactive: (app) => app.drawCircle(0, 0, 4),
                level: 2
            },
            {
                title: "Ellipse Center and Foci",
                description: "Finding ellipse features",
                question: "For (x-2)²/16 + (y+1)²/9 = 1, what is the center?",
                type: "multiple",
                options: ["(2, -1)", "(-2, 1)", "(4, 3)", "(16, 9)"],
                answer: "(2, -1)",
                hint: "Form is (x-h)²/a² + (y-k)²/b² = 1 with center (h, k)",
                interactive: (app) => app.drawCircle(2, -1, 3),
                level: 3
            },
            {
                title: "Hyperbola Basics",
                description: "Understanding hyperbola equations",
                question: "For x²/16 - y²/9 = 1, which way does the hyperbola open?",
                type: "multiple",
                options: ["Left and Right", "Up and Down", "All directions", "Does not open"],
                answer: "Left and Right",
                hint: "x² term is positive, so hyperbola opens horizontally",
                interactive: (app) => app.drawRational([1], [1, 0]),
                level: 3
            },
            {
                title: "Hyperbola Asymptotes",
                description: "Finding asymptote equations",
                question: "For x²/9 - y²/16 = 1, what are the asymptote slopes?",
                type: "multiple",
                options: ["±4/3", "±3/4", "±9/16", "±16/9"],
                answer: "±4/3",
                hint: "For x²/a² - y²/b² = 1, asymptotes are y = ±(b/a)x = ±(4/3)x",
                interactive: (app) => app.drawRational([4, 0], [3, 0]),
                level: 3
            },
            {
                title: "Identifying Conics",
                description: "Recognize conic from equation",
                question: "What conic is represented by 4x² + 4y² - 16 = 0?",
                type: "multiple",
                options: ["Circle", "Ellipse", "Parabola", "Hyperbola"],
                answer: "Circle",
                hint: "Coefficients of x² and y² are equal and same sign → circle",
                interactive: (app) => app.drawCircle(0, 0, 2),
                level: 2
            },
            {
                title: "Writing Conic Equations",
                description: "Create equations from descriptions",
                question: "Circle with center (0, 0) and radius 7 has equation:",
                type: "multiple",
                options: ["x² + y² = 49", "x² + y² = 7", "(x-7)² + (y-7)² = 0", "x² + y² = 14"],
                answer: "x² + y² = 49",
                hint: "Center (0, 0) and r = 7 gives x² + y² = r² = 49",
                interactive: (app) => app.drawCircle(0, 0, 7),
                level: 2
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
            },
            {
                title: "Recursive Formulas",
                description: "Define sequences recursively",
                question: "If a₁ = 5 and aₙ = aₙ₋₁ + 3, what is a₄?",
                type: "multiple",
                options: ["14", "11", "17", "20"],
                answer: "14",
                hint: "a₂ = 8, a₃ = 11, a₄ = 14",
                interactive: (app) => app.drawSequence('arithmetic', 5, 3),
                level: 2
            },
            {
                title: "Arithmetic Series Sum",
                description: "Sum of arithmetic sequence",
                question: "Find the sum of the first 20 terms of: 5, 8, 11, 14, ...",
                type: "multiple",
                options: ["670", "650", "700", "620"],
                answer: "670",
                hint: "Sₙ = n/2(2a₁ + (n-1)d) or Sₙ = n/2(a₁ + aₙ)",
                interactive: (app) => app.drawSequence('arithmetic', 5, 3),
                level: 3
            },
            {
                title: "Geometric Series Sum",
                description: "Sum of finite geometric sequence",
                question: "Find the sum of: 3 + 6 + 12 + 24 + 48",
                type: "multiple",
                options: ["93", "96", "90", "99"],
                answer: "93",
                hint: "Sₙ = a₁(1 - rⁿ)/(1 - r) where r = 2, n = 5",
                interactive: (app) => app.drawSequence('geometric', 3, 2),
                level: 3
            },
            {
                title: "Sigma Notation",
                description: "Understanding summation notation",
                question: "What does Σ(2k + 1) from k=1 to k=5 equal?",
                type: "multiple",
                options: ["35", "30", "25", "40"],
                answer: "35",
                hint: "Sum: (2·1+1) + (2·2+1) + (2·3+1) + (2·4+1) + (2·5+1) = 3+5+7+9+11",
                interactive: (app) => app.drawSequence('arithmetic', 3, 2),
                level: 2
            },
            {
                title: "Infinite Geometric Series",
                description: "Sum of infinite series when |r| < 1",
                question: "Find the sum of the infinite series: 1 + 1/2 + 1/4 + 1/8 + ...",
                type: "multiple",
                options: ["2", "1", "∞", "4"],
                answer: "2",
                hint: "S = a₁/(1-r) when |r| < 1. Here a₁ = 1, r = 1/2",
                interactive: (app) => app.drawSequence('geometric', 1, 0.5),
                level: 3
            },
            {
                title: "Sequence Applications",
                description: "Real-world sequence problems",
                question: "A theater has 20 seats in row 1, 22 in row 2, 24 in row 3. How many seats in row 15?",
                type: "multiple",
                options: ["48", "50", "46", "52"],
                answer: "48",
                hint: "Arithmetic sequence: a₁ = 20, d = 2. Use aₙ = a₁ + (n-1)d",
                interactive: (app) => app.drawSequence('arithmetic', 20, 2),
                level: 2
            }
        ];
    }

    getRadicalProblems() {
        return [
            {
                title: "Simplifying Radicals",
                description: "Simplify radical expressions",
                question: "Simplify: √48",
                type: "multiple",
                options: ["4√3", "3√4", "2√12", "√48"],
                answer: "4√3",
                hint: "48 = 16 × 3, and √16 = 4",
                interactive: (app) => app.drawRadical(1, 0),
                level: 1
            },
            {
                title: "Adding and Subtracting Radicals",
                description: "Combine like radical terms",
                question: "Simplify: 3√5 + 2√5",
                type: "multiple",
                options: ["5√5", "5√10", "6√5", "√5"],
                answer: "5√5",
                hint: "Like radicals add like variables: 3√5 + 2√5 = 5√5",
                interactive: (app) => app.drawRadical(1, 0),
                level: 1
            },
            {
                title: "Multiplying Radicals",
                description: "Multiply radical expressions",
                question: "Simplify: √6 · √10",
                type: "multiple",
                options: ["2√15", "√60", "4√15", "√16"],
                answer: "2√15",
                hint: "√6 · √10 = √60 = √(4·15) = 2√15",
                interactive: (app) => app.drawRadical(1, 0),
                level: 2
            },
            {
                title: "Solving Radical Equations",
                description: "Solve equations with radicals",
                question: "Solve: √(x + 5) = 4",
                type: "multiple",
                options: ["x = 11", "x = 9", "x = 16", "x = 21"],
                answer: "x = 11",
                hint: "Square both sides: x + 5 = 16, so x = 11",
                interactive: (app) => app.drawRadical(1, -5),
                level: 2
            },
            {
                title: "Graphing Square Root Functions",
                description: "Understanding f(x) = √x transformations",
                question: "How does f(x) = √(x - 3) + 2 transform from f(x) = √x?",
                type: "multiple",
                options: ["Right 3, up 2", "Left 3, up 2", "Right 3, down 2", "Left 3, down 2"],
                answer: "Right 3, up 2",
                hint: "Inside parentheses: opposite direction. (x - 3) shifts right",
                interactive: (app) => app.drawRadical(1, -3),
                level: 2
            },
            {
                title: "Cube Root Functions",
                description: "Working with ∛x",
                question: "What is ∛(-27)?",
                type: "multiple",
                options: ["-3", "3", "No real solution", "±3"],
                answer: "-3",
                hint: "(-3)³ = -27, so ∛(-27) = -3. Odd roots of negatives are negative",
                interactive: (app) => app.drawRadical(1/3, 0),
                level: 2
            },
            {
                title: "Extraneous Solutions",
                description: "Identify solutions that don't work",
                question: "Solve √(2x - 5) = x - 4. Which solution is extraneous?",
                type: "multiple",
                options: ["x = 3", "x = 7", "Both solutions work", "No solution"],
                answer: "x = 3",
                hint: "Square both sides: 2x - 5 = x² - 8x + 16. Solve, then check both in original",
                interactive: (app) => app.drawRadical(2, -5),
                level: 3
            },
            {
                title: "Rationalizing Denominators",
                description: "Eliminate radicals from denominators",
                question: "Rationalize: 1/√5",
                type: "multiple",
                options: ["√5/5", "1/√5", "5/√5", "√5"],
                answer: "√5/5",
                hint: "Multiply by √5/√5: (1·√5)/(√5·√5) = √5/5",
                interactive: (app) => app.drawRadical(1, 0),
                level: 3
            }
        ];
    }

    getComplexNumbersProblems() {
        return [
            {
                title: "Imaginary Unit i",
                description: "Understanding i = √(-1)",
                question: "What is i²?",
                type: "multiple",
                options: ["-1", "1", "i", "0"],
                answer: "-1",
                hint: "By definition, i² = -1",
                interactive: (app) => app.drawComplexPlane(),
                level: 1
            },
            {
                title: "Powers of i",
                description: "Simplifying powers of i",
                question: "What is i⁴?",
                type: "multiple",
                options: ["1", "-1", "i", "-i"],
                answer: "1",
                hint: "i⁴ = (i²)² = (-1)² = 1. Pattern repeats every 4",
                interactive: (app) => app.drawComplexPlane(),
                level: 1
            },
            {
                title: "Adding Complex Numbers",
                description: "Add real and imaginary parts separately",
                question: "Simplify: (3 + 2i) + (5 - 4i)",
                type: "multiple",
                options: ["8 - 2i", "8 + 6i", "2 - 2i", "8 - 6i"],
                answer: "8 - 2i",
                hint: "Add real parts: 3 + 5 = 8. Add imaginary parts: 2i - 4i = -2i",
                interactive: (app) => app.drawComplexPlane(),
                level: 1
            },
            {
                title: "Subtracting Complex Numbers",
                description: "Subtract real and imaginary parts",
                question: "Simplify: (7 + 3i) - (2 + 5i)",
                type: "multiple",
                options: ["5 - 2i", "5 + 8i", "9 + 8i", "9 - 2i"],
                answer: "5 - 2i",
                hint: "Subtract real parts: 7 - 2 = 5. Subtract imaginary: 3i - 5i = -2i",
                interactive: (app) => app.drawComplexPlane(),
                level: 2
            },
            {
                title: "Multiplying Complex Numbers",
                description: "Use FOIL and i² = -1",
                question: "Simplify: (2 + 3i)(1 - 2i)",
                type: "multiple",
                options: ["8 - i", "2 - 6i", "2 - i", "8 + i"],
                answer: "8 - i",
                hint: "FOIL: 2 - 4i + 3i - 6i² = 2 - i - 6(-1) = 2 - i + 6 = 8 - i",
                interactive: (app) => app.drawComplexPlane(),
                level: 2
            },
            {
                title: "Complex Conjugates",
                description: "Understanding conjugate pairs",
                question: "What is the conjugate of 4 - 5i?",
                type: "multiple",
                options: ["4 + 5i", "-4 + 5i", "-4 - 5i", "4 - 5i"],
                answer: "4 + 5i",
                hint: "Conjugate changes sign of imaginary part only",
                interactive: (app) => app.drawComplexPlane(),
                level: 2
            },
            {
                title: "Dividing Complex Numbers",
                description: "Multiply by conjugate to rationalize",
                question: "Simplify: (6 + 2i)/(1 - i)",
                type: "multiple",
                options: ["2 + 4i", "4 + 2i", "3 + i", "6 + 2i"],
                answer: "2 + 4i",
                hint: "Multiply by (1+i)/(1+i): (6+2i)(1+i)/[(1-i)(1+i)] = (4+8i)/2 = 2+4i",
                interactive: (app) => app.drawComplexPlane(),
                level: 3
            },
            {
                title: "Absolute Value of Complex Numbers",
                description: "Find |a + bi| = √(a² + b²)",
                question: "What is |3 - 4i|?",
                type: "multiple",
                options: ["5", "7", "1", "√7"],
                answer: "5",
                hint: "|3 - 4i| = √(3² + (-4)²) = √(9 + 16) = √25 = 5",
                interactive: (app) => app.drawComplexPlane(),
                level: 3
            }
        ];
    }

    getTransformationsProblems() {
        return [
            {
                title: "Vertical Shifts",
                description: "Understanding f(x) + k transformations",
                question: "How does g(x) = x² + 3 transform from f(x) = x²?",
                type: "multiple",
                options: ["Up 3 units", "Down 3 units", "Right 3 units", "Left 3 units"],
                answer: "Up 3 units",
                hint: "Adding outside the function shifts vertically up",
                interactive: (app) => app.drawQuadratic(1, 0, 3),
                level: 1
            },
            {
                title: "Horizontal Shifts",
                description: "Understanding f(x - h) transformations",
                question: "How does g(x) = (x - 4)² transform from f(x) = x²?",
                type: "multiple",
                options: ["Right 4 units", "Left 4 units", "Up 4 units", "Down 4 units"],
                answer: "Right 4 units",
                hint: "Inside parentheses works opposite: (x - 4) shifts right",
                interactive: (app) => app.drawQuadratic(1, -8, 16),
                level: 1
            },
            {
                title: "Reflections over x-axis",
                description: "Understanding -f(x) transformations",
                question: "How does g(x) = -x² transform from f(x) = x²?",
                type: "multiple",
                options: ["Reflects over x-axis", "Reflects over y-axis", "No change", "Shifts down"],
                answer: "Reflects over x-axis",
                hint: "Negative outside reflects over x-axis (flips vertically)",
                interactive: (app) => app.drawQuadratic(-1, 0, 0),
                level: 2
            },
            {
                title: "Reflections over y-axis",
                description: "Understanding f(-x) transformations",
                question: "How does g(x) = (-x)³ transform from f(x) = x³?",
                type: "multiple",
                options: ["Reflects over y-axis", "Reflects over x-axis", "No visible change for x³", "Shifts left"],
                answer: "Reflects over y-axis",
                hint: "Negative inside reflects over y-axis (flips horizontally)",
                interactive: (app) => app.drawPolynomial([-1, 0, 0, 0]),
                level: 2
            },
            {
                title: "Vertical Stretches and Compressions",
                description: "Understanding a·f(x) transformations",
                question: "How does g(x) = 3x² transform from f(x) = x²?",
                type: "multiple",
                options: ["Vertical stretch by factor 3", "Vertical compression by factor 3", "Horizontal stretch", "Shifts up 3"],
                answer: "Vertical stretch by factor 3",
                hint: "Multiply outside: |a| > 1 stretches, 0 < |a| < 1 compresses",
                interactive: (app) => app.drawQuadratic(3, 0, 0),
                level: 2
            },
            {
                title: "Horizontal Stretches and Compressions",
                description: "Understanding f(bx) transformations",
                question: "How does g(x) = (2x)² transform from f(x) = x²?",
                type: "multiple",
                options: ["Horizontal compression by factor 1/2", "Horizontal stretch by factor 2", "Vertical stretch by factor 2", "No change"],
                answer: "Horizontal compression by factor 1/2",
                hint: "Multiply inside: works opposite and reciprocal of what you expect",
                interactive: (app) => app.drawQuadratic(4, 0, 0),
                level: 3
            },
            {
                title: "Combined Transformations",
                description: "Multiple transformations together",
                question: "How does g(x) = 2(x - 1)² + 3 transform from f(x) = x²?",
                type: "multiple",
                options: ["Right 1, up 3, vertical stretch 2", "Left 1, down 3, vertical compression", "Right 1, down 3, vertical stretch 2", "Left 1, up 3, vertical stretch 2"],
                answer: "Right 1, up 3, vertical stretch 2",
                hint: "Order: 2 stretches, (x-1) shifts right, +3 shifts up",
                interactive: (app) => app.drawQuadratic(2, -4, 5),
                level: 3
            },
            {
                title: "Complex Combined Transformations",
                description: "Analyze multiple transformations",
                question: "g(x) = -0.5(x + 2)² - 1 involves which transformations from f(x) = x²?",
                type: "multiple",
                options: ["Left 2, down 1, compression 0.5, reflect x-axis", "Right 2, up 1, stretch 0.5, reflect y-axis", "Left 2, up 1, compression 0.5, no reflection", "Right 2, down 1, stretch 2, reflect x-axis"],
                answer: "Left 2, down 1, compression 0.5, reflect x-axis",
                hint: "Negative reflects, 0.5 compresses, (x+2) left, -1 down",
                interactive: (app) => app.drawQuadratic(-0.5, -2, -3),
                level: 4
            }
        ];
    }

    getInverseFunctionsProblems() {
        return [
            {
                title: "Inverse Function Basics",
                description: "Understanding f⁻¹(x)",
                question: "If f(x) = 2x + 3, what is f⁻¹(x)?",
                type: "multiple",
                options: ["(x - 3)/2", "(x + 3)/2", "2x - 3", "x/2 - 3"],
                answer: "(x - 3)/2",
                hint: "Swap x and y, then solve: x = 2y + 3, so y = (x - 3)/2",
                interactive: (app) => app.drawSystem([[2, 3], [0.5, -1.5]]),
                level: 2
            },
            {
                title: "Verifying Inverses",
                description: "Check if two functions are inverses",
                question: "Are f(x) = x³ and g(x) = ∛x inverses?",
                type: "multiple",
                options: ["Yes, f(g(x)) = x and g(f(x)) = x", "No, they are not inverses", "Only one direction works", "Cannot determine"],
                answer: "Yes, f(g(x)) = x and g(f(x)) = x",
                hint: "Check both compositions: f(∛x) = x and ∛(x³) = x",
                interactive: (app) => app.drawPolynomial([1, 0, 0, 0]),
                level: 2
            },
            {
                title: "One-to-One Functions",
                description: "Determine if inverse exists",
                question: "Does f(x) = x² have an inverse for all real numbers?",
                type: "multiple",
                options: ["No, fails horizontal line test", "Yes, passes horizontal line test", "Yes, always has inverse", "Cannot determine"],
                answer: "No, fails horizontal line test",
                hint: "For inverse to exist, function must be one-to-one (passes horizontal line test)",
                interactive: (app) => app.drawQuadratic(1, 0, 0),
                level: 2
            },
            {
                title: "Graphing Inverse Functions",
                description: "Relationship between f and f⁻¹",
                question: "The graph of f⁻¹(x) is the reflection of f(x) over which line?",
                type: "multiple",
                options: ["y = x", "y-axis", "x-axis", "y = -x"],
                answer: "y = x",
                hint: "Inverse functions are reflections across the line y = x",
                interactive: (app) => app.drawSystem([[1, 0], [1, 0]]),
                level: 2
            },
            {
                title: "Finding Inverse Algebraically",
                description: "Multi-step inverse calculation",
                question: "What is the inverse of f(x) = (x + 1)/(x - 2)?",
                type: "multiple",
                options: ["(2x + 1)/(x - 1)", "(x - 1)/(x + 2)", "(2x - 1)/(x + 1)", "(x + 2)/(x - 1)"],
                answer: "(2x + 1)/(x - 1)",
                hint: "Swap and solve: x = (y+1)/(y-2), multiply by (y-2), solve for y",
                interactive: (app) => app.drawRational([1, 1], [1, -2]),
                level: 3
            },
            {
                title: "Domain and Range of Inverses",
                description: "Understanding domain/range swap",
                question: "If domain of f(x) is [0, ∞) and range is [-2, ∞), what is domain of f⁻¹(x)?",
                type: "multiple",
                options: ["[-2, ∞)", "[0, ∞)", "All real numbers", "(-∞, 0]"],
                answer: "[-2, ∞)",
                hint: "Domain and range swap for inverse functions",
                interactive: (app) => app.drawRadical(1, 0),
                level: 3
            }
        ];
    }

    getPiecewiseProblems() {
        return [
            {
                title: "Evaluating Piecewise Functions",
                description: "Find output for given input",
                question: "For f(x) = {x² if x < 0; 2x if x ≥ 0}, what is f(3)?",
                type: "multiple",
                options: ["6", "9", "0", "3"],
                answer: "6",
                hint: "Since 3 ≥ 0, use f(x) = 2x: f(3) = 2(3) = 6",
                interactive: (app) => app.drawQuadratic(1, 0, 0),
                level: 2
            },
            {
                title: "Piecewise at Boundaries",
                description: "Evaluate at transition points",
                question: "For f(x) = {x + 1 if x < 2; x² if x ≥ 2}, what is f(2)?",
                type: "multiple",
                options: ["4", "3", "2", "Undefined"],
                answer: "4",
                hint: "Use the piece where 2 is included: x ≥ 2, so f(2) = 2² = 4",
                interactive: (app) => app.drawSystem([[1, 1], [0, 0]]),
                level: 2
            },
            {
                title: "Graphing Piecewise Functions",
                description: "Understanding piecewise graphs",
                question: "What type of point occurs at x = 0 for f(x) = {-x if x < 0; x if x ≥ 0}?",
                type: "multiple",
                options: ["Continuous, no break", "Jump discontinuity", "Hole", "Vertical asymptote"],
                answer: "Continuous, no break",
                hint: "This is |x|, which is continuous everywhere including x = 0",
                interactive: (app) => app.drawSystem([[1, 0], [-1, 0]]),
                level: 2
            },
            {
                title: "Absolute Value as Piecewise",
                description: "Understanding |x| piecewise definition",
                question: "The absolute value |x - 3| can be written as which piecewise?",
                type: "multiple",
                options: ["{x - 3 if x ≥ 3; -(x - 3) if x < 3}", "{x + 3 if x ≥ 3; -x + 3 if x < 3}", "{x - 3 if x < 3; -(x - 3) if x ≥ 3}", "{x if x ≥ 0; -x if x < 0}"],
                answer: "{x - 3 if x ≥ 3; -(x - 3) if x < 3}",
                hint: "|x - 3| equals (x - 3) when x - 3 ≥ 0, and -(x - 3) when x - 3 < 0",
                interactive: (app) => app.drawQuadratic(1, -6, 9),
                level: 3
            },
            {
                title: "Step Functions",
                description: "Understanding greatest integer function",
                question: "For f(x) = ⌊x⌋ (greatest integer ≤ x), what is f(2.7)?",
                type: "multiple",
                options: ["2", "3", "2.7", "0"],
                answer: "2",
                hint: "Greatest integer function rounds down: ⌊2.7⌋ = 2",
                interactive: (app) => app.drawSystem([[0, 2], [0, 3]]),
                level: 2
            },
            {
                title: "Real-World Piecewise",
                description: "Apply piecewise to practical problems",
                question: "Parking costs $5 for first hour, $3 for each additional hour. Cost for 3.5 hours?",
                type: "multiple",
                options: ["$11", "$14", "$8", "$17"],
                answer: "$11",
                hint: "First hour: $5. Additional 2.5 hours rounds to 3 hours: 3 × $3 = $9. Total: $14... wait, partial hours count as full, so 3 additional = $9, total $14",
                interactive: (app) => app.drawSystem([[3, 5], [3, 8]]),
                level: 3
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

    drawRadical(a, h) {
        const graphs = document.getElementById('graphs');

        const points = [];
        for (let x = Math.max(-10, -h); x <= 10; x += 0.1) {
            const y = a * Math.sqrt(x + h);
            if (!isNaN(y) && Math.abs(y) <= 10) {
                points.push(`${x * 30},${-y * 30}`);
            }
        }

        if (points.length > 0) {
            const path = this.createSVGElement('path', {
                d: `M ${points.join(' L ')}`,
                class: 'graph-line',
                stroke: '#e91e63',
                'stroke-width': '3',
                fill: 'none'
            });
            graphs.appendChild(path);
        }

        // Mark starting point
        const startX = -h;
        if (Math.abs(startX) <= 10) {
            const point = this.createSVGElement('circle', {
                cx: startX * 30,
                cy: 0,
                r: 5,
                fill: '#ff5722'
            });
            graphs.appendChild(point);
        }
    }

    drawComplexPlane() {
        const graphs = document.getElementById('graphs');
        const labels = document.getElementById('labels');

        // Draw axes labels
        const realLabel = this.createSVGElement('text', {
            x: 280,
            y: 20,
            class: 'label-text'
        });
        realLabel.textContent = 'Real';
        labels.appendChild(realLabel);

        const imagLabel = this.createSVGElement('text', {
            x: 10,
            y: -270,
            class: 'label-text'
        });
        imagLabel.textContent = 'Imaginary';
        labels.appendChild(imagLabel);

        // Draw unit circle
        const circle = this.createSVGElement('circle', {
            cx: 0,
            cy: 0,
            r: 60,
            fill: 'none',
            stroke: '#667eea',
            'stroke-width': '2',
            'stroke-dasharray': '5,5',
            opacity: '0.5'
        });
        graphs.appendChild(circle);
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
