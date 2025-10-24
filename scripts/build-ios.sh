#!/bin/bash
echo "🔨 Building for iOS..."
rm -rf .next out
npm run build
npx cap sync ios
npx cap open ios
