import React from 'react';
import {View, Text, ViewStyle} from 'react-native';
import { chipsStyles } from '@/constants/chipsStyles';
import Colors from "@/constants/Colors";

interface ChipsProps {
    case: 'fill' | 'stroke';
    text: string
    style?: ViewStyle;
}

const Chips: React.FC<ChipsProps> = ({ case: chipCase, text, style }) => {
    const dynamicStyle = chipCase === 'fill' ? chipsStyles.activeFilledButton : chipsStyles.activeStrokeButton;

    return (
        <View style={[chipsStyles.defaultsChipStyle, dynamicStyle, style]}>
            <Text style={
                {
                    fontFamily: "futuraPTLight",
                    fontWeight: "400",
                    lineHeight: 18,
                    color: Colors.text,
                    textAlign: "center",
                    fontSize: 14,
                }
            }
            >
                {text}
            </Text>
        </View>
    );
};

export default Chips;
