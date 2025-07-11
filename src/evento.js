import express from 'express';

export default function (prisma) {
  const router = express.Router();

  // GET - Listar todos os eventos
  router.get('/', async (req, res) => {
    try {
      const eventos = await prisma.Agendamento.findMany();
      res.status(201).json(eventos);
    } catch (err) {
      res.status(500).json({ error: 'Erro  buscar eventos' });
    }
  });

  // POST - Criar novo evento
  router.post('/', async (req, res) => {
    const { title, start, backgroundColor, cliente, veiculo, descricao } = req.body;
    console.log(req.body)
    try {
      const evento = await prisma.Agendamento.create({
        data: {
          title,
          start: new Date(start),
          backgroundColor,
          Cliente: cliente,
          veiculo,
          descricao,
        },
      });
      res.status(201).json(evento);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao criar evento' });
      console.error(err)
    }
  });

  // PUT - Atualizar evento
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, start, backgroundColor, cliente, veiculo, descricao } = req.body;
    try {
      const evento = await prisma.Agendamento.update({
        where: { id: id },
        data: {
          title,
          start: new Date(start),
          backgroundColor,
          Cliente: cliente,
          veiculo,
          descricao,
        },
      });
      res.json(evento);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
  });

  // DELETE - Excluir evento
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.Agendamento.delete({
        where: { id: id },
      });
      res.json({ message: 'Evento excluído' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao excluir evento' });
    }
  });

  return router;
}
