import { StyleSheet } from 'react-native';
import Colors from "@/constants/Colors";

export const buttonStyles = StyleSheet.create({
    activeFilledButton: {
        backgroundColor: Colors.greenFirst,
        borderRadius: 20,
    },
    activeStrokeButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.greenSecond,
        borderRadius: 20,
    },
    activeTextButton: {
        backgroundColor: ""
    },
    disabledFilledButton: {
        backgroundColor: Colors.grayDark,
        borderRadius: 20
    }
})