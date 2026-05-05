package playlist;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes para a classe FilaCircularPlaylist")
class FilaCircularPlaylistTest {

    private FilaCircularPlaylist playlist;
    private Musica musica1;
    private Musica musica2;
    private Musica musica3;
    private Musica musica4;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        playlist = new FilaCircularPlaylist();
        musica1 = new Musica("Música 1", "Artista 1", 180);
        musica2 = new Musica("Música 2", "Artista 2", 240);
        musica3 = new Musica("Música 3", "Artista 3", 210);
        musica4 = new Musica("Música 4", "Artista 4", 195);
    }

    @Test
    @DisplayName("Deve criar uma playlist vazia")
    void testCriacaoPlaylistVazia() {
        assertTrue(playlist.isEmpty());
        assertEquals(0, playlist.size());
        assertNull(playlist.getHead());
        assertNull(playlist.getTail());
    }

    @Test
    @DisplayName("Deve adicionar músicas à playlist")
    void testEnqueue() {
        playlist.enqueue(musica1);
        assertFalse(playlist.isEmpty());
        assertEquals(1, playlist.size());
        assertNotNull(playlist.getHead());
        assertNotNull(playlist.getTail());
        assertEquals(musica1, playlist.getHead().getMusica());
        assertEquals(musica1, playlist.getTail().getMusica());

        playlist.enqueue(musica2);
        assertEquals(2, playlist.size());
        assertEquals(musica1, playlist.getHead().getMusica());
        assertEquals(musica2, playlist.getTail().getMusica());
    }

    @Test
    @DisplayName("Deve remover música do início da playlist")
    void testDequeue() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);

        Musica removida = playlist.dequeue();
        assertEquals(musica1, removida);
        assertEquals(1, playlist.size());
        assertEquals(musica2, playlist.getHead().getMusica());
        assertEquals(musica2, playlist.getTail().getMusica());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar remover de playlist vazia")
    void testDequeuePlaylistVazia() {
        assertThrows(IllegalStateException.class, () -> playlist.dequeue());
    }

    @Test
    @DisplayName("Deve adicionar música em posição prioritária")
    void testEnqueuePrioritario() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);

        playlist.enqueuePrioritario(musica3, 1);
        assertEquals(3, playlist.size());
        assertEquals(musica1, playlist.getHead().getMusica());
        assertEquals(musica3, playlist.getHead().getProximo().getMusica());
        assertEquals(musica2, playlist.getTail().getMusica());
    }

    @Test
    @DisplayName("Deve adicionar música prioritária na primeira posição")
    void testEnqueuePrioritarioPrimeiraPosicao() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);

        playlist.enqueuePrioritario(musica3, 0);
        assertEquals(3, playlist.size());
        assertEquals(musica3, playlist.getHead().getMusica());
        assertEquals(musica1, playlist.getHead().getProximo().getMusica());
    }

    @Test
    @DisplayName("Deve adicionar música prioritária na primeira posição de playlist vazia")
    void testEnqueuePrioritarioPrimeiraPosicaoVazia() {
        playlist.enqueuePrioritario(musica1, 0);
        assertEquals(1, playlist.size());
        assertEquals(musica1, playlist.getHead().getMusica());
        assertEquals(musica1, playlist.getTail().getMusica());
        assertTrue(playlist.getTail().getProximo() == playlist.getHead());
    }

    @Test
    @DisplayName("Deve adicionar música prioritária na última posição")
    void testEnqueuePrioritarioUltimaPosicao() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);

        playlist.enqueuePrioritario(musica3, 2);
        assertEquals(3, playlist.size());
        assertEquals(musica3, playlist.getTail().getMusica());
    }

    @Test
    @DisplayName("Deve lançar exceção para posição inválida em enqueuePrioritario")
    void testEnqueuePrioritarioPosicaoInvalida() {
        playlist.enqueue(musica1);
        assertThrows(IllegalArgumentException.class, () -> playlist.enqueuePrioritario(musica2, -1));
        assertThrows(IllegalArgumentException.class, () -> playlist.enqueuePrioritario(musica2, 2));
    }

    @Test
    @DisplayName("Deve remover música em posição específica")
    void testRemoveAt() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);
        playlist.enqueue(musica3);

        Musica removida = playlist.removeAt(1);
        assertEquals(musica2, removida);
        assertEquals(2, playlist.size());
        assertEquals(musica1, playlist.getHead().getMusica());
        assertEquals(musica3, playlist.getHead().getProximo().getMusica());
        assertEquals(musica3, playlist.getTail().getMusica());
    }

    @Test
    @DisplayName("Deve remover música na primeira posição com removeAt")
    void testRemoveAtPrimeiraPosicao() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);

        Musica removida = playlist.removeAt(0);
        assertEquals(musica1, removida);
        assertEquals(1, playlist.size());
        assertEquals(musica2, playlist.getHead().getMusica());
    }

    @Test
    @DisplayName("Deve remover música na última posição com removeAt")
    void testRemoveAtUltimaPosicao() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);
        playlist.enqueue(musica3);

        Musica removida = playlist.removeAt(2);
        assertEquals(musica3, removida);
        assertEquals(2, playlist.size());
        assertEquals(musica1, playlist.getHead().getMusica());
        assertEquals(musica2, playlist.getTail().getMusica());
    }

    @Test
    @DisplayName("Deve lançar exceção para posição inválida em removeAt")
    void testRemoveAtPosicaoInvalida() {
        playlist.enqueue(musica1);
        assertThrows(IllegalArgumentException.class, () -> playlist.removeAt(-1));
        assertThrows(IllegalArgumentException.class, () -> playlist.removeAt(1));
    }

    @Test
    @DisplayName("Deve verificar circularidade da playlist")
    void testCircularidade() {
        playlist.enqueue(musica1);
        assertTrue(playlist.getTail().getProximo() == playlist.getHead());

        playlist.enqueue(musica2);
        assertTrue(playlist.getTail().getProximo() == playlist.getHead());
    }

    @Test
    @DisplayName("Deve manipular playlist com uma única música")
    void testPlaylistComUmaMusica() {
        playlist.enqueue(musica1);
        assertEquals(1, playlist.size());
        assertEquals(musica1, playlist.getHead().getMusica());
        assertEquals(musica1, playlist.getTail().getMusica());
        assertTrue(playlist.getTail().getProximo() == playlist.getHead());

        Musica removida = playlist.dequeue();
        assertEquals(musica1, removida);
        assertTrue(playlist.isEmpty());
        assertNull(playlist.getHead());
        assertNull(playlist.getTail());
    }

    @Test
    @DisplayName("Deve manter tamanho correto após operações")
    void testTamanhoPlaylist() {
        assertEquals(0, playlist.size());

        playlist.enqueue(musica1);
        assertEquals(1, playlist.size());

        playlist.enqueue(musica2);
        assertEquals(2, playlist.size());

        playlist.dequeue();
        assertEquals(1, playlist.size());

        playlist.removeAt(0);
        assertEquals(0, playlist.size());
    }

    @Test
    @DisplayName("Deve processar múltiplas operações consecutivas")
    void testOperacoesConsecutivas() {
        playlist.enqueue(musica1);
        playlist.enqueue(musica2);
        playlist.enqueue(musica3);
        assertEquals(3, playlist.size());

        playlist.enqueuePrioritario(musica4, 1);
        assertEquals(4, playlist.size());

        playlist.removeAt(2);
        assertEquals(3, playlist.size());

        Musica removida = playlist.dequeue();
        assertEquals(musica1, removida);
        assertEquals(2, playlist.size());
    }
}
