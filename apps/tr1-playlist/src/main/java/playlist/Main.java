package playlist;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Aplicação de Playlist Circular ===");
        System.out.println();

        FilaCircularPlaylist playlist = new FilaCircularPlaylist();

        System.out.println("1. Verificar se a playlist está vazia: " + playlist.isEmpty());
        System.out.println("2. Tamanho da playlist: " + playlist.size());
        System.out.println();

        System.out.println("3. Adicionando músicas à playlist (enqueue):");
        playlist.enqueue(new Musica("Bohemian Rhapsody", "Queen", 354));
        playlist.enqueue(new Musica("Stairway to Heaven", "Led Zeppelin", 482));
        playlist.enqueue(new Musica("Imagine", "John Lennon", 184));
        playlist.enqueue(new Musica("Hotel California", "Eagles", 390));
        playlist.printPlaylist();

        System.out.println("4. Inserindo música com prioridade na posição 2:");
        playlist.enqueuePrioritario(new Musica("Sweet Child O' Mine", "Guns N' Roses", 255), 2);
        playlist.printPlaylist();

        System.out.println("5. Inserindo música com prioridade na primeira posição (posição 0):");
        playlist.enqueuePrioritario(new Musica("Yesterday", "The Beatles", 126), 0);
        playlist.printPlaylist();

        System.out.println("6. Inserindo música com prioridade na última posição:");
        playlist.enqueuePrioritario(new Musica("Thriller", "Michael Jackson", 357), 6);
        playlist.printPlaylist();

        System.out.println("7. Verificando circularidade da playlist:");
        playlist.demonstrarCircularidade();

        System.out.println("8. Removendo a primeira música (dequeue):");
        Musica removida = playlist.dequeue();
        System.out.println("Música removida: " + removida);
        System.out.println();
        playlist.printPlaylist();

        System.out.println("9. Removendo mais duas músicas:");
        removida = playlist.dequeue();
        System.out.println("Música removida: " + removida);
        removida = playlist.dequeue();
        System.out.println("Música removida: " + removida);
        System.out.println();
        playlist.printPlaylist();

        System.out.println("10. Verificar se a playlist está vazia: " + playlist.isEmpty());
        System.out.println("11. Tamanho da playlist: " + playlist.size());
        System.out.println();
    }
}
