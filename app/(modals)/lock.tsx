import { View, StyleSheet, Text, SafeAreaView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from "expo-local-authentication";
import { textStyles } from "@/constants/textStyles";
import * as React from "react";
import { Button, ButtonText } from "@gluestack-ui/themed";
import { buttonStyles } from "@/constants/buttonStyles";
import Colors from "@/constants/Colors";
import {useAppDispatch} from "@/store/hooks";
import {getAllDictionaryData} from "@/store/slices/dictionarySlice";
import {getUserInfo} from "@/store/slices/usersSlice";

const Page = () => {
    const router = useRouter();
    const dispatch = useAppDispatch()

    const onBiometricPress = async () => {
        const { success } = await LocalAuthentication.authenticateAsync();

        if (success) {
            router.replace("/(tabs)/home");
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.centerContainer}>
                <View style={styles.imageView}>
                    <Image source={require("@/assets/images/logo.png")} style={styles.images} />
                </View>
                <View style={styles.textView}>
                    <Text style={[textStyles.body20Medium, styles.text]}>
                        Добро пожаловать, разблокируйте чтобы войти в приложение Persona
                    </Text>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <Button style={[buttonStyles.activeFilledButton]} onPress={onBiometricPress}>
                    <ButtonText>Использовать Face ID</ButtonText>
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textView: {
        marginTop: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    text: {
        color: '#000000',
        textAlign: 'center',
    },
    imageView: {
        alignItems: 'center',
    },
    images: {
        width: 128,
        height: 128,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    }
});

export default Page;
