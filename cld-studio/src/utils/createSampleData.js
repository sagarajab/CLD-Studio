import { generateClient } from 'aws-amplify/data';

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
    filePath: 'eg1.cld',
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
    filePath: 'eg1.cld',
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
    filePath: 'eg1.cld',
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
    filePath: 'eg1.cld',
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

export const createSampleData = async () => {
  console.log('Creating sample CLD examples...');
  
  try {
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