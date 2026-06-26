import type { LanguageId } from '../../languages/registry';

/**
 * Kazu 学习法第二步「从短句归纳语法」：
 * 先看几个共享同一规律的真实短句（感觉理解），自己猜规律，再展示精炼规则（逻辑理解）。
 */
export interface InductionCard {
  id: string;
  title: string;
  hint: string;
  examples: { es: string; zh: string }[];
  rule: string;
}

const ES_CARDS: InductionCard[] = [
  {
    id: 'ser-estar',
    title: 'ser 还是 estar？',
    hint: '观察「是」用了哪个动词，分别在描述什么。',
    examples: [
      { es: 'Soy profesor.', zh: '我是老师。' },
      { es: 'Es muy alto.', zh: '他很高。' },
      { es: 'Estoy cansado.', zh: '我累了。' },
      { es: 'Está en casa.', zh: '他在家。' },
    ],
    rule: 'ser 用于身份/职业/本质特征；estar 用于状态/位置/暂时情况。累、在某处 → estar。',
  },
  {
    id: 'agreement',
    title: '名词的性与数',
    hint: '比较冠词、名词、形容词的词尾变化。',
    examples: [
      { es: 'el libro rojo', zh: '红色的书（阳·单）' },
      { es: 'la casa roja', zh: '红色的房子（阴·单）' },
      { es: 'los libros rojos', zh: '红色的书（阳·复）' },
      { es: 'las casas rojas', zh: '红色的房子（阴·复）' },
    ],
    rule: '冠词、名词、形容词的性（-o 阳/-a 阴）和数（复数 +s）要保持一致。',
  },
  {
    id: 'gustar',
    title: 'gustar（喜欢）怎么用',
    hint: '注意 gusta 与 gustan 何时切换，主语其实是什么。',
    examples: [
      { es: 'Me gusta el café.', zh: '我喜欢咖啡。' },
      { es: 'Me gustan los libros.', zh: '我喜欢书（复数）。' },
      { es: 'Te gusta bailar.', zh: '你喜欢跳舞。' },
    ],
    rule: 'gustar 用「间接宾语代词 + gusta(单)/gustan(复)」，被喜欢的事物才是主语，所以单复数跟着事物变。',
  },
  {
    id: 'ir-a-inf',
    title: '近期将来：ir a + 原形',
    hint: '找出共同结构：动词 + a + 另一个动词。',
    examples: [
      { es: 'Voy a comer.', zh: '我要去吃饭。' },
      { es: 'Vamos a viajar.', zh: '我们打算去旅行。' },
      { es: 'Va a llover.', zh: '要下雨了。' },
    ],
    rule: 'ir 的变位 + a + 动词原形 = 表示打算/即将做某事（近期将来时）。',
  },
  {
    id: 'questions',
    title: '疑问句的标志',
    hint: '看句子两端和疑问词上多了什么。',
    examples: [
      { es: '¿Cómo estás?', zh: '你好吗？' },
      { es: '¿Dónde vives?', zh: '你住哪？' },
      { es: '¿Qué quieres?', zh: '你想要什么？' },
    ],
    rule: '疑问句两端加 ¿ … ?；疑问词带重音符号（cómo, dónde, qué）以区别于关系词。',
  },
  {
    id: 'present-ar',
    title: '-ar 动词现在时变位',
    hint: '对照人称，看词尾怎么变。',
    examples: [
      { es: 'Yo hablo español.', zh: '我说西语。' },
      { es: 'Tú hablas rápido.', zh: '你说得快。' },
      { es: 'Ella habla bien.', zh: '她说得好。' },
      { es: 'Nosotros hablamos mucho.', zh: '我们说很多。' },
    ],
    rule: '-ar 动词去掉 -ar，按人称加 -o / -as / -a / -amos / -áis / -an。',
  },
];

export function getInductionCards(languageId: LanguageId): InductionCard[] {
  return languageId === 'es' ? ES_CARDS : [];
}
