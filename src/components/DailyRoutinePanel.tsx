import { useSRS } from '../hooks/useSRS';
import { SRS_INTERVALS_DAYS } from '../hooks/srsCore';

interface Props {
  onOpenSRS: () => void;
  onStartLesson?: () => void;
}

/** 每日 20 分钟学习组合：SRS + 语块 + 影子跟读 + 费曼 */
export function DailyRoutinePanel({ onOpenSRS }: Props) {
  const { dueItems, items, newToday } = useSRS();

  return (
    <section className="daily-routine">
      <h3>⏱ 今日 20 分钟（推荐组合）</h3>
      <p className="daily-subtitle">听 → 说 → 读 → 写 · 不要只背单词</p>
      <div className="daily-grid">
        <div className="daily-item">
          <span className="daily-min">5 分钟</span>
          <strong>🔁 间隔重复</strong>
          <p>
            到期 <em>{dueItems.length}</em> 条 · 库中共 {items.length} 条
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenSRS}>
            {dueItems.length > 0 ? '开始复习' : '打开 SRS 库'}
          </button>
        </div>
        <div className="daily-item">
          <span className="daily-min">5 分钟</span>
          <strong>📦 新语块</strong>
          <p>今天新加入 {newToday.length} 条 · 每天 10–15 个整句</p>
          <p className="daily-hint">↓ 在下方课程中完成「语块学习」</p>
        </div>
        <div className="daily-item">
          <span className="daily-min">5 分钟</span>
          <strong>👥 影子跟读</strong>
          <p>播放 → 同时跟读 → 模仿语调</p>
          <p className="daily-hint">↓ 课程中「影子跟读」步骤</p>
        </div>
        <div className="daily-item">
          <span className="daily-min">5 分钟</span>
          <strong>🧠 费曼 + 场景</strong>
          <p>用中文解释语法 + 描述周围事物</p>
          <p className="daily-hint">↓ 课程中「费曼」「场景联想」</p>
        </div>
      </div>
      <p className="daily-srs-note">
        SRS 复习间隔：第 {SRS_INTERVALS_DAYS.join(' / ')} 天（艾宾浩斯遗忘曲线）
      </p>
    </section>
  );
}
