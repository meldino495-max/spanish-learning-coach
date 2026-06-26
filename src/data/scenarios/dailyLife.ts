import type { LifeScenario } from './types';

export const DAILY_LIFE_SCENARIOS: LifeScenario[] = [
  {
    id: 'supermarket',
    category: 'daily',
    title: '超市购物',
    icon: '🛒',
    description: '买菜、询价、结账、退换货',
    level: 'A1-A2',
    sections: [
      {
        id: 'comprar',
        title: '选购',
        phrases: [
          { es: '¿Dónde está la leche?', zh: '牛奶在哪？' },
          { es: 'Quiero dos kilos de manzanas.', zh: '我要两公斤苹果。' },
          { es: '¿Tienen productos sin gluten?', zh: '有无麸质产品吗？' },
          { es: 'Está en oferta.', zh: '在打折。' },
          { es: '¿Cuánto cuesta el kilo?', zh: '一公斤多少钱？' },
          { es: 'Necesito una bolsa / bolsa reutilizable.', zh: '我要袋子/环保袋。' },
        ],
      },
      {
        id: 'pagar',
        title: '结账',
        phrases: [
          { es: '¿Cuánto es en total?', zh: '一共多少钱？' },
          { es: '¿Aceptan tarjeta?', zh: '能刷卡吗？' },
          { es: '¿Puedo pagar con el móvil?', zh: '能手机支付吗？' },
          { es: 'Quiero el ticket, por favor.', zh: '请给小票。' },
          { es: 'Me falta una moneda, ¿tiene cambio?', zh: '差一枚硬币，有零钱吗？' },
        ],
      },
    ],
  },
  {
    id: 'restaurant',
    category: 'daily',
    title: '餐厅',
    icon: '🍽️',
    description: '点餐、过敏说明、投诉、结账',
    level: 'A2-B1',
    sections: [
      {
        id: 'pedir',
        title: '点餐',
        phrases: [
          { es: 'Una mesa para dos, por favor.', zh: '两位，谢谢。' },
          { es: '¿Qué recomienda?', zh: '您推荐什么？' },
          { es: 'Soy vegetariano/a. ¿Qué puedo comer?', zh: '我吃素，能吃什么？' },
          { es: 'Soy alérgico/a a los frutos secos.', zh: '我对坚果过敏。' },
          { es: 'Sin cebolla, por favor.', zh: '不要洋葱。' },
          { es: '¿Qué trae el menú del día?', zh: '今日套餐有什么？' },
          { es: 'De primero… de segundo…', zh: '头盘……主菜……' },
        ],
      },
      {
        id: 'servicio',
        title: '服务与结账',
        phrases: [
          { es: '¿Nos trae la carta de vinos?', zh: '酒单拿来好吗？' },
          { es: 'La comida está fría.', zh: '菜凉了。' },
          { es: 'Hemos esperado mucho tiempo.', zh: '我们等很久了。' },
          { es: '¿Nos trae la cuenta?', zh: '请结账。' },
          { es: '¿Está incluido el servicio?', zh: '含服务费吗？' },
          { es: '¿Podemos pagar por separado?', zh: '能分开付吗？' },
        ],
      },
    ],
  },
  {
    id: 'hotel',
    category: 'daily',
    title: '酒店',
    icon: '🏨',
    description: '入住、退房、设施、问题',
    level: 'A2-B1',
    sections: [
      {
        id: 'checkin',
        title: '入住',
        phrases: [
          { es: 'Tengo una reserva a nombre de Wang.', zh: '我姓王，有预订。' },
          { es: '¿A qué hora es el check-in?', zh: '几点入住？' },
          { es: '¿Desayuno incluido?', zh: '含早餐吗？' },
          { es: '¿Hay wifi gratuito?', zh: '有免费 wifi 吗？' },
          { es: '¿Puedo dejar el equipaje?', zh: '能寄存行李吗？' },
        ],
      },
      {
        id: 'problemas',
        title: '问题处理',
        phrases: [
          { es: 'El aire acondicionado no funciona.', zh: '空调坏了。' },
          { es: 'No hay agua caliente.', zh: '没有热水。' },
          { es: 'La habitación no está limpia.', zh: '房间不干净。' },
          { es: 'Quiero cambiar de habitación.', zh: '我想换房。' },
          { es: '¿A qué hora debo hacer el check-out?', zh: '几点退房？' },
        ],
      },
    ],
  },
  {
    id: 'airport',
    category: 'daily',
    title: '机场',
    icon: '✈️',
    description: '值机、安检、登机、行李',
    level: 'A2-B1',
    sections: [
      {
        id: 'vuelo',
        title: '值机与登机',
        phrases: [
          { es: '¿Dónde facturo para el vuelo a Madrid?', zh: '飞马德里的值机在哪？' },
          { es: 'Quiero facturar una maleta.', zh: '我要托运一件行李。' },
          { es: '¿Cuál es la puerta de embarque?', zh: '登机口在哪？' },
          { es: 'El vuelo está retrasado.', zh: '航班延误了。' },
          { es: 'He perdido la conexión.', zh: '我错过转机了。' },
          { es: 'Mi equipaje no ha llegado.', zh: '我的行李没到。' },
        ],
      },
    ],
  },
  {
    id: 'police',
    category: 'daily',
    title: '警察与报案',
    icon: '👮',
    description: '丢东西、被盗、事故、证件',
    level: 'B1-B2',
    sections: [
      {
        id: 'denuncia',
        title: '报案',
        phrases: [
          { es: 'Quiero poner una denuncia.', zh: '我要报案。' },
          { es: 'Me han robado el móvil.', zh: '手机被偷了。' },
          { es: 'He perdido la cartera con el DNI.', zh: '钱包和身份证丢了。' },
          { es: 'Ha habido un robo en mi casa.', zh: '我家遭入室盗窃。' },
          { es: '¿Dónde está la comisaría más cercana?', zh: '最近的派出所在哪？' },
          { es: 'Necesito el parte para el seguro.', zh: '我需要报案记录给保险用。' },
        ],
      },
    ],
  },
  {
    id: 'rent',
    category: 'daily',
    title: '租房',
    icon: '🏠',
    description: '找房、看房、签约、维修',
    level: 'B1-B2',
    sections: [
      {
        id: 'buscar',
        title: '找房看房',
        phrases: [
          { es: 'Busco piso en alquiler en el centro.', zh: '我想在市中心租公寓。' },
          { es: '¿Cuánto es el alquiler mensual?', zh: '月租多少？' },
          { es: '¿Están incluidos los gastos de comunidad?', zh: '含物业费吗？' },
          { es: '¿Se admiten mascotas?', zh: '能养宠物吗？' },
          { es: '¿Cuánto es la fianza?', zh: '押金多少？' },
        ],
      },
      {
        id: 'contrato',
        title: '签约与维修',
        phrases: [
          { es: 'Quiero firmar el contrato.', zh: '我要签合同。' },
          { es: 'La caldera no funciona.', zh: '锅炉坏了。' },
          { es: 'Hay humedad en la pared.', zh: '墙上有潮气。' },
          { es: 'El casero no hace las reparaciones.', zh: '房东不修。' },
          { es: 'Quiero rescindir el contrato.', zh: '我要解约。' },
        ],
      },
    ],
  },
  {
    id: 'post',
    category: 'daily',
    title: '邮局',
    icon: '📮',
    description: '寄信、包裹、快递',
    level: 'A2-B1',
    sections: [
      {
        id: 'envios',
        title: '寄送',
        phrases: [
          { es: 'Quiero enviar un paquete a China.', zh: '我要寄包裹到中国。' },
          { es: '¿Cuánto cuesta el envío urgente?', zh: '加急多少钱？' },
          { es: '¿Puedo rastrear el paquete?', zh: '能追踪包裹吗？' },
          { es: 'No he recibido el paquete.', zh: '我没收到包裹。' },
          { es: 'Necesito una carta certificada.', zh: '我要挂号信。' },
        ],
      },
    ],
  },
  {
    id: 'phone',
    category: 'daily',
    title: '电话与网络',
    icon: '📱',
    description: '办 SIM、宽带、投诉',
    level: 'A2-B1',
    sections: [
      {
        id: 'contratar',
        title: '办理',
        phrases: [
          { es: 'Quiero contratar una línea móvil.', zh: '我要办手机卡。' },
          { es: '¿Tienen fibra óptica en mi zona?', zh: '我这片区有光纤吗？' },
          { es: 'La señal es muy mala aquí.', zh: '这里信号很差。' },
          { es: 'Quiero cambiar de operador.', zh: '我要换运营商。' },
          { es: 'Me han cobrado de más en la factura.', zh: '账单多扣了。' },
        ],
      },
    ],
  },
  {
    id: 'cafe',
    category: 'daily',
    title: '咖啡馆',
    icon: '☕',
    description: '点单、外带、结账',
    level: 'A1-A2',
    sections: [
      {
        id: 'pedir',
        title: '点单',
        phrases: [
          { es: 'Un café con leche, por favor.', zh: '一杯牛奶咖啡。' },
          { es: 'Para llevar.', zh: '带走。' },
          { es: 'Sin azúcar, gracias.', zh: '不要糖。' },
          { es: '¿Me trae la cuenta?', zh: '请结账。' },
        ],
      },
    ],
  },
  {
    id: 'metro',
    category: 'daily',
    title: '地铁与出行',
    icon: '🚇',
    description: '买票、换乘、问路',
    level: 'A1-A2',
    sections: [
      {
        id: 'viajar',
        title: '出行',
        phrases: [
          { es: '¿Dónde compro el billete?', zh: '在哪买票？' },
          { es: 'Un billete de ida y vuelta.', zh: '往返票。' },
          { es: '¿Qué línea va al centro?', zh: '哪条线去市中心？' },
          { es: '¿A qué hora sale el próximo tren?', zh: '下一班几点？' },
          { es: 'He perdido el metro.', zh: '我错过地铁了。' },
        ],
      },
    ],
  },
];
