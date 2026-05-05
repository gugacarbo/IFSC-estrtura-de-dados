import { spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AppInfo, ScriptOption } from "../types.js";

type LogStream = "stdout" | "stderr" | "system";

interface RunHooks {
	onStatus?: (status: string) => void;
	onLine?: (line: string, stream: LogStream) => void;
	onPid?: (pid: number) => void;
	onFinish?: (success: boolean, message: string) => void;
}

export interface BackgroundRunHandle {
	stop: () => void;
}

function getLatestMtime(filePaths: string[]): number {
	let latest = 0;
	for (const filePath of filePaths) {
		const mtime = statSync(filePath).mtimeMs;
		if (mtime > latest) {
			latest = mtime;
		}
	}
	return latest;
}

function listJavaFiles(dir: string): string[] {
	const stack = [dir];
	const javaFiles: string[] = [];

	while (stack.length > 0) {
		const current = stack.pop();
		if (!current) {
			continue;
		}

		const entries = readdirSync(current, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(current, entry.name);
			if (entry.isDirectory()) {
				if (
					entry.name === "node_modules" ||
					entry.name === "target" ||
					entry.name === ".turbo"
				) {
					continue;
				}
				stack.push(fullPath);
				continue;
			}

			if (entry.isFile() && entry.name.endsWith(".java")) {
				javaFiles.push(fullPath);
			}
		}
	}

	return javaFiles;
}

function listClassFiles(dir: string): string[] {
	const stack = [dir];
	const classFiles: string[] = [];

	while (stack.length > 0) {
		const current = stack.pop();
		if (!current) {
			continue;
		}

		const entries = readdirSync(current, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = join(current, entry.name);
			if (entry.isDirectory()) {
				if (
					entry.name === "node_modules" ||
					entry.name === "target" ||
					entry.name === ".turbo"
				) {
					continue;
				}
				stack.push(fullPath);
				continue;
			}

			if (entry.isFile() && entry.name.endsWith(".class")) {
				classFiles.push(fullPath);
			}
		}
	}

	return classFiles;
}

function shouldBuild(app: AppInfo): boolean {
	const javaFiles = listJavaFiles(app.path);
	if (javaFiles.length === 0) {
		return false;
	}

	const classFiles = listClassFiles(app.path);
	if (classFiles.length === 0) {
		return true;
	}

	const latestJava = getLatestMtime(javaFiles);
	const latestClass = getLatestMtime(classFiles);
	return latestClass < latestJava;
}

function emitLines(
	chunk: string,
	stream: LogStream,
	emit: (line: string, kind: LogStream) => void,
	bufferRef: { value: string },
): void {
	bufferRef.value += chunk;
	const lines = bufferRef.value.split(/\r?\n/);
	bufferRef.value = lines.pop() ?? "";

	for (const line of lines) {
		if (line.length > 0) {
			emit(line, stream);
		}
	}
}

function runNpmScript(
	app: AppInfo,
	script: string,
	hooks: RunHooks,
	isStopped: () => boolean,
	setCurrentStop: (stop: () => void) => void,
): Promise<number> {
	return new Promise((resolve, reject) => {
		const child = spawn("npm", ["run", script], {
			cwd: app.path,
			shell: true,
			stdio: ["ignore", "pipe", "pipe"],
		});

		if (!child.stdout || !child.stderr) {
			reject(new Error(`Falha ao capturar logs do script '${script}'.`));
			return;
		}

		if (child.pid) {
			hooks.onPid?.(child.pid);
		}

		setCurrentStop(() => {
			if (!child.killed) {
				child.kill();
			}
		});

		const stdoutBuffer = { value: "" };
		const stderrBuffer = { value: "" };

		child.stdout.on("data", (data) => {
			emitLines(
				String(data),
				"stdout",
				(line, kind) => hooks.onLine?.(line, kind),
				stdoutBuffer,
			);
		});

		child.stderr.on("data", (data) => {
			emitLines(
				String(data),
				"stderr",
				(line, kind) => hooks.onLine?.(line, kind),
				stderrBuffer,
			);
		});

		child.on("error", (error) => {
			reject(error);
		});

		child.on("close", (code) => {
			if (stdoutBuffer.value.length > 0) {
				hooks.onLine?.(stdoutBuffer.value, "stdout");
			}
			if (stderrBuffer.value.length > 0) {
				hooks.onLine?.(stderrBuffer.value, "stderr");
			}

			if (isStopped()) {
				resolve(0);
				return;
			}

			resolve(code ?? 1);
		});
	});
}

async function runStartScript(
	app: AppInfo,
	hooks: RunHooks,
	isStopped: () => boolean,
	setCurrentStop: (stop: () => void) => void,
): Promise<number> {
	if (shouldBuild(app)) {
		hooks.onStatus?.(`Build necessario para ${app.name}...`);
		const buildCode = await runNpmScript(
			app,
			"build",
			hooks,
			isStopped,
			setCurrentStop,
		);
		if (buildCode !== 0 || isStopped()) {
			return buildCode;
		}
	}

	hooks.onStatus?.(`Executando ${app.name} -> dev em background...`);
	return runNpmScript(app, "dev", hooks, isStopped, setCurrentStop);
}

export function executeScriptOptionInBackground(
	app: AppInfo,
	option: ScriptOption,
	hooks: RunHooks = {},
): BackgroundRunHandle {
	let stopped = false;
	let stopCurrent = () => {};

	void (async () => {
		try {
			const exitCode =
				option.type === "script"
					? await runNpmScript(
							app,
							option.id,
							hooks,
							() => stopped,
							(stop) => {
								stopCurrent = stop;
							},
						)
					: await runStartScript(
							app,
							hooks,
							() => stopped,
							(stop) => {
								stopCurrent = stop;
							},
						);

			if (stopped) {
				hooks.onStatus?.("Processo encerrado pelo usuario.");
				hooks.onFinish?.(false, "Processo encerrado pelo usuario.");
				return;
			}

			if (exitCode === 0) {
				hooks.onStatus?.("Execucao concluida.");
				hooks.onFinish?.(true, "Execucao concluida.");
				return;
			}

			const message = `Script '${option.id}' falhou para ${app.name} (codigo ${exitCode}).`;
			hooks.onStatus?.(message);
			hooks.onFinish?.(false, message);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Falha ao executar script.";
			hooks.onStatus?.(message);
			hooks.onFinish?.(false, message);
		}
	})();

	return {
		stop: () => {
			stopped = true;
			hooks.onStatus?.("Solicitando encerramento do processo...");
			stopCurrent();
		},
	};
}
