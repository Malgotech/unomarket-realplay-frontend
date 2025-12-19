#!/bin/bash

# Deploy changes to the s3 bucket
set -e

# Build the React app
echo "Building React app..."
git checkout Stage
git pull
npm i --legacy-peer-deps
npm run build

# Sync the build output to the S3 bucket
aws s3 sync dist/ s3://yolft-react-stage/ --delete