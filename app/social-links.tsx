import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Platform,
    SafeAreaView,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { useNavigation, useRouter } from 'expo-router';
import { Button, ButtonText } from "@gluestack-ui/themed";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import { buttonStyles } from "@/constants/buttonStyles";
import SocialLinksInput from "@/components/SocialLinksInput";
import SocialLinks from "@/components/SocialLinks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateFormData } from "@/store/slices/usersSlice";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
    previewContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: Colors.grayLight,
        borderRadius: 8,
    },
    bottomButtonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.grayLight,
        backgroundColor: Colors.white,
    },
});

const Page = () => {
    const navigation = useNavigation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { formData } = useAppSelector(state => state.user);
    const [links, setLinks] = useState(formData.linksToSocial || '');
    const [hasValidLinks, setHasValidLinks] = useState(!!formData.linksToSocial);

    const handleLinksChange = (value: string) => {
        setLinks(value);
        setHasValidLinks(!!value);
    };

    useEffect(() => {
        navigation.setOptions({
            headerTitle: t('common.socialNetworks'),
            headerBackTitle: t('common.back'),
        });
    }, [t]);

    const handleSave = () => {
        dispatch(updateFormData({ name: 'linksToSocial', value: links }));
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <SocialLinksInput
                        value={links}
                        onChange={handleLinksChange}
                    />
                    {links && (
                        <View style={styles.previewContainer}>
                            <SocialLinks links={links} />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.bottomButtonContainer}>
                <Button
                    style={[buttonStyles.activeFilledButton]}
                    onPress={handleSave}
                    isDisabled={!hasValidLinks}
                    opacity={hasValidLinks ? 1 : 0.5}
                >
                    <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>
                        {t('common.save')}
                    </ButtonText>
                </Button>
            </View>
        </SafeAreaView>
    );
};

export default Page;