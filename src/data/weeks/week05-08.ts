import type { WeekPlan } from '../../types';

export const week05: WeekPlan = {
  id: 'w05',
  weekNum: 5,
  title: '虚拟式入门：Presente de Subjuntivo',
  focus: '理解「主观 vs 现实」；quiero que, espero que',
  days: [
    {
      id: 'w05d1',
      dayLabel: '第1天',
      title: '为什么需要虚拟式',
      goal: '建立 indicativo vs subjuntivo 思维',
      steps: [
        {
          id: 'w05d1s1',
          type: 'video',
          session: 'deep',
          title: '必看：虚拟式入门',
          durationMin: 13,
          youtubeId: 'EbKMCFHj8cs',
          youtubeTitle: 'Nomad Spanish - Subjunctive Explained',
          instructions: '做完整笔记：① quiero aprender vs quiero que aprendas ② 两主语规则 ③ hable/comas/escriba 变位。',
        },
        {
          id: 'w05d1s2',
          type: 'video',
          session: 'micro',
          youtubeId: 'kEcsKYhcpxM',
          youtubeTitle: 'Spanish Chevere - Subjunctive Myth',
          instructions: '理解三把钥匙：欲望、情感、怀疑。',
        },
        {
          id: 'w05d1s3',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我希望你学习」？',
          quizOptions: [
            { text: 'Quiero que estudies.', correct: true },
            { text: 'Quiero que estudias.' },
            { text: 'Quiero estudias.' },
          ],
        },
        {
          id: 'w05d1s4',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Quiero que hables en español conmigo. Espero que practiques todos los días.',
        },
      ],
    },
    {
      id: 'w05d2',
      dayLabel: '第2天',
      title: '虚拟式变位',
      goal: '规则变位 + 常见不规则',
      steps: [
        {
          id: 'w05d2s1',
          type: 'practice',
          session: 'deep',
          title: '变位表',
          instructions: 'hablar→hable, comer→coma, vivir→viva。抄表并变 10 个动词。不规则：ser→sea, ir→vaya, haber→haya。',
        },
        {
          id: 'w05d2s2',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Es importante que estudies. Es necesario que llegues a tiempo.',
        },
        {
          id: 'w05d2s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Es posible que llueva mañana. Es mejor que salgamos temprano.',
        },
      ],
    },
    {
      id: 'w05d3',
      dayLabel: '第3天',
      title: '触发词 WEIRDO',
      goal: 'Wishes, Emotions, Impersonal, Requests, Doubt, Ojalá',
      steps: [
        {
          id: 'w05d3s1',
          type: 'read',
          session: 'deep',
          instructions: '背诵触发结构：quiero que, me alegra que, es importante que, pido que, dudo que, ojalá。',
        },
        {
          id: 'w05d3s2',
          type: 'practice',
          session: 'deep',
          instructions: '每个结构造 1 句，共 6 句。写在本子上。',
        },
        {
          id: 'w05d3s3',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我很高兴你来了」？',
          quizOptions: [
            { text: 'Me alegra que hayas venido.', correct: true },
            { text: 'Me alegra que has venido.' },
            { text: 'Me alegra que vienes.' },
          ],
        },
      ],
    },
    {
      id: 'w05d4',
      dayLabel: '第4天',
      title: 'cuando + 虚拟式',
      goal: '未来/未发生用虚拟式',
      steps: [
        {
          id: 'w05d4s1',
          type: 'video',
          session: 'deep',
          youtubeId: 'Ui1EuvVZ6kA',
          youtubeTitle: 'Sol Cabrera - Cuando + Subjuntivo',
          instructions: '记住：习惯=indicativo，未来计划=subjuntivo。',
        },
        {
          id: 'w05d4s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Cuando llegue a casa te llamaré. Cuando voy al trabajo escucho música.',
        },
        {
          id: 'w05d4s3',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Cuando seas mayor entenderás. Cuando era niño jugaba fuera.',
        },
      ],
    },
    {
      id: 'w05d5',
      dayLabel: '第5天',
      title: '实战对话',
      goal: '建议、请求、愿望',
      steps: [
        {
          id: 'w05d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 10,
          instructions: '模拟：你劝朋友多运动、早睡、学西语。至少 8 句，必须用 que + subjuntivo。',
          speakPrompt: 'Te recomiendo que hagas ejercicio. Es mejor que duermas ocho horas. Ojalá tengas tiempo para practicar.',
        },
        {
          id: 'w05d5s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'EbKMCFHj8cs',
          instructions: '第二遍，跟读关键句。',
        },
      ],
    },
    {
      id: 'w05d6',
      dayLabel: '第6天',
      title: '轻量复习',
      goal: '碎片巩固',
      steps: [
        {
          id: 'w05d6s1',
          type: 'quiz',
          session: 'micro',
          quizQuestion: '「也许他来」？',
          quizOptions: [
            { text: 'Quizás venga.', correct: true },
            { text: 'Quizás viene.' },
            { text: 'Quizás venir.' },
          ],
        },
        {
          id: 'w05d6s2',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Ojalá que todo salga bien.',
        },
      ],
    },
    {
      id: 'w05d7',
      dayLabel: '第7天',
      title: '第五周复习',
      goal: '虚拟式 presente',
      steps: [
        {
          id: 'w05d7s1',
          type: 'practice',
          session: 'deep',
          title: '20 句转换',
          instructions: '把 indicativo 改成合适结构：Quiero ir → No (不同主语) → Quiero que vayas...',
        },
        {
          id: 'w05d7s2',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/playlist?list=PLA5UIoabheFNMfoCOc7Zz4Mlc7XxnLHRi',
          urlLabel: 'Hola Spanish 高级语法',
          instructions: '选「subjunctive」相关视频看 1 个。',
        },
      ],
    },
  ],
};

