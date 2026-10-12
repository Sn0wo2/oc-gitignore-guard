import fs from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import git from "isomorphic-git";
import { Plugin } from "@opencode/plugin";

export default Plugin.define({
  id: "oc-gitignore-guard",
  setup: async (ctx) => {
    const registration = await ctx.permission.hook(
      "evaluate",
      async (event) => {
        if (event.action !== "read" && event.action !== "edit") return;

        for (const resource of event.resources) {
          const absolute = isAbsolute(resource)
            ? resource
            : resolve(ctx.location.directory, resource);

          try {
            const root = await git.findRoot({
              fs,
              filepath: dirname(absolute),
            });
            if (
              await git.isIgnored({
                fs,
                dir: root,
                filepath: relative(root, absolute).split(sep).join("/"),
              })
            ) {
              event.effect = "ask";
              event.message = `Ignored by .gitignore, approval required: ${resource}`;
              return;
            }
          } catch {}
        }
      },
    );

    return () => registration.dispose();
  },
});
