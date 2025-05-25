# Intonation Ear Trainer App

A React-based web application that replicates the functionality of the Intonation Ear Trainer iOS ear training app. Train your ear to distinguish fine pitch differences and improve your musical intonation skills.

![Intonation Ear Trainer App Screenshot](https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Intonation+Ear+Trainer+App)

## 🎵 What is Intonation Ear Trainer?

Intonation Ear Trainer is an ear training tool designed to help musicians develop their ability to perceive subtle pitch differences. Unlike traditional interval training apps that focus on identifying named musical intervals, Intonation Ear Trainer specifically targets **pitch acuity** - the ability to distinguish whether one pitch is higher or lower than another by very small amounts.

This skill is essential for:
- **Intonation** - Playing or singing in tune
- **Ensemble playing** - Staying in tune with other musicians  
- **Instrument tuning** - Fine-tuning instruments by ear
- **General pitch awareness** - Developing a more sensitive musical ear

## 🎯 Features

### Core Gameplay
- **Sequential Pitch Comparison**: Listen to two pitches and identify if the second is higher or lower
- **Adaptive Difficulty**: Pitch differences automatically decrease with correct answers and increase with mistakes
- **Three Strikes System**: Game ends after three incorrect answers
- **Real-time Scoring**: Track your progress with immediate feedback

### Game Modes
- **High Register**: First pitch consistently in upper range (660-1320 Hz)
- **Medium Register**: First pitch in middle range (330-660 Hz) 
- **Low Register**: First pitch in lower range (110-220 Hz)
- **Changing Register**: Randomized first pitch across full range

### Enhanced Features
- **Sound Effects**: Pleasant audio feedback for correct/incorrect answers
- **Visual Animations**: Animated feedback with checkmarks and X's
- **High Score Tracking**: Local storage of best scores for each mode
- **Keyboard Controls**: Arrow keys and 'R' for replay functionality
- **Replay Feature**: Re-listen to pitch pairs during gameplay
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/intune-ear-training.git
   cd intune-ear-training
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🎮 How to Play

1. **Select a Mode**: Choose your preferred pitch register in Settings
2. **Start the Game**: Click "Start Game" or press the play button
3. **Listen Carefully**: Two pitches will play sequentially
4. **Make Your Choice**: Click "Higher" or "Lower" based on the second pitch
5. **Track Progress**: Watch your difficulty level decrease as you improve
6. **Avoid Strikes**: Three wrong answers will end the game

### Keyboard Controls
- **↑ (Up Arrow)**: Select "Higher"
- **↓ (Down Arrow)**: Select "Lower"  
- **R**: Replay the current pitch pair

## 🏗️ Development Iterations

This project was built in four progressive iterations:

### Iteration 1: Basic Functionality
- Core pitch comparison mechanics
- Simple UI with Higher/Lower buttons
- Basic scoring system
- Correct/incorrect feedback

### Iteration 2: Adaptive Difficulty
- Dynamic difficulty adjustment
- Three-strikes game termination
- Difficulty percentage display
- Final score reporting

### Iteration 3: Game Modes
- Multiple pitch register modes
- Settings screen
- Mode-specific pitch generation
- Enhanced UI organization

### Iteration 4: Polish & Features
- Sound effects and animations
- Local high score storage
- Keyboard controls
- Info screen with instructions
- Replay functionality
- Visual enhancements

## 🧠 Technical Implementation

### Audio Generation
- **Web Audio API**: Generates precise sine wave tones
- **Frequency Calculation**: Uses logarithmic ratios for musical accuracy
- **Anti-aliasing**: Envelope shaping prevents audio clicks

### Pitch Calculation
```javascript
// Calculate pitch difference as percentage of half-step
const halfStepRatio = Math.pow(2, 1/12);
const percentOfHalfStep = difficultyPercent / 100;
const pitchDifference = Math.pow(halfStepRatio, percentOfHalfStep) - 1;
```

### Adaptive Algorithm
- **Correct Answer**: Difficulty × 0.77 (minimum 1%)
- **Incorrect Answer**: Difficulty × 1.3 (maximum 100%)
- **Starting Difficulty**: 100% of a half-step

### State Management
- React hooks for component state
- localStorage for persistent high scores
- Audio context management for browser compatibility

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: Indigo (#4F46E5) - Trust and focus
- **Success**: Green (#059669) - Correct answers
- **Error**: Red (#DC2626) - Incorrect answers
- **Background**: Light gray (#F3F4F6) - Comfortable viewing

### Responsive Design
- Mobile-first approach
- Touch-friendly button sizes
- Scalable typography
- Adaptive layouts

## 🔧 Configuration

### Frequency Ranges
```javascript
const FREQUENCY_RANGES = {
  high: { min: 660, max: 1320 },    // A5 to E6
  medium: { min: 330, max: 660 },   // E4 to E5  
  low: { min: 110, max: 220 },      // A2 to A3
  changing: { min: 110, max: 1320 } // Full range
};
```

### Sound Effects
Customizable audio feedback using chord progressions and musical intervals.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution
- Additional game modes and exercises
- Enhanced sound design
- Performance optimizations
- Accessibility improvements
- Mobile app versions
- Multiplayer features

## 📊 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support  
- **Edge**: Full support
- **Mobile**: iOS Safari, Chrome Mobile

**Note**: Requires Web Audio API support (available in all modern browsers)

## 🎵 Musical Background

### What Makes Intonation Ear Trainer Different

Traditional ear training apps focus on:
- **Interval Recognition**: Identifying named intervals (Major 3rd, Perfect 5th, etc.)
- **Scale Degrees**: Recognizing notes within a key context
- **Chord Progressions**: Harmonic relationships

Intonation Ear Trainer specifically targets:
- **Microtonal Perception**: Differences smaller than semitones
- **Intonation Training**: Pure pitch discrimination
- **Performance Skills**: Practical tuning abilities

### Educational Value

Research shows that fine pitch discrimination training:
- Improves overall musical performance
- Enhances ensemble playing skills
- Develops more accurate intonation
- Builds confidence in musical settings

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Original Intonation Ear Trainer iOS app developers for the concept
- Web Audio API documentation and community
- React and modern web development ecosystem
- Music education research supporting ear training methodologies

## 📧 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/intune-ear-training/issues)
- **Email**: michael.hamel80@gmail.com

---

**Happy ear training! 🎵**