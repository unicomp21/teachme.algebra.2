# 📐 Adaptive Algebra 2 Teaching App

An interactive, SVG-based algebra learning application with touch support, designed for GitHub Pages.

## Features

### 🎯 Interactive Learning
- **SVG-based Graphics**: Smooth, scalable visualizations of mathematical concepts
- **Touch & Mouse Support**: Full mobile and desktop compatibility
- **Drag-and-Drop**: Interactive elements to explore mathematical relationships

### 📚 Comprehensive Algebra 2 Topics
1. **Quadratic Functions** - Standard form, vertex form, solving
2. **Polynomials** - Degree, end behavior, graphing
3. **Exponential Functions** - Growth and decay models
4. **Logarithms** - Inverse of exponentials, natural logarithms
5. **Rational Functions** - Asymptotes and discontinuities
6. **Systems of Equations** - Linear systems, intersections
7. **Conic Sections** - Circles, ellipses, parabolas
8. **Sequences & Series** - Arithmetic and geometric sequences

### 🧠 Adaptive Learning System
- **Performance Tracking**: Monitors student progress and mastery
- **Dynamic Difficulty**: Adjusts problem difficulty based on performance
- **Score & Streak System**: Gamification to increase engagement
- **Hint System**: Contextual hints when students need help

### 📱 Responsive Design
- Mobile-first design with touch gestures
- Desktop mouse support
- Adaptive layouts for all screen sizes
- Clean, modern UI with smooth animations

## How to Use

1. **Choose a Topic**: Select from 8 algebra topics in the topic selector
2. **Learn**: Read the lesson description and explore the interactive graph
3. **Practice**: Answer questions to test your understanding
4. **Get Feedback**: Receive instant feedback and hints
5. **Progress**: Level up as you master topics

## Technical Details

### Technologies
- Pure HTML5, CSS3, and JavaScript
- SVG for scalable graphics
- Touch Events API for mobile support
- LocalStorage for progress persistence (optional)

### File Structure
```
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── app.js          # Application logic and interactivity
└── README.md       # This file
```

### SVG Coordinate System
- ViewBox: -300 to 300 on both axes
- Grid spacing: 30 units (representing 1 unit in math space)
- Responsive scaling maintains aspect ratio

## GitHub Pages Deployment

This app is ready to deploy on GitHub Pages:

1. Push files to your repository
2. Go to Settings → Pages
3. Select branch (usually `main` or `master`)
4. Save and wait for deployment
5. Access at `https://username.github.io/repository-name/`

## Features Breakdown

### Touch Event Handling
- **touchstart**: Begin drag operations
- **touchmove**: Update draggable elements
- **touchend**: Complete interactions
- Prevents default scrolling for better UX

### Adaptive Algorithm
- Tracks correct/incorrect answers per topic
- Calculates mastery percentage
- Adjusts user level (1-5) based on performance:
  - >80% mastery → level up
  - <40% mastery → level down

### Scoring System
- Base points: 10 per correct answer
- Penalty: -2 points per hint used
- Minimum: 5 points per problem
- Streak bonus: Consecutive correct answers

## Future Enhancements

- [ ] Save progress with localStorage
- [ ] More interactive problem types
- [ ] Step-by-step solution walkthroughs
- [ ] Achievement badges
- [ ] Leaderboard (with backend)
- [ ] More advanced topics
- [ ] Practice mode vs. Test mode
- [ ] Export progress reports

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Feel free to use and modify for educational purposes

## Contributing

Contributions welcome! Areas for improvement:
- Additional problem types
- More visualization options
- Accessibility enhancements
- Internationalization

---

Made with ❤️ for algebra students everywhere
