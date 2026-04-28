import java.util.HashSet;

public class Main {
    public static void main(String[] args) {
        HashTable ht = new HashTable();
        HashSet<Integer> idsGerados = gerarIds();

        inserirLicencas(ht, idsGerados);
        mostrarTabela(ht);
        realizarConsultas(ht, idsGerados);
        realizarRemocoes(ht, idsGerados);
        verificarAposRemocao(ht, idsGerados);
    }

    private static HashSet<Integer> gerarIds() {
        HashSet<Integer> ids = new HashSet<>();
        while (ids.size() < 1000) {
            int id = (int) (Math.random() * 6000) + 1;
            ids.add(id);
        }
        return ids;
    }

    private static void inserirLicencas(HashTable ht, HashSet<Integer> ids) {
        System.out.println("=== INSERINDO 1000 LICENCAS ===");
        int inseridos = 0;
        for (int id : ids) {
            if (ht.inserir(id))
                inseridos++;
        }
        System.out.println("Licencas inseridas: " + inseridos);
    }

    private static void mostrarTabela(HashTable ht) {
        System.out.println("\n=== TABELA COMPLETA ===");
        ht.mostrar();
    }

    private static void realizarConsultas(HashTable ht, HashSet<Integer> idsGerados) {
        System.out.println("\n=== CONSULTAS ===");

        Integer[] idsArray = idsGerados.toArray(Integer[]::new);

        int pos1 = ht.consultar(idsArray[0]);
        int pos500 = ht.consultar(idsArray[500]);
        int pos999 = ht.consultar(idsArray[999]);
        int posNaoExiste = ht.consultar(99999);

        System.out.println("Licenca " + idsArray[0] + " esta na posicao: " + pos1);
        System.out.println("Licenca " + idsArray[500] + " esta na posicao: " + pos500);
        System.out.println("Licenca " + idsArray[999] + " esta na posicao: " + pos999);
        System.out.println("Licenca 99999 esta na posicao: " + posNaoExiste);
    }

    private static void realizarRemocoes(HashTable ht, HashSet<Integer> idsGerados) {
        System.out.println("\n=== REMOCOES ===");
        Integer[] idsArray = idsGerados.toArray(Integer[]::new);
        boolean rem1 = ht.remover(idsArray[0]);
        boolean rem2 = ht.remover(idsArray[500]);
        boolean rem3 = ht.remover(99999);

        System.out.println("Removeu " + idsArray[0] + ": " + rem1);
        System.out.println("Removeu " + idsArray[500] + ": " + rem2);
        System.out.println("Removeu 99999: " + rem3);
    }

    private static void verificarAposRemocao(HashTable ht, HashSet<Integer> idsGerados) {
        System.out.println("\n=== VERIFICACAO APOS REMOCAO ===");
        Integer[] idsArray = idsGerados.toArray(Integer[]::new);
        System.out.println("Consulta " + idsArray[0] + " (removida): " + ht.consultar(idsArray[0]));
        System.out.println("Consulta " + idsArray[500] + " (removida): " + ht.consultar(idsArray[500]));
    }
}
