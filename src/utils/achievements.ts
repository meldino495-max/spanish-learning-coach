/** 成就系统：根据学习数据计算徽章，鼓励坚持。全部基于本机数据，按语言隔离。 */

export interface AchStats {
  stepsDone: number;
  totalSteps: number;
  streak: number;
  srsTotal: number;
  srsMastered: number;
  totalActivity: number;
  phases: { id: string; level: string; title: string; done: boolean }[];
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  /** 达成条件描述 */
  desc: string;
  current: number;
  goal: number;
  unlocked: boolean;
  /** 鼓励语（解锁后展示） */
  cheer: string;
}

interface Tier {
  id: string;
  icon: string;
  title: string;
  goal: number;
  unit: string;
  cheer: string;
}

function tierAchievement(value: number, t: Tier): Achievement {
  return {
    id: t.id,
    icon: t.icon,
    title: t.title,
    desc: `${t.unit} 达到 ${t.goal}`,
    current: Math.min(value, t.goal),
    goal: t.goal,
    unlocked: value >= t.goal,
    cheer: t.cheer,
  };
}

export function buildAchievements(s: AchStats): Achievement[] {
  const list: Achievement[] = [];

  // 学习步骤
  const stepTiers: Tier[] = [
    { id: 'step-1', icon: '🌱', title: '启程', goal: 1, unit: '完成步骤', cheer: '万事开头难，你已经迈出第一步！' },
    { id: 'step-10', icon: '📗', title: '入门', goal: 10, unit: '完成步骤', cheer: '十步成习惯，保持下去！' },
    { id: 'step-50', icon: '📘', title: '稳步前进', goal: 50, unit: '完成步骤', cheer: '50 步！你已经很有节奏了。' },
    { id: 'step-100', icon: '📚', title: '百步穿杨', goal: 100, unit: '完成步骤', cheer: '一百步，了不起的坚持！' },
  ];
  stepTiers.forEach((t) => list.push(tierAchievement(s.stepsDone, t)));

  // 全课程
  if (s.totalSteps > 0) {
    list.push({
      id: 'course-complete',
      icon: '👑',
      title: '全课程通关',
      desc: `完成全部 ${s.totalSteps} 个步骤`,
      current: s.stepsDone,
      goal: s.totalSteps,
      unlocked: s.stepsDone >= s.totalSteps,
      cheer: '从零到全部完成——你做到了！',
    });
  }

  // 连续天数
  const streakTiers: Tier[] = [
    { id: 'streak-3', icon: '🔥', title: '三日不辍', goal: 3, unit: '连续学习', cheer: '连续 3 天，火苗已经点燃！' },
    { id: 'streak-7', icon: '🔥', title: '一周连胜', goal: 7, unit: '连续学习', cheer: '整整一周，习惯正在形成！' },
    { id: 'streak-14', icon: '⚡', title: '两周不断', goal: 14, unit: '连续学习', cheer: '14 天连续，自律满分！' },
    { id: 'streak-30', icon: '🏅', title: '月度坚持', goal: 30, unit: '连续学习', cheer: '一个月不间断，太强了！' },
    { id: 'streak-100', icon: '💎', title: '百日筑基', goal: 100, unit: '连续学习', cheer: '百日坚持，语言已融入生活！' },
  ];
  streakTiers.forEach((t) => list.push(tierAchievement(s.streak, t)));

  // 记忆库收集
  const srsTiers: Tier[] = [
    { id: 'srs-10', icon: '🗂️', title: '小有积累', goal: 10, unit: '记忆库语块', cheer: '收集了 10 条语料，词汇库开张！' },
    { id: 'srs-50', icon: '📦', title: '语料仓库', goal: 50, unit: '记忆库语块', cheer: '50 条！你的语料越来越丰富。' },
    { id: 'srs-100', icon: '🏛️', title: '语料殿堂', goal: 100, unit: '记忆库语块', cheer: '上百条语块，底子越来越厚！' },
    { id: 'srs-300', icon: '🌌', title: '词海泛舟', goal: 300, unit: '记忆库语块', cheer: '300 条！词汇量正在质变。' },
  ];
  srsTiers.forEach((t) => list.push(tierAchievement(s.srsTotal, t)));

  // 精通（记牢）
  const masterTiers: Tier[] = [
    { id: 'master-5', icon: '✨', title: '初见成效', goal: 5, unit: '精通语块', cheer: '5 条已牢记，复习有回报！' },
    { id: 'master-25', icon: '🌟', title: '记忆达人', goal: 25, unit: '精通语块', cheer: '25 条牢记于心，记忆力开挂！' },
    { id: 'master-100', icon: '🧠', title: '过目不忘', goal: 100, unit: '精通语块', cheer: '100 条精通，名副其实的记忆大师！' },
  ];
  masterTiers.forEach((t) => list.push(tierAchievement(s.srsMastered, t)));

  // 总活动量
  const actTiers: Tier[] = [
    { id: 'act-50', icon: '⏱️', title: '勤学', goal: 50, unit: '累计学习活动', cheer: '50 次练习，勤能补拙！' },
    { id: 'act-200', icon: '🚀', title: '苦练', goal: 200, unit: '累计学习活动', cheer: '200 次！进步看得见。' },
    { id: 'act-1000', icon: '🏆', title: '千锤百炼', goal: 1000, unit: '累计学习活动', cheer: '一千次练习，匠心独运！' },
  ];
  actTiers.forEach((t) => list.push(tierAchievement(s.totalActivity, t)));

  // 各阶段通关（按课程动态生成）
  s.phases.forEach((p, i) => {
    list.push({
      id: `phase-${p.id}`,
      icon: '🎖️',
      title: `${p.level} 阶段通关`,
      desc: `完成「阶段${i + 1} · ${p.title}」全部步骤`,
      current: p.done ? 1 : 0,
      goal: 1,
      unlocked: p.done,
      cheer: `${p.level} 阶段全部拿下，更上一层楼！`,
    });
  });

  return list;
}

/**
 * 同步已解锁成就并返回「本次新解锁」的（首次运行只建立基线、不弹）。
 */
export function syncAchievements(prefix: string, achievements: Achievement[]): Achievement[] {
  const key = `${prefix}-ach-seen-v1`;
  const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);
  let seen: string[] | null = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) seen = JSON.parse(raw) as string[];
  } catch {
    seen = null;
  }
  if (seen === null) {
    try {
      localStorage.setItem(key, JSON.stringify(unlockedIds));
    } catch {
      /* ignore */
    }
    return [];
  }
  const seenSet = new Set(seen);
  const newly = achievements.filter((a) => a.unlocked && !seenSet.has(a.id));
  if (newly.length > 0) {
    try {
      localStorage.setItem(key, JSON.stringify([...new Set([...seen, ...unlockedIds])]));
    } catch {
      /* ignore */
    }
  }
  return newly;
}
