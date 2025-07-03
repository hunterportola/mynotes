// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

// Define a type for our note objects for better type safety
interface Note {
  id: string;
  content: string;
  created_at: string;
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]); // State to hold the list of notes
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // useEffect hook to fetch notes when the component loads
  useEffect(() => {
    // We define an async function inside the effect
    const fetchNotes = async () => {
      if (!token) return; // Don't fetch if there's no token

      try {
        const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // We must include the token to access this protected endpoint
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notes.');
        }

        const data: Note[] = await response.json();
        setNotes(data); // Update our state with the fetched notes
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    };

    fetchNotes();
  }, [token]); // The effect depends on the token, so it runs when the token is available

  const handleCreateNote = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/notes`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: noteContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      // Add the new note to the top of our existing notes list for an instant update
      setNotes([newNote, ...notes]);
      setNoteContent('');
      setMessage('Note created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome! You are logged in.</p>
      <button onClick={logout}>Sign Out</button>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Create a New Note</h2>
      <form onSubmit={handleCreateNote}>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Write your note here..."
          rows={4}
          cols={50}
          required
        />
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Note'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <hr style={{ margin: '2rem 0' }} />

      <h2>Your Notes</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="notes-list">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <p>{note.content}</p>
              <small>Created: {new Date(note.created_at).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>You haven't created any notes yet.</p>
        )}
      </div>
    </div>
  );
}