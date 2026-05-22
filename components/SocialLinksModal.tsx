import React, { useState } from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    ButtonText,
    VStack,
    HStack,
    Icon,
    CloseIcon,
    Text,
} from "@gluestack-ui/themed";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import SocialLinksInput from "./SocialLinksInput";
import { useTranslation } from "react-i18next";

interface SocialLinksModalProps {
    isOpen: boolean;
    onClose: () => void;
    value: string;
    onChange: (value: string) => void;
}

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
    isOpen,
    onClose,
    value,
    onChange,
}) => {
    const { t } = useTranslation();
    const [tempValue, setTempValue] = useState(value);

    const handleSave = () => {
        onChange(tempValue);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Text style={[textStyles.body16Light, { color: Colors.grayDark }]}>
                        {t('common.socialNetworks')}
                    </Text>
                    <ModalCloseButton>
                        <Icon as={CloseIcon} />
                    </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                    <SocialLinksInput
                        value={tempValue}
                        onChange={setTempValue}
                    />
                </ModalBody>
                <ModalFooter>
                    <HStack space="sm" justifyContent="flex-end">
                        <Button variant="outline" onPress={onClose}>
                            <ButtonText style={[textStyles.body16Light, { color: Colors.grayDark }]}>
                                {t('common.cancel')}
                            </ButtonText>
                        </Button>
                        <Button onPress={handleSave}>
                            <ButtonText style={[textStyles.body16Light, { color: Colors.white }]}>
                                {t('common.save')}
                            </ButtonText>
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SocialLinksModal;