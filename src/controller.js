import express from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

// Lista todos os serviços
export const listarServicos = async (req, res) => {
  try {
    const servicos = await prisma.services.findMany({
      select: { id: true, nome: true, preco: true }
    });
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviços.' });
  }
};

// Lista todas as peças
export const listarPecas = async (req, res) => {
  try {
    const pecas = await prisma.parts.findMany({
      where: { estoque: { gt: 0 } }, // Opcional: só mostra peças com estoque
      select: { id: true, nome: true, preco: true }
    });
    res.json(pecas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar peças.' });
  }
};

// Finaliza o agendamento
export const finalizarAgendamento = async (req, res) => {
  const { id } = req.params;
  const { serviceIds, partIds, extraCost, totalPrice } = req.body;

  try {
    //Transação para garantir que todas as operações funcionem ou nenhuma delas
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar o relatório
      const relatorio = await tx.report.create({
        data: {
          preco: totalPrice,
          agendamento: { connect: { id: id } }
        }
      });

      // 2. Ligar os serviços usados ao agendamento
      if (serviceIds && serviceIds.length > 0) {
        await tx.servicesOnAgendamentos.createMany({
          data: serviceIds.map(serviceId => ({
            agendamentoId: id,
            serviceId: serviceId,
          })),
        });
      }

      // 3. Ligar as peças usadas e abater do estoque
      if (partIds && partIds.length > 0) {
        await tx.partsOnAgendamentos.createMany({
          data: partIds.map(partId => ({
            agendamentoId: id,
            partId: partId,
          })),
        });

        // Cria um array de promessas de atualização, sem 'await'
        const updatePromises = partIds.map(partId =>
          tx.parts.update({
            where: { id: partId },
            data: { estoque: { decrement: 1 } },
          })
        );
        // Executa todas as promessas em paralelo
        await Promise.all(updatePromises);
      }
      
      // 4. Atualizar o agendamento original como concluído
      const agendamentoAtual = await tx.agendamento.findUnique({ where: { id } });
      await tx.agendamento.update({
        where: { id: id },
        data: {
          title: `${agendamentoAtual.title} (Finalizado)`,
          backgroundColor: '#4CAF50', // Cor verde para concluído
        },
      });

      return relatorio;
    });

    res.status(201).json(result);

  } catch (error) {
    console.error("Erro ao finalizar agendamento:", error);
    res.status(500).json({ error: 'Não foi possível finalizar o agendamento.' });
  }
};

//Bloco dos relatórios
export const listarRelatorios = async (req, res) => {
  try {
    const { cliente, veiculo, titulo, data, preco } = req.query;

    const where = {};

    // Construção da busca com base nos filtros relacionais
    if (cliente) {
      // Filtra pelo nome do cliente dentro da relação
      where.agendamento = { ...where.agendamento, cliente: { nome: { contains: cliente, mode: 'insensitive' } } };
    }
    if (veiculo) {
      // Filtra pela placa do veículo dentro da relação
      where.agendamento = { ...where.agendamento, veiculo: { placa: { contains: veiculo, mode: 'insensitive' } } };
    }
    if (titulo) {
      //Busca pelo título dentro do agendamento
      where.agendamento = {...where.agendamento, title: {contains: titulo, mode: 'insensitive'}}
    }
    if (data){
      const dataInicio = new Date(data); //Ex: 2025-07-16T:00:00
      const dataFim = new Date(data);
      dataFim.setDate(dataFim.getDate() + 1); //EX: 2025-07-17T:00:00

      where.data = {
        gte: dataInicio, //gte = Maior ou igual ao valor digitado
        lt: dataFim  //lt = menor que o inicio do próximo dia
      };
    }
    if (preco){
      const precoNumerico = parseFloat(preco);
      if (!isNaN(precoNumerico)) {
        where.preco = {
          lte: precoNumerico //lte = Menor ou igual que
        };
      }
    }

    const relatorios = await prisma.Report.findMany({
      where,
      include: {
        // Inclui o agendamento relacionado
        agendamento: {
          include: {
            // Dentro do agendamento, inclui o cliente e o veículo
            cliente: true,
            veiculo: true,
          }
        }
      },
      orderBy: {
        data: 'desc' // Ordena pelos mais recentes
      }
    });

    res.status(200).json(relatorios);
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    res.status(500).json({ error: 'Erro ao buscar relatórios.' });
  }
};