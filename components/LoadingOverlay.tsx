import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type LoadingOverlayPropsType = {
    loading: boolean
}
export const LoadingOverlay = ({ loading }: LoadingOverlayPropsType) => {
    if (!loading) {
        return null;
    }

    return (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
        </View>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,        // ← добавь
        elevation: 9999,     // ← и это для Android
    },
});
