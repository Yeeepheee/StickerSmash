import { updateMultiSizeWidget } from '@/modules/widget-builder';


export async function NewsWidget() {
  const NEWS_IMAGE = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400';
  const LOGO_ICON = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400';
  await updateMultiSizeWidget({
    // widgetId: 'slot1',
    small: {
      layout: 'zstack',
      backgroundColor: '#000000',
      children: [
        { type: 'image', src: NEWS_IMAGE, contentMode: 'fill', isBackground: true },
        { type: 'image', src: LOGO_ICON, width: 40, height: 40, alignment: 'topTrailing' },
        { type: 'text', value: 'MacBook Pro\nSupercharged by M3', fontSize: 14, color: '#ffffff', textAlignment: 'leading', alignment: 'bottomLeading' }
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
            { type: 'text', value: 'TECH', fontSize: 11, color: '#ff3b30' }, 
            { type: 'spacer' },
            { type: 'image', src: LOGO_ICON, width: 18, height: 18 }
          ]
        },
        { type: 'spacer' },

        {
          type: 'container',
          layout: 'hstack',
          children: [
            { type: 'text', value: 'Apple unveils the new M3 chip family', fontSize: 15, color: '#1a1a1a' },
            { type: 'spacer' },
            { type: 'image', src: NEWS_IMAGE, width: 40, height: 40, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },

        {
          type: 'container',
          layout: 'hstack',
          children: [
            { type: 'text', value: 'The future of Mac gaming is here', fontSize: 15, color: '#1a1a1a' },
            { type: 'spacer' },
            { type: 'image', src: NEWS_IMAGE, width: 40, height: 40, contentMode: 'fill' }
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
            { type: 'text', value: 'TECH', fontSize: 11, color: '#ff3b30' },
            { type: 'spacer' },
            { type: 'image', src: LOGO_ICON, width: 18, height: 18 }
          ]
        },
        { type: 'spacer' },
        
        {
          type: 'container',
          layout: 'hstack',
          children: [
            { type: 'text', value: 'Apple unveils the new M3 chip family', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },
        
        {
          type: 'container',
          layout: 'hstack',
          children: [
            { type: 'text', value: 'The future of Mac gaming is here', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },
        
        {
          type: 'container',
          layout: 'hstack',
          children: [
            { type: 'text', value: 'How to choose your next MacBook', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
          ]
        },
        { type: 'spacer' },
        
        {
          type: 'container',
          layout: 'hstack',
          children: [
            { type: 'text', value: 'MacOS Sonoma: Tips and Tricks', fontSize: 13, color: '#1a1a1a' },
            { type: 'spacer' },
            { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
          ]
        }
      ]
    }
  });

}