import express from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import path from 'path'
import bcrypt from 'bcryptjs'
import { hash } from 'crypto'

const prisma = new PrismaClient()
const app = express()

//permite a requisição por solicitações externas. Funciona semelhante um middleware 
app.use(cors({origin: 'http://127.0.0.1:5500'}))
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

//Bloco de verificação de entrada
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
      return res.status(500).json({message: "erro no servidor"})
  }
})

app.get ('/relatorio', async (req, res) => {
   try{
      const dados = await prisma.User.findMany()
      res.status(201).json(dados)
   } catch(err){
      res.status(500).json({message: 'erro com o servidor'})
   }
})
