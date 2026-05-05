import { spawn, spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AppInfo, ScriptOption } from "../types.js";

interface RunHooks {
	onStatus?: (status: string) => void;
	onPid?: (pid: number) => void;
	onFinish?: (success: boolean, message: string) => void;
}

export interface BackgroundRunHandle {
	stop: () => void;
}

const MONITOR_INTERVAL_MS = 1200;

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

function escapePowerShellSingleQuoted(value: string): string {
	return value.replace(/'/g, "''");
}

function sanitizeWindowTitle(value: string): string {
	return value.replace(/[&|<>^]/g, " ").trim();
}

function isProcessAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		if (error instanceof Error && "code" in error) {
			const code = (error as NodeJS.ErrnoException).code;
			return code === "EPERM";
		}
		return false;
	}
}

function buildCommandForOption(app: AppInfo, option: ScriptOption): string {
	if (option.type === "script") {
		return `npm run "${option.id}"`;
	}

	if (shouldBuild(app)) {
		return 'npm run "build" && npm run "dev"';
	}

	return 'npm run "dev"';
}

function launchInNewCmdTerminal(app: AppInfo, option: ScriptOption): number {
	if (process.platform !== "win32") {
		throw new Error(
			"Abertura de terminal externo implementada apenas para Windows.",
		);
	}

	const scriptCommand = buildCommandForOption(app, option);
	const windowTitle = sanitizeWindowTitle(
		`IFSC Launcher | ${app.name} | ${option.label}`,
	);
	const cmdLine = `title ${windowTitle} && ${scriptCommand}`;

	const psScript = [
		`$p = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/k', '${escapePowerShellSingleQuoted(cmdLine)}') -WorkingDirectory '${escapePowerShellSingleQuoted(app.path)}' -PassThru`,
		"Write-Output $p.Id",
	].join("; ");

	const result = spawnSync("powershell", ["-NoProfile", "-Command", psScript], {
		encoding: "utf-8",
	});

	if (result.status !== 0) {
		const stderr = result.stderr?.trim() ?? "";
		throw new Error(
			stderr
				? `Falha ao abrir terminal: ${stderr}`
				: "Falha ao abrir terminal.",
		);
	}

	const rawPid = (result.stdout ?? "").trim();
	const pid = Number.parseInt(rawPid, 10);
	if (!Number.isInteger(pid) || pid <= 0) {
		throw new Error(
			`Nao foi possivel obter PID do terminal. Saida: '${rawPid || "<vazio>"}'`,
		);
	}

	return pid;
}

function stopProcessTree(pid: number): void {
	const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
		stdio: "ignore",
		shell: false,
	});
	killer.unref();
}

export function executeScriptOptionInBackground(
	app: AppInfo,
	option: ScriptOption,
	hooks: RunHooks = {},
): BackgroundRunHandle {
	let pid: number | null = null;
	let finished = false;
	let stopRequested = false;
	let monitorTimer: NodeJS.Timeout | null = null;

	const finish = (success: boolean, message: string): void => {
		if (finished) {
			return;
		}
		finished = true;
		if (monitorTimer) {
			clearInterval(monitorTimer);
			monitorTimer = null;
		}
		hooks.onStatus?.(message);
		hooks.onFinish?.(success, message);
	};

	try {
		hooks.onStatus?.(
			`Abrindo novo terminal para ${app.name} -> ${option.label}...`,
		);
		pid = launchInNewCmdTerminal(app, option);
		hooks.onPid?.(pid);
		hooks.onStatus?.(`Terminal aberto (PID ${pid}).`);

		monitorTimer = setInterval(() => {
			if (!pid || finished) {
				return;
			}

			if (!isProcessAlive(pid)) {
				if (stopRequested) {
					finish(true, "Terminal encerrado pelo launcher.");
					return;
				}
				finish(true, "Terminal foi fechado.");
			}
		}, MONITOR_INTERVAL_MS);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Falha ao iniciar execucao.";
		finish(false, message);
	}

	return {
		stop: () => {
			if (finished || !pid) {
				return;
			}
			stopRequested = true;
			hooks.onStatus?.(`Encerrando terminal (PID ${pid})...`);
			stopProcessTree(pid);
		},
	};
}
