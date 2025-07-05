const popupContainer = document.getElementById('popupContainer');

function openPopup() {
  popupContainer.classList.add('active');
}

function closePopup() {
  clearFields();
  popupContainer.classList.remove('active');
}

async function enviarDados(dado){
  try{
    const response = await fetch('http://localhost:3000/servico/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dado)
    });

    if(!response.ok){
      throw new Error('Erro ao enviar dados');
    }

    return await response.json();

  } catch (erro){
    console.error('Erro:', erro)
  }
}

async function submitForm() {
  const nome = document.getElementById('nome').value.trim();
  const tipo = document.getElementById('tipo').value.trim();
  const preco = parseInt(document.getElementById('preco').value.trim(), 10);
  const observacao = document.getElementById('observacao').value.trim();
  const duracao = document.getElementById('duracao').value.trim();

  if (!nome || !tipo) {
    alert('Preencha pelo menos o Nome e o Tipo do serviço.');
    return;
  }

  const dado = {
    nome, tipo, preco, observacao
  };

  try{
    const resposta = await enviarDados(dado);
    console.log('Resposta do servidor', resposta);

    alert("Serviço cadastrado com sucesso!");
  } catch(err) {
    console.error('Erro:', err)
  }

  console.log("Serviço cadastrado:");
  console.log("Nome:", nome);
  console.log("Tipo:", tipo);
  console.log("Duração:", duracao);
  console.log("Preço:", preco);
  console.log("Observação:", observacao);

  closePopup(); // também limpa os campos
}

function clearFields() {
  document.getElementById('nome').value = "";
  document.getElementById('tipo').value = "";
  document.getElementById('duracao').value = "";
  document.getElementById('preco').value = "";
  document.getElementById('observacao').value = "";
}

window.addEventListener('click', function(event) {
  if (event.target === popupContainer) {
    closePopup();
  }
});
