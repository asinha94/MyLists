#!/bin/bash

# Fail on errors
set -e

# make sure latest code is installed
git checkout main
git pull

# Build the backend service
pushd backend
cargo build --release
sudo service backend restart
popd


# Build the frontend
pushd frontend
npm run build
sudo service nginx restart
popd