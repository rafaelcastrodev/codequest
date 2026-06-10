import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { icons } from "@/components/ui/Icon";
import {
	useProgressStore,
	getLevelTitle,
	getLevelProgress,
} from "@/store/progress.store";
import type { ReactNode } from "react";

interface NavItemProps {
	to: string;
	icon: ReactNode;
	label: string;
	active: boolean;
	onClick?: () => void;
}

function NavItem({ to, icon, label, active, onClick }: NavItemProps) {
	return (
		<Link to={to} onClick={onClick}>
			<motion.div
				whileHover={{ x: 3 }}
				transition={{ type: "spring", stiffness: 400, damping: 20 }}
				className={`
          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer
          ${
				active
					? "bg-primary/20 text-primary border border-primary/30"
					: "text-text-muted hover:text-text-main hover:bg-bg-elevated"
			}
        `}>
				<span className="text-xl">{icon}</span>
				<span className="font-body font-semibold text-sm">{label}</span>
			</motion.div>
		</Link>
	);
}

interface SidebarProps {
	onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
	const location = useLocation();
	const { profile, xp, level, streak } = useProgressStore();
	const levelData = getLevelProgress(xp);
	const title = getLevelTitle(level);

	return (
		<aside className="w-64 flex-shrink-0 bg-bg-surface border-r border-bg-elevated flex flex-col h-full">
			<div className="p-5 border-b border-bg-elevated">
				<div className="flex items-center gap-3 mb-4">
					<Avatar id={profile.avatar} size="md" />
					<div className="min-w-0">
						<p className="font-heading font-semibold text-text-main truncate">
							{profile.name}
						</p>
						<p className="text-xs text-text-muted font-body">
							Nível {level} · {title}
						</p>
					</div>
				</div>

				<div className="space-y-1">
					<div className="flex justify-between items-center">
						<span className="text-xs text-text-muted font-body">
							XP
						</span>
						<span className="text-xs text-secondary font-body font-semibold">
							{xp} XP
						</span>
					</div>
					<ProgressBar
						value={levelData.percent}
						max={100}
						variant="secondary"
						size="sm"
					/>
				</div>
			</div>

			<div className="px-5 py-3 border-b border-bg-elevated flex items-center gap-4">
				<div className="flex items-center gap-1.5">
					<icons.fire className="text-2xl" />
					<span className="font-heading font-bold text-warning text-lg">
						{streak.current}
					</span>
					<span className="text-text-muted font-heading font-semibold">
						Ofensiva
					</span>
				</div>
			</div>

			<nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
				<NavItem
					to="/"
					icon={<icons.map />}
					label="Jornada"
					active={location.pathname === "/"}
					onClick={onNavigate}
				/>
				<NavItem
					to="/playground"
					icon={<icons.flask />}
					label="Playground"
					active={location.pathname === "/playground"}
					onClick={onNavigate}
				/>
				<NavItem
					to="/profile"
					icon={<icons.person />}
					label="Perfil"
					active={location.pathname === "/profile"}
					onClick={onNavigate}
				/>
				<NavItem
					to="/about"
					icon={<icons.info />}
					label="Sobre"
					active={location.pathname === "/about"}
					onClick={onNavigate}
				/>
				<NavItem
					to="/changelog"
					icon={<icons.changelog />}
					label="Changelog"
					active={location.pathname === "/changelog"}
					onClick={onNavigate}
				/>
				<NavItem
					to="/settings"
					icon={<icons.gear />}
					label="Configurações"
					active={location.pathname === "/settings"}
					onClick={onNavigate}
				/>
			</nav>

			<div className="p-4 border-t border-bg-elevated">
				<p className="text-xs text-text-muted font-body text-center">
					CodeQuest v{__APP_VERSION__}
				</p>
			</div>
		</aside>
	);
}
