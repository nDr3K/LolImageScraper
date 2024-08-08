const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { saveImage, imagesFolderName } = require('./utils');

async function fetchAndSaveImages(url, folderName) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const rankingLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a.ranking')).map(a => a.href);
    });

    for (const subUrl of rankingLinks) {
        await fetchImagesFromSubpage(subUrl, page, folderName);
    }

    await browser.close();
}

async function fetchImagesFromSubpage(url, page, folderName) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    const infoDivs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div.info')).map(div => {
            const style = div.getAttribute('style');
            const imageUrlMatch = /url\(([^)]+)\)/.exec(style);
            const summonerName = div.querySelector('div.summoner-name').innerText.trim();
            return imageUrlMatch ? { imageUrl: imageUrlMatch[1].replace(/["']/g, ''), summonerName } : null;
        }).filter(info => info !== null);
    });

    for (const info of infoDivs) {
        await saveImage(info.imageUrl, info.summonerName, folderName);
    }
}

const url = process.argv[2];
const folderName = process.argv[3];

const imagesDir = path.join(__dirname, imagesFolderName, folderName);
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

if (!url || !folderName) {
    console.error('Please provide a URL as the first argument and a folder name as the second argument.');
    process.exit(1);
}

fetchAndSaveImages(url, folderName);