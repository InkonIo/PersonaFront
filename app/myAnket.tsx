import {View, SafeAreaView, StyleSheet, ScrollView} from "react-native";
import {useAppSelector} from "@/store/hooks";
import {Image} from "expo-image";
import {
    Button, ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Input,
    InputField,
    VStack
} from "@gluestack-ui/themed";
import {textStyles} from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import {buttonStyles} from "@/constants/buttonStyles";
import { useNavigation} from "expo-router";
import {StackActions} from "@react-navigation/native";
import {useTranslation} from "react-i18next";
import {getLocalizedName} from "@/store/slices/dictionarySlice";
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const Page = () => {
    const {t} = useTranslation();
    const navigation = useNavigation();
    const {formData, imageUrl} = useAppSelector(state => state.user)
    const insets = useSafeAreaInsets();


    return (
        <View style={styles.container}>
            <SafeAreaView>
                <ScrollView>
                    <View style={styles.form}>
                        <VStack space="xl">
                            <View style={styles.row}>
                                <Image source={imageUrl} alt="аватар" style={styles.image}/>
                                <VStack space="xs" style={styles.inputContainer}>
                                    <FormControl isRequired={false} isDisabled={true}>
                                        <FormControlLabel>
                                            <FormControlLabelText
                                                style={textStyles.body12Light}
                                                color={Colors.grayDark}
                                            >
                                                {t('signup.fullName')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input
                                            variant="rounded"
                                            size="md"
                                            borderWidth={1}
                                            borderColor={Colors.grayDark}
                                            isRequired={true}
                                            width="100%"
                                        >
                                            <InputField value={formData?.fullName}/>
                                        </Input>
                                    </FormControl>
                                    <FormControl isRequired={false} isDisabled={true}>
                                        <FormControlLabel>
                                            <FormControlLabelText
                                                style={textStyles.body12Light}
                                                color={Colors.grayDark}
                                            >
                                                {t('signup.dateOfBirth')}
                                            </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input
                                            variant="rounded"
                                            size="md"
                                            borderWidth={1}
                                            borderColor={Colors.grayDark}
                                            isRequired={true}
                                            width="100%"
                                        >
                                            <InputField value={formData?.dateOfBirth}/>
                                        </Input>
                                    </FormControl>
                                </VStack>
                            </View>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.country')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={getLocalizedName(formData.country)}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.city')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={getLocalizedName(formData.city)}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.fieldOfWork')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={getLocalizedName(formData.fieldOfWork)}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.profession')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField
                                            value={formData.professions?.length
                                                ? formData.professions.map((p: any) => getLocalizedName(p)).join(", ")
                                                : undefined}
                                        />
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.email')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData?.email}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.socialLinks')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData?.linksToSocial}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('login.loginLabel')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData?.login}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('login.passwordLabel')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData?.password}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.maritalStatus')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={getLocalizedName(formData.maritalStatus)}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.education')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData.educationAndCourses}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.experience')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData.experienceAndSkills}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.desiredIncome')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <View style={styles.inputGroup}>
                                        <View style={{flex: 1}}>
                                            <Input
                                                variant="rounded"
                                                size="md"
                                                borderWidth={1}
                                                borderColor={Colors.grayDark}
                                                isRequired={true}
                                            >
                                                <InputField
                                                    placeholder={t('signup.from')}
                                                    value={formData.minDesiredIncome}
                                                />
                                            </Input>
                                        </View>
                                        <View style={{flex: 1, marginLeft: 8}}>
                                            <Input
                                                variant="rounded"
                                                size="md"
                                                borderWidth={1}
                                                borderColor={Colors.grayDark}
                                                isRequired={true}
                                            >
                                                <InputField
                                                    placeholder={t('signup.to')}
                                                    value={formData.maxDesiredIncome}
                                                />
                                            </Input>
                                        </View>
                                    </View>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.dreamJob')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData.dreamWork}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                            <VStack space="xs">
                                <FormControl isRequired={false} isDisabled={true}>
                                    <FormControlLabel>
                                        <FormControlLabelText
                                            style={textStyles.body12Light}
                                            color={Colors.grayDark}
                                        >
                                            {t('signup.hobby')}
                                        </FormControlLabelText>
                                    </FormControlLabel>
                                    <Input
                                        variant="rounded"
                                        size="md"
                                        borderWidth={1}
                                        borderColor={Colors.grayDark}
                                        isRequired={true}
                                    >
                                        <InputField value={formData.hobby}/>
                                    </Input>
                                </FormControl>
                            </VStack>

                        </VStack>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 8 }]}>
                <Button style={[buttonStyles.activeFilledButton, {marginBottom: 10}]} onPress={() => navigation.dispatch(StackActions.push("policy"))}>
                    <ButtonText style={[textStyles.body16Light, {color: Colors.white}]}>
                        {t('myAnket.saveAndContinue')}
                    </ButtonText>
                </Button>
                <Button style={[buttonStyles.activeStrokeButton]} onPress={() => navigation.dispatch(StackActions.push("signup", { mode: 'register' }))}>
                    <ButtonText style={[textStyles.body16Light, {color: Colors.greenSecond}]}>
                        {t('myAnket.editAnket')}
                    </ButtonText>
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 120,
    },
    form: {
        marginBottom: 16,
        marginTop: 16
    },
    image: {
        width: 128,
        height: 128,
        borderRadius: 20,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    inputContainer: {
        marginLeft: 20,
        flex: 1,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "row"
    },
    bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'gray',
},
})
export default Page