#!/bin/bash

# Set default values
KEEP_CONTAINERS=false

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --keep-containers)
      KEEP_CONTAINERS=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Stop and remove any existing containers
echo "🧹 Cleaning up any existing test containers..."
docker compose -f docker-compose.test.yml --env-file .env.test down -v --remove-orphans

# Build the test container
echo "🏗️ Building test container..."
docker compose -f docker-compose.test.yml --env-file .env.test build

# Run the tests
echo "🧪 Running frontend tests..."
docker compose -f docker-compose.test.yml --env-file .env.test run --rm frontend-test
TEST_EXIT_CODE=$?

# Clean up containers unless --keep-containers is specified
if [ "$KEEP_CONTAINERS" = false ]; then
  echo "🧹 Cleaning up test containers..."
  docker compose -f docker-compose.test.yml --env-file .env.test down -v
else
  echo "🔍 Containers kept running for inspection"
fi

# Report result
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All frontend tests passed!"
else
  echo "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
fi

# Exit with the test exit code
exit $TEST_EXIT_CODE
