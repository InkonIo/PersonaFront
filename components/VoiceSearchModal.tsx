import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from '@jamsch/expo-speech-recognition';
import { useTranslation } from 'react-i18next';

type VoiceState = 'idle' | 'error' | 'success';

interface VoiceSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onResult: (text: string) => void;
}

const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ visible, onClose, onResult }) => {
    const { t, i18n } = useTranslation();
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [transcript, setTranscript] = useState('');

    // Маппинг языка приложения → язык для распознавания речи
    const getSpeechLang = () => {
        const lang = i18n.language;
        if (lang === 'kz') return 'kk-KZ';
        if (lang === 'en') return 'en-US';
        return 'ru-RU';
    };

    useSpeechRecognitionEvent('start', () => {
        setVoiceState('idle');
        setTranscript('');
    });

    useSpeechRecognitionEvent('result', (event) => {
        const text = event.results[0]?.transcript ?? '';
        setTranscript(text);
        if (text) {
            setVoiceState('success');
        }
    });

    useSpeechRecognitionEvent('error', () => {
        setVoiceState('error');
    });

    useSpeechRecognitionEvent('end', () => {
        if (voiceState === 'success' && transcript) {
            onResult(transcript);
        }
    });

    useEffect(() => {
        if (visible) {
            startListening();
        } else {
            ExpoSpeechRecognitionModule.stop();
            setVoiceState('idle');
            setTranscript('');
        }
    }, [visible]);

    const startListening = async () => {
        const status = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!status.granted) {
            setVoiceState('error');
            return;
        }
        setVoiceState('idle');
        setTranscript('');
        ExpoSpeechRecognitionModule.start({
            lang: getSpeechLang(),
            interimResults: true,
            continuous: false,
        });
    };

    const getMicColor = () => {
        if (voiceState === 'error') return '#F44336';
        if (voiceState === 'success') return '#4CAF50';
        return '#9E9E9E';
    };

    const getMessage = () => {
        if (voiceState === 'error') return t('voiceSearch.error');
        if (voiceState === 'success') return transcript;
        return t('voiceSearch.listening');
    };

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={[styles.micButton, { backgroundColor: getMicColor() }]}
                        onPress={voiceState === 'error' ? startListening : undefined}
                        activeOpacity={voiceState === 'error' ? 0.7 : 1}
                    >
                        <Text style={styles.micIcon}>🎤</Text>
                    </TouchableOpacity>
                    <Text style={styles.message}>{getMessage()}</Text>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        width: 260,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    micButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    micIcon: {
        fontSize: 24,
    },
    message: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default VoiceSearchModal;