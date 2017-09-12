#!/bin/bash
set -eu

echo "Deploying static assets to S3..."


aws s3api create-bucket --bucket "$1" --acl 'public-read' --region us-east-1 --output text

aws s3 sync --acl 'public-read' --delete ./ "s3://$1/" --output text

aws s3 website s3://$1 --index-document index.html --error-document index.html --output text




echo "Bucket Name: $1"
echo "Bucket URL: http://$1.s3-website-us-east-1.amazonaws.com"
