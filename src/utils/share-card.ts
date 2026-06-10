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
};

interface ShareCardData {
  name: string;
  avatar: string;
  level: number;
  title: string;
  xp: number;
  streak: number;
  stars: number;
  lessons: number;
  trophies: number;
  trophiesTotal: number;
}

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

export function generateShareCard(data: ShareCardData): HTMLCanvasElement {
  const W = 640;
  const H = 340;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.fillStyle = "#0F0F1A";
  ctx.fill();

  // Inner border
  roundRect(ctx, 1, 1, W - 2, H - 2, 19);
  ctx.strokeStyle = "rgba(37, 37, 66, 0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top accent line
  const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
  grad.addColorStop(0, "rgba(0, 212, 170, 0)");
  grad.addColorStop(0.3, "rgba(0, 212, 170, 0.6)");
  grad.addColorStop(0.7, "rgba(124, 92, 252, 0.6)");
  grad.addColorStop(1, "rgba(124, 92, 252, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(40, 0, W - 80, 2);

  // Avatar circle
  const avatarX = 80;
  const avatarY = 100;
  const avatarR = 42;

  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR + 3, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 212, 170, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
  ctx.fillStyle = "#1A1A2E";
  ctx.fill();

  const emoji = AVATAR_EMOJIS[data.avatar] ?? "\u{1F916}";
  ctx.font = "40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, avatarX, avatarY + 2);

  // Name
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 28px Fredoka, sans-serif";
  ctx.fillStyle = "#E8E8F0";
  ctx.fillText(data.name, 140, 68);

  // Level & title
  ctx.font = "16px Nunito, sans-serif";
  ctx.fillStyle = "#A0AEC0";
  ctx.fillText(`Nível ${data.level} · ${data.title}`, 140, 104);

  // XP bar background
  const barX = 140;
  const barY = 132;
  const barW = W - 180;
  const barH = 8;
  roundRect(ctx, barX, barY, barW, barH, 4);
  ctx.fillStyle = "#252542";
  ctx.fill();

  // XP bar fill
  const fill = Math.min((data.xp / 2000) * barW, barW);
  if (fill > 0) {
    roundRect(ctx, barX, barY, fill, barH, 4);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + fill, 0);
    barGrad.addColorStop(0, "#7C5CFC");
    barGrad.addColorStop(1, "#00D4AA");
    ctx.fillStyle = barGrad;
    ctx.fill();
  }

  // XP label
  ctx.font = "bold 11px Nunito, sans-serif";
  ctx.fillStyle = "#7C5CFC";
  ctx.textAlign = "right";
  ctx.fillText(`${data.xp} XP`, barX + barW, barY - 6);

  // Divider
  ctx.fillStyle = "rgba(37, 37, 66, 0.6)";
  ctx.fillRect(40, 170, W - 80, 1);

  // Stats
  const stats = [
    { emoji: "\u{1F525}", label: "Ofensiva", value: `${data.streak}` },
    { emoji: "⭐", label: "Estrelas", value: `${data.stars}` },
    { emoji: "✅", label: "Lições", value: `${data.lessons}` },
    { emoji: "\u{1F3C6}", label: "Troféus", value: `${data.trophies}/${data.trophiesTotal}` },
  ];

  const statY = 195;
  const statW = (W - 80) / stats.length;

  stats.forEach((stat, i) => {
    const cx = 40 + statW * i + statW / 2;

    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(stat.emoji, cx, statY);

    ctx.font = "bold 22px Fredoka, sans-serif";
    ctx.fillStyle = "#E8E8F0";
    ctx.fillText(stat.value, cx, statY + 36);

    ctx.font = "13px Nunito, sans-serif";
    ctx.fillStyle = "#A0AEC0";
    ctx.fillText(stat.label, cx, statY + 62);
  });

  // Bottom branding
  ctx.font = "bold 14px Fredoka, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0, 212, 170, 0.5)";
  ctx.fillText("CodeQuest", W / 2, H - 24);

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
