<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Game Boy PNG Converter - Copilot Instructions

This is a Node.js NPM library that converts PNG images of any size to Game Boy color palette and generates GBDK code.

## Project Context
- **Purpose**: Convert PNG images to Game Boy's 4-color green palette and generate C code for GBDK
- **Input**: PNG images of any size
- **Output**: PNG images with Game Boy color palette + optional C code for GBDK
- **Technology**: Node.js with Canvas API
- **Type**: NPM library with CLI interface

## Code Guidelines
- Use the exact Game Boy color palette: 4 shades of green
- Handle images of any dimensions dynamically
- Handle errors gracefully with descriptive messages
- Use console output with emojis for better UX
- Follow Node.js best practices for file handling
- Display image dimensions during processing
- Return structured results from API functions
- Support both programmatic API and CLI usage

## Key Features
- Color distance calculation using Euclidean distance
- Automatic output filename generation
- Input validation (file existence, PNG format)
- Command-line interface with help text
- Support for any image size
- GBDK code generation with customizable variable names
- Verbose and quiet modes
- Comprehensive API for library usage

## Architecture
- **lib/gameboy-converter.js**: Main library with all conversion functions
- **bin/cli.js**: CLI interface that uses the library
- **examples/**: Usage examples for developers
- **test/**: Basic test suite

## Dependencies
- canvas: For image processing and pixel manipulation
- fs: For file system operations (built-in)
- path: For file path handling (built-in)
