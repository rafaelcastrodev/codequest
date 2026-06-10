import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { CodeBlock } from "./CodeBlock";

interface RichTextProps {
	content: string;
	className?: string;
}

const components: Components = {
	code({ children, className }) {
		const match = /language-(\w+)/.exec(className || "");
		const text = String(children).replace(/\n$/, "");

		if (match || text.includes("\n")) {
			return <CodeBlock code={text} language={match?.[1] ?? "typescript"} />;
		}

		return (
			<code className="bg-bg-elevated text-primary px-1.5 py-0.5 rounded font-mono text-[0.9em]">
				{children}
			</code>
		);
	},
	pre({ children }) {
		return <>{children}</>;
	},
	strong({ children }) {
		return <strong className="font-bold text-text-main">{children}</strong>;
	},
	ul({ children }) {
		return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
	},
	ol({ children }) {
		return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
	},
	li({ children }) {
		return <li className="text-text-main">{children}</li>;
	},
	p({ children }) {
		return <p className="my-1.5">{children}</p>;
	},
	h1({ children }) {
		return <h1 className="font-heading font-bold text-xl text-text-main mt-4 mb-2">{children}</h1>;
	},
	h2({ children }) {
		return <h2 className="font-heading font-bold text-lg text-text-main mt-3 mb-1.5">{children}</h2>;
	},
	h3({ children }) {
		return <h3 className="font-heading font-bold text-base text-text-main mt-2 mb-1">{children}</h3>;
	},
	blockquote({ children }) {
		return (
			<blockquote className="border-l-3 border-primary/50 pl-3 my-2 text-text-muted italic">
				{children}
			</blockquote>
		);
	},
	table({ children }) {
		return (
			<div className="overflow-x-auto my-2">
				<table className="w-full text-sm border-collapse">{children}</table>
			</div>
		);
	},
	th({ children }) {
		return <th className="border border-bg-elevated px-3 py-1.5 text-left font-bold bg-bg-elevated">{children}</th>;
	},
	td({ children }) {
		return <td className="border border-bg-elevated px-3 py-1.5">{children}</td>;
	},
};

export function RichText({ content, className = "" }: RichTextProps) {
	return (
		<div className={className}>
			<Markdown remarkPlugins={[remarkGfm]} components={components}>
				{content}
			</Markdown>
		</div>
	);
}
