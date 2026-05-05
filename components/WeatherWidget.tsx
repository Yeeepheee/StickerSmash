import { updateMultiSizeWidget } from '@/modules/widget-builder';

export async function WeatherWidget() {

    await updateMultiSizeWidget({
        widgetId: 'slot1',
        remoteConfigUrl: 'http://192.168.1.100:8080/Widget/Weather.json',
        small: {
            layout: 'zstack',
            backgroundColor: '#0F172A',
            children: [
                {
                    type: 'container',
                    layout: 'vstack',
                    alignment: 'center',
                    children: [
                        { id: 'current_temp', type: 'text', value: '72°', fontSize: 32, color: '#FFFFFF' },
                        { id: 'current_condition', type: 'text', value: 'Sunny', fontSize: 14, color: '#CBD5E1' }
                    ]
                }
            ]
        },

        medium: {
            layout: 'hstack',
            backgroundColor: '#1E293B',
            children: [
                {
                    type: 'container',
                    layout: 'vstack',
                    alignment: 'centerLeading',
                    children: [
                        { id: 'city_name', type: 'text', value: 'San Francisco', fontSize: 18, color: '#FFFFFF' },
                        { id: 'last_updated_date', type: 'text', value: 'Monday, Oct 23', fontSize: 12, color: '#94A3B8' }
                    ]
                },
                { type: 'spacer' },
                {
                    type: 'container',
                    layout: 'hstack',
                    children: [
                        {
                            id: 'weather_icon_url',
                            type: 'image',
                            src: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
                            width: 40,
                            height: 40
                        },
                        { id: 'current_temp', type: 'text', value: '72°', fontSize: 28, color: '#FFFFFF' }
                    ]
                }
            ]
        },

        large: {
            layout: 'vstack',
            backgroundColor: '#F8FAFC',
            children: [
                { type: 'text', value: 'Weekly Forecast', fontSize: 20, color: '#1E293B', alignment: 'topLeading' },
                { type: 'spacer' },
                {
                    type: 'container',
                    layout: 'hstack',
                    backgroundColor: '#FFFFFF',
                    children: [
                        { id: 'f1_day', type: 'text', value: 'Tue', color: '#64748B' },
                        { type: 'spacer' },
                        { id: 'f1_temp', type: 'text', value: '75° / 60°', color: '#0F172A' }
                    ]
                },
                {
                    type: 'container',
                    layout: 'hstack',
                    backgroundColor: '#FFFFFF',
                    children: [
                        { id: 'f2_day', type: 'text', value: 'Wed', color: '#64748B' },
                        { type: 'spacer' },
                        { id: 'f2_temp', type: 'text', value: '68° / 55°', color: '#0F172A' }
                    ]
                },
                { type: 'spacer' },
                {
                    id: 'footer_update_text',
                    type: 'text',
                    value: 'Updated 2m ago',
                    fontSize: 10,
                    color: '#94A3B8',
                    alignment: 'bottomCenter'
                }
            ]
        }
    });
}