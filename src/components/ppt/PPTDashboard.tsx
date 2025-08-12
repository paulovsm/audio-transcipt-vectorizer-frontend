import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Search, FileText, FileBox, X, CheckCircle, AlertCircle } from 'lucide-react';
import { pptService } from '@/services/pptApi';
import { PPTTranscriptionResponse, PPTSlideData } from '@/types/ppt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DatasetSelector } from '@/components/DatasetSelector';

interface TabsProps { active: string; onChange: (t: string)=>void; }
const Tabs: React.FC<TabsProps> = ({ active, onChange }) => {
  const tabs = [ { id: 'upload', label: 'Upload', icon: Upload }, { id: 'search', label: 'Buscar', icon: Search }, { id: 'transcriptions', label: 'Transcrições', icon: FileText } ];
  return (<div className="border-b mb-6"><nav className="flex space-x-6 px-2">{tabs.map(t=>{ const Icon=t.icon; const act=active===t.id; return (<button key={t.id} onClick={()=>onChange(t.id)} className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 ${act?'border-primary text-primary':'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><Icon className="h-4 w-4"/>{t.label}</button>); })}</nav></div>);
};

interface UploadState { status: 'idle'|'uploading'|'success'|'error'; message: string; }
const PPTUploadTab: React.FC = () => {
  const [files,setFiles]=useState<File[]>([]);
  const [title,setTitle]=useState('');
  const [ptype,setPtype]=useState('');
  const [author,setAuthor]=useState('');
  const [dataset,setDataset]=useState('');
  const [languageCode,setLanguageCode]=useState('pt-BR');
  const [detailedAnalysis,setDetailedAnalysis]=useState(true);
  // Novos estados
  const [meetingId,setMeetingId]=useState('');
  const [workstream,setWorkstream]=useState('');
  const [bpmlL1,setBpmlL1]=useState('');
  const [bpmlL2,setBpmlL2]=useState('');
  const [state,setState]=useState<UploadState>({status:'idle',message:''});

  const onDrop = useCallback((accepted:File[])=>{ if(accepted && accepted[0]) { setFiles([accepted[0]]); setState({status:'idle',message:''}); } },[]);
  const {getRootProps,getInputProps,isDragActive} = useDropzone({onDrop, accept:{'application/vnd.ms-powerpoint':['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation':['.pptx'], 'application/pdf':['.pdf']}, multiple:false, maxSize: 80*1024*1024});

  const removeFile=()=>{ setFiles([]); setState({status:'idle',message:''}); };

  const formatSize=(bytes:number)=>{ if(bytes===0)return '0 Bytes'; const k=1024; const sizes=['Bytes','KB','MB','GB']; const i=Math.floor(Math.log(bytes)/Math.log(k)); return parseFloat((bytes/Math.pow(k,i)).toFixed(2))+' '+sizes[i]; };

  const handleUpload = async ()=>{
    if(files.length===0) return; const file=files[0]; setState({status:'uploading',message:'Enviando arquivo...'});
    try {
      const resp = await pptService.uploadPresentation(file,{ presentation_title: title||undefined, presentation_type: ptype||undefined, author: author||undefined, dataset_name: dataset||undefined, language_code: languageCode, detailed_analysis: detailedAnalysis, meeting_id: meetingId||undefined, workstream: workstream||undefined, bpml_l1: bpmlL1||undefined, bpml_l2: bpmlL2||undefined });
      setState({status:'success',message:`Upload iniciado. ID: ${resp.file_id}`});
      setTimeout(()=>{ setFiles([]); setTitle(''); setPtype(''); setAuthor(''); setDataset(''); setWorkstream(''); setBpmlL1(''); setBpmlL2(''); setDetailedAnalysis(true); setLanguageCode('pt-BR'); setState({status:'idle',message:''}); },2500);
    } catch (e) {
      console.error(e); setState({status:'error',message:'Erro no upload. Tente novamente.'});
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5"/>Upload de Apresentação</CardTitle>
        <CardDescription>Envie arquivos PPT, PPTX ou PDF para transcrição e análise detalhada.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive?'border-primary bg-primary/10':'border-gray-300 hover:border-primary hover:bg-gray-50'} ${files.length>0?'border-green-300 bg-green-50':''}`}> 
          <input {...getInputProps()} />
          {files.length===0 ? (
            <div className="space-y-2">
              <FileBox className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">{isDragActive?'Solte o arquivo aqui...':'Clique ou arraste uma apresentação'}</p>
                <p className="text-sm text-gray-500">Máximo 80MB • PPT, PPTX, PDF</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <FileBox className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <p className="text-lg font-medium text-green-700">{files[0].name}</p>
                <p className="text-sm text-gray-500">{formatSize(files[0].size)}</p>
              </div>
            </div>
          )}
        </div>

        {files.length>0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileBox className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">{files[0].name}</p>
                <p className="text-sm text-gray-500">{formatSize(files[0].size)}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={removeFile} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">Título</label><Input placeholder="Título da apresentação" value={title} onChange={e=>setTitle(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Identificador da Reunião</label><Input placeholder="Ex: Sprint-Planning-2024-08" value={meetingId} onChange={e=>setMeetingId(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Tipo</label><Input placeholder="Ex: comercial, técnico" value={ptype} onChange={e=>setPtype(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Autor</label><Input placeholder="Nome do autor" value={author} onChange={e=>setAuthor(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Workstream</label><Input placeholder="Ex: Technology, Product, Operations" value={workstream} onChange={e=>setWorkstream(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">BPML L1</label><Input placeholder="Ex: Core Banking, Customer Onboarding" value={bpmlL1} onChange={e=>setBpmlL1(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">BPML L2</label><Input placeholder="Ex: Account Opening, KYC Process" value={bpmlL2} onChange={e=>setBpmlL2(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Dataset Dify (opcional)</label><Input placeholder="Nome do dataset" value={dataset} onChange={e=>setDataset(e.target.value)} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Idioma</label><select value={languageCode} onChange={e=>setLanguageCode(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="pt-BR">Português (Brasil)</option><option value="en-US">English (US)</option><option value="es-ES">Español</option></select></div>
          <div className="space-y-2 flex items-end"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={detailedAnalysis} onChange={e=>setDetailedAnalysis(e.target.checked)} className="rounded border-gray-300" />Análise detalhada</label></div>
        </div>

        {state.status!=="idle" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {state.status==='uploading' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
              {state.status==='success' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {state.status==='error' && <AlertCircle className="h-4 w-4 text-red-500" />}
              <span className={`text-sm font-medium ${state.status==='success'?'text-green-700':state.status==='error'?'text-red-700':''}`}>{state.message}</span>
            </div>
          </div>
        )}

        <Button disabled={files.length===0 || state.status==='uploading'} onClick={handleUpload} className="w-full" size="lg">
          {state.status==='uploading'? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Enviando...</>) : (<><Upload className="h-4 w-4 mr-2"/>Enviar e Processar</>)}
        </Button>
      </CardContent>
    </Card>
  );
};

const PPTTranscriptionsTab: React.FC = () => {
  const [items,setItems]=useState<PPTTranscriptionResponse[]>([]);
  const [loading,setLoading]=useState(true);
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const [fullCache,setFullCache]=useState<Record<string,PPTTranscriptionResponse>>({});
  const [slide,setSlide]=useState<PPTSlideData|null>(null);
  const [slideLoading,setSlideLoading]=useState(false);
  const [loadingDetail,setLoadingDetail]=useState(false);

  useEffect(()=>{(async()=>{ try{ setLoading(true); const r= await pptService.listTranscriptions(20); setItems(r.transcriptions.map(t=>({ ...t, id: (t as any).id || (t as any).transcription_id })));} finally { setLoading(false);} })();},[]);

  const toggleExpand = async (id:string)=>{
    if(expandedId===id){ setExpandedId(null); setSlide(null); return; }
    setExpandedId(id); setSlide(null);
    if(!fullCache[id]){ try { setLoadingDetail(true); const full = await pptService.getTranscription(id); setFullCache(c=>({...c,[id]:full})); } finally { setLoadingDetail(false);} }
  };

  const loadSlide = async (id:string,num:number)=>{ setSlideLoading(true); setSlide(null); try { const s = await pptService.getSlide(id,num); setSlide(s as any);} finally { setSlideLoading(false);} };

  if (loading) return <div className="p-6 text-sm text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      {items.length===0 && <Card><CardContent className="py-8 text-center text-sm text-gray-500">Nenhuma transcrição ainda.</CardContent></Card>}
      {items.map(t=>{ const displayId=(t as any).transcription_id || t.id; const full=fullCache[displayId]; const expanded=expandedId===displayId; return (
        <Card key={displayId} className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{t.file_name}</h3>
                <p className="text-xs text-gray-500">ID: {displayId}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.status==='completed'?'bg-green-100 text-green-700':t.status==='failed'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
            </div>
            {(t as any).transcription?.overall_summary && <p className="text-sm text-gray-700 line-clamp-2">{(t as any).transcription.overall_summary}</p>}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={()=>toggleExpand(displayId)}>{expanded? 'Fechar' : 'Detalhes'}</Button>
            </div>
            {expanded && (
              <div className="mt-2 border-t pt-4 space-y-6">
                {loadingDetail && !full && <div className="text-sm text-gray-500">Carregando detalhes...</div>}
                {full && full.transcription?.overall_summary && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                    <h4 className="font-medium mb-2">Resumo Geral</h4>
                    <p className="text-sm leading-relaxed">{(full.transcription as any).overall_summary}</p>
                  </div>
                )}
                {full && (full.transcription as any)?.slides && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(full.transcription as any).slides.map((s:any)=>(
                        <button key={s.slide_number} onClick={()=>loadSlide(full.id,s.slide_number)} className={`p-3 rounded border text-left text-xs hover:border-purple-400 hover:bg-purple-50 ${slide?.slide_number===s.slide_number?'border-purple-500 bg-purple-50':''}`}>
                          <div className="font-medium mb-1">Slide {s.slide_number}</div>
                          <div className="line-clamp-3 text-gray-600">{s.slide_summary}</div>
                        </button>
                      ))}
                    </div>
                    {slideLoading && <div className="text-sm text-gray-500">Carregando slide...</div>}
                    {slide && (
                      <div className="p-4 bg-white border rounded-lg space-y-3">
                        <h4 className="font-medium">Slide {slide.slide_number} {slide.slide_title && `• ${slide.slide_title}`}</h4>
                        <p className="text-sm leading-relaxed">{slide.slide_summary}</p>
                        {slide.elements?.length>0 && (
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase">Elementos</h5>
                            <ul className="text-xs space-y-1 list-disc pl-4">
                              {slide.elements.slice(0,8).map(el=>(<li key={el.element_id}>{el.element_type} {el.raw_content?`- ${el.raw_content.substring(0,40)}`:''}</li>))}
                              {slide.elements.length>8 && <li>... (+{slide.elements.length-8} itens)</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ); })}
    </div>
  );
};

const PPTSearchTab: React.FC = () => {
  const [query,setQuery]=useState(''); const [dataset,setDataset]=useState<any|null>(null); const [results,setResults]=useState<any|null>(null); const [loading,setLoading]=useState(false);
  const doSearch = async ()=>{ if(!query.trim()) return; setLoading(true); try { const r = await pptService.search(query, dataset?.id); setResults(r);} finally { setLoading(false);} };
  return (<Card><CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5"/>Busca em Apresentações</CardTitle><CardDescription>Busca semântica em conteúdo transcrito de slides (integração Dify).</CardDescription></CardHeader><CardContent className="space-y-4"><DatasetSelector selectedDataset={dataset} onDatasetSelect={setDataset} placeholder="Selecione um dataset (opcional)"/><div className="flex gap-2"><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Termos para buscar" onKeyDown={e=> e.key==='Enter' && doSearch()} /><Button disabled={!query.trim()||loading} onClick={doSearch}>{loading?'Buscando...':'Buscar'}</Button></div>{results && (<div className="space-y-3"><div className="text-xs text-gray-500">{results.total_found} resultados em {results.execution_time_ms}ms</div>{results.results.length===0 && <div className="text-sm text-gray-500">Nenhum resultado encontrado.</div>}{results.results.map((r:any)=>(<Card key={r.id} className="border-l-4 border-l-purple-500"><CardContent className="pt-4 space-y-1"><div className="flex justify-between text-xs text-gray-500"><span>Score: {(r.score*100).toFixed(1)}%</span>{r.slide_number && <span>Slide {r.slide_number}</span>}</div><p className="text-sm text-gray-800">{r.text}</p></CardContent></Card>))}</div>)}</CardContent></Card>);
};

export const PPTDashboard: React.FC = () => { const [tab,setTab]=useState('upload'); const render=()=>{ switch(tab){ case 'upload': return <PPTUploadTab/>; case 'search': return <PPTSearchTab/>; case 'transcriptions': return <PPTTranscriptionsTab/>; default: return <PPTUploadTab/>; } }; return (<div><Tabs active={tab} onChange={setTab} />{render()}</div>); };
