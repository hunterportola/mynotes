// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
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
  const [isCreating, setIsCreating] = useState(false); // State for creating a new note
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // State to track which note is being updated
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

  const handleCreateNote = async (event: FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    setError('');
    try {
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });
      if (!response.ok) throw new Error('Failed to create note');
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setNoteTitle('');
      setNoteContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    // ... (logic remains the same)
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
    setIsUpdating(noteId); // Set which note is being updated
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
      setIsUpdating(null); // Clear updating state
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
            <div className="text-right">
              <button
                type="submit"
                disabled={isCreating} // Now uses the dedicated 'isCreating' state
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
              <div key={note.id} className={`rounded-lg shadow-md p-6 flex flex-col break-inside-avoid mb-8 ${editingNoteId === note.id ? 'bg-white' : 'bg-portola-cream'}`}>
                
                {editingNoteId === note.id ? (
                  // --- EDIT MODE ---
                  <div className="flex flex-col h-full">
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
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-portola-bronze">{note.title || 'Untitled'}</h3>
                      <button onClick={() => handleStartEdit(note)} className="text-portola-green hover:text-portola-bronze">
                        <EditIcon />
                      </button>
                    </div>
                    <hr className="border-t border-portola-bronze my-4" />
                    <p className="text-portola-grey text-lg mb-4 flex-grow">{note.content}</p>
                    <div className="border-t border-portola-bronze pt-4 flex justify-between items-center">
                      <small className="text-portola-bronze">
                        {new Date(note.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </small>
                      {pendingDeleteId === note.id ? (
                        <button onClick={() => handleDeleteNote(note.id)} className="bg-red-800 text-white font-bold py-1 px-3 rounded text-sm">
                          Are you sure?
                        </button>
                      ) : (
                        <button onClick={() => setPendingDeleteId(note.id)} className="text-portola-bronze hover:opacity-75 transition-opacity">
                          <TrashIcon />
                        </button>
                      )}
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
