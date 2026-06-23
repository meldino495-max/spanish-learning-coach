import type { WeekPlan } from '../../types';

export const week09: WeekPlan = {
  id: 'w09',
  weekNum: 9,
  title: '习语 & 口语填充词',
  focus: '听起来像母语者的词块',
  days: [
    {
      id: 'w09d1',
      dayLabel: '第1天',
      title: '最高频习语 20 个',
      goal: '词块记忆，不逐词翻译',
      steps: [
        {
          id: 'w09d1s1',
          type: 'read',
          session: 'deep',
          instructions: '背诵并造句：\n① estar hecho polvo ② costar un ojo de la cara ③ meter la pata ④ ser pan comido ⑤ andar con pies de plomo\n⑥ no tener pelos en la lengua ⑦ dar en el clavo ⑧ ir al grano ⑨ ponerse las pilas ⑩ tomar el pelo',
        },
        {
          id: 'w09d1s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'gxmv-WHi9Yk',
          instructions: '看能否在街头对话中识别 2 个习语（或类似表达）。',
        },
        {
          id: 'w09d1s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Ayer metí la pata en la reunión. Tengo que ponerme las pilas y estudiar más. ¡Vamos al grano!',
        },
      ],
    },
    {
      id: 'w09d2',
      dayLabel: '第2天',
      title: '填充词：pues, bueno, o sea',
      goal: '自然停顿不尴尬',
      steps: [
        {
          id: 'w09d2s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'Nt00P1Kp1Q4',
          instructions: '注意说话人怎么用 bueno, pues, entonces。模仿语调。',
        },
        {
          id: 'w09d2s2',
          type: 'speak',
          session: 'deep',
          durationMin: 8,
          instructions: '故意加入填充词，重述今天发生的事。',
          speakPrompt: 'Pues, bueno, hoy, o sea, fue un día normal. Entonces, por la mañana trabajé y, bueno, por la tarde descansé un poco.',
        },
        {
          id: 'w09d2s3',
          type: 'dictation',
          session: 'micro',
          dictationText: 'O sea, no es tan difícil. Bueno, depende de la persona.',
        },
      ],
    },
    {
      id: 'w09d3',
      dayLabel: '第3天',
      title: '固定搭配',
      goal: 'tener ganas de, dar igual, hacer falta',
      steps: [
        {
          id: 'w09d3s1',
          type: 'practice',
          session: 'deep',
          instructions: '每个搭配造 2 句：tener ganas de, dar igual, hacer falta, tener lugar, llevarse bien。',
        },
        {
          id: 'w09d3s2',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「我想去旅行」更地道？',
          quizOptions: [
            { text: 'Tengo ganas de viajar.', correct: true },
            { text: 'Quiero viajar mucho.' },
          ],
        },
        {
          id: 'w09d3s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Tengo ganas de practicar español todos los días. Me da igual si llueve. Hace falta más tiempo.',
        },
      ],
    },
    {
      id: 'w09d4',
      dayLabel: '第4天',
      title: '影子跟读日',
      goal: '模仿母语者节奏',
      steps: [
        {
          id: 'w09d4s1',
          type: 'video',
          session: 'deep',
          durationMin: 25,
          youtubeId: 'Omgk17jdbKs',
          instructions: '每句暂停跟读。注意连读和语调。录音对比。',
        },
        {
          id: 'w09d4s2',
          type: 'reflect',
          session: 'deep',
          instructions: '哪 3 个音最难模仿？写下练习计划。',
        },
      ],
    },
    {
      id: 'w09d5',
      dayLabel: '第5天',
      title: '闲聊实战',
      goal: 'small talk 5 分钟',
      steps: [
        {
          id: 'w09d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 10,
          instructions: '话题：天气、周末、美食、工作。像朋友聊天，用习语和填充词。',
          speakPrompt: '（自由闲聊，尽量不用中文思考）',
        },
        {
          id: 'w09d5s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'gxmv-WHi9Yk',
          instructions: '观察街头 small talk 话题。',
        },
      ],
    },
    {
      id: 'w09d6',
      dayLabel: '第6天',
      title: '轻松输入',
      goal: 'Dreaming Spanish',
      steps: [
        {
          id: 'w09d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'srnEZq2yoM0',
          durationMin: 30,
          instructions: '纯享受，不查词也可以。',
        },
      ],
    },
    {
      id: 'w09d7',
      dayLabel: '第7天',
      title: '第九周复习',
      goal: '习语测验',
      steps: [
        {
          id: 'w09d7s1',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「他开玩笑骗你」？',
          quizOptions: [
            { text: 'Te está tomando el pelo.', correct: true },
            { text: 'Te está tomando la mano.' },
          ],
        },
        {
          id: 'w09d7s2',
          type: 'speak',
          session: 'deep',
          instructions: '用 5 个本周习语编一个小故事。',
          speakPrompt: '（自由故事）',
        },
      ],
    },
  ],
};

