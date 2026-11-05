import { spawnSync } from "node:child_process"
import { appendFileSync } from "node:fs"
import { requireEnv, run } from "./utils.js"

requireEnv("GITHUB_OUTPUT", "VERSION")

run(["npm", "pkg", "set", `version=${process.env.VERSION}`], { cwd: process.env.PACKAGE_DIR ?? "." })
run(["bun", "install"])

const changed =
  spawnSync("git", ["diff", "--quiet", "--", `${process.env.PACKAGE_DIR ?? "."}/package.json`, "bun.lock"]).status !== 0
if (changed) appendFileSync(process.env.GITHUB_OUTPUT, "changed=true\n")
console.log(
  changed ? `Package version synced to ${process.env.VERSION}.` : `Package version already ${process.env.VERSION}.`,
)
