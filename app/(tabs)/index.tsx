import { Text, View, StyleSheet, Platform, NativeModules } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as MediaLibrary from 'expo-media-library';

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

// Ensure this runs when your app starts
const PlaceholderImage = require('@/assets/images/background-image.png');
const RNShared = NativeModules.RNShared;

// const { status } = await Notifications.requestPermissionsAsync();
// if (status !== 'granted') {
//   alert('Failed to get push token for push notification!');
// }
export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({granularPermissions: ['photo']});
  const imageRef = useRef<View>(null);
  
  Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Add these two lines to satisfy the new TypeScript requirements:
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

  useEffect(() => {
    // 2. Request permissions on mount
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications was denied');
      }
    }
    
    requestPermissions();

    // 3. Listen for incoming notifications (useful for debugging)
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    return () => subscription.remove();
  }, []);


  // 1. Create state to store dimensions
  const [containerDimensions, setContainerDimensions] = useState({ x:0, y:0, width: 0, height: 0 });
  
  // 2. Define the missing function
  const onContainerLayout = (event: { nativeEvent: { layout: { x: any, y:any, width: any; height: any; }; }; }) => {
    const {x, y, width, height } = event.nativeEvent.layout;
    console.log("height: " + height + ", width: " + width + ", x: " + x + ", y: " + y);
    setContainerDimensions({x, y, width, height }); // Save the parent's size
  };
  
  const updateWidget = (localUri:any) => {
    // Make sure the key matches exactly what you use in Java: "sharedImageUrl"
    RNShared.setData("sharedImageUrl", localUri, (result:any) => {
        console.log("Widget updated:", result);
    });
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
          updateWidget(localUri); 
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
    <Text>
      <Timer/>
    </Text>
    <View style={styles.container}>
      <View style={styles.imageContainer}>
         <View ref={imageRef} collapsable={false}>
            <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} onLayout={onContainerLayout}/>
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
        <Button label="Choose a photo" theme="primary" onPress={pickImageAsync}/>
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

  }
});