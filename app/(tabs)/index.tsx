import { Text, View, StyleSheet, Platform, NativeModules } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import domtoimage from 'dom-to-image';

import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';
import IconButton from '@/components/IconButton';
import CircleButton from '@/components/CircleButton';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';
import Timer from '@/components/Timer';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { registerBackgroundNotificationTask } from '@/components/BackgroundNotificationTask';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const PlaceholderImage = require('@/assets/images/background-image.png');
const RNShared = NativeModules.RNShared;

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({ granularPermissions: ['photo'] });
  const imageRef = useRef<View>(null);
  const [containerDimensions, setContainerDimensions] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (Platform.OS === 'web') return;

    async function setup() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications was denied');
        return;
      }
      const apnsToken = await Notifications.getDevicePushTokenAsync();
      console.log("APNs Token:", apnsToken.data);
      
      await registerBackgroundNotificationTask();
    }

    setup();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('[PUSH] Received:', notification.request.content.data);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    NewsWidget();
    WeatherWidget();
  }, []);

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, []);

  const onContainerLayout = (event: { nativeEvent: { layout: { x: any, y: any, width: any; height: any } } }) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setContainerDimensions({ x, y, width, height });
  };

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert('You did not select any image.');
    }
  };

  const onSaveImageAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, { height: 440, quality: 1 });
        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) alert('Saved!');
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, { quality: 0.95, width: 320, height: 440 });
        const link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.timerList}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timerScroll}>
          <Timer title="Pizza"   timerId="t1" initialSeconds={600} />
          <Timer title="Gym"     timerId="t2" initialSeconds={60} />
          <Timer title="Laundry" timerId="t3" initialSeconds={1800} />
          <Timer title="Focus"   timerId="t4" initialSeconds={1500} />
        </ScrollView>
      </View>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <View ref={imageRef} collapsable={false}>
            <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} onLayout={onContainerLayout} />
            {pickedEmoji && <EmojiSticker parentInfo={containerDimensions} imageSize={40} stickerSource={pickedEmoji} />}
          </View>
        </View>
        {showAppOptions ? (
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              <IconButton icon="refresh"  label="Reset"  onPress={() => setShowAppOptions(false)} />
              <CircleButton onPress={() => setIsModalVisible(true)} />
              <IconButton icon="save-alt" label="Save"   onPress={onSaveImageAsync} />
            </View>
          </View>
        ) : (
          <View style={styles.footerContainer}>
            <Button label="Choose a photo" theme="primary" onPress={pickImageAsync} />
            <Button label="Use this photo" onPress={() => setShowAppOptions(true)} />
          </View>
        )}
        <EmojiPicker isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
          <EmojiList onSelect={setPickedEmoji} onCloseModal={() => setIsModalVisible(false)} />
        </EmojiPicker>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timerList: {
    paddingTop: 50,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timerScroll: {},
});