import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { X, Plus } from "lucide-react-native";
import Colors from "@/constants/Colors";
import { textStyles } from "@/constants/textStyles";
import { useTranslation } from "react-i18next";

interface SocialLink {
    platform: string;
    url: string;
}

interface SocialLinksInputProps {
    value: string;
    onChange: (value: string) => void;
    isInvalid?: boolean;
}

const SOCIAL_PLATFORMS = [
    { id: 'telegram', name: 'Telegram', placeholder: 't.me/username', hint: 't.me/username' },
    { id: 'instagram', name: 'Instagram', placeholder: 'instagram.com/username', hint: 'instagram.com/username' },
    { id: 'linkedin', name: 'LinkedIn', placeholder: 'linkedin.com/in/username', hint: 'linkedin.com/in/username' },
];

const isValidUrl = (url: string, platform: string): boolean => {
    const clean = url.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
    switch (platform) {
        case 'instagram': return /^instagram\.com\/[\w.]{1,30}\/?$/.test(clean);
        case 'linkedin': return /^linkedin\.com\/(in|company)\/[\w-]{3,100}\/?$/.test(clean);
        case 'telegram': return /^(t\.me|telegram\.me)\/[\w]{5,32}\/?$/.test(clean);
        default: return false;
    }
};

const normalizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
    }
    return trimmed;
};

const SocialLinksInput: React.FC<SocialLinksInputProps> = ({ value, onChange, isInvalid }) => {
    const { t } = useTranslation();

    const [links, setLinks] = useState<SocialLink[]>(() => {
        if (!value) return [];
        return value.split('|').map(link => {
            const firstColon = link.indexOf(':');
            return {
                platform: link.substring(0, firstColon),
                url: link.substring(firstColon + 1),
            };
        });
    });

    // Текущие значения инпутов для каждой платформы
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activePlatform, setActivePlatform] = useState<string>('telegram');

    const addedPlatforms = links.map(l => l.platform);
    const availablePlatforms = SOCIAL_PLATFORMS.filter(p => !addedPlatforms.includes(p.id));

    const handleInputChange = (platform: string, text: string) => {
        setInputs(prev => ({ ...prev, [platform]: text }));
        setErrors(prev => ({ ...prev, [platform]: '' }));
    };

    const handleAddLink = (platform: string) => {
        const url = inputs[platform] ?? '';
        if (!url.trim()) return;

        if (!isValidUrl(url, platform)) {
            const platformInfo = SOCIAL_PLATFORMS.find(p => p.id === platform);
            setErrors(prev => ({ ...prev, [platform]: `Введите ссылку вида: ${platformInfo?.hint}` }));
            return;
        }

        const normalized = normalizeUrl(url);
        const newLinks = [...links, { platform, url: normalized }];
        setLinks(newLinks);
        setInputs(prev => ({ ...prev, [platform]: '' }));
        setErrors(prev => ({ ...prev, [platform]: '' }));
        onChange(newLinks.map(l => `${l.platform}:${l.url}`).join('|'));

        // Переключаемся на следующую доступную платформу
        const remaining = SOCIAL_PLATFORMS.filter(p => !newLinks.map(l => l.platform).includes(p.id));
        if (remaining.length > 0) setActivePlatform(remaining[0].id);
    };

    const handleRemove = (index: number) => {
        const removed = links[index];
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
        onChange(newLinks.map(l => `${l.platform}:${l.url}`).join('|'));
        // Возвращаем платформу в список доступных
        setActivePlatform(removed.platform);
    };

    return (
        <View style={styles.container}>
            {/* Добавленные ссылки */}
            {links.map((link, index) => {
                const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
                return (
                    <View key={index} style={styles.addedLink}>
                        <View style={styles.addedLinkIcon}>
                            <Text style={styles.platformInitial}>
                                {platform?.name[0] ?? '?'}
                            </Text>
                        </View>
                        <View style={styles.addedLinkInfo}>
                            <Text style={styles.platformName}>{platform?.name}</Text>
                            <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemove(index)} style={styles.removeButton}>
                            <X size={18} color={Colors.grayDark} />
                        </TouchableOpacity>
                    </View>
                );
            })}

            {/* Табы платформ */}
            {availablePlatforms.length > 0 && (
                <View style={styles.section}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                        {availablePlatforms.map(platform => (
                            <TouchableOpacity
                                key={platform.id}
                                style={[styles.tab, activePlatform === platform.id && styles.tabActive]}
                                onPress={() => setActivePlatform(platform.id)}
                            >
                                <Text style={[styles.tabText, activePlatform === platform.id && styles.tabTextActive]}>
                                    {platform.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Инпут для активной платформы */}
                    {availablePlatforms.filter(p => p.id === activePlatform).map(platform => (
                        <View key={platform.id}>
                            <View style={[styles.inputRow, errors[platform.id] ? styles.inputRowError : null]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={platform.placeholder}
                                    placeholderTextColor={Colors.grayDark}
                                    value={inputs[platform.id] ?? ''}
                                    onChangeText={(text) => handleInputChange(platform.id, text)}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="url"
                                    onSubmitEditing={() => handleAddLink(platform.id)}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        !(inputs[platform.id]?.trim()) && styles.addButtonDisabled
                                    ]}
                                    onPress={() => handleAddLink(platform.id)}
                                    disabled={!inputs[platform.id]?.trim()}
                                >
                                    <Plus size={20} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                            {errors[platform.id] ? (
                                <Text style={styles.errorText}>{errors[platform.id]}</Text>
                            ) : null}
                        </View>
                    ))}
                </View>
            )}

            {isInvalid && links.length === 0 && (
                <Text style={styles.errorText}>{t('signup.socialLinksRequired')}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 8 },
    addedLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        gap: 10,
    },
    addedLinkIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.greenFirst,
        justifyContent: 'center',
        alignItems: 'center',
    },
    platformInitial: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    addedLinkInfo: { flex: 1 },
    platformName: { fontSize: 12, color: Colors.grayDark, marginBottom: 2 },
    linkUrl: { fontSize: 14, color: Colors.black },
    removeButton: { padding: 4 },
    section: { gap: 8 },
    tabs: { flexDirection: 'row', marginBottom: 4 },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    tabActive: { backgroundColor: Colors.greenFirst },
    tabText: { fontSize: 14, color: Colors.grayDark },
    tabTextActive: { color: Colors.white },
    inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grayDark,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,  // ← чуть больше отступ
    height: 52,       // ← чуть выше, чтобы кнопка 36px влезала с зазором
},
    inputRowError: { borderColor: 'red' },
    input: { flex: 1, fontSize: 14, color: Colors.black },
    addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.greenFirst,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',  // ← добавьте это
},
    addButtonDisabled: { backgroundColor: '#ccc' },
    addButtonText: { 
    color: Colors.white, 
    fontSize: 24, 
    textAlign: 'center',
    textAlignVertical: 'center',  // Android
    includeFontPadding: false,
},
    errorText: { fontSize: 12, color: 'red', marginLeft: 4 },
});

export default SocialLinksInput;