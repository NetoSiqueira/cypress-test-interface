/// <reference types="cypress"/>

import loc from '../../support/locators'
import '../../support/commandsContas'
import buildEnv from '../../support/buildEnv'

describe('Should test at a funcional level', () =>{

    after(()=>{
        cy.clearLocalStorage()
    })

    beforeEach(() =>{
        buildEnv()
        cy.login('neto@neto.com', '12345') 
        cy.get(loc.MENU.HOME).click()
        // cy.resetApp()
    })


    it('Create an account', () => {
        cy.route({
            method:'POST',
            url:'/contas',
            response:{
                id:3,
                nome:"Conta de teste",
                visivel:true,
                usuario_id:1
            }
        }).as('saveContas')

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

    it('Should update an account', () => {
      
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
        cy.route({
            method:'POST',
            url:'/contas',
            response:{
                error: "Ja existe uma conta com esse nome!"
            },
            status: 400
        }).as('saveContasMesmoNome')

        cy.acessarMenuConta()

        cy.get(loc.CONTA.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTA.BTN_SALVAR_CONTA).click()
        cy.get(loc.MESSAGE).should('contain', 'code 400')
    });

    it('Should create a transaction', () => {
        cy.route({
            method:'POST',
            url:'/transacoes',
            response:{
                id: 1885514,
                descricao: "dqqwewq",
                envolvido: "dasdasdas",
                observacao: null,
                tipo: "REC",
                data_transacao: "2024-01-10T03:00:00.000Z",
                data_pagamento: "2024-01-10T03:00:00.000Z",
                valor: "232323.00",
                status: false,
                conta_id: 2010514,
                usuario_id: 35269,
                transferencia_id: null,
                parcelamento_id: null
            }
        })

        cy.route({
            method: 'GET',
            url:'/extrato/**',
            response:'fixture:movimentacaoSalva'
         })

        cy.get(loc.MENU.MOVIMENTACAO).click()
        cy.get(loc.MOVIMENTO.DESCRICAO).type('Desc')
        cy.get(loc.MOVIMENTO.VALOR).type('123')
        cy.get(loc.MOVIMENTO.INTERESSADO).type('Int')
        cy.get(loc.MOVIMENTO.CONTA_MOV).select('bancos')
        cy.get(loc.MOVIMENTO.BNT_STATUS).click()
        cy.get(loc.MOVIMENTO.BNT_MOV).click()

        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    });


    it('Should get Balance', () => {
        cy.route({
            method: 'GET',
            url:'/transacoes/**',
            response:{
                "conta": "Conta para saldo",
                "id": 1885517,
                "descricao": "Movimentacao 1, calculo saldo",
                "envolvido": "CCC",
                "observacao": null,
                "tipo": "REC",
                "data_transacao": "2024-01-10T03:00:00.000Z",
                "data_pagamento": "2024-01-10T03:00:00.000Z",
                "valor": "3500.00",
                "status": false,
                "conta_id": 2011571,
                "usuario_id": 35269,
                "transferencia_id": null,
                "parcelamento_id": null
            }
        })
        cy.route({
            method: 'PUT',
            url:'/transacoes/**',
            response:{
                "conta": "Conta para saldo",
                "id": 1885517,
                "descricao": "Movimentacao 1, calculo saldo",
                "envolvido": "CCC",
                "observacao": null,
                "tipo": "REC",
                "data_transacao": "2024-01-10T03:00:00.000Z",
                "data_pagamento": "2024-01-10T03:00:00.000Z",
                "valor": "3500.00",
                "status": false,
                "conta_id": 2011571,
                "usuario_id": 35269,
                "transferencia_id": null,
                "parcelamento_id": null
            }
        })

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '100,00')

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

        cy.route({
            method:'GET',
            url: '/saldo',
            response: [{
                conta_id: 999,
                conta: "Carteira",
                saldo: "4034.00"
            },
            {
                conta_id: 9909,
                conta: "Conta falsa 2",
                saldo: "10000000000000.00"
            }
            ]
        }).as('saldoFinal')
        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '4.034,00')

    });

    it('Should remove a transaction', () => {
        cy.route({
            method: 'DELETE',
            url:'/transacoes/**',
            response:{},
            status: 204
        }).as('del')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    });


    it('Should validate data send to create an account', () => {
       
        const reqStub = cy.stub()

        cy.route({
            method:'POST',
            url:'/contas',
            response:{
                id:3,
                nome:"Conta de teste",
                visivel:true,
                usuario_id:1
            },
           // onRequest: req => {
            //    expect(req.request.body.nome).to.be.empty
           //     expect(req.request.headers).to.be.have.property('Authorization')
           // }
           onRequest: reqStub
        }).as('saveContas')

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

       cy.inserirConta('{CONTROL}')
       //cy.wait('@saveContas').its('request.body.nome').should('not.be.empty')
       cy.wait('@saveContas').then(() =>{
        expect(reqStub.args[0][0].request.body.nome).to.be.empty
        expect(reqStub.args[0][0].request.headers).to.be.have.property('Authorization')
       })
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
    });

    it('Should test the reponsiveness', () => {
        cy.get('[data-test=menu-home]').should('exist').and('be.visible')
        cy.viewport('iphone-5')
        cy.get('[data-test=menu-home]').should('exist').and('be.not.visible')
    });
})