# Changelog

## [2.0.0] - 2025-07-05

### Major Changes - Functional Programming Refactoring

#### 🔄 Breaking Changes
- **Complete refactoring to functional programming approach**
- **Eliminated all variable mutations** - No more `let` reassignments
- **Converted to ES modules** - All `require()` replaced with `import`
- **Immutable data structures** - All operations return new values instead of mutating existing ones

#### ✨ Features
- **Pure functions** - All functions are side-effect free with predictable outputs
- **Functional composition** - Complex operations built from composable functions
- **Improved performance** - Optimized pixel processing with functional array operations
- **Better error handling** - Structured error responses with detailed information

#### 🏗️ Architecture Changes
- **lib/gameboy-converter.js** - Main library with functional API
- **bin/cli.js** - Command-line interface using the library
- **test/test.js** - Functional test suite with immutable test runner
- **examples/** - Updated usage examples
- **Complete ES modules** - Modern JavaScript module system throughout

#### 🔧 Technical Improvements
- **Functional pixel conversion** - Using `Array.from()` and `Uint8ClampedArray`
- **Immutable GBDK generation** - Template literals and array composition
- **Functional color distance calculation** - Pure mathematical functions
- **Non-mutating file operations** - Functional approach to I/O

#### 📚 Documentation
- **All comments translated to English** - Complete internationalization
- **Comprehensive JSDoc** - Full API documentation
- **Functional examples** - Usage patterns for functional programming
- **README updates** - Modern usage examples and API reference

#### 🧪 Testing
- **Functional test runner** - Immutable test result accumulation
- **Comprehensive test coverage** - All features tested
- **CLI integration tests** - End-to-end functionality verification

### Migration Guide

#### For Library Users
```javascript
// Old CommonJS approach
const { convertImage } = require('gameboy-png-converter');

// New ES modules approach
import { convertImage } from 'gameboy-png-converter';
```

#### For Contributors
- All code now follows functional programming principles
- No `let` declarations with reassignments
- Pure functions with predictable outputs
- Immutable data structures throughout

## [1.0.1] - Previous Version
- Basic PNG to Game Boy palette conversion
- GBDK code generation
- Command-line interface
- Spanish documentation
