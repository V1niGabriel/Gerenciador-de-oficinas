const container = document.getElementById('container');
const overlaycon = document.getElementById('overlaycon');
const overlayBtn = document.getElementById('overlayBtn');

overlayBtn.addEventListener('click', () => {
  container.classList.toggle('right-panel-active');
});


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
      window.location.href = '/public/index.html';
    } else {
      console.log('Erro da API')
    }

  }catch(error){
    console.error('Erro:', error)
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
     window.location.href = '/public/index.html'
    } 
    else {
      console.log('ERRO')
    }

  } catch(error) {
      console.error('Erro:', error)
  }

})
