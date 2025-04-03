const NOTES_FOLDER = 'course_notes';

const localStorageService = {
  uploadFile: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fileId = `${NOTES_FOLDER}_${Date.now()}`;
          const fileData = {
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            createdAt: new Date().toISOString(),
            folder: NOTES_FOLDER
          };
          
          // Store content first to check if it fits in localStorage
          try {
            localStorage.setItem(`${fileId}_content`, event.target.result);
          } catch (storageError) {
            // If content doesn't fit, clean up and reject
            localStorage.removeItem(`${fileId}_content`);
            reject(new Error('File is too large for browser storage. Try a smaller file.'));
            return;
          }
          
          // If content was stored successfully, update the file list
          const files = JSON.parse(localStorage.getItem('pdfFiles') || '[]');
          files.push(fileData);
          
          localStorage.setItem('pdfFiles', JSON.stringify(files));
          
          resolve({
            id: fileId,
            name: file.name,
            size: file.size,
            createdAt: fileData.createdAt,
            folder: NOTES_FOLDER
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  },
  
  getAllFiles: () => {
    try {
      const files = JSON.parse(localStorage.getItem('pdfFiles') || '[]');
      // Only return files that have content successfully stored
      return files.filter(file => {
        const hasContent = localStorage.getItem(`${file.id}_content`) !== null;
        return file.folder === NOTES_FOLDER && hasContent;
      });
    } catch (error) {
      console.error('Error getting files:', error);
      return [];
    }
  },
  
  getFile: (fileId) => {
    try {
      const files = JSON.parse(localStorage.getItem('pdfFiles') || '[]');
      const fileMetadata = files.find(file => file.id === fileId);
      
      if (!fileMetadata) {
        throw new Error('File not found');
      }
      
      const content = localStorage.getItem(`${fileId}_content`);
      if (!content) {
        throw new Error('File content not found');
      }
      
      return {
        ...fileMetadata,
        url: content
      };
    } catch (error) {
      throw error;
    }
  },
  
  deleteFile: (fileId) => {
    try {
      const files = JSON.parse(localStorage.getItem('pdfFiles') || '[]');
      const updatedFiles = files.filter(file => file.id !== fileId);
      localStorage.setItem('pdfFiles', JSON.stringify(updatedFiles));
      localStorage.removeItem(`${fileId}_content`);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default localStorageService;