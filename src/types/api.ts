export interface TranscriptionRequest {
  file_name: string;
  meeting_id?: string;
  meeting_date?: string;
  participants?: string[];
  meeting_type?: string;
  language_code: string;
  enhance_transcription: boolean;
  dataset_name?: string;
  // Novos campos adicionados
  project?: string;
  workstream?: string;
  bpml_l1?: string;
  bpml_l2?: string;
}

export interface TranscriptionSegment {
  start_time: number;
  end_time: number;
  text: string;
  confidence: number;
  speaker_tag?: string;
}

export interface TranscriptionResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name: string;
  duration_seconds?: number;
  segments?: TranscriptionSegment[];
  full_text?: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  metadata?: MeetingMetadata;
  summary?: string;
  meeting_minutes?: string;
}

export interface UploadResponse {
  file_id: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  message: string;
}

export interface SearchQuery {
  query: string;
  limit?: number;
  similarity_threshold?: number;
  filters?: Record<string, any>;
  include_metadata?: boolean;
  dataset_id?: string;
}

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
  transcription_id: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total_found: number;
  query: string;
  execution_time_ms: number;
}

export interface DifySearchResponse {
  query: {
    content: string;
  };
  records: Array<{
    id: string;
    content: string;
    score: number;
    metadata?: Record<string, any>;
    document_id?: string;
    document_name?: string;
  }>;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  permission: string;
  document_count: number;
  word_count: number;
  created_at?: string;
}

export interface MeetingMetadata {
  meeting_id: string;
  meeting_date: string;
  participants: string[];
  meeting_type: string;
  topics: string[];
  action_items: string[];
  decisions: string[];
  key_points: string[];
  sentiment?: string;
  urgency_level?: string;
  follow_up_required?: boolean;
  segments?: TranscriptionSegment[];
  // Novos campos adicionados
  project?: string;
  workstream?: string;
  bpml_l1?: string[]; // Lista de strings (backend converte de string para array)
  bpml_l2?: string[]; // Lista de strings (backend converte de string para array)
}

export interface ProcessedTranscription {
  transcription_id: string;
  metadata: MeetingMetadata;
  summary: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at?: string;
  error_message?: string;
}

export interface AnalysisRequest {
  analysis_type: 'functional_requirements' | 'mind_map' | 'custom';
  custom_prompt?: string;
}

export interface AnalysisResponse {
  analysis: string;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
}

export interface Statistics {
  total_documents: number;
  total_transcriptions: number;
  storage_used: string;
  last_update: string;
}

export interface MeetingMinutesResponse {
  success: boolean;
  meeting_minutes?: string;
  transcription_id?: string;
  workflow_run_id?: string;
  task_id?: string;
  message: string;
  error?: string;
}
