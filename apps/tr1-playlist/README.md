# TR1 - Playlist com Fila Circular

Implementação de uma playlist de músicas usando fila circular encadeada em Java.

## Estrutura

```
tr1-playlist/
├── pom.xml
├── requisitos.md
└── src/
    ├── main/java/playlist/
    │   ├── FilaCircularPlaylist.java
    │   ├── Main.java
    │   ├── Musica.java
    │   └── Nodo.java
    └── test/java/playlist/
        ├── FilaCircularPlaylistTest.java
        └── MusicaTest.java
```

## Como executar

### Compilar

```bash
mvn compile
```

### Executar

```bash
mvn exec:java -Dexec.mainClass="playlist.Main"
```

### Testes

```bash
mvn test
```

## Funcionalidades

- **Enqueue**: Insere música no final da fila (O(1))
- **Dequeue**: Remove música do início da fila (O(1))
- **Enqueue Prioritário**: Insere em posição específica
- **Operações auxiliares**: isEmpty(), size(), printPlaylist()

## Tecnologias

- Java 17
- Maven
- JUnit 5
- JaCoCo (coverage)
