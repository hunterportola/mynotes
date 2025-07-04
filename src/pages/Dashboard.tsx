import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  attachment_s3_key?: string;
  attachment_url?: string;
}

// --- SVG ICONS ---
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
  </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteImage, setNoteImage] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteData, setEditingNoteData] = useState({ title: '', content: '' });

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return;
      setError('');
      try {
        const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch notes.');
        const data: Note[] = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred fetching notes.');
      }
    };
    fetchNotes();
  }, [token]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNoteImage(event.target.files[0]);
    }
  };

  const handleCreateNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      setError("Title and content are required.");
      return;
    }
    setIsCreating(true);
    setError('');

    let attachmentS3Key: string | undefined = undefined;

    try {
      if (noteImage) {
        const urlApi = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes/generate-upload-url`;
        const urlResponse = await fetch(urlApi, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!urlResponse.ok) {
          throw new Error('Could not get an upload URL.');
        }

        const { uploadUrl, s3Key } = await urlResponse.json();
        
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          body: noteImage,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to S3.');
        }

        attachmentS3Key = s3Key;
      }

      const createApi = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes`;
      const noteData = {
        title: noteTitle,
        content: noteContent,
        attachment_s3_key: attachmentS3Key,
      };

      const createResponse = await fetch(createApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create the note.');
      }

      const newNote = await createResponse.json();
      setNotes([newNote, ...notes]);

      setNoteTitle('');
      setNoteContent('');
      setNoteImage(null);
      const fileInput = document.getElementById('noteImage') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during note creation.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setError('');
    try {
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes/${noteId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete note.');
      }

      setNotes(notes.filter((n) => n.id !== noteId));
      setPendingDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the note.');
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteData({ title: note.title || '', content: note.content || '' });
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteData.title.trim() || !editingNoteData.content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    setIsUpdating(noteId);
    setError('');
    try {
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes/${noteId}`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingNoteData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update note.' }));
        throw new Error(errorData.message);
      }
      
      const updatedNote = await response.json();
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      setEditingNoteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error has occurred.');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="bg-portola-cotton min-h-screen font-garamond text-portola-dark-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <header className="bg-portola-cream p-8 rounded-lg shadow-md mb-12">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold text-portola-bronze">Notes</h1>
            <button 
              onClick={logout} 
              className="bg-portola-green text-portola-cream font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-xl"
            >
              Sign Out
            </button>
          </div>
          <hr className="border-t border-portola-bronze mt-4" />
        </header>

        <div className="bg-portola-cream p-8 rounded-lg shadow-md mb-12">
          <div className="text-left mb-6">
            <h2 className="text-3xl font-bold text-portola-bronze">Create a New Note</h2>
          </div>
          <hr className="border-t border-portola-bronze mb-6" />
          <form onSubmit={handleCreateNote} className="space-y-4">
             <div>
              <label htmlFor="noteTitle" className="sr-only">Title</label>
              <input
                id="noteTitle"
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title"
                required
                className="w-full p-4 border border-gray-300 rounded-md focus:ring-portola-gold focus:border-portola-gold font-garamond text-xl font-bold"
              />
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Your thoughts, secured..."
              rows={5}
              required
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-portola-gold focus:border-portola-gold font-garamond text-lg"
            />
            <div>
              <label htmlFor="noteImage" className="block text-lg font-medium text-gray-700 mb-2">Attach an Image</label>
              <input
                id="noteImage"
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
                className="w-full text-lg text-portola-grey file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-portola-green file:text-portola-cream hover:file:opacity-90"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                disabled={isCreating}
                className="bg-portola-green text-portola-cream font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-xl disabled:opacity-50"
              >
                {isCreating ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-portola-cream p-8 rounded-lg shadow-md mb-12">
          <div className="text-left">
            <h2 className="text-4xl font-bold text-portola-bronze">Your Collection</h2>
          </div>
          <hr className="border-t border-portola-bronze mt-4" />
        </div>
        
        {error && <p className="text-red-600 font-bold text-center mb-8">{error}</p>}
        
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className={`rounded-lg shadow-md flex flex-col break-inside-avoid mb-8 ${editingNoteId === note.id ? 'bg-white' : 'bg-portola-cream'}`}>
                
                {editingNoteId === note.id ? (
                  // --- EDIT MODE ---
                  <div className="flex flex-col h-full p-6">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={editingNoteData.title}
                        onChange={(e) => setEditingNoteData({ ...editingNoteData, title: e.target.value })}
                        className="text-2xl font-bold text-portola-bronze bg-transparent focus:outline-none w-full"
                      />
                      <button onClick={() => handleUpdateNote(note.id)} disabled={isUpdating === note.id} className="text-portola-green hover:text-portola-bronze">
                        {isUpdating === note.id ? '...' : <SaveIcon />}
                      </button>
                    </div>
                    <hr className="border-t border-gray-300 my-4" />
                    <textarea
                      value={editingNoteData.content}
                      onChange={(e) => setEditingNoteData({ ...editingNoteData, content: e.target.value })}
                      className="text-portola-grey text-lg mb-4 flex-grow bg-transparent focus:outline-none w-full"
                      rows={8}
                    />
                  </div>
                ) : (
                  // --- DISPLAY MODE ---
                  <>
                    {note.attachment_url && (
                      <img 
                        src={note.attachment_url} 
                        alt={`Attachment for ${note.title}`} 
                        className="w-full h-auto rounded-t-lg object-cover"
                      />
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-bold text-portola-bronze flex-grow">{note.title || 'Untitled'}</h3>
                          <button onClick={() => handleStartEdit(note)} className="text-portola-green hover:text-portola-bronze flex-shrink-0 ml-4">
                            <EditIcon />
                          </button>
                        </div>
                        <hr className="border-t border-portola-bronze my-4" />
                        <p className="text-portola-grey text-lg mb-4 flex-grow">{note.content}</p>
                        <div className="border-t border-portola-bronze pt-4 flex justify-between items-center mt-auto">
                          <small className="text-portola-bronze">
                            {new Date(note.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </small>
                          {pendingDeleteId === note.id ? (
                            <div>
                                <button onClick={() => handleDeleteNote(note.id)} className="bg-red-800 text-white font-bold py-1 px-3 rounded text-sm mr-2">
                                  Confirm
                                </button>
                                <button onClick={() => setPendingDeleteId(null)} className="bg-gray-500 text-white font-bold py-1 px-3 rounded text-sm">
                                  Cancel
                                </button>
                            </div>
                          ) : (
                            <button onClick={() => setPendingDeleteId(note.id)} className="text-portola-bronze hover:opacity-75 transition-opacity">
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">You haven't created any notes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}