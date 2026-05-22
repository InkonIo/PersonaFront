import { Platform } from 'react-native';
import {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
    ActionsheetItem,
    ActionsheetItemText,
    Button,
    ButtonText,
    CheckIcon,
    Icon
} from "@gluestack-ui/themed";
import { buttonStyles } from "@/constants/buttonStyles";
import * as React from "react";
import { FC } from "react";
import { useTranslation } from 'react-i18next';

interface FilterProps {
    isModalVisible: boolean;
    handleModalVisible: VoidFunction;
    handleSortBy: (sortType: any) => void;
    sortBy: any;
    onApplySort: VoidFunction;
}

const Filter: FC<FilterProps> = ({ isModalVisible, handleModalVisible, handleSortBy, sortBy, onApplySort }) => {
    const { t } = useTranslation();
    const isApplyDisabled = sortBy === null;

    return (
        <Actionsheet isOpen={isModalVisible} onClose={handleModalVisible}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
                <ActionsheetDragIndicatorWrapper>
                    <ActionsheetDragIndicator />
                </ActionsheetDragIndicatorWrapper>
                <ActionsheetItem onPress={() => handleSortBy('RATING')}>
                    <ActionsheetItemText>{t('filter.byRating')}</ActionsheetItemText>
                    {sortBy === 'RATING' && <Icon as={CheckIcon} />}
                </ActionsheetItem>
                <ActionsheetItem onPress={() => handleSortBy('STATUS')}>
                    <ActionsheetItemText>{t('filter.byStatus')}</ActionsheetItemText>
                    {sortBy === 'STATUS' && <Icon as={CheckIcon} />}
                </ActionsheetItem>
                <Button
                    onPress={onApplySort}
                    mt={24}
                    mb={Platform.OS === 'ios' ? 24 : undefined}
                    style={[isApplyDisabled ? buttonStyles.disabledFilledButton : buttonStyles.activeFilledButton]}
                    width="100%"
                >
                    <ButtonText>{t('common.apply')}</ButtonText>
                </Button>
            </ActionsheetContent>
        </Actionsheet>
    );
};

export default Filter;