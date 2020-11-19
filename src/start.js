const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio')
const chalk = require('chalk')
const ora = require('ora')
const symbols = require('log-symbols')

const defaultConfig = require('./defaut.config');
const evaluateScript = require('./evaluateScript');

module.exports = async function (options) {
    const spiner = ora()
    try {
        const opt = {...defaultConfig, ...options}
        opt.customOverloapping = opt.customOverloapping.toString()
        opt.deleteNode = opt.deleteNode.toString()
        opt.modifyNode = opt.modifyNode.toString()

        const { url, wrapEle, launchParams, userAgent, viewportParams, currentTestUrl, testUrl, awaitTime, outputFile, screenshot, cookieArr, goToOptions } = opt

        if (!url || !wrapEle) {
            throw new Error('url && wrapEle不能为空')
        }

        spiner.text = 'start create skeleton page...'
        spiner.start()
        const browser = await puppeteer.launch(launchParams);
        const page = await browser.newPage()

        await page.setUserAgent(userAgent)

        await page.setViewport(viewportParams)

        if (cookieArr && cookieArr.length) {
            await page.setCookie(...cookieArr)
        }

        await page.goto(url || testUrl[currentTestUrl].url, {...goToOptions})

        if (awaitTime) {
            await page.waitForTimeout(awaitTime);
        }

        const bodyHandle = await page.$(wrapEle || testUrl[currentTestUrl].wrap);

        const html = await page.evaluate(evaluateScript, bodyHandle, opt)

        let file = ''
        if (fs.pathExistsSync(path.resolve(outputFile.path))) {
            file = await fs.readFile(path.resolve(outputFile.path))
        }

        if (!file) {
            file = await fs.readFile(path.resolve(__dirname, outputFile.path))

        }
        const $ = cheerio.load(file)

        $(outputFile.wrap).html(html)

        await fs.outputFile(path.resolve(outputFile.path), $.html())

        if (screenshot.open) {
            await page.screenshot({path: screenshot.path});
        }
        await browser.close()
        spiner.stop()
        console.log(symbols.success, chalk.green('create skeleton page finished!'))
    } catch (error) {
        spiner.stop()
        console.log(chalk.red(`create ask.config.js ${error}`))
        process.exit(1)
    }
}
