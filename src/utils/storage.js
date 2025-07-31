import { list, downloadData, uploadData } from 'aws-amplify/storage';

// Helper function to get current bucket name from Amplify config
const getCurrentBucketName = () => {
  try {
    // Import the config dynamically to avoid circular dependencies
    const config = JSON.parse(localStorage.getItem('amplifyConfig') || '{}');
    return config.Storage?.S3?.bucket || 'unknown';
  } catch (error) {
    console.error('Error getting bucket name:', error);
    return 'unknown';
  }
};

// Simple function to list all files in the bucket
export const listAllFilesInBucket = async () => {
  try {
    const result = await list({
      options: {
        validateObjectExistence: false
      }
    });
    
    return result.items;
  } catch (error) {
    console.error('Error listing all files:', error);
    throw error;
  }
};

// Simple function to get a file from S3
export const getS3FileDirect = async (key) => {
  try {
    const result = await downloadData({
      key: key,
      options: {
        validateObjectExistence: false,
        accessLevel: 'guest'
      }
    });
    
    // Standardize the return format
    let content;
    
    if (typeof result === 'string') {
      // If result is a URL string, fetch the content
      const response = await fetch(result);
      if (!response.ok) {
        throw new Error(`Failed to fetch file content from URL: ${response.statusText}`);
      }
      content = await response.text();
    } else if (result && typeof result === 'object' && result.result) {
      // Handle DownloadDataResult object
      const actualResult = result.result instanceof Promise ? await result.result : result.result;
      
      if (typeof actualResult === 'string') {
        content = actualResult;
      } else if (actualResult instanceof ArrayBuffer || actualResult instanceof Uint8Array) {
        // Convert binary data to string
        const decoder = new TextDecoder('utf-8');
        content = decoder.decode(actualResult);
      } else if (actualResult.body instanceof Blob) {
        // Handle Blob body
        content = await actualResult.body.text();
      } else {
        // Fallback: try to stringify
        content = JSON.stringify(actualResult);
      }
    } else {
      // Direct content
      content = result;
    }
    
    return { result: content };
  } catch (error) {
    console.error(`Failed to get S3 file ${key}:`, error);
    throw error;
  }
};

// Simple function to upload a file to S3
export const uploadS3File = async (file, key) => {
  try {
    const result = await uploadData({
      key: key,
      data: file,
      options: {
        contentType: file.type
      }
    });
    return result;
  } catch (error) {
    console.error(`Error uploading file ${key}:`, error);
    throw error;
  }
};

// Note: uploadExampleFiles function removed as it was unused

// Note: Legacy function aliases removed for clarity 