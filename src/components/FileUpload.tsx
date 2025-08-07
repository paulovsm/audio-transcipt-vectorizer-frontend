import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  onUploadStart?: () => void;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  progress: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadStart,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    message: '',
    progress: 0,
  });
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [participants, setParticipants] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [languageCode, setLanguageCode] = useState('pt-BR');
  const [enhanceTranscription, setEnhanceTranscription] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setUploadState({ status: 'idle', message: '', progress: 0 });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = () => {
    setFiles([]);
    setUploadState({ status: 'idle', message: '', progress: 0 });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const file = files[0];
    setUploadState({ status: 'uploading', message: 'Enviando arquivo...', progress: 0 });
    onUploadStart?.();

    try {
      const participantsList = participants
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const response = await apiService.uploadFile(file, {
        meeting_title: meetingTitle || undefined,
        meeting_type: meetingType || undefined,
        participants: participantsList.length > 0 ? participantsList : undefined,
        language_code: languageCode,
        enhance_transcription: enhanceTranscription,
        dataset_name: datasetName || undefined,
      });

      setUploadState({
        status: 'success',
        message: 'Arquivo enviado com sucesso! Processamento iniciado.',
        progress: 100,
      });

      onUploadComplete?.(response.file_id);

      // Reset form after successful upload
      setTimeout(() => {
        setFiles([]);
        setMeetingTitle('');
        setMeetingType('');
        setParticipants('');
        setDatasetName('');
        setUploadState({ status: 'idle', message: '', progress: 0 });
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        status: 'error',
        message: 'Erro no upload. Tente novamente.',
        progress: 0,
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Arquivo de Áudio
        </CardTitle>
        <CardDescription>
          Envie arquivos de áudio para transcrição automática. Formatos aceitos: MP3, WAV, M4A, FLAC, OGG.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-primary hover:bg-gray-50",
            files.length > 0 && "border-green-300 bg-green-50"
          )}
        >
          <input {...getInputProps()} />
          {files.length === 0 ? (
            <div className="space-y-2">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive
                    ? "Solte o arquivo aqui..."
                    : "Clique ou arraste um arquivo de áudio"}
                </p>
                <p className="text-sm text-gray-500">
                  Máximo 100MB • MP3, WAV, M4A, FLAC, OGG
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <FileAudio className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-medium text-green-700">
                  {files[0].name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(files[0].size)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* File preview and remove */}
        {files.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileAudio className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{files[0].name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(files[0].size)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={removeFile}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título da Reunião</label>
            <Input
              placeholder="Ex: Reunião de Planning Sprint 5"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Reunião</label>
            <Input
              placeholder="Ex: planning, daily, review"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Dataset</label>
            <Input
              placeholder="Nome do dataset (opcional)"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Participantes</label>
          <Textarea
            placeholder="Ex: João Silva, Maria Santos, Pedro Costa (separados por vírgula)"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enhance"
            checked={enhanceTranscription}
            onChange={(e) => setEnhanceTranscription(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="enhance" className="text-sm font-medium">
            Aprimorar transcrição com IA
          </label>
        </div>

        {/* Upload status */}
        {uploadState.status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {uploadState.status === 'uploading' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
              {uploadState.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {uploadState.status === 'error' && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                uploadState.status === 'success' && "text-green-700",
                uploadState.status === 'error' && "text-red-700"
              )}>
                {uploadState.message}
              </span>
            </div>
            
            {uploadState.status === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploadState.status === 'uploading'}
          className="w-full"
          size="lg"
        >
          {uploadState.status === 'uploading' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Enviar e Processar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
