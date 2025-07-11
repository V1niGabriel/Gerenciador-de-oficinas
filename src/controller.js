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
    // Usamos uma transação para garantir que todas as operações funcionem ou nenhuma delas
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar o relatório
      const relatorio = await tx.report.create({
        data: {
          preco: totalPrice,
          agenda: { connect: { id: id } }
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
        // Abater do estoque
        for (const partId of partIds) {
          await tx.parts.update({
            where: { id: partId },
            data: { estoque: { decrement: 1 } },
          });
        }
      }

      // 4. Atualizar o agendamento original como concluído
      const agendamentoAtual = await tx.agendamento.findUnique({ where: { id } });
      await tx.agendamento.update({
        where: { id: id },
        data: {
          title: `${agendamentoAtual.title} (Finalizado)`,
          backgroundColor: '#4CAF50', // Cor verde para concluído
          relatorioId: relatorio.id,
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

