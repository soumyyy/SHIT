export const colors = {
  background: "#FDF7EC",
  backgroundSecondary: "#F8EEDC",
  surface: "rgba(255, 255, 255, 0.92)",
  card: "rgba(255, 255, 255, 0.88)",
  cardMuted: "rgba(255, 255, 255, 0.72)",
  textPrimary: "#2A1A1F",
  textSecondary: "rgba(42, 26, 31, 0.75)",
  textMuted: "rgba(42, 26, 31, 0.45)",
  accent: "#722F37",
  accentMuted: "#B85763",
  border: "rgba(255, 255, 255, 0.55)",
  borderStrong: "#E3C8A8",
  overlay: "rgba(114, 47, 55, 0.12)",
  glass: "rgba(255, 255, 255, 0.6)",
  glassBorder: "rgba(255, 255, 255, 0.9)",
  success: "#3F7A5D",
  danger: "#9B1B30",
};

export const spacing = {
  xxs: 2,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 20,
  pill: 999,
};

export const typography = {
  display: 32,
  heading: 26,
  subheading: 20,
  body: 16,
  small: 14,
  tiny: 12,
};

export const shadows = {
  soft: {
    shadowColor: "rgba(0, 0, 0, 0.12)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  medium: {
    shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 30,
    elevation: 10,
  },
};

export const layout = {
  screenPadding: spacing.md,
};

// Common reusable styles
export const commonStyles = {
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.soft,
  },
  cardPressed: {
    opacity: 0.7,
    backgroundColor: colors.backgroundSecondary,
  },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.medium,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  layout,
  commonStyles,
};
