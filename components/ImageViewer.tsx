// components/ImageViewer.tsx
import { ImageSourcePropType, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  imgSource: ImageSourcePropType;
  selectedImage?: string;
  onLayout?: (event: LayoutChangeEvent) => void; // Add this prop
};

export default function ImageViewer({ imgSource, selectedImage, onLayout }: Props) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;
  
  return (
    <Image 
      source={imageSource} 
      style={styles.image} 
      onLayout={onLayout} // Attach it here
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