export const week06: WeekPlan = {
  id: 'w06',
  weekNum: 6,
  title: '虚拟式：情感 & 评价从句',
  focus: 'me molesta que, no me gusta que, aunque, antes de que',
  days: [
    {
      id: 'w06d1',
      dayLabel: '第1天',
      title: '情感动词',
      goal: '表达喜怒哀乐',
      steps: [
        {
          id: 'w06d1s1',
          type: 'video',
          session: 'deep',
          youtubeId: 'kEcsKYhcpxM',
          instructions: '聚焦情感类例句。',
        },
        {
          id: 'w06d1s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Me encanta que cocines tan bien. Me preocupa que llegues tarde. Me sorprende que hables tan rápido.',
        },
        {
          id: 'w06d1s3',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我讨厌他迟到」？',
          quizOptions: [
            { text: 'Odio que llegue tarde.', correct: true },
            { text: 'Odio que llega tarde.' },
            { text: 'Odio llegar tarde.' },
          ],
        },
      ],
    },
    {
      id: 'w06d2',
      dayLabel: '第2天',
      title: 'aunque / para que / sin que',
      goal: '让步、目的、伴随',
      steps: [
        {
          id: 'w06d2s1',
          type: 'practice',
          session: 'deep',
          instructions: '造句：Aunque llueva... / Te lo digo para que lo sepas. / Salió sin que lo vieran.',
        },
        {
          id: 'w06d2s2',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Te llamo para que no te preocupes. Aunque esté cansado, iré.',
        },
        {
          id: 'w06d2s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Estudio español para que pueda trabajar en Latinoamérica. Aunque sea difícil, no me rindo.',
        },
      ],
    },
    {
      id: 'w06d3',
      dayLabel: '第3天',
      title: '否定 & 怀疑',
      goal: 'no creo que, no pienso que',
      steps: [
        {
          id: 'w06d3s1',
          type: 'video',
          session: 'deep',
          youtubeId: 'EbKMCFHj8cs',
          instructions: '注意否定触发虚拟式。',
        },
        {
          id: 'w06d3s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'No creo que sea verdad. No pienso que tenga razón. Dudo que venga hoy.',
        },
        {
          id: 'w06d3s3',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我认为他是对的」？',
          quizOptions: [
            { text: 'Creo que tiene razón.', correct: true },
            { text: 'Creo que tenga razón.' },
            { text: 'No creo que tiene razón.' },
          ],
          quizExplanation: '肯定 believe 用 indicativo；否定才用 subjuntivo。',
        },
      ],
    },
    {
      id: 'w06d4',
      dayLabel: '第4天',
      title: '场景：职场沟通',
      goal: '正式请求与反馈',
      steps: [
        {
          id: 'w06d4s1',
          type: 'speak',
          session: 'deep',
          durationMin: 12,
          instructions: '模拟跟同事说话：请求帮忙、表达担心、提建议。',
          speakPrompt: 'Necesito que me envíes el informe. Me preocupa que no tengamos tiempo. Sugiero que lo hagamos mañana.',
        },
        {
          id: 'w06d4s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'gxmv-WHi9Yk',
          instructions: '注意街头对话是否有 subjuntivo（较难听到，训练耳朵）。',
        },
      ],
    },
    {
      id: 'w06d5',
      dayLabel: '第5天',
      title: '写作练习',
      goal: '邮件/消息中的虚拟式',
      steps: [
        {
          id: 'w06d5s1',
          type: 'practice',
          session: 'deep',
          instructions: '写一封 8 句西语邮件给老板：请假。用 espero que, es posible que, cuando + subj。',
        },
        {
          id: 'w06d5s2',
          type: 'reflect',
          session: 'deep',
          instructions: '朗读邮件录音，自查 3 处可改进。',
        },
      ],
    },
    {
      id: 'w06d6',
      dayLabel: '第6天',
      title: '听力日',
      goal: '输入为主',
      steps: [
        {
          id: 'w06d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'Nt00P1Kp1Q4',
          durationMin: 20,
          instructions: '开字幕观看。',
        },
      ],
    },
    {
      id: 'w06d7',
      dayLabel: '第7天',
      title: '第六周复习',
      goal: '虚拟式综合',
      steps: [
        {
          id: 'w06d7s1',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「虽然我累了，我会去」？',
          quizOptions: [
            { text: 'Aunque esté cansado, iré.', correct: true },
            { text: 'Aunque estoy cansado, iré.' },
          ],
        },
        {
          id: 'w06d7s2',
          type: 'speak',
          session: 'deep',
          durationMin: 5,
          instructions: '自由谈 5 分钟：你的目标、担心、希望。大量使用 subjuntivo。',
          speakPrompt: '（自由发挥）',
        },
      ],
    },
  ],
};

