import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '@/constants/Colors';
import { textStyles } from '@/constants/textStyles';
import { buttonStyles } from '@/constants/buttonStyles';
import FilterIcon from '@/assets/icons/FilterIcon';
import {
    Button,
    ButtonText,
    CloseIcon,
    Heading,
    Icon,
    Input,
    InputField,
    InputIcon,
    InputSlot,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    SearchIcon,
} from '@gluestack-ui/themed';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearProfiles, getProfiles } from '@/store/slices/profileSlice';
import { searchMapper } from '@/mappers/search-mapper';
import Onboarding from '@/components/Onboarding';
import VoiceSearchModal from '@/components/VoiceSearchModal';
import { Link, useFocusEffect, useNavigation, useRouter } from 'expo-router';
import Stars from '@/components/Stars';
import Chips from '@/components/Chips';
import { StackActions } from '@react-navigation/native';
import Filter from '@/components/Filter';
import { usePushNotifications } from '@/hooks/usePushNotification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUserToken } from '@/store/slices/usersSlice';
import { fetchUserNotification } from '@/store/slices/notificationSlice';
import * as Notifications from 'expo-notifications';
import { getCorrectRatingWord } from '@/app/helpers';
import { useTranslation } from 'react-i18next';
import { getLocalizedName } from '@/store/slices/dictionarySlice';
import UserAvatar from '@/components/UserAvatar';
import { checkForRating, setRating } from '@/store/slices/ratingsSlice';
import { updateUserRatingOptimistic } from '@/store/slices/profileSlice';


const getLocalizedStatus = (status: any, lang: string): string => {
    if (!status) return '';
    if (lang === 'ru') return status.nameRu ?? status.name ?? '';
    if (lang === 'kz') return status.nameKz ?? status.name ?? '';
    return status.nameEn ?? status.name ?? '';
};


