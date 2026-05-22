// components/AvatarPlaceholder.tsx
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AvatarPlaceholder = () => (
    <View style={styles.container}>
        <Ionicons name="person" size={64} color="#BDBDBD" />
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: 128,
        height: 128,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AvatarPlaceholder;