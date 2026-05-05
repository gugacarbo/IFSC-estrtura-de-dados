package playlist;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Testes para a classe Musica")
class MusicaTest {

    private Musica musica;

    @BeforeEach
    @SuppressWarnings("unused")
    void setUp() {
        musica = new Musica("Titulo Teste", "Artista Teste", 180);
    }

    @Test
    @DisplayName("Deve criar uma música com atributos válidos")
    void testCriacaoMusica() {
        assertEquals("Titulo Teste", musica.getTitulo());
        assertEquals("Artista Teste", musica.getArtista());
        assertEquals(180, musica.getDuracao());
    }

    @Test
    @DisplayName("Deve alterar o título da música")
    void testSetTitulo() {
        musica.setTitulo("Novo Titulo");
        assertEquals("Novo Titulo", musica.getTitulo());
    }

    @Test
    @DisplayName("Deve alterar o artista da música")
    void testSetArtista() {
        musica.setArtista("Novo Artista");
        assertEquals("Novo Artista", musica.getArtista());
    }

    @Test
    @DisplayName("Deve alterar a duração da música")
    void testSetDuracao() {
        musica.setDuracao(240);
        assertEquals(240, musica.getDuracao());
    }

    @Test
    @DisplayName("Deve retornar string representativa da música")
    void testToString() {
        String expected = "Música: Titulo Teste - Artista Teste (180 segundos)";
        assertEquals(expected, musica.toString());
    }

    @Test
    @DisplayName("Músicas com mesmos atributos devem ser consideradas iguais em toString")
    void testMusicasIguais() {
        Musica outraMusica = new Musica("Titulo Teste", "Artista Teste", 180);
        assertEquals(musica.toString(), outraMusica.toString());
    }

    @Test
    @DisplayName("Músicas com atributos diferentes devem ser consideradas diferentes em toString")
    void testMusicasDiferentes() {
        Musica outraMusica = new Musica("Outro Titulo", "Artista Teste", 180);
        assertNotEquals(musica.toString(), outraMusica.toString());
    }
}
