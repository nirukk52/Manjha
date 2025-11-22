#!/bin/bash
# Encore + Vercel Full-Stack Deployment Script
# Usage: ./deploy.sh [backend|frontend|all]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prereqs() {
    log_info "Checking prerequisites..."
    
    if ! command -v encore &> /dev/null; then
        log_error "Encore CLI not found. Install: https://encore.dev/docs/install"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not found. Install: npm i -g vercel"
        exit 1
    fi
    
    if ! encore auth whoami &> /dev/null; then
        log_error "Not logged in to Encore. Run: encore auth login"
        exit 1
    fi
    
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel. Run: vercel login"
        exit 1
    fi
    
    log_info "Prerequisites OK"
}

# Get Encore app ID from encore.app
get_app_id() {
    if [ -f "$BACKEND_DIR/encore.app" ]; then
        APP_ID=$(grep '"id"' "$BACKEND_DIR/encore.app" | cut -d'"' -f4)
        echo "$APP_ID"
    else
        log_error "encore.app not found in backend/"
        exit 1
    fi
}

# Deploy backend
deploy_backend() {
    log_info "Deploying backend to Encore..."
    
    cd "$PROJECT_ROOT"
    
    # Check git status
    if [[ -n $(git status -s) ]]; then
        log_warn "Uncommitted changes detected. Committing..."
        git add -A
        git commit -m "deploy: backend deployment $(date +%Y-%m-%d-%H-%M)"
    fi
    
    # Get app ID
    APP_ID=$(get_app_id)
    log_info "App ID: $APP_ID"
    
    # Check if encore remote exists
    if ! git remote | grep -q "^encore$"; then
        log_warn "Adding Encore git remote..."
        git remote add encore "encore://$APP_ID"
    fi
    
    # Push to Encore
    log_info "Pushing to Encore..."
    git push encore main:main
    
    BACKEND_URL="https://staging-$APP_ID.encr.app"
    log_info "Backend deploying to: $BACKEND_URL"
    log_info "Dashboard: https://app.encore.cloud/$APP_ID"
    
    echo "$BACKEND_URL"
}

# Deploy frontend
deploy_frontend() {
    log_info "Deploying frontend to Vercel..."
    
    cd "$FRONTEND_DIR"
    
    # Get backend URL
    APP_ID=$(get_app_id)
    BACKEND_URL="https://staging-$APP_ID.encr.app"
    
    log_info "Backend URL: $BACKEND_URL"
    
    # Check if env var needs updating
    log_warn "Make sure NEXT_PUBLIC_API_URL is set to: $BACKEND_URL"
    log_info "You can set it via Vercel dashboard or CLI"
    
    # Deploy
    log_info "Deploying to Vercel..."
    vercel --prod --yes
    
    log_info "Frontend deployed successfully!"
}

# Main execution
main() {
    MODE="${1:-all}"
    
    check_prereqs
    
    case "$MODE" in
        backend)
            deploy_backend
            ;;
        frontend)
            deploy_frontend
            ;;
        all)
            BACKEND_URL=$(deploy_backend)
            echo ""
            log_info "Backend deployed! Waiting 10s before frontend deploy..."
            sleep 10
            deploy_frontend
            ;;
        *)
            echo "Usage: $0 [backend|frontend|all]"
            exit 1
            ;;
    esac
    
    log_info "Deployment complete! 🚀"
}

main "$@"

