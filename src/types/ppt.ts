export type PPTTranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PPTSlideElement {
  element_id: string;
  element_type: string;
  raw_content?: string;
  semantic_analysis: Record<string, any>;
  position?: { x?: number; y?: number; width?: number; height?: number };
  relationships_to_other_elements?: Array<Record<string, any>>;
}

export interface PPTSlideData {
  slide_number: number;
  slide_title?: string | null;
  slide_summary: string;
  elements: PPTSlideElement[];
}

export interface PPTPresentationMetadata {
  title?: string | null;
  author?: string | null;
  date?: string | null;
  source_filename: string;
  total_slides: number;
  presentation_type?: string | null;
  language: string;
}

export interface PPTPresentationTranscription {
  presentation_metadata: PPTPresentationMetadata;
  overall_summary: string;
  key_concepts: string[];
  narrative_flow_analysis: string;
  slides: PPTSlideData[];
}

export interface PPTTranscriptionResponse {
  id: string;
  status: PPTTranscriptionStatus;
  file_name: string;
  slides_count?: number;
  transcription?: PPTPresentationTranscription;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  processing_time_seconds?: number;
}

export interface PPTUploadResponse {
  file_id: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  message: string;
  presentation_format: string;
}

export interface PPTSearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
  transcription_id: string;
  slide_number?: number;
  element_id?: string;
}

export interface PPTSearchResponse {
  results: PPTSearchResult[];
  total_found: number;
  query: string;
  execution_time_ms: number;
}

export interface PPTStatistics {
  total_presentations?: number;
  total_slides?: number;
  storage_used?: string;
  last_update?: string;
}

export interface PPTSlideDetail extends PPTSlideData {}
