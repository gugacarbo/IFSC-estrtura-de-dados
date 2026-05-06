export default {
	"*.{ts,tsx,js,jsx,json}": "biome check --write",
	"*.md": "prettier --write",
	"apps/**/src/**/*.java": [
		"turbo run lint --filter=tr1-playlist",
		(files) =>
			`java -jar tools/java/checkstyle-10.20.0-all.jar -c tools/java/checkstyle.xml ${files.join(" ")}`,
	],
};
