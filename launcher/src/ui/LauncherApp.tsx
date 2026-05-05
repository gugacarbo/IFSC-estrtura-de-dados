import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Box, Spacer, Text, useInput, useStdin } from "ink";
import { useMemo, useRef, useState } from "react";
import { getScriptOptions } from "../data/apps.js";
import {
	executeScriptOptionInBackground,
	type BackgroundRunHandle,
} from "../services/runner.js";
import type { AppInfo, ScriptOption } from "../types.js";

interface LauncherAppProps {
	apps: AppInfo[];
}

type Screen = "apps" | "scripts" | "docs" | "run";
type LogStream = "stdout" | "stderr" | "system";

interface LogLine {
	stream: LogStream;
	text: string;
}

interface RunViewState {
	appName: string;
	scriptLabel: string;
	pid: number | null;
	isRunning: boolean;
	status: string;
	logs: LogLine[];
}

const MAX_LOG_LINES = 220;
const MAX_VISIBLE_LOG_LINES = 18;

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function readAppDocs(app: AppInfo): string {
	const readmePath = join(app.path, "README.md");
	if (!existsSync(readmePath)) {
		return "README.md nao encontrado para este app.";
	}

	try {
		return readFileSync(readmePath, "utf-8");
	} catch {
		return "Nao foi possivel ler o README.md deste app.";
	}
}

function appendLog(logs: LogLine[], entry: LogLine): LogLine[] {
	const next = [...logs, entry];
	if (next.length <= MAX_LOG_LINES) {
		return next;
	}

	return next.slice(next.length - MAX_LOG_LINES);
}

