import readline from "node:readline";
import { render } from "ink";
import { getApps, getRepoRoot } from "./data/apps.js";
import { LauncherApp } from "./ui/LauncherApp.js";

function main(): void {
	const repoRoot = getRepoRoot();
	const apps = getApps(repoRoot);
	render(<LauncherApp apps={apps} />);
}

function waitForEnterOnFatalError(): Promise<void> {
	return new Promise((resolve) => {
		if (!process.stdin.isTTY) {
			resolve();
			return;
		}

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question("\nPressione Enter para fechar...", () => {
			rl.close();
			resolve();
		});
	});
}

async function bootstrap(): Promise<void> {
	try {
		main();
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Erro desconhecido.";
		console.error(`\nFalha ao iniciar o launcher: ${message}`);
		await waitForEnterOnFatalError();
		process.exit(1);
	}
}

void bootstrap();
