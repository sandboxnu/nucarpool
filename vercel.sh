#!/bin/bash
 
if [[ $VERCEL_GIT_COMMIT_REF == "main"  ]] ; then 
  echo "Deploying to production..."
  npm run build:main
else 
  echo "Deploying to preview..."
  npm run build:preview
fi