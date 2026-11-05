import { appendFileSync } from "node:fs"
import { requireEnv, run } from "./utils.js"

requireEnv("GITHUB_REPOSITORY", "GH_TOKEN", "GITHUB_OUTPUT")

const [owner, name] = process.env.GITHUB_REPOSITORY.split("/")
if (!(owner && name)) throw new Error("GITHUB_REPOSITORY must be in owner/name format")

const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME
if (!tag) throw new Error("Release tag is not set")

const query = `query($owner: String!, $name: String!, $tag: String!) { repository(owner: $owner, name: $name) { release(tagName: $tag) { isDraft } } }`
const release = JSON.parse(
  run([
    "gh",
    "api",
    "graphql",
    "-f",
    `query=${query}`,
    "-f",
    `owner=${owner}`,
    "-f",
    `name=${name}`,
    "-f",
    `tag=${tag}`,
  ]),
).data?.repository?.release
if (release === undefined) throw new Error("Invalid release lookup response")

const skip = release !== null && !release.isDraft
appendFileSync(process.env.GITHUB_OUTPUT, `skip=${skip}\n`)
console.log(skip ? `Release ${tag} is already published; skipping.` : `Release ${tag} is not published; continuing.`)
