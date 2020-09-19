// Dysomni Node server for interfacing with DYMO printer software using macOS AppleScripts

//*    _       _ _
//*   (_)_ __ (_) |_
//*   | | '_ \| | __|
//*   | | | | | | |_
//*   |_|_| |_|_|\__|

const express = require('express');
const app     = express();
const PORT    = 3000;
const fs      = require('fs').promises;
const chalk   = require('chalk');
const exec    = require('child_process').exec;
const { v4: uuidv4 } = require('uuid');

// change if you need to pass in larger images.
app.use(express.json({limit: '30mb', extended: true}));

const safeRegex = (input) => {
  return input
          .replace(/[^a-zA-Z0-9\-_\s]/g,'')
          .replace(/\s/g, '_');
}

const IMAGE_PATH  = `${__dirname}/temp_images/`
const SCRIPT_PATH = `${__dirname}/apple_scripts/`
const LABEL_PATH  = `${__dirname}/labels/`

// how many seconds until received images are deleted
const DELETE_FILES_AFTER = 50000;

const noColor = (val) => {
  return val;
}

const logger = (text, colorizer = noColor) => {
  console.log(`${(new Date).toISOString()} -- ${colorizer(text)}`)
}

//*                    _
//*    _ __ ___  _   _| |_ ___  ___
//*   | '__/ _ \| | | | __/ _ \/ __|
//*   | | | (_) | |_| | ||  __/\__ \
//*   |_|  \___/ \__,_|\__\___||___/

app.post('/', (req, res) => {
  newRequest(req, '1x1_qr').then(() => {
    res.status(200).send(`Printing your QR label.`);
  });
});

app.post('/picture', (req, res) => {
  newRequest(req, '1x1_image').then(() => {
    res.status(200).send(`Printing your picture label.`);
  });
});

app.listen(PORT, () => {
  logger('');
  logger('DYSOMNI + DYMO server starting now. 🏁', chalk.redBright);
  logger(`Server is 🎧 on port ${PORT}`, chalk.red);
});

//*    _               _
//*   | |__   ___   __| |_   _
//*   | '_ \ / _ \ / _` | | | |
//*   | |_) | (_) | (_| | |_| |
//*   |_.__/ \___/ \__,_|\__, |
//*                      |___/

const newRequest = async (req, scriptName) => {
  logReq(req);
  const params   = sanitizeParams(req.body);
  const filename = await createFile(params);
  await runOsaScript(params, filename, scriptName);
  setTimeout(() => unlink(filename), DELETE_FILES_AFTER);
}

const sanitizeParams = (body) => {
  const params = {};
  body.image && (params.image = body.image);
  body.id    && (params.id    = safeRegex(body.id));
  body.label && (params.label = safeRegex(body.label));
  return params;
}

const logReq = (req) => {
  logger(`New Request!! 👀`, chalk.blue);
  logger('Incoming params:', chalk.magentaBright);
  const MAX = 100;
  for (const key in req.body) {
    const val = req.body[key];
    val && logger(`${key}: ${val.slice(0, MAX)}${val.length > MAX ? ' ...' : ''}`, chalk.magenta);
  }
}

const createFile = async (params) => {
  const filename = `${uuidv4()}.png`;
  const path     = `${IMAGE_PATH}${filename}`;

  await fs.writeFile(path, params.image, 'base64');
  logger(`File created: ${path}`, chalk.greenBright);
  return filename;
}

const unlink = async (filename) => {
  const path = `${IMAGE_PATH}${filename}`;

  await fs.unlink(path);
  logger(`File deleted: ${path}`, chalk.green);
}

const argIfExists = (arg) => ( arg ? arg + ' ' : '' )

const runOsaScript = async (params, filename, scriptName) => {
  const script_path = `${SCRIPT_PATH}${scriptName}.applescript `;
  const label_path  = `${LABEL_PATH}${scriptName}.label `;
  const img_path    = `${IMAGE_PATH}${filename} `;
  const id          = `${argIfExists(params.id)}`;
  const label       = `${argIfExists(params.label)}`;

  exec(`osascript ${script_path}${label_path}${img_path}${id}${label}`, (error,stdout,stderr) => {
    stdout && logger(`STDOut: ${stdout.replace(`\n`, '')}`, chalk.cyan);
    error  && logger(`STDErr: ${stderr}`, chalk.red);
  });
}