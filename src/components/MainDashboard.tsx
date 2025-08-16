import React, { useState, useEffect } from 'react';
import { Search, FileText, BarChart3, Settings, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { TextUpload } from '@/components/TextUpload';
import { DatasetSelector } from '@/components/DatasetSelector';
import { apiService } from '@/services/api';
import { SearchResponse, TranscriptionResponse, Statistics, Dataset } from '@/types/api';

// Função auxiliar para normalizar arrays BPML
const normalizeBpmlArray = (value: any): string[] | null => {
  if (!value) return null;
  if (Array.isArray(value)) return value.map(item => typeof item === 'string' ? item : String(item));
  if (typeof value === 'string') return [value];
  return null;
};

// Função auxiliar para verificar se um array BPML é válido
const isValidBpmlArray = (value: any): boolean => {
  const normalized = normalizeBpmlArray(value);
  return normalized !== null && normalized.length > 0;
};

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'upload-audio', label: 'Upload Áudio/Vídeo', icon: Mic },
    { id: 'upload-text', label: 'Upload Texto', icon: FileText },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'transcriptions', label: 'Transcrições', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="border-b">
      <nav className="flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const SearchTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (!selectedDataset) {
      setError('Por favor, selecione um dataset antes de realizar a busca.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.searchInDify(
        query.trim(),
        selectedDataset.id,
        10,
        0.3  // Threshold mais baixo para capturar mais resultados
      );
      
      setResults(response);
    } catch (error) {
      console.error('Search error:', error);
      setError('Erro ao realizar busca. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Semântica no Dify
          </CardTitle>
          <CardDescription>
            Encontre informações específicas em suas transcrições usando a base de conhecimento do Dify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de Dataset */}
          <DatasetSelector
            selectedDataset={selectedDataset}
            onDatasetSelect={setSelectedDataset}
            placeholder="Selecione um dataset para buscar..."
          />

          {/* Campo de busca */}
          <div className="flex gap-2">
            <Input
              placeholder="Ex: decisões sobre arquitetura, ações pendentes, problemas identificados..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
              disabled={!selectedDataset}
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim() || !selectedDataset}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Informações do dataset selecionado */}
          {selectedDataset && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">Dataset selecionado:</span> {selectedDataset.name}
                {selectedDataset.description && (
                  <div className="text-blue-600 mt-1">{selectedDataset.description}</div>
                )}
                <div className="text-blue-600 mt-1">
                  {selectedDataset.document_count} documentos • {selectedDataset.word_count} palavras
                </div>
              </div>
            </div>
          )}

          {/* Resultados da busca */}
          {results && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {results.total_found} resultados encontrados em {results.execution_time_ms}ms
              </div>
              
              {results.results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum resultado encontrado para sua busca.</p>
                  <p className="text-sm">Tente ajustar os termos de busca ou selecionar outro dataset.</p>
                </div>
              ) : (
                results.results.map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-blue-600">
                            Relevância: {(result.score * 100).toFixed(1)}%
                          </p>
                          {result.transcription_id && (
                            <span className="text-xs text-gray-500">
                              Documento: {result.transcription_id}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900">{result.text}</p>
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <span
                                key={key}
                                className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsTab: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getStatistics();
        setStats(response);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{stats?.total_documents || 0}</div>
              <FileText className="h-4 w-4 ml-auto text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mt-1">Total de Documentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{stats?.total_transcriptions || 0}</div>
              <Mic className="h-4 w-4 ml-auto text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mt-1">Transcrições</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{stats?.storage_used || '0 MB'}</div>
              <BarChart3 className="h-4 w-4 ml-auto text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mt-1">Armazenamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {stats?.last_update 
                  ? new Date(stats.last_update).toLocaleDateString() 
                  : 'N/A'
                }
              </div>
              <Settings className="h-4 w-4 ml-auto text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mt-1">Última Atualização</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Sistema</CardTitle>
          <CardDescription>
            Visão geral da utilização e performance do sistema de transcrição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Documentos Processados:</span>
                <span className="ml-2">{stats?.total_documents || 0}</span>
              </div>
              <div>
                <span className="font-medium">Transcrições Ativas:</span>
                <span className="ml-2">{stats?.total_transcriptions || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TranscriptionsTab: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTranscriptionId, setExpandedTranscriptionId] = useState<string | null>(null);
  const [selectedTranscription, setSelectedTranscription] = useState<TranscriptionResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [minutesLoading, setMinutesLoading] = useState(false);
  const [minutesError, setMinutesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        setLoading(true);
        const response = await apiService.listTranscriptions(20);
        setTranscriptions(response.transcriptions);
        setError(null);
      } catch (err) {
        console.error('Error fetching transcriptions:', err);
        setError('Erro ao carregar transcrições');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, []);

  const handleViewDetails = async (transcriptionId: string) => {
    // Se já está expandido, colapsa
    if (expandedTranscriptionId === transcriptionId) {
      setExpandedTranscriptionId(null);
      setSelectedTranscription(null);
      return;
    }

    try {
      setDetailsLoading(true);
      setExpandedTranscriptionId(transcriptionId);
      const fullTranscription = await apiService.getTranscription(transcriptionId);
      console.log('Full transcription data:', fullTranscription); // Debug log
      setSelectedTranscription(fullTranscription);
    } catch (err) {
      console.error('Error fetching transcription details:', err);
      setError('Erro ao carregar detalhes da transcrição');
      setExpandedTranscriptionId(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speakerTag: string) => {
    const colors = [
      '#3B82F6', // blue-500
      '#EF4444', // red-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
    ];
    
    // Generate a consistent color based on speaker tag
    const hash = speakerTag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleDelete = async (transcriptionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transcrição?')) {
      return;
    }

    try {
      await apiService.deleteTranscription(transcriptionId);
      setTranscriptions(transcriptions.filter(t => t.id !== transcriptionId));
    } catch (err) {
      console.error('Error deleting transcription:', err);
      setError('Erro ao excluir transcrição');
    }
  };

  const handleGenerateMinutes = async (transcriptionId: string) => {
    try {
      setMinutesLoading(true);
      setMinutesError(null);
      
      const response = await apiService.generateMeetingMinutes(transcriptionId);
      
      if (response.success) {
        // Atualiza a transcrição selecionada com a ata gerada
        if (selectedTranscription && selectedTranscription.id === transcriptionId) {
          setSelectedTranscription({
            ...selectedTranscription,
            meeting_minutes: response.meeting_minutes
          });
        }
        
        // Atualiza a lista de transcrições
        setTranscriptions(transcriptions.map(t => 
          t.id === transcriptionId 
            ? { ...t, meeting_minutes: response.meeting_minutes }
            : t
        ));
        
        alert('Ata de reunião gerada com sucesso!');
      } else {
        throw new Error(response.error || 'Erro ao gerar ata de reunião');
      }
    } catch (err) {
      console.error('Error generating meeting minutes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar ata de reunião';
      setMinutesError(errorMessage);
      alert(`Erro: ${errorMessage}`);
    } finally {
      setMinutesLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };

    const statusLabels = {
      completed: 'Concluída',
      processing: 'Processando',
      failed: 'Erro',
      pending: 'Pendente',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.pending}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcrições Recentes
            </CardTitle>
            <CardDescription>
              Visualize e gerencie suas transcrições de reuniões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando transcrições...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcrições Recentes
            </CardTitle>
            <CardDescription>
              Visualize e gerencie suas transcrições de reuniões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-red-300" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcrições Recentes
          </CardTitle>
          <CardDescription>
            Visualize e gerencie suas transcrições de reuniões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transcriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma transcrição encontrada.</p>
              <p className="text-sm">Faça upload de um arquivo para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transcriptions.map((transcription) => (
                <div key={transcription.id}>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-1">
                            {transcription.file_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>ID: {transcription.id}</span>
                            <span>Duração: {formatDuration(transcription.duration_seconds || 0)}</span>
                            <span>Criado: {formatDate(transcription.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(transcription.status)}
                        </div>
                      </div>
                      
                      {transcription.full_text && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {transcription.full_text.substring(0, 200)}
                            {transcription.full_text.length > 200 && '...'}
                          </p>
                        </div>
                      )}

                      {/* Indicador de ata disponível */}
                      {transcription.meeting_minutes && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-700 flex items-center gap-1">
                            📋 <span className="font-medium">Ata de reunião disponível</span>
                          </p>
                        </div>
                      )}

                      {/* Tags de contexto do projeto */}
                      {(transcription.metadata?.project || 
                        transcription.metadata?.workstream || 
                        isValidBpmlArray(transcription.metadata?.bpml_l1) || 
                        isValidBpmlArray(transcription.metadata?.bpml_l2)) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {transcription.metadata?.project && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              📊 {transcription.metadata.project}
                            </span>
                          )}
                          {transcription.metadata?.workstream && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                              🔄 {transcription.metadata.workstream}
                            </span>
                          )}
                          {isValidBpmlArray(transcription.metadata?.bpml_l1) && (
                            <div className="flex flex-wrap gap-1">
                              {normalizeBpmlArray(transcription.metadata?.bpml_l1)!.map((item, index) => (
                                <span key={`l1-${index}`} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                  L1: {item}
                                </span>
                              ))}
                            </div>
                          )}
                          {isValidBpmlArray(transcription.metadata?.bpml_l2) && (
                            <div className="flex flex-wrap gap-1">
                              {normalizeBpmlArray(transcription.metadata?.bpml_l2)!.map((item, index) => (
                                <span key={`l2-${index}`} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                                  L2: {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(transcription.id)}
                          disabled={detailsLoading && expandedTranscriptionId === transcription.id}
                        >
                          {detailsLoading && expandedTranscriptionId === transcription.id 
                            ? 'Carregando...' 
                            : expandedTranscriptionId === transcription.id 
                              ? 'Ocultar Detalhes' 
                              : 'Ver Detalhes'
                          }
                        </Button>
                        {transcription.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={transcription.meeting_minutes ? "text-green-600 hover:text-green-700" : "text-blue-600 hover:text-blue-700"}
                            onClick={() => {
                              if (transcription.meeting_minutes) {
                                handleViewDetails(transcription.id);
                              } else {
                                handleGenerateMinutes(transcription.id);
                              }
                            }}
                            disabled={minutesLoading}
                          >
                            {minutesLoading ? 'Gerando...' : (transcription.meeting_minutes ? 'Ver Ata' : 'Gerar Ata')}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(transcription.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detalhes expandidos inline */}
                  {expandedTranscriptionId === transcription.id && selectedTranscription && (
                    <Card className="mt-2 ml-4 border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Detalhes da Transcrição: {selectedTranscription.file_name}
                            </CardTitle>
                            <CardDescription>
                              ID: {selectedTranscription.id}
                            </CardDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setExpandedTranscriptionId(null);
                              setSelectedTranscription(null);
                            }}
                          >
                            Fechar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Informações básicas */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-sm text-gray-600">Status:</span>
                              <div className="mt-1">{getStatusBadge(selectedTranscription.status)}</div>
                            </div>
                            <div>
                              <span className="font-medium text-sm text-gray-600">Duração:</span>
                              <p className="mt-1">{formatDuration(selectedTranscription.duration_seconds || 0)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-sm text-gray-600">Criado em:</span>
                              <p className="mt-1">{formatDate(selectedTranscription.created_at)}</p>
                            </div>
                            {selectedTranscription.completed_at && (
                              <div>
                                <span className="font-medium text-sm text-gray-600">Concluído em:</span>
                                <p className="mt-1">{formatDate(selectedTranscription.completed_at)}</p>
                              </div>
                            )}
                            {selectedTranscription.metadata?.project && (
                              <div>
                                <span className="font-medium text-sm text-gray-600">Projeto:</span>
                                <p className="mt-1 font-medium text-blue-700">{selectedTranscription.metadata.project}</p>
                              </div>
                            )}
                            {selectedTranscription.metadata?.workstream && (
                              <div>
                                <span className="font-medium text-sm text-gray-600">Workstream:</span>
                                <p className="mt-1 font-medium text-purple-700">{selectedTranscription.metadata.workstream}</p>
                              </div>
                            )}
                            {isValidBpmlArray(selectedTranscription.metadata?.bpml_l1) && (
                              <div>
                                <span className="font-medium text-sm text-gray-600">BPML L1:</span>
                                <p className="mt-1 font-medium text-green-700">
                                  {(() => {
                                    const bpml_l1 = normalizeBpmlArray(selectedTranscription.metadata?.bpml_l1)!;
                                    return bpml_l1.length === 1 ? bpml_l1[0] : `${bpml_l1.length} categorias`;
                                  })()}
                                </p>
                              </div>
                            )}
                            {isValidBpmlArray(selectedTranscription.metadata?.bpml_l2) && (
                              <div>
                                <span className="font-medium text-sm text-gray-600">BPML L2:</span>
                                <p className="mt-1 font-medium text-orange-700">
                                  {(() => {
                                    const bpml_l2 = normalizeBpmlArray(selectedTranscription.metadata?.bpml_l2)!;
                                    return bpml_l2.length === 1 ? bpml_l2[0] : `${bpml_l2.length} subcategorias`;
                                  })()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Informações do Projeto e Contexto */}
                          {(selectedTranscription.metadata?.project || 
                            selectedTranscription.metadata?.workstream || 
                            isValidBpmlArray(selectedTranscription.metadata?.bpml_l1) || 
                            isValidBpmlArray(selectedTranscription.metadata?.bpml_l2) ||
                            selectedTranscription.metadata?.meeting_type ||
                            selectedTranscription.metadata?.meeting_id) && (
                            <div>
                              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                                <span className="text-gray-600">🏢</span>
                                Informações do Projeto e Contexto
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                                {selectedTranscription.metadata?.project && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-blue-600 font-medium text-sm">Projeto:</span>
                                    <span className="text-gray-900 font-medium">{selectedTranscription.metadata.project}</span>
                                  </div>
                                )}
                                {selectedTranscription.metadata?.workstream && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-purple-600 font-medium text-sm">Workstream:</span>
                                    <span className="text-gray-900 font-medium">{selectedTranscription.metadata.workstream}</span>
                                  </div>
                                )}
                                {isValidBpmlArray(selectedTranscription.metadata?.bpml_l1) && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-green-600 font-medium text-sm">BPML L1:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {normalizeBpmlArray(selectedTranscription.metadata?.bpml_l1)!.map((item, index) => (
                                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {isValidBpmlArray(selectedTranscription.metadata?.bpml_l2) && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-orange-600 font-medium text-sm">BPML L2:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {normalizeBpmlArray(selectedTranscription.metadata?.bpml_l2)!.map((item, index) => (
                                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {selectedTranscription.metadata?.meeting_type && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-indigo-600 font-medium text-sm">Tipo de Reunião:</span>
                                    <span className="text-gray-900 font-medium">{selectedTranscription.metadata.meeting_type}</span>
                                  </div>
                                )}
                                {selectedTranscription.metadata?.meeting_id && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-teal-600 font-medium text-sm">ID da Reunião:</span>
                                    <span className="text-gray-900 font-medium">{selectedTranscription.metadata.meeting_id}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Resumo Executivo */}
                          {selectedTranscription.summary && (
                            <div>
                              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Resumo Executivo
                              </h3>
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-gray-900 leading-relaxed">
                                  {selectedTranscription.summary}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Ações Definidas */}
                          {selectedTranscription.metadata?.action_items && selectedTranscription.metadata.action_items.length > 0 && (
                            <div>
                              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                                <span className="text-orange-600">📋</span>
                                Ações Definidas
                              </h3>
                              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <ul className="space-y-2">
                                  {selectedTranscription.metadata.action_items.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-orange-600 font-medium">{index + 1}.</span>
                                      <span className="text-gray-900">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Decisões Tomadas */}
                          {selectedTranscription.metadata?.decisions && selectedTranscription.metadata.decisions.length > 0 && (
                            <div>
                              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                Decisões Tomadas
                              </h3>
                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <ul className="space-y-2">
                                  {selectedTranscription.metadata.decisions.map((decision, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-green-600 font-medium">{index + 1}.</span>
                                      <span className="text-gray-900">{decision}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Pontos-Chave */}
                          {selectedTranscription.metadata?.key_points && selectedTranscription.metadata.key_points.length > 0 && (
                            <div>
                              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                                <span className="text-purple-600">💡</span>
                                Pontos-Chave
                              </h3>
                              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <ul className="space-y-2">
                                  {selectedTranscription.metadata.key_points.map((point, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-purple-600 font-medium">{index + 1}.</span>
                                      <span className="text-gray-900">{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Transcrição com Speaker Diarization */}
                          {selectedTranscription.metadata?.segments && selectedTranscription.metadata.segments.length > 0 ? (
                            <div>
                              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                                <span className="text-blue-600">🎤</span>
                                Transcrição com Identificação de Falantes
                              </h3>
                              <div className="p-4 bg-white border rounded-lg max-h-96 overflow-y-auto">
                                <div className="space-y-4">
                                  {selectedTranscription.metadata.segments.map((segment, index) => {
                                    const startTimeFormatted = formatTimestamp(segment.start_time);
                                    const speakerColor = getSpeakerColor(segment.speaker_tag || 'Speaker A');
                                    
                                    return (
                                      <div key={index} className="border-l-4 pl-4 py-2" style={{ borderLeftColor: speakerColor }}>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span 
                                            className="text-sm font-medium px-2 py-1 rounded-full text-white"
                                            style={{ backgroundColor: speakerColor }}
                                          >
                                            {segment.speaker_tag || 'Speaker A'}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {startTimeFormatted}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                            ({(segment.confidence * 100).toFixed(1)}% confiança)
                                          </span>
                                        </div>
                                        <p className="text-gray-900 leading-relaxed">
                                          {segment.text}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            selectedTranscription.full_text && (
                              <div>
                                <h3 className="font-medium text-lg mb-3">Transcrição Completa</h3>
                                <div className="p-4 bg-white border rounded-lg max-h-96 overflow-y-auto">
                                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                    {selectedTranscription.full_text}
                                  </p>
                                </div>
                              </div>
                            )
                          )}

                          {/* Ata de Reunião */}
                          {selectedTranscription.meeting_minutes && (
                            <div>
                              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                                <span className="text-blue-600">📋</span>
                                Ata de Reunião
                              </h3>
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                  {selectedTranscription.meeting_minutes}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Botão para gerar ata se ainda não foi gerada */}
                          {selectedTranscription.status === 'completed' && !selectedTranscription.meeting_minutes && (
                            <div className="text-center">
                              <Button 
                                onClick={() => handleGenerateMinutes(selectedTranscription.id)}
                                disabled={minutesLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {minutesLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Gerando Ata...
                                  </>
                                ) : (
                                  <>
                                    📋 Gerar Ata de Reunião
                                  </>
                                )}
                              </Button>
                              {minutesError && (
                                <p className="text-red-600 text-sm mt-2">{minutesError}</p>
                              )}
                            </div>
                          )}

                          {/* Mensagem de erro (se houver) */}
                          {selectedTranscription.error_message && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <h3 className="font-medium text-red-800 mb-2">Erro no Processamento</h3>
                              <p className="text-red-700">{selectedTranscription.error_message}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface MainDashboardProps { embedMode?: boolean }
export const MainDashboard: React.FC<MainDashboardProps> = ({ embedMode = false }) => {
  const [activeTab, setActiveTab] = useState('upload-audio');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload-audio':
        return <FileUpload />;
      case 'upload-text':
        return <TextUpload />;
      case 'search':
        return <SearchTab />;
      case 'transcriptions':
        return <TranscriptionsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <FileUpload />;
    }
  };

  return (
    <div className={embedMode ? '' : 'min-h-screen bg-gray-50'}>
      {!embedMode && (
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Mic className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Sistema de Transcrição de Reuniões
                  </h1>
                  <p className="text-sm text-gray-600">
                    Transcreva e analise suas reuniões com IA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={embedMode ? 'py-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {renderTabContent()}
      </main>
    </div>
  );
};
