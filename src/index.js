#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

const prompts = [
  {
    name: 'frame',
    message: '请选择框架:',
    type: 'list',
    choices: [
      { name: 'React', value: 'react' },
      { name: 'Vue', value: 'vue' },
      { name: 'Svelte', value: 'svelte' }
    ]
  },
  {
    name: 'description',
    message: '请输入项目描述:'
  },
  {
    name: 'version',
    message: '请输入版本:'
  },
  {
    name: 'author',
    message: '请输入作者名称:'
  }
];

function downloadFulfil(name, answers) {
  const fileName = `${name}/package.json`;
  const meta = {
    name,
    version: answers.version || '1.0.0',
    description: answers.description,
    author: answers.author
  }
  if (fs.existsSync(fileName)) {
    const content = fs.readFileSync(fileName).toString();
    const result = handlebars.compile(content)(meta);
    fs.writeFileSync(fileName, result);
  }
  console.log(symbols.success, chalk.green('项目初始化完成'));
}

program.version('0.0.1', '-V, --version')
  .command('create <name>')
  .action((name) => {
    if (!fs.existsSync(name)) {
      inquirer.prompt(prompts).then((answers) => {
        const spinner = ora('正在下载模板...');
        spinner.start();
        const gitUrls = {
          vue: 'https://github.com:yoguang/vue-template#v0.0.1',
          react: 'https://github.com:yoguang/react-webpack-base#v0.0.1',
          svelte: 'https://github.com:yoguang/svelte-template#v0.0.1'
        };
        download(gitUrls[answers.frame], name, { clone: true }, (err) => {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red(err));
          } else {
            spinner.succeed();
            downloadFulfil(name, answers);
          }
        })
      })
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  })

program.parse(process.argv);