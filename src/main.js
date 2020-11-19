const program = require("commander")
const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')

const VERSION = require('../package.json').version

const actionMap = {
    init: {
        description: 'init ask.config.js',
        usages: [
          'ask init',
        ]
    }
}

program.command('start')
    .description('generate a skeleton page')
    .usage([
        'ask start'
    ])
    .action(async (cmd) => {
        try {
            const filePath = path.resolve('ask.config.js')
            const exists = await fs.pathExists(filePath)
            if (!exists) {
                console.log(chalk.yellow('当前目录下未找到ask.config.js配置文件，请使用ask init创建配置文件'))
            } else {
                const options = require(filePath)
                require('./start')(options)
            }
        } catch (error) {
            console.log('error', error)
        }
    })
  

Object.keys(actionMap).forEach((action) => {
    program.command(action)
        .description(actionMap[action].description)
        .action((...args) => {
            switch(action) {
                case 'init':
                    require('./init')(...process.argv.slice(3))
                    break;
            }
        })
})

function help() {
    console.log('\r\nUsage:')
    console.log('  - ' + 'ask start');
    Object.keys(actionMap).forEach((action) => {
        actionMap[action].usages.forEach((usage) => {
            console.log('  - ' + usage);
        })
    })
    console.log('\r');
}

program.usage('<command> [options]')
program.on('-h', help)
program.on('--help', help)
program.version(VERSION, '-V --version').parse(process.argv)

if (!process.argv.slice(2)) {
    program.outputHelp((txt) => {
        chalk.green(txt)
    })
}