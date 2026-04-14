import api from './api';

export interface Note {
  id: string;
  connection_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const listNotes = async (connectionId: string): Promise<Note[]> => {
  const { data } = await api.get(`/notes/${connectionId}`);
  return data;
};

export const createNote = async (
  connectionId: string,
  payload: { name: string; description: string }
): Promise<Note> => {
  const { data } = await api.post(`/notes/${connectionId}`, payload);
  return data;
};

export const updateNote = async (
  noteId: string,
  payload: { name: string; description: string }
): Promise<Note> => {
  const { data } = await api.put(`/notes/${noteId}`, payload);
  return data;
};

export const deleteNote = async (noteId: string): Promise<void> => {
  await api.delete(`/notes/${noteId}`);
};
