import React from 'react';
import MuiAvatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const DEFAULT_AVATAR = '/default-avatar.png';

/**
 * Avatar component that supports multiple image sizes and Cloudinary responsive delivery
 * @param {Object} profilePicture - The profile picture object with versions
 * @param {string} [src] - Direct image source URL (for backward compatibility)
 * @param {string} [alt='User Avatar'] - Alt text for the avatar
 * @param {string} [size='medium'] - Size variant: 'small' | 'medium' | 'large'
 * @param {boolean} [responsive=true] - Whether to use responsive image sizes
 * @param {Object} props - Additional props to pass to MuiAvatar
 */
const Avatar = ({ 
  profilePicture,
  src,
  alt = 'User Avatar',
  size = 'medium',
  responsive = true,
  ...props 
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determine which size to use based on props and screen size
  const getAvatarUrl = () => {
    // If src is provided, use it directly (for backward compatibility)
    if (src) return src;
    
    // If no profile picture, return default
    if (!profilePicture?.versions) {
      return DEFAULT_AVATAR;
    }
    
    // Use specified size or default to 'medium'
    let sizeToUse = size;
    
    // Auto-adjust size for small screens if responsive is true
    if (responsive && isSmallScreen && size === 'medium') {
      sizeToUse = 'small';
    }
    
    // Return the appropriate size, fallback to original if size not available
    return (
      profilePicture.versions[sizeToUse] || 
      profilePicture.versions.original || 
      DEFAULT_AVATAR
    );
  };
  
  // Add size-based styles
  const sizeStyles = {
    small: {
      width: 32,
      height: 32,
      fontSize: '0.8rem'
    },
    medium: {
      width: 48,
      height: 48,
      fontSize: '1rem'
    },
    large: {
      width: 96,
      height: 96,
      fontSize: '1.5rem'
    }
  };

  return (
    <MuiAvatar
      src={getAvatarUrl()}
      alt={alt}
      style={sizeStyles[size]}
      {...props}
      onError={e => { 
        e.target.onerror = null; 
        e.target.src = DEFAULT_AVATAR; 
      }}
    />
  );
};

export default Avatar;
