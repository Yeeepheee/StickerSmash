import { updateMultiSizeWidget } from '@/modules/widget-builder';

export async function NewsWidget() {
  const ABOUT_LINK = 'stickersmash:///about';

  await updateMultiSizeWidget({
    widgetId: 'slot0',
    remoteConfigUrl: 'http://192.168.1.100:8080/Widget/News.json',
    
    small: {
      layout: 'zstack',
      backgroundColor: '#000000',
      children: [
        { 
          id: 'news_hero_image', 
          type: 'image', 
          link: ABOUT_LINK, 
          src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', 
          contentMode: 'fill', 
          isBackground: true 
        },
        { 
          id: 'news_logo', 
          type: 'image', 
          src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', 
          width: 40, 
          height: 40, 
          alignment: 'topTrailing' 
        },
        { 
          id: 'news_headline_small', 
          type: 'text', 
          value: 'MacBook Pro\nSupercharged by M3', 
          fontSize: 14, 
          color: '#ffffff', 
          textAlignment: 'leading', 
          alignment: 'bottomLeading' 
        }
      ]
    },

    medium: {
      layout: 'vstack',
      backgroundColor: '#ffffff',
      children: [
        {
          type: 'container',
          layout: 'hstack',
          children: [
            { id: 'news_category', type: 'text', value: 'TECH', fontSize: 11, color: '#ff3b30' }, 
            { type: 'spacer' },
            { id: 'news_logo', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 18, height: 18 }
          ]
        },
        { type: 'spacer' },
        {
          type: 'container',
          layout: 'hstack',
          link: ABOUT_LINK,
          children: [
            { id: 'news_title_1', type: 'text', value: 'Apple unveils the new M3 chip family', fontSize: 15, color: '#1a1a1a' },
            { type: 'spacer' },
            { id: 'news_image_1', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 40, height: 40, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },
        {
          type: 'container',
          layout: 'hstack',
          link: ABOUT_LINK,
          children: [
            { id: 'news_title_2', type: 'text', value: 'The future of Mac gaming is here', fontSize: 15, color: '#1a1a1a' },
            { type: 'spacer' },
            { id: 'news_image_2', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 40, height: 40, contentMode: 'fill' }
          ]
        }
      ]
    },

    large: {
      layout: 'vstack',
      backgroundColor: '#ffffff',
      children: [
        {
          type: 'container',
          layout: 'hstack',
          children: [
            { id: 'news_category', type: 'text', value: 'TECH', fontSize: 11, color: '#ff3b30' },
            { type: 'spacer' },
            { id: 'news_logo', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 18, height: 18 }
          ]
        },
        { type: 'spacer' },
        {
          type: 'container',
          layout: 'hstack',
          link: ABOUT_LINK,
          children: [
            { id: 'news_title_1', type: 'text', value: 'Apple unveils the new M3 chip family', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { id: 'news_image_1', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 50, height: 50, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },
        {
          type: 'container',
          layout: 'hstack',
          link: ABOUT_LINK,
          children: [
            { id: 'news_title_2', type: 'text', value: 'The future of Mac gaming is here', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { id: 'news_image_2', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 50, height: 50, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },
        {
          type: 'container',
          layout: 'hstack',
          link: ABOUT_LINK,
          children: [
            { id: 'news_title_3', type: 'text', value: 'How to choose your next MacBook', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { id: 'news_image_3', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 50, height: 50, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },
        {
          type: 'container',
          layout: 'hstack',
          link: ABOUT_LINK,
          children: [
            { id: 'news_title_4', type: 'text', value: 'MacOS Sonoma: Tips and Tricks', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { id: 'news_image_4', type: 'image', src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', width: 50, height: 50, contentMode: 'fill' }
          ]
        }
      ]
    }
  });
}