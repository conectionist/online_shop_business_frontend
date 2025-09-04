# Production Rollback Guide

This guide explains how to implement and use the production rollback system for the online shop frontend.

## Overview

The rollback system provides:
- **Versioned Docker images** with automatic tagging
- **Automatic cleanup** of old images (keeps last 5 versions)
- **Quick rollback capability** to any previous working version
- **Production-ready rollback script** for emergency situations

## How It Works

### 1. Enhanced CI/CD Pipeline

When you push to the `master` branch, the GitHub Actions workflow:

1. **Builds the Docker image** with multiple tags:
   - `latest` - Always points to the most recent version
   - `master-{commit-sha}` - Specific commit version (e.g., `master-abc123`)
   - `{timestamp}` - Timestamp version (e.g., `2024-01-15-14-30`)

2. **Automatically cleans up** old images, keeping only the 5 most recent versions

3. **Uses Docker layer caching** for faster builds

### 2. Image Tagging Strategy

Each deployment creates these tags:
```
ghcr.io/your-username/online_shop_business_frontend:latest
ghcr.io/your-username/online_shop_business_frontend:master-abc123
ghcr.io/your-username/online_shop_business_frontend:2024-01-15-14-30
```

## Rollback Scenarios

### Scenario 1: Quick Rollback to Previous Version
```bash
# Rollback to the previous working version
./scripts/rollback.sh --previous
```

### Scenario 2: Rollback to Specific Commit
```bash
# Rollback to a specific commit that you know was working
./scripts/rollback.sh master-abc123
```

### Scenario 3: Rollback to Latest (if you deployed a bad commit)
```bash
# If you just deployed a bad commit, rollback to the previous latest
./scripts/rollback.sh --latest
```

### Scenario 4: Emergency Rollback (Manual)
```bash
# Manual rollback without script
docker pull ghcr.io/your-username/online_shop_business_frontend:master-abc123
docker tag ghcr.io/your-username/online_shop_business_frontend:master-abc123 ghcr.io/your-username/online_shop_business_frontend:latest
docker-compose down
docker-compose up -d
```

## Using the Rollback Script

### Prerequisites

1. **Update the repository name** in `scripts/rollback.sh`:
   ```bash
   REPOSITORY="your-username/online_shop_business_frontend"  # Update this line
   ```

2. **Install GitHub CLI** (optional, for better version listing):
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   sudo apt update
   sudo apt install gh
   ```

### Script Usage

```bash
# List all available versions
./scripts/rollback.sh

# Rollback to previous version
./scripts/rollback.sh --previous

# Rollback to latest version
./scripts/rollback.sh --latest

# Rollback to specific version
./scripts/rollback.sh master-abc123
./scripts/rollback.sh 2024-01-15-14-30

# Show help
./scripts/rollback.sh --help
```

## Production Deployment Process

### Normal Deployment
1. Push changes to `master` branch
2. GitHub Actions builds and pushes new image
3. In production: `docker-compose pull && docker-compose up -d`

### Emergency Rollback Process
1. **Identify the issue**: "The latest deployment broke the site"
2. **Quick rollback**: `./scripts/rollback.sh --previous`
3. **Verify**: Check that the site is working
4. **Investigate**: Fix the issue in development
5. **Redeploy**: Push the fix and deploy again

## Monitoring and Verification

### Check Current Version
```bash
# See what image is currently running
docker-compose ps
docker images | grep online_shop_business_frontend
```

### Verify Rollback Success
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f

# Test the application
curl -I http://your-domain.com
```

## Best Practices

### 1. Always Test Locally First
```bash
# Test the rollback script locally
docker-compose down
./scripts/rollback.sh --previous
# Verify everything works
```

### 2. Keep Deployment Logs
```bash
# Log your deployments
echo "$(date): Deployed version $(git rev-parse HEAD)" >> deployment.log
```

### 3. Monitor After Rollback
- Check application logs
- Verify all features work
- Monitor error rates
- Test critical user flows

### 4. Document Issues
After a rollback, document:
- What went wrong
- Which commit caused the issue
- How the rollback was performed
- What was fixed

## Troubleshooting

### Script Permission Issues
```bash
chmod +x scripts/rollback.sh
```

### Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Image Pull Failures
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u your-username --password-stdin
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Check image
docker images | grep online_shop_business_frontend

# Force recreate
docker-compose up -d --force-recreate
```

## Configuration

### Customizing Image Retention
Edit `.github/workflows/docker-image.yml` and change the number in:
```yaml
# Keep only 5 most recent versions (change this number)
head -5
```

### Customizing Registry
Update these variables in both files:
- `.github/workflows/docker-image.yml`
- `scripts/rollback.sh`

```yaml
REGISTRY: ghcr.io  # or your preferred registry
REPOSITORY: your-username/online_shop_business_frontend
```

## Security Considerations

1. **GitHub Token**: The workflow uses `GITHUB_TOKEN` which has limited permissions
2. **Image Access**: Images are private by default in GitHub Container Registry
3. **Production Access**: Ensure only authorized personnel can run rollback scripts
4. **Audit Trail**: GitHub Actions provides logs of all deployments

## Cost Optimization

- **Automatic cleanup** prevents storage bloat
- **Docker layer caching** reduces build times and costs
- **Efficient tagging** strategy minimizes registry storage

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify your repository name in the configuration
3. Ensure you have proper permissions
4. Test the rollback script in a staging environment first
