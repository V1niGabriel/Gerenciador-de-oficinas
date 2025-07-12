let calendar;
let eventoAtual = null;
let modoEdicao = false;
let agendamentoParaPrecificarId = null;
let dadoComparacao = null;

// Função para carregar eventos 
async function carregarEventos() {
  const resposta = await fetch('https://gerenciador-de-oficinas.onrender.com/api/agenda');
  const dados = await resposta.json();
  return dados.map(evento => ({
    id: evento.id,
    title: evento.title,
    start: evento.start,
    backgroundColor: evento.backgroundColor,
    extendedProps: {
      // Passa OBJETOS inteiros, o que dá acesso a todos os dados
      cliente: evento.cliente,
      veiculo: evento.veiculo,
      descricao: evento.descricao
    }
  }));
}

//Função para salver os agendamentos no banco de dados
async function salvarEventos(evento) {
  return await fetch('https://gerenciador-de-oficinas.onrender.com/api/agenda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento)
  })
}

document.addEventListener("DOMContentLoaded", async function () {
  const calendarEl = document.getElementById("calendar");

  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: "pt-br",
    initialView: "dayGridMonth",
    height: "auto",
    eventDisplay: "block",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek",
    },
    buttonText: {
      today: "Hoje",
      month: "Mês",
      week: "Semana",
    },
    dateClick: function (info) {
      abrirModalCriacao(info.dateStr);
    },
    eventClick: function (info) {
      editarEvento(info.event);
    },
    // O FullCalendar irá chamar essa função automaticamente.
    events: carregarEventos
  });

  // Renderiza o calendário imediatamente, sem esperar pela API.
  calendar.render();
});

function abrirModalCriacao(dataSelecionada = "") {
  modoEdicao = false;
  eventoAtual = null;

  document.getElementById("modal-title").innerText = "Novo Agendamento";
  document.getElementById("form-agendamento").reset();
  document.getElementById("data").value = dataSelecionada;
  document.getElementById("botoes-criacao").style.display = "block";
  document.getElementById("botoes-edicao").style.display = "none";
  document.getElementById("modal-agendar").style.display = "flex";
}

function editarEvento(evento) {
  modoEdicao = true;
  eventoAtual = evento;

  document.getElementById("modal-title").innerText = "Editar Agendamento";
  document.getElementById("titulo").value = evento.title;
  // Formata a data corretamente para o input datetime-local
  document.getElementById("data").value = new Date(evento.start).toISOString().slice(0, 16);

  // Acessando os dados aninhados com segurança (usando '?')
  document.getElementById("clienteNome").value = evento.extendedProps.cliente?.nome || "";
  document.getElementById("veiculoPlaca").value = evento.extendedProps.veiculo?.placa || "";
  document.getElementById("veiculoModelo").value = evento.extendedProps.veiculo?.modelo || "";

  document.getElementById("descricao").value = evento.extendedProps.descricao || "";
  document.getElementById("cor").value = evento.backgroundColor;

  document.getElementById("botoes-criacao").style.display = "none";
  document.getElementById("botoes-edicao").style.display = "flex";
  document.getElementById("modal-agendar").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modal-agendar").style.display = "none";
  document.getElementById("form-agendamento").reset();
  eventoAtual = null;
  modoEdicao = false;
}

async function salvarEdicao() {
  if (!eventoAtual) return;

  const dadosAtualizados = {
    title: document.getElementById("titulo").value,
    start: document.getElementById("data").value,
    backgroundColor: document.getElementById("cor").value,
    descricao: document.getElementById("descricao").value,
    clienteNome: document.getElementById("clienteNome").value,
    veiculoPlaca: document.getElementById("veiculoPlaca").value,
    veiculoModelo: document.getElementById("veiculoModelo").value
  };

  try {
    const response = await fetch(`https://gerenciador-de-oficinas.onrender.com/api/agenda/${eventoAtual.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados)
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar o agendamento.');
    }

    // Recarrega todos os eventos do servidor. É a forma mais segura de garantir consistência.
    calendar.refetchEvents();
    fecharModal();

  } catch (error) {
    console.error("Erro ao salvar edição:", error);
    alert("Não foi possível salvar as alterações.");
  }
}

async function concluirAgendamento() {
  if (eventoAtual) {
    //Guarda o ID do evento em uma variável
    const idDoEventoParaPrecificar = eventoAtual.id;
    // Primeiro, fecha o modal de edição
    fecharModal();
    // Em seguida, abre o modal de precificação com o ID do evento
    abrirModalPrecificacao(idDoEventoParaPrecificar);
  } else {
    alert("Nenhum evento selecionado para concluir.");
  }
}

//Função de Delete
async function Deletar() {
  if (!eventoAtual) {
    console.error("Tentativa de deletar um evento nulo.");
    return; // Interrompe a função aqui
  }

  await fetch(`https://gerenciador-de-oficinas.onrender.com/api/agenda/${eventoAtual.id}`, {
    method: 'DELETE',
  });
  eventoAtual.remove();
  calendar.refetchEvents();
  fecharModal();
}

