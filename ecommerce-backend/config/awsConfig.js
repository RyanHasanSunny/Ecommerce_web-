const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
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

// Create S3 client with configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Add retry configuration
  maxAttempts: 3,
  // Add timeout configuration
  requestTimeout: 30000, // 30 seconds
  connectionTimeout: 5000 // 5 seconds
});

// Test S3 connection function
const testS3Connection = async () => {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: 'test-connection-key' // This will fail but test connection
    });

    await s3.send(command);
    console.log('✅ S3 connection successful');
    return true;
  } catch (error) {
    // If it's a NoSuchKey error, connection is fine
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      console.log('✅ S3 connection successful');
      return true;
    }
    console.error('❌ S3 connection failed:', error.message);
    return false;
  }
};

// Helper function to generate presigned URL for private files
const generatePresignedUrl = async (key, expires = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: expires });
};

module.exports = {
  s3,
  testS3Connection,
  generatePresignedUrl
};
