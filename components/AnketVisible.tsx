import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Center } from '@gluestack-ui/themed';
import { textStyles } from "@/constants/textStyles";
import Colors from '@/constants/Colors';
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnketVisible = ({ handleToggle, onClose }: any) => {
    const { t } = useTranslation();
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['29%'], []);
    const { userInfo } = useAppSelector(state => state.user);
    const insets = useSafeAreaInsets();

    // Локальный стейт — не мигает пока идёт запрос
    const [localVisible, setLocalVisible] = useState<boolean>(userInfo?.visible ?? false);
    const [localLoading, setLocalLoading] = useState(false);

    const handleSwitch = async () => {
        const next = !localVisible;
        setLocalVisible(next);       // мгновенно переключаем UI
        setLocalLoading(true);
        try {
            await handleToggle();
        } finally {
            setLocalLoading(false);
        }
    };

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
        />
    );

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onClose={onClose}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={styles.indicator}
        >
            <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
                <View style={{ marginTop: 16, marginHorizontal: 16 }}>
                    <Text style={[textStyles.body16Light, { color: Colors.text }]}>
                        {t('anket.changeVisibility')}
                    </Text>
                    <View style={{
                        width: "100%",
                        height: 40,
                        borderRadius: 20,
                        padding: 10,
                        backgroundColor: localVisible ? Colors.accentThird : Colors.errorSecond,
                        marginTop: 16,
                    }}>
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Text style={[textStyles.body16Light, { color: localVisible ? Colors.greenSecond : Colors.error }]}>
                                {localVisible ? t('anket.visibleToUsers') : t('anket.hiddenFromUsers')}
                            </Text>
                        </View>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Center>
                            {localLoading
                                ? <ActivityIndicator size="small" />
                                : <Switch value={localVisible} onValueChange={handleSwitch} />
                            }
                        </Center>
                    </View>
                </View>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        flex: 1,
    },
    indicator: {
        backgroundColor: '#DEDEDE',
        width: 40,
    },
});

export default AnketVisible;