import { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ScrollView,
} from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Image } from 'expo-image';
import {
    Button,
    ButtonText,
    Center,
    Input,
    InputField,
    InputIcon,
    InputSlot
} from "@gluestack-ui/themed";
import {
    changeUserVisible,
    getUserInfo,
    resetFormData,
    setImageUrl,
    setImageUrlForBackend,
    setUserInfo,
    updateUserInfoOptimistic
} from "@/store/slices/usersSlice";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import { buttonStyles } from "@/constants/buttonStyles";
import BottomSheet from "@gorhom/bottom-sheet";
import { StackActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { ChevronRightIcon, SettingsIcon, ShieldIcon, Share2Icon as ShareIcon } from "lucide-react-native";
import { getRating } from "@/store/slices/ratingsSlice";
import AnketVisible from "@/components/AnketVisible";
import { logout } from "@/store/slices/authSlice";
import { useTranslation } from 'react-i18next';
import { Share, StatusBar, Platform } from 'react-native';

const Page = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { userInfo } = useAppSelector(state => state.user);
    const navigation = useNavigation();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showComingSoonModal, setShowComingSoonModal] = useState(false);

    const isAdmin = userInfo?.role === 'admin';

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                dispatch(getUserInfo()).unwrap(),
                dispatch(getRating(userInfo?.id)).unwrap()
            ]);
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        dispatch(getRating(userInfo?.id));
    }, []);


    
    const handleOpenPress = () => {
    setShowBottomSheet(true); // сначала монтируем
};

    const handleToggle = async () => {
    const newVisible = !userInfo?.visible;
    dispatch(updateUserInfoOptimistic({ visible: newVisible }));

    return dispatch(changeUserVisible())
        .unwrap()
        .catch((err: any) => {
            dispatch(updateUserInfoOptimistic({ visible: !newVisible }));
            Alert.alert(t('profile.visibilityAlert'), err.message, [{ text: 'OK' }]);
        });
};

    const handleLogout = () => {
    dispatch(logout());
    // всё, больше ничего
};

    const handleShare = async () => {
    try {
        await Share.share({
            message: `${userInfo?.fullName}\nhttps://personabest.com/user/${userInfo?.id}`,
        });
    } catch (error) {
        console.error(error);
    }
};

