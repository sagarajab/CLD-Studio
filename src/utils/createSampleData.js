import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl } from 'aws-amplify/storage';

const client = generateClient();

// Sample CLD examples data
const sampleExamples = [
  {
    name: 'Example 1 - Basic System',
    description: 'A basic causal loop diagram example demonstrating fundamental system dynamics concepts',
    category: 'basic',
    difficulty: 'beginner',
    filePath: 'eg1.cld',
    tags: 'basic,system,dynamics,example',
    author: 'CLD Studio',
    version: '1.0',
    nodeCount: 5,
    edgeCount: 4,
    loopCount: 1,
    problemStatement: 'Understanding basic feedback loops in systems',
    learningObjectives: 'Identify positive and negative feedback loops,Understand system behavior patterns',
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Example 2 - Intermediate System',
    description: 'An intermediate causal loop diagram showing more complex system dynamics',
    category: 'intermediate',
    difficulty: 'intermediate',
    filePath: 'eg2.cld',
    tags: 'intermediate,system,dynamics,complex',
    author: 'CLD Studio',
    version: '1.0',
    nodeCount: 6,
    edgeCount: 5,
    loopCount: 2,
    problemStatement: 'Understanding intermediate feedback loops and system complexity',
    learningObjectives: 'Identify multiple feedback loops,Understand system interactions',
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Example 3 - Advanced System',
    description: 'An advanced causal loop diagram demonstrating complex system behavior',
    category: 'advanced',
    difficulty: 'advanced',
    filePath: 'eg3.cld',
    tags: 'advanced,system,dynamics,complex',
    author: 'CLD Studio',
    version: '1.0',
    nodeCount: 7,
    edgeCount: 6,
    loopCount: 3,
    problemStatement: 'Modeling complex system dynamics with multiple interacting loops',
    learningObjectives: 'Model complex systems,Understand system behavior patterns',
    isPublic: true,
    isFeatured: true
  },
  {
    name: 'Example 4 - Basic Feedback',
    description: 'A simple feedback loop example for beginners',
    category: 'basic',
    difficulty: 'beginner',
    filePath: 'eg4.cld',
    tags: 'basic,feedback,simple,beginner',
    author: 'CLD Studio',
    version: '1.0',
    nodeCount: 4,
    edgeCount: 3,
    loopCount: 1,
    problemStatement: 'Understanding basic feedback mechanisms in systems',
    learningObjectives: 'Identify feedback loops,Understand basic system behavior',
    isPublic: true,
    isFeatured: false
  },
  {
    name: 'Example 5 - System Analysis',
    description: 'A comprehensive system analysis example',
    category: 'intermediate',
    difficulty: 'intermediate',
    filePath: 'eg5.cld',
    tags: 'analysis,system,comprehensive,intermediate',
    author: 'CLD Studio',
    version: '1.0',
    nodeCount: 5,
    edgeCount: 4,
    loopCount: 2,
    problemStatement: 'Analyzing system behavior and identifying key variables',
    learningObjectives: 'Analyze system dynamics,Identify key variables',
    isPublic: true,
    isFeatured: false
  }
];

