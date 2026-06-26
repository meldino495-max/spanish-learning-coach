import { useTheme } from '../context/ThemeContext';
import { useCustomBackground } from '../context/CustomBackgroundContext';
import {
  CHIIKAWA_BACKGROUNDS,
  getChiikawaAsset,
  isChiikawaTheme,
} from '../data/chiikawa/backgrounds';

const BASE = import.meta.env.BASE_URL;

export function ChiikawaBackground() {
  const { themeId } = useTheme();
  const { enabled: customBgOn } = useCustomBackground();

  if (customBgOn) return null;
  if (!isChiikawaTheme(themeId)) return null;



  const sprites = CHIIKAWA_BACKGROUNDS[themeId];

  if (!sprites?.length) return null;



  return (

    <div className="chiikawa-bg" aria-hidden="true">

      {sprites.map((sprite, index) => (

        <img

          key={`${sprite.id}-${index}`}

          className={[

            'chiikawa-sprite',

            sprite.pos,

            sprite.scene ? 'chiikawa-scene' : '',

            sprite.flip ? 'chiikawa-flip' : '',

            sprite.extraClass ?? '',

          ]

            .filter(Boolean)

            .join(' ')}

          src={`${BASE}chiikawa/${getChiikawaAsset(sprite)}`}

          alt=""

          width={sprite.size}

          height={sprite.size}

          style={{

            opacity: sprite.opacity ?? 0.4,

            animationDelay: `${sprite.delay ?? 0}s`,

            width: sprite.size,

            height: 'auto',

          }}

          draggable={false}

          loading="lazy"

          decoding="async"

        />

      ))}

    </div>

  );

}

