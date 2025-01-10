# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Dynamic AI suggestions using Gemini API
  - Implement skeleton loading component for better UX
  - Add refresh functionality for suggestions
  - Handle API initialization and error states
  - Add loading states with proper visual feedback

### Changed
- Move GenAI initialization to useEffect
- Improve suggestion formatting and filtering
- Clean API responses to ensure consistent formatting
- Fix duplicate suggestions generation on page load
- Enhance suggestion prompts for more natural questions
- Remove markdown formatting from API responses
- Add debug logging for API responses and processed suggestions

### Technical
- Configure path aliases for better import management
- Add utility functions (clsx, tailwind-merge)
- Add proper TypeScript types for components
- Implement proper error handling
- Refactor GenAI state management using useState
- Improve suggestion processing pipeline with better string cleanup 