import React, { useState } from 'react';
import { MainDashboard } from '@/components/MainDashboard';
import { PPTDashboard } from '@/components/ppt/PPTDashboard';
import { Mic, Presentation, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

type ModuleKey = 'audio' | 'ppt';

export const AppLayout: React.FC = () => {
  const [module, setModule] = useState<ModuleKey>('audio');
  // sidebarOpen controla visibilidade em telas pequenas; collapsed controla modo compacto em desktop
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const modules: { key: ModuleKey; label: string; icon: any; description: string; }[] = [
    { key: 'audio', label: 'Reuniões (Áudio)', icon: Mic, description: 'Transcrição e análise de reuniões' },
    { key: 'ppt', label: 'Apresentações', icon: Presentation, description: 'Transcrição e análise de slides' }
  ];
  const current = modules.find(m => m.key === module)!;
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className={`bg-white shadow-sm border-r flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} aria-label="Menu lateral" aria-expanded={!collapsed}>
        <div className="h-16 flex items-center justify-between px-3 border-b gap-2">
          {!collapsed && (
            <span className="text-lg font-semibold whitespace-nowrap">Hub de Transcrições</span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="hidden md:inline-flex items-center justify-center p-2 rounded hover:bg-gray-100 text-gray-600 ml-auto"
            aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {modules.map(m => { const Icon = m.icon; const active = m.key === module; return (
            <button
              key={m.key}
              onClick={()=>setModule(m.key)}
              className={`group relative w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-3'} py-3 text-left text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span>{m.label}</span>
                  <span className="text-[11px] font-normal text-gray-500">{m.description}</span>
                </div>
              )}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {m.label}
                </span>
              )}
            </button>
          ); })}
        </nav>
        {!collapsed && (
          <div className="p-4 text-xs text-gray-400 border-t">v1 - unified</div>
        )}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center px-4 md:px-8 gap-4">
          <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={()=>setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Plataforma Unificada de Transcrições</h1>
            <p className="text-sm text-gray-600">{current.description}</p>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {module === 'audio' ? <MainDashboard embedMode /> : <PPTDashboard />}
        </main>
      </div>
    </div>
  );
};