const Page = () => {
    const { expoPushToken, notification } = usePushNotifications();
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [sortBy, setSortBy] = useState('RATING');
    const navigation = useNavigation();
    const { searchFields, loading: homeLoading } = useAppSelector((state) => state.home);
    const { profiles, loading: profileLoading } = useAppSelector((state) => state.profile);
    const { userInfo, loading: userLoading } = useAppSelector((state) => state.user);
    const { loading: dictionaryLoading } = useAppSelector((state) => state.dictionary);
    const { isRatingSetted } = useAppSelector((state) => state.rating);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Rating modal state
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserItem, setSelectedUserItem] = useState<any>(null);
    const [starRating, setStarRating] = useState(0);
    const rateModalRef = useRef(null);

    const shouldRefetchRef = useRef(true);

    const searchFieldsRef = useRef(searchFields);
    const sortByRef = useRef(sortBy);

    useEffect(() => { searchFieldsRef.current = searchFields; }, [searchFields]);
    useEffect(() => { sortByRef.current = sortBy; }, [sortBy]);

    const fetchProfiles = useCallback((pageNum: number) => {
        const searchFieldsBack = searchMapper(searchFieldsRef.current);
        const params = { ...searchFieldsBack, sortBy: sortByRef.current, page: pageNum, size };
        return dispatch(getProfiles(params))
            .unwrap()
            .then(() => setLoadingMore(false));
    }, [size, dispatch]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        shouldRefetchRef.current = true;
        dispatch(clearProfiles());
        setPage(0);
        fetchProfiles(0).finally(() => setRefreshing(false));
    }, [fetchProfiles]);

    const handleSortBy = (sortType: any) => {
        setSortBy(sortType === sortBy ? null : sortType);
    };

    const onApplySort = async () => {
        if (!sortBy) return;
        setIsSubmitting(true);
        shouldRefetchRef.current = true;
        dispatch(clearProfiles());
        setPage(0);
        try {
            await fetchProfiles(0);
        } finally {
            setIsSubmitting(false);
            toggleModal();
        }
    };

    const toggleModal = () => {
        setIsModalVisible((prev) => !prev);
    };

    // Rating modal handlers
    const handleOpenRateModal = (item: any) => {
        setSelectedUserId(String(item.id));
        setSelectedUserItem(item);
        setStarRating(0);
        dispatch(checkForRating({ id: String(item.id) }));
        setRateModalVisible(true);
    };

    const handleCloseRateModal = () => {
        setRateModalVisible(false);
        setSelectedUserId(null);
        setSelectedUserItem(null);
        setStarRating(0);
    };

    const sendRatingToBackend = async () => {
        if (starRating === 0 || !selectedUserId || !selectedUserItem) return;

        try {
            await dispatch(setRating({ id: selectedUserId, value: starRating })).unwrap();

            const currentRating = selectedUserItem?.rating ?? 0;
            const currentCount  = selectedUserItem?.ratingCount ?? 0;
            const isUpdate      = isRatingSetted?.value != null;

            const prevValuePercent = isUpdate ? (isRatingSetted!.value * 10) : 0;
            const newValuePercent  = starRating * 10;
            const newCount         = isUpdate ? currentCount : currentCount + 1;

            const newRating = Math.round(
                (currentRating * currentCount - prevValuePercent + newValuePercent) / newCount
            );

            dispatch(updateUserRatingOptimistic({ userId: selectedUserId, newRating, newCount }));

            handleCloseRateModal();
            dispatch(checkForRating({ id: selectedUserId }));
            Alert.alert(t('userProfile.ratingTitle'), t('userProfile.ratingSuccess'), [{ text: 'OK' }]);
        } catch (err: any) {
            setStarRating(0);
            Alert.alert(t('common.error'), err.message || t('common.errorMessage'), [{ text: 'OK' }]);
        }
    };

    useEffect(() => {
        const checkOnboarding = async () => {
            const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
            if (!hasSeenOnboarding) {
                setShowOnboarding(true);
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            }
        };
        checkOnboarding();
    }, []);

    useEffect(() => {
        if (expoPushToken) {
            dispatch(registerUserToken(expoPushToken?.data as string));
        }
    }, [expoPushToken]);

    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(() => {
            if (userInfo?.id) {
                dispatch(fetchUserNotification(userInfo.id));
            }
        });
        return () => { subscription.remove(); };
    }, [userInfo, dispatch]);

    useFocusEffect(
        useCallback(() => {
            if (!shouldRefetchRef.current) return;
            shouldRefetchRef.current = false;
            setPage(0);
            fetchProfiles(0);
        }, [fetchProfiles]),
    );

    const handleVoiceResult = (text: string) => {
        setShowVoiceModal(false);
        router.push({ pathname: '/search', params: { query: text } } as any);
    };

    const renderItem = useCallback(
        ({ item, index }: { item: any; index: number }) => {
            return (
                <Link href={`/user/${item.id}`} key={`${item.id}-${item.rating}`} asChild>
                    <Pressable>
                        <View style={[index === profiles?.content?.length - 1 ? undefined : styles.border]} key={item.id}>
                            <View style={styles.card}>
                                <View style={styles.imageWrapper}>
                                    <UserAvatar uri={item.imageUrl} style={styles.images} />
                                    <Text style={[textStyles.body12Light, { color: Colors.grayDark, marginTop: 8, marginLeft: 10 }]}>
                                        {`${item.days} ${t('home.daysInProject')}`}
                                    </Text>
                                </View>
                                <View style={styles.personInfo}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[textStyles.body12Light, { color: Colors.text, marginRight: 4 }]}>ID: {item.id}</Text>
                                        {item.hasSubscription && (
                                            <Image source={require('@/assets/images/premiumUser.png')} style={{ width: 60, height: 13 }} />
                                        )}
                                    </View>
                                    <Text
                                        style={[textStyles.body16Medium, { color: Colors.text, marginTop: 8 }]}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {`${item.fullName}, ${item.age}`}
                                    </Text>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 }}>
    <Text style={[textStyles.body12Light, { color: Colors.text }]}>{t('home.status')}:</Text>
    <Chips
        case="fill"
        text={item?.status ? getLocalizedStatus(item.status, i18n.language) : t('userProfile.notSet')}
        style={{ marginLeft: 8, width: '50%' }}
    />
