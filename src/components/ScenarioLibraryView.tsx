import { useMemo, useState } from 'react';
import {
  SCENARIO_CATEGORIES,
  countScenarioPhrasesForPack,
  getAllPhrasesFromProfession,
  getAllPhrasesFromScenario,
} from '../data/languages';
import { useLanguage } from '../context/LanguageContext';
import type { LifeScenario, ProfessionPack, ScenarioPhrase, ScenarioSection } from '../data/scenarios/types';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { ReadingDialogueBlock } from './ReadingDialogueBlock';
import { TutorialBlock } from './TutorialBlock';
type MainTab = 'life' | 'profession';
type LifeFilter = 'all' | 'universal' | 'medical' | 'finance' | 'government' | 'daily';
type ProfFilter = 'all' | 'spainCommon';

function PhraseRow({
  phrase,
  onAdd,
  onSpeak,
}: {
  phrase: ScenarioPhrase;
  onAdd: (p: ScenarioPhrase) => void;
  onSpeak: (text: string) => void;
}) {
  return (
    <li className="scenario-phrase-row">
      <div className="scenario-phrase-text">
        {phrase.chunkLabel && <span className="chunk-label">{phrase.chunkLabel}</span>}
        <p className="chunk-es">{phrase.es}</p>
        <p className="chunk-zh">{phrase.zh}</p>
        {phrase.note && <p className="chunk-note">{phrase.note}</p>}
      </div>
      <div className="scenario-phrase-actions">
        <button type="button" className="btn-icon" onClick={() => onSpeak(phrase.es)} title="朗读">
          🔊
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onAdd(phrase)}>
          + SRS
        </button>
      </div>
    </li>
  );
}

