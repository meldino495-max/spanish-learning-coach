import type { CefrLevel } from './types';

export interface ChunkEntry {
  es: string;
  zh: string;
  note?: string;
  /** 语块标签，如「tener + 状态」 */
  chunkLabel?: string;
}

/** 高频语块：整句记忆，不是孤立单词 */
export const CORE_CHUNKS: ChunkEntry[] = [
  { es: 'Tengo hambre.', zh: '我饿了。', note: 'tener + 状态，不用 ser', chunkLabel: 'tener hambre' },
  { es: 'Tengo sed.', zh: '我渴了。', chunkLabel: 'tener sed' },
  { es: 'Tengo sueño.', zh: '我困了。', chunkLabel: 'tener sueño' },
  { es: 'Tengo prisa.', zh: '我赶时间。', chunkLabel: 'tener prisa' },
  { es: 'Quiero comer algo.', zh: '我想吃点东西。', chunkLabel: 'querer + inf' },
  { es: '¿Me das agua, por favor?', zh: '请给我点水好吗？', chunkLabel: '请求' },
  { es: 'Mucho gusto.', zh: '很高兴认识你。', chunkLabel: '问候' },
  { es: '¿Cómo te llamas?', zh: '你叫什么名字？', chunkLabel: '介绍' },
  { es: 'Me llamo...', zh: '我叫……', chunkLabel: '介绍' },
  { es: 'Soy de China.', zh: '我来自中国。', note: 'ser + 来源', chunkLabel: 'ser de' },
  { es: 'Vivo en Madrid.', zh: '我住在马德里。', chunkLabel: 'vivir en' },
  { es: '¿Qué hora es?', zh: '几点了？', chunkLabel: '时间' },
  { es: 'Son las tres.', zh: '三点钟。', chunkLabel: '时间' },
  { es: 'Hoy hace calor.', zh: '今天很热。', chunkLabel: 'hace + 天气' },
  { es: 'Hoy hace frío.', zh: '今天很冷。', chunkLabel: 'hace + 天气' },
  { es: 'Estoy cansado/a.', zh: '我累了。', note: 'estar + 状态', chunkLabel: 'estar + adj' },
  { es: 'Me gusta mucho.', zh: '我很喜欢。', chunkLabel: 'gustar' },
  { es: 'No me gusta nada.', zh: '我一点也不喜欢。', chunkLabel: 'gustar' },
  { es: '¿Cuánto cuesta?', zh: '多少钱？', chunkLabel: '购物' },
  { es: '¿Dónde está...?', zh: '……在哪里？', chunkLabel: '问路' },
  { es: 'A la derecha.', zh: '往右。', chunkLabel: '指路' },
  { es: 'Todo recto.', zh: '直走。', chunkLabel: '指路' },
  { es: 'No entiendo.', zh: '我不懂。', chunkLabel: '沟通' },
  { es: '¿Puedes repetir?', zh: '你能重复一遍吗？', chunkLabel: '沟通' },
  { es: 'Más despacio, por favor.', zh: '请说慢一点。', chunkLabel: '沟通' },
  { es: 'Un momento, por favor.', zh: '请稍等。', chunkLabel: '礼貌' },
  { es: 'De nada.', zh: '不客气。', chunkLabel: '礼貌' },
  { es: 'Lo siento.', zh: '对不起。', chunkLabel: '礼貌' },
  { es: 'No pasa nada.', zh: '没关系。', chunkLabel: '安慰' },
  { es: '¡Qué pena!', zh: '真可惜！', chunkLabel: '情感' },
  { es: 'Estoy de acuerdo.', zh: '我同意。', chunkLabel: '观点' },
  { es: 'No estoy de acuerdo.', zh: '我不同意。', chunkLabel: '观点' },
  { es: 'En mi opinión...', zh: '在我看来……', chunkLabel: '观点' },
  { es: 'Por cierto...', zh: '对了……', chunkLabel: '语篇标记' },
  { es: 'Por lo tanto...', zh: '因此……', chunkLabel: '连接' },
  { es: 'Sin embargo...', zh: '然而……', chunkLabel: '连接' },
  { es: 'Voy a + infinitivo.', zh: '我打算……', chunkLabel: 'ir a' },
  { es: 'Acabo de llegar.', zh: '我刚到。', chunkLabel: 'acabar de' },
  { es: 'Tengo que irme.', zh: '我得走了。', chunkLabel: 'tener que' },
  { es: 'Me da igual.', zh: '我无所谓。', chunkLabel: '习语' },
  { es: 'Tengo ganas de viajar.', zh: '我想旅行。', chunkLabel: 'tener ganas de' },
];