// Sample CLD file content templates
const sampleCLDFiles = {
  'eg1.cld': {
    nodes: [
      { id: '1', label: 'Population', x: 100, y: 100, color: '#000000' },
      { id: '2', label: 'Birth Rate', x: 300, y: 100, color: '#000000' },
      { id: '3', label: 'Death Rate', x: 300, y: 200, color: '#000000' },
      { id: '4', label: 'Resources', x: 100, y: 200, color: '#000000' },
      { id: '5', label: 'Quality of Life', x: 200, y: 150, color: '#000000' }
    ],
    edges: [
      { id: '1', source: '1', target: '2', polarity: 'positive' },
      { id: '2', source: '2', target: '1', polarity: 'positive' },
      { id: '3', source: '1', target: '3', polarity: 'positive' },
      { id: '4', source: '4', target: '5', polarity: 'positive' }
    ],
    diagramName: 'Basic Population System',
    mode: 'sandbox',
    viewTransform: { x: 0, y: 0, scale: 1 },
    showGrid: false
  },
  'eg2.cld': {
    nodes: [
      { id: '1', label: 'Sales', x: 100, y: 100, color: '#000000' },
      { id: '2', label: 'Marketing Budget', x: 300, y: 100, color: '#000000' },
      { id: '3', label: 'Customer Satisfaction', x: 300, y: 200, color: '#000000' },
      { id: '4', label: 'Product Quality', x: 100, y: 200, color: '#000000' },
      { id: '5', label: 'Revenue', x: 200, y: 150, color: '#000000' },
      { id: '6', label: 'Competition', x: 200, y: 50, color: '#000000' }
    ],
    edges: [
      { id: '1', source: '1', target: '2', polarity: 'positive' },
      { id: '2', source: '2', target: '1', polarity: 'positive' },
      { id: '3', source: '1', target: '3', polarity: 'positive' },
      { id: '4', source: '4', target: '3', polarity: 'positive' },
      { id: '5', source: '6', target: '1', polarity: 'negative' }
    ],
    diagramName: 'Business Growth System',
    mode: 'sandbox',
    viewTransform: { x: 0, y: 0, scale: 1 },
    showGrid: false
  },
  'eg3.cld': {
    nodes: [
      { id: '1', label: 'Innovation', x: 100, y: 100, color: '#000000' },
      { id: '2', label: 'R&D Investment', x: 300, y: 100, color: '#000000' },
      { id: '3', label: 'Market Share', x: 300, y: 200, color: '#000000' },
      { id: '4', label: 'Customer Demand', x: 100, y: 200, color: '#000000' },
      { id: '5', label: 'Revenue', x: 200, y: 150, color: '#000000' },
      { id: '6', label: 'Competition', x: 200, y: 50, color: '#000000' },
      { id: '7', label: 'Technology Gap', x: 400, y: 150, color: '#000000' }
    ],
    edges: [
      { id: '1', source: '1', target: '2', polarity: 'positive' },
      { id: '2', source: '2', target: '1', polarity: 'positive' },
      { id: '3', source: '1', target: '3', polarity: 'positive' },
      { id: '4', source: '4', target: '3', polarity: 'positive' },
      { id: '5', source: '6', target: '1', polarity: 'negative' },
      { id: '6', source: '7', target: '2', polarity: 'positive' }
    ],
    diagramName: 'Innovation Ecosystem',
    mode: 'sandbox',
    viewTransform: { x: 0, y: 0, scale: 1 },
    showGrid: false
  },
  'eg4.cld': {
    nodes: [
      { id: '1', label: 'Temperature', x: 100, y: 100, color: '#000000' },
      { id: '2', label: 'Thermostat', x: 300, y: 100, color: '#000000' },
      { id: '3', label: 'Heating System', x: 300, y: 200, color: '#000000' },
      { id: '4', label: 'Room', x: 100, y: 200, color: '#000000' }
    ],
    edges: [
      { id: '1', source: '1', target: '2', polarity: 'negative' },
      { id: '2', source: '2', target: '3', polarity: 'positive' },
      { id: '3', source: '3', target: '1', polarity: 'positive' }
    ],
    diagramName: 'Simple Feedback Loop',
    mode: 'sandbox',
    viewTransform: { x: 0, y: 0, scale: 1 },
    showGrid: false
  },
  'eg5.cld': {
    nodes: [
      { id: '1', label: 'Productivity', x: 100, y: 100, color: '#000000' },
      { id: '2', label: 'Workload', x: 300, y: 100, color: '#000000' },
      { id: '3', label: 'Stress', x: 300, y: 200, color: '#000000' },
      { id: '4', label: 'Quality', x: 100, y: 200, color: '#000000' },
      { id: '5', label: 'Deadlines', x: 200, y: 50, color: '#000000' }
    ],
    edges: [
      { id: '1', source: '1', target: '2', polarity: 'positive' },
      { id: '2', source: '2', target: '3', polarity: 'positive' },
      { id: '3', source: '3', target: '1', polarity: 'negative' },
      { id: '4', source: '5', target: '2', polarity: 'positive' }
    ],
    diagramName: 'Work Performance System',
    mode: 'sandbox',
    viewTransform: { x: 0, y: 0, scale: 1 },
    showGrid: false
  }
};

// Function to upload a CLD file to S3
const uploadCLDFile = async (fileName, fileContent) => {
  try {
    console.log(`Uploading ${fileName} to S3...`);
    
    const result = await uploadData({
      key: fileName,
      data: JSON.stringify(fileContent, null, 2)
    }).result;
    
    console.log(`Successfully uploaded ${fileName}`);
    return result;
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error);
    throw error;
  }
};

export const createSampleData = async () => {
  console.log('Creating sample CLD examples...');
  
  try {
    // First, upload the CLD files to S3
    console.log('Uploading CLD files to S3...');
    for (const [fileName, fileContent] of Object.entries(sampleCLDFiles)) {
      await uploadCLDFile(fileName, fileContent);
    }
    
    // Then create the database entries
    console.log('Creating database entries...');
    for (const example of sampleExamples) {
      const newExample = await client.models.CLDExample.create(example);
      console.log(`Created example: ${newExample.name}`);
    }
    
    console.log('Sample data created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
};

// Function to run from browser console
if (typeof window !== 'undefined') {
  window.createSampleData = createSampleData;
} 