function SectionBlock({
  section,
  onAddPhrase,
  onAddSection,
  onSpeak,
}: {
  section: ScenarioSection;
  onAddPhrase: (p: ScenarioPhrase) => void;
  onAddSection: (phrases: ScenarioPhrase[], label: string) => void;
  onSpeak: (text: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="scenario-section-block">
      <button type="button" className="scenario-section-header" onClick={() => setOpen((v) => !v)}>
        <span>{open ? '▼' : '▶'}</span>
        <strong>{section.title}</strong>
        <span className="scenario-section-count">{section.phrases.length} 句</span>
      </button>
      {open && (
        <>
          {section.description && <p className="scenario-section-desc">{section.description}</p>}
          {section.vocab && section.vocab.length > 0 && (
            <div className="scenario-vocab-grid">
              {section.vocab.map((v) => (
                <span key={v.es} className="scenario-vocab-chip" title={v.note}>
                  <strong>{v.es}</strong> {v.zh}
                </span>
              ))}
            </div>
          )}
          <ul className="scenario-phrase-list">
            {section.phrases.map((p) => (
              <PhraseRow key={p.es} phrase={p} onAdd={onAddPhrase} onSpeak={onSpeak} />
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onAddSection(section.phrases, section.title)}
          >
            本节全部加入 SRS
          </button>
        </>
      )}
    </div>
  );
}

function LifeDetail({
  scenario,
  onBack,
  onSpeak,
}: {
  scenario: LifeScenario;
  onBack: () => void;
  onSpeak: (text: string) => void;
}) {
  const { addMany } = useLanguageSRS();
  const totalPhrases = getAllPhrasesFromScenario(scenario).length;

  const addPhrase = (p: ScenarioPhrase) => {
    addMany([{ es: p.es, zh: p.zh, note: p.note, kind: 'scenario' }], scenario.title);
  };

  const addSection = (phrases: ScenarioPhrase[], label: string) => {
    addMany(
      phrases.map((p) => ({ es: p.es, zh: p.zh, note: p.note, kind: 'scenario' as const })),
      `${scenario.title} · ${label}`,
    );
  };

  const addAll = () => {
    addMany(
      getAllPhrasesFromScenario(scenario).map((p) => ({
        es: p.es,
        zh: p.zh,
        note: p.note,
        kind: 'scenario' as const,
      })),
      scenario.title,
    );
  };

  return (
    <div className="scenario-detail">
      <button type="button" className="btn btn-secondary btn-sm scenario-back" onClick={onBack}>
        ← 返回列表
      </button>
      <header className="scenario-detail-header">
        <span className="scenario-detail-icon">{scenario.icon}</span>
        <div>
          <h2>{scenario.title}</h2>
          <p>{scenario.description}</p>
          <p className="scenario-meta">
            等级 {scenario.level} · {scenario.sections.length} 个情境 · {totalPhrases} 句
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={addAll}>
          全部加入 SRS
        </button>
      </header>
      {scenario.sections.map((sec) => (
        <SectionBlock
          key={sec.id}
          section={sec}
          onAddPhrase={addPhrase}
          onAddSection={addSection}
          onSpeak={onSpeak}
        />
      ))}
    </div>
  );
}

function ProfessionDetail({
  profession,
  onBack,
  onSpeak,
}: {
  profession: ProfessionPack;
  onBack: () => void;
  onSpeak: (text: string) => void;
}) {
  const { addMany } = useLanguageSRS();
  const totalPhrases = getAllPhrasesFromProfession(profession).length;

  const addPhrase = (p: ScenarioPhrase) => {
    addMany([{ es: p.es, zh: p.zh, note: p.note, kind: 'chunk' }], profession.title);
  };

  const addSection = (phrases: ScenarioPhrase[], label: string) => {
    addMany(
      phrases.map((p) => ({ es: p.es, zh: p.zh, note: p.note, kind: 'chunk' as const })),
      `${profession.title} · ${label}`,
    );
  };

  const addVocab = () => {
    addMany(
      profession.coreVocab.map((v) => ({
        es: v.es,
        zh: v.zh,
        note: v.note,
        kind: 'word' as const,
      })),
      `${profession.title} · 核心词汇`,
    );
  };

  return (
    <div className="scenario-detail">
      <button type="button" className="btn btn-secondary btn-sm scenario-back" onClick={onBack}>
        ← 返回列表
      </button>
      <header className="scenario-detail-header">
        <span className="scenario-detail-icon">{profession.icon}</span>
        <div>
          <h2>{profession.title}</h2>
          <p>{profession.description}</p>
          <p className="scenario-meta">
            {profession.industry} · 等级 {profession.level} · {totalPhrases} 句
            {profession.tutorials?.length ? ` · ${profession.tutorials.length} 步教程` : ''}
            {profession.readingDialogues?.length ? ` · ${profession.readingDialogues.length} 篇课文` : ''}
          </p>
        </div>
      </header>

      <div className="scenario-section-block">
        <h3>核心词汇（{profession.coreVocab.length}）</h3>
        <div className="scenario-vocab-grid">
          {profession.coreVocab.map((v) => (
            <span key={v.es} className="scenario-vocab-chip" title={v.note}>
              <strong>{v.es}</strong> {v.zh}
            </span>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addVocab}>
          词汇加入 SRS
        </button>
      </div>

      {profession.tutorials && profession.tutorials.length > 0 && (
        <TutorialBlock steps={profession.tutorials} onSpeak={onSpeak} />
      )}

      {profession.readingDialogues?.map((d) => (
        <ReadingDialogueBlock key={d.id} dialogue={d} onSpeak={onSpeak} />
      ))}

      {profession.sections.map((sec) => (
        <SectionBlock
          key={sec.id}
          section={sec}
          onAddPhrase={addPhrase}
          onAddSection={addSection}
          onSpeak={onSpeak}
        />
      ))}
    </div>
  );
}

export function ScenarioLibraryView() {
  const { pack, speak } = useLanguage();
  const LIFE_SCENARIOS = pack.lifeScenarios;
  const PROFESSION_PACKS = pack.professionPacks;
  const commonCount = PROFESSION_PACKS.filter((p) => p.spainCommon).length;
  const phraseTotal = countScenarioPhrasesForPack(pack);
  const [mainTab, setMainTab] = useState<MainTab>('profession');
  const [lifeFilter, setLifeFilter] = useState<LifeFilter>('all');
  const [profFilter, setProfFilter] = useState<ProfFilter>(
    () => (PROFESSION_PACKS.some((p) => p.spainCommon) ? 'spainCommon' : 'all'),
  );
  const [selectedLife, setSelectedLife] = useState<string | null>(null);
  const [selectedProf, setSelectedProf] = useState<string | null>(null);

  const filteredLife = useMemo(() => {
    if (lifeFilter === 'all') return LIFE_SCENARIOS;
    return LIFE_SCENARIOS.filter((s) => s.category === lifeFilter);
  }, [lifeFilter]);

  const filteredProf = useMemo(() => {
    if (profFilter === 'all') return PROFESSION_PACKS;
    return PROFESSION_PACKS.filter((p) => p.spainCommon);
  }, [profFilter]);

  const lifeDetail = selectedLife ? LIFE_SCENARIOS.find((s) => s.id === selectedLife) : null;
  const profDetail = selectedProf ? PROFESSION_PACKS.find((p) => p.id === selectedProf) : null;

  if (lifeDetail) {
    return <LifeDetail scenario={lifeDetail} onBack={() => setSelectedLife(null)} onSpeak={speak} />;
  }
  if (profDetail) {
    return (
      <ProfessionDetail profession={profDetail} onBack={() => setSelectedProf(null)} onSpeak={speak} />
    );
  }

  return (
    <div className="scenario-library">
      <header className="scenario-library-hero">
        <h2>🌍 场景生活 & 行业西语</h2>
        <p>
          背句子 + 背语块，不是孤立背单词。覆盖医院、银行、政务及 {PROFESSION_PACKS.length}{' '}
          个行业{commonCount > 0 ? `（其中 ${commonCount} 个为西班牙常见）` : ''}，共 {phraseTotal}{' '}
          句实用表达。
        </p>
        <p className="scenario-library-tip">
          口诀：听 → 说 → 读 → 写 · 点击 🔊 朗读 · 一键加入间隔重复（SRS）
        </p>
      </header>

      <div className="scenario-main-tabs">
        <button
          type="button"
          className={`scenario-main-tab ${mainTab === 'life' ? 'active' : ''}`}
          onClick={() => setMainTab('life')}
        >
          🏥 生活场景 ({LIFE_SCENARIOS.length})
        </button>
        <button
          type="button"
          className={`scenario-main-tab ${mainTab === 'profession' ? 'active' : ''}`}
          onClick={() => setMainTab('profession')}
        >
          💼 行业西语 ({PROFESSION_PACKS.length})
        </button>
      </div>

      {mainTab === 'life' && (
        <>
          <div className="scenario-filters">
            <button
              type="button"
              className={`scenario-filter ${lifeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setLifeFilter('all')}
            >
              全部
            </button>
            {SCENARIO_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`scenario-filter ${lifeFilter === c.id ? 'active' : ''}`}
                onClick={() => setLifeFilter(c.id as LifeFilter)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <div className="scenario-card-grid">
            {filteredLife.map((s) => {
              const phraseCount = getAllPhrasesFromScenario(s).length;
              return (
                <button
                  key={s.id}
                  type="button"
                  className="scenario-card"
                  onClick={() => setSelectedLife(s.id)}
                >
                  <span className="scenario-card-icon">{s.icon}</span>
                  <strong>{s.title}</strong>
                  <span className="scenario-card-meta">
                    {s.level} · {phraseCount} 句 · {s.sections.length} 情境
                  </span>
                  <p>{s.description}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {mainTab === 'profession' && (
        <>
          <div className="scenario-filters">
            <button
              type="button"
              className={`scenario-filter ${profFilter === 'spainCommon' ? 'active' : ''}`}
              onClick={() => setProfFilter('spainCommon')}
            >
              🇪🇸 西班牙常见 ({commonCount || PROFESSION_PACKS.length})
            </button>
            <button
              type="button"
              className={`scenario-filter ${profFilter === 'all' ? 'active' : ''}`}
              onClick={() => setProfFilter('all')}
            >
              全部行业 ({PROFESSION_PACKS.length})
            </button>
          </div>
          <div className="scenario-card-grid">
            {filteredProf.map((p) => {
              const phraseCount = getAllPhrasesFromProfession(p).length;
              const extras = [
                p.tutorials?.length ? `${p.tutorials.length} 步教程` : '',
                p.readingDialogues?.length ? `${p.readingDialogues.length} 课文` : '',
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`scenario-card scenario-card-prof ${p.spainCommon ? 'scenario-card-common' : ''}`}
                  onClick={() => setSelectedProf(p.id)}
                >
                  {p.spainCommon && <span className="scenario-common-badge">常见</span>}
                  <span className="scenario-card-icon">{p.icon}</span>
                  <strong>{p.title}</strong>
                  <span className="scenario-card-meta">
                    {p.industry} · {p.level} · {phraseCount} 句{extras ? ` · ${extras}` : ''}
                  </span>
                  <p>{p.description}</p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
