# M4S Fluxo — Produção, Estoque e Full

Versão 1.1 — upload sem pastas.

PWA leve, instalável no Android, em português do Brasil. Projeto independente, sem dependências JavaScript de produção e pronto para um repositório GitHub. Não é um APK nativo. Não exige serviços pagos, cadastro em outro banco de dados ou Netlify.

## Começar no computador

1. Extraia o ZIP. Entre na pasta `m4s-fluxo`.
2. Tenha Python 3 instalado. No terminal execute:

```bash
python3 -m http.server 8080
```

No Windows, se `python3` não existir:

```powershell
py -m http.server 8080
```

3. Abra `http://localhost:8080` no navegador.

Não abra `index.html` com duplo clique: módulos JavaScript e service worker precisam de HTTP/HTTPS. Não há `npm install`: o app não utiliza pacotes externos. Node.js 22 ou superior é necessário apenas para executar os testes (`npm test`).

## Enviar para o GitHub — SEM PASTAS

Este pacote foi adaptado para upload pelo navegador. TODOS os arquivos ficam juntos na raiz. Não crie src, icons, tests ou .github. Nenhum workflow é necessário.

1. Baixe o ZIP e use “Extrair tudo” no Windows.
2. Abra a pasta extraída: você verá index.html, app.js, core.js, style.css e os demais arquivos juntos.
3. No seu repositório (M4S ou M4S-TOP), use Add file → Upload files.
4. Selecione TODOS os arquivos extraídos (Ctrl+A) e arraste para a área de upload. Não arraste o ZIP.
5. Clique em Commit changes, diretamente na branch main. Ao usar o mesmo repositório, os arquivos de mesmo nome serão substituídos. Arquivos antigos que não sejam usados podem permanecer.
6. Abra Settings → Pages. Em Build and deployment, escolha Source: Deploy from a branch. Escolha main e /(root). Clique em Save. Não escolha GitHub Actions para este pacote.
7. Aguarde a publicação terminar. O endereço do aplicativo aparece na mesma tela. Abra esse endereço e pressione Ctrl+F5 no computador.
8. No Android, abra o endereço no Chrome e use o menu “Instalar aplicativo” ou “Adicionar à tela inicial”. O botão interno de instalação depende da disponibilidade desse recurso no navegador.

Se havia um workflow antigo em .github/workflows/pages.yml, desative esse workflow na aba Actions para evitar publicações concorrentes. Esta versão não precisa de pastas nem workflow. Não precisa de Netlify, npm install ou APK.

Os caminhos são relativos para funcionar com qualquer nome de repositório. O app precisa de HTTP/HTTPS: abrir index.html com duplo clique não é um método suportado. A primeira abertura deve ser online para preparar o cache offline.

O app mantém a mesma chave de dados da versão anterior. Ao atualizar no MESMO endereço/origem, os registros existentes são preservados. Outro repositório no mesmo domínio GitHub Pages compartilha o armazenamento local desse domínio; faça backup antes de testar cópias. Outro domínio/aparelho precisa de restauração manual.

GitHub Pages deve estar disponível para o plano e repositório. Este ZIP não publica automaticamente e não altera sua conta GitHub.

## Primeiro uso

O app começa vazio, sem dados fictícios na sua operação.

1. **Produtos e contas:** cadastre Mercado Livre — Mast4Shop, Mercado Livre — Mast4Store, Shopee — Conta 1 e Shopee — Conta 2 (ou seus próprios nomes).
2. Cadastre peças físicas com SKU único e contas vinculadas.
3. Cadastre os kits marcando “Este produto é um kit” e adicionando uma ou mais peças à composição. Kits não podem conter outros kits. O mesmo produto pode estar vinculado a várias contas.
4. **Estoque e histórico:** registre o saldo inicial pronto como entrada, com motivo. Não inclua peças cortadas ou peças nas costureiras neste saldo.
5. **Corte e fabricação:** registre cortes. Finalize internamente ou envie os cortes para uma costureira cadastrada.
6. **Costureiras:** cadastre nome, bairro, valor por peça e dias de acerto. O valor é guardado em centavos, sem erros de arredondamento decimal. O lote conserva o valor por peça vigente no envio.
7. Retire lotes parcial ou totalmente. Peças boas alimentam o estoque pronto e a dívida. Perdas baixam o lote, mas não geram dívida. Registre pagamentos feitos fora do aplicativo. O botão de pagamento é apenas um registro contábil; não transfere dinheiro.
8. **Planejamento Full:** informe as vendas acumuladas dos últimos 7, 15 e 30 dias, cobertura desejada e data planejada. As vendas devem se referir à mesma data de consulta.
9. Informe o estoque atual disponível no Full pelo botão “Atualizar saldo Full”. Esse saldo precisa ser conferido manualmente após vendas: não existe conexão automática com Mercado Livre/Shopee.
10. Confirme um envio para consumir o estoque geral e criar trânsito. Após a chegada, use “Receber no Full”; aceita recebimentos parciais.

## Regras de cálculo físico

Todas as vendas, saldos e envios Full são informados em **unidades do anúncio**. Para um kit de 3, “100” significa 100 kits.

```text
Giro diário = maior de (vendas7 / 7, vendas15 / 15, vendas30 / 30)
Cobertura atual = saldo disponível no Full / giro diário
Envio sugerido = máximo(0, teto(giro × dias desejados − saldo Full − trânsito))
Capacidade de montagem = menor piso(estoque componente / quantidade no kit)
```

É uma política conservadora contra rupturas: usa a maior média, não a soma de janelas sobrepostas. Não calcula sazonalidade, prazo de recebimento, demanda futura garantida ou limites oficiais das plataformas. Datas de envio são planejamento manual; não são promessas da transportadora ou lembretes automáticos.

