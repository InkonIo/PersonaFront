import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    StyleProp,
    ViewStyle,
    ModalProps,
    Platform,
    ActivityIndicator, SafeAreaView
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FC, ReactNode } from "react";
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper, ActionsheetItem, ActionsheetItemText, Button, ButtonText, CheckIcon, Icon
} from "@gluestack-ui/themed";
import {buttonStyles} from "@/constants/buttonStyles";
import * as React from "react";

const Loading = () => {
    return (
        <SafeAreaView>

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
});

export default Loading