# CLD Studio

A modern web-based Causal Loop Diagram (CLD) builder and assessment platform built with React, React Flow, and TailwindCSS.

## Features

### 🎨 Drawing Engine
- **Interactive Node Creation**: Click anywhere on the canvas to add nodes
- **Drag & Drop**: Reposition nodes by dragging them around
- **Smart Connections**: Connect nodes by dragging from one handle to another
- **Polarity Management**: Click edges to toggle between positive (+) and negative (−) relationships
- **Node Types**: Support for Variables, Constants, and Parameters with visual differentiation

### 📊 Two Modes
- **Sandbox Mode**: Free-form diagram creation and exploration
- **Assessment Mode**: Complete predefined problems and get evaluated

### 💾 Export Capabilities
- **JSON Export**: Save diagrams as structured JSON files
- **Adjacency Matrix**: Export as CSV matrix for analysis
- **Import**: Load previously saved diagrams

### 🎯 Assessment Features
- **Problem Library**: Pre-built CLD problems for practice
- **Real-time Statistics**: Track node types and edge polarities
- **Submission System**: Submit completed assessments (backend integration pending)

## Tech Stack

- **Frontend**: React 19 + Vite
- **Diagram Engine**: React Flow
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Backend Integration**: AWS Amplify (planned)

## Getting Started

### Prerequisites
- Node.js (v20.18.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
# The project is now in the root directory
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Sandbox Mode
1. Click anywhere on the canvas to add nodes
2. Double-click nodes to edit their labels
3. Use the dropdown to change node types (Variable, Constant, Parameter)
4. Drag from node handles to create connections
5. Click edges to change polarity
6. Use the toolbar to clear, save, or export your diagram

### Assessment Mode
1. Switch to Assessment Mode using the toggle in the header
2. Select a problem from the sidebar
3. Complete the diagram according to the requirements
4. Submit your assessment when finished

### Export Options
- **Save as JSON**: Downloads a complete diagram file
- **Export Matrix**: Creates a CSV adjacency matrix
- **Load Diagram**: Import previously saved JSON files

## Project Structure

```
src/
├── components/
│   ├── CLDEditor.jsx      # Main diagram editor
│   ├── CLDNode.jsx        # Custom node component
│   ├── CLDEdge.jsx        # Custom edge component
│   ├── Toolbar.jsx        # Toolbar with actions
│   └── Sidebar.jsx        # Sidebar with info and problems
├── stores/
│   └── cldStore.js        # Zustand state management
├── App.jsx                # Main application component
├── index.css              # TailwindCSS and custom styles
└── main.jsx               # Application entry point
```

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Basic diagram editor
- [x] Node and edge management
- [x] Export/import functionality
- [x] Sandbox and assessment modes

### Phase 2: Backend Integration 🚧
- [ ] AWS Amplify setup
- [ ] Authentication via external providers
- [ ] Cloud storage for diagrams
- [ ] Assessment scoring system

### Phase 3: Advanced Features 📋
- [ ] Loop detection and analysis
- [ ] Template library
- [ ] Collaboration features
- [ ] Advanced export formats

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Flow](https://reactflow.dev/) for the diagram engine
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand) for state management