export const SCENARIO_PACKS: Record<
  string,
  { title: string; icon: string; chunks: ChunkEntry[] }
> = {
  supermarket: {
    title: '超市场景',
    icon: '🛒',
    chunks: [
      { es: '¿Dónde está la leche?', zh: '牛奶在哪里？' },
      { es: 'Necesito una bolsa.', zh: '我需要一个袋子。', chunkLabel: 'bolsa' },
      { es: '¿Cuánto cuesta en total?', zh: '一共多少钱？' },
      { es: '¿Aceptan tarjeta?', zh: '可以刷卡吗？' },
      { es: 'Está en oferta.', zh: '在打折。' },
      { es: 'Quiero dos kilos de manzanas.', zh: '我要两公斤苹果。' },
    ],
  },
  cafe: {
    title: '咖啡馆场景',
    icon: '☕',
    chunks: [
      { es: 'Un café con leche, por favor.', zh: '请给我一杯牛奶咖啡。' },
      { es: 'Para llevar.', zh: '带走。', chunkLabel: 'para llevar' },
      { es: '¿Me trae la cuenta?', zh: '请结账。' },
      { es: 'Sin azúcar, gracias.', zh: '不要糖，谢谢。' },
      { es: 'Está muy bueno.', zh: '很好喝。' },
      { es: '¿Tienen wifi?', zh: '有 wifi 吗？' },
    ],
  },
  metro: {
    title: '地铁/出行场景',
    icon: '🚇',
    chunks: [
      { es: '¿Dónde compro el billete?', zh: '在哪买票？', chunkLabel: 'billete' },
      { es: 'Un billete de ida y vuelta.', zh: '往返票。' },
      { es: '¿Qué línea va al centro?', zh: '哪条线去市中心？' },
      { es: 'La estación de salida.', zh: '出站口。', chunkLabel: 'salida' },
      { es: 'He perdido el metro.', zh: '我错过地铁了。' },
      { es: '¿A qué hora sale el próximo tren?', zh: '下一班车几点？' },
    ],
  },
  home: {
    title: '描述周围（西语思维）',
    icon: '🏠',
    chunks: [
      { es: 'Es mi ordenador.', zh: '这是我的电脑。', note: '看到物品就描述' },
      { es: 'La ventana está abierta.', zh: '窗户开着。' },
      { es: 'Hay mucha luz aquí.', zh: '这里光线很好。' },
      { es: 'El suelo está limpio.', zh: '地板很干净。' },
      { es: 'Hace buen tiempo hoy.', zh: '今天天气不错。' },
      { es: 'Estoy en casa.', zh: '我在家。' },
    ],
  },
};

export function pickChunksForTopic(
  _level: CefrLevel,
  unitIndex: number,
  examples: string[],
  count = 6,
): ChunkEntry[] {
  const fromExamples = examples.slice(0, 3).map((es) => ({
    es,
    zh: '（本课例句，请对照语法理解）',
    note: '情景联想：想象你在什么场合说这句话',
  }));

  const coreStart = (unitIndex * 4) % CORE_CHUNKS.length;
  const fromCore = CORE_CHUNKS.slice(coreStart, coreStart + count - fromExamples.length);

  const scenarioKeys = Object.keys(SCENARIO_PACKS);
  const scenario = SCENARIO_PACKS[scenarioKeys[unitIndex % scenarioKeys.length]];
  const fromScenario = scenario.chunks.slice(0, 2);

  return [...fromExamples, ...fromCore, ...fromScenario].slice(0, count + 2);
}

export function getScenarioForUnit(unitIndex: number) {
  const keys = Object.keys(SCENARIO_PACKS);
  return SCENARIO_PACKS[keys[unitIndex % keys.length]];
}
