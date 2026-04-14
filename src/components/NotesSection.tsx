import { useEffect, useMemo, useState } from 'react';
import { BookText, Pencil, Save, Trash2, X } from 'lucide-react';
import { createNote, deleteNote, listNotes, type Note, updateNote } from '../lib/notes';
import { toast } from 'sonner';

interface NotesSectionProps {
  connectionId: string | null;
}

const getWordCount = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export const NotesSection = ({ connectionId }: NotesSectionProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const newWordCount = useMemo(() => getWordCount(newDescription), [newDescription]);
  const editWordCount = useMemo(() => getWordCount(editDescription), [editDescription]);

  const loadNotes = async (activeConnectionId: string) => {
    setLoading(true);
    try {
      const data = await listNotes(activeConnectionId);
      setNotes(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');

    if (!connectionId) {
      setNotes([]);
      return;
    }

    void loadNotes(connectionId);
  }, [connectionId]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!connectionId || saving) return;

    const trimmedName = newName.trim();
    const trimmedDescription = newDescription.trim();

    if (!trimmedName || !trimmedDescription) {
      toast.error('Name and description are required');
      return;
    }

    if (newWordCount > 10000) {
      toast.error(`Description exceeds 10000 words (current: ${newWordCount})`);
      return;
    }

    setSaving(true);
    try {
      const created = await createNote(connectionId, {
        name: trimmedName,
        description: trimmedDescription
      });
      setNotes((prev) => [created, ...prev]);
      setNewName('');
      setNewDescription('');
      toast.success('Note created');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create note');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditName(note.name);
    setEditDescription(note.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  const handleUpdate = async (noteId: string) => {
    if (saving) return;

    const trimmedName = editName.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedName || !trimmedDescription) {
      toast.error('Name and description are required');
      return;
    }

    if (editWordCount > 10000) {
      toast.error(`Description exceeds 10000 words (current: ${editWordCount})`);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateNote(noteId, {
        name: trimmedName,
        description: trimmedDescription
      });

      setNotes((prev) => prev.map((note) => (note.id === noteId ? updated : note)));
      cancelEdit();
      toast.success('Note updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (saving) return;
    setSaving(true);
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      toast.success('Note deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete note');
    } finally {
      setSaving(false);
    }
  };

  if (!connectionId) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600 dark:text-slate-500 italic text-sm px-4 text-center">
        Select or add a connection to manage notes.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-3 md:p-4 bg-white dark:bg-sql-950 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <BookText size={16} />
          <h3 className="text-sm font-semibold">Connection Notes</h3>
        </div>
        <span className="text-[10px] px-2 py-1 rounded bg-slate-200 text-slate-700 dark:bg-sql-700 dark:text-slate-300">
          {notes.length}/10
        </span>
      </div>

      <form
        onSubmit={handleCreate}
        className="space-y-2 rounded-lg border border-slate-300 p-3 bg-slate-100 dark:border-sql-700 dark:bg-sql-800/40"
      >
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Note name"
          maxLength={255}
          disabled={saving || notes.length >= 10}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sql-accent dark:border-sql-700 dark:bg-sql-900 dark:text-slate-100"
        />
        <textarea
          value={newDescription}
          onChange={(event) => setNewDescription(event.target.value)}
          placeholder="Write note description"
          disabled={saving || notes.length >= 10}
          rows={4}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sql-accent dark:border-sql-700 dark:bg-sql-900 dark:text-slate-100"
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {newWordCount}/10000 words
          </p>
          <button
            type="submit"
            disabled={saving || notes.length >= 10 || newWordCount > 10000}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-sql-accent text-white hover:bg-sql-accent/90 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Add Note
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-sm text-slate-600 dark:text-slate-400">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-sm text-slate-600 dark:text-slate-500 italic">No notes yet for this connection.</div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => {
            const isEditing = editingId === note.id;

            return (
              <div
                key={note.id}
                className="rounded-lg border border-slate-300 p-3 bg-white dark:border-sql-700 dark:bg-sql-900"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      maxLength={255}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sql-accent dark:border-sql-700 dark:bg-sql-900 dark:text-slate-100"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sql-accent dark:border-sql-700 dark:bg-sql-900 dark:text-slate-100"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {editWordCount}/10000 words
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(note.id)}
                          disabled={saving || editWordCount > 10000}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-400"
                        >
                          <Save size={13} />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-300 text-slate-800 hover:bg-slate-400 dark:bg-sql-700 dark:text-slate-200"
                        >
                          <X size={13} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">{note.name}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          disabled={saving}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-sql-700 dark:text-slate-200"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(note.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                      {note.description}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500">
                      {getWordCount(note.description)} words
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
