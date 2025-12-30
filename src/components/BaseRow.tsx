import { Pressable, StyleSheet, View } from "react-native";
import { ReactNode } from "react";
import { colors, radii, spacing } from "@/constants/theme";

interface BaseRowProps {
    onPress?: () => void;
    children: ReactNode;
}

export const BaseRow = ({ onPress, children }: BaseRowProps) => {
    return (
        <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={onPress}>
            {children}
        </Pressable>
    );
};

export const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        marginBottom: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.7,
        backgroundColor: colors.backgroundSecondary,
    },
});
