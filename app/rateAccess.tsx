import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Linking, Alert } from "react-native";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import { Button, ButtonText } from "@gluestack-ui/themed";
import { buttonStyles } from "@/constants/buttonStyles";
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createPayment, getPaymentHistory } from "@/store/slices/paymentSlice";

const TARIFFS = [
    { id: "10$", label: "10$", amount: 10 },
    { id: "100$", label: "100$", amount: 100 },
    { id: "500$", label: "500$", amount: 500 },
    { id: "3000$", label: "3 000$", amount: 3000 },
    { id: "10000$", label: "10 000$", amount: 10000 },
];

const Page = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { paymentHistory, loading, paymentUrl } = useAppSelector(state => state.payment);
    const [selectedTariff, setSelectedTariff] = useState<typeof TARIFFS[0] | null>(null);

    useEffect(() => {
        dispatch(getPaymentHistory());
    }, []);

    useEffect(() => {
        if (paymentUrl) {
            Linking.openURL(paymentUrl).catch(() => {
                Alert.alert(t('common.error'), t('common.errorMessage'));
            });
        }
    }, [paymentUrl]);

    const handleTariffPress = (tariff: typeof TARIFFS[0]) => {
        setSelectedTariff(prev => prev?.id === tariff.id ? null : tariff);
    };

    const handlePayment = () => {
        if (!selectedTariff) return;
        dispatch(createPayment({
            tariff: selectedTariff.id,
            amount: selectedTariff.amount,
        }));
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={[textStyles.body20Medium, { color: Colors.text }]}>
                    {t('rateAccess.subscriptionFee')}
                </Text>

                <View style={styles.tarrifs}>
                    <View style={styles.row}>
                        {TARIFFS.slice(0, 2).map(tariff => (
                            <TouchableOpacity
                                key={tariff.id}
                                style={[styles.tarrifsBox, {
                                    backgroundColor: selectedTariff?.id === tariff.id ? Colors.accentThird : Colors.white
                                }]}
                                onPress={() => handleTariffPress(tariff)}
                            >
                                <Text style={[textStyles.body16Medium, { color: Colors.greenSecond }]}>{tariff.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.row}>
                        {TARIFFS.slice(2, 4).map(tariff => (
                            <TouchableOpacity
                                key={tariff.id}
                                style={[styles.tarrifsBox, {
                                    backgroundColor: selectedTariff?.id === tariff.id ? Colors.accentThird : Colors.white
                                }]}
                                onPress={() => handleTariffPress(tariff)}
                            >
                                <Text style={[textStyles.body16Medium, { color: Colors.greenSecond }]}>{tariff.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.fullWidth}>
                        <TouchableOpacity
                            style={[styles.tarrifsBox, {
                                backgroundColor: selectedTariff?.id === TARIFFS[4].id ? Colors.accentThird : Colors.white,
                                width: "100%"
                            }]}
                            onPress={() => handleTariffPress(TARIFFS[4])}
                        >
                            <Text style={[textStyles.body16Medium, { color: Colors.greenSecond }]}>{TARIFFS[4].label}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginTop: 30, flex: 1 }}>
                    <Text style={[textStyles.body20Medium, { color: Colors.text }]}>
                        {t('rateAccess.paymentHistory')}
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.greenSecond} style={{ marginTop: 20 }} />
                    ) : (
                        <ScrollView>
                            <View style={styles.paymentHistory}>
                                {paymentHistory.map(payment => (
                                    <View style={styles.block} key={payment.id}>
                                        <View>
                                            <Text style={[textStyles.body16Medium, { color: Colors.black, marginBottom: 8 }]}>
                                                {t(payment.titleKey)}
                                            </Text>
                                            <Text style={[textStyles.body16Medium, { color: Colors.grayDark }]}>
                                                {t(payment.descriptionKey)}
                                            </Text>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                            <Text style={[textStyles.body16Medium, { color: Colors.text }]}>
                                                {payment.date}
                                            </Text>
                                            <Text style={[textStyles.body16Medium, { color: Colors.text, marginTop: 8 }]}>
                                                {payment.amount}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>

            <Button
                style={[buttonStyles.activeFilledButton, { marginBottom: 20 }]}
                onPress={handlePayment}
                isDisabled={!selectedTariff || loading}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>
                        {t('rateAccess.proceedToPayment')}
                    </ButtonText>
                )}
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 16,
        marginVertical: 16,
    },
    tarrifs: {
        marginTop: 30,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginBottom: 16,
    },
    fullWidth: {
        alignItems: "center",
    },
    tarrifsBox: {
        width: "50%",
        height: 80,
        borderRadius: 20,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.greenSecond,
        marginLeft: 16,
        marginRight: 16,
    },
    paymentHistory: {
        marginTop: 16,
    },
    block: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
    },
});

export default Page;