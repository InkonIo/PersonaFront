import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface ErrorModalProps {
    visible: boolean;
    title?: string;
    message: string;
    errorType?: 'no_internet' | 'server_down' | 'server_error' | 'timeout' | 'auth_error' | 'forbidden' | 'not_found' | 'validation_error' | 'unknown' | string;
    onClose: () => void;
    onRetry?: () => void;
}

const ERROR_ICONS: Record<string, string> = {
    no_internet:      '📡',
    server_down:      '🔌',
    server_error:     '⚠️',
    timeout:          '⏱',
    auth_error:       '🔐',
    forbidden:        '🚫',
    not_found:        '🔍',
    validation_error: '📋',
    unknown:          '❓',
    default:          '❌',
};

const ErrorModal: React.FC<ErrorModalProps> = ({
    visible,
    title,
    message,
    errorType = 'default',
    onClose,
    onRetry,
}) => {
    const { t } = useTranslation();
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const slideY = useRef(new Animated.Value(60)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(slideY, {
                    toValue: 0,
                    damping: 18,
                    stiffness: 220,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    damping: 18,
                    stiffness: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(slideY, {
                    toValue: 60,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.92,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const icon = ERROR_ICONS[errorType] ?? ERROR_ICONS.default;
    const resolvedTitle = title ?? t(`errors.${errorType}`, t('errors.unknown'));

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
            </Animated.View>

            {/* Modal Card */}
            <View style={styles.centeredWrapper} pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.card,
                        {
                            transform: [{ translateY: slideY }, { scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Icon circle */}
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>{icon}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{resolvedTitle}</Text>

                    {/* Message — full text, no truncation */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        {onRetry && (
                            <TouchableOpacity
                                style={[styles.button, styles.retryButton]}
                                onPress={() => {
                                    onClose();
                                    onRetry();
                                }}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.retryText}>{t('errors.retry')}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.closeButton, !onRetry && styles.buttonFull]}
                            onPress={onClose}
                            activeOpacity={0.75}
                        >
                            <Text style={styles.closeText}>{t('errors.close')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    centeredWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: width - 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingTop: 32,
        paddingBottom: 20,
        paddingHorizontal: 24,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.18,
                shadowRadius: 24,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconText: {
        fontSize: 30,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        color: '#555555',
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#F0F0F0',
        marginTop: 24,
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    button: {
        flex: 1,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonFull: {
        flex: 1,
    },
    retryButton: {
        backgroundColor: '#8B9EB0',
    },
    retryText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    closeButton: {
        backgroundColor: '#F0F0F0',
    },
    closeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
});

export default ErrorModal;