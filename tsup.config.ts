import {defineConfig} from "tsup";
//@ts-expect-error missing types for bestzip
import bestzip from "bestzip";
import config from "./package.json";
import * as fs from "fs"

const outDir = "app"

export default defineConfig({
		entry: ["src/index.ts"],
		minify: true,
		format: ["esm"],
		splitting: false,
		outDir: "app",
		sourcemap: false,
		clean: true,
		platform: "node",
		target: "esnext",
		noExternal: [/(.*)/],
		onSuccess: async () => {
				if (fs.existsSync("./bundle")) {
						fs.rmdirSync("./bundle", {recursive: true});
				}
				fs.mkdirSync("./bundle")

				console.info("Packaging app...");
				const name = `${config.name}-${config.version}.zip`;
				await bestzip({
						source: [`./${outDir}/*`, `./.env.example`],
						destination: `./bundle/${name}`
				});
				console.info(`Done!`)
		}
})
