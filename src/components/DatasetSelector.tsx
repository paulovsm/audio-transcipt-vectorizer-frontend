import React, { useState, useEffect, useMemo } from 'react';
import { Search, Database, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dataset } from '@/types/api';
import { apiService } from '@/services/api';

interface DatasetSelectorProps {
  selectedDataset: Dataset | null;
  onDatasetSelect: (dataset: Dataset | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  selectedDataset,
  onDatasetSelect,
  placeholder = "Selecione um dataset...",
  disabled = false
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Carrega datasets na montagem do componente
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.listDatasets(1, 100); // Carrega mais datasets
        setDatasets(response.data || []);
      } catch (err) {
        console.error('Erro ao carregar datasets:', err);
        setError('Erro ao carregar datasets');
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
  }, []);

  // Filtra datasets com base no termo de busca
  const filteredDatasets = useMemo(() => {
    if (!searchTerm.trim()) return datasets;
    
    const term = searchTerm.toLowerCase();
    return datasets.filter(dataset => 
      dataset.name.toLowerCase().includes(term) ||
      (dataset.description?.toLowerCase().includes(term))
    );
  }, [datasets, searchTerm]);

  const handleDatasetSelect = (dataset: Dataset) => {
    onDatasetSelect(dataset);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onDatasetSelect(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Dataset para Busca
        </label>
        
        {/* Botão principal */}
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className="w-full justify-between h-10"
        >
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {selectedDataset ? selectedDataset.name : placeholder}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            {/* Campo de busca */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar datasets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de datasets */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
                  Carregando datasets...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  {error}
                </div>
              ) : filteredDatasets.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Nenhum dataset encontrado' : 'Nenhum dataset disponível'}
                </div>
              ) : (
                <>
                  {/* Opção para limpar seleção */}
                  {selectedDataset && (
                    <button
                      onClick={clearSelection}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b flex items-center gap-2 text-gray-600"
                    >
                      <span className="text-sm">— Limpar seleção —</span>
                    </button>
                  )}
                  
                  {/* Lista de datasets */}
                  {filteredDatasets.map((dataset) => (
                    <button
                      key={dataset.id}
                      onClick={() => handleDatasetSelect(dataset)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${
                        selectedDataset?.id === dataset.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 truncate">
                            {dataset.name}
                          </span>
                          {selectedDataset?.id === dataset.id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        {dataset.description && (
                          <p className="text-sm text-gray-600 truncate">
                            {dataset.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{dataset.document_count} documentos</span>
                          <span>{dataset.word_count} palavras</span>
                          {dataset.created_at && (
                            <span>
                              Criado: {new Date(dataset.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
