import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
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
	ClipboardList,
	Crown,
	Diamond,
	Dumbbell,
	Eraser,
	FilePlus,
	FileText,
	Flame,
	FlaskConical,
	Folder,
	FolderOpen,
	Gamepad2,
	GraduationCap,
	Info,
	Laptop,
	Library,
	Lightbulb,
	Lock,
	Map,
	MessageCircle,
	Minus,
	Package,
	PartyPopper,
	Pencil,
	Play,
	Puzzle,
	RefreshCw,
	Rocket,
	Save,
	Settings,
	Shuffle,
	SkipForward,
	Star,
	Target,
	Trash2,
	TrendingUp,
	Trophy,
	User,
	Volume2,
	X,
	XCircle,
	Zap,
} from "lucide-react";

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

// ---------------------------------------------------------------------------
// Icon Registry
//
// Lucide SVG icons for all UI elements.
// Avatars remain as emoji — best candidates for custom SVG later.
//
// SVG CANDIDATES (high-impact replacements for custom art):
//   bolt, fire, star/starFilled/starEmpty, trophy, party, rocket
//   + all 8 avatars
// ---------------------------------------------------------------------------

export const icons = {
	// -- Brand / App ---------------------------------------------------------
	bolt: lucide(Zap),
	rocket: lucide(Rocket),
	cody: emoji("🤖"),

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
	fire: lucide(Flame),
	star: lucide(Star, true),
	starEmpty: lucide(Star),
	starFilled: lucide(Star, true),
	diamond: lucide(Diamond, true),
	circle: lucide(Circle, true),
	trophy: lucide(Trophy),
	party: lucide(PartyPopper),
	levelUp: lucide(TrendingUp),
	gamepad: lucide(Gamepad2),

	// -- Learning ------------------------------------------------------------
	book: lucide(BookOpen),
	laptop: lucide(Laptop),
	bulb: lucide(Lightbulb),
	lock: lucide(Lock),
	robot: lucide(Bot),
	memo: lucide(FileText),
	books: lucide(Library),
	refresh: lucide(RefreshCw),
	speech: lucide(MessageCircle),
	target: lucide(Target),
	abacus: lucide(Calculator),
	sound: lucide(Volume2),

	// -- Files / Playground --------------------------------------------------
	folder: lucide(FolderOpen),
	folderClosed: lucide(Folder),
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

	// -- Avatars (emoji — replace with custom SVG) ---------------------------
	avatarRobot1: emoji("🤖"),
	avatarRobot2: emoji("🦾"),
	avatarWizard2: emoji("🧙"),
	avatarWizard3: emoji("🧙"),
	avatarWizard: emoji("🧙"),
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
	"🦾": "avatarRobot2",
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