export const week07: WeekPlan = {
  id: 'w07',
  weekNum: 7,
  title: 'Imperfecto de Subjuntivo',
  focus: '如果当初…、礼貌建议、正式场合',
  days: [
    {
      id: 'w07d1',
      dayLabel: '第1天',
      title: '过去虚拟式变位',
      goal: '-ra/-se 形式',
      steps: [
        {
          id: 'w07d1s1',
          type: 'video',
          session: 'deep',
          youtubeId: 'EbKMCFHj8cs',
          instructions: '扩展到过去虚拟式部分（若视频未涵盖，结合 Hola Spanish 播放列表）。',
        },
        {
          id: 'w07d1s2',
          type: 'practice',
          session: 'deep',
          instructions: '变位：hablar→hablara/hablase, tener→tuviera, poder→pudiera, ser→fuera。',
        },
        {
          id: 'w07d1s3',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「如果我有时间（现在没有）」？',
          quizOptions: [
            { text: 'Si tuviera tiempo...', correct: true },
            { text: 'Si tengo tiempo...' },
            { text: 'Si tuve tiempo...' },
          ],
        },
      ],
    },
    {
      id: 'w07d2',
      dayLabel: '第2天',
      title: 'Si + imperfecto subjuntivo',
      goal: '与条件式搭配',
      steps: [
        {
          id: 'w07d2s1',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Si tuviera más dinero, viajaría por el mundo. Si pudieras vivir en cualquier país, ¿dónde vivirías?',
        },
        {
          id: 'w07d2s2',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Si fuera tú, no lo haría. Ojalá pudiera ayudarte.',
        },
        {
          id: 'w07d2s3',
          type: 'practice',
          session: 'deep',
          instructions: '写 5 个「Si + imperfecto subj, condicional」句子。',
        },
      ],
    },
    {
      id: 'w07d3',
      dayLabel: '第3天',
      title: '遗憾与后悔',
      goal: 'ojalá, como si',
      steps: [
        {
          id: 'w07d3s1',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Ojalá hubiera estudiado más joven. Habla como si supieras todo. Me gustaría que vinieras.',
        },
        {
          id: 'w07d3s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'Ui1EuvVZ6kA',
          instructions: '复习时间从句。',
        },
      ],
    },
    {
      id: 'w07d4',
      dayLabel: '第4天',
      title: '正式场合用语',
      goal: 'quisiera, podría, le agradecería',
      steps: [
        {
          id: 'w07d4s1',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Quisiera hacer una reserva. ¿Podría ver el menú? Le agradecería su ayuda.',
        },
        {
          id: 'w07d4s2',
          type: 'practice',
          session: 'deep',
          instructions: '模拟餐厅、酒店、银行各 3 句正式对话。',
        },
      ],
    },
    {
      id: 'w07d5',
      dayLabel: '第5天',
      title: '虚拟式大综合',
      goal: '三种虚拟式混用',
      steps: [
        {
          id: 'w07d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 10,
          instructions: '谈一个假设人生选择：presente/imperfecto/pluscuamperfecto subj 尽量都用。',
          speakPrompt: '（自由：Si hubiera nacido en España... Si pudiera cambiar algo... Quiero que mis hijos...）',
        },
        {
          id: 'w07d5s2',
          type: 'reflect',
          session: 'deep',
          instructions: '中文写：虚拟式三张「钥匙卡」——何时用、例句、中文对照。',
        },
      ],
    },
    {
      id: 'w07d6',
      dayLabel: '第6天',
      title: '休息',
      goal: '轻松输入',
      steps: [
        {
          id: 'w07d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'srnEZq2yoM0',
          durationMin: 25,
          instructions: '休闲观看。',
        },
      ],
    },
    {
      id: 'w07d7',
      dayLabel: '第7天',
      title: '第七周复习',
      goal: '虚拟式全复习',
      steps: [
        {
          id: 'w07d7s1',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「要是昨天你来了就好了」？',
          quizOptions: [
            { text: 'Ojalá hubieras venido ayer.', correct: true },
            { text: 'Ojalá viniste ayer.' },
            { text: 'Ojalá venías ayer.' },
          ],
        },
        {
          id: 'w07d7s2',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/playlist?list=PLA5UIoabheFNMfoCOc7Zz4Mlc7XxnLHRi',
          urlLabel: 'Hola Spanish 播放列表',
          instructions: '选一个 imperfect subjunctive 视频深入学习。',
        },
      ],
    },
  ],
};

