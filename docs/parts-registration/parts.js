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
  document.getElementById('modelo').value = '';
  document.getElementById('preco').value = '';
  document.getElementById('estoque').value = '';
  document.getElementById('distribuidor').value = '';
  document.getElementById('data').value = '';
  document.getElementById('garantia').value = '';
  document.getElementById('observacao').value = '';
}

function showAlert(message, type = 'success', time = 4000){
  const alertBox = document.getElementById('alertBox');
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;

  setTimeout(() => {
    alertBox.classList.remove('hidden');
  }, 10);

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, time);
}

async function carregarServicos() {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  try {
    const response = await fetch('https://gerenciador-de-oficinas.onrender.com/pecas');
    const servicos = await response.json();

    servicos.forEach(servico => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${servico.nome}</h3>
        <p><strong>Data:</strong> ${servico.data || ''} <p>
        <p><strong>Modelo:</strong> ${servico.modelo}</p>
        <p><strong>Preço:</strong> R$ ${(servico.preco)/100}</p>
        <p><strong>Estoque:</strong> ${servico.estoque} <p>
        <p><strong>Distribuidor:</strong> ${servico.distribuidor || ''} <p>
        <p><strong>Garantia:</strong> ${servico.garantia || ''} <p>
        <p><strong>Obs:</strong> ${servico.observacao || ''}</p>
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
  const modelo = document.getElementById('modelo').value.trim();
  let   preco = parseFloat(document.getElementById('preco').value.trim(), 10);
  const estoque = parseInt(document.getElementById('estoque').value.trim(), 10);
  const distribuidor = document.getElementById('distribuidor').value.trim();
  const data = document.getElementById('data').value.trim();
  const garantia = document.getElementById('garantia').value.trim();
  const observacao = document.getElementById('observacao').value.trim();

  preco = parseInt(preco * 100); //Conversão pois o banco de dados trabalhar com inteiros

  if (!nome || !modelo || !preco || !estoque) {
    showAlert('Preencha nome, modelo, preço e quantidade!', "signal", 6000);
    return;
  }

  const dado = { 
    nome, modelo, preco, estoque, distribuidor, data, garantia, observacao
  };
  console.log(dado)
  await enviarDados(dado);
  closePopup();
  carregarServicos();
}


async function enviarDados(dado) {
  const url = servicoEditandoId 
    ? `https://gerenciador-de-oficinas.onrender.com/pecas/editar/${servicoEditandoId}`
    : 'https://gerenciador-de-oficinas.onrender.com/pecas/cadastro';
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
  } catch (err) {
    console.error(err);
    showAlert('Erro ao salvar serviço', 'error');
  }
}

async function editarServico(id) {
  try {
    const response = await fetch('https://gerenciador-de-oficinas.onrender.com/pecas');
    const servicos = await response.json();
    const servico = servicos.find(s => s.id === id);

    if (!servico) return;

    document.getElementById('nome').value = servico.nome;
    document.getElementById('modelo').value = servico.modelo;
    document.getElementById('preco').value = (servico.preco)/100;
    document.getElementById('estoque').value = servico.estoque;
    document.getElementById('distribuidor').value = servico.distribuidor;
    document.getElementById('data').value = servico.data
    document.getElementById('garantia').value = servico.garantia
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
    const resposta = await fetch(`https://gerenciador-de-oficinas.onrender.com/pecas/deletar/${id}`, { method: 'DELETE' });
    if(resposta.ok){
      showAlert('Serviço deletado!')
    } else{
      showAlert('Erro ao excluir serviço!', 'error')
    }
    carregarServicos();
  } catch (erro) {
    console.error('Erro ao excluir:', erro);
    showAlert('Erro ao excluir serviço!', 'erro')
  }
}

carregarServicos();
