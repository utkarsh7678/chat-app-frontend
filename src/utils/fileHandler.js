import { encryptFile, decryptFile } from './encryption';

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Convert base64 to file
export const base64ToFile = (base64, filename, mimeType) => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new File([ab], filename, { type: mimeType });
};

// Prepare file for upload
export const prepareFileForUpload = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

// Process downloaded file
export const processDownloadedFile = (fileData, decryptionKey) => {
  try {
    const decryptedData = decryptFile(fileData.encryptedData, decryptionKey);
    return base64ToFile(decryptedData, fileData.name, fileData.type);
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error('Failed to process downloaded file');
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file type
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Validate file size
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Get file icon based on type
export const getFileType = (file) => {
  if (!file) return null;

  const type = file.type || file.mimeType;
  if (!type) return 'unknown';

  if (type.startsWith('image/')) {
    return 'image';
  } else if (type.startsWith('video/')) {
    return 'video';
  } else if (type.startsWith('audio/')) {
    return 'audio';
  } else if (type === 'application/pdf') {
    return 'pdf';
  } else if (type.includes('word') || type.includes('document')) {
    return 'document';
  } else if (type.includes('excel') || type.includes('spreadsheet')) {
    return 'spreadsheet';
  } else if (type.includes('powerpoint') || type.includes('presentation')) {
    return 'presentation';
  } else if (type === 'text/plain') {
    return 'text';
  } else if (type === 'text/csv') {
    return 'csv';
  } else if (type.includes('zip') || type.includes('compressed')) {
    return 'archive';
  }

  return 'file';
};

// Get file icon based on type
export const getFileIcon = (file) => {
  const type = getFileType(file);
  
  switch (type) {
    case 'image':
      return 'image';
    case 'video':
      return 'videocam';
    case 'audio':
      return 'audiotrack';
    case 'pdf':
      return 'picture_as_pdf';
    case 'document':
      return 'description';
    case 'spreadsheet':
      return 'table_chart';
    case 'presentation':
      return 'slideshow';
    case 'text':
      return 'article';
    case 'csv':
      return 'table_view';
    case 'archive':
      return 'folder_zip';
    default:
      return 'insert_drive_file';
  }
};

// Get file color based on type
export const getFileColor = (file) => {
  const type = getFileType(file);
  
  switch (type) {
    case 'image':
      return 'success.main';
    case 'video':
      return 'error.main';
    case 'audio':
      return 'warning.main';
    case 'pdf':
      return 'error.main';
    case 'document':
      return 'primary.main';
    case 'spreadsheet':
      return 'success.main';
    case 'presentation':
      return 'warning.main';
    case 'text':
      return 'info.main';
    case 'csv':
      return 'success.main';
    case 'archive':
      return 'secondary.main';
    default:
      return 'text.secondary';
  }
};

// Create download link
export const createDownloadLink = (file) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = file.name;
  return link;
};

// Handle file download
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Validate file
export const validateFile = (file) => {
  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (!file) {
    return {
      isValid: false,
      error: 'No file selected'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File is too large (max 2GB)'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed'
    };
  }

  return {
    isValid: true
  };
}; 