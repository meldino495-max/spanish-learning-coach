import type { WeekPlan } from '../../types';

export const week03: WeekPlan = {
  id: 'w03',
  weekNum: 3,
  title: '宾语代词 & 反身动词',
  focus: 'lo/la/le/se 位置；me lavo / lavarme；让口语更地道',
  days: [
    {
      id: 'w03d1',
      dayLabel: '第1天',
      title: '直接宾语代词 lo/la/los/las',
      goal: '替换名词避免重复',
      steps: [
        {
          id: 'w03d1s1',
          type: 'video',
          session: 'micro',
          title: '观看：宾语代词入门',
          durationMin: 10,
          youtubeId: 'Pr239xOgLBg',
          youtubeTitle: 'Butterfly Spanish - Ser vs Estar (含代词示例)',
          instructions: '重点看代词部分；记录 lo/la 放在动词前还是后。',
        },
        {
          id: 'w03d1s2',
          type: 'practice',
          session: 'deep',
          title: '替换练习',
          durationMin: 15,
          instructions: '把斜体名词换成代词：\nCompro el libro → Lo compro\nVeo a María → La veo\n¿Tienes las llaves? → ¿Las tienes?',
        },
        {
          id: 'w03d1s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: '¿Lo has visto? No, no lo he visto. ¿La conoces? Sí, la conozco desde hace años.',
        },
        {
          id: 'w03d1s4',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我买它」？',
          quizOptions: [
            { text: 'Lo compro.', correct: true },
            { text: 'Compro lo.' },
            { text: 'Le compro.' },
          ],
        },
      ],
    },
    {
      id: 'w03d2',
      dayLabel: '第2天',
      title: '间接宾语 le / les',
      goal: '给某人做某事',
      steps: [
        {
          id: 'w03d2s1',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Le di el libro a Juan. Le escribí un mensaje a mi madre.',
        },
        {
          id: 'w03d2s2',
          type: 'practice',
          session: 'deep',
          title: '转换练习',
          instructions: 'Doy flores a Ana → Le doy flores a Ana / Le doy flores\nEscribo un email al jefe → ...',
        },
        {
          id: 'w03d2s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Le llamé ayer pero no me contestó. Le voy a escribir un mensaje mañana.',
        },
      ],
    },
    {
      id: 'w03d3',
      dayLabel: '第3天',
      title: '代词位置：前 vs 后',
      goal: '肯定命令/不定式/动名词中的位置',
      steps: [
        {
          id: 'w03d3s1',
          type: 'video',
          session: 'deep',
          durationMin: 12,
          youtubeId: '6dtwAn9MU00',
          instructions: '复习动词变位同时注意代词附着：dímelo, voy a comprarlo, estoy leyéndolo。',
        },
        {
          id: 'w03d3s2',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「请告诉我」？',
          quizOptions: [
            { text: 'Dímelo.', correct: true },
            { text: 'Me lo dice.' },
            { text: 'Lo me di.' },
          ],
        },
        {
          id: 'w03d3s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Voy a llamarte mañana. Estoy pensando en ello. ¡Dímelo cuando lo sepas!',
        },
      ],
    },
    {
      id: 'w03d4',
      dayLabel: '第4天',
      title: '反身动词',
      goal: 'me levanto, me ducho, me siento',
      steps: [
        {
          id: 'w03d4s1',
          type: 'practice',
          session: 'deep',
          title: '早晨 routine',
          instructions: '用 8 个反身动词描述你的一天开始：despertarse, levantarse, ducharse, vestirse, peinarse, desayunarse, irse, sentarse。',
        },
        {
          id: 'w03d4s2',
          type: 'speak',
          session: 'deep',
          speakPrompt:
            'Me despierto a las siete. Me ducho y me visto. Desayuno y me voy al trabajo. Por la noche me relajo y me acuesto temprano.',
        },
        {
          id: 'w03d4s3',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Me levanté tarde y no me duché. Me vestí rápido y salí.',
        },
      ],
    },
    {
      id: 'w03d5',
      dayLabel: '第5天',
      title: '综合口语',
      goal: '代词+过去时',
      steps: [
        {
          id: 'w03d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 10,
          speakPrompt:
            'Ayer compré un regalo para mi hermana. Se lo di ayer por la noche. Le encantó y me lo agradeció mucho.',
        },
        {
          id: 'w03d5s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'gxmv-WHi9Yk',
          instructions: '注意母语者怎么用 lo/la/le。列出 5 个例子。',
        },
        {
          id: 'w03d5s3',
          type: 'reflect',
          session: 'deep',
          instructions: '中文总结：代词你最容易错在哪里？写 3 条规则提醒自己。',
        },
      ],
    },
    {
      id: 'w03d6',
      dayLabel: '第6天',
      title: '轻量日',
      goal: '听力为主',
      steps: [
        {
          id: 'w03d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'Nt00P1Kp1Q4',
          durationMin: 15,
          instructions: '轻松观看。',
        },
        {
          id: 'w03d6s2',
          type: 'dictation',
          session: 'micro',
          dictationText: '¿Me lo puedes repetir? No te lo dije ayer.',
        },
      ],
    },
    {
      id: 'w03d7',
      dayLabel: '第7天',
      title: '第三周复习',
      goal: '代词综合',
      steps: [
        {
          id: 'w03d7s1',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我把它给她了」？',
          quizOptions: [
            { text: 'Se lo di.', correct: true },
            { text: 'Lo le di.' },
            { text: 'Le lo di.' },
          ],
          quizExplanation: 'le+lo → se lo（避免 le lo）',
        },
        {
          id: 'w03d7s2',
          type: 'practice',
          session: 'deep',
          title: '10 句翻译',
          instructions: '中译西：我起床了/我洗澡了/请告诉我/他看见了它/我给她写了信。',
        },
        {
          id: 'w03d7s3',
          type: 'link',
          session: 'deep',
          url: 'https://conjuguemos.com',
          urlLabel: '变位+代词复习',
          instructions: '额外练习 15 分钟。',
        },
      ],
    },
  ],
};

