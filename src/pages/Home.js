import React, { useState, useEffect } from 'react';
import { storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 300px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-right: 20px;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
    max-height: 300px;
  }
`;

const Content = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SearchBox = styled.div`
  margin-bottom: 20px;

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
  }
`;

const NotesListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background-color: #f5f5f5;
    }

    &.active {
      background-color: #e3f2fd;
      border-left: 3px solid #4a6fa5;
    }
    
    .note-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .note-actions {
      display: flex;
      gap: 5px;
    }
  }
`;

const PDFContainer = styled.div`
  flex: 1;
  overflow: auto;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100%;
`;

const PDFEmbed = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  min-height: 500px;
`;

const Placeholder = styled.div`
  text-align: center;
  color: #888;
  padding: 20px;
`;

const Modal = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  background-color: white;
  margin: 10% auto;
  padding: 30px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const CloseButton = styled.span`
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
`;

const Form = styled.form`
  margin-top: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
  }
`;

const Button = styled.button`
  display: inline-block;
  padding: 10px 20px;
  background-color: #4a6fa5;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #166088;
  }
`;

const Message = styled.div`
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  background-color: ${props => props.type === 'error' ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.type === 'error' ? '#dc3545' : '#28a745'};
  display: ${props => props.show ? 'block' : 'none'};
`;

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { currentUser } = useAuth();

  // Load notes from localStorage
  useEffect(() => {
    function fetchNotes() {
      try {
        const notesList = storage.getAllFiles();
        setNotes(notesList);
        setFilteredNotes(notesList);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }

    fetchNotes();
  }, []);

  // Filter notes based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note => 
        note.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes]);

  function handleNoteSelect(note) {
    setSelectedNote(note);
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function handleFileChange(e) {
    if (e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    
    if (!pdfFile) {
      setMessage({ text: 'Please select a file', type: 'error' });
      return;
    }

    if (!currentUser?.isAdmin) {
      setMessage({ text: 'Only admins can upload notes', type: 'error' });
      return;
    }

    // Check file size before attempting upload
    if (pdfFile.size > 4 * 1024 * 1024) { // 4MB limit
      setMessage({ text: 'File is too large. Please upload files smaller than 4MB', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      setMessage({ text: '', type: '' });
      
      // Upload file to localStorage
      await storage.uploadFile(pdfFile);
      
      // Update local state only after successful upload
      const updatedNotes = storage.getAllFiles();
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
      
      setMessage({ text: 'File uploaded successfully', type: 'success' });
      setPdfFile(null);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ text: `Error uploading file: ${error.message}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(noteId) {
    if (!currentUser?.isAdmin) {
      setMessage({ text: 'Only admins can delete notes', type: 'error' });
      return;
    }

    try {
      await storage.deleteFile(noteId);
      const updatedNotes = storage.getAllFiles();
      setNotes(updatedNotes);
      setFilteredNotes(updatedNotes);
      
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
      
      setMessage({ text: 'Note deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting note:', error);
      setMessage({ text: 'Error deleting note', type: 'error' });
    }
  }

  // Remove the unused handleViewNote function since we're using handleNoteSelect instead

  return (
    <Container>
      <Header onAdminClick={() => currentUser?.isAdmin && setShowModal(true)} />
      
      <Main>
        <Sidebar>
          <h2>Available Notes</h2>
          <SearchBox>
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </SearchBox>
          <NotesListContainer>
            {filteredNotes.length === 0 ? (
              <li className="empty-list">No notes available</li>
            ) : (
              filteredNotes.map(note => (
                <li 
                  key={note.id}
                  className={selectedNote && selectedNote.id === note.id ? 'active' : ''}
                  onClick={() => handleNoteSelect(note)}
                >
                  <span className="note-name">{note.name}</span>
                  <div className="note-actions">
                    {currentUser?.isAdmin && (
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}>Delete</Button>
                    )}
                  </div>
                </li>
              ))
            )}
          </NotesListContainer>
        </Sidebar>
        
        <Content>
          <PDFContainer>
            {selectedNote ? (
              <>
                <h3>{selectedNote.name}</h3>
                <PDFEmbed 
                  src={storage.getFile(selectedNote.id).url} 
                  title={selectedNote.name}
                />
              </>
            ) : (
              <Placeholder>
                <h3>Select a note to view</h3>
                <p>Click on any note from the sidebar to view its content here.</p>
              </Placeholder>
            )}
          </PDFContainer>
        </Content>
      </Main>
      
      {currentUser?.isAdmin && (
        <Modal show={showModal}>
          <ModalContent>
            <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            <h2>Admin Panel</h2>
            <Form onSubmit={handleUpload}>
              <FormGroup>
                <label htmlFor="pdf-file">Upload PDF Note</label>
                <input
                  type="file"
                  id="pdf-file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </FormGroup>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Message show={message.text} type={message.type}>
                {message.text}
              </Message>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}