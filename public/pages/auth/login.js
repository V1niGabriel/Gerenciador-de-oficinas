const container = document.getElementById('container');
const overlaycon = document.getElementById('overlaycon');
const overlayBtn = document.getElementById('overlayBtn');

overlayBtn.addEventListener('click', () => {
  container.classList.toggle('right-panel-active');
});

document.getElementById('btnshowlogin').addEventListener('click', () => {
  container.classList.remove('right-panel-active');
});

document.getElementById('btnshowsingup').addEventListener('click', () => {
  container.classList.add('right-panel-active');
});

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

//Bloco referente ao processo de Registro/criar conta
document.getElementById('cadastro').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome = document.getElementById('Cad.nome').value;
  const email = document.getElementById('Cad.email').value;
  const senha = document.getElementById('Cad.senha').value;

  const dados = {
    nome,
    email,
    senha
  }

  try{
    const responder = await fetch('http://localhost:3000/singUp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    const resultado = await responder.json();
    
    if (responder.ok){
      console.log('Sucesso:', resultado.mensagem)
      showAlert("Cadastro Realizado")
      setTimeout(() => {
        window.location.href = '../ladingpage/ladingpage.html';
      }, 1200);
    } else {
      console.log('Erro da API')
      showAlert("Email já está em uso", "signal")
    }

  }catch(error){
    console.error('Erro:', error)
    showAlert("Erro ao Realizar Cadastro", "error")
  }
})

//Bloco referente ao processo de login/Entrar
document.getElementById('Entrar').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('Ent.email').value;
  const senha = document.getElementById('Ent.senha').value;

  const dados = {
    email,
    senha
  }

  try{
    const responder = await fetch('http://localhost:3000/SingIn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    })

    const resultado = await responder.json()
    console.log(responder);
    console.log(resultado)

    if(responder.ok) {
     window.location.href = '../ladingpage/ladingpage.html'
    } 
    else {
      console.log('ERRO')
      showAlert("Email ou Senha incorretos", "signal")
    }

  } catch(error) {
      console.error('Erro:', error)
      showAlert("Erro no Sistema", "error")
  }
})

