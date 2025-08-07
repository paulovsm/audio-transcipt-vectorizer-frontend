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

### 🔍 Busca Semântica
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
│   └── MainDashboard.tsx # Dashboard principal
├── services/            # Serviços e APIs
│   └── api.ts          # Cliente da API
├── types/              # Tipos TypeScript
│   └── api.ts         # Tipos da API
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

## 📝 Próximas Funcionalidades

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
