# 🎮 Game Boy PNG Converter

A Node.js library and CLI tool that converts PNG images to the classic Game Boy color palette and generates GBDK-compatible C code.

[![npm version](https://badge.fury.io/js/gameboy-png-converter.svg)](https://badge.fury.io/js/gameboy-png-converter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Features

- 🖼️ **Converts PNG images of any size**
- 🎨 **Uses the authentic 4-color Game Boy palette**
- 🎮 **Generates C code for GBDK** (Game Boy Development Kit)
- 📦 **Reusable NPM library**
- 💻 **Easy-to-use CLI**
- 🔧 **Complete programmatic API**
- 📏 **Converts to 8x8 pixel tile format**
- ⚡ **Fast and efficient processing**

## 📦 Installation

### As a dependency in your project:
```bash
npm install gameboy-png-converter
```

### As a global tool:
```bash
npm install -g gameboy-png-converter
```

### Use with npx (without installation):
```bash
npx gameboy-png-converter image.png --gbdk
```

## 🎨 Game Boy Color Palette

The library uses the original Game Boy color palette:
- Lightest green: `#9BBC0F` (RGB: 155, 188, 15) → GBDK Value: 0
- Light green: `#8BAC0F` (RGB: 139, 172, 15) → GBDK Value: 1
- Dark green: `#306230` (RGB: 48, 98, 48) → GBDK Value: 2
- Darkest green: `#0F380F` (RGB: 15, 56, 15) → GBDK Value: 3

## 💻 CLI Usage

### Basic syntax:
```bash
gameboy-convert <input_file.png> [output_file.png] [options]
```

### Options:
- `--gbdk`: Also generates GBDK-compatible C code
- `--var <name>`: Custom name for GBDK variables
- `--quiet`: Silent mode (no verbose output)

### Examples:

```bash
# Basic conversion
gameboy-convert sprite.png

# With custom name
gameboy-convert sprite.png sprite_gb.png

# Generate GBDK code
gameboy-convert sprite.png --gbdk

# With custom variable for GBDK
gameboy-convert player.png --gbdk --var player_sprite

# Silent mode
gameboy-convert background.png --gbdk --quiet

# Using npx
npx gameboy-png-converter image.png --gbdk
```

## 📚 Library Usage

### Import:
```javascript
const { 
    convertImage, 
    convertToGameBoy, 
    generateGBDKCode,
    GAMEBOY_PALETTE 
} = require('gameboy-png-converter');
```

### Main function (recommended):
```javascript
// Simple conversion
const result = await convertImage('sprite.png');

// Conversion with GBDK code
const result = await convertImage('sprite.png', {
    outputPath: 'sprite_gb.png',
    generateGBDK: true,
    variableName: 'player_sprite',
    verbose: true
});

console.log(result);
// {
//   success: true,
//   conversion: { success: true, outputPath: '...', width: 16, height: 16 },
//   gbdk: { success: true, outputPath: '...', tilesGenerated: 4 }
// }
```

### Individual functions:
```javascript
// Image conversion only
const convResult = await convertToGameBoy(
    'input.png', 
    'output.png',
    { verbose: false }
);

// GBDK code generation only
const gbdkResult = await generateGBDKCode(
    'sprite_gb.png',
    'sprite.c',
    { variableName: 'my_sprite' }
);
```

### Available options:
```javascript
const options = {
    outputPath: 'custom_output.png',  // Custom path
    generateGBDK: true,               // Generate GBDK code
    verbose: true,                    // Show information
    variableName: 'custom_sprite'     // Name for GBDK variables
};
```

## 🎮 GBDK Integration

### Example of generated C code:
```c
#include <gb/gb.h>

// Sprite/tile data
const unsigned char player_sprite_data[] = {
    0x00, 0x00, 0x3C, 0x3C, 0x42, 0x7E, 0x99, 0xFF,
    0x99, 0xFF, 0x7E, 0x42, 0x3C, 0x3C, 0x00, 0x00,
    // ... more data
};

// Useful definitions
#define PLAYER_SPRITE_WIDTH 16
#define PLAYER_SPRITE_HEIGHT 16
#define PLAYER_SPRITE_TILE_WIDTH 2
#define PLAYER_SPRITE_TILE_HEIGHT 2
#define PLAYER_SPRITE_TILE_COUNT 4
#define PLAYER_SPRITE_SIZE 64

// Usage example:
// set_sprite_data(0, 4, player_sprite_data);
// set_sprite_tile(0, 0);
```

### Usage in your GBDK project:
```c
#include <gb/gb.h>
#include "player_sprite.c"

void main() {
    // Load sprite data
    set_sprite_data(0, PLAYER_SPRITE_TILE_COUNT, player_sprite_data);
    
    // Configure sprite
    set_sprite_tile(0, 0);
    move_sprite(0, 50, 50);
    
    // Show sprites
    SHOW_SPRITES;
    
    // Your game logic...
}
```

## 🧪 Testing

Run the included tests:
```bash
npm test
```

See usage examples:
```bash
npm run example
```

## 📁 Project Structure

```
gameboy-png-converter/
├── lib/
│   └── gameboy-converter.js      # Main library
├── bin/
│   └── cli.js                    # CLI interface
├── examples/
│   └── usage-example.js          # Usage examples
├── test/
│   └── test.js                   # Basic tests
├── package.json                  # NPM configuration
├── README.md                     # This file
└── LICENSE                       # MIT License
```

## 🔧 API Reference

### `convertImage(inputPath, options)`
Main function that combines conversion and GBDK generation.

**Parameters:**
- `inputPath` (string): PNG file path
- `options` (object): Configuration options

**Returns:** Promise<Object> with conversion result

### `convertToGameBoy(inputPath, outputPath, options)`
Converts a PNG image to Game Boy palette.

### `generateGBDKCode(imagePath, outputPath, options)`
Generates C code for GBDK from a converted image.

### `findClosestGameBoyColor(r, g, b)`
Finds the closest color in the Game Boy palette.

### `GAMEBOY_PALETTE`
Array with the 4 colors of the Game Boy palette.

## ⚠️ Limitations

- Only accepts PNG files
- Alpha channel is preserved but may be affected
- GBDK tiles are always 8x8 pixels (Game Boy standard)
- Requires Node.js 14 or higher

## 🛠️ Conversion Algorithm

### Color Conversion
Uses Euclidean distance to find the closest color:
```
distance = √[(r1-r2)² + (g1-g2)² + (b1-b2)²]
```

### GBDK Conversion
1. **Color mapping**: Each color → 2-bit value (0-3)
2. **Tile division**: Image → 8x8 pixel tiles
3. **Encoding**: Each row → two bytes (Game Boy format)
4. **Generation**: C code with arrays and definitions

## 🤝 Contributions

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/gameboy-png-converter)
- [GitHub Repository](https://github.com/ginjol83/gameboy-png-converter)
- [GBDK Documentation](https://gbdk-2020.github.io/gbdk-2020/)
- [Game Boy Development Community](https://gbdev.io/)

## 📊 Versions

### v1.0.0
- ✅ PNG to Game Boy palette conversion
- ✅ GBDK code generation
- ✅ CLI and programmatic API
- ✅ Support for any image size
- ✅ Basic tests included
