import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StarsProps {
    // Всегда 1–10. Компонент сам переводит в звёзды.
    // Для disabled-режима (отображение рейтинга в %) передавай rating/10
    initialRating?: number;
    onRatingChange?: (rating: number) => void; // возвращает 1–10
    size?: number;
    disabled: boolean;
}

const Stars: FC<StarsProps> = ({
    initialRating = 0,
    onRatingChange,
    size = 20,
    disabled,
}) => {
    const totalStars = 10;
    const [starRating, setStarRating] = useState<number>(initialRating);

    useEffect(() => {
        setStarRating(initialRating);
    }, [initialRating]);

    const handleRating = (starIndex: number) => {
        if (disabled) return;
        setStarRating(starIndex);
        onRatingChange?.(starIndex); // отдаём 1–10
    };

    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating - fullStars >= 0.5;

    return (
        <View style={styles.stars}>
            {Array.from({ length: totalStars }, (_, i) => {
                let iconName: 'star' | 'star-half' | 'star-border' = 'star-border';
                if (i < fullStars) iconName = 'star';
                else if (i === fullStars && hasHalfStar) iconName = 'star-half';

                return (
                    <TouchableOpacity
                        key={`star-${i}`}
                        onPress={() => handleRating(i + 1)}
                        disabled={disabled}
                    >
                        <MaterialIcons
                            name={iconName}
                            size={size}
                            style={iconName !== 'star-border' ? styles.starSelected : styles.starUnselected}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    stars: { flexDirection: 'row', marginTop: 8 },
    starSelected: { color: '#FFC107' },
    starUnselected: { color: '#D0D0D0' },
});

export default Stars;