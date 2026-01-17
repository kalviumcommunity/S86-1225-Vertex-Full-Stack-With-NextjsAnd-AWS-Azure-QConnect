#!/bin/bash

##############################################################################
# QConnect Automated Rollback Script
# 
# Purpose: Automatically rollback to previous stable version on deployment failure
# Usage: ./scripts/rollback.sh [--dry-run] [--version N]
# 
# Environment Variables Required:
#   AWS_REGION - AWS region (e.g., us-east-1)
#   AWS_CLUSTER_NAME - ECS cluster name
#   AWS_SERVICE_NAME - ECS service name
#   AWS_TASK_FAMILY - Task definition family name
##############################################################################

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
ROLLBACK_VERSION=""
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_CLUSTER_NAME="${AWS_CLUSTER_NAME:-qconnect-cluster}"
AWS_SERVICE_NAME="${AWS_SERVICE_NAME:-qconnect-service}"
AWS_TASK_FAMILY="${AWS_TASK_FAMILY:-qconnect}"
MAX_RETRIES=3
RETRY_DELAY=5

##############################################################################
# Utility Functions
##############################################################################

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

print_header() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${BLUE}$1${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

##############################################################################
# Argument Parsing
##############################################################################

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      log_warning "DRY RUN MODE - No changes will be made"
      shift
      ;;
    --version)
      ROLLBACK_VERSION="$2"
      shift 2
      ;;
    --cluster)
      AWS_CLUSTER_NAME="$2"
      shift 2
      ;;
    --service)
      AWS_SERVICE_NAME="$2"
      shift 2
      ;;
    --region)
      AWS_REGION="$2"
      shift 2
      ;;
    *)
      log_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

##############################################################################
# Pre-flight Checks
##############################################################################

print_header "PRE-FLIGHT CHECKS"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  log_error "AWS CLI not found. Please install it first."
  exit 1
fi
log_success "AWS CLI found"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  log_error "jq not found. Please install it first."
  exit 1
fi
log_success "jq found"

# Verify AWS credentials
if ! aws sts get-caller-identity --region "$AWS_REGION" &> /dev/null; then
  log_error "AWS credentials not configured or invalid"
  exit 1
fi
log_success "AWS credentials valid"

# Verify ECS cluster exists
if ! aws ecs describe-clusters \
  --cluster "$AWS_CLUSTER_NAME" \
  --region "$AWS_REGION" &> /dev/null; then
  log_error "ECS cluster not found: $AWS_CLUSTER_NAME"
  exit 1
fi
log_success "ECS cluster found: $AWS_CLUSTER_NAME"

# Verify ECS service exists
if ! aws ecs describe-services \
  --cluster "$AWS_CLUSTER_NAME" \
  --service "$AWS_SERVICE_NAME" \
  --region "$AWS_REGION" &> /dev/null; then
  log_error "ECS service not found: $AWS_SERVICE_NAME"
  exit 1
fi
log_success "ECS service found: $AWS_SERVICE_NAME"

##############################################################################
# Get Previous Task Definition
##############################################################################

print_header "FINDING PREVIOUS STABLE VERSION"

log_info "Fetching task definition history..."

# Get list of task definitions sorted by date (newest first)
TASK_DEFS=$(aws ecs list-task-definitions \
  --family-prefix "$AWS_TASK_FAMILY" \
  --sort DESCENDING \
  --max-items 5 \
  --region "$AWS_REGION" \
  --query 'taskDefinitionArns' \
  --output json)

# Count available versions
TASK_DEF_COUNT=$(echo "$TASK_DEFS" | jq 'length')
log_info "Found $TASK_DEF_COUNT recent task definitions"

if [ "$TASK_DEF_COUNT" -lt 2 ]; then
  log_error "Not enough task definition history to rollback"
  log_info "Available versions: $TASK_DEF_COUNT (need at least 2)"
  exit 1
fi

# Get previous task definition (index 1, since 0 is current)
if [ -z "$ROLLBACK_VERSION" ]; then
  PREVIOUS_TASK_DEF=$(echo "$TASK_DEFS" | jq -r '.[1]')
else
  PREVIOUS_TASK_DEF=$(echo "$TASK_DEFS" | jq -r ".[] | select(contains(\":$ROLLBACK_VERSION\")) | ." | head -1)
  if [ -z "$PREVIOUS_TASK_DEF" ]; then
    log_error "Task definition version not found: $ROLLBACK_VERSION"
    exit 1
  fi
fi

log_success "Previous task definition: $PREVIOUS_TASK_DEF"

# Extract version number
PREVIOUS_VERSION=$(echo "$PREVIOUS_TASK_DEF" | awk -F: '{print $NF}')
log_info "Rolling back to version: $PREVIOUS_VERSION"

##############################################################################
# Display Comparison
##############################################################################

print_header "DEPLOYMENT COMPARISON"

# Get current task definition from service
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster "$AWS_CLUSTER_NAME" \
  --service "$AWS_SERVICE_NAME" \
  --region "$AWS_REGION" \
  --query 'services[0].taskDefinition' \
  --output text)

CURRENT_VERSION=$(echo "$CURRENT_TASK_DEF" | awk -F: '{print $NF}')

log_info "Current version:  $CURRENT_VERSION ($CURRENT_TASK_DEF)"
log_info "Rollback version: $PREVIOUS_VERSION ($PREVIOUS_TASK_DEF)"

# Get task definition details
log_info "Fetching task definition details..."

