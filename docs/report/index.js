async function buscarRelatorios() {
  const cliente = document.getElementById('cliente').value;
  const veiculo = document.getElementById('veiculo').value;
  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;
  const preco = document.getElementById('preco').value;

  const params = new URLSearchParams({ cliente, veiculo, servico, data, preco });
  const response = await fetch('/relatorios?' + params.toString());
  const relatorios = await response.json();

  const lista = document.getElementById('reportList');
  lista.innerHTML = '';

  relatorios.forEach(r => {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
      <h3>${r.agenda?.titulo || 'Serviço'}</h3>
      <p><strong>Cliente:</strong> ${r.agenda?.cliente?.nome}</p>
      <p><strong>Veículo:</strong> ${r.agenda?.veiculo?.placa}</p>
      <p><strong>Data:</strong> ${new Date(r.Data).toLocaleDateString()}</p>
      <p><strong>Preço:</strong> R$ ${r.preco.toFixed(2)}</p>
      `;
      lista.appendChild(card);
    });
  }

  window.onload = buscarRelatorios;

