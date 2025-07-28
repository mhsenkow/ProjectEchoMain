#!/bin/bash

# EchoFrame Component Generator
# Creates new React components with proper TypeScript structure

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

# Function to capitalize first letter
capitalize() {
    echo "$1" | sed 's/^./\U&/'
}

# Function to convert to kebab-case
to_kebab() {
    echo "$1" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//'
}

# Function to show help
show_help() {
    echo "EchoFrame Component Generator"
    echo ""
    echo "Usage: ./scripts/create-component.sh [component-name] [options]"
    echo ""
    echo "Arguments:"
    echo "  component-name    Name of the component (PascalCase recommended)"
    echo ""
    echo "Options:"
    echo "  -t, --type        Component type (default: functional)"
    echo "                    Options: functional, class, hook"
    echo "  -p, --path        Path where to create component (default: renderer/components/)"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/create-component.sh UserProfile"
    echo "  ./scripts/create-component.sh DataTable --type functional"
    echo "  ./scripts/create-component.sh useApiData --type hook --path renderer/hooks/"
}

# Function to create functional component
create_functional_component() {
    local component_name=$1
    local file_path=$2
    
    cat > "$file_path" << EOF
import React from 'react';

interface ${component_name}Props {
  // Define your props here
}

/**
 * ${component_name} component description
 */
export function ${component_name}({ }: ${component_name}Props) {
  return (
    <div className="${to_kebab $component_name}-container">
      {/* Component content */}
    </div>
  );
}
EOF
}

# Function to create class component
create_class_component() {
    local component_name=$1
    local file_path=$2
    
    cat > "$file_path" << EOF
import React, { Component } from 'react';

interface ${component_name}Props {
  // Define your props here
}

interface ${component_name}State {
  // Define your state here
}

/**
 * ${component_name} component description
 */
export class ${component_name} extends Component<${component_name}Props, ${component_name}State> {
  constructor(props: ${component_name}Props) {
    super(props);
    this.state = {
      // Initialize state
    };
  }

  render() {
    return (
      <div className="${to_kebab $component_name}-container">
        {/* Component content */}
      </div>
    );
  }
}
EOF
}

# Function to create custom hook
create_hook() {
    local hook_name=$1
    local file_path=$2
    
    cat > "$file_path" << EOF
import { useState, useEffect } from 'react';

interface Use${hook_name#use}Return {
  // Define return type
}

/**
 * ${hook_name} hook description
 */
export function ${hook_name}(): Use${hook_name#use}Return {
  const [state, setState] = useState();

  useEffect(() => {
    // Hook logic
  }, []);

  return {
    // Return values
  };
}
EOF
}

# Function to create index file
create_index_file() {
    local component_name=$1
    local dir_path=$2
    
    cat > "$dir_path/index.ts" << EOF
export { ${component_name} } from './${component_name}';
EOF
}

# Function to create test file
create_test_file() {
    local component_name=$1
    local file_path=$2
    
    cat > "$file_path" << EOF
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${component_name} } from './${component_name}';

describe('${component_name}', () => {
  it('renders without crashing', () => {
    render(<${component_name} />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  // Add more tests here
});
EOF
}

# Function to create CSS module file
create_css_module() {
    local component_name=$1
    local file_path=$2
    
    cat > "$file_path" << EOF
.${to_kebab $component_name}Container {
  /* Component styles */
}
EOF
}

# Main script logic
main() {
    local component_name=""
    local component_type="functional"
    local component_path="renderer/components"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                component_type="$2"
                shift 2
                ;;
            -p|--path)
                component_path="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                if [[ -z "$component_name" ]]; then
                    component_name="$1"
                else
                    print_error "Multiple component names provided"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Validate component name
    if [[ -z "$component_name" ]]; then
        print_error "Component name is required"
        show_help
        exit 1
    fi
    
    # Validate component type
    if [[ ! "$component_type" =~ ^(functional|class|hook)$ ]]; then
        print_error "Invalid component type: $component_type"
        print_error "Valid types: functional, class, hook"
        exit 1
    fi
    
    # Create directory if it doesn't exist
    if [[ ! -d "$component_path" ]]; then
        print_status "Creating directory: $component_path"
        mkdir -p "$component_path"
    fi
    
    # Determine file extension and content
    local file_extension="tsx"
    if [[ "$component_type" == "hook" ]]; then
        file_extension="ts"
    fi
    
    local component_file="$component_path/${component_name}.$file_extension"
    local test_file="$component_path/${component_name}.test.$file_extension"
    local css_module_file="$component_path/${component_name}.module.css"
    local index_file="$component_path/index.ts"
    
    # Check if component already exists
    if [[ -f "$component_file" ]]; then
        print_warning "Component $component_name already exists at $component_file"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Component creation cancelled"
            exit 0
        fi
    fi
    
    # Create component file
    print_status "Creating $component_type component: $component_name"
    case "$component_type" in
        "functional")
            create_functional_component "$component_name" "$component_file"
            ;;
        "class")
            create_class_component "$component_name" "$component_file"
            ;;
        "hook")
            create_hook "$component_name" "$component_file"
            ;;
    esac
    
    # Create additional files
    print_status "Creating additional files..."
    
    # Create test file
    create_test_file "$component_name" "$test_file"
    
    # Create CSS module
    create_css_module "$component_name" "$css_module_file"
    
    # Create index file
    create_index_file "$component_name" "$component_path"
    
    print_success "Component $component_name created successfully!"
    print_status "Files created:"
    echo "  - $component_file"
    echo "  - $test_file"
    echo "  - $css_module_file"
    echo "  - $index_file"
    
    # Format the files
    print_status "Formatting files..."
    if command -v npx >/dev/null 2>&1; then
        npx prettier --write "$component_file" "$test_file" "$css_module_file" "$index_file" 2>/dev/null || true
    fi
    
    print_success "Component creation complete!"
}

# Run main function with all arguments
main "$@" 