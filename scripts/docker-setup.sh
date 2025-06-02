#!/bin/bash

# ==============================================
# Balance Docker Setup Script
# ==============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking requirements..."
    
    command -v docker >/dev/null 2>&1 || { 
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    }
    
    command -v docker-compose >/dev/null 2>&1 || { 
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
    
    print_info "Requirements check passed ✓"
}

# Setup environment files
setup_env() {
    print_info "Setting up environment files..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_info "Created .env.local from .env.example"
            print_warning "Please update .env.local with your actual values"
        else
            print_warning ".env.example not found. Please create .env.local manually"
        fi
    else
        print_info ".env.local already exists"
    fi
}

# Build and start services
start_production() {
    print_info "Starting production environment..."
    
    # Build and start
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    print_info "Production environment started successfully ✓"
    print_info "Application available at: http://localhost:3000"
}

# Start development environment
start_development() {
    print_info "Starting development environment..."
    
    # Build and start development environment
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    
    print_info "Development environment started successfully ✓"
    print_info "Application available at: http://localhost:3000"
    print_info "Database admin available at: http://localhost:8080"
    print_info "Use adminer credentials: Server=db, Username=paradigma, Password=paradigma"
}

# Restart development environment
restart_development() {
    print_info "Restarting development environment..."
    
    docker-compose -f docker-compose.dev.yml restart
    
    print_info "Development environment restarted successfully ✓"
}

# Stop all services
stop_services() {
    print_info "Stopping all Docker services..."
    
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    
    print_info "All services stopped ✓"
}

# Show container status
status() {
    print_info "Showing container status..."
    
    echo "Production containers:"
    docker-compose ps
    
    echo
    echo "Development containers:"
    docker-compose -f docker-compose.dev.yml ps
}

# Execute command in container
exec_container() {
    local env=${1:-"dev"}
    local service=${2:-"web"}
    local cmd=${3:-"/bin/sh"}
    
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml exec "$service" "$cmd"
    else
        docker-compose exec "$service" "$cmd"
    fi
}

# Clean up Docker resources
cleanup() {
    print_info "Cleaning up Docker resources..."
    
    # Stop all services
    stop_services
    
    # Remove unused images, containers, and networks
    docker system prune -f
    
    # Remove project-specific volumes (with confirmation)
    read -p "Do you want to remove database volumes? This will delete all data. (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume rm balance_db-data-dev 2>/dev/null || true
        print_info "Database volumes removed"
    fi
    
    print_info "Cleanup completed ✓"
}

# Show logs
show_logs() {
    local service=${1:-"web"}
    local env=${2:-"production"}
    
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f "$service"
    else
        docker-compose logs -f "$service"
    fi
}

# Health check
health_check() {
    print_info "Performing health check..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_info "Containers are running ✓"
        
        # Check application health
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            print_info "Application is responding ✓"
        else
            print_warning "Application is not responding"
        fi
    else
        print_error "No containers are running"
    fi
}

# Show usage information
show_usage() {
    echo "Balance Docker Setup Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start-prod         Start production environment"
    echo "  start-dev          Start development environment with database"
    echo "  restart-dev        Restart development environment"
    echo "  stop               Stop all services"
    echo "  status             Show container status"
    echo "  exec [env] [service] [cmd]  Execute command in container"
    echo "  cleanup            Clean up Docker resources"
    echo "  logs [service]     Show logs for service (default: web)"
    echo "  logs-dev [service] Show development logs for service"
    echo "  health             Perform health check"
    echo "  help               Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start-dev              # Start development environment"
    echo "  $0 restart-dev            # Restart development environment"
    echo "  $0 status                 # Show container status"
    echo "  $0 exec dev web /bin/sh   # Open shell in dev web container"
    echo "  $0 logs web               # Show web service logs"
    echo "  $0 logs-dev db            # Show database logs in dev mode"
    echo "  $0 cleanup                # Clean up all Docker resources"
}

# Main script logic
main() {
    case "${1:-help}" in
        "start-prod")
            check_requirements
            setup_env
            start_production
            ;;
        "start-dev")
            check_requirements
            setup_env
            start_development
            ;;
        "restart-dev")
            restart_development
            ;;
        "stop")
            stop_services
            ;;
        "status")
            status
            ;;
        "exec")
            exec_container "$2" "$3" "$4"
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            show_logs "$2" "production"
            ;;
        "logs-dev")
            show_logs "$2" "dev"
            ;;
        "health")
            health_check
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@" 