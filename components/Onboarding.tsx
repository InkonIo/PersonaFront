import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

interface OnboardingProps {
    onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const slides = [
        {
            id: '1',
            image: require('@/assets/images/first.jpg'),
            text: t('onboarding.slide1'),
        },
        {
            id: '2',
            image: require('@/assets/images/second.jpg'),
            text: t('onboarding.slide2'),
        },
        {
            id: '3',
            image: require('@/assets/images/third.jpg'),
            text: t('onboarding.slide3'),
        },
    ];

    const goToNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        } else {
            onClose();
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    return (
        <Modal transparent animationType="slide" visible statusBarTranslucent>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <FlatList
                        ref={flatListRef}
                        data={slides}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        style={{ flexGrow: 0 }}
                        renderItem={({ item }) => (
                            <View style={styles.slide}>
                                <Image source={item.image} style={styles.image} resizeMode="contain" />
                                <Text style={styles.text}>{item.text}</Text>
                            </View>
                        )}
                    />

                    <View style={styles.dotsContainer}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentIndex ? styles.dotActive : styles.dotInactive,
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={onClose} style={styles.skipButton}>
                            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={goToNext} style={styles.nextButton}>
                            <Text style={styles.nextText}>
                                {currentIndex === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: height * 0.80,
    },
    slide: {
        width,
        alignItems: 'center',
        paddingTop: 32,
        paddingHorizontal: 32,
    },
    image: {
        width: width * 0.6,
        height: height * 0.22,
        maxHeight: 220,
    },
    text: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 22,
        flexShrink: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: '#333',
    },
    dotInactive: {
        backgroundColor: '#ccc',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        paddingHorizontal: 24,
    },
    skipButton: {
        padding: 12,
    },
    skipText: {
        fontSize: 14,
        color: '#666',
    },
    nextButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 24,
        paddingVertical: 14,
        paddingHorizontal: 48,
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Onboarding;