export function LauncherApp({ apps }: LauncherAppProps) {
	const { isRawModeSupported } = useStdin();
	const [screen, setScreen] = useState<Screen>("apps");
	const [previousScreen, setPreviousScreen] = useState<Screen>("apps");
	const [selectedAppIndex, setSelectedAppIndex] = useState(0);
	const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
	const [statusMessage, setStatusMessage] = useState("");
	const [docsContent, setDocsContent] = useState("");
	const [runView, setRunView] = useState<RunViewState | null>(null);
	const runningHandleRef = useRef<BackgroundRunHandle | null>(null);
	const selectedApp = apps[selectedAppIndex];
	const scriptOptions = useMemo<ScriptOption[]>(() => {
		if (!selectedApp) {
			return [];
		}
		return getScriptOptions(selectedApp);
	}, [selectedApp]);

	function openDocs(from: Screen): void {
		if (!selectedApp) {
			return;
		}

		setPreviousScreen(from);
		setDocsContent(readAppDocs(selectedApp));
		setScreen("docs");
	}

	function startBackgroundRun(app: AppInfo, option: ScriptOption): void {
		setScreen("run");
		setRunView({
			appName: app.name,
			scriptLabel: option.label,
			pid: null,
			isRunning: true,
			status: `Iniciando ${app.name} -> ${option.label}...`,
			logs: [],
		});
		setStatusMessage("");

		runningHandleRef.current = executeScriptOptionInBackground(app, option, {
			onStatus: (status) => {
				setRunView((prev) => (prev ? { ...prev, status } : prev));
			},
			onPid: (pid) => {
				setRunView((prev) => (prev ? { ...prev, pid } : prev));
			},
			onLine: (line, stream) => {
				setRunView((prev) =>
					prev
						? {
								...prev,
								logs: appendLog(prev.logs, { stream, text: line }),
							}
						: prev,
				);
			},
			onFinish: (success, message) => {
				runningHandleRef.current = null;
				setRunView((prev) =>
					prev
						? {
								...prev,
								isRunning: false,
								status: message,
								logs: appendLog(prev.logs, {
									stream: success ? "system" : "stderr",
									text: success
										? "Processo finalizado com sucesso."
										: "Processo finalizado com erro.",
								}),
							}
						: prev,
				);
			},
		});
	}

	useInput(
		(input, key) => {
			if (input === "q" || (key.ctrl && input === "c")) {
				runningHandleRef.current?.stop();
				process.exit(0);
			}

			if (screen === "docs") {
				if (key.escape || input === "d") {
					setScreen(previousScreen);
				}
				return;
			}

			if (screen === "run") {
				if (input === "k" && runView?.isRunning) {
					runningHandleRef.current?.stop();
					return;
				}
				if ((key.escape || input === "b") && !runView?.isRunning) {
					setScreen("scripts");
					return;
				}
				if (input === "c" && !runView?.isRunning) {
					setRunView((prev) => (prev ? { ...prev, logs: [] } : prev));
				}
				return;
			}

			if (screen === "apps") {
				if (input === "d") {
					openDocs("apps");
					return;
				}
				if (key.upArrow) {
					setSelectedAppIndex((prev) => clamp(prev - 1, 0, apps.length - 1));
					return;
				}
				if (key.downArrow) {
					setSelectedAppIndex((prev) => clamp(prev + 1, 0, apps.length - 1));
					return;
				}
				if (key.return && selectedApp) {
					setSelectedScriptIndex(0);
					setScreen("scripts");
				}
				return;
			}

			if (screen === "scripts") {
				if (input === "d") {
					openDocs("scripts");
					return;
				}
				if (key.escape) {
					setScreen("apps");
					return;
				}
				if (key.upArrow) {
					setSelectedScriptIndex((prev) =>
						clamp(prev - 1, 0, scriptOptions.length - 1),
					);
					return;
				}
				if (key.downArrow) {
					setSelectedScriptIndex((prev) =>
						clamp(prev + 1, 0, scriptOptions.length - 1),
					);
					return;
				}
				if (key.return && selectedApp) {
					const option = scriptOptions[selectedScriptIndex];
					if (option) {
						startBackgroundRun(selectedApp, option);
					}
				}
			}
		},
		{ isActive: isRawModeSupported },
	);

	if (apps.length === 0) {
		return <Text>Nenhum app encontrado em apps/.</Text>;
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="cyan">
				IFSC Estrutura de Dados - Launcher
			</Text>
			<Spacer />
			{screen === "apps" ? (
				<>
					<Text dimColor>
						Selecione um app (Enter), d para docs, q para sair.
					</Text>
					<Box marginTop={1} flexDirection="column">
						{apps.map((app, index) => (
							<Text
								key={app.name}
								color={index === selectedAppIndex ? "green" : undefined}
							>
								{index === selectedAppIndex ? "> " : "  "}
								{app.name}
							</Text>
						))}
					</Box>
					<Spacer />
					<Text dimColor>{selectedApp?.description ?? "Sem descricao"}</Text>
				</>
			) : screen === "scripts" ? (
				<>
					<Text dimColor>
						{selectedApp.name}: selecione um script (Enter), d para docs, Esc
						para voltar.
					</Text>
					<Box marginTop={1} flexDirection="column">
						{scriptOptions.map((option, index) => (
							<Text
								key={option.id}
								color={index === selectedScriptIndex ? "green" : undefined}
							>
								{index === selectedScriptIndex ? "> " : "  "}
								{option.label}
							</Text>
						))}
					</Box>
				</>
			) : screen === "run" && runView ? (
				<>
					<Text dimColor>
						Executando em background: {runView.appName}
						{" -> "}
						{runView.scriptLabel}
					</Text>
					<Text dimColor>
						{runView.isRunning
							? "k para encerrar processo."
							: "Esc ou b para voltar, c para limpar logs."}
					</Text>
					<Text color="cyan">
						{runView.status}
						{runView.pid ? ` (pid ${runView.pid})` : ""}
					</Text>
					<Box marginTop={1} flexDirection="column">
						{runView.logs.slice(-MAX_VISIBLE_LOG_LINES).map((entry) => (
							<Text
								key={`${entry.stream}-${entry.text}`}
								color={
									entry.stream === "stderr"
										? "red"
										: entry.stream === "system"
											? "yellow"
											: undefined
								}
							>
								[{entry.stream}] {entry.text}
							</Text>
						))}
					</Box>
				</>
			) : (
				<>
					<Text dimColor>
						Documentacao: {selectedApp.name} (Esc ou d para voltar)
					</Text>
					<Box marginTop={1} flexDirection="column">
						<Text>{docsContent}</Text>
					</Box>
				</>
			)}
			<Spacer />
			<Text dimColor>
				Launcher com visualizacao do processo filho dentro do app.
			</Text>
			{statusMessage ? <Text color="cyan">{statusMessage}</Text> : null}
		</Box>
	);
}
