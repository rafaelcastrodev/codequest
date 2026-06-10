import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore, getLevelTitle, getLevelProgress, getModuleMastery } from '@/store/progress.store';
import { Avatar, AVATAR_IDS } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MasteryBadge } from '@/components/ui/MasteryBadge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { icons, resolveIcon } from '@/components/ui/Icon';
import { loadAchievements, loadCurriculum, loadModule } from '@/content/loader';
import type { ReactNode } from 'react';
import type { Achievement, AchievementRarity, Curriculum, Module } from '@/content/curriculum.types';

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
      <p className={`font-body text-xs truncate ${unlocked ? 'text-text-main' : 'text-text-muted'}`}>
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
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [modules, setModules] = useState<Map<string, Module>>(new Map());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const levelData = getLevelProgress(xp);
  const title = getLevelTitle(level);
  const completedCount = Object.keys(completedExercises).length;
  const totalStars = Object.values(completedExercises).reduce((sum, e) => sum + e.stars, 0);

  useEffect(() => {
    loadAchievements().then((f) => setAllAchievements(f.achievements));
    loadCurriculum().then(async (c) => {
      setCurriculum(c);
      const loaded = await Promise.allSettled(
        c.modules.map(async (m) => {
          const mod = await loadModule(m.file);
          return [m.id, mod] as [string, Module];
        }),
      );
      const map = new Map<string, Module>();
      for (const r of loaded) {
        if (r.status === 'fulfilled') map.set(r.value[0], r.value[1]);
      }
      setModules(map);
    });
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
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-text-main">Perfil</h1>

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
              className="font-heading text-xl font-bold text-text-main bg-bg-elevated border border-primary/40 rounded-lg px-2 py-0.5 w-full outline-none focus:ring-2 focus:ring-primary/50"
            />
          ) : (
            <button
              onClick={() => { setNameInput(profile.name); setEditingName(true); }}
              className="group flex items-center gap-2 text-left"
            >
              <h2 className="font-heading text-xl font-bold text-text-main">{profile.name}</h2>
              <span className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity text-sm"><icons.pencil /></span>
            </button>
          )}
          <p className="text-text-muted font-body text-sm">Nível {level} · {title}</p>
          <div className="mt-3">
              <ProgressBar value={levelData.percent} max={100} variant="secondary" size="lg" overlayLabel={`${xp} / ${levelData.next} XP`} />
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
            <div className="font-heading font-bold text-text-main text-lg">{stat.value}</div>
            <div className="text-xs text-text-muted font-body">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {allAchievements.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-text-main mb-3">
            Troféus{' '}
            <span className="text-text-muted font-body font-normal text-sm">
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

      {curriculum && modules.size > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-text-main mb-3">
            Domínio por Módulo
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {curriculum.modules.map((cm) => {
              const mod = modules.get(cm.id);
              const mastery = getModuleMastery(mod?.lessons ?? [], completedExercises);
              const started = mastery.level > 0;
              return (
                <div
                  key={cm.id}
                  className={`bg-bg-surface border rounded-xl p-4 flex items-center gap-3 transition-opacity ${
                    started ? 'border-bg-elevated' : 'border-bg-elevated/50 opacity-40'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      backgroundColor: started ? `${cm.color}22` : '#252542',
                      borderColor: started ? cm.color : '#252542',
                      borderWidth: 1,
                    }}
                  >
                    {started ? cm.icon : <icons.lock />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body text-sm font-semibold text-text-main truncate">{cm.title}</span>
                      <span className="ml-auto flex-shrink-0"><MasteryBadge mastery={mastery} /></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={mastery.earnedStars}
                        max={mastery.maxStars}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                      />
                      <span className="text-[10px] text-text-muted font-body flex-shrink-0">
                        <icons.star /> {mastery.earnedStars}/{mastery.maxStars}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
