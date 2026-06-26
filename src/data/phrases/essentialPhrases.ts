import type { LanguageId } from '../../languages/registry';
import type { LanguagePack } from '../languages/packTypes';
import type { ScenarioPhrase } from '../scenarios/types';

/**
 * Kazu 学习法第一步「实用短句库」的数据源。
 * 核心理念：初学不背单字，先把整句高频短句听母语者发音、张口模仿、录音对比，
 * 让短句对应到真实情境，快速建立听说基础与成就感。
 */
export interface PhrasePack {
  id: string;
  title: string;
  icon: string;
  /** 开口必备 / 核心包，置顶显示 */
  essential?: boolean;
  intro?: string;
  phrases: ScenarioPhrase[];
}

/** 开口必备 30 句：Kazu 建议初学第一步就要能张口说出来的生存短句 */
const ESSENTIAL_30: ScenarioPhrase[] = [
  { es: 'Hola.', zh: '你好。', chunkLabel: '问候' },
  { es: 'Buenos días.', zh: '早上好。', chunkLabel: '问候' },
  { es: 'Buenas tardes.', zh: '下午好。', chunkLabel: '问候' },
  { es: 'Buenas noches.', zh: '晚上好 / 晚安。', chunkLabel: '问候' },
  { es: 'Adiós.', zh: '再见。', chunkLabel: '告别' },
  { es: 'Hasta luego.', zh: '待会见。', chunkLabel: '告别' },
  { es: 'Por favor.', zh: '请。', chunkLabel: '礼貌' },
  { es: 'Gracias.', zh: '谢谢。', chunkLabel: '礼貌' },
  { es: 'Muchas gracias.', zh: '非常感谢。', chunkLabel: '礼貌' },
  { es: 'De nada.', zh: '不客气。', chunkLabel: '礼貌' },
  { es: 'Sí.', zh: '是。', chunkLabel: '基础' },
  { es: 'No.', zh: '不。', chunkLabel: '基础' },
  { es: 'Perdón.', zh: '不好意思 / 借过。', note: '引起注意或道歉', chunkLabel: '礼貌' },
  { es: 'Lo siento.', zh: '对不起。', chunkLabel: '礼貌' },
  { es: '¿Cómo estás?', zh: '你好吗？', chunkLabel: '寒暄' },
  { es: 'Muy bien, gracias.', zh: '很好，谢谢。', chunkLabel: '寒暄' },
  { es: '¿Cómo te llamas?', zh: '你叫什么名字？', chunkLabel: '介绍' },
  { es: 'Me llamo...', zh: '我叫……', note: '后接你的名字', chunkLabel: '介绍' },
  { es: 'Mucho gusto.', zh: '很高兴认识你。', chunkLabel: '介绍' },
  { es: '¿Hablas inglés?', zh: '你会说英语吗？', chunkLabel: '沟通' },
  { es: 'No entiendo.', zh: '我不明白。', chunkLabel: '沟通' },
  { es: '¿Puedes repetir, por favor?', zh: '能再说一遍吗？', chunkLabel: '沟通' },
  { es: 'Más despacio, por favor.', zh: '请说慢一点。', chunkLabel: '沟通' },
  { es: '¿Cuánto cuesta?', zh: '多少钱？', chunkLabel: '购物' },
  { es: '¿Dónde está el baño?', zh: '洗手间在哪里？', chunkLabel: '问路' },
  { es: 'La cuenta, por favor.', zh: '请结账。', chunkLabel: '餐厅' },
  { es: 'Quiero esto, por favor.', zh: '我要这个。', note: '配合手指指物', chunkLabel: '购物' },
  { es: '¿Qué hora es?', zh: '几点了？', chunkLabel: '时间' },
  { es: '¡Socorro!', zh: '救命！', chunkLabel: '应急' },
  { es: 'No pasa nada.', zh: '没关系。', chunkLabel: '安慰' },
];

