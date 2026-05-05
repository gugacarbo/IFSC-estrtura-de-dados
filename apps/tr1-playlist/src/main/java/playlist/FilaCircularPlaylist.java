package playlist;

public class FilaCircularPlaylist {
    private Nodo head;
    private Nodo tail;
    private int tamanho;

    public FilaCircularPlaylist() {
        this.head = null;
        this.tail = null;
        this.tamanho = 0;
    }

    public Nodo getHead() {
        return head;
    }

    public Nodo getTail() {
        return tail;
    }

    public int getTamanho() {
        return tamanho;
    }

    public boolean isEmpty() {
        return head == null;
    }

    public int size() {
        return tamanho;
    }

    public void enqueue(Musica musica) {
        Nodo novoNodo = new Nodo(musica);

        if (isEmpty()) {
            head = novoNodo;
            tail = novoNodo;
            novoNodo.setProximo(novoNodo);
        } else {
            novoNodo.setProximo(head);
            tail.setProximo(novoNodo);
            tail = novoNodo;
        }

        tamanho++;
    }

    public Musica dequeue() {
        if (isEmpty()) {
            throw new IllegalStateException("Fila circular está vazia.");
        }

        Musica musicaRemovida = head.getMusica();

        if (head == tail) {
            head = null;
            tail = null;
        } else {
            tail.setProximo(head.getProximo());
            head = head.getProximo();
        }

        tamanho--;
        return musicaRemovida;
    }

    public void enqueuePrioritario(Musica musica, int posicao) {
        if (posicao < 0 || posicao > tamanho) {
            throw new IllegalArgumentException("Posição inválida.");
        }

        if (posicao == tamanho) {
            enqueue(musica);
            return;
        }

        if (posicao == 0) {
            Nodo novoNodo = new Nodo(musica);
            if (isEmpty()) {
                head = novoNodo;
                tail = novoNodo;
                novoNodo.setProximo(novoNodo);
            } else {
                novoNodo.setProximo(head);
                tail.setProximo(novoNodo);
                head = novoNodo;
            }
            tamanho++;
            return;
        }

        Nodo novoNodo = new Nodo(musica);
        Nodo atual = head;
        for (int i = 0; i < posicao - 1; i++) {
            atual = atual.getProximo();
        }
        novoNodo.setProximo(atual.getProximo());
        atual.setProximo(novoNodo);
        tamanho++;
    }

    public Musica removeAt(int posicao) {
        if (posicao < 0 || posicao >= tamanho) {
            throw new IllegalArgumentException("Posição inválida.");
        }

        if (posicao == 0) {
            return dequeue();
        }

        Nodo atual = head;
        for (int i = 0; i < posicao - 1; i++) {
            atual = atual.getProximo();
        }

        Musica musicaRemovida = atual.getProximo().getMusica();
        atual.setProximo(atual.getProximo().getProximo());

        if (posicao == tamanho - 1) {
            tail = atual;
        }

        tamanho--;
        return musicaRemovida;
    }

    public void printPlaylist() {
        if (isEmpty()) {
            System.out.println("Playlist está vazia.");
            return;
        }

        System.out.println("=== Playlist Circular ===");
        Nodo atual = head;
        for (int i = 0; i < tamanho; i++) {
            System.out.println((i + 1) + ". " + atual.getMusica());
            atual = atual.getProximo();
        }
        System.out.println("-------------------------");
        System.out.println("Total de músicas: " + tamanho);
        System.out.println();
    }

    public void demonstrarCircularidade() {
        if (isEmpty()) {
            System.out.println("Playlist está vazia. Não há circularidade para demonstrar.");
            return;
        }

        System.out.println("=== Demonstrando Circularidade da Playlist ===");
        System.out.println("Primeiro elemento: " + head.getMusica());
        System.out.println("Último elemento: " + tail.getMusica());
        System.out.println("O último elemento aponta para: " + tail.getProximo().getMusica());
        System.out.println(
                "Verificação de circularidade: " + (tail.getProximo() == head ? "OK (último -> primeiro)" : "ERRO"));
        System.out.println();
    }

}
