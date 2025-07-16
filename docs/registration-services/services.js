// script.js
const popupContainer = document.getElementById('popupContainer');
let servicoEditandoId = null;

function openPopup() {
  popupContainer.classList.add('active');
}

function closePopup() {
  clearFields();
  popupContainer.classList.remove('active');
  servicoEditandoId = null;
}

function clearFields() {
  document.getElementById('nome').value = '';
  document.getElementById('tipo').value = '';
  document.getElementById('preco').value = '';
  document.getElementById('observacao').value = '';
}

function showAlert(message, type = 'success'){
  const alertBox = document.getElementById('alertBox');
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;

  setTimeout(() => {
    alertBox.classList.remove('hidden');
  }, 10);

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 4000);
}

async function carregarServicos() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  try {
    const response = await fetch('https://gerenciador-de-oficinas.onrender.com/servico');
    const servicos = await response.json();

    servicos.forEach(servico => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${servico.nome}</h3>
        <p><strong>Tipo:</strong> ${servico.tipo || '-'}</p>
        <p><strong>Preço:</strong> R$ ${servico.preco}</p>
        <p><strong>Obs:</strong> ${servico.observacao || '-'}</p>
        <button onclick="editarServico('${servico.id}')">Editar</button>
        <button onclick="deletarServico('${servico.id}')">Excluir</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar serviços:', err);
    showAlert('Erro ao carregar Serviços', "error")
  }
}

async function submitForm() {
  const nome = document.getElementById('nome').value.trim();
  const tipo = document.getElementById('tipo').value.trim();
  const preco = parseInt(document.getElementById('preco').value.trim(), 10);
  const observacao = document.getElementById('observacao').value.trim();

  if (!nome || !tipo) {
    showAlert('Preencha nome e tipo!', "signal");
    return;
  }

  const dado = { nome, tipo, preco, observacao };
  await enviarDados(dado);
  closePopup();
  carregarServicos();
}


async function enviarDados(dado) {
  const url = servicoEditandoId 
    ? `https://gerenciador-de-oficinas.onrender.com/servico/atualizar/${servicoEditandoId}`
    : 'https://gerenciador-de-oficinas.onrender.com/servico/cadastro';
  const method = servicoEditandoId ? 'PUT' : 'POST';
  const RespostaAlerta = servicoEditandoId ? 'Serviço editado' : 'Serviço adicionado';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dado)
    });
    if (!response.ok) throw new Error('Erro ao enviar dados');
    showAlert(RespostaAlerta);
    return await response.json();
  } catch (error) {
    console.error(error);
    showAlert('Erro ao salvar serviço', 'error');
  }
}

async function editarServico(id) {
  try {
    const response = await fetch('https://gerenciador-de-oficinas.onrender.com/servico');
    const servicos = await response.json();
    const servico = servicos.find(s => s.id === id);

    if (!servico) return;

    document.getElementById('nome').value = servico.nome;
    document.getElementById('tipo').value = servico.tipo;
    document.getElementById('preco').value = servico.preco;
    document.getElementById('observacao').value = servico.observacao;

    servicoEditandoId = id;
    openPopup();
  } catch (err) {
    console.error('Erro ao editar:', err);
  }
}

async function deletarServico(id) {
  if (!confirm('Deseja realmente excluir este serviço?')) return;
  try {
    const resposta = await fetch(`https://gerenciador-de-oficinas.onrender.com/servico/deletar/${id}`, { method: 'DELETE' });
    if(resposta.ok){
      showAlert('Serviço deletado!')
    } else{
      showAlert('Erro ao excluir serviço!', 'error')
    }
    carregarServicos();
  } catch (erro) {
    console.error('Erro ao excluir:', erro);
    showAlert('Erro ao excluir serviço!', 'error')
  }
}

carregarServicos();