const ES_PACKS: PhrasePack[] = [
  {
    id: 'essential',
    title: '开口必备 30 句',
    icon: '⭐',
    essential: true,
    intro: 'Kazu 法第一步：先别背单词。把这 30 句反复听母语者发音、张口模仿、录下来和原音对比，让每句话对应到真实情境。',
    phrases: ESSENTIAL_30,
  },
  {
    id: 'greet',
    title: '问候 & 自我介绍',
    icon: '👋',
    phrases: [
      { es: '¿Qué tal?', zh: '怎么样？（随意问候）', chunkLabel: '寒暄' },
      { es: '¿De dónde eres?', zh: '你是哪里人？', chunkLabel: '介绍' },
      { es: 'Soy de China.', zh: '我来自中国。', note: 'ser de + 地点', chunkLabel: '介绍' },
      { es: 'Encantado.', zh: '幸会。（男性说）', note: '女性说 Encantada', chunkLabel: '介绍' },
      { es: '¿A qué te dedicas?', zh: '你做什么工作？', chunkLabel: '介绍' },
      { es: 'Soy estudiante.', zh: '我是学生。', chunkLabel: '介绍' },
      { es: 'Hasta mañana.', zh: '明天见。', chunkLabel: '告别' },
      { es: 'Nos vemos.', zh: '回头见。', chunkLabel: '告别' },
      { es: 'Cuídate.', zh: '保重。', chunkLabel: '告别' },
    ],
  },
  {
    id: 'cafe',
    title: '点餐 & 咖啡馆',
    icon: '☕',
    phrases: [
      { es: 'Una mesa para dos, por favor.', zh: '两个人的桌子，谢谢。', chunkLabel: '餐厅' },
      { es: '¿Me trae la carta?', zh: '能给我菜单吗？', chunkLabel: '餐厅' },
      { es: 'Para mí, un café con leche.', zh: '我要一杯拿铁。', chunkLabel: '点餐' },
      { es: '¿Qué me recomienda?', zh: '您推荐什么？', chunkLabel: '点餐' },
      { es: 'Está muy rico.', zh: '很好吃。', chunkLabel: '评价' },
      { es: '¿Tienen algo vegetariano?', zh: '有素食吗？', chunkLabel: '点餐' },
      { es: '¿Se puede pagar con tarjeta?', zh: '可以刷卡吗？', chunkLabel: '付款' },
      { es: 'Quería reservar una mesa.', zh: '我想订一张桌子。', note: 'quería 比 quiero 更礼貌', chunkLabel: '预订' },
    ],
  },
  {
    id: 'directions',
    title: '问路 & 交通',
    icon: '🧭',
    phrases: [
      { es: '¿Cómo llego a...?', zh: '我怎么去……？', chunkLabel: '问路' },
      { es: '¿Está lejos?', zh: '远吗？', chunkLabel: '问路' },
      { es: 'Todo recto.', zh: '一直走。', chunkLabel: '指路' },
      { es: 'Gire a la derecha.', zh: '右转。', note: 'a la izquierda = 左转', chunkLabel: '指路' },
      { es: '¿Hay metro cerca?', zh: '附近有地铁吗？', chunkLabel: '交通' },
      { es: '¿Cuánto se tarda?', zh: '要多久？', chunkLabel: '交通' },
      { es: 'Un billete para..., por favor.', zh: '请给我一张去……的票。', chunkLabel: '交通' },
      { es: 'Estoy perdido.', zh: '我迷路了。', note: '女性说 perdida', chunkLabel: '应急' },
    ],
  },
  {
    id: 'shopping',
    title: '购物 & 付款',
    icon: '🛒',
    phrases: [
      { es: '¿Lo tiene en otra talla?', zh: '有别的尺码吗？', chunkLabel: '购物' },
      { es: '¿Puedo probármelo?', zh: '我可以试穿吗？', chunkLabel: '购物' },
      { es: 'Es muy caro.', zh: '太贵了。', chunkLabel: '购物' },
      { es: '¿Tiene descuento?', zh: '有折扣吗？', chunkLabel: '购物' },
      { es: 'Me lo llevo.', zh: '我要了。', chunkLabel: '购物' },
      { es: 'Solo estoy mirando, gracias.', zh: '我只是看看，谢谢。', chunkLabel: '购物' },
      { es: '¿Dónde está la caja?', zh: '收银台在哪？', chunkLabel: '购物' },
      { es: 'Quería devolver esto.', zh: '我想退这个。', chunkLabel: '售后' },
    ],
  },
  {
    id: 'emergency',
    title: '应急 & 求助',
    icon: '🆘',
    phrases: [
      { es: 'Necesito ayuda.', zh: '我需要帮助。', chunkLabel: '应急' },
      { es: 'Llame a la policía.', zh: '请报警。', chunkLabel: '应急' },
      { es: 'Llame a una ambulancia.', zh: '请叫救护车。', chunkLabel: '应急' },
      { es: 'Me encuentro mal.', zh: '我不舒服。', chunkLabel: '医疗' },
      { es: 'Me duele aquí.', zh: '我这里疼。', note: '配合指患处', chunkLabel: '医疗' },
      { es: 'He perdido el pasaporte.', zh: '我护照丢了。', chunkLabel: '应急' },
      { es: '¿Hay una farmacia cerca?', zh: '附近有药店吗？', chunkLabel: '医疗' },
      { es: 'Es una emergencia.', zh: '这是紧急情况。', chunkLabel: '应急' },
    ],
  },
  {
    id: 'smalltalk',
    title: '社交 & 表达观点',
    icon: '💬',
    phrases: [
      { es: '¿Qué te parece?', zh: '你觉得呢？', chunkLabel: '观点' },
      { es: 'Estoy de acuerdo.', zh: '我同意。', chunkLabel: '观点' },
      { es: 'No estoy de acuerdo.', zh: '我不同意。', chunkLabel: '观点' },
      { es: 'En mi opinión...', zh: '在我看来……', chunkLabel: '观点' },
      { es: 'Me parece interesante.', zh: '我觉得很有意思。', chunkLabel: '观点' },
      { es: 'Tienes razón.', zh: '你说得对。', chunkLabel: '观点' },
      { es: 'Depende.', zh: '看情况。', chunkLabel: '观点' },
      { es: '¡Qué bien!', zh: '太好了！', chunkLabel: '情感' },
    ],
  },
];

/**
 * 取得当前语言的短句包。
 * - 西班牙语：使用上面精心编排的 Kazu 风格短句包。
 * - 其他语言：从该语言包的 coreChunks / scenarioPacks 派生，保证多语言可用。
 */
export function getPhrasePacks(languageId: LanguageId, pack: LanguagePack): PhrasePack[] {
  if (languageId === 'es') return ES_PACKS;

  const packs: PhrasePack[] = [];
  if (pack.coreChunks?.length) {
    packs.push({
      id: 'core',
      title: '高频核心短句',
      icon: '⭐',
      essential: true,
      intro: 'Kazu 法第一步：先别背单词。反复听母语者发音、张口模仿、录音对比，让短句对应真实情境。',
      phrases: pack.coreChunks,
    });
  }
  for (const [key, sp] of Object.entries(pack.scenarioPacks ?? {})) {
    if (sp?.chunks?.length) {
      packs.push({ id: key, title: sp.title, icon: sp.icon, phrases: sp.chunks });
    }
  }
  return packs;
}
