import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import AvatarPlaceholder from './AvatarPlaceholder';

const UserAvatar = ({ uri, style }: { uri?: string; style?: any }) => {
    const [hasError, setHasError] = useState(false);

    if (!uri?.trim() || hasError) {
        return <AvatarPlaceholder />;
    }

    return (
        <Image
            source={{ uri }}
            style={style}
            onError={() => setHasError(true)}
        />
    );
};

export default UserAvatar;