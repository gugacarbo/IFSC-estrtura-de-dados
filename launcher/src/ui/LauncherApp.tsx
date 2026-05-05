import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Box, Spacer, Text, useInput, useStdin, useStdout } from "ink";
import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { getScriptOptions } from "../data/apps.js";
import {
	type BackgroundRunHandle,
	executeScriptOptionInBackground,
} from "../services/runner.js";
import type { AppInfo, ScriptOption } from "../types.js";

interface LauncherAppProps {
	apps: AppInfo[];
}

type Screen = "apps" | "scripts" | "docs" | "run";

interface RunViewState {
	id: string;
	appName: string;
	scriptLabel: string;
	pid: number | null;
	isRunning: boolean;
	status: string;
}

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

function renderInlineMarkdown(text: string): ReactNode[] {
	const tokens: ReactNode[] = [];
	let cursor = 0;
	const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

	for (const match of text.matchAll(pattern)) {
		const token = match[0];
		const index = match.index ?? 0;
		if (index > cursor) {
			tokens.push(text.slice(cursor, index));
		}

		if (token.startsWith("`") && token.endsWith("`")) {
			tokens.push(
				<Text key={`${index}-code`} color="black" backgroundColor="gray">
					{token.slice(1, -1)}
				</Text>,
			);
		} else if (token.startsWith("**") && token.endsWith("**")) {
			tokens.push(
				<Text key={`${index}-bold`} bold>
					{token.slice(2, -2)}
				</Text>,
			);
		} else if (token.startsWith("*") && token.endsWith("*")) {
			tokens.push(
				<Text key={`${index}-italic`} dimColor>
					{token.slice(1, -1)}
				</Text>,
			);
		} else {
			const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
			if (linkMatch) {
				tokens.push(
					<Text key={`${index}-link`} color="blue" underline>
						{linkMatch[1]} ({linkMatch[2]})
					</Text>,
				);
			} else {
				tokens.push(token);
			}
		}

		cursor = index + token.length;
	}

	if (cursor < text.length) {
		tokens.push(text.slice(cursor));
	}

	return tokens.length > 0 ? tokens : [text];
}

function renderMarkdownLine(line: string, lineIndex: number, inCodeBlock: boolean): ReactNode {
	if (line.trim().startsWith("```")) {
		return (
			<Text key={`line-${lineIndex}`} color="yellow">
				{inCodeBlock ? "└─ fim de bloco de codigo" : "┌─ bloco de codigo"}
			</Text>
		);
	}

	if (inCodeBlock) {
		return (
			<Text key={`line-${lineIndex}`} color="yellow">
				{line}
			</Text>
		);
	}

	const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
	if (headingMatch) {
		const level = headingMatch[1].length;
		const title = headingMatch[2];
		const headingColor =
			level === 1 ? "cyan" : level === 2 ? "green" : level === 3 ? "magenta" : "white";
		return (
			<Text key={`line-${lineIndex}`} color={headingColor} bold>
				{`${"#".repeat(level)} ${title}`}
			</Text>
		);
	}

	if (/^\s*[-*]\s+/.test(line)) {
		const content = line.replace(/^\s*[-*]\s+/, "");
		return (
			<Text key={`line-${lineIndex}`}>
				<Text color="green">• </Text>
				{renderInlineMarkdown(content)}
			</Text>
		);
	}

	if (/^\s*\d+\.\s+/.test(line)) {
		const content = line.replace(/^\s*(\d+\.)\s+/, "$1 ");
		return <Text key={`line-${lineIndex}`}>{renderInlineMarkdown(content)}</Text>;
	}

	if (/^\s*>/.test(line)) {
		const content = line.replace(/^\s*>\s?/, "");
		return (
			<Text key={`line-${lineIndex}`} color="gray">
				│ {renderInlineMarkdown(content)}
			</Text>
		);
	}

	return <Text key={`line-${lineIndex}`}>{renderInlineMarkdown(line)}</Text>;
}

