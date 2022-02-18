import { generateFromOpenAPI } from './generateFromOpenAPI'
// import { ghAPI } from './open-api.config'
import { skillPlaceAPI } from './open-api.config'

// generateFromOpenAPI(skillPlaceAPI).then(() => generateFromOpenAPI(ghAPI))
// generateFromOpenAPI(ghAPI)
generateFromOpenAPI(skillPlaceAPI)
