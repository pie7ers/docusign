import { doesTheFileExist, writeFile } from './filesControl'
import path from 'path'
import pc from 'picocolors'
const ENV_PATH = path.join(__dirname, '../.env')

const ENV = `# Before configure this is recommended to read the README.md file
DS_URL_D="https://account-d.docusign.com"
DS_URL_DEMO="https://demo.docusign.net"
#ACCOUNT INFORMATION
DS_API_ACCOUNT_ID=
#FROM THE APP
DS_INTEGRATION_KEY=
#DS_BASIC_AUTH is the base64 of Integration-Key:Secret Key
DS_BASIC_AUTH=
DS_REFRESH_TOKEN=
`

if (!doesTheFileExist(ENV_PATH)) {
  writeFile(ENV_PATH, ENV)
  console.log(pc.green(`.env created`))
}
else console.log(pc.yellow(`.env already exits`))
