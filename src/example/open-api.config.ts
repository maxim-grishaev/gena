import type { nsGenImpl } from '@cgi/openapi/types/nsGenImpl'
import path from 'path'

const rootDir = path.join(__dirname, '../../')

export const skillPlaceAPI: nsGenImpl.GeneratorInput = {
  title: 'SkillAce',
  url: 'https://marathon-app.herokuapp.com/docs/openapi.json',
  outDir: './example/gen/skillplace',
  cwd: rootDir,
  schemaOptions: {
    external: true,
    http: {
      timeout: 60000,
    },
  },
  pathPrefixes: ['/api/v1'],
}

export const ghAPI: nsGenImpl.GeneratorInput = {
  title: 'Github',
  cwd: rootDir,
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
}
