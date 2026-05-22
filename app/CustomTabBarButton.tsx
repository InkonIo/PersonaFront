import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { textStyles } from "@/constants/textStyles";

const CustomTabBarButton = ({ onPress, accessibilityState, children, disabled }: any) => {
    const selected = accessibilityState.selected;
    return (
        <TouchableOpacity
            style={[
                styles.container,
                selected ? styles.selected : styles.unselected,
                disabled && styles.disabled,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={disabled ? 1 : 0.7}
        >
            <Text style={[
                textStyles.body16Medium,
                selected ? styles.selectedText : styles.unselectedText,
                disabled && styles.disabledText,
            ]}>
                {children}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: -1,
    },
    selected: {
        backgroundColor: Colors.greenFirst,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    unselected: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    selectedText: {
        color: Colors.white,
    },
    unselectedText: {
        color: Colors.text,
    },
    disabled: {
        opacity: 0.4,
    },
    disabledText: {
        color: Colors.text,
    },
});

export default CustomTabBarButton;