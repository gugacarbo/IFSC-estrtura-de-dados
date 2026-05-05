import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { matchesKey, ProcessTerminal, Text, TUI } from "@mariozechner/pi-tui";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..", "..");

interface AppInfo {
	name: string;
	path: string;
	description: string;
	scripts: string[];
}

function getApps(): AppInfo[] {
	const appsDir = join(rootDir, "apps");
	const entries = readdirSync(appsDir, { withFileTypes: true });

	return entries
		.filter((e) => e.isDirectory() && e.name !== "tui-launcher")
		.map((e) => {
			const pkgPath = join(appsDir, e.name, "package.json");
			try {
				const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
				return {
					name: e.name,
					path: join(appsDir, e.name),
					description: pkg.description || "No description",
					scripts: Object.keys(pkg.scripts || {}),
				};
			} catch {
				return null;
			}
		})
		.filter((app): app is AppInfo => app !== null);
}

function main() {
	const apps = getApps();

	if (apps.length === 0) {
		console.log("No apps found in apps/ directory.");
		process.exit(0);
	}

	const terminal = new ProcessTerminal();
	const tui = new TUI(terminal);

	let selectedIndex = 0;

	function renderList(): string[] {
		const lines = apps.map((app, i) => {
			const prefix = i === selectedIndex ? "> " : "  ";
			const suffix = i === selectedIndex ? " <" : "";
			return `${prefix}${app.name}${suffix}`;
		});
		return lines;
	}

	const header = new Text("=== IFSC Estrutura de Dados - App Launcher ===");
	const info = new Text(
		`Found ${apps.length} app(s). Use arrow keys, Enter to run, Ctrl+C to exit.`,
	);

	let listText = new Text(renderList().join("\n"));

	function updateList() {
		listText = new Text(renderList().join("\n"));
		tui.requestRender();
	}

	tui.addChild(header);
	tui.addChild(info);
	tui.addChild(listText);

	tui.addInputListener((data) => {
		if (matchesKey(data, "up")) {
			selectedIndex = Math.max(0, selectedIndex - 1);
			updateList();
			return { consume: true };
		}
		if (matchesKey(data, "down")) {
			selectedIndex = Math.min(apps.length - 1, selectedIndex + 1);
			updateList();
			return { consume: true };
		}
		if (matchesKey(data, "enter")) {
			const app = apps[selectedIndex];
			tui.stop();
			runApp(app);
			return { consume: true };
		}
		if (matchesKey(data, "ctrl+c")) {
			tui.stop();
			process.exit(0);
		}
		return undefined;
	});

	tui.start();
}

async function runApp(app: AppInfo) {
	const { spawn } = await import("child_process");

	console.clear();
	console.log(`Starting ${app.name}...\n`);

	const child = spawn("npx", ["turbo", "run", "dev", `--filter=${app.name}`], {
		cwd: rootDir,
		stdio: "inherit",
		shell: true,
	});

	child.on("exit", (code) => {
		console.log(`\n${app.name} exited with code ${code}`);
		process.exit(code || 0);
	});
}

main();
