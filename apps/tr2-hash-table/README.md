# TR2 - Sistema de Controle de Licenças (Hash Table)

Implementação de tabela de dispersão (hash table) para controle de licenças de software.

## Estrutura

```
tr2-hash-table/
├── package.json
├── README.md
├── AGENTS.md
└── src/
    ├── HashTable.java
    ├── Main.java
    └── Node.java
```

## Como executar

### Compilar

```bash
npm run build
# ou
javac src/HashTable.java src/Node.java src/Main.java
```

### Executar

```bash
npm run dev
# ou
cd src && java Main
```

### Limpar arquivos .class

```bash
npm run clean
```

## Funcionalidades

- **Inserir**: Adiciona licença na tabela hash
- **Consultar**: Verifica se licença foi ativada (retorna -1 se não encontrada)
- **Remover**: Remove licença da tabela
- **Mostrar**: Exibe conteúdo da tabela formatado

## Especificações da Matrícula

- **Faixa de IDs**: 1 até 6000
- **Tamanho da tabela (m)**: 72
- **Função hash**: `hash(id) = (id * 5) % 72`
- **Tratamento de colisões**: Endereçamento externo (listas encadeadas)

## Tecnologias

- Java (Default package)
- Sem dependências externas
- Testes manuais via `main()`
