import {SafeAreaView, StyleSheet, Text, View} from "react-native";
import {textStyles} from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import {FC, memo} from "react";

const MemoList: FC<any> = memo(({notification}) => {
    const formatDateAndTime = (createdAt: string) => {
        const [date, time] = createdAt.split(" ");
        return {date, time: time.slice(0, 5)};
    };
    const {time} = formatDateAndTime(notification.createdAt);
    const isActive = notification.isActive;

    return (
        <SafeAreaView>
            <View style={[styles.itemContainer, isActive && styles.activeItemContainer]}>
                <View style={styles.itemHeader}>
                    <Text
                        style={[textStyles.body20Medium, {color: Colors.text, marginBottom: 8}]}>{notification.title}</Text>
                    <Text style={[textStyles.body12Light, {color: Colors.text}]}>{time}</Text>
                </View>
                <Text style={[textStyles.body12Light, {color: Colors.text, fontSize: 15}]}>{notification.description}</Text>
            </View>
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    activeItemContainer: {
        backgroundColor: '#E0E0E0',
    },
    itemContainer: {
        paddingVertical: 20,
        paddingHorizontal: 26,
        marginBottom: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})
export default MemoList;