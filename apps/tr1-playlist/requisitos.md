# 1. Objetivo

Desenvolver uma aplicação em Java, utilizando os princípios de programação orientada a objetos, que implemente uma fila circular para modelar o funcionamento de uma playlist de músicas, utilizando alocação dinâmica de memória com base no projeto de listas desenvolvido em aula.

# 2. Contextualização

Aplicações de streaming de música organizam suas playlists de forma dinâmica, permitindo inserir músicas ao final da lista, remover a música atual e, eventualmente, inserir músicas em posições específicas. Neste trabalho, a playlist deverá ser implementada como uma fila circular encadeada, baseada em listas ligadas, onde o último elemento aponta para o primeiro.

# 3. Requisitos Funcionais

## 3.1. Classe Música

Crie uma classe Musica com, no mínimo, os seguintes atributos:

- Título
- Artista
- Duração (em segundos)

## 3.2. Estrutura Encadeada

A fila deve ser implementada utilizando nós encadeados, conforme o projeto de listas visto em aula. Sugestão: Classe Nodo contendo:

- Um objeto Musica
- Referência para o próximo nó

A estrutura deve garantir a característica de circularidade:

- O último nó deve apontar para o primeiro

## 3.3. Classe FilaCircularPlaylist

Implemente a classe responsável pela fila circular com:

- Referência ou apontador para o início da fila
- Referência ou apontador para o fim da fila

# 4. Operações obrigatórias

## 4.1. Enqueue (Inserção)

- Insere uma música no final da fila
- Complexidade exigida: O(1)

## 4.2. Dequeue (Remoção)

- Remove a música do início da fila
- Complexidade exigida: O(1)

## 4.3. Enqueue Prioritário

- Insere uma música em uma posição específica da fila
- Parâmetros: objeto Musica e posição desejada
- Ajustar os encadeamentos conforme necessário

## 4.4. Operações auxiliares

- isEmpty()
- size() ou nrElementos
- printPlaylist()

# 5. Requisitos de Implementação

- Utilizar encapsulamento, abstração e boas práticas de POO
- Utilizar obrigatoriamente listas encadeadas
- Não utilizar arrays ou estruturas prontas
- Garantir a circularidade da estrutura

# 6. Programa de Teste (Main)

Criar uma classe Main que:

- Instancie a playlist
- Execute todas as operações
- Demonstre a circularidade
