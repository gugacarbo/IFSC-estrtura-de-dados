package playlist;

public class Nodo {
    private Musica musica;
    private Nodo proximo;

    public Nodo(Musica musica) {
        this.musica = musica;
        this.proximo = null;
    }

    public Musica getMusica() {
        return musica;
    }

    public void setMusica(Musica musica) {
        this.musica = musica;
    }

    public Nodo getProximo() {
        return proximo;
    }

    public void setProximo(Nodo proximo) {
        this.proximo = proximo;
    }
}