export const week08: WeekPlan = {
  id: 'w08',
  weekNum: 8,
  title: 'Por vs Para & 连接词',
  focus: '地道表达的关键介词',
  days: [
    {
      id: 'w08d1',
      dayLabel: '第1天',
      title: 'Por 的核心用法',
      goal: '原因、交换、时间、地点',
      steps: [
        {
          id: 'w08d1s1',
          type: 'video',
          session: 'deep',
          youtubeId: 'pDd6X3tpNyc',
          youtubeTitle: 'Butterfly Spanish - Por vs Para',
          instructions: '做对比表：por 一边 / para 一边。',
        },
        {
          id: 'w08d1s2',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「谢谢你的帮助」？',
          quizOptions: [
            { text: 'Gracias por tu ayuda.', correct: true },
            { text: 'Gracias para tu ayuda.' },
          ],
        },
        {
          id: 'w08d1s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Gracias por venir. Lo hice por ti. Viajé por España durante un mes.',
        },
      ],
    },
    {
      id: 'w08d2',
      dayLabel: '第2天',
      title: 'Para 的核心用法',
      goal: '目的、期限、对象',
      steps: [
        {
          id: 'w08d2s1',
          type: 'practice',
          session: 'deep',
          instructions: '填空：Estudio ___ aprender. El regalo es ___ ti. Necesito el informe ___ el lunes.',
        },
        {
          id: 'w08d2s2',
          type: 'dictation',
          session: 'micro',
          dictationText: 'Este libro es para ti. Trabajo para una empresa internacional.',
        },
        {
          id: 'w08d2s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Estudio español para poder comunicarme mejor. Tengo que terminar esto para mañana.',
        },
      ],
    },
    {
      id: 'w08d3',
      dayLabel: '第3天',
      title: '连接词：虽然、然而、因此',
      goal: 'sin embargo, por eso, además',
      steps: [
        {
          id: 'w08d3s1',
          type: 'read',
          session: 'deep',
          instructions: '背诵并造句：sin embargo, por eso, además, en cambio, por lo tanto, aunque。',
        },
        {
          id: 'w08d3s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Está lloviendo; sin embargo, salimos. No tengo coche, por eso tomo el autobús. Además, es más barato.',
        },
      ],
    },
    {
      id: 'w08d4',
      dayLabel: '第4天',
      title: '议论文结构',
      goal: '观点+论据+结论',
      steps: [
        {
          id: 'w08d4s1',
          type: 'practice',
          session: 'deep',
          instructions: '写 10 句短文：「学外语的重要性」。用连接词串联。',
        },
        {
          id: 'w08d4s2',
          type: 'speak',
          session: 'deep',
          instructions: '朗读并背诵你的短文。',
          speakPrompt: '（朗读你写的短文）',
        },
      ],
    },
    {
      id: 'w08d5',
      dayLabel: '第5天',
      title: '阶段二模拟考',
      goal: 'B2 语法检验',
      steps: [
        {
          id: 'w08d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 15,
          instructions: '5 分钟演讲：一个你支持的观点。必须用 subjuntivo + 连接词 + por/para。',
          speakPrompt: '（自由选题：远程工作、旅行、教育等）',
        },
        {
          id: 'w08d5s2',
          type: 'reflect',
          session: 'deep',
          instructions: '阶段二复盘：虚拟式掌握度 1-10 自评？薄弱点？',
        },
      ],
    },
    {
      id: 'w08d6',
      dayLabel: '第6天',
      title: '轻松日',
      goal: '街头西语',
      steps: [
        {
          id: 'w08d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'gxmv-WHi9Yk',
          durationMin: 20,
          instructions: '享受学习。',
        },
      ],
    },
    {
      id: 'w08d7',
      dayLabel: '第7天',
      title: '第八周复习',
      goal: 'B2 核心巩固',
      steps: [
        {
          id: 'w08d7s1',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我为你买了这个」？',
          quizOptions: [
            { text: 'Compré esto para ti.', correct: true },
            { text: 'Compré esto por ti.' },
          ],
          quizExplanation: '两者都可但含义略不同：para ti=给你；por ti=替你/因为你。',
        },
        {
          id: 'w08d7s2',
          type: 'practice',
          session: 'deep',
          title: '90 分钟总复习',
          instructions: '30 分钟虚拟式 + 30 分钟 por/para + 30 分钟口语演讲复述。',
        },
      ],
    },
  ],
};
