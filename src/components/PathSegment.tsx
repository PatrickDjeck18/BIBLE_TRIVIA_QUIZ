import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface PathSegmentProps {
    active?: boolean;
    length?: number;
}

export const PathSegment: React.FC<PathSegmentProps> = ({ active = false, length = 40 }) => {
    return (
        <View style={[styles.container, { height: length }]}>
            <View style={[styles.line, active && styles.activeLine]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    line: {
        width: 4,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
    },
    activeLine: {
        backgroundColor: colors.accent,
    },
});
