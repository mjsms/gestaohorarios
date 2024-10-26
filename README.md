# Gestão de Horários ISCTE

Este projeto é uma aplicação web para a gestão de horários do ISCTE, que permite carregar horários a partir de ficheiros CSV, realizar análise de qualidade dos horários e visualizar resultados em uma interface de tabela com paginação.

## Funcionalidades

- **Carregamento de Horários**: Permite o upload de ficheiros CSV de horários e salas.
- **Análise de Qualidade**: Avaliação da qualidade dos horários baseada em critérios como sobrelotação e sobreposição de aulas.
- **Paginação**: Utilização do Tabulator para visualização de dados em uma tabela com paginação server-side.

## Tecnologias Utilizadas

- **Node.js** e **Express**: Backend e API REST.
- **Tabulator.js**: Biblioteca JavaScript para visualização de dados em tabelas.
- **Docker**: Para criação de containers e facilitar a implementação e configuração do projeto.

## Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **Docker** (para execução opcional em container)
