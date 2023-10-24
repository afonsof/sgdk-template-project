const {spawn} = require('node:child_process');
import crypto from 'crypto';
import fs from 'fs';

const platform = process.platform;
const log = (text) => process.stdout.write(text);
const logError = (text) => {
  if (text) {
    process.stderr.write(text ?? []);
  }
}

const getFileMd5 = (filePath) => {
  const md5 = crypto.createHash('md5');
  md5.update(fs.readFileSync(filePath));
  return md5.digest('hex');
}

let data;
try {
  data = JSON.parse(fs.readFileSync('./build-data.json', 'utf8'))
} catch (e) {
  data = {};
}

const lastCommand = data.lastCommand ?? 'debug';
const lastFiles = data.lastFiles ?? [];

const getCommandLine = (command: string): [string, string[]] => {
  if (platform === 'win32') {
    return [`build\\windows\\${command}.bat`, []];
  }
  if (platform === 'darwin') {
    return ['sh', [`./build/mac/${command}.sh`]]
  }
  return ['sh', [`./build/unix/${command}.sh`]]
}

const runCommand = async (args: [string, string[]]): Promise<void> => {
  console.log(`Running ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const cmd = spawn(args[0], args[1])

    cmd.stdout.on('data', (data) => {
      log(data.toString());
    });

    cmd.stderr.on('data', (data) => {
      log(data.toString());
    });

    cmd.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

const releaseRegex = /SRC\n(\s+[^\n]+\n)+/g;
const debugRegex = /add_executable\(test \$\{SRC}\n(\s+[^\n]+\n)+/g;

const command = process.argv[2];

const readHFilesMd5 = (files: string[]): [string, string][] => {
  return files.map(cFile => {
    const hFile = cFile.replace(/\.c$/, '.h');
    const f = new Array<[string, string]>()
    if (fs.existsSync(hFile)) {
      f.push([hFile, getFileMd5(hFile)])
    }
    return f;
  }).flat();
}

const shouldRebuild = (command: string) => {
  const content = fs.readFileSync('./CMakeLists.txt', 'utf-8');
  const releaseFiles = (content.match(releaseRegex) ?? [])[0]?.split(('\n')).slice(1).map(f => f.trim()).filter(f => f.length > 0) ?? [];
  const debugFiles = (content.match(debugRegex) ?? [])[0]?.split(('\n')).slice(1).map(f => f.trim()).filter(f => f.length > 0).concat(releaseFiles) ?? [];
  let filesMd5: Record<string, string>;
  if (command === 'debug') {
    filesMd5 = Object.fromEntries(readHFilesMd5(debugFiles));
  } else {
    filesMd5 = Object.fromEntries(readHFilesMd5(releaseFiles));
  }
  if (command !== lastCommand) {
    return {
      filesMd5,
      changed: true
    };
  }
  const filesChanged = Object.entries(filesMd5).some((file) => file[1] !== lastFiles[file[0]]);
  return {
    changed: filesChanged,
    filesMd5,
  };
};

(async () => {
  try {
    if (command === 'debug' || command === 'release') {
      const {changed, filesMd5} = shouldRebuild(command);
      if (changed) {
        log('H Files changed, rebuilding...\n');
        await runCommand(getCommandLine('clean'));
        await runCommand(getCommandLine(command));
      } else {
        log('H Files not changed, skip rebuilding.\n');
        await runCommand(getCommandLine(command));
      }
      data.lastFiles = filesMd5;
      data.lastCommand = command;
      fs.writeFileSync('./build-data.json', JSON.stringify(data));
    } else {
      await runCommand(getCommandLine(command));
    }
  } catch (e: any) {
    logError(e.message);
    process.exit(1);
  }
})();