export const week04: WeekPlan = {
  id: 'w04',
  weekNum: 4,
  title: '将来时 & 条件式',
  focus: '表达计划、假设、礼貌请求',
  days: [
    {
      id: 'w04d1',
      dayLabel: '第1天',
      title: 'Futuro simple',
      goal: 'iré, hablarás, será',
      steps: [
        {
          id: 'w04d1s1',
          type: 'video',
          session: 'deep',
          youtubeId: '6dtwAn9MU00',
          instructions: '关注将来时变位：原形+词尾。记录 5 个例句。',
        },
        {
          id: 'w04d1s2',
          type: 'speak',
          session: 'deep',
          speakPrompt:
            'El año que viene viajaré a España. Estudiaré más y hablaré con más gente en español.',
        },
        {
          id: 'w04d1s3',
          type: 'quiz',
          session: 'micro',
          quizQuestion: '「我们会赢」？',
          quizOptions: [
            { text: 'Ganaremos.', correct: true },
            { text: 'Ganamos.' },
            { text: 'Ganábamos.' },
          ],
        },
      ],
    },
    {
      id: 'w04d2',
      dayLabel: '第2天',
      title: 'ir a + infinitivo',
      goal: '近未来更口语',
      steps: [
        {
          id: 'w04d2s1',
          type: 'practice',
          session: 'deep',
          instructions: '用 voy a / va a / vamos a 写 8 句下周计划。',
        },
        {
          id: 'w04d2s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Mañana voy a levantarme temprano. Voy a trabajar y por la noche voy a ver una serie.',
        },
        {
          id: 'w04d2s3',
          type: 'dictation',
          session: 'micro',
          dictationText: '¿Qué vas a hacer este fin de semana? Voy a descansar.',
        },
      ],
    },
    {
      id: 'w04d3',
      dayLabel: '第3天',
      title: 'Condicional 条件式',
      goal: '礼貌、假设、would',
      steps: [
        {
          id: 'w04d3s1',
          type: 'video',
          session: 'deep',
          youtubeId: 'wTMgrhHKk20',
          instructions: '注意条件式词尾 -ía。记录：me gustaría, podría, sería。',
        },
        {
          id: 'w04d3s2',
          type: 'speak',
          session: 'deep',
          speakPrompt:
            'Me gustaría viajar más. Si tuviera tiempo, estudiaría otro idioma. ¿Podrías ayudarme?',
        },
        {
          id: 'w04d3s3',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '礼貌说「我想要一杯咖啡」？',
          quizOptions: [
            { text: 'Quisiera un café.', correct: true },
            { text: 'Quiero un café.' },
            { text: 'Quería un café.' },
          ],
        },
      ],
    },
    {
      id: 'w04d4',
      dayLabel: '第4天',
      title: 'Si 从句入门',
      goal: 'Si + presente, presente/futuro',
      steps: [
        {
          id: 'w04d4s1',
          type: 'practice',
          session: 'deep',
          instructions: '造句：Si llueve, me quedo en casa. Si tengo dinero, compro... Si estudias, aprenderás...',
        },
        {
          id: 'w04d4s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Si mañana hace buen tiempo, iremos al parque. Si no, nos quedaremos en casa.',
        },
      ],
    },
    {
      id: 'w04d5',
      dayLabel: '第5天',
      title: '阶段一模拟考',
      goal: 'B1 基础检验',
      steps: [
        {
          id: 'w04d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 15,
          instructions: '模拟面试：自我介绍 + 过去经历 + 未来计划。至少 3 分钟不间断。',
          speakPrompt: '（自由发挥：quién eres, qué hiciste el año pasado, qué harás el próximo año）',
        },
        {
          id: 'w04d5s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'Omgk17jdbKs',
          instructions: '复习过去时对比。',
        },
        {
          id: 'w04d5s3',
          type: 'reflect',
          session: 'deep',
          instructions: '阶段一复盘：1-4 周最难的三个点？下阶段重点？',
        },
      ],
    },
    {
      id: 'w04d6',
      dayLabel: '第6天',
      title: '休息输入',
      goal: '轻松听力',
      steps: [
        {
          id: 'w04d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'srnEZq2yoM0',
          durationMin: 20,
          instructions: '放松观看 Dreaming Spanish。',
        },
      ],
    },
    {
      id: 'w04d7',
      dayLabel: '第7天',
      title: '阶段一总复习',
      goal: '巩固 B1 基础',
      steps: [
        {
          id: 'w04d7s1',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「如果我有时间，我会学吉他」？',
          quizOptions: [
            { text: 'Si tengo tiempo, aprenderé guitarra.', correct: true },
            { text: 'Si tengo tiempo, aprendo guitarra.' },
            { text: 'Si tengo tiempo, aprendía guitarra.' },
          ],
        },
        {
          id: 'w04d7s2',
          type: 'practice',
          session: 'deep',
          title: '60 分钟大复习',
          instructions: '30 分钟变位 + 15 分钟代词 + 15 分钟口语自述。全部完成后打勾。',
        },
        {
          id: 'w04d7s3',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/playlist?list=PLA5UIoabheFNMfoCOc7Zz4Mlc7XxnLHRi',
          urlLabel: 'Hola Spanish 语法播放列表',
          instructions: '收藏备用。进入第二阶段前浏览目录。',
        },
      ],
    },
  ],
};
