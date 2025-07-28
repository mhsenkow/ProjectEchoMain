# 🛠️ EchoFrame Development Guide

This guide covers all the tools and workflows for efficient UI development in EchoFrame.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- VS Code (recommended)
- Ollama with at least one model

### Initial Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run dev:vite` - Start Vite dev server only
- `npm run dev:electron` - Start Electron app only

### Building
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run ui:check` - Run all code quality checks
- `npm run ui:fix` - Fix all code issues

### Cleanup
- `npm run clean` - Clean build artifacts
- `npm run clean:all` - Clean everything and reinstall

## 🎨 UI Development Workflow

### Using the Development Script
```bash
# Start development
./scripts/dev-workflow.sh dev

# Fix all code issues
./scripts/dev-workflow.sh fix

# Check code quality
./scripts/dev-workflow.sh check

# See all available commands
./scripts/dev-workflow.sh help
```

### VS Code Integration
The project includes VS Code settings that automatically:
- Format code on save
- Fix ESLint issues on save
- Organize imports on save
- Provide Tailwind CSS IntelliSense
- Enable TypeScript auto-imports

### Recommended VS Code Extensions
Install the recommended extensions for the best experience:
- Prettier - Code formatter
- ESLint - JavaScript linting
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Auto Rename Tag
- Path Intellisense

## 🏗️ Project Structure

```
echo-frame/
├── engine/              # AI engines and processing
│   ├── ollama.ts        # LLM integration
│   ├── emotion.ts       # Emotional intelligence
│   ├── dreamEngine.ts   # Dream generation
│   ├── personalityEvolution.ts # Personality system
│   ├── backgroundProcessor.ts  # Background processing
│   ├── fileContext.ts   # File context handling
│   ├── tts.ts          # Text-to-speech
│   ├── stt.ts          # Speech-to-text
│   └── playback.ts     # Audio playback
├── renderer/            # React frontend
│   ├── components/      # UI components
│   ├── avatars/         # 3D avatar system
│   ├── conversation/    # Chat and timeline
│   └── App.tsx         # Main app component
├── main/               # Electron main process
├── store/              # Data storage
├── scripts/            # Development utilities
└── [config files]      # Build and linting configs
```

## 🎯 UI Component Development

### Creating New Components
1. Create component in `renderer/components/`
2. Use TypeScript with proper typing
3. Follow the existing component patterns
4. Add proper JSDoc comments

### Styling Guidelines
- Use Tailwind CSS for styling
- Follow the existing design system
- Use CSS variables for theme colors
- Keep components responsive

### Component Structure
```tsx
import React from 'react';

interface ComponentProps {
  // Define props here
}

/**
 * Component description
 */
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return (
    <div className="component-classes">
      {/* Component content */}
    </div>
  );
}
```

## 🔧 Code Quality Standards

### ESLint Rules
- React best practices
- TypeScript strict mode
- Consistent code style
- No unused variables
- Proper import organization

### Prettier Configuration
- Single quotes
- 2-space indentation
- 80 character line width
- Trailing commas
- Consistent formatting

### TypeScript Guidelines
- Strict type checking
- No `any` types (use proper types)
- Interface over type aliases
- Proper JSDoc documentation

## 🐛 Debugging

### Development Tools
- React Developer Tools
- Redux DevTools (if using state management)
- Electron DevTools
- Network tab for API calls

### Common Issues
1. **Build errors**: Run `npm run type-check` to see TypeScript errors
2. **Linting errors**: Run `npm run lint:fix` to auto-fix
3. **Formatting issues**: Run `npm run format` to fix
4. **Hot reload not working**: Check if both Vite and Electron are running

### Debug Commands
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Check formatting
npm run format:check

# Fix all issues
npm run ui:fix
```

## 🚀 Performance Optimization

### Build Optimization
- Code splitting with dynamic imports
- Tree shaking for unused code
- Minification and compression
- Asset optimization

### Development Performance
- Fast refresh for React components
- Hot module replacement
- Incremental TypeScript compilation
- Efficient file watching

## 📦 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start the production app
npm start
```

### Distribution
- Use Electron Builder for packaging
- Configure in `package.json`
- Test on target platforms

## 🤝 Contributing

### Before Committing
1. Run `npm run ui:check` to ensure code quality
2. Fix any linting or formatting issues
3. Test the application thoroughly
4. Update documentation if needed

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] TypeScript types are properly defined
- [ ] Components are properly documented
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Accessibility considerations

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

## 🆘 Getting Help

If you encounter issues:
1. Check the console for error messages
2. Run `npm run ui:check` to identify issues
3. Check the documentation
4. Look at existing code for patterns
5. Ask for help in the project discussions

---

Happy coding! 🎉 