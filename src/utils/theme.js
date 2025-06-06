import useStore from '../store/useStore';
import { createTheme } from '@mui/material/styles';

// Theme colors
export const themeColors = {
  light: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50'
  },
  dark: {
    primary: '#90caf9',
    secondary: '#f48fb1',
    background: '#121212',
    surface: '#1e1e1e',
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.38)'
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50'
  }
};

// Get current theme
export const getCurrentTheme = () => {
  const store = useStore.getState();
  return store.theme;
};

// Toggle theme
export const toggleTheme = () => {
  const store = useStore.getState();
  store.toggleTheme();
};

// Get theme colors
export const getThemeColors = (mode = 'light') => {
  const colors = {
    light: {
      primary: '#1976d2',
      secondary: '#9c27b0',
      error: '#d32f2f',
      warning: '#ed6c02',
      info: '#0288d1',
      success: '#2e7d32',
      background: '#f5f5f5',
      surface: '#ffffff',
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
        disabled: 'rgba(0, 0, 0, 0.38)'
      },
      divider: 'rgba(0, 0, 0, 0.12)',
      primaryContrast: '#ffffff'
    },
    dark: {
      primary: '#90caf9',
      secondary: '#ce93d8',
      error: '#f44336',
      warning: '#ffa726',
      info: '#29b6f6',
      success: '#66bb6a',
      background: '#121212',
      surface: '#1e1e1e',
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.5)'
      },
      divider: 'rgba(255, 255, 255, 0.12)',
      primaryContrast: '#000000'
    }
  };

  return colors[mode];
};

// Get color by type
export const getColorByType = (type) => {
  const colors = getThemeColors();
  return colors[type] || colors.primary;
};

// Get text color by type
export const getTextColorByType = (type) => {
  const colors = getThemeColors();
  return colors.text[type] || colors.text.primary;
};

// Get background color by type
export const getBackgroundColorByType = (type) => {
  const colors = getThemeColors();
  return colors[type] || colors.background;
};

// Get surface color by type
export const getSurfaceColorByType = (type) => {
  const colors = getThemeColors();
  return colors[type] || colors.surface;
};

// Get divider color
export const getDividerColor = () => {
  const colors = getThemeColors();
  return colors.divider;
};

// Get error color
export const getErrorColor = () => {
  const colors = getThemeColors();
  return colors.error;
};

// Get warning color
export const getWarningColor = () => {
  const colors = getThemeColors();
  return colors.warning;
};

// Get info color
export const getInfoColor = () => {
  const colors = getThemeColors();
  return colors.info;
};

// Get success color
export const getSuccessColor = () => {
  const colors = getThemeColors();
  return colors.success;
};

// Get contrast text color
export const getContrastTextColor = (backgroundColor) => {
  const colors = getThemeColors();
  const isDark = backgroundColor === colors.dark.background || 
                 backgroundColor === colors.dark.surface;
  return isDark ? colors.dark.text.primary : colors.light.text.primary;
};

// Get elevation shadow
export const getElevationShadow = (elevation) => {
  const theme = getCurrentTheme();
  const isDark = theme === 'dark';
  
  const shadows = {
    0: 'none',
    1: isDark ? '0 2px 1px -1px rgba(0,0,0,0.2),0 1px 1px 0 rgba(0,0,0,0.14),0 1px 3px 0 rgba(0,0,0,0.12)' : '0 2px 1px -1px rgba(0,0,0,0.2),0 1px 1px 0 rgba(0,0,0,0.14),0 1px 3px 0 rgba(0,0,0,0.12)',
    2: isDark ? '0 3px 1px -2px rgba(0,0,0,0.2),0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12)' : '0 3px 1px -2px rgba(0,0,0,0.2),0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12)',
    3: isDark ? '0 3px 3px -2px rgba(0,0,0,0.2),0 3px 4px 0 rgba(0,0,0,0.14),0 1px 8px 0 rgba(0,0,0,0.12)' : '0 3px 3px -2px rgba(0,0,0,0.2),0 3px 4px 0 rgba(0,0,0,0.14),0 1px 8px 0 rgba(0,0,0,0.12)',
    4: isDark ? '0 2px 4px -1px rgba(0,0,0,0.2),0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12)' : '0 2px 4px -1px rgba(0,0,0,0.2),0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12)',
    5: isDark ? '0 3px 5px -1px rgba(0,0,0,0.2),0 5px 8px 0 rgba(0,0,0,0.14),0 1px 14px 0 rgba(0,0,0,0.12)' : '0 3px 5px -1px rgba(0,0,0,0.2),0 5px 8px 0 rgba(0,0,0,0.14),0 1px 14px 0 rgba(0,0,0,0.12)'
  };

  return shadows[elevation] || shadows[0];
};

export const createAppTheme = (mode = 'light') => {
  const colors = getThemeColors(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary
      },
      secondary: {
        main: colors.secondary
      },
      error: {
        main: colors.error
      },
      warning: {
        main: colors.warning
      },
      info: {
        main: colors.info
      },
      success: {
        main: colors.success
      },
      background: {
        default: colors.background,
        paper: colors.surface
      },
      text: colors.text,
      divider: colors.divider
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
            color: colors.text.primary
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none'
          }
        }
      }
    }
  });
};

export const getContrastText = (color) => {
  // Remove the hash if it exists
  const hex = color.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const getColorWithOpacity = (color, opacity) => {
  // Remove the hash if it exists
  const hex = color.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Return rgba color
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}; 