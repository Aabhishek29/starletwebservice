#!/bin/bash

echo "🚀 Starting deployment for Starlet Fitness API..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/starlet-fitness-backend"
APP_NAME="starlet-fitness-api"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if running as ubuntu user
if [ "$USER" != "ubuntu" ]; then
    print_error "Please run this script as ubuntu user"
    exit 1
fi

# Navigate to app directory
cd $APP_DIR || {
    print_error "App directory not found at $APP_DIR"
    exit 1
}

print_info "Pulling latest code from git..."
git pull origin master || {
    print_error "Git pull failed"
    exit 1
}
print_success "Code updated successfully"

print_info "Installing/updating npm dependencies..."
npm install --production || {
    print_error "npm install failed"
    exit 1
}
print_success "Dependencies installed"

print_info "Checking .env file..."
if [ ! -f .env ]; then
    print_error ".env file not found! Please create it from .env.example"
    exit 1
fi
print_success ".env file exists"

print_info "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

print_info "Restarting application with PM2..."
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
print_success "Application restarted"

print_info "Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

print_info "Checking application status..."
pm2 status

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
print_info "API is running on: http://13.126.191.220"
print_info "Check logs: pm2 logs $APP_NAME"
print_info "Check status: pm2 status"
