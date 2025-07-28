#!/bin/bash

# EchoFrame Development Workflow Script
# This script provides easy commands for UI development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_deps() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully!"
}

# Function to start development server
start_dev() {
    print_status "Starting development server..."
    npm run dev
}

# Function to build the project
build_project() {
    print_status "Building project..."
    npm run build
    print_success "Build completed successfully!"
}

# Function to clean the project
clean_project() {
    print_status "Cleaning project..."
    npm run clean
    print_success "Project cleaned successfully!"
}

# Function to run linting
run_lint() {
    print_status "Running ESLint..."
    npm run lint
    print_success "Linting completed!"
}

# Function to fix linting issues
fix_lint() {
    print_status "Fixing linting issues..."
    npm run lint:fix
    print_success "Linting issues fixed!"
}

# Function to format code
format_code() {
    print_status "Formatting code with Prettier..."
    npm run format
    print_success "Code formatted successfully!"
}

# Function to check code quality
check_code() {
    print_status "Running code quality checks..."
    npm run ui:check
    print_success "Code quality checks completed!"
}

# Function to fix all code issues
fix_all() {
    print_status "Fixing all code issues..."
    npm run ui:fix
    print_success "All code issues fixed!"
}

# Function to show help
show_help() {
    echo "EchoFrame Development Workflow"
    echo ""
    echo "Usage: ./scripts/dev-workflow.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install dependencies"
    echo "  dev         Start development server"
    echo "  build       Build the project"
    echo "  clean       Clean build artifacts"
    echo "  lint        Run ESLint"
    echo "  lint:fix    Fix ESLint issues"
    echo "  format      Format code with Prettier"
    echo "  check       Run all code quality checks"
    echo "  fix         Fix all code issues"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev-workflow.sh install"
    echo "  ./scripts/dev-workflow.sh dev"
    echo "  ./scripts/dev-workflow.sh fix"
}

# Main script logic
case "${1:-help}" in
    "install")
        install_deps
        ;;
    "dev")
        start_dev
        ;;
    "build")
        build_project
        ;;
    "clean")
        clean_project
        ;;
    "lint")
        run_lint
        ;;
    "lint:fix")
        fix_lint
        ;;
    "format")
        format_code
        ;;
    "check")
        check_code
        ;;
    "fix")
        fix_all
        ;;
    "help"|*)
        show_help
        ;;
esac 