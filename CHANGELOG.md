# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
## [0.2.0] - 2024-03-XX

### Added
- Enhanced UI Components
  - Add reusable ShadowContainer component for consistent shadow effects
  - Implement Aceternity-inspired shadow styling
  - Add multiple shadow variants (sm, md, lg, xl, inner, colored, glow, aceternity)
  - Add delete confirmation modal with modern glassmorphic design
  - Add animated gradient background effect to modals
  - Implement subtle glow effects with customizable opacity
  - Enhanced Skeleton component with premium loading animations:
    - Smooth horizontal shimmer with optimized timing
    - Secondary gradient glow layer
    - Ambient radial pulse effect
    - Configurable dimensions and styling
- Dynamic AI suggestions using Gemini API
  - Implement skeleton loading component for better UX
  - Add refresh functionality for suggestions
  - Handle API initialization and error states
  - Add loading states with proper visual feedback
- Enhanced markdown rendering with ReactMarkdown
  - Add custom code block formatting for inline and block code
  - Implement syntax highlighting styles
  - Add proper typography styling for markdown elements
  - Configure Tailwind Typography plugin for consistent markdown appearance
- Title generation improvements
  - Add parallel title generation with main response
  - Implement Edge browser compatibility fixes
  - Add retry logic for failed title generation
  - Synchronize title and response updates
  - Add fallback titles for error cases

### Changed
- Improve UI consistency and aesthetics
  - Refactor shadow styles into reusable utility
  - Enhance modal design with backdrop blur and border effects
  - Add smooth transitions for hover states
  - Implement consistent shadow effects across components
  - Fine-tune gradient animations and glow effects
  - Optimize border thickness and border radius for modals
  - Improve modal backdrop with proper opacity and blur
- Move GenAI initialization to useEffect
- Improve suggestion formatting and filtering
- Clean API responses to ensure consistent formatting
- Fix duplicate suggestions generation on page load
- Enhance suggestion prompts for more natural questions
- Remove markdown formatting from API responses
- Add debug logging for API responses and processed suggestions
- Improve message display formatting
  - Add proper spacing and margins for different content types
  - Enhance code block styling with dark theme
  - Implement better list and heading hierarchies
- Enhance title generation process
  - Make title and response appear simultaneously
  - Add proper error handling for Edge browser
  - Improve title generation reliability
  - Add contextual fallback titles
- Improve message animations
  - Increase text reveal animation duration from 0.5s to 1.0s for smoother effect
  - Add proper documentation for animation settings
  - Maintain staggered paragraph reveal delays
  - Keep consistent ease-out timing function
  - Document animation behavior in code comments

### Technical
- Setup GitHub Pages deployment
  - Configure gh-pages package for deployment
  - Add deployment scripts to package.json
  - Setup proper base URL for GitHub Pages
  - Add deployment documentation
- Add shadow styling system
  - Implement type-safe shadow variants
  - Add utility functions for combining Tailwind classes
  - Create reusable shadow container component
  - Add proper TypeScript types for shadow variants
  - Add BackgroundGradient component for animated effects
  - Implement framer-motion for smooth gradient animations
  - Add customizable animation controls and transitions
- Configure path aliases for better import management
- Add utility functions (clsx, tailwind-merge)
- Add proper TypeScript types for components
  - Add CodeProps type for markdown code blocks
  - Improve error handling types
  - Add proper typing for title generation
- Implement proper error handling
- Refactor GenAI state management using useState
- Improve suggestion processing pipeline with better string cleanup
- Add Tailwind Typography plugin configuration
- Implement proper TypeScript types for markdown components
- Add Edge browser detection and handling
- Implement retry mechanism for API calls
- Add proper type safety for async operations

<!-- Previous Changes -->
<!--
Initial setup:
- Basic chat interface implementation
- Gemini API integration
- Basic conversation management
- Simple message display
-->

<!-- Future Plans -->
<!--
Upcoming features:
- Message search functionality
- Conversation export
- Theme customization
- Mobile responsiveness improvements
- Voice input support
- Image generation capabilities
- Code syntax highlighting improvements
-->

<!-- Known Issues -->
<!--
Current limitations:
- Edge browser title generation delay
- Occasional API timeouts
- Message formatting edge cases
-->

### Deployment
To deploy the latest version:
```bash
# Build and deploy to GitHub Pages
npm run deploy
```

Note: Make sure to:
1. Commit all changes before deployment
2. Update version in package.json
3. Have proper GitHub Pages settings in your repository

## [0.2.1] - 2024-03-XX

### Changed
- Improve message animations
  - Fix text flicker during typing by adding timestamp check
  - Optimize text reveal animation duration to 0.5s for snappier feedback
  - Add condition to only animate messages newer than 1 second
  - Maintain staggered paragraph animations for smooth reveal
  - Add proper documentation for animation logic
- Enhance AI conversation
  - Move generation config to prompts.ts for better organization
  - Add different generation presets (default, creative, precise)
  - Update system prompt to be more engaging and natural
  - Improve conversation flow with better prompt engineering
  - Add detailed comments explaining animation and generation logic

### Technical
- Refactor configuration management
  - Move AI generation config to prompts.ts
  - Add TypeScript types for generation config
  - Add documentation for config parameters
  - Create preset configurations for different response styles
- Improve code organization
  - Centralize AI-related configurations
  - Add detailed code comments
  - Update type definitions
  - Improve maintainability of animation code

### Fixed
- Message animation issues
  - Fix text flicker during typing
  - Prevent re-animation of existing messages
  - Optimize animation performance
  - Fix Edge cases with message timestamps