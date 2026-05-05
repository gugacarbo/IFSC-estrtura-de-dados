// Classe HashTable - Sistema de Controle de Licenças
class HashTable {
    private final Node[] tabela;
    private final int m = 72;

    public HashTable() {
        tabela = new Node[m];
    }

    private int hash(int id) {
        return (id * 5) % m;
    }

    public boolean inserir(int id) {
        if (id <= 0)
            return false;

        int pos = hash(id);

        // Verificar duplicado
        Node atual = tabela[pos];
        while (atual != null) {
            if (atual.id == id)
                return false;
            atual = atual.proximo;
        }

        // Inserir no início
        Node novo = new Node(id);
        novo.proximo = tabela[pos];
        tabela[pos] = novo;
        return true;
    }

    public int consultar(int id) {
        int pos = hash(id);
        Node atual = tabela[pos];

        while (atual != null) {
            if (atual.id == id)
                return pos;
            atual = atual.proximo;
        }
        return -1;
    }

    public boolean remover(int id) {
        int pos = hash(id);
        Node atual = tabela[pos];
        Node anterior = null;

        while (atual != null) {
            if (atual.id == id) {
                if (anterior == null) {
                    tabela[pos] = atual.proximo;
                } else {
                    anterior.proximo = atual.proximo;
                }
                return true;
            }
            anterior = atual;
            atual = atual.proximo;
        }
        return false;
    }

    public void mostrar() {
        for (int i = 0; i < m; i++) {
            Node atual = tabela[i];
            int qtd = 0;
            StringBuilder sb = new StringBuilder();

            while (atual != null) {
                if (qtd > 0)
                    sb.append(", ");
                sb.append(atual.id);
                qtd++;
                atual = atual.proximo;
            }

            System.out.println("Tabela[" + i + "]: (" + qtd + ") [" + sb.toString() + "]");
        }
    }
}
