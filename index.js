const R = require('rambda')
const argv = require('optimist').argv
const shell = require('shelljs')
const path = require('path')

require('consoleplusplus')

const defaultModules = []
const defaultDevModules = ['standard', 'snazzy', 'ava']

const validate = () => argv.parentDirectory && argv.projectName

const showCommand = command => console.info('> ' + command)

const runCommand = command => {
  showCommand(command)
  shell.exec(command)
}

const joinModules = (arg, defaultModules) => {
  let modules = arg ? arg.split(',') : []
  return R.uniq([...modules, ...defaultModules])
}

const generateNodePackage = () => {
  const modules = joinModules(argv.modules, defaultModules)
  const devModules = joinModules(argv.devModules, defaultDevModules)

  const directory = path.join(argv.parentDirectory, argv.projectName)
  console.info(`Generating node package '${argv.projectName}'...`)
  
  runCommand(`mkdir -p ${directory}`)

  showCommand(`cd ${directory}`)
  shell.cd(directory)
  
  runCommand(`yarn init -y`)
  
  if (modules.length > 0)
    runCommand(`yarn add ${modules.join(' ')}`)
  if (devModules.length > 0)
    runCommand(`yarn add --dev ${devModules.join(' ')}`)
  
  runCommand(`gitignore node`)

  runCommand(`touch index.js`)

  runCommand(`json --in-place -f package.json -e 'this.scripts = {"start": "standard | snazzy ; node $npm_package_main", "test": "ava" }'`)

  runCommand(`yarn start`)

  if (argv.editor) {
    if (argv.isEditorOpened)
      runCommand(`${argv.editor} index.js`)
    else
      runCommand(`${argv.editor} ${directory}`)
  }

  console.info('Done.') 
}

const run = () => {
  if (validate()) {
    try {
      generateNodePackage()     
    } catch (ex) {
      console.error(ex)
      process.exit(1)
    }
  } else {
    console.error("Not all required information were provided. Check the parameters and try again.")
    process.exit(1)
  }
}

run()