export function LauncherApp({ apps }: LauncherAppProps) {
	const { isRawModeSupported } = useStdin();
	const { stdout } = useStdout();
	const [screen, setScreen] = useState<Screen>("apps");
	const [previousScreen, setPreviousScreen] = useState<Screen>("apps");
	const [runReturnScreen, setRunReturnScreen] = useState<Screen>("scripts");
	const [selectedAppIndex, setSelectedAppIndex] = useState(0);
	const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
	const [statusMessage, setStatusMessage] = useState("");
	const [docsContent, setDocsContent] = useState("");
	const [docsScrollOffset, setDocsScrollOffset] = useState(0);
	const [runViews, setRunViews] = useState<RunViewState[]>([]);
	const [selectedRunIndex, setSelectedRunIndex] = useState(0);
	const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
	const runningHandlesRef = useRef<Map<string, BackgroundRunHandle>>(new Map());
	const selectedApp = apps[selectedAppIndex];
	const scriptOptions = useMemo<ScriptOption[]>(() => {
		if (!selectedApp) {
			return [];
		}
		return getScriptOptions(selectedApp);
	}, [selectedApp]);
	const docsLines = useMemo(() => docsContent.split("\n"), [docsContent]);
	const docsViewportHeight = Math.max((stdout?.rows ?? 24) - 12, 5);
	const maxDocsOffset = Math.max(docsLines.length - docsViewportHeight, 0);
	const runningCount = runViews.filter((run) => run.isRunning).length;
	const finishedCount = runViews.length - runningCount;
	const visibleDocsLines = docsLines.slice(
		docsScrollOffset,
		docsScrollOffset + docsViewportHeight,
	);
	const visibleDocsNodes = useMemo(() => {
		let inCodeBlock = false;
		return visibleDocsLines.map((line, index) => {
			const node = renderMarkdownLine(line, docsScrollOffset + index, inCodeBlock);
			if (line.trim().startsWith("```")) {
				inCodeBlock = !inCodeBlock;
			}
			return node;
		});
	}, [visibleDocsLines, docsScrollOffset]);

	function openDocs(from: Screen): void {
		if (!selectedApp) {
			return;
		}

		setPreviousScreen(from);
		setDocsContent(readAppDocs(selectedApp));
		setDocsScrollOffset(0);
		setScreen("docs");
	}

	function startExternalTerminal(app: AppInfo, option: ScriptOption): void {
		const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		setScreen("run");
		setRunReturnScreen("scripts");
		setRunViews((prev) => {
			const nextRuns = [
				...prev,
				{
					id: runId,
					appName: app.name,
					scriptLabel: option.label,
					pid: null,
					isRunning: true,
					status: `Abrindo terminal para ${app.name} -> ${option.label}...`,
				},
			];
			setSelectedRunIndex(nextRuns.length - 1);
			return nextRuns;
		});
		setStatusMessage("");

		const handle = executeScriptOptionInBackground(app, option, {
			onStatus: (status) => {
				setRunViews((prev) =>
					prev.map((run) => (run.id === runId ? { ...run, status } : run)),
				);
			},
			onPid: (pid) => {
				setRunViews((prev) =>
					prev.map((run) => (run.id === runId ? { ...run, pid } : run)),
				);
			},
			onFinish: (_success, message) => {
				runningHandlesRef.current.delete(runId);
				setRunViews((prev) =>
					prev.map((run) =>
						run.id === runId
							? {
									...run,
								isRunning: false,
								status: message,
								}
							: run,
					),
				);
			},
		});
		runningHandlesRef.current.set(runId, handle);
	}

	function stopSelectedRun(): void {
		const selectedRun = runViews[selectedRunIndex];
		if (!selectedRun) {
			setStatusMessage("Nenhum terminal selecionado.");
			return;
		}

		if (!selectedRun.isRunning) {
			setStatusMessage("O terminal selecionado ja foi finalizado.");
			return;
		}

		const handle = runningHandlesRef.current.get(selectedRun.id);
		if (!handle) {
			setStatusMessage("Handle do terminal nao encontrado.");
			return;
		}

		handle.stop();
	}

	function stopAllRunningRuns(): void {
		let stopped = 0;
		for (const run of runViews) {
			if (!run.isRunning) {
				continue;
			}
			const handle = runningHandlesRef.current.get(run.id);
			if (!handle) {
				continue;
			}
			handle.stop();
			stopped += 1;
		}

		setStatusMessage(
			stopped > 0
				? `${stopped} terminal(is) em encerramento.`
				: "Nenhum terminal em execucao para encerrar.",
		);
	}

	function clearFinishedRuns(): void {
		let removed = 0;
		setRunViews((prev) => {
			const next = prev.filter((run) => run.isRunning);
			removed = prev.length - next.length;
			return next;
		});
		setSelectedRunIndex(0);
		setStatusMessage(
			removed > 0
				? `${removed} terminal(is) finalizado(s) removido(s) da lista.`
				: "Nenhum terminal finalizado para limpar.",
		);
	}

	function requestExitConfirmation(): void {
		setIsExitConfirmOpen(true);
	}

	function confirmExit(): void {
		for (const handle of runningHandlesRef.current.values()) {
			handle.stop();
		}
		process.exit(0);
	}

	useInput(
		(input, key) => {
			if (isExitConfirmOpen) {
				if (key.return || input === "y" || input === "s") {
					confirmExit();
					return;
				}
				if (key.escape || input === "n") {
					setIsExitConfirmOpen(false);
					return;
				}
				return;
			}

			if ((screen === "apps" && input === "q") || (key.ctrl && input === "c")) {
				requestExitConfirmation();
				return;
			}

			if (screen === "docs") {
				if (key.escape || input === "d" || input === "b") {
					setScreen(previousScreen);
					return;
				}
				if (key.upArrow || input === "k") {
					setDocsScrollOffset((prev) => clamp(prev - 1, 0, maxDocsOffset));
					return;
				}
				if (key.downArrow || input === "j") {
					setDocsScrollOffset((prev) => clamp(prev + 1, 0, maxDocsOffset));
					return;
				}
				if (key.pageUp) {
					setDocsScrollOffset((prev) =>
						clamp(prev - docsViewportHeight, 0, maxDocsOffset),
					);
					return;
				}
				if (key.pageDown || input === " ") {
					setDocsScrollOffset((prev) =>
						clamp(prev + docsViewportHeight, 0, maxDocsOffset),
					);
				}
				return;
			}

			if (screen === "run") {
				if (key.upArrow) {
					setSelectedRunIndex((prev) => clamp(prev - 1, 0, runViews.length - 1));
					return;
				}
				if (key.downArrow) {
					setSelectedRunIndex((prev) => clamp(prev + 1, 0, runViews.length - 1));
					return;
				}
				if (input === "k") {
					stopSelectedRun();
					return;
				}
				if (input === "x") {
					stopAllRunningRuns();
					return;
				}
				if (input === "c") {
					clearFinishedRuns();
					return;
				}
				if (key.escape || input === "b") {
					setScreen(runReturnScreen);
				}
				return;
			}

			if (screen === "apps") {
				if (key.escape) {
					requestExitConfirmation();
					return;
				}
				if (input === "t") {
					setRunReturnScreen("apps");
					setScreen("run");
					return;
				}
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
				if (input === "t") {
					setRunReturnScreen("scripts");
					setScreen("run");
					return;
				}
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
						startExternalTerminal(selectedApp, option);
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
		<Box flexDirection="column" padding={1} width="100%" height="100%">
			<Text bold color="cyan">
				IFSC Estrutura de Dados - Launcher
			</Text>
			<Spacer />
			{screen === "apps" ? (
				<>
					<Text dimColor>
						Selecione um app (Enter), d para docs, t para terminais, q/Esc/Ctrl+C para sair.
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
						para voltar, t para terminais.
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
			) : screen === "run" ? (
				<>
					<Text dimColor>
						Terminais externos (Setas: selecionar | k: fecha selecionado | x:
						fecha todos em execucao | c: limpa finalizados | Esc/b: voltar)
					</Text>
					<Text dimColor>
						Executando: {runningCount} | Finalizados: {finishedCount} | Total:{" "}
						{runViews.length}
					</Text>
					{runViews.length === 0 ? (
						<Text dimColor>Nenhum terminal iniciado ainda.</Text>
					) : (
						<Box marginTop={1} flexDirection="column">
							{runViews.map((run, index) => (
								<Text
									key={run.id}
									color={index === selectedRunIndex ? "green" : undefined}
								>
									{index === selectedRunIndex ? "> " : "  "}
									[{run.isRunning ? "RUN" : "END"}] {run.appName} {"->"}{" "}
									{run.scriptLabel} | PID: {run.pid ?? "..."} | {run.status}
								</Text>
							))}
						</Box>
					)}
				</>
				) : (
					<>
						<Text dimColor>Documentacao: {selectedApp.name}</Text>
						<Text dimColor>
							Use setas, j/k ou PgUp/PgDn para rolar. Esc, d ou b para voltar.
						</Text>
						<Text color="green">[b] Voltar</Text>
						<Box marginTop={1} flexDirection="column">
							{visibleDocsNodes}
						</Box>
						<Text dimColor>
							Linhas {Math.min(docsScrollOffset + 1, docsLines.length)}-
							{Math.min(docsScrollOffset + docsViewportHeight, docsLines.length)}{" "}
							de {docsLines.length}
						</Text>
					</>
				)}
			<Spacer />
			<Text dimColor>
				Cada script abre em uma nova janela de terminal com monitoramento.
			</Text>
			{isExitConfirmOpen ? (
				<Text color="yellow">
					Confirma sair do launcher? Enter/y confirma | n/Esc cancela.
				</Text>
			) : null}
			{statusMessage ? <Text color="cyan">{statusMessage}</Text> : null}
		</Box>
	);
}
