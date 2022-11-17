import {chromium} from 'playwright'
import notifier from 'node-notifier'
import cron from 'node-cron'
import chalk from 'chalk'
import open from 'open'
import nodemailer from 'nodemailer'

// --ARGS
let emailValues = [null, null, null, null]
let emailArgs = [false, false, false, false]
let seconds = 30
let sendEmail = false
let forceOpenPath = false
let transporter

// -- HELP
const printHelp = () => {
    console.log("Argumentos:")
    console.log("*  --host <host>          (SMTP host para el envio de emails)")
    console.log("*  --port <port>          (SMTP port para el envio de emails)")
    console.log("*  --username <username>  (SMTP username para el envio de emails)")
    console.log("*  --password <password>  (SMTP password para el envio de emails)")
    console.log("*  --force                (Si se desea forzar que se abra una pestaña del browser cuando se encuentre stock)")
    console.log("*  --seconds <seconds>    (Segundos esperados hasta volver a revisar el stock nuevamente)")
    process.exit(1)
}

const setForceEmail = () => {
    forceOpenPath = true
}

const sendEmailConfigCheck = (pos, value) => {
    emailArgs[pos] = true
    emailValues[pos] = value
    sendEmail = emailArgs[0] && emailArgs[1] && emailArgs[2] && emailArgs[3] && emailArgs[4]
}

const setSeconds = (value) => {
    seconds = value
}

let argsDefinitions = [
    {value: false, command: '--help', action: () => printHelp()},
    {value: false, command: '--force', action: () => setForceEmail()},
    {value: true, command: '--host', action: (value) => sendEmailConfigCheck(0, value)},
    {value: true, command: '--port', action: (value) => sendEmailConfigCheck(1, value)},
    {value: true, command: '--username', action: (value) => sendEmailConfigCheck(2, value)},
    {value: true, command: '--password', action: (value) => sendEmailConfigCheck(3, value)},
    {value: true, command: '--sendto', action: (value) => sendEmailConfigCheck(4, value)},
    {value: true, command: '--seconds', action: (value) => setSeconds(value)}
]

let argsMap = {}
argsDefinitions.forEach((value) => {
    argsMap[value.command] = value
})

// EVAL ARGS
let args = process.argv.slice(2)

const evalArgs = () => {
    for (let i = 0; i < args.length; i++) {
        const argDef = argsMap[args[i]]
        if (argDef) {
            if (argDef.value) {
                const value = args[i + 1]
                if (argsMap[value] === null || argsMap[value] === undefined)
                    argDef.action(value)
            } else {
                argDef.action()
            }
        }
    }
}

const configEmailService = async () => {
    if (sendEmail) {
        transporter = nodemailer.createTransport({
            host: `${emailValues[0]}`,
            port: `${emailValues[1]}`,
            secure: false,
            auth: {
                user: `${emailValues[2]}`,
                pass: `${emailValues[3]}`
            }
        })
    }
}

evalArgs()
await configEmailService()

// --NOTIFY BY OS
const notifyByOS = async (path) => {
    notifier.notify({
        title: 'HAY FIGURITAS!!',
        message: `${path}`,
        sound: true,
        wait: true
    });
    if (forceOpenPath) {
        await open(path)
    }
}

// --NOTIFY BY MAIL
const notifyByEmail = async (path) => {
    if (sendEmail) {
        let info = await transporter.sendMail({
            from: `${emailValues[2]}`,
            to: `${emailValues[4]}`,
            subject: "HAY FIGURITAS!!",
            text: `${path}`
        })
        console.log("Message sent: %s", info.messageId);
    }
}
// --SEARCH
console.log("==== BUSCANDO FIGUS ====")
console.log(chalk.blue(`Forzar abrir pagina al encontrar stock: ${chalk.white(forceOpenPath)}`))
console.log(chalk.blue(`Envio via mail: ${chalk.white(sendEmail)}`))
if (sendEmail) {
    console.log(chalk.blue(`Direccion de email configurada: ${chalk.white(emailValues[2])}`))
}
console.log(chalk.blue(`Chequeando cada ${chalk.white(seconds)} segundos`))
const browser = await chromium.launch()
cron.schedule(`*/${seconds} * * * * *`, async () => {
    console.log(chalk.yellow(`Running on: ${new Date().toLocaleString('es-AR', {timeZone: 'America/Buenos_Aires'})}`))
    const page = await browser.newPage()
    const path = 'https://www.zonakids.com/productos/pack-x-25-sobres-de-figuritas-fifa-world-cup-qatar-2022/'
    await page.goto(path)

    const meta = page.locator('meta[property="tiendanube:stock"]')
    const content = await meta.getAttribute("content")

    if (content === '0') {
        console.log(chalk.red.inverse('SIN STOCK'))
    } else {
        console.log(chalk.green.inverse(`HAY FIGURITAS!! ==> ${path}`))
        await notifyByOS(path)
        await notifyByEmail(path)
    }

    await page.close()
})