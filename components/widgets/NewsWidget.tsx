import { updateMultiSizeWidget } from '@/modules/widget-builder';

export async function NewsWidget() {
  const ABOUT_LINK = 'stickersmash:///about';

  const IMG = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400';

  const thumb = (id: string, src: string, size: number) => ({
    type: 'container' as const,
    layout: 'zstack' as const,
    backgroundColor: '#1c1c1e' as const,
    cornerRadius: 10,
    width: size,
    height: size,
    children: [
      { id, type: 'image' as const, src, contentMode: 'fill' as const,width: size, height: size }
    ]
  });

  // Article row: [source (small grey) + title (white semibold)] | thumbnail
  const article = (
    sourceId: string, source: string,
    titleId:  string, title:  string,
    imgId:    string, imgSrc: string,
    size: number, titleSize: number
  ) => ({
    type: 'container' as const,
    layout: 'hstack' as const,
    link: ABOUT_LINK,
    spacing: 10,
    children: [
      {
        type: 'container' as const,
        layout: 'vstack' as const,
        backgroundColor: 'transparent' as const,
        alignment: 'centerLeading' as const,
        spacing: 3,
        children: [
          { id: sourceId, type: 'text' as const, value: source,
            fontSize: 10, fontWeight: 'medium' as const, color: '#8e8e93' as const },
          { id: titleId, type: 'text' as const, value: title,
            fontSize: titleSize, fontWeight: 'semibold' as const, color: '#ffffff' as const },
        ],
      },
      thumb(imgId, imgSrc, size),
    ],
  });

  await updateMultiSizeWidget({
    widgetId: 'slot0',
    remoteConfigUrl: 'http://192.168.1.235:8080/Widget/News.json',

    small: {
      layout: 'zstack',
      backgroundColor: '#000000',
      children: [
        { id: 'news_hero_image', type: 'image', link: ABOUT_LINK,
          src: IMG, contentMode: 'fill', isBackground: true },
        { id: 'news_logo', type: 'image', src: IMG,
          width: 40, height: 40, alignment: 'topTrailing' },
        { id: 'news_headline_small', type: 'text',
          value: 'MacBook Pro\nSupercharged by M3',
          fontSize: 14, fontWeight: 'semibold', color: '#ffffff',
          textAlignment: 'leading', alignment: 'bottomLeading' },
      ],
    },

    medium: {
      layout: 'vstack',
      backgroundColor: '#000000',
      spacing: 10,
      children: [
        {
          type: 'container', layout: 'zstack',
          children: [
            { id: 'news_category', type: 'text', value: 'Science',
              fontSize: 16, fontWeight: 'bold', color: '#0a84ff', alignment: 'topLeading' },
            { id: 'news_logo', type: 'image', src: IMG,
              width: 24, height: 24, alignment: 'topTrailing' },
          ],
        },
        article('news_src_1', 'INDEPENDENT', 'news_title_1',
          "Chinese scientists create self-destructing 'living plastic'",
          'news_img_1', IMG, 45, 13),
        article('news_src_2', 'Smithsonian', 'news_title_2',
          "These Singing Mice Squeak Back and Forth and Don't Interrupt",
          'news_img_2', IMG, 45, 13),
      ],
    },

    large: {
      layout: 'vstack',
      backgroundColor: '#000000',
      spacing: 12,
      children: [
        {
          type: 'container', layout: 'zstack',
          children: [
            { id: 'news_category', type: 'text', value: 'Science',
              fontSize: 16, fontWeight: 'bold', color: '#0a84ff', alignment: 'topLeading' },
            { id: 'news_logo', type: 'image', src: IMG,
              width: 28, height: 28, alignment: 'topTrailing' },
          ],
        },
        article('news_src_1', 'INDEPENDENT',     'news_title_1',
          "Chinese scientists create self-destructing 'living plastic'",
          'news_img_1', IMG, 68, 14),
        article('news_src_2', 'Smithsonian',      'news_title_2',
          "These Singing Mice Squeak Back and Forth and Don't Interrupt",
          'news_img_2', IMG, 68, 14),
        article('news_src_3', 'THE CONVERSATION', 'news_title_3',
          'What it would have been like to experience the dinosaur-killing asteroid',
          'news_img_3', IMG, 68, 14),
        article('news_src_4', 'SPACE.com',        'news_title_4',
          "NASA's Artemis 3 rocket is taking shape for 2027 launch",
          'news_img_4', IMG, 68, 14),
      ],
    },
  });
}