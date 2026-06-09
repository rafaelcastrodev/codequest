import type { CSSProperties, FunctionComponent, ReactNode, SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
	ALargeSmall,
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Bot,
	Brain,
	Building2,
	Calculator,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronUp,
	Circle,
	CircleHelp,
	ClipboardList,
	Crown,
	Diamond,
	Dumbbell,
	Eraser,
	FilePlus,
	Files,
	FileText,
	FlaskConical,
	Folder,
	FolderOpen,
	Gamepad2,
	GraduationCap,
	Info,
	Laptop,
	Library,
	Lightbulb,
	Map,
	MessageCircle,
	Minus,
	Package,
	Pencil,
	Play,
	Puzzle,
	RefreshCw,
	Save,
	Settings,
	Shuffle,
	SkipForward,
	Target,
	Trash2,
	TrendingUp,
	User,
	X,
	XCircle,
} from "lucide-react";

import BoltSvg from "@/assets/icons/bolt.svg?react";
import CodySvg from "@/assets/icons/cody.svg?react";
import FireSvg from "@/assets/icons/fire.svg?react";
import LockSvg from "@/assets/icons/lock.svg?react";
import PartySvg from "@/assets/icons/party.svg?react";
import RocketSvg from "@/assets/icons/rocket.svg?react";
import SoundSvg from "@/assets/icons/sound.svg?react";
import StarSvg from "@/assets/icons/star.svg?react";
import StarEmptySvg from "@/assets/icons/star_empty.svg?react";
import TrophySvg from "@/assets/icons/trophy.svg?react";

interface IconProps {
	className?: string;
	size?: number;
	style?: CSSProperties;
	"aria-label"?: string;
	"aria-hidden"?: boolean;
}

type IconComponent = (props: IconProps) => ReactNode;

// ---------------------------------------------------------------------------
// Wrappers
// ---------------------------------------------------------------------------

function lucide(Comp: LucideIcon, fill = false): IconComponent {
	return function LucideWrapper({
		className = "",
		size,
		style,
		...aria
	}: IconProps) {
		return (
			<Comp
				className={`inline-block shrink-0 ${className}`}
				size={size ?? "1em"}
				fill={fill ? "currentColor" : "none"}
				style={style}
				{...aria}
			/>
		);
	};
}

function emoji(char: string): IconComponent {
	return function EmojiIcon({
		className = "",
		size,
		style,
		...aria
	}: IconProps) {
		return (
			<span
				role="img"
				className={`inline-flex items-center justify-center leading-none select-none ${className}`}
				style={{ fontSize: size ? `${size}px` : undefined, ...style }}
				{...aria}>
				{char}
			</span>
		);
	};
}

function svg(Comp: FunctionComponent<SVGProps<SVGSVGElement>>): IconComponent {
	return function SvgWrapper({
		className = "",
		size,
		style,
		...aria
	}: IconProps) {
		const s = size ? `${size}px` : "1em";
		return (
			<Comp
				className={`inline-block shrink-0 ${className}`}
				width={s}
				height={s}
				style={style}
				{...aria}
			/>
		);
	};
}

// ---------------------------------------------------------------------------
// Icon Registry
// ---------------------------------------------------------------------------

