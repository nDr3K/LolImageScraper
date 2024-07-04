# Lolesports Player Image Scraper

LolPlayerImageScraper is a Node.js-based script designed to scrape images from [lolesports.com](https://lolesports.com). It navigates through specified ranking links, downloads images, and converts them to the WebP format.

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).

2. **WebP Tools**: Install WebP tools, specifically `cwebp`, which is used to convert images to WebP format.
   - Download WebP tools from [Google's WebP download page](https://developers.google.com/speed/webp/download).
   - Extract the tools and add the directory containing `cwebp` to your system's PATH.

## Installation

1. Clone the repository or download the script file.
   ```sh
   git clone https://github.com/yourusername/FantalolEsportsScraper.git
   cd FantalolEsportsScraper

## Usage

To use the script run the following command 
```
node download_images.js <URL> <folderName>
```