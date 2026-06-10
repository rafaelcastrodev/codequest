import { icons } from "@/components/ui/Icon";

export interface OutputPanelProps {
	output: string;
	errorMessage: string | null;
	mistakeMessage: string | null;
	status: string;
}

export function OutputPanel({
	output,
	errorMessage,
	mistakeMessage,
	status,
}: OutputPanelProps) {
	const isEmpty = !output && !errorMessage && !mistakeMessage;

	return (
		<div className="bg-bg-terminal border border-bg-elevated rounded-xl overflow-hidden h-40 flex flex-col">
			<div className="flex items-center gap-2 px-3 py-1.5 border-b border-bg-elevated flex-shrink-0">
				<div className="flex gap-1">
					<div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
					<div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
					<div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
				</div>
				<span className="text-xs text-text-muted font-mono">
					console
				</span>
				{status === "running" && (
					<span className="ml-auto text-xs text-text-muted font-body animate-pulse">
						executando...
					</span>
				)}
			</div>
			<div className="flex-1 p-3 overflow-y-auto scrollbar-thin">
				{isEmpty && status === "passed" && (
					<p className="text-primary font-mono text-xs flex items-center gap-1">
						<icons.checkCircle /> Código executado com sucesso!
					</p>
				)}
				{isEmpty && status !== "passed" && (
					<p className="text-text-muted font-mono text-xs opacity-50 flex items-center gap-1">
						Clique em [ Executar ] para ver a saída aqui
					</p>
				)}
				{mistakeMessage && (
					<p className="text-warning font-mono text-xs leading-relaxed flex items-start gap-1">
						<icons.warning className="flex-shrink-0" />{" "}
						{mistakeMessage}
					</p>
				)}
				{errorMessage && !mistakeMessage && (
					<pre className="text-accent font-mono text-xs leading-relaxed whitespace-pre-wrap flex items-start gap-1">
						<icons.cross className="flex-shrink-0" /> {errorMessage}
					</pre>
				)}
				{output && (
					<pre
						className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${status === "passed" ? "text-primary" : "text-text-main"}`}>
						{status === "passed" ? (
							<>
								<icons.checkCircle />{" "}
							</>
						) : (
							<>
								<icons.changelog />{" "}
							</>
						)}
						{output}
					</pre>
				)}
			</div>
		</div>
	);
}
