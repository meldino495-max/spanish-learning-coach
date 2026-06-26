import type { ThemeId } from '../../themes/themes';



export type ChiikawaCharId = 'chii' | 'usagi' | 'hachiware' | 'momonga' | 'rakko';



export interface ChiikawaBgSprite {

  id: ChiikawaCharId;

  /** CSS 定位类名 */

  pos: string;

  size: number;

  opacity?: number;

  /** 浮动动画延迟（秒） */

  delay?: number;

  flip?: boolean;

  /** 资源文件名（默认 {id}.svg） */

  asset?: string;

  /** 官方参考插画（含场景） */

  scene?: boolean;

  /** 额外 CSS 类 */

  extraClass?: string;

}



export const CHIIKAWA_CHAR_LABELS: Record<ChiikawaCharId, string> = {

  chii: '吉伊',

  usagi: '乌萨奇',

  hachiware: '小八',

  momonga: '飞鼠',

  rakko: '栗子',

};



/** 官方风格参考图（用户提供的吉伊 / 乌萨奇 / 小八） */

export const CHIIKAWA_HERO_ASSETS: Record<'chii' | 'usagi' | 'hachiware', string> = {

  chii: 'chii-hero.png',

  usagi: 'usagi-hero.png',

  hachiware: 'hachiware-hero.png',

};



/** 各吉伊卡哇主题的背景角色布局 */

export const CHIIKAWA_BACKGROUNDS: Partial<Record<ThemeId, ChiikawaBgSprite[]>> = {

  'chiikawa-world': [

    {

      id: 'chii',

      pos: 'pos-scene-bl',

      size: 260,

      opacity: 0.4,

      delay: 0,

      asset: CHIIKAWA_HERO_ASSETS.chii,

      scene: true,

    },

    {

      id: 'usagi',

      pos: 'pos-scene-tr',

      size: 240,

      opacity: 0.44,

      delay: 0.9,

      asset: CHIIKAWA_HERO_ASSETS.usagi,

      scene: true,

      extraClass: 'usagi-hero-mask',

    },

    {

      id: 'hachiware',

      pos: 'pos-scene-br',

      size: 250,

      opacity: 0.42,

      delay: 1.4,

      asset: CHIIKAWA_HERO_ASSETS.hachiware,

      scene: true,

    },

  ],

  chii: [

    {

      id: 'chii',

      pos: 'pos-scene-hero',

      size: 520,

      opacity: 0.46,

      delay: 0,

      asset: CHIIKAWA_HERO_ASSETS.chii,

      scene: true,

    },

  ],

  usagi: [

    {

      id: 'usagi',

      pos: 'pos-scene-hero',

      size: 400,

      opacity: 0.5,

      delay: 0,

      asset: CHIIKAWA_HERO_ASSETS.usagi,

      scene: true,

      extraClass: 'usagi-hero-mask',

    },

  ],

  hachiware: [

    {

      id: 'hachiware',

      pos: 'pos-scene-hero',

      size: 480,

      opacity: 0.48,

      delay: 0,

      asset: CHIIKAWA_HERO_ASSETS.hachiware,

      scene: true,

    },

  ],

  momonga: [

    { id: 'momonga', pos: 'pos-br-hero', size: 270, opacity: 0.48, delay: 0 },

    {

      id: 'chii',

      pos: 'pos-tl-sm',

      size: 140,

      opacity: 0.28,

      delay: 0.6,

      asset: CHIIKAWA_HERO_ASSETS.chii,

      scene: true,

    },

  ],

  rakko: [

    { id: 'rakko', pos: 'pos-br-hero', size: 275, opacity: 0.5, delay: 0 },

    {

      id: 'hachiware',

      pos: 'pos-tl-sm',

      size: 130,

      opacity: 0.26,

      delay: 0.8,

      asset: CHIIKAWA_HERO_ASSETS.hachiware,

      scene: true,

    },

  ],

};



export function isChiikawaTheme(themeId: ThemeId): boolean {

  return themeId in CHIIKAWA_BACKGROUNDS;

}



export function getChiikawaAsset(sprite: ChiikawaBgSprite): string {

  return sprite.asset ?? `${sprite.id}.svg`;

}

