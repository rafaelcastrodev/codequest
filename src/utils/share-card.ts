const AVATAR_EMOJIS: Record<string, string> = {
  "robot-1": "\u{1F916}",
  coffee: "☕",
  wizard: "\u{1F9D9}",
  ninja: "\u{1F977}",
  astronaut: "\u{1F468}‍\u{1F680}",
  scientist: "\u{1F9EA}",
  hacker: "\u{1F4BB}",
  dragon: "\u{1F409}",
  penguin: "\u{1F427}",
  rainbow: "\u{1F308}",
  greekeye: "\u{1F9FF}",
  rock: "\u{1FAA8}",
};

interface MasteryEntry {
  title: string;
  color: string;
  earnedStars: number;
  maxStars: number;
  masteryTitle: string;
  masteryColor: string;
}

interface ShareCardData {
  name: string;
  avatar: string;
  level: number;
  title: string;
  xp: number;
  xpNext: number;
  xpPercent: number;
  streak: number;
  stars: number;
  lessons: number;
  trophies: number;
  trophiesTotal: number;
  mastery?: MasteryEntry[];
}

const COLORS = {
  bgPrimary: "#0F0F1A",
  bgSurface: "#1A1A2E",
  bgElevated: "#252542",
  primary: "#00D4AA",
  accent: "#FF6B6B",
  secondary: "#7C5CFC",
  warning: "#FFB84D",
  text: "#E8E8F0",
  textMuted: "#8888AA",
  gold: "#FACC15",
};

