import { appendFileSync } from "node:fs"
import { prerelease, valid } from "semver"
import { requireEnv } from "./utils.js"

requireEnv("GITHUB_ENV", "GITHUB_OUTPUT")

const raw = process.argv[2] ?? process.env.GITHUB_REF_NAME
if (!raw) throw new Error("Release version is not set")

const version = raw.startsWith("v") ? raw.slice(1) : raw
if (!valid(version)) throw new Error(`Invalid semantic version: ${raw}`)

const distTag = prerelease(version) ? "next" : "latest"
appendFileSync(process.env.GITHUB_ENV, `VERSION=${version}\n`)
appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ndist-tag=${distTag}\n`)
console.log(`Release version ${version} (dist-tag ${distTag})`)