</View>
                                    <Text style={[textStyles.body12Light, { color: Colors.text, marginTop: 8, fontWeight: '700' }]}>
                                        {`${t('home.rating')} ${item.rating}% (${item.ratingCount} ${getCorrectRatingWord(item.ratingCount, t, i18n.language)})`}
                                    </Text>
                                    <Text style={[textStyles.body12Light, { color: Colors.text, marginTop: 8 }]}>
                                        {[getLocalizedName(item.country), getLocalizedName(item.city)].filter(Boolean).join(', ')}
                                    </Text>
                                    <Stars initialRating={item.rating / 10} disabled={true} />
                                    {item.isMentor && (
                                        <Button style={[buttonStyles.activeStrokeButton, { height: 30 }]} marginTop={8}>
                                            <ButtonText style={[textStyles.body12Light, { color: Colors.greenSecond }]}>{t('home.mentor')}</ButtonText>
                                        </Button>
                                    )}
                                </View>
                            </View>
                            <Button
                                style={[buttonStyles.activeFilledButton]}
                                marginTop={8}
                                marginBottom={16}
                                marginHorizontal={16}
                                onPress={(e) => {
                                    e.stopPropagation?.();
                                    handleOpenRateModal(item);
                                }}
                            >
                                <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>{t('userProfile.rateButton')}</ButtonText>
                            </Button>
                        </View>
                    </Pressable>
                </Link>
            );
        },
        [profiles?.content, navigation, i18n.language],
    );

    const loadMoreProfiles = () => {
        if (loadingMore || profiles?.number >= profiles?.totalPages - 1) return;
        const nextPage = page + 1;
        setPage(nextPage);
        setLoadingMore(true);
        fetchProfiles(nextPage);
    };

    return (
        <View style={[styles.container]}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text
                            style={[textStyles.body20Medium, { color: Colors.black, marginTop: 16 }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {t('home.hello')}, {userInfo?.fullName}
                        </Text>
                    </View>
                    <View style={styles.icon}>
                        <TouchableOpacity onPress={toggleModal}>
                            <FilterIcon />
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <Input
                        borderRadius={20}
                        marginHorizontal={16}
                        marginTop={16}
                        onTouchStart={() => navigation.dispatch(StackActions.push('search'))}
                        isReadOnly
                    >
                        <InputSlot style={{ marginLeft: 12 }}>
                            <InputIcon as={SearchIcon} />
                        </InputSlot>
                        <InputField placeholder={t('home.search')} />
                    </Input>
                </View>

                <View style={[styles.listing, { flex: 1 }]}>
                    <FlatList
                        data={profiles?.content || []}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        onEndReached={loadMoreProfiles}
                        onEndReachedThreshold={0.1}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListFooterComponent={
                            loadingMore ? (
                                <View style={styles.footerLoading}>
                                    <ActivityIndicator size="large" color="#aaa" />
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            !profileLoading && !loadingMore ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>{t('home.noProfiles')}</Text>
                                </View>
                            ) : null
                        }
                    />
                </View>

                <Filter
                    sortBy={sortBy}
                    handleSortBy={handleSortBy}
                    handleModalVisible={toggleModal}
                    isModalVisible={isModalVisible}
                    onApplySort={onApplySort}
                />
            </SafeAreaView>

            {/* Rating Modal */}
            <Modal isOpen={rateModalVisible} onClose={handleCloseRateModal} finalFocusRef={rateModalRef}>
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">{t('userProfile.ratingTitle')}</Heading>
                        <ModalCloseButton>
                            <Icon as={CloseIcon} />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Text style={[textStyles.body12Light, { color: Colors.grayDark, marginBottom: 12 }]}>
                            {t('userProfile.ratingPrompt')}
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 8 }}>
                            <Stars
                                key={`modal-${rateModalVisible}-${selectedUserId}`}
                                initialRating={starRating}
                                size={24}
                                onRatingChange={(rating) => setStarRating(rating)}
                                disabled={false}
                            />
                        </View>
                    </ModalBody>
                    <ModalFooter>
    <Button 
        // Добавляем marginRight: 16 для отступа
        style={[buttonStyles.activeTextButton, { marginRight: 16 }]} 
        onPress={handleCloseRateModal}
    >
        {/* Добавляем цвет текста, чтобы он не был белым */}
        <ButtonText style={{ color: Colors.grayDark }}>
            {t('common.cancel')}
        </ButtonText>
    </Button>
    
    <Button
        style={[buttonStyles.activeFilledButton]}
        onPress={sendRatingToBackend}
        isDisabled={starRating === 0}
    >
        <ButtonText>{t('common.save')}</ButtonText>
    </Button>
</ModalFooter>
                </ModalContent>
            </Modal>

            {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}

            {isSubmitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.greenSecond} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    icon: {
        alignSelf: 'flex-end',
        paddingBottom: 4,
    },
    listing: {
        backgroundColor: Colors.grayLight,
        marginTop: 16,
    },
    card: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    images: {
        width: 128,
        height: 128,
        borderRadius: 20,
    },
    imageWrapper: {
        width: '40%',
        minHeight: 128,
    },
    personInfo: {
        width: '60%',
        overflow: 'hidden',
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: '#ababad',
    },
    footerLoading: {
        paddingVertical: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});

export default Page;