import axios from 'axios';
import { PPTUploadResponse, PPTTranscriptionResponse, PPTSearchResponse, PPTStatistics, PPTSlideDetail } from '@/types/ppt';

const PPT_API_BASE_URL = import.meta.env.VITE_PPT_API_URL || '/ppt-api';

const pptApi = axios.create({ baseURL: PPT_API_BASE_URL, timeout: 30000 });

pptApi.interceptors.response.use(r => r, e => { console.error('PPT API Error:', e); throw e; });

export const pptService = {
  async uploadPresentation(file: File, options: { 
    presentation_title?: string; 
    presentation_type?: string; 
    author?: string; 
    language_code?: string; 
    detailed_analysis?: boolean; 
    dataset_name?: string;
    // Novos campos
    meeting_id?: string;
    workstream?: string;
    bpml_l1?: string;
    bpml_l2?: string;
  } = {}): Promise<PPTUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    if (options.presentation_title) form.append('presentation_title', options.presentation_title);
    if (options.presentation_type) form.append('presentation_type', options.presentation_type);
    if (options.author) form.append('author', options.author);
    form.append('language_code', options.language_code || 'pt-BR');
    form.append('detailed_analysis', String(options.detailed_analysis ?? true));
    if (options.dataset_name) form.append('dataset_name', options.dataset_name);
    // Novos campos
    if (options.meeting_id) form.append('meeting_id', options.meeting_id);
    if (options.workstream) form.append('workstream', options.workstream);
    if (options.bpml_l1) form.append('bpml_l1', options.bpml_l1);
    if (options.bpml_l2) form.append('bpml_l2', options.bpml_l2);
    const resp = await pptApi.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 180000 });
    return resp.data;
  },
  async listTranscriptions(limit = 10, status?: string): Promise<{ transcriptions: PPTTranscriptionResponse[]; total: number; }>{
    const params: any = { limit }; if (status) params.status = status;
    const resp = await pptApi.get('/transcriptions', { params });
    return resp.data;
  },
  async getTranscription(id: string): Promise<PPTTranscriptionResponse> { const resp = await pptApi.get(`/transcriptions/${id}`); return resp.data; },
  async deleteTranscription(id: string): Promise<void> { await pptApi.delete(`/transcriptions/${id}`); },
  async search(query: string, dataset_id?: string, limit=10, similarity_threshold=0.7): Promise<PPTSearchResponse> {
    const start = Date.now();
    const resp = await pptApi.post('/search/dify', { query, dataset_id, limit, similarity_threshold });
    const raw = resp.data; let records: any[] = [];
    if (raw.records) records = raw.records; else if (raw.data) records = raw.data; else if (Array.isArray(raw)) records = raw;
    return { results: records.map((r:any)=>{ const seg = r.segment || r; const doc = seg.document || {}; return { id: seg.id || r.id || Math.random().toString(), text: seg.content || r.content || seg.text || '', score: r.score || seg.score || r.similarity || 0, metadata: doc.doc_metadata || seg.metadata || r.metadata || {}, transcription_id: seg.document_id || doc.id || r.document_id || seg.id || '', slide_number: seg.slide_number, element_id: seg.element_id }; }), total_found: records.length, query, execution_time_ms: Date.now()-start };
  },
  async getStatistics(): Promise<PPTStatistics> { const resp = await pptApi.get('/stats'); return resp.data; },
  async getSlide(transcriptionId: string, slideNumber: number): Promise<PPTSlideDetail> { const resp = await pptApi.get(`/slides/${transcriptionId}/${slideNumber}`); return resp.data; }
};

export default pptService;
