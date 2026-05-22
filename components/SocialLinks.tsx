import React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { Text } from "@gluestack-ui/themed";
import { textStyles } from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import { Instagram, Linkedin, MessageCircle } from "lucide-react-native";

interface SocialLink {
    platform: string;
    url: string;
}

interface SocialLinksProps {
    links: string;
}

const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case 'instagram':
            return <Instagram size={24} color={Colors.grayDark} />;
        case 'linkedin':
            return <Linkedin size={24} color={Colors.grayDark} />;
        case 'telegram':
            return <MessageCircle size={24} color={Colors.grayDark} />;
        default:
            return null;
    }
};

const getPlatformName = (platform: string) => {
    switch (platform.toLowerCase()) {
        case 'instagram':
            return 'Instagram';
        case 'linkedin':
            return 'LinkedIn';
        case 'telegram':
            return 'Telegram';
        default:
            return platform;
    }
};

const SocialLinks: React.FC<SocialLinksProps> = ({ links }) => {
    if (!links) return null;

    const parsedLinks: SocialLink[] = links.split('|').map(link => {
        // Split only on the first occurrence of ':'
        const firstColonIndex = link.indexOf(':');
        const platform = link.substring(0, firstColonIndex);
        const url = link.substring(firstColonIndex + 1);
        return { platform, url };
    });

    const handlePress = async (url: string) => {
        try {
            // For phone numbers (whatsapp), don't add https://
            if (url.startsWith('+')) {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                    await Linking.openURL(url);
                }
                return;
            }

            // For web URLs, ensure proper protocol
            const cleanUrl = url.replace(/^(https?:\/\/)/, '');
            const formattedUrl = `https://${cleanUrl}`;

            const supported = await Linking.canOpenURL(formattedUrl);
            if (supported) {
                await Linking.openURL(formattedUrl);
            } else {
                console.error('URL scheme not supported:', formattedUrl);
            }
        } catch (error) {
            console.error('Error opening URL:', error);
        }
    };

    return (
        <View style={{ gap: 12 }}>
            {parsedLinks.map((link, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => handlePress(link.url)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 12,
                        backgroundColor: Colors.grayLight,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: Colors.grayLight,
                    }}
                >
                    {getPlatformIcon(link.platform)}
                    <Text style={[textStyles.body16Light, { color: Colors.grayDark }]}>
                        {getPlatformName(link.platform)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default SocialLinks; 