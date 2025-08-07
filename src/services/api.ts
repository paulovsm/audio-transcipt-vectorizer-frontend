import axios from 'axios';
import {
  TranscriptionResponse,
  UploadResponse,
  SearchQuery,
  SearchResponse,
  Dataset,
  AnalysisRequest,
  AnalysisResponse,
  HealthCheck,
  Statistics,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const apiService = {
  // Upload de arquivo
  async uploadFile(
    file: File,
    options: {
      meeting_title?: string;
      meeting_type?: string;
      participants?: string[];
      language_code?: string;
      enhance_transcription?: boolean;
      dataset_name?: string;
    } = {}
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.meeting_title) formData.append('meeting_title', options.meeting_title);
    if (options.meeting_type) formData.append('meeting_type', options.meeting_type);
    if (options.participants) formData.append('participants', JSON.stringify(options.participants));
    if (options.language_code) formData.append('language_code', options.language_code);
    if (options.enhance_transcription !== undefined) formData.append('enhance_transcription', String(options.enhance_transcription));
    if (options.dataset_name) formData.append('dataset_name', options.dataset_name);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutos para upload
    });
    
    return response.data;
  },

  // Buscar transcrição por ID
  async getTranscription(id: string): Promise<TranscriptionResponse> {
    const response = await api.get(`/transcriptions/${id}`);
    return response.data;
  },

  // Buscar transcrições usando Dify
  async searchTranscriptions(query: SearchQuery): Promise<SearchResponse> {
    // Prioriza busca no Dify se dataset_id estiver especificado
    if (query.dataset_id) {
      return this.searchInDify(
        query.query,
        query.dataset_id,
        query.limit || 10,
        query.similarity_threshold || 0.7
      );
    }
    
    // Fallback para busca local (se necessário manter compatibilidade)
    const response = await api.post('/search', query);
    return response.data;
  },

  // Buscar no Dify
  async searchInDify(
    query: string,
    dataset_id?: string,
    limit: number = 10,
    similarity_threshold: number = 0.7
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    
    console.log('Enviando busca para Dify:', { query, dataset_id, limit, similarity_threshold });
    
    const response = await api.post('/search/dify', {
      query,
      dataset_id,
      limit,
      similarity_threshold,
    });
    
    const difyResponse = response.data;
    const executionTime = Date.now() - startTime;
    
    console.log('Resposta recebida do Dify:', difyResponse);
    
    // Tenta diferentes estruturas de resposta do Dify
    let records = [];
    if (difyResponse.records) {
      records = difyResponse.records;
    } else if (difyResponse.data) {
      records = difyResponse.data;
    } else if (Array.isArray(difyResponse)) {
      records = difyResponse;
    } else if (difyResponse.query && difyResponse.query.records) {
      records = difyResponse.query.records;
    }
    
    console.log('Records extraídos:', records);
    
    // Converte resposta do Dify para formato SearchResponse
    const searchResponse: SearchResponse = {
      results: records.map((item: any) => {
        // O Dify retorna dados aninhados em 'segment'
        const segment = item.segment || item;
        const document = segment.document || item.document || {};
        
        return {
          id: segment.id || item.id || segment.document_id || Math.random().toString(),
          text: segment.content || item.content || segment.text || item.text || '',
          score: item.score || segment.score || item.similarity || 0,
          metadata: document.doc_metadata || segment.metadata || item.metadata || {},
          transcription_id: segment.document_id || document.id || item.document_id || segment.id || ''
        };
      }),
      total_found: records.length,
      query: query,
      execution_time_ms: executionTime
    };
    
    console.log('SearchResponse formatada:', searchResponse);
    
    return searchResponse;
  },

  // Deletar transcrição
  async deleteTranscription(id: string): Promise<void> {
    await api.delete(`/transcriptions/${id}`);
  },

  // Gerar análise customizada
  async generateAnalysis(
    transcription_id: string,
    request: AnalysisRequest
  ): Promise<AnalysisResponse> {
    const response = await api.post(`/transcriptions/${transcription_id}/analyze`, request);
    return response.data;
  },

  // Gerenciar datasets
  async createDataset(name: string, description?: string): Promise<Dataset> {
    const response = await api.post('/datasets', { name, description });
    return response.data;
  },

  async listDatasets(page: number = 1, limit: number = 20): Promise<{ data: Dataset[] }> {
    const response = await api.get('/datasets', { params: { page, limit } });
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<HealthCheck> {
    const response = await api.get('/health');
    return response.data;
  },

  // Estatísticas
  async getStatistics(): Promise<Statistics> {
    const response = await api.get('/stats');
    return response.data;
  },

  // Listar transcrições
  async listTranscriptions(
    limit: number = 10,
    status?: string
  ): Promise<{ transcriptions: TranscriptionResponse[], total: number }> {
    const params: any = { limit };
    if (status) params.status = status;
    
    const response = await api.get('/transcriptions', { params });
    return response.data;
  },
};

export default apiService;
