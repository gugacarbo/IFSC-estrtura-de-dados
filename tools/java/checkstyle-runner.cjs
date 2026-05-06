const cp = require("node:child_process");
const path = require("node:path");

const jarName = `checkstyle.jar`;
const jarPath = path.resolve(__dirname, jarName);
const cfgPath = path.resolve(__dirname, "checkstyle.xml");

const files = process.argv.slice(2);
if (files.length === 0) {
	console.error("Usage: node checkstyle-runner.js <file1> <file2> ...");
	process.exit(1);
}

const cmd = `java -jar "${jarPath}" -c "${cfgPath}" ${files.map((f) => `"${f}"`).join(" ")}`;

console.log(`Running ${cmd}`);

try {
	cp.execSync(cmd, { stdio: "inherit" });
} catch (e) {
	process.exit(e.status || 1);
}
