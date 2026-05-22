import Colors from '@/constants/Colors';
import {Link} from 'expo-router';
import {View, Text, StyleSheet, Image, SafeAreaView} from 'react-native';
import {textStyles} from "@/constants/textStyles";
import * as React from "react";
import FilterIcon from "@/assets/icons/FilterIcon";
import {Input, InputField, InputIcon, InputSlot, SearchIcon} from "@gluestack-ui/themed";
import VoiceIcon from "@/assets/icons/VoiceIcon";
const Page = () => {
    return (
        <View style={styles.container}>
            <SafeAreaView>
                <View style={styles.header}>
                    <View>
                        <Text style={[textStyles.body20Medium, {color: Colors.black, marginTop: 16}]}>Привет, Ромиш</Text>
                    </View>
                    <View style={styles.icon}>
                        <FilterIcon />
                    </View>
                </View>
                <View>
                    <Input borderRadius={20} marginHorizontal={16} marginTop={16}>
                        <InputSlot style={{marginLeft: 12}}>
                            <InputIcon as={SearchIcon} />
                        </InputSlot>
                        <InputField placeholder="Поиск"/>
                        <InputSlot style={{marginRight: 12}}>
                            <InputIcon as={VoiceIcon} />
                        </InputSlot>
                    </Input>
                </View>

                <View style={styles.listing}>
                    {/*<Image source={require("@/assets/images/logo.png")} style={styles.images}/>*/}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16
    },
    icon: {
        alignSelf: "flex-end"
    },
    listing: {
        backgroundColor: Colors.grayLight
    },
    images: {
        width: 128,
        height: 128
    }
});
export default Page;