Exemplo: 1.000 balaclavas prontas; envio de 100 kits com 3; consumo de 300 balaclavas; estoque geral passa a 700. Enquanto não houver recebimento, 100 kits ficam em trânsito. Ao receber 40 kits, ficam 60 em trânsito e 40 entram no Full. O recebimento não desconta o estoque geral novamente.

O relatório soma a demanda de peças de todos os anúncios planejados antes de calcular faltas, evitando contar a mesma disponibilidade várias vezes. Sugestões individuais do Full compartilham o mesmo estoque geral: a confirmação de envio sempre valida o saldo atualizado.

No cadastro de produtos não existem preços ou custos. Valores financeiros aparecem somente na conta corrente das costureiras, conforme o requisito de acerto de produção.

## Backup, privacidade e WhatsApp

- Dados ficam no `localStorage` do navegador, no aparelho e na origem (URL) em uso. Fechar e reabrir preserva os registros.
- Limpar dados do site, usar aba anônima, perder o aparelho ou mudar a URL pode fazer os dados ficarem indisponíveis. Faça backup diário ou após movimentações importantes.
- Em “Backup e relatório”, baixe o JSON completo. Guarde uma cópia fora do aparelho.
- A restauração valida os eventos, referências e saldos antes de substituir os dados. Pede confirmação e inicia o download do backup anterior. Verifique se o navegador concluiu o download. Restauração substitui o conjunto; não mescla dois backups.
- O arquivo de backup contém informações da operação e valores de acerto. Compartilhe com cuidado.
- O app não sincroniza aparelhos automaticamente. Para transferir dados, exporte no aparelho de origem e restaure no destino. Evite editar cópias divergentes em paralelo.
- As abas da mesma origem se atualizam por evento de armazenamento. O navegador com Web Locks serializa gravações entre abas; em navegador sem esse recurso, mantenha apenas uma aba ativa.
- O aplicativo não envia dados automaticamente. WhatsApp abre uma mensagem pronta, revisável, para você escolher o contato e confirmar o envio. Há opção de copiar manualmente. A mensagem inclui produção, cortes necessários, costureiras, saldos e datas de envio planejadas.
- O código hospedado pode ser público; os dados locais não são incluídos no repositório ou compartilhados por conhecer a URL. Pessoas com acesso ao navegador/aparelho conseguem visualizar os dados: não há login ou criptografia local.

## Histórico e limitações importantes

A interface não possui botão de apagar ou editar registros históricos. Cada comando gera um UUID e timestamp ISO automático, e as telas usam data/hora local do aparelho. Nunca altere o relógio para simular registros anteriores. Lotes e envios têm identificadores próprios.

O histórico é preservado por um registro de eventos e reconstruído a cada leitura. Não há garantia de imutabilidade contra manipulação externa do armazenamento, alteração do relógio ou backup adulterado que permaneça semanticamente válido. Auditoria inviolável, assinaturas de servidor, usuários, permissões, sincronização e recuperação remota exigem um backend autenticado — não estão implementados nesta versão local.

Cadastros e composições não são editáveis nesta versão para não reescrever referências históricas. Para nova composição, cadastre outro SKU. Entradas de estoque permitem saldo inicial e compras externas; saídas são realizadas pelos envios Full. Não há fluxo de cancelamento/estorno de eventos ou ajustes negativos livres. Revise as quantidades antes de confirmar. Faça backup antes de operações grandes.

O armazenamento local tem limite variável conforme o navegador. Falha de gravação não aplica a movimentação no estado em memória; exporte um backup se houver erro de espaço. O app não é substituto de ERP fiscal, financeiro, integração de pedidos ou WMS de marketplace.

## Estrutura

```text
index.html                  Estrutura acessível e navegação
core.js                 Regras, eventos, saldos, previsão, validação de backup
app.js                  Formulários, dashboard, persistência, relatório
style.css               Layout responsivo e componentes visuais
icon-192.png / icon-512.png  Ícones PNG de instalação
manifest.webmanifest        Identidade e instalação PWA
sw.js                       Cache offline da aplicação
README.md                   Instruções de publicação pela branch
 core.test.js          Testes de domínio (node:test)
```

A função `command` não altera o estado anterior: valida uma operação e retorna um novo histórico. `state` reconstrói estoques, cortes, lotes, saldo Full e dívida. A gravação completa ocorre antes de atualizar a interface; falhas não exibem saldo fictício.

## Verificação

```bash
npm test
node --check app.js
node --check core.js
```

Testes cobrem: consumo de 100 kits de 3; kits mistos; bloqueio de estoque insuficiente sem movimentação parcial; trânsito e chegada parcial; produção interna; lote com retirada parcial e perdas; pagamento e saldo devedor; entradas inválidas; SKU duplicado; vendas incoerentes; restauração válida e rejeição de histórico inválido; acerto no fim de fevereiro; giro zero.

Verificação manual de interface realizada no Chrome de desktop: abertura do painel, cadastro de conta, cadastro de produto e confirmação de salvamento. O CSS possui pontos de adaptação para celular e tablet; instalação em dispositivo Android físico e operação offline em aparelho físico não foram verificadas neste ambiente. Testes não garantem ausência absoluta de bugs.

Roteiro recomendado antes de usar em produção: cadastrar uma conta e peça de teste, registrar 500 cortes, enviar 250 à costureira, retirar 245 com 5 perdas, finalizar os 250 internos; conferir 495 prontas; criar kit de 3 e enviar 100; conferir 195 peças; receber 40 kits, conferir 60 em trânsito e 40 no Full; exportar e restaurar o backup. Use um perfil de navegador separado para esse ensaio.
