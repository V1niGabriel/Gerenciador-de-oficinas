// public/report.js

// Funções auxiliares para formatar data e preço
function formatarData(data) {
  if (!data) return 'N/A';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarPreco(preco) {
  if (preco === null || isNaN(preco)) return 'R$ 0,00';
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função principal para buscar e renderizar os relatórios
async function buscarRelatorios() {
  // Coleta valores dos filtros
  const cliente = document.getElementById('cliente').value;
  const veiculo = document.getElementById('veiculo').value;
  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;
  const preco = document.getElementById('preco').value;

  // Monta a URL de busca apenas com os filtros preenchidos
  const params = new URLSearchParams();
  if (cliente) params.append('cliente', cliente);
  if (veiculo) params.append('veiculo', veiculo);
  if (servico) params.append('servico', servico);
  if (data) params.append('data', data);
  if (preco) params.append('preco', preco);

  try {
    const response = await fetch(`http://localhost:3000/api/relatorios?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Erro na rede: ${response.statusText}`);
    }

    const relatorios = await response.json();
    const lista = document.getElementById('reportList');
    lista.innerHTML = ''; // Limpa a lista antiga

    if (relatorios.length === 0) {
      lista.innerHTML = '<p>Nenhum relatório encontrado para os filtros selecionados.</p>';
      return;
    }

    // Cria um "card" para cada relatório retornado
    relatorios.forEach(r => {
      const card = document.createElement('div');
      card.className = 'report-card';
      
      // Acessa os dados aninhados de forma segura com o operador '?'
      const clienteNome = r.agendamento?.cliente?.nome || 'Cliente não informado';
      const veiculoPlaca = r.agendamento?.veiculo?.placa || 'N/A';
      const veiculoModelo = r.agendamento?.veiculo?.modelo || '';
      const agendamentoTitulo = r.agendamento?.title || 'Serviço Finalizado';
      const dataRelatorio = formatarData(r.data);
      const precoFinal = formatarPreco(r.preco);

      card.innerHTML = `
        <h3>${agendamentoTitulo}</h3>
        <p><strong>Cliente:</strong> ${clienteNome}</p>
        <p><strong>Veículo:</strong> ${veiculoModelo} - <strong>Placa:</strong> ${veiculoPlaca}</p>
        <p><strong>Data de Conclusão:</strong> ${dataRelatorio}</p>
        <p class="preco"><strong>Valor Total:</strong> ${precoFinal}</p>
      `;
      lista.appendChild(card);
    });

  } catch (error) {
    console.error('Falha ao buscar relatórios:', error);
    const lista = document.getElementById('reportList');
    lista.innerHTML = '<p class="error">Não foi possível carregar os relatórios. Verifique o console para mais detalhes.</p>';
  }
}

// Garante que o script rode após o carregamento completo da página
document.addEventListener('DOMContentLoaded', () => {
  const botaoFiltrar = document.querySelector('.filtros button');
  if (botaoFiltrar) {
    botaoFiltrar.addEventListener('click', buscarRelatorios);
  }
  
  // Busca inicial quando a página carrega, mostrando todos os relatórios
  buscarRelatorios(); 
});