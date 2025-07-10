import express from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import path from 'path'
import bcrypt from 'bcryptjs'
import { hash } from 'crypto'
import { CallTracker } from 'assert'

const prisma = new PrismaClient()
const app = express()

//permite a requisição por solicitações externas. Funciona semelhante um middleware 
app.use(cors({origin: 'http://127.0.0.1:5500'}))
//app.use(cors({origin: 'https://v1nigabriel.github.io'}))
app.use(express.json())
app.use(express.static(path.join(process.cwd(), 'public')))
app.listen(3000)

//Bloco de cadastro do usuario
app.post('/singUp', async (req, res) => { 
   const {nome, email, senha} = req.body
   console.log(nome, email, senha)

  try{
   const senhaHash = await bcrypt.hash(senha, 10)
   const dados = await prisma.User.create({
      data: {
         nome: nome,
         email: email,
         senha: senhaHash
      }
   })
   res.status(201).json({message: "Usuário cadastrado com sucesso!"})
  } catch(error){

   if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({message: "Email já está em uso"}); //409 = erro de conflito
   }
      //Erro generico de servidor
      return res.status(500).json({message: "erro no servidor"})
  }
})

//Bloco de verificação de entrada da página de Login
app.post('/SingIn', async (req, res) => {
   const {email} = req.body
   const pwd = req.body.senha
   console.log(email, pwd)

   try{
      let verificador = await prisma.User.findUnique({
         where: {
            email: email
         },
         select: {
            senha: true
         }
      })

      verificador = verificador.senha
      console.log("pwd:", pwd)
      console.log("verifcador:", verificador)
      const SenhaValida = await bcrypt.compare(pwd, verificador)

      if (!SenhaValida) {
         return res.status(401).json({message: "Senha incorreta"})
      }
      
      console.log("SenhaValida:", SenhaValida)

      res.status(200).json({message: "Login realizado com sucesso!"})

   } catch(error) {
      //Erro generico de servidor
      console.error(error);
      return res.status(500).json({message: "erro no servidor"})
   }   
})

app.get ('/relatorio', async (req, res) => {
   try{
      const dados = await prisma.services.findMany()
      res.status(201).json(dados)
   } catch(err){
      res.status(500).json({message: 'erro com o servidor'})
   }
})

//BLOCO DO PÁGINA SERVIÇOS

//Cadastro 
app.post('/servico/cadastro', async (req, res) => {
   const {nome, tipo, preco, observacao} = req.body
   console.log(req.body)
   console.log(nome, tipo, preco, observacao)

   try{
      const dados = await prisma.Services.create({
         data: {
            nome: nome,
            tipo: tipo,
            preco: preco,
            observacao: observacao
         }
      })

      res.status(201).json(dados)
   } catch (error){
      console.error(error);
      //Erro generico de servidor
      return res.status(500).json({message: "erro no servidor"})
   }

})

//Listar todos servicos
app.get('/servico', async (req, res) => {
   try {
      const servicos = await prisma.Services.findMany()
      res.status(200).json(servicos)
   } catch (error) {
      console.error(error)
      res.status(500).json({message: "Erro no servidor"})
   }
})

//Atualização
app.put('/servico/atualizar/:id', async (req, res) => {
   const {id} = req.params;
   const {nome, tipo, preco, observacao} = req.body
   console.log(id)
   console.log(nome, tipo, preco, observacao)
   try{
      await prisma.Services.update({
         where: {
            id: id
         },
         data: {
            nome: nome, 
            tipo: tipo, 
            preco: preco, 
            observacao: observacao
         }
      })
      res.status(201).json({message: "Atualização feita"})
  } catch (erro) {
      console.error(erro)
      res.status(500).json({message: "Erro ao atualizar serviço"})
  }
})

//Deletar
app.delete ('/servico/deletar/:id', async (req, res) => {
   const {id} = req.params;
   try{
      await prisma.Services.delete({
         where: {
            id: id
         }
      })
      res.status(204).json({message: "Usuário deletado"})
   } catch (erro) {
      console.erro(erro)
      res.status(500).json({message: "Erro ao deletar usuário"})
   }
})

//BLOCO DA PÁGINA PEÇAS

//Método create
app.post('/pecas/cadastro', async (req, res) => {
   const {nome, modelo, estoque, distribuidor, data, garantia, preco, observacao} = req.body
   console.log(req.body)
   try {
      await prisma.Parts.create({
         data: {
            nome, modelo, estoque, distribuidor, data, garantia, preco, observacao
         }
      })

      res.status(201).json({message: 'Sucesso'})
   } catch (erro) {
      console.erro(erro)
      res.status(500).json({message:'Erro no servidor'})
   }

})

//Método que solicita todos os dados do BD para Leitura
app.get('/pecas', async (req, res) => {
   try{
      const servicos = await prisma.Parts.findMany()
      res.status(200).json(servicos)
   } catch (erro) {
      console.erro(erro)
      res.status(500).json({message: 'Erro no servidor'})
   }
})

//Método de delete
app.delete('/pecas/deletar/:id', async (req, res) => {
   const {id} = req.params
   try{
      await prisma.Parts.delete({
         where: {
            id: id
         }
      })
      res.status(204).json({message: "Usuário deletado"})
   } catch (erro) {
      console.erro(erro)
      res.status(500).json({message:'Erro com o servidor'})
   }
})

//Método de Atualização/Edição 
app.put('/pecas/editar/:id', async (req, res) => {
   const {id} = req.params
   const {nome, modelo, estoque, distribuidor, data, garantia, preco, observacao} = req.body

   try{
      await prisma.Parts.update({
         where: {
            id: id
         },
         data: {
            nome, modelo, estoque, distribuidor, data, garantia, preco, observacao
         }
      })
      res.status(201).json({message:'Sucesso'})
   } catch(erro) {
      console.erro(erro)
      res.status(500).json({message: 'Erro no servidor'})
   }
})