export const week10: WeekPlan = {
  id: 'w10',
  weekNum: 10,
  title: '语域：tú vs usted & 正式文体',
  focus: '对谁说、怎么说',
  days: [
    {
      id: 'w10d1',
      dayLabel: '第1天',
      title: 'tú / usted / vosotros',
      goal: '选择正确称呼',
      steps: [
        {
          id: 'w10d1s1',
          type: 'read',
          session: 'deep',
          instructions: '总结：西班牙常用 vosotros；拉美多用 ustedes。长辈、陌生人、职场用 usted。朋友用 tú。',
        },
        {
          id: 'w10d1s2',
          type: 'practice',
          session: 'deep',
          instructions: '同一句话改写两遍：对朋友 vs 对老板。例如：¿Cómo estás? → ¿Cómo está usted?',
        },
        {
          id: 'w10d1s3',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'Buenos días, ¿cómo está usted? ¿Podría ayudarme, por favor? Muchas gracias por su tiempo.',
        },
      ],
    },
    {
      id: 'w10d2',
      dayLabel: '第2天',
      title: '正式邮件 & 消息',
      goal: 'Estimado/a, Atentamente',
      steps: [
        {
          id: 'w10d2s1',
          type: 'practice',
          session: 'deep',
          instructions: '写一封正式邮件：开头 Estimado señor/señora，正文请求会议，结尾 Atentamente。',
        },
        {
          id: 'w10d2s2',
          type: 'quiz',
          session: 'micro',
          quizQuestion: '对老板应该？',
          quizOptions: [
            { text: '¿Podría revisar esto?', correct: true },
            { text: '¿Puedes revisar esto?' },
          ],
        },
      ],
    },
    {
      id: 'w10d3',
      dayLabel: '第3天',
      title: '口语正式度',
      goal: '书面语 vs 口语',
      steps: [
        {
          id: 'w10d3s1',
          type: 'video',
          session: 'deep',
          youtubeId: 'gxmv-WHi9Yk',
          instructions: '对比街头随意 vs 新闻正式（可另搜 noticias 片段）。',
        },
        {
          id: 'w10d3s2',
          type: 'speak',
          session: 'deep',
          instructions: '同一新闻用「正式」和「随意」各说一遍。',
          speakPrompt: 'Formal: Se ha producido un incidente. Informal: Ha pasado una cosa grave.',
        },
      ],
    },
    {
      id: 'w10d4',
      dayLabel: '第4天',
      title: '拉美 vs 西班牙差异',
      goal: '词汇与发音意识',
      steps: [
        {
          id: 'w10d4s1',
          type: 'read',
          session: 'deep',
          instructions: '记录差异：ordenador/computadora, coger/tomar, vosotros/ustedes, ce/ci 发音。',
        },
        {
          id: 'w10d4s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'gxmv-WHi9Yk',
          instructions: '墨西哥街头西语。注意词汇选择。',
        },
        {
          id: 'w10d4s3',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/results?search_query=espa%C3%B1ol+de+Espa%C3%B1a+vs+latinoam%C3%A9rica',
          urlLabel: 'YouTube：西班牙 vs 拉美西语对比',
          instructions: '选一个 10 分钟内的视频观看。',
        },
      ],
    },
    {
      id: 'w10d5',
      dayLabel: '第5天',
      title: '职场角色扮演',
      goal: '会议、汇报、请假',
      steps: [
        {
          id: 'w10d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 12,
          speakPrompt: 'Buenos días a todos. Hoy les presento los resultados del trimestre. En primer lugar... Finalmente, agradezco su atención.',
        },
      ],
    },
    {
      id: 'w10d6',
      dayLabel: '第6天',
      title: '休息',
      goal: '输入',
      steps: [
        {
          id: 'w10d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'Nt00P1Kp1Q4',
          durationMin: 20,
          instructions: '轻松观看。',
        },
      ],
    },
    {
      id: 'w10d7',
      dayLabel: '第7天',
      title: '第十周复习',
      goal: '语域切换',
      steps: [
        {
          id: 'w10d7s1',
          type: 'practice',
          session: 'deep',
          instructions: '写两段对话：咖啡店朋友聊天 vs 银行办业务。各 6 句。',
        },
        {
          id: 'w10d7s2',
          type: 'speak',
          session: 'deep',
          instructions: '朗读两段对话，注意语气变化。',
          speakPrompt: '（朗读你的对话）',
        },
      ],
    },
  ],
};