return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.text}
                    />
                }
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* ─── Avatar ─── */}
                {userInfo?.imageUrl && userInfo.imageUrl.trim() !== '' ? (
                    <View style={{ marginTop: 12 }}>
                        <Center>
                            <Image source={{ uri: userInfo.imageUrl }} style={styles.image} />
                        </Center>
                    </View>
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={[textStyles.body20Medium, { color: Colors.grayDark }]}>
                            {userInfo?.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                        </Text>
                    </View>
                )}

                {/* ─── User info ─── */}
                <Center style={{ marginTop: 16, paddingHorizontal: 24 }}>
                    <Text style={[textStyles.body20Medium, { color: Colors.text }]}>
                        ID: {userInfo?.id}
                    </Text>
                    <Text
                        style={[textStyles.body20Medium, { color: Colors.text, textAlign: 'center' }]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {`${userInfo?.fullName}, ${userInfo?.age}`}
                    </Text>
                </Center>

                {/* ─── Action buttons ─── */}
                <View style={{ marginHorizontal: 16, marginTop: 32 }}>
                    <Button
    style={[buttonStyles.activeFilledButton, { marginBottom: 16 }]}
    onPress={() => setShowComingSoonModal(true)}
>
    <ButtonText style={{ color: Colors.white }}>
        {t('profile.rating')}
    </ButtonText>
</Button>
                    <Button
                        style={[buttonStyles.activeFilledButton]}
                        onPress={handleOpenPress}
                    >
                        <ButtonText style={{ color: Colors.white }}>
                            {t('profile.visibility')}
                        </ButtonText>
                    </Button>
                </View>

                {/* ─── Menu rows ─── */}
                <View style={{ marginHorizontal: 16, marginTop: 32 }}>

                    {/* Edit profile */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            dispatch(resetFormData());
                            dispatch(setImageUrl(""));
                            dispatch(setImageUrlForBackend(""));
                            navigation.dispatch(StackActions.push("signup"));
                        }}
                    >
                        <Input borderRadius={16} isReadOnly mb={8} pointerEvents="none">
                            <InputField
                                placeholder={t('profile.editProfile')}
                                style={[textStyles.body16Light]}
                            />
                            <InputSlot style={{ marginRight: 12 }}>
                                <InputIcon as={ChevronRightIcon} />
                            </InputSlot>
                        </Input>
                    </TouchableOpacity>

                    {/* About */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.dispatch(StackActions.push("about"))}
                    >
                        <Input borderRadius={16} isReadOnly pointerEvents="none">
                            <InputField
                                placeholder={t('profile.about')}
                                style={[textStyles.body16Light]}
                            />
                            <InputSlot style={{ marginRight: 12 }}>
                                <InputIcon as={ChevronRightIcon} />
                            </InputSlot>
                        </Input>
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleShare}
                    >
                        <Input borderRadius={16} mt={8} isReadOnly pointerEvents="none">
                            <InputField
                                placeholder={t('profile.share', 'Поделиться профилем')}
                                style={[textStyles.body16Light]}
                            />
                            <InputSlot style={{ marginRight: 12 }}>
                                <InputIcon as={ShareIcon} />
                            </InputSlot>
                        </Input>
                    </TouchableOpacity>

                    {/* Feedback */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.dispatch(StackActions.push("feedback"))}
                    >
                        <Input borderRadius={16} mt={8} isReadOnly pointerEvents="none">
                            <InputField
                                placeholder={t('profile.feedback')}
                                style={[textStyles.body16Light]}
                            />
                            <InputSlot style={{ marginRight: 12 }}>
                                <InputIcon as={ChevronRightIcon} />
                            </InputSlot>
                        </Input>
                    </TouchableOpacity>

                    {/* Logout */}
                    <TouchableOpacity activeOpacity={0.7} onPress={handleLogout}>
                        <Input borderRadius={16} isReadOnly marginTop={8} pointerEvents="none">
                            <InputField
                                placeholder={t('profile.logout')}
                                style={[textStyles.body16Light]}
                            />
                            <InputSlot style={{ marginRight: 12 }}>
                                <InputIcon as={ChevronRightIcon} />
                            </InputSlot>
                        </Input>
                    </TouchableOpacity>

                    {/* Settings */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.dispatch(StackActions.push("settings"))}
                    >
                        <Input borderRadius={16} isReadOnly marginTop={8} pointerEvents="none">
                            <InputField
                                placeholder={t('profile.settings', 'Настройки')}
                                style={[textStyles.body16Light]}
                            />
                            <InputSlot style={{ marginRight: 12 }}>
                                <InputIcon as={SettingsIcon} />
                            </InputSlot>
                        </Input>
                    </TouchableOpacity>

                    {/* Admin panel */}
                    {isAdmin && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.dispatch(StackActions.push("adminPanel"))}
                        >
                            <Input borderRadius={16} isReadOnly marginTop={8} pointerEvents="none">
                                <InputField
                                    placeholder={t('profile.adminPanel', 'Панель администратора')}
                                    style={[textStyles.body16Light, { color: '#FF3B30' }]}
                                />
                                <InputSlot style={{ marginRight: 12 }}>
                                    <InputIcon as={ShieldIcon} color="#FF3B30" />
                                </InputSlot>
                            </Input>
                        </TouchableOpacity>
                    )}

                    <View style={{ height: 32 }} />
                </View>
            </ScrollView>

            {showBottomSheet && (
                <AnketVisible
                    onClose={() => setShowBottomSheet(false)}
                    handleToggle={handleToggle}
                />
            )}
        </View>

        {showComingSoonModal && (
    <View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    }}>
        <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 28,
            marginHorizontal: 32,
            alignItems: 'center',
        }}>
            <Text style={[textStyles.body20Medium, { color: Colors.text, marginBottom: 8 }]}>
                🚀
            </Text>
            <Text style={[textStyles.body20Medium, { color: Colors.text, marginBottom: 8, textAlign: 'center' }]}>
                {t('common.comingSoon')}
            </Text>
            <Text style={[textStyles.body16Light, { color: Colors.grayDark, textAlign: 'center', marginBottom: 24 }]}>
                {t('common.comingSoonMsg')}
            </Text>
            <Button
                style={[buttonStyles.activeFilledButton]}
                onPress={() => setShowComingSoonModal(false)}
            >
                <ButtonText style={{ color: Colors.white }}>{t('common.close')}</ButtonText>
            </Button>
        </View>
    </View>
)}
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0,
},
    image: {
        width: 128,
        height: 128,
        marginTop: 16,
        borderRadius: 64,
    },
    avatarPlaceholder: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#E8E8E8',
        marginTop: 20,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Page;