export const icons = {
	// -- Brand / App ---------------------------------------------------------
	bolt: svg(BoltSvg),
	rocket: svg(RocketSvg),
	cody: svg(CodySvg),

	// -- Navigation ----------------------------------------------------------
	map: lucide(Map),
	flask: lucide(FlaskConical),
	person: lucide(User),
	info: lucide(Info),
	changelog: lucide(ClipboardList),
	gear: lucide(Settings),
	arrowRight: lucide(ArrowRight),
	arrowLeft: lucide(ArrowLeft),
	play: lucide(Play, true),
	playBack: lucide(ChevronLeft),
	skipForward: lucide(SkipForward),
	chevronUp: lucide(ChevronUp),
	chevronDown: lucide(ChevronDown),
	chevronSmDown: lucide(ChevronDown),

	// -- Status / Feedback ---------------------------------------------------
	checkCircle: lucide(CheckCircle2),
	check: lucide(Check),
	cross: lucide(XCircle),
	close: lucide(X),
	warning: lucide(AlertTriangle),

	// -- Gamification --------------------------------------------------------
	fire: svg(FireSvg),
	star: svg(StarSvg),
	starEmpty: svg(StarEmptySvg),
	starFilled: svg(StarSvg),
	diamond: lucide(Diamond, true),
	circle: lucide(Circle, true),
	trophy: svg(TrophySvg),
	party: svg(PartySvg),
	levelUp: lucide(TrendingUp),
	gamepad: lucide(Gamepad2),

	// -- Learning ------------------------------------------------------------
	book: lucide(BookOpen),
	laptop: lucide(Laptop),
	bulb: lucide(Lightbulb),
	lock: svg(LockSvg),
	robot: lucide(Bot),
	memo: lucide(FileText),
	books: lucide(Library),
	refresh: lucide(RefreshCw),
	speech: lucide(MessageCircle),
	target: lucide(Target),
	abacus: lucide(Calculator),
	sound: svg(SoundSvg),

	// -- Files / Playground --------------------------------------------------
	folder: lucide(FolderOpen),
	folderClosed: lucide(Folder),
	files: lucide(Files),
	document: lucide(FilePlus),
	save: lucide(Save),
	trash: lucide(Trash2),
	broom: lucide(Eraser),
	pencil: lucide(Pencil),

	// -- Achievements --------------------------------------------------------
	package: lucide(Package),
	puzzle: lucide(Puzzle),
	shuffle: lucide(Shuffle),
	construction: lucide(Building2),
	brain: lucide(Brain),
	strength: lucide(Dumbbell),
	graduation: lucide(GraduationCap),
	crown: lucide(Crown),

	// -- Misc ----------------------------------------------------------------
	minus: lucide(Minus),
	help: lucide(CircleHelp),
	fontSize: lucide(ALargeSmall),

	// -- Avatars -------------------------------------------------------------
	avatarRobot1: emoji("🤖"),
	avatarCoffee: emoji("☕"),
	avatarWizard: emoji("🧙"),
	avatarWizard2: emoji("🧙"),
	avatarWizard3: emoji("🧙"),
	avatarNinja: emoji("🥷"),
	avatarAstronaut: emoji("👨‍🚀"),
	avatarScientist: emoji("🧪"),
	avatarHacker: emoji("💻"),
	avatarDragon: emoji("🐉"),
} as const satisfies Record<string, IconComponent>;

export type IconName = keyof typeof icons;
export type { IconProps, IconComponent };

// ---------------------------------------------------------------------------
// Reverse lookup: emoji char → IconName
// ---------------------------------------------------------------------------

const EMOJI_TO_ICON: Record<string, IconName> = {
	"⚡": "bolt",
	"🚀": "rocket",
	"🗺️": "map",
	"🧪": "flask",
	"👤": "person",
	ℹ️: "info",
	"📋": "changelog",
	"⚙️": "gear",
	"✅": "checkCircle",
	"❌": "cross",
	"⚠️": "warning",
	"🔥": "fire",
	"⭐": "star",
	"🏆": "trophy",
	"🎉": "party",
	"⬆️": "levelUp",
	"🎮": "gamepad",
	"📖": "book",
	"💻": "laptop",
	"💡": "bulb",
	"🔒": "lock",
	"🤖": "robot",
	"📝": "memo",
	"📚": "books",
	"🔄": "refresh",
	"💬": "speech",
	"🎯": "target",
	"🧮": "abacus",
	"🔊": "sound",
	"📂": "folder",
	"📁": "folderClosed",
	"📄": "document",
	"💾": "save",
	"🗑️": "trash",
	"🧹": "broom",
	"✏️": "pencil",
	"📦": "package",
	"🧩": "puzzle",
	"🔀": "shuffle",
	"🏗️": "construction",
	"🧠": "brain",
	"💪": "strength",
	"🎓": "graduation",
	"👑": "crown",
	"🐉": "avatarDragon",
	"☕": "avatarCoffee",
	"🧙": "avatarWizard",
	"🥷": "avatarNinja",
	"👨‍🚀": "avatarAstronaut",
};

export function resolveIcon(emojiOrName: string): IconComponent {
	if (emojiOrName in icons) return icons[emojiOrName as IconName];
	const name = EMOJI_TO_ICON[emojiOrName];
	if (name) return icons[name];
	return emoji(emojiOrName);
}
