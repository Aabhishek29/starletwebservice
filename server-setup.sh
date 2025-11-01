#!/bin/bash

echo "🚀 Setting up Starlet Fitness API Server..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install Node.js 20.x
print_info "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js installed: $(node -v)"
print_success "npm installed: $(npm -v)"

# Install PostgreSQL
print_info "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
print_success "PostgreSQL installed and started"

# Install Nginx
print_info "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
print_success "Nginx installed and started"

# Install PM2 globally
print_info "Installing PM2..."
sudo npm install -g pm2
print_success "PM2 installed: $(pm2 -v)"

# Setup PM2 startup script
print_info "Setting up PM2 startup script..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
print_success "PM2 startup configured"

# Install Git
print_info "Installing Git..."
sudo apt install -y git
print_success "Git installed: $(git --version)"

# Create application directory
print_info "Creating application directory..."
mkdir -p /home/ubuntu/starlet-fitness-backend
print_success "Application directory created"

# Configure PostgreSQL
print_info "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE fitness;" 2>/dev/null || print_info "Database already exists"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD '12345678';" 2>/dev/null || print_info "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fitness TO postgres;"
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;"
print_success "PostgreSQL configured"

# Allow PostgreSQL connections from localhost
print_info "Configuring PostgreSQL connections..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
sudo systemctl restart postgresql
print_success "PostgreSQL connections configured"

# Configure firewall
print_info "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 4000/tcp
echo "y" | sudo ufw enable
print_success "Firewall configured"

echo ""
print_success "🎉 Server setup completed!"
echo ""
print_info "Next steps:"
echo "  1. Clone your git repository to /home/ubuntu/starlet-fitness-backend"
echo "  2. Create .env file from .env.example"
echo "  3. Run deploy.sh to start the application"
echo "  4. Configure nginx with the nginx.conf file"
