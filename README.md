# Frontend - Sistema de Transcrição de Reuniões

Um frontend moderno e elegante em React para interagir com a API de transcrição de áudio.

## 🚀 Tecnologias Utilizadas

- **React 18** - Framework de UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e desenvolvimento
- **Tailwind CSS** - Framework de CSS utilitário
- **Shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **React Query** - Gerenciamento de estado servidor
- **React Dropzone** - Upload de arquivos com drag & drop
- **Axios** - Cliente HTTP

## 🎨 Funcionalidades

### 📤 Upload de Arquivos
- Drag & drop de arquivos de áudio
- Suporte para MP3, WAV, M4A, FLAC, OGG
- Validação de tamanho e formato
- Formulário de metadados da reunião
- Progress bar e feedback visual

### � Geração de Atas (NOVO)
- Geração automática de atas de reunião
- Interface intuitiva com botão dedicado
- Visualização formatada das atas
- Integração com workflows do Dify.ai
- Armazenamento e histórico de atas

### �🔍 Busca Semântica
- Busca inteligente em transcrições
- Interface intuitiva
- Resultados com relevância
- Filtros avançados

### 📊 Analytics
- Dashboard com estatísticas
- Métricas do sistema
- Visualização de dados

### 📋 Gerenciamento de Transcrições
- Lista de transcrições
- Visualização de detalhes
- Ações de gerenciamento
- Status de processamento em tempo real

## 🛠 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos de instalação

1. **Instalar dependências:**
```bash
cd frontend
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
# Criar arquivo .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

3. **Executar em modo desenvolvimento:**
```bash
npm run dev
```

4. **Build para produção:**
```bash
npm run build
```

5. **Preview da build:**
```bash
npm run preview
```

## 🌐 Configuração

### Variáveis de Ambiente

- `VITE_API_URL` - URL da API backend (padrão: `/api` para proxy)

### Proxy de Desenvolvimento

O Vite está configurado para fazer proxy das requisições `/api` para `http://localhost:8000` durante o desenvolvimento.

## 📱 Interface

### Layout Responsivo
- Design mobile-first
- Adaptação para tablet e desktop
- Componentes flexíveis

### Temas
- Suporte a modo claro/escuro
- Cores consistentes com design system
- Variáveis CSS customizáveis

### Acessibilidade
- Componentes acessíveis do Radix UI
- Navegação por teclado
- Labels e ARIA apropriados

## 🔧 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── FileUpload.tsx   # Componente de upload
│   └── MainDashboard.tsx # Dashboard principal + Atas
├── services/            # Serviços e APIs
│   └── api.ts          # Cliente da API (+ endpoints de atas)
├── types/              # Tipos TypeScript
│   └── api.ts         # Tipos da API (+ MeetingMinutesResponse)
├── lib/               # Utilitários
│   └── utils.ts      # Funções auxiliares
├── App.tsx           # Componente principal
├── main.tsx         # Entry point
├── index.css       # Estilos globais
└── vite-env.d.ts  # Tipos do Vite
```

## 🚦 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Linting do código

## 🎯 Funcionalidades em Destaque

### Upload Inteligente
- Validação em tempo real
- Feedback visual do progresso
- Suporte para metadados da reunião
- Integração com diferentes datasets

### 🆕 Geração de Atas
- Botão "Gerar Ata" em transcrições completas
- Interface de loading durante processamento
- Visualização formatada das atas geradas
- Armazenamento automático no sistema
- Feedback visual de sucesso/erro

### Busca Avançada
- Busca semântica com IA
- Resultados ranqueados por relevância
- Filtros customizáveis
- Interface responsiva

### Dashboard Analytics
- Métricas em tempo real
- Gráficos e estatísticas
- Monitoramento do sistema

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de CORS:**
   - Verificar configuração do backend
   - Confirmar URL da API

2. **Erro de upload:**
   - Verificar tamanho do arquivo (máx 100MB)
   - Confirmar formato suportado

3. **Problemas de build:**
   - Limpar cache: `rm -rf node_modules package-lock.json && npm install`
   - Verificar versões do Node.js

4. **Erro ao gerar ata:**
   - Verificar se a transcrição está completa
   - Confirmar configuração do workflow no backend
   - Verificar logs do servidor para mais detalhes

## 📋 Como Usar a Geração de Atas

### Passo a Passo:

1. **Fazer Upload**: Envie um arquivo de áudio e aguarde a transcrição ser processada
2. **Aguardar Conclusão**: A transcrição deve ter status "Concluída"
3. **Gerar Ata**: 
   - Na lista de transcrições: clique no botão "Gerar Ata"
   - Nos detalhes: clique no botão "📋 Gerar Ata de Reunião"
4. **Visualizar**: A ata aparecerá automaticamente na seção dedicada

### Funcionalidades da Interface:

- **Loading State**: Indicador visual durante geração
- **Feedback de Erro**: Mensagens claras em caso de problema
- **Formatação**: Atas exibidas com formatação adequada
- **Persistência**: Atas ficam salvas e disponíveis permanentemente

## 📝 Próximas Funcionalidades

- [ ] Edição de atas geradas
- [ ] Exportação de atas em PDF/Word
- [ ] Templates personalizáveis para atas
- [ ] Modo offline
- [ ] PWA support
- [ ] Notificações push
- [ ] Exportação de relatórios
- [ ] Integração com calendário
- [ ] Gravação de áudio in-app

## 🤝 Contribuição

1. Fork do projeto
2. Criar branch para feature (`git checkout -b feature/amazing-feature`)
3. Commit das mudanças (`git commit -m 'Add amazing feature'`)
4. Push para branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
