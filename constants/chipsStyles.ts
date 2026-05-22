import { StyleSheet } from 'react-native';
import Colors from "@/constants/Colors";

export const chipsStyles = StyleSheet.create({
    defaultsChipStyle: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 10
    },
    activeFilledButton: {
        backgroundColor: Colors.accentThird,
        borderRadius: 20,
    },
    activeStrokeButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.greenSecond,
        borderRadius: 20,
    },
})