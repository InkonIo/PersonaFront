import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Stack } from 'expo-router';
import { ChevronLeftIcon } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { textStyles } from '@/constants/textStyles';
import { instance } from '@/store/api';

const FeedbackScreen = () => {
    const navigation = useNavigation();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Ошибка', 'Заполните все поля');
            return;
        }

        setLoading(true);
        try {
            await instance.post('http://91.224.74.12:8080/api/users/feedback', {
                subject,
                message,
            });
            Alert.alert('Успех', 'Ваше сообщение отправлено', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось отправить сообщение');
        } finally {
            setLoading(false);
        }
    };

    return (
        // FIX 1: Убираем кастомный View-хедер, используем только Stack.Screen
        // Это исключает двойной заголовок полностью
        <>
            <Stack.Screen
                options={{
                    title: 'Обратная связь',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}
                        >
                            <ChevronLeftIcon color={Colors.text} size={24} />
                        </TouchableOpacity>
                    ),
                    // Стилизуем системный header под гайдлайны приложения
                    headerTitleStyle: textStyles.body20Medium,
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                    headerShadowVisible: true,
                }}
            />

            <SafeAreaView style={styles.container}>
                {/*
                  FIX 2: KeyboardAvoidingView оборачивает и ScrollView, И кнопку.
                  - behavior="padding" на iOS: KAV добавляет padding снизу равный
                    высоте клавиатуры, поднимая весь контент включая footer.
                  - behavior="height" нестабилен — не используем.
                  - На Android ставим undefined: ОС сама двигает layout через
                    android:windowSoftInputMode="adjustResize" в AndroidManifest.
                    Если его нет — используй "padding" и на Android тоже.
                */}
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={[textStyles.body16Medium, { marginBottom: 8 }]}>
                            Тема обращения
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={subject}
                            onChangeText={setSubject}
                            placeholder="Напр: Проблема с оплатой"
                            placeholderTextColor={Colors.grayDark}
                            returnKeyType="next"
                        />

                        <Text style={[textStyles.body16Medium, { marginBottom: 8, marginTop: 16 }]}>
                            Сообщение
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Опишите вашу проблему подробно..."
                            placeholderTextColor={Colors.grayDark}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </ScrollView>

                    {/*
                      Кнопка внутри KAV, но вне ScrollView.
                      Теперь она поднимается вместе с KAV при появлении клавиатуры
                      и не мерцает — она часть единого layout-блока.
                    */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.sendBtn, loading && { opacity: 0.7 }]}
                            onPress={handleSend}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.sendBtnText}>Отправить</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backBtn: {
        padding: 8,
    },
    scrollContent: {
        padding: 20,
        // Позволяет ScrollView тянуться, чтобы контент не перекрывался кнопкой
        flexGrow: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.grayLight,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: Colors.text,
        backgroundColor: '#F9F9F9',
    },
    textArea: {
        height: 150,
        paddingTop: 14,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.grayLight,
        backgroundColor: '#fff',
    },
    sendBtn: {
        backgroundColor: Colors.greenFirst,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default FeedbackScreen;