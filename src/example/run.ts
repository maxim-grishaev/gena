import path from 'path'

import { generateFromOpenAPI } from './generateFromOpenAPI'

const rootDir = path.join(__dirname, '../../')

generateFromOpenAPI({
  title: 'Github',
  cwd: rootDir,
  // filePath: './example/api.github.com.json',
  // filePath: './src/example/api.github.com.json',
  url: 'https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json',
  outDir: './example/gen/github',
  schemaOptions: {
    external: false,
    file: false,
    http: false,
  },
  aliases: {
    //
  },
})
