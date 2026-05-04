import { Text, View, StyleSheet, Platform, NativeModules } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';
import * as WidgetBuilder from '@/modules/widget-builder';

import domtoimage from 'dom-to-image';
import Button from '@/components/Button';
import ImageViewer from '@/components/ImageViewer';
import IconButton from '@/components/IconButton';
import CircleButton from '@/components/CircleButton';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';
import Timer from '@/components/Timer';
import * as Notifications from 'expo-notifications';


const PlaceholderImage = require('@/assets/images/background-image.png');
const RNShared = NativeModules.RNShared;

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({ granularPermissions: ['photo'] });
  const imageRef = useRef<View>(null);
  
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  useEffect(() => {
    async function getToken() {
      try {
        // 1. Get the token inside this async function
        const token = (await Notifications.getDevicePushTokenAsync()).data;
        console.log("FCM Token:", token);
      } catch (error) {
        console.log("Error getting token:", error);
      }
    }

    getToken();
  }, []); // Runs once when the component loads

  const NEWS_IMAGE = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400';
  const LOGO_ICON = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400';

  // const handleRefresh = async () => {
  //   await WidgetBuilder.updateMultiSizeWidget({
  //     small: {
  //       layout: 'zstack',
  //       backgroundColor: '#000000',
  //       children: [
  //         { type: 'image', src: NEWS_IMAGE, contentMode: 'fill', isBackground: true },
  //         { type: 'image', src: LOGO_ICON, width: 40, height: 40, alignment: 'topTrailing' },
  //         { type: 'text', value: 'MacBook Pro\nSupercharged by M3', fontSize: 14, color: '#ffffff', textAlignment: 'leading', alignment: 'bottomLeading' }
  //       ]
  //     },

  //     // MEDIUM: Larger images and a dedicated "TECH" header
  //     medium: {
  //       layout: 'vstack',
  //       backgroundColor: '#ffffff',
  //       children: [
  //         // --- APPLE NEWS STYLE HEADER ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'TECH', fontSize: 11, color: '#ff3b30' }, // Apple Red style label
  //             { type: 'spacer' },
  //             { type: 'image', src: LOGO_ICON, width: 18, height: 18 }
  //           ]
  //         },
  //         { type: 'spacer' },
  //         // --- ROW 1 (Larger Image Size) ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'Apple unveils the new M3 chip family', fontSize: 15, color: '#1a1a1a' },
  //             { type: 'spacer' },
  //             { type: 'image', src: NEWS_IMAGE, width: 40, height: 40, contentMode: 'fill' }
  //           ]
  //         },
  //         { type: 'spacer' },
  //         // --- ROW 2 ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'The future of Mac gaming is here', fontSize: 15, color: '#1a1a1a' },
  //             { type: 'spacer' },
  //             { type: 'image', src: NEWS_IMAGE, width: 40, height: 40, contentMode: 'fill' }
  //           ]
  //         }
  //       ]
  //     },

  //     // LARGE: 4 News Items with the same TECH header
  //     large: {
  //       layout: 'vstack',
  //       backgroundColor: '#ffffff',
  //       children: [
  //         // --- APPLE NEWS STYLE HEADER ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'TECH', fontSize: 11, color: '#ff3b30' },
  //             { type: 'spacer' },
  //             { type: 'image', src: LOGO_ICON, width: 18, height: 18 }
  //           ]
  //         },
  //         { type: 'spacer' },
  //         // --- ROW 1 ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'Apple unveils the new M3 chip family', fontSize: 13, color: '#1a1a1a' },
  //             { type: 'spacer' },
  //             { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
  //           ]
  //         },
  //         { type: 'spacer' },
  //         // --- ROW 2 ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'The future of Mac gaming is here', fontSize: 13, color: '#1a1a1a' },
  //             { type: 'spacer' },
  //             { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
  //           ]
  //         },
  //         { type: 'spacer' },
  //         // --- ROW 3 ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'How to choose your next MacBook', fontSize: 13, color: '#1a1a1a' },
  //             { type: 'spacer' },
  //             { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
  //           ]
  //         },
  //         { type: 'spacer' },
  //         // --- ROW 4 ---
  //         {
  //           type: 'container',
  //           layout: 'hstack',
  //           children: [
  //             { type: 'text', value: 'MacOS Sonoma: Tips and Tricks', fontSize: 13, color: '#1a1a1a' },
  //             { type: 'spacer' },
  //             { type: 'image', src: NEWS_IMAGE, width: 50, height: 50, contentMode: 'fill' }
  //           ]
  //         }
  //       ]
  //     }
  //   });
  // };

  const handleRefresh = async () => {
    await WidgetBuilder.updateMultiSizeWidget({
      remoteConfigUrl: 'http://192.168.1.100:8080/widget.json',
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

  };

  useEffect(() => {
    handleRefresh();
  });

  useEffect(() => {
    if (Platform.OS === 'web') return;

    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications was denied');
      }
    }

    requestPermissions();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    return () => subscription.remove();
  }, []);

  const [containerDimensions, setContainerDimensions] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const onContainerLayout = (event: { nativeEvent: { layout: { x: any, y: any, width: any; height: any; }; }; }) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log("height: " + height + ", width: " + width + ", x: " + x + ", y: " + y);
    setContainerDimensions({ x, y, width, height });
  };

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
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

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert('Saved!');
        }
      } catch (e) {
        console.log(e);
      }
    }
    else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* <WidgetEditor/> */}
      <View style={styles.timerList}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timerScroll}>
          <Timer title="Pizza" timerId="t1" initialSeconds={600} />
          <Timer title="Gym" timerId="t2" initialSeconds={60} />
          <Timer title="Laundry" timerId="t3" initialSeconds={1800} />
          <Timer title="Focus" timerId="t4" initialSeconds={1500} />
          {/* You can add up to 10 or more here */}
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
              <IconButton icon="refresh" label="Reset" onPress={onReset} />
              <CircleButton onPress={onAddSticker} />
              <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
            </View>
          </View>
        ) : (
          <View style={styles.footerContainer}>
            <Button label="Choose a photo" theme="primary" onPress={pickImageAsync} />
            <Button label="Use this photo" onPress={() => setShowAppOptions(true)} />
          </View>
        )}
        <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
          <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
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
  EmojiSticker: {

  },
  timerList: {
    paddingTop: 50,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});