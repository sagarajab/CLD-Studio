import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';

// Generate the data client
const client = generateClient();

export const examplesService = {
  // Get all examples from database
  async getAllExamples() {
    try {
      const { data: examples } = await client.models.CLDExample.list();
      return examples;
    } catch (error) {
      console.error('Error fetching examples:', error);
      throw error;
    }
  },

  // Get examples by category
  async getExamplesByCategory(category) {
    try {
      const { data: examples } = await client.models.CLDExample.list({
        filter: {
          category: { eq: category }
        }
      });
      return examples;
    } catch (error) {
      console.error('Error fetching examples by category:', error);
      throw error;
    }
  },

  // Search examples by name or description
  async searchExamples(searchTerm) {
    try {
      const { data: examples } = await client.models.CLDExample.list({
        filter: {
          or: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } }
          ]
        }
      });
      return examples;
    } catch (error) {
      console.error('Error searching examples:', error);
      throw error;
    }
  },

  // Get featured examples
  async getFeaturedExamples() {
    try {
      const { data: examples } = await client.models.CLDExample.list({
        filter: {
          isFeatured: { eq: true }
        }
      });
      return examples;
    } catch (error) {
      console.error('Error fetching featured examples:', error);
      throw error;
    }
  },

  // Load a specific example file from S3
  async loadExampleFile(example) {
    try {
      // Get the file URL from S3
      const { url } = await getUrl({
        key: example.filePath,
        options: {
          accessLevel: 'guest'
        }
      });

      // Download the file content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const fileContent = await response.json();
      return fileContent;
    } catch (error) {
      console.error('Error loading example file:', error);
      throw error;
    }
  },

  // Increment download count
  async incrementDownloadCount(exampleId) {
    try {
      const example = await client.models.CLDExample.get({ id: exampleId });
      await client.models.CLDExample.update({
        id: exampleId,
        downloadCount: (example.downloadCount || 0) + 1
      });
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  },

  // Create a new example (for admin use)
  async createExample(exampleData) {
    try {
      const newExample = await client.models.CLDExample.create(exampleData);
      return newExample;
    } catch (error) {
      console.error('Error creating example:', error);
      throw error;
    }
  }
}; 