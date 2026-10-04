#!/bin/sh
set -e

echo "Creating S3 bucket bpa-permits..."
awslocal s3 mb s3://bpa-permits || true

awslocal s3api put-bucket-cors --bucket bpa-permits --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
      "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

# Public-read so the PDF viewer can load objects by URL in the browser.
awslocal s3api put-bucket-policy --bucket bpa-permits --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bpa-permits/*"
    }
  ]
}'

echo "LocalStack S3 ready: bucket bpa-permits"
