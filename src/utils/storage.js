import { list, downloadData, uploadData } from 'aws-amplify/storage';
import { Amplify } from 'aws-amplify';

// Helper function to get current bucket name
const getCurrentBucketName = () => {
  try {
    const config = Amplify.getConfig();
    const bucketName = config.Storage?.S3?.bucket;
    console.log('Current bucket name:', bucketName);
    return bucketName;
  } catch (error) {
    console.error('Error getting bucket name:', error);
    return 'unknown';
  }
};

// Simple function to list all files in the bucket
export const listAllFilesInBucket = async () => {
  try {
    const bucketName = getCurrentBucketName();
    console.log(`Listing all files in bucket: ${bucketName}`);
    const result = await list({
      options: {
        validateObjectExistence: false
      }
    });
    
    console.log(`All files in bucket ${bucketName}:`, result.items);
    return result.items;
  } catch (error) {
    console.error('Error listing all files:', error);
    throw error;
  }
};

// Simple function to get a file from S3
export const getS3FileDirect = async (key) => {
  try {
    const bucketName = getCurrentBucketName();
    console.log(`Getting file: ${key} from bucket: ${bucketName}`);
    const result = await downloadData({
      key: key,
      options: {
        validateObjectExistence: false
      }
    });
    return result;
  } catch (error) {
    console.error(`Failed to get S3 file ${key}:`, error);
    throw error;
  }
};

// Simple function to upload a file to S3
export const uploadS3File = async (file, key) => {
  try {
    const bucketName = getCurrentBucketName();
    console.log(`Uploading file: ${key} to bucket: ${bucketName}`);
    const result = await uploadData({
      key: key,
      data: file,
      options: {
        contentType: file.type
      }
    });
    console.log(`Successfully uploaded: ${key} to bucket: ${bucketName}`);
    return result;
  } catch (error) {
    console.error(`Error uploading file ${key}:`, error);
    throw error;
  }
};

// Function to upload example files to S3
export const uploadExampleFiles = async () => {
  try {
    const bucketName = getCurrentBucketName();
    console.log(`Starting upload of example files to bucket: ${bucketName}`);
    
    const exampleFiles = [
      'basic-feedback-loop.cld',
      'market-growth.cld',
      'supply-chain.cld',
      'predator-prey.cld'
    ];
    
    for (const filename of exampleFiles) {
      try {
        // Fetch the file from the local examples folder
        const response = await fetch(`/examples/${filename}`);
        if (!response.ok) {
          console.warn(`Failed to fetch local file: ${filename}`);
          continue;
        }
        
        const fileContent = await response.text();
        const file = new File([fileContent], filename, { type: 'application/json' });
        
        // Upload to S3
        await uploadS3File(file, `examples/${filename}`);
      } catch (error) {
        console.error(`Failed to upload ${filename}:`, error);
      }
    }
  } catch (error) {
    console.error('Error uploading example files:', error);
  }
};

// Legacy functions for compatibility
export const listS3Files = listAllFilesInBucket;
export const getS3File = getS3FileDirect; 