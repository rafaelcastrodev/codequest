import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore, getLevelTitle, getLevelProgress } from '@/store/progress.store';
import { Avatar, AVATAR_IDS } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { icons, resolveIcon } from '@/components/ui/Icon';
import { loadAchievements } from '@/content/loader';
import type { ReactNode } from 'react';
import type { Achievement, AchievementRarity } from '@/content/curriculum.types';

const RARITY_STYLES: Record<AchievementRarity, string> = {
  common: 'border-bg-elevated',
  uncommon: 'border-primary/40 shadow-[0_0_8px_rgba(0,212,170,0.15)]',
  rare: 'border-secondary/50 shadow-[0_0_10px_rgba(124,92,252,0.2)]',
  legendary: 'border-warning/60 shadow-[0_0_14px_rgba(255,184,77,0.25)]',
};

interface BadgeCardProps {
  achievement: Achievement;
  unlocked: boolean;
}

function BadgeCard({ achievement, unlocked }: BadgeCardProps) {
  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05 } : {}}
      title={unlocked ? `${achievement.title}: ${achievement.description}` : '???'}
      className={`
        relative bg-bg-surface border rounded-xl p-3 text-center transition-all
        ${unlocked ? RARITY_STYLES[achievement.rarity] : 'border-bg-elevated opacity-40'}
      `}
    >
      <div className={`text-2xl mb-1 ${!unlocked ? 'grayscale' : ''}`}>
        {unlocked ? resolveIcon(achievement.icon)({}) : <icons.lock />}
      </div>
      <p className={`font-body text-xs truncate ${unlocked ? 'text-[#E8E8F0]' : 'text-[#8888AA]'}`}>
        {unlocked ? achievement.title : '???'}
      </p>
      {unlocked && achievement.rarity !== 'common' && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-heading font-bold text-warning opacity-70 uppercase tracking-wide">
          {achievement.rarity === 'legendary' ? <icons.starFilled /> : achievement.rarity === 'rare' ? <icons.diamond /> : <icons.circle />}
        </span>
      )}
    </motion.div>
  );
}

export function ProfilePage() {
  const { profile, xp, level, streak, completedExercises, achievements, setProfile } =
    useProgressStore();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const levelData = getLevelProgress(xp);
  const title = getLevelTitle(level);
  const completedCount = Object.keys(completedExercises).length;
  const totalStars = Object.values(completedExercises).reduce((sum, e) => sum + e.stars, 0);

  useEffect(() => {
    loadAchievements().then((f) => setAllAchievements(f.achievements));
  }, []);

  function saveName() {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      setProfile(trimmed, profile.avatar);
    } else {
      setNameInput(profile.name);
    }
    setEditingName(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#E8E8F0]">Perfil</h1>

      <div className="bg-bg-surface border border-bg-elevated rounded-2xl p-6 flex items-center gap-5">
        <Avatar id={profile.avatar} size="xl" onClick={() => setAvatarModalOpen(true)} />
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName();
                if (e.key === 'Escape') { setNameInput(profile.name); setEditingName(false); }
              }}
              maxLength={20}
              className="font-heading text-xl font-bold text-[#E8E8F0] bg-bg-elevated border border-primary/40 rounded-lg px-2 py-0.5 w-full outline-none focus:ring-2 focus:ring-primary/50"
            />
          ) : (
            <button
              onClick={() => { setNameInput(profile.name); setEditingName(true); }}
              className="group flex items-center gap-2 text-left"
            >
              <h2 className="font-heading text-xl font-bold text-[#E8E8F0]">{profile.name}</h2>
              <span className="text-[#8888AA] opacity-0 group-hover:opacity-100 transition-opacity text-sm"><icons.pencil /></span>
            </button>
          )}
          <p className="text-[#8888AA] font-body text-sm">Nível {level} · {title}</p>
          <div className="mt-3">
            <div className="relative">
              <ProgressBar value={levelData.percent} max={100} variant="secondary" size="lg" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-body font-bold text-[#E8E8F0] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {xp} / {levelData.next} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          { icon: <icons.fire />, label: 'Ofensiva', value: `${streak.current} dias` },
          { icon: <icons.star />, label: 'Estrelas', value: totalStars },
          { icon: <icons.checkCircle />, label: 'Lições', value: completedCount },
          { icon: <icons.trophy />, label: 'Troféus', value: `${achievements.length}/${allAchievements.length}` },
        ] as { icon: ReactNode; label: string; value: string | number }[]).map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03 }}
            className="bg-bg-surface border border-bg-elevated rounded-xl p-4 text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-heading font-bold text-[#E8E8F0] text-lg">{stat.value}</div>
            <div className="text-xs text-[#8888AA] font-body">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {allAchievements.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-[#E8E8F0] mb-3">
            Troféus{' '}
            <span className="text-[#8888AA] font-body font-normal text-sm">
              {achievements.length}/{allAchievements.length}
            </span>
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {allAchievements.map((a) => (
              <BadgeCard key={a.id} achievement={a} unlocked={achievements.includes(a.id)} />
            ))}
          </div>
        </div>
      )}

      <Modal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} title="Escolha seu avatar">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mt-2">
          {AVATAR_IDS.map((id) => (
            <Avatar
              key={id}
              id={id}
              size="lg"
              onClick={() => {
                setProfile(profile.name, id);
                setAvatarModalOpen(false);
              }}
              className={profile.avatar === id ? 'border-primary border-glow-primary' : ''}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 w-full"
          onClick={() => setAvatarModalOpen(false)}
        >
          Cancelar
        </Button>
      </Modal>
    </div>
  );
}