export const week11: WeekPlan = {
  id: 'w11',
  weekNum: 11,
  title: '辩论 & 批判性表达',
  focus: '立场、反驳、让步',
  days: [
    {
      id: 'w11d1',
      dayLabel: '第1天',
      title: '表达观点',
      goal: 'creo que, me parece que, en mi opinión',
      steps: [
        {
          id: 'w11d1s1',
          type: 'read',
          session: 'deep',
          instructions: '背诵：En mi opinión, Desde mi punto de vista, Estoy convencido de que, No estoy de acuerdo con...',
        },
        {
          id: 'w11d1s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'En mi opinión, aprender idiomas abre muchas puertas. No estoy de acuerdo con quien dice que no es necesario.',
        },
        {
          id: 'w11d1s3',
          type: 'quiz',
          session: 'micro',
          quizQuestion: '「我不认为他对」？',
          quizOptions: [
            { text: 'No creo que tenga razón.', correct: true },
            { text: 'No creo que tiene razón.' },
          ],
        },
      ],
    },
    {
      id: 'w11d2',
      dayLabel: '第2天',
      title: '反驳与让步',
      goal: 'pero, sin embargo, aunque',
      steps: [
        {
          id: 'w11d2s1',
          type: 'practice',
          session: 'deep',
          instructions: '辩论题：「社交媒体好不好？」写 8 句：4 句支持 + 4 句反对，用连接词。',
        },
        {
          id: 'w11d2s2',
          type: 'speak',
          session: 'deep',
          durationMin: 8,
          instructions: '口头辩论，扮演反方。',
          speakPrompt: '（自由辩论社交媒体）',
        },
      ],
    },
    {
      id: 'w11d3',
      dayLabel: '第3天',
      title: '新闻听力',
      goal: '正式语速适应',
      steps: [
        {
          id: 'w11d3s1',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/results?search_query=noticias+espa%C3%B1ol+lento',
          urlLabel: 'YouTube：慢速西语新闻',
          instructions: '选「Noticias en español lento」类视频，听 15 分钟，记下 5 个新词。',
        },
        {
          id: 'w11d3s2',
          type: 'reflect',
          session: 'deep',
          instructions: '用西语写 5 句新闻摘要。',
        },
      ],
    },
    {
      id: 'w11d4',
      dayLabel: '第4天',
      title: '即兴演讲',
      goal: '1 分钟无准备',
      steps: [
        {
          id: 'w11d4s1',
          type: 'practice',
          session: 'deep',
          instructions: '随机话题：气候、教育、科技、旅行、家庭。计时 1 分钟，不能停顿超过 3 秒。',
        },
        {
          id: 'w11d4s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: '（选一个话题即兴说 1 分钟）',
        },
      ],
    },
    {
      id: 'w11d5',
      dayLabel: '第5天',
      title: '模拟 C1 口试',
      goal: '完整考试流程',
      steps: [
        {
          id: 'w11d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 15,
          instructions: '① 自我介绍 1 分钟 ② 描述图片/场景 2 分钟 ③ 辩论 3 分钟 ④ 总结 1 分钟。全程录音。',
          speakPrompt: '（按考试流程执行）',
        },
        {
          id: 'w11d5s2',
          type: 'reflect',
          session: 'deep',
          instructions: '回听录音，列出 5 个具体改进点。',
        },
      ],
    },
    {
      id: 'w11d6',
      dayLabel: '第6天',
      title: '轻松日',
      goal: '母语内容',
      steps: [
        {
          id: 'w11d6s1',
          type: 'link',
          session: 'micro',
          url: 'https://www.youtube.com/results?search_query=podcast+espa%C3%B1ol+intermedio',
          urlLabel: 'YouTube：西语播客',
          instructions: '选感兴趣的播客听 20 分钟。',
        },
      ],
    },
    {
      id: 'w11d7',
      dayLabel: '第7天',
      title: '第十一周复习',
      goal: '辩论技能',
      steps: [
        {
          id: 'w11d7s1',
          type: 'speak',
          session: 'deep',
          durationMin: 10,
          instructions: '完整辩论：「是否应该全民学第二外语？」',
          speakPrompt: '（自由辩论）',
        },
      ],
    },
  ],
};

