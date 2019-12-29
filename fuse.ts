import { context, task } from "fuse-box/sparky";
import { FuseBox, JSONPlugin, QuantumPlugin } from "fuse-box";

context(
  class {
    isProduction: boolean;
    getConfig () {
      return FuseBox.init({
        homeDir: "src",
        target: "server@esnext",
        output: "dist/$name.js",
        plugins: [
          JSONPlugin(),
          this.isProduction &&
          QuantumPlugin({
            uglify: true,
            treeshake: true,
            bakeApiIntoBundle: "index",
          }),
        ],
      });
    }
  },
);

task("default", async (ctx: any) => {
  ctx.isProduction = true;
  const fuse = ctx.getConfig();
  fuse.bundle("index").instructions(">index.ts");

  await fuse.run();
});
