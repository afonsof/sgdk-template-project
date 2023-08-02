const {spawn} = require('child_process');
const platform = process.platform;
const log = (text) => process.stdout.write(text);
const logError = (text) => process.stderr.write(text);

const commandLine = (command) => {
  if (platform === 'win32') {
    return `build\\windows\\${command}.bat`;
  }
  if (platform === 'darwin') {
    return `./build/mac/${command}.sh`;
  }
  return `./build/unix/${command}.sh`;
}

const childProcess = spawn(commandLine(process.argv[2]));
childProcess.stdout.on('data', (data) => {
  log(data.toString());
});
childProcess.stderr.on('data', (data) => {
  logError(data.toString());
});

childProcess.on('exit', (code) => {
  process.exit(code);
})