import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

const FilterTag = ({ filter, onRemove }: any) => {
    return (
        <View style={styles.filterTag}>
            <Text style={styles.filterText}>{filter}</Text>
            <TouchableOpacity onPress={() => onRemove(filter)}>
                <Text style={styles.removeText}>❌</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    filterTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.grayLight,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.grayDark,
    },
    filterText: {
        color: Colors.text,
        marginRight: 8,
    },
    removeText: {
        color: Colors.errorSecond,
        fontSize: 16,
    },
});

export default FilterTag;
