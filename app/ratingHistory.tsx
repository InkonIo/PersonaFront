import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import { Button, ButtonText, Icon } from "@gluestack-ui/themed";
import { buttonStyles } from "@/constants/buttonStyles";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/store/hooks";
import Stars from "@/components/Stars";
import ArrowUp from "@/assets/icons/ArrowUp";
import ArrowDown from "@/assets/icons/ArrowDown";
import { getCorrectRatingWord } from "@/app/helpers";
import { useTranslation } from 'react-i18next';
import i18n from '@/constants/i18n';

type Rating = {
    createdDate: string;
    value: number;
};

const Page = () => {
    const { t, ready, i18n } = useTranslation();

    const lang = i18n.language ?? 'ru';
    const { rating } = useAppSelector(state => state.rating);
    const router = useRouter();

    if (!ready) return null;

    return (
        // SafeAreaView теперь — корневой элемент и занимает весь экран
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Статичный хедер — рейтинг и звёзды */}
                <View style={styles.header}>
                    <View style={styles.rating}>
                        <View style={[styles.greenBox, { marginRight: 20 }]}>
                            <Text style={[textStyles.body16Medium, { color: Colors.greenSecond }]}>
                                {rating?.totalRating}%
                            </Text>
                        </View>
                        <View style={styles.greenBox}>
                            <Text style={[textStyles.body16Medium, { color: Colors.greenSecond }]}>
                                {rating?.totalRatingCount} {getCorrectRatingWord(rating?.totalRatingCount ?? 0, t, lang)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.stars}>
                        <Stars initialRating={rating?.totalRating} disabled={true} />
                    </View>
                </View>

                {/* Скролл занимает всё оставшееся место (flex: 1) между хедером и кнопкой */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {rating?.ratings?.map((rat: Rating, index: number) => (
                        <View style={styles.block} key={`${index}`}>
                            <View>
                                <Text style={[textStyles.body16Medium, { color: Colors.black, marginBottom: 8 }]}>
                                    {t('ratingHistory.profileRating')}
                                </Text>
                                <Text style={[textStyles.body12Medium, { color: Colors.grayDark }]}>
                                    {rat.createdDate}
                                </Text>
                            </View>
                            <Icon as={rat.value < 5 ? ArrowDown : ArrowUp} />
                        </View>
                    ))}
                </ScrollView>

                {/* Кнопка зафиксирована внизу, никуда не уходит */}
                <Button
    style={[buttonStyles.activeFilledButton, styles.fixedButton]}
    onPress={() => router.push('/rateAccess' as any)}
    disabled={true}
>
                    <ButtonText style={[buttonStyles.activeFilledButton, styles.fixedButton, { opacity: 0.5 }]}>
                        {t('ratingHistory.openAccess')}
                    </ButtonText>
                </Button>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // SafeAreaView растягивается на весь экран
    safeArea: {
        flex: 1,
        backgroundColor: Colors.white, // или ваш фоновый цвет
    },
    // Внутренний контейнер — колонка, занимает весь экран
    container: {
        flex: 1,
        marginHorizontal: 16,
        marginVertical: 16,
    },
    // Хедер не скроллится
    header: {
        // без flex — занимает только свою высоту
    },
    rating: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    greenBox: {
        width: 165,
        height: 80,
        borderRadius: 20,
        padding: 10,
        backgroundColor: Colors.accentThird,
        justifyContent: "center",
        alignItems: "center",
    },
    stars: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    // ScrollView забирает всё свободное пространство
    scrollView: {
        flex: 1,
        marginTop: 16,
    },
    scrollContent: {
        paddingBottom: 8,
    },
    block: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
    },
    // Кнопка всегда прибита к низу контейнера
    fixedButton: {
        marginTop: 12,
        marginBottom: 8,
    },
});

export default Page;