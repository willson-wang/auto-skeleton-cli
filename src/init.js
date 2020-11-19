const fs = require('fs-extra')
const chalk = require('chalk')
const ora = require('ora')
const symbols = require('log-symbols')
const path = require('path')

const defaultConfig = require('./defaut.config');

module.exports = async function init() {
    const spiner = ora()
    try {
        spiner.text = 'create ask.config.js...'
        spiner.start()
        const output = path.resolve('ask.config.js')
        const { viewportParams, awaitTime, launchParams, outputFile, goToOptions } = defaultConfig
        const config ={
            url: '',
            wrapEle: 'body',
            viewportParams,
            awaitTime,
            launchParams,
            outputFile,
            goToOptions
        }
        const str = `module.exports = ${JSON.stringify(config, null, 4)}`
        fs.writeFileSync(output, str, 'utf-8')
        spiner.stop()
        console.log(symbols.success, chalk.green('create ask.config.js finished!'))
    } catch (error) {
        spiner.stop()
        console.log(chalk.red(`create ask.config.js ${error}`))
    }
}