export const week12: WeekPlan = {
  id: 'w12',
  weekNum: 12,
  title: '母语感冲刺 & 长期习惯',
  focus: '建立可持续的 C1+ 学习系统',
  days: [
    {
      id: 'w12d1',
      dayLabel: '第1天',
      title: '沉浸式日程设计',
      goal: '每天听说法读写分配',
      steps: [
        {
          id: 'w12d1s1',
          type: 'read',
          session: 'deep',
          instructions: '制定你专属的每日计划：\n☀ 碎片 10min：闪卡/听写\n🌙 深度 45min：对话/视频\n📻 背景音：播客\n📖 阅读：新闻 1 篇\n✍ 写作：日记 5 句',
        },
        {
          id: 'w12d1s2',
          type: 'video',
          session: 'micro',
          youtubeId: 'srnEZq2yoM0',
          instructions: '重温 Dreaming Spanish 方法论。',
        },
        {
          id: 'w12d1s3',
          type: 'reflect',
          session: 'deep',
          instructions: '把上面的计划写进日历/提醒，设置 3 个每日闹钟。',
        },
      ],
    },
    {
      id: 'w12d2',
      dayLabel: '第2天',
      title: '原版影视学习法',
      goal: '字幕策略',
      steps: [
        {
          id: 'w12d2s1',
          type: 'read',
          session: 'deep',
          instructions: '方法：第1遍西语字幕 → 第2遍无字幕 → 摘抄 5 句。选一部你已看过的剧。',
        },
        {
          id: 'w12d2s2',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/results?search_query=series+espa%C3%B1olas+recomendadas',
          urlLabel: 'YouTube：西班牙剧推荐',
          instructions: '选一部剧的第一集片段练习（或 Netflix 原版）。',
        },
        {
          id: 'w12d2s3',
          type: 'dictation',
          session: 'micro',
          dictationText: 'No sé qué voy a hacer. Pero tengo que intentarlo.',
          dictationHint: '从剧中摘抄的句子可替换',
        },
      ],
    },
    {
      id: 'w12d3',
      dayLabel: '第3天',
      title: '发音最终打磨',
      goal: 'rr, j, ñ, 语调',
      steps: [
        {
          id: 'w12d3s1',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/results?search_query=spanish+pronunciation+rolled+r',
          urlLabel: 'YouTube：西语发音教程',
          instructions: '专项练习卷舌音 r 和语调。',
        },
        {
          id: 'w12d3s2',
          type: 'speak',
          session: 'deep',
          speakPrompt: 'El perro de San Roque no tiene rabo porque Ramón Ramírez se lo ha robado.',
          speakHint: '经典绕口令，练 r 音。',
        },
      ],
    },
    {
      id: 'w12d4',
      dayLabel: '第4天',
      title: '写作：议论文',
      goal: '300 词文章',
      steps: [
        {
          id: 'w12d4s1',
          type: 'practice',
          session: 'deep',
          durationMin: 40,
          instructions: '题目：「全球化对文化的影响」。结构：引言-论点1-论点2-反驳-结论。至少 250 西语词。',
        },
        {
          id: 'w12d4s2',
          type: 'reflect',
          session: 'deep',
          instructions: '自查：虚拟式、连接词、por/para 是否准确？',
        },
      ],
    },
    {
      id: 'w12d5',
      dayLabel: '第5天',
      title: '毕业口试',
      goal: '12 周成果展示',
      steps: [
        {
          id: 'w12d5s1',
          type: 'speak',
          session: 'deep',
          durationMin: 20,
          instructions: '全程西语 10 分钟：① 12 周学习历程 ② 最大困难与突破 ③ 未来 3 个月计划 ④ Q&A 自问自答 3 题。录像保存。',
          speakPrompt: '（毕业演讲）',
        },
        {
          id: 'w12d5s2',
          type: 'video',
          session: 'deep',
          youtubeId: 'gxmv-WHi9Yk',
          instructions: '对比你现在的口语和 12 周前的水平（如有录音）。',
        },
      ],
    },
    {
      id: 'w12d6',
      dayLabel: '第6天',
      title: '庆祝 & 轻松输入',
      goal: '正向反馈',
      steps: [
        {
          id: 'w12d6s1',
          type: 'video',
          session: 'micro',
          youtubeId: 'Nt00P1Kp1Q4',
          durationMin: 30,
          instructions: '轻松观看，你值得休息一下！',
        },
        {
          id: 'w12d6s2',
          type: 'reflect',
          session: 'micro',
          instructions: '给自己写一句西语鼓励的话。',
        },
      ],
    },
    {
      id: 'w12d7',
      dayLabel: '第7天',
      title: '毕业典礼 & 下一阶段',
      goal: '持续终身学习',
      steps: [
        {
          id: 'w12d7s1',
          type: 'quiz',
          session: 'deep',
          quizQuestion: '「如果能重来，我会更早学西语」？',
          quizOptions: [
            { text: 'Si pudiera volver atrás, empezaría antes.', correct: true },
            { text: 'Si puedo volver atrás, empiezo antes.' },
          ],
        },
        {
          id: 'w12d7s2',
          type: 'read',
          session: 'deep',
          instructions: '下一阶段 90 天计划：\n① 每天 30 分钟母语内容\n② 每周 1 次真人对话（italki/Tandem）\n③ 每月 1 篇 500 词写作\n④ 每季度自测一次\n⑤ 目标：C1 考试或工作环境全西语',
        },
        {
          id: 'w12d7s3',
          type: 'link',
          session: 'deep',
          url: 'https://www.youtube.com/playlist?list=PLA5UIoabheFNMfoCOc7Zz4Mlc7XxnLHRi',
          urlLabel: 'Hola Spanish 继续学习',
          instructions: '收藏作为长期语法参考。',
        },
        {
          id: 'w12d7s4',
          type: 'reflect',
          session: 'deep',
          instructions: '中文总结：12 周最大收获？推荐给自己的 3 条建议？',
        },
      ],
    },
  ],
};