const MASTERY_COLORS: Record<string, string> = {
  muted: COLORS.textMuted,
  primary: COLORS.primary,
  warning: COLORS.warning,
  secondary: COLORS.secondary,
  gold: COLORS.gold,
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawLogoMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.font = `bold ${size}px JetBrains Mono, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const grad = ctx.createLinearGradient(cx - size, cy, cx + size, cy);
  grad.addColorStop(0, COLORS.primary);
  grad.addColorStop(1, COLORS.secondary);
  ctx.fillStyle = grad;
  ctx.fillText("</>", cx, cy);
  ctx.restore();
}

export function generateShareCard(data: ShareCardData): HTMLCanvasElement {
  const W = 640;
  const hasMastery = data.mastery && data.mastery.length > 0;
  const masteryRows = hasMastery ? Math.ceil(data.mastery!.length / 2) : 0;
  const H = hasMastery ? 340 + masteryRows * 36 + 40 : 340;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.fillStyle = COLORS.bgPrimary;
  ctx.fill();

  // Inner border
  roundRect(ctx, 1, 1, W - 2, H - 2, 19);
  ctx.strokeStyle = "rgba(37, 37, 66, 0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top accent line
  const accentGrad = ctx.createLinearGradient(40, 0, W - 40, 0);
  accentGrad.addColorStop(0, "rgba(0, 212, 170, 0)");
  accentGrad.addColorStop(0.3, "rgba(0, 212, 170, 0.6)");
  accentGrad.addColorStop(0.7, "rgba(124, 92, 252, 0.6)");
  accentGrad.addColorStop(1, "rgba(124, 92, 252, 0)");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(40, 0, W - 80, 2);

  // --- Profile section ---
  const profileY = 30;
  const avatarSize = 72;
  const avatarX = 40;
  const avatarY = profileY;
  const avatarR = 12;

  // Avatar border
  roundRect(ctx, avatarX - 2, avatarY - 2, avatarSize + 4, avatarSize + 4, avatarR + 2);
  ctx.strokeStyle = `${COLORS.primary}50`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Avatar background
  roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarR);
  ctx.fillStyle = COLORS.bgElevated;
  ctx.fill();

  // Avatar emoji
  const emoji = AVATAR_EMOJIS[data.avatar] ?? "\u{1F916}";
  ctx.font = "38px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 2);

  // Name
  const infoX = avatarX + avatarSize + 20;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 26px Fredoka, sans-serif";
  ctx.fillStyle = COLORS.text;
  ctx.fillText(data.name, infoX, profileY + 4);

  // Level & title
  ctx.font = "15px Nunito, sans-serif";
  ctx.fillStyle = COLORS.textMuted;
  ctx.fillText(`Nível ${data.level} · ${data.title}`, infoX, profileY + 36);

  // XP bar (matches ProgressBar lg variant)
  const barX = infoX;
  const barY = profileY + 58;
  const barW = W - infoX - 40;
  const barH = 16;

  // Bar background
  roundRect(ctx, barX, barY, barW, barH, 8);
  ctx.fillStyle = COLORS.bgElevated;
  ctx.fill();

  // Bar fill (secondary = solid purple)
  const fillPercent = Math.min(100, Math.max(0, data.xpPercent));
  const fillW = Math.max(0, (fillPercent / 100) * barW);
  if (fillW > 0) {
    roundRect(ctx, barX, barY, Math.max(fillW, barH), barH, 8);
    ctx.fillStyle = COLORS.secondary;
    ctx.fill();

    // Glow
    ctx.shadowColor = `${COLORS.secondary}80`;
    ctx.shadowBlur = 8;
    roundRect(ctx, barX, barY, Math.max(fillW, barH), barH, 8);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  // Overlay XP label (centered inside bar)
  ctx.font = "bold 10px Nunito, sans-serif";
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;
  ctx.fillText(`${data.xp} / ${data.xpNext} XP`, barX + barW / 2, barY + barH / 2);
  ctx.restore();

  // --- Stats section ---
  const statsY = profileY + avatarSize + 26;
  const cardGap = 10;
  const totalGap = cardGap * 3;
  const cardW = (W - 80 - totalGap) / 4;
  const cardH = 80;

  const stats = [
    { emoji: "\u{1F525}", label: "Ofensiva", value: `${data.streak} dias`, color: COLORS.warning },
    { emoji: "⭐", label: "Estrelas", value: `${data.stars}`, color: COLORS.warning },
    { emoji: "✅", label: "Lições", value: `${data.lessons}`, color: COLORS.primary },
    { emoji: "\u{1F3C6}", label: "Troféus", value: `${data.trophies}/${data.trophiesTotal}`, color: COLORS.secondary },
  ];

  stats.forEach((stat, i) => {
    const cx = 40 + (cardW + cardGap) * i;

    // Card background
    roundRect(ctx, cx, statsY, cardW, cardH, 12);
    ctx.fillStyle = COLORS.bgSurface;
    ctx.fill();

    // Card border
    roundRect(ctx, cx, statsY, cardW, cardH, 12);
    ctx.strokeStyle = COLORS.bgElevated;
    ctx.lineWidth = 1;
    ctx.stroke();

    const cardCx = cx + cardW / 2;

    // Icon
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 1.0;
    ctx.fillText(stat.emoji, cardCx, statsY + 10);
    ctx.globalAlpha = 1.0;

    // Value
    ctx.font = "bold 20px Fredoka, sans-serif";
    ctx.fillStyle = COLORS.text;
    ctx.fillText(stat.value, cardCx, statsY + 36);

    // Label
    ctx.font = "12px Nunito, sans-serif";
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText(stat.label, cardCx, statsY + 60);
  });

  // --- Mastery section ---
  const masteryY = statsY + cardH + 20;

  if (hasMastery && data.mastery!.length > 0) {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "bold 14px Fredoka, sans-serif";
    ctx.fillStyle = COLORS.text;
    ctx.fillText("Domínio por Módulo", 40, masteryY);

    const masteryStartY = masteryY + 22;
    const colW = (W - 80 - 16) / 2;
    const rowH = 32;

    data.mastery!.forEach((mod, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const mx = 40 + col * (colW + 16);
      const my = masteryStartY + row * (rowH + 4);

      // Module title (truncated)
      ctx.font = "12px Nunito, sans-serif";
      ctx.fillStyle = COLORS.text;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const label = mod.title.length > 18 ? mod.title.slice(0, 17) + "…" : mod.title;
      ctx.fillText(label, mx, my);

      // Stars count
      const mColor = MASTERY_COLORS[mod.masteryColor] ?? COLORS.textMuted;
      ctx.font = "10px Nunito, sans-serif";
      ctx.fillStyle = COLORS.textMuted;
      ctx.textAlign = "right";
      ctx.fillText(`★ ${mod.earnedStars}/${mod.maxStars}`, mx + colW, my + 1);

      // Mini progress bar
      const miniBarY = my + 18;
      const miniBarW = colW;
      const miniBarH = 6;
      const pct = mod.maxStars === 0 ? 0 : mod.earnedStars / mod.maxStars;

      roundRect(ctx, mx, miniBarY, miniBarW, miniBarH, 3);
      ctx.fillStyle = COLORS.bgElevated;
      ctx.fill();

      if (pct > 0) {
        const mFillW = Math.max(miniBarH, pct * miniBarW);
        roundRect(ctx, mx, miniBarY, mFillW, miniBarH, 3);
        ctx.fillStyle = mColor;
        ctx.fill();
      }
    });
  }

  // --- Bottom branding ---
  drawLogoMark(ctx, W / 2 - 52, H - 22, 14);

  ctx.font = "bold 15px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const brandGrad = ctx.createLinearGradient(W / 2 - 40, H - 22, W / 2 + 40, H - 22);
  brandGrad.addColorStop(0, COLORS.primary);
  brandGrad.addColorStop(1, COLORS.secondary);
  ctx.fillStyle = brandGrad;
  ctx.fillText("CodeQuest", W / 2 + 2, H - 22);

  return canvas;
}

export async function shareProgressCard(data: ShareCardData): Promise<void> {
  const canvas = generateShareCard(data);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png"),
  );

  if (navigator.share && navigator.canShare?.({ files: [new File([blob], "f.png")] })) {
    const file = new File([blob], "codequest-progresso.png", { type: "image/png" });
    await navigator.share({ files: [file], title: "Meu progresso no CodeQuest" });
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "codequest-progresso.png";
  a.click();
  URL.revokeObjectURL(url);
}
