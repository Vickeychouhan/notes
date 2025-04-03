import React, { useState, useEffect } from 'react';
import { storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const NotesContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const NotesList = styled.div`
  margin-top: 20px;
  display: grid;
  gap: 15px;
`;

const NoteItem = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function UploadComponent() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    const savedFiles = storage.getAllFiles();
    setFiles(savedFiles);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setFile(null);
      setMessage('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!currentUser?.isAdmin) {
      setMessage('Only administrators can upload notes');
      return;
    }

    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const result = await storage.uploadFile(file);
      setMessage(`Notes uploaded successfully: ${result.name}`);
      loadFiles(); // Refresh the file list
      setFile(null); // Reset file input
    } catch (error) {
      setMessage(`Error uploading notes: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!currentUser?.isAdmin) {
      setMessage('Only administrators can delete notes');
      return;
    }

    try {
      await storage.deleteFile(fileId);
      loadFiles(); // Refresh the file list
      setMessage('Notes deleted successfully');
    } catch (error) {
      setMessage(`Error deleting notes: ${error.message}`);
    }
  };

  const handleView = (file) => {
    const content = storage.getFile(file.id);
    // Open PDF in new tab
    const pdfWindow = window.open("");
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" + content.url + "'></iframe>"
    );
  };

  return (
    <NotesContainer>
      {currentUser?.isAdmin && (
        <div>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Notes'}
          </button>
        </div>
      )}
      
      {message && <p>{message}</p>}
      
      <div>
        <h3>Available Notes</h3>
        <NotesList>
          {files.map(file => (
            <NoteItem key={file.id}>
              <span>{file.name}</span>
              <div>
                <button onClick={() => handleView(file)}>Read Notes</button>
                {currentUser?.isAdmin && (
                  <button onClick={() => handleDelete(file.id)}>Delete</button>
                )}
              </div>
            </NoteItem>
          ))}
        </NotesList>
      </div>
    </NotesContainer>
  );
}

export default UploadComponent;