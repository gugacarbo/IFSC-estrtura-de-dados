# Sistema de Controle de Licenças - Tabela de Dispersão

## Descrição do Problema

Uma empresa chamada **Tech_IFSC** está implementando um sistema para controlar a ativação de licenças de software distribuídas para seus clientes. A cada mês, milhares de licenças são ativadas e a empresa precisa consultar rapidamente se uma licença já foi ativada ou não, além de realizar remoções e exibir os dados das licenças organizados.

Você foi contratado para implementar esse sistema utilizando **tabela de dispersão (hashing)** com as seguintes especificações:

### Especificações

- O número de licenças ativadas será **1000** (geradas aleatoriamente);
- Cada licença terá um identificador numérico único (`id`), entre 1 e o valor máximo (ajustado conforme matrícula);
- A tabela de dispersão terá `m` classes (ajustado conforme matrícula);
- A função de dispersão será: `hash(id) = (id * valor de ajuste) % m`;
- Colisões devem ser tratadas com **endereçamento externo (listas)**;

### Métodos a Implementar

- **Inserir** número da licença na tabela;
- **Consultar** se uma licença foi ativada (retornar -1 se não encontrada);
- **Remover** um número de licença da tabela;
- **Mostrar** o conteúdo da tabela com o formato:

```
Tabela[i]: (qtd) [lista de licenças]
Tabela[10]: (3) [143, 2253, 4988]
...
```

---

## Ajustes por Matrícula

Ajustes necessários para individualizar o trabalho a partir da matrícula do aluno:

### a) Faixa de Valores dos Identificadores

```
De 1 até [(último dígito da matrícula) + 1] * 1000
```

### b) Tamanho da Tabela Hash (m)

```
m = (soma dos dígitos da matrícula) % 100 + 50
```

### c) Função de Hash

```
hash(id) = (id * (penúltimo dígito da matrícula + 1)) % m
```

---

## Exemplo

Dado o número de matrícula do aluno (ex: `202312345`), os seguintes valores serão usados:

### Tamanho da Tabela Hash (m)

```
m = (2+0+2+3+1+2+3+4+5) % 100 + 50
m = 22 % 100 + 50 = 72 classes ou endereços
```

### Faixa de Valores dos Identificadores

```
Último dígito da matrícula: 5
Faixa será de 1 até (5+1) * 1000
→ Faixa de identificadores: de 1 até 6000
```

### Função de Hash

```
Penúltimo dígito da matrícula: 4
→ Função de hash: f(id) = (id * (4+1)) % m
```

---

## Requisitos de Implementação

- O código deve usar **Programação Orientada a Objetos (POO)**;
- A classe `Main` não deve conter lógica direta, só chamadas de métodos;
- O trabalho é **individual**. A versão gerada é exclusiva para sua matrícula e comparações de código serão realizadas.
