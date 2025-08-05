const AWS = require('aws-sdk');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // Add retry configuration
  maxRetries: 3,
  retryDelayOptions: {
    customBackoff: function(retryCount) {
      return Math.pow(2, retryCount) * 100; // Exponential backoff
    }
  }
});

// Create S3 instance with additional configuration
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
  // Add timeout configuration
  httpOptions: {
    timeout: 30000, // 30 seconds
    connectTimeout: 5000 // 5 seconds
  }
});

// Test S3 connection function
const testS3Connection = async () => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME
    };
    
    await s3.headBucket(params).promise();
    console.log('✅ S3 connection successful');
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
};

// Helper function to generate presigned URL for private files
const generatePresignedUrl = (key, expires = 3600) => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: expires // URL expires in 1 hour by default
  });
};

module.exports = {
  s3,
  testS3Connection,
  generatePresignedUrl
};