document
  .getElementById("form-agendamento")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const descricao = document.getElementById("descricao").value;
    const cor = document.getElementById("cor").value;
    const clienteNome = document.getElementById("clienteNome").value;
    const veiculoPlaca = document.getElementById("veiculoPlaca").value;
    const veiculoModelo = document.getElementById("veiculoModelo").value;

    if (!modoEdicao) {
      const novoAgendamento = {
        title: titulo,
        start: data,
        backgroundColor: cor,
        descricao: descricao,
        clienteNome: clienteNome,
        veiculoPlaca: veiculoPlaca,
        veiculoModelo: veiculoModelo,
      };
      try {
        // 2. Esperamos a resposta do servidor
        const response = await salvarEventos(novoAgendamento);

        if (!response.ok) {
          // Se o servidor retornar um erro, nós o exibimos
          const erro = await response.json();
          throw new Error(erro.error || "Falha ao salvar o evento.");
        }

        // 3. Se a resposta foi OK, mandamos o calendário recarregar!
        calendar.refetchEvents();
        fecharModal();

      } catch (error) {
        console.error("Erro ao salvar agendamento:", error);
        alert(`Não foi possível criar o agendamento: ${error.message}`);
      }
    }
    fecharModal();
  });


//Parte de Precificação do serviço

//Abre o modal de precificação e inicia o carregamento dos itens.
function abrirModalPrecificacao(agendamentoId) {
  agendamentoParaPrecificarId = agendamentoId;
  document.getElementById("modal-precificacao").style.display = "flex";
  carregarItensParaPrecificacao();
}

//Fecha o modal de precificação e limpa seu conteúdo
function fecharModalPrecificacao() {
  document.getElementById("modal-precificacao").style.display = "none";
  document.getElementById("lista-servicos").innerHTML = "";
  document.getElementById("lista-pecas").innerHTML = "";
  document.getElementById("custo-extra").value = 0;
  document.getElementById("preco-total").innerText = "0.00";
  agendamentoParaPrecificarId = null;
}

// Calcula o preço total com base nos itens selecionados e no custo extra.
function calcularTotalPrecificacao() {
  let total = 0;

  // Soma os preços dos checkboxes selecionados (serviços e peças)
  const itensSelecionados = document.querySelectorAll('#modal-precificacao input[type="checkbox"]:checked');
  itensSelecionados.forEach(item => {
    total += parseFloat(item.dataset.price);
  });

  // Soma o custo extra
  const custoExtra = parseFloat(document.getElementById("custo-extra").value) || 0;
  total += custoExtra;

  // Atualiza o valor na tela
  document.getElementById("preco-total").innerText = total.toFixed(2);
}

//Busca os dados de peças e serviços na API e os exibe no modal.
async function carregarItensParaPrecificacao() {
  try {
    // Busca serviços e peças em paralelo
    const [respostaServicos, respostaPecas] = await Promise.all([
      fetch('https://gerenciador-de-oficinas.onrender.com/api/service'),
      fetch('https://gerenciador-de-oficinas.onrender.com/api/parts')
    ]);

    const servicos = await respostaServicos.json();
    const pecas = await respostaPecas.json();

    const containerServicos = document.getElementById("lista-servicos");
    const containerPecas = document.getElementById("lista-pecas");

    // Popula a lista de serviços
    servicos.forEach(servico => {
      const precoFormatado = (servico.preco || 0).toFixed(2);
      containerServicos.innerHTML += `
        <div>
          <label>
            <input type="checkbox" data-price="${servico.preco}" value="${servico.id}" onchange="calcularTotalPrecificacao()">
            ${servico.nome}
          </label>
          <span>R$ ${servico.preco.toFixed(2)}</span>
        </div>
      `;
    });

    // Popula a lista de peças
    pecas.forEach(peca => {
      const precoFormatado = (peca.preco || 0).toFixed(2);
      containerPecas.innerHTML += `
         <div>
          <label>
            <input type="checkbox" data-price="${(peca.preco) / 100}" value="${peca.id}" onchange="calcularTotalPrecificacao()">
            ${peca.nome}
          </label>
          <span>R$ ${((peca.preco) / 100).toFixed(2)}</span>
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar itens para precificação:", error);
    alert("Não foi possível carregar os itens. Verifique o console.");
  }
}

//Salva o orçamento, enviando os dados para a API.
async function salvarPrecificacao() {
  if (!agendamentoParaPrecificarId) {
    alert("Erro: ID do agendamento não encontrado.");
    return;
  }

  // Coleta os IDs dos itens selecionados
  const itensSelecionados = document.querySelectorAll('#modal-precificacao input[type="checkbox"]:checked');
  const serviceIds = [];
  const partIds = [];

  itensSelecionados.forEach(item => {
    if (item.closest('#lista-servicos')) {
      serviceIds.push(item.value);
    } else if (item.closest('#lista-pecas')) {
      partIds.push(item.value);
    }
  });

  const extraCost = parseFloat(document.getElementById("custo-extra").value) || 0;
  const totalPrice = parseFloat(document.getElementById("preco-total").innerText);

  try {
    const resposta = await fetch(`https://gerenciador-de-oficinas.onrender.com/api/agenda/${agendamentoParaPrecificarId}/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceIds,
        partIds,
        extraCost,
        totalPrice
      })
    });

    if (!resposta.ok) {
      throw new Error('Falha ao salvar o orçamento.');
    }

    alert("Orçamento salvo e agendamento finalizado com sucesso!");
    fecharModalPrecificacao();
    calendar.refetchEvents(); // Recarrega os eventos no calendário para mostrar a atualização

  } catch (error) {
    console.error("Erro ao salvar precificação:", error);
    alert("Ocorreu um erro ao salvar. Tente novamente.");
  }
}