CURRENT_DETAILS=$(aws ecs describe-task-definition \
  --task-definition "$CURRENT_TASK_DEF" \
  --region "$AWS_REGION" \
  --query 'taskDefinition' \
  --output json)

PREVIOUS_DETAILS=$(aws ecs describe-task-definition \
  --task-definition "$PREVIOUS_TASK_DEF" \
  --region "$AWS_REGION" \
  --query 'taskDefinition' \
  --output json)

# Display image info
CURRENT_IMAGE=$(echo "$CURRENT_DETAILS" | jq -r '.containerDefinitions[0].image')
PREVIOUS_IMAGE=$(echo "$PREVIOUS_DETAILS" | jq -r '.containerDefinitions[0].image')

echo -e "${YELLOW}Current Image:${NC}  $CURRENT_IMAGE"
echo -e "${YELLOW}Rollback Image:${NC} $PREVIOUS_IMAGE"

##############################################################################
# Confirmation
##############################################################################

print_header "ROLLBACK CONFIRMATION"

if [ "$DRY_RUN" = true ]; then
  log_warning "DRY RUN - Would perform the following:"
  echo ""
  echo "  aws ecs update-service \\"
  echo "    --cluster $AWS_CLUSTER_NAME \\"
  echo "    --service $AWS_SERVICE_NAME \\"
  echo "    --task-definition $PREVIOUS_TASK_DEF \\"
  echo "    --force-new-deployment \\"
  echo "    --region $AWS_REGION"
  echo ""
  log_success "Dry run completed successfully"
  exit 0
fi

# Confirmation prompt
read -p "Proceed with rollback to version $PREVIOUS_VERSION? (y/N): " -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log_warning "Rollback cancelled by user"
  exit 0
fi

##############################################################################
# Execute Rollback
##############################################################################

print_header "EXECUTING ROLLBACK"

log_info "Updating ECS service to use previous task definition..."

UPDATE_OUTPUT=$(aws ecs update-service \
  --cluster "$AWS_CLUSTER_NAME" \
  --service "$AWS_SERVICE_NAME" \
  --task-definition "$PREVIOUS_TASK_DEF" \
  --force-new-deployment \
  --region "$AWS_REGION" \
  --output json)

SERVICE_ARN=$(echo "$UPDATE_OUTPUT" | jq -r '.service.serviceArn')
log_success "Service update initiated: $SERVICE_ARN"

##############################################################################
# Wait for Rollback to Complete
##############################################################################

print_header "WAITING FOR ROLLBACK TO COMPLETE"

log_info "Waiting for tasks to be deployed..."

# Maximum wait time: 5 minutes
MAX_WAIT=300
ELAPSED=0
INTERVAL=10

while [ $ELAPSED -lt $MAX_WAIT ]; do
  # Get service status
  SERVICE_STATUS=$(aws ecs describe-services \
    --cluster "$AWS_CLUSTER_NAME" \
    --service "$AWS_SERVICE_NAME" \
    --region "$AWS_REGION" \
    --output json)

  RUNNING_COUNT=$(echo "$SERVICE_STATUS" | jq '.services[0].runningCount')
  DESIRED_COUNT=$(echo "$SERVICE_STATUS" | jq '.services[0].desiredCount')
  DEPLOYMENTS=$(echo "$SERVICE_STATUS" | jq '.services[0].deployments | length')

  echo -ne "\rRunning tasks: $RUNNING_COUNT/$DESIRED_COUNT | Deployments: $DEPLOYMENTS | Elapsed: ${ELAPSED}s"

  # Check if rollback is complete
  if [ "$RUNNING_COUNT" -eq "$DESIRED_COUNT" ] && [ "$DEPLOYMENTS" -eq 1 ]; then
    echo ""
    log_success "Rollback deployment complete!"
    break
  fi

  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  log_warning "Rollback did not complete within $MAX_WAIT seconds"
  log_warning "Check AWS console for deployment status"
fi

##############################################################################
# Verify Rollback Success
##############################################################################

print_header "VERIFYING ROLLBACK"

# Verify health check
log_info "Running health check..."

HEALTH_URL="${HEALTH_CHECK_URL:-http://localhost:3000/api/health}"
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" 2>/dev/null); then
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
    BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
      HEALTH_STATUS=$(echo "$BODY" | jq -r '.status' 2>/dev/null)
      if [ "$HEALTH_STATUS" = "ok" ] || [ "$HEALTH_STATUS" = "degraded" ]; then
        log_success "Health check passed (HTTP $HTTP_CODE)"
        break
      fi
    fi
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    log_warning "Health check failed, retrying... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep $RETRY_DELAY
  fi
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  log_error "Health check failed after $MAX_RETRIES attempts"
  exit 1
fi

##############################################################################
# Summary
##############################################################################

print_header "ROLLBACK COMPLETE"

log_success "Successfully rolled back to version $PREVIOUS_VERSION"
echo ""
echo "Summary:"
echo "  Cluster:   $AWS_CLUSTER_NAME"
echo "  Service:   $AWS_SERVICE_NAME"
echo "  From:      Version $CURRENT_VERSION"
echo "  To:        Version $PREVIOUS_VERSION"
echo "  Status:    RECOVERED ✓"
echo ""
log_info "Next steps:"
echo "  1. Verify application in browser"
echo "  2. Check logs for errors"
echo "  3. Review what caused the failure"
echo "  4. Fix the issue in code"
echo "  5. Add regression test"
echo "  6. Schedule re-deployment"
echo ""

exit 0
