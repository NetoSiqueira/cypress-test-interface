/// <reference types="cypress"/>

import loc from '../../support/locators'
import '../../support/commandsContas'

describe('Should test at a funcional level', () =>{

    after(()=>{
        cy.clearLocalStorage()
    })
    
    before(() =>{
        cy.server()
        cy.route({
            method: 'POST',
            url:'/signin',
            response:{
                id: 1000,
                nome: 'Usuario falso',
                token: 'Uma string muito grande que nao ser deveria ser aceita'
            }
        }).as('signin')
        cy.route({
            method:'GET',
            url: '/saldo',
            response: [{
                conta_id: 999,
                conta: "Conta falsa 1",
                saldo: "100.00"
            },
            {
                conta_id: 9909,
                conta: "Conta falsa 2",
                saldo: "10000000000000.00"
            }
            ]
        }).as('saldo')
        cy.login('neto@neto.com', '12345')    
       // cy.resetApp()
        
    })

    beforeEach(() =>{
        cy.get(loc.MENU.HOME).click()
        
    })


    it('Create an account', () => {
        cy.route({
           method: 'GET',
           url:'/contas',
           response:[
            {
                id: 1,
                nome: "Carteira",
                visivel: true,
                usuario_id: 1
            },
            {
                id: 2,
                nome: "bancos",
                visivel: true,
                usuario_id: 1
            }
            ] 
        }).as('contas')

        cy.route({
            method:'POST',
            url:'/contas',
            response:{
                id:3,
                nome:"Conta de teste",
                visivel:true,
                usuario_id:1
            }
        })

       cy.acessarMenuConta()

       cy.route({
        method: 'GET',
        url:'/contas',
        response:[
         {
             id: 1,
             nome: "Carteira",
             visivel: true,
             usuario_id: 1
         },
         {
             id: 2,
             nome: "bancos",
             visivel: true,
             usuario_id: 1
         },
         {
            id:3,
            nome:"Conta de teste",
            visivel:true,
            usuario_id:1
        }
         ] 
     }).as('contasSave')
       cy.inserirConta('Conta de teste')

        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
    });

    it.only('Should update an account', () => {
        cy.route({
            method: 'GET',
            url:'/contas',
            response:[
             {
                 id: 1,
                 nome: "Carteira",
                 visivel: true,
                 usuario_id: 1
             },
             {
                 id: 2,
                 nome: "bancos",
                 visivel: true,
                 usuario_id: 1
             }
             ] 
         }).as('contas')

         cy.route({
            method:'PUT',
            url:'/contas/**',
            response: {
                id:1,
                nome:"Conta alterada",
                visivel:true,
                usuario_id:1
            }
         })
       // const dataHoraBrasil = new Date();
       // const dataHoraUtc = new Date(dataHoraBrasil.getTime() + (dataHoraBrasil.getTimezoneOffset() * 60000));

        cy.acessarMenuConta()
        cy.xpath(loc.CONTA.FN_XP_BTN_ALTERAR('Carteira')).click()
        cy.get(loc.CONTA.NOME)
        .clear()
        .type('Conta alterada')
        cy.route({
            method: 'GET',
            url:'/contas',
            response:[
             {
                 id: 1,
                 nome: "Conta alterada",
                 visivel: true,
                 usuario_id: 1
             },
             {
                 id: 2,
                 nome: "bancos",
                 visivel: true,
                 usuario_id: 1
             }
             ] 
         }).as('contas')
        cy.get(loc.CONTA.BTN_SALVAR_CONTA).click()
        cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso!')
        
    });

    it('Should not create an account with same name', () => {
        cy.acessarMenuConta()

        cy.get(loc.CONTA.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTA.BTN_SALVAR_CONTA).click()
        cy.get(loc.MESSAGE).should('contain', 'code 400')
    });

    it('Should create a transaction', () => {
        cy.get(loc.MENU.MOVIMENTACAO).click()
        cy.get(loc.MOVIMENTO.DESCRICAO).type('Desc')
        cy.get(loc.MOVIMENTO.VALOR).type('123')
        cy.get(loc.MOVIMENTO.INTERESSADO).type('Int')
        cy.get(loc.MOVIMENTO.CONTA_MOV).select('Conta para movimentacoes')
        cy.get(loc.MOVIMENTO.BNT_STATUS).click()
        cy.get(loc.MOVIMENTO.BNT_MOV).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    });


    it('Should get Balance', () => {
        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Conta para saldo')).should('contain', '534,00')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
        cy.wait(1000)
        cy.get(loc.MOVIMENTO.BNT_STATUS).click()
        cy.wait(1000)
        cy.get(loc.MOVIMENTO.BNT_MOV).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
        cy.get(loc.MOVIMENTO.BNT_MOV).click()

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Conta para saldo')).should('contain', '4.034,00')

    });

    it('Should remove a transaction', () => {
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    });
})