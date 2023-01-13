'use strict'

const path = require('path')
const fs = require('fs')
const util = require('util')

console.log('Starting post build [ngx-version-check]\n')

process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`)
})

let project = process.argv[2]

console.log(`\nProject: ${project}`)

if (!project) {
    console.log('Project name parameter is undefined. Using the /dist folder')
}


let outputDirectory = project ? `../../../dist/${project}/` : `../../../dist/`
let basePath = path.join(__dirname, outputDirectory)

console.log(`Base Path: ${basePath}`)


// our version.json will be in the dist folder
const versionFilePath = `${basePath}version.json`

// Get application version from package.json
const versionDateFromFile = require(versionFilePath).date

// Promisify core API's
const readDir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)

console.log('\nRunning post-build tasks [ngx-version-check]')

console.log(`Version File Path: ${basePath}`)

let mainHash = ''
let mainBundleFile = ''

// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main.?([a-z0-9]*)?.js$/

// Update version date with the current date of the build
let now = new Date()
let year = String(now.getFullYear())
let month = String(now.getMonth() + 1).padStart(2, '0')
let day = String(now.getDate()).padStart(2, '0')

// Check if this is a new version from the same day
let versionParts = versionDateFromFile.split('.')
let revision = ''

if (versionParts.length > 3) {
    revision = `.${parseInt(versionParts[3]) + 1}`
}

let appVersionDate = `${year}.${month}.${day}${revision}`

if (versionDateFromFile === appVersionDate) {
    appVersionDate = appVersionDate.concat('.1')
}

// read the dist folder files and find the one we're looking for
readDir(`${basePath}`)
    .then(files => {
        mainBundleFile = files.find(f => mainBundleRegexp.test(f))

        if (mainBundleFile) {
            console.log('Main Bundle: ', mainBundleFile)

            let matchHash = mainBundleFile.match(mainBundleRegexp)

            // if it has a hash in it's name, mark it down
            if (matchHash.length > 1 && !!matchHash[1]) {
                mainHash = matchHash[1]
            }
        }

        console.log(`Writing version and hash to ${versionFilePath}`)

        // Write current version and hash into the version.json file
        const src = `{"date": "${appVersionDate}", "hash": "${mainHash}"}`

        return writeFile(versionFilePath, src)
    })
    .then(() => {
        // main bundle file not found, dev build?
        if (!mainBundleFile) {
        console.log('Main bundle not found, exiting...')
        return
        }

        // Write the hash and version to the main.js file if it is present
        if (mainBundleFile) {
        console.log(`Replacing hash in the ${mainBundleFile}`)

        }

        console.log('End post build [ngx-version-check]\n')
        return
    })
    .catch(err => {
        console.log('Error with post build:', err)
    })
