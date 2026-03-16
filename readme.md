# 🌐 Sistema Web - Gerenciamento de Oficinas (MyCar)

Este repositório contém o código-fonte do projeto desenvolvido.  
Aqui estão as instruções para configurar e executar a API e conexão com o banco de dados do projeto localmente.

---

## 📦 Requisitos

Antes de iniciar, certifique-se de ter os seguintes itens instalados:

- [Node.js](https://nodejs.org/) (recomendado: versão LTS)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- (Opcional) [MongoDB](https://www.mongodb.com/), caso queira. 

---

## 🚀 Como executar o projeto

### 1. Clone o repositório

```
git clone [link do Repositório]
```
#### 2. Instale as dependências

```
npm install
# ou
yarn
```

#### 3. Configure as variáveis de ambiente
Crie um arquivo .**env** na **raiz do projeto.** Você pode usar o exemplo abaixo:<br>
Edite o .env com os valores reais, por exemplo:

```
PORT=3000
DATABASE_URL=mongodb://localhost:27017/nomedobanco
SECRET_KEY=sua_chave_secreta
```

#### 4. Inicie o servidor

Lembrando que para iniciar  o servidor, é necessário rodar o código dentro da pastar src
```
node server.js 
# ou
yarn dev
```

✅ Pronto!

Se tudo estiver correto, o servidor estará rodando em:
http://localhost:3000


## 🛠 Tecnologias usadas
 - Node.js

 - Express

 - MongoDB + Prisma 

Outras bibliotecas...

## 🧪 Testes (em construção)

os testes vão ser com Jest<br> 
Para instalação: 
```
 npm install --save-dev jest
```

## 📂 Organização do Projeto
📁 assets/<br>
├── 📁 icons/<br>
├── 📁 img/<br>

📁 prisma/<br>
├── schema.prisma

📁 public/<br>
├── 📁 css/<br>
│ ├── Style-login.css<br>
│ └── stylesheet.css<br>
├── 📁 js/<br>
│ └── login.js<br>
├── 📁 page/<br>
│ └── 📁 auth/<br>
│ └── SingIn<br>
├── index.html<br>

📁 src/<br>
├── 📁 services/

.env<br>
.gitignore<br>
package.json<br>
README.md<br>

## 🚀 Modelagem e Arquitetura do Projeto
 - [Trello.com](https://trello.com/invite/b/689b1842b948440ef44475e6/ATTIa194c85751e7c3575fd80be8aa46dd31AFCBDE4D/gerenciador-de-oficina-projeto)

