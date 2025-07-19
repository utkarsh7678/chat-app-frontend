import React from 'react';
import MuiAvatar from '@mui/material/Avatar';

const DEFAULT_AVATAR = '/default-avatar.png';

const Avatar = ({ src, alt, ...props }) => {
  return (
    <MuiAvatar
      src={src || DEFAULT_AVATAR}
      alt={alt || 'User Avatar'}
      {...props}
      onError={e => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
    />
  );
};

export default Avatar; 