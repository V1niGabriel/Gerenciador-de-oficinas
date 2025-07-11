import express from 'express';

export default function (prisma) {
  const router = express.Router();

  // GET - Listar todos os eventos
  router.get('/', async (req, res) => {
    // ... (código existente, sem alterações)
    try {
      const eventos = await prisma.Agendamento.findMany({
        include: {
          cliente: true,
          veiculo: true
        }
      });
      res.status(200).json(eventos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao buscar eventos' });
    }
  });

  // POST - Criar novo evento
  router.post('/', async (req, res) => {
    // ... (código existente, sem alterações)
    const { title, start, backgroundColor, descricao, clienteNome, veiculoPlaca, veiculoModelo } = req.body;
    
    if (!clienteNome || !veiculoPlaca) {
      return res.status(400).json({ error: 'Nome do cliente e placa do veículo são obrigatórios.' });
    }

    try {
      const novoAgendamento = await prisma.$transaction(async (tx) => {
        const cliente = await tx.Client.upsert({
          where: { nome: clienteNome }, 
          update: {}, 
          create: { nome: clienteNome }, 
        });

        const veiculo = await tx.Vehicle.upsert({
          where: { placa: veiculoPlaca },
          update: {},
          create: {
            placa: veiculoPlaca,
            modelo: veiculoModelo || 'Não informado',
            cliente: {
              connect: { id: cliente.id }
            }
          },
        });

        const agendamento = await tx.Agendamento.create({
          data: {
            title,
            start: new Date(start),
            backgroundColor,
            descricao,
            cliente: { connect: { id: cliente.id } },
            veiculo: { connect: { id: veiculo.id } },
          },
        });
        return agendamento;
      });
      res.status(201).json(novoAgendamento);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao criar evento. Verifique os dados e tente novamente.' });
    }
  });

 
  // NOVA ROTA DE ATUALIZAÇÃO (PUT)
  router.put('/:id', async (req, res) => {
    const { id } = req.params; // ID do agendamento a ser atualizado
    const { title, start, backgroundColor, descricao, clienteNome, veiculoPlaca, veiculoModelo } = req.body;

    if (!clienteNome || !veiculoPlaca) {
      return res.status(400).json({ error: 'Nome do cliente e placa do veículo são obrigatórios.' });
    }

    try {
      const agendamentoAtualizado = await prisma.$transaction(async (tx) => {
        // 1. Encontra ou cria o Cliente com o nome fornecido (pode ser um novo nome)
        const cliente = await tx.Client.upsert({
          where: { nome: clienteNome },
          update: {},
          create: { nome: clienteNome },
        });

        // 2. Encontra ou cria o Veículo com a placa fornecida
        const veiculo = await tx.Vehicle.upsert({
          where: { placa: veiculoPlaca },
          update: {},
          create: {
            placa: veiculoPlaca,
            modelo: veiculoModelo || 'Não informado',
            cliente: { connect: { id: cliente.id } },
          },
        });

        // 3. ATUALIZA o agendamento existente para apontar para os novos dados e relações
        const agendamento = await tx.Agendamento.update({
          where: { id: id },
          data: {
            title,
            start: new Date(start),
            backgroundColor,
            descricao,
            cliente: { connect: { id: cliente.id } }, // Re-conecta ao cliente (novo ou existente)
            veiculo: { connect: { id: veiculo.id } }, // Re-conecta ao veículo (novo ou existente)
          },
        });
        return agendamento;
      });

      res.status(200).json(agendamentoAtualizado);

    } catch (error) {
      console.error(error);
      // Erro comum: P2025 -> "Record to update not found." (se o ID do agendamento não existir)
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Agendamento não encontrado para atualização.' });
      }
      res.status(500).json({ error: 'Erro ao atualizar o agendamento.' });
    }
  });


  // DELETE - Excluir evento
  router.delete('/:id', async (req, res) => {
    // ... (código existente, sem alterações)
    const { id } = req.params;
    try {
      await prisma.Agendamento.delete({
        where: { id: id },
      });
      res.json({ message: 'Evento excluído' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao excluir evento' });
    }
  });

  return router;
}