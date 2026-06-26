import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { SRS_INTERVALS_DAYS } from '../hooks/srsCore';
import { getPhraseDaily } from '../utils/phraseProgress';

interface Props {
  onOpenSRS: () => void;
  onOpenPhrase?: () => void;
  onStartLesson?: () => void;
}

const PHRASE_TARGET = 5;
const CHUNK_TARGET = 10;

/**
 * 今日完成清单（Kazu 法：按「完成量」打卡，不按时间；听说读写螺旋同步）。
 */
export function DailyRoutinePanel({ onOpenSRS, onOpenPhrase }: Props) {
  const { language } = useLanguage();
  const { dueItems, items, newToday } = useLanguageSRS();
  const phraseToday = getPhraseDaily(language.storagePrefix);

  const phraseDone = phraseToday >= PHRASE_TARGET;
  const chunkDone = newToday.length >= CHUNK_TARGET;
  const reviewDone = dueItems.length === 0 && items.length > 0;

  return (
    <section className="daily-routine">
      <h3>✅ 今日完成清单</h3>
      <p className="daily-subtitle">Kazu 法：听 → 说 → 读 → 写 螺旋同步 · 按「完成量」打卡，不看时间，先别只背单词</p>
      <div className="daily-grid">
        <div className={`daily-item ${phraseDone ? 'daily-done' : ''}`}>
          <span className="daily-check">{phraseDone ? '✓' : '○'}</span>
          <strong>💬 开口短句</strong>
          <p>
            今日 <em>{phraseToday}</em> / {PHRASE_TARGET} 句 · 听原音→模仿→录音对比
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenPhrase}>
            去练短句
          </button>
        </div>
        <div className={`daily-item ${reviewDone ? 'daily-done' : ''}`}>
          <span className="daily-check">{reviewDone ? '✓' : '○'}</span>
          <strong>🔁 间隔复习</strong>
          <p>
            到期 <em>{dueItems.length}</em> 条 · 库中 {items.length} 条
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenSRS}>
            {dueItems.length > 0 ? '开始复习' : '打开 SRS 库'}
          </button>
        </div>
        <div className={`daily-item ${chunkDone ? 'daily-done' : ''}`}>
          <span className="daily-check">{chunkDone ? '✓' : '○'}</span>
          <strong>📦 新语块</strong>
          <p>
            今日新增 <em>{newToday.length}</em> / {CHUNK_TARGET}+ 个整句
          </p>
          <p className="daily-hint">↓ 在下方课程中完成「语块学习」</p>
        </div>
        <div className="daily-item">
          <span className="daily-check">○</span>
          <strong>👥 跟读 + 归纳</strong>
          <p>跟读模仿语调 · 从短句归纳语法</p>
          <p className="daily-hint">↓ 课程中「影子跟读」「语法归纳」步骤</p>
        </div>
      </div>
      <p className="daily-srs-note">
        SRS 复习间隔：第 {SRS_INTERVALS_DAYS.join(' / ')} 天（艾宾浩斯遗忘曲线）
      </p>
    </section>
  );
}
