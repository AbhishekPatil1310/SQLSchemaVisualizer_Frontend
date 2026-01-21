import api from './api';

export interface QueryResponse {
  type: 'table' | 'json';
  columns?: string[];
  rows?: any[];
  data?: any; // For JSON mode
  rowCount?: number;
}

export const executeSql = async (sql: string, format: 'table' | 'json'): Promise<QueryResponse> => {
  const { data } = await api.post('/query/execute', { sql, format });
  return data;
};

export const fetchSchema = async () => {
  const token = localStorage.getItem('auth_token');
  const response = await api.get('/query/schema', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};