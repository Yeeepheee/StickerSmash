import { ImageSourcePropType, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { clamp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type parentInfo = {
    x: any;
    y: any;
    width: any;
    height: any;
}
type Props = {
    parentInfo: parentInfo;
    imageSize: number;
    stickerSource: ImageSourcePropType;
};


export default function EmojiSticker({parentInfo, imageSize, stickerSource }: Props) {
    const scaleImage = useSharedValue(imageSize);
    console.log("dsfafsfasfas" + parentInfo.height);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const maxScale = 500;
    const minScale = 100;


    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (scaleImage.value !== imageSize * 2) {
                scaleImage.value = scaleImage.value * 2;
            } else {
                scaleImage.value = Math.round(scaleImage.value / 2);
            }
        });

        const drag = Gesture.Pan().onChange(event => {
            translateX.value += event.changeX;
            translateY.value += event.changeY;
        });
        
        const containerStyle = useAnimatedStyle(() => {
            translateX.value = clamp(translateX.value, parentInfo.x, parentInfo.width-(scaleImage.value))
            translateY.value = clamp(translateY.value, -parentInfo.height, parentInfo.y-(scaleImage.value))
            return {
                transform: [
                    {
                        translateX: translateX.value,
                    },
                    {
                        translateY: translateY.value,
                    },
                ],
            };
        });

        const pinchgGesture = Gesture.Pinch().hitSlop({ left: 100, right: 100, top: 100, bottom: 100}).onChange((e) => {
            scaleImage.value *= e.scaleChange;
        });
        
        const imageStyle = useAnimatedStyle(() => {
            scaleImage.value = clamp(scaleImage.value, 20, 200)
            return {
                width: scaleImage.value, 
                height: scaleImage.value,
            };
        });
        const combined = Gesture.Simultaneous(doubleTap, pinchgGesture);
        return (
            
    <Animated.View style={[containerStyle]}>
        <GestureDetector gesture={combined}>
            <Animated.View style={{ backgroundColor: 'transparent' }}>
                <GestureDetector gesture={drag}>
                    <Animated.Image
                        source={stickerSource}
                        resizeMode="contain"
                        style={imageStyle}
                    />
                </GestureDetector>
            </Animated.View>
        </GestureDetector>
    </Animated.View>
);
}

