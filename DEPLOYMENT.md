# Starlet Fitness API - Deployment Guide

## Server Details
- **IP Address**: 13.126.191.220
- **Domain**: ec2-13-126-191-220.ap-south-1.compute.amazonaws.com
- **SSH**: `ssh -i "deployment/testing-serverr.pem" ubuntu@ec2-13-126-191-220.ap-south-1.compute.amazonaws.com`

## Prerequisites
- Ubuntu Server (20.04 or later)
- PEM file for SSH access

## Deployment Steps

### 1. Initial Server Setup (Run Once)

SSH into the server:
```bash
ssh -i "deployment/testing-serverr.pem" ubuntu@ec2-13-126-191-220.ap-south-1.compute.amazonaws.com
```

Download and run the server setup script:
```bash
curl -o server-setup.sh https://raw.githubusercontent.com/YOUR_REPO/master/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

Or manually copy the script:
```bash
nano server-setup.sh
# Paste the content from server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 2. Clone Repository

```bash
cd /home/ubuntu
git clone YOUR_GIT_REPO_URL starlet-fitness-backend
cd starlet-fitness-backend
```

### 3. Configure Environment

Create .env file:
```bash
cp .env.example .env
nano .env
```

Update the following values:
- `NODE_ENV=production`
- `DB_PASSWORD=your_secure_password`
- Twilio credentials
- JWT secret

### 4. Configure Nginx

Copy nginx configuration:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/starlet-fitness
sudo ln -s /etc/nginx/sites-available/starlet-fitness /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Deploy Application

Make deploy script executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

### 6. Verify Deployment

Check PM2 status:
```bash
pm2 status
pm2 logs starlet-fitness-api
```

Test API:
```bash
curl http://localhost:4000/health
curl http://13.126.191.220/api/
```

## Subsequent Deployments

For future deployments, just pull the latest code and run deploy script:

```bash
cd /home/ubuntu/starlet-fitness-backend
git pull origin master
./deploy.sh
```

## Useful Commands

### PM2 Commands
```bash
pm2 status                          # Check application status
pm2 logs starlet-fitness-api        # View logs
pm2 restart starlet-fitness-api     # Restart application
pm2 stop starlet-fitness-api        # Stop application
pm2 delete starlet-fitness-api      # Remove from PM2
```

### Nginx Commands
```bash
sudo nginx -t                       # Test nginx configuration
sudo systemctl restart nginx        # Restart nginx
sudo systemctl status nginx         # Check nginx status
sudo tail -f /var/log/nginx/starlet-fitness-error.log  # View error logs
```

### PostgreSQL Commands
```bash
sudo -u postgres psql               # Access PostgreSQL
\l                                  # List databases
\c fitness                          # Connect to database
\dt                                 # List tables
```

### View Application Logs
```bash
pm2 logs starlet-fitness-api        # Live logs
pm2 logs --lines 100                # Last 100 lines
tail -f logs/combined.log           # Application logs
```

## API Endpoints

After deployment, your API will be available at:
- **Base URL**: http://13.126.191.220
- **API Routes**: http://13.126.191.220/api/*

Example endpoints:
- `GET http://13.126.191.220/health` - Health check
- `POST http://13.126.191.220/api/users/request-otp` - Request OTP
- `POST http://13.126.191.220/api/sessions` - Create session

## Troubleshooting

### Application not starting
```bash
pm2 logs starlet-fitness-api
# Check for errors in logs
```

### Database connection issues
```bash
sudo -u postgres psql
\l
# Verify database exists
```

### Nginx issues
```bash
sudo nginx -t
# Check configuration syntax
sudo tail -f /var/log/nginx/starlet-fitness-error.log
# View error logs
```

### Port already in use
```bash
sudo lsof -i :4000
# Find process using port 4000
sudo kill -9 PID
# Kill the process
```

## Security Notes

1. Change default PostgreSQL password
2. Keep .env file secure (never commit to git)
3. Use strong JWT secret
4. Consider setting up SSL/HTTPS with Let's Encrypt
5. Regularly update server packages

## SSL Setup (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ec2-13-126-191-220.ap-south-1.compute.amazonaws.com
```

## Monitoring

Setup basic monitoring:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```
