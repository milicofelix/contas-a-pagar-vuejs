Vue.filter('doneLabel', function (value) {
    return (value == 1) ? 'Paga' : 'Não Paga';
});

Vue.filter('statusGeral', function (value) {
    if(value === false){
        return 'Nenhuma conta cadastrada!';
    }
    if(!value){
        return 'Nenhuma conta a pagar!';
    }
    else {
        return 'Existem '+value+' contas a pagar!';
    }
});

var menuComponet = Vue.extend({
    template: `
                <nav>
                    <ul>
                        <li v-for="o in menu">
                            <a href="javascript:void(0)" v-on:click.prevent="showView(o.id)">{{o.nome}}</a>
                        </li>
                    </ul>
                </nav>
    `,

    data: function () {
        return {
            menu: [
                {id: 1, nome: "Listar Contas"},
                {id: 2, nome: "Criar Conta"}
            ]
        };
    },
    methods: {
        showView: function (id) {
            this.$parent.activedView = id;
            if(id == 2){
                this.$parent.formType = "insert";
            }
        }
    }
});

var billsListComponent = Vue.extend({
    template : `
                <table border="0" cellpadding="10">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Vencimento</th>
                        <th>Nome</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr :class="{'linha_pago':o.done, 'linha_nao-pago': !o.done}" v-for="(i, o) in bills">
                        <td>{{i+1}}</td>
                        <td>{{o.date_due}}</td>
                        <td>{{o.name}}</td>
                        <td>{{o.value | currency 'R$ ' 2 }}</td>
                        <!--<td>{{o.done > 0 ? "Pago" : "Pendente"}}</td>-->
                        <td :class="{'pago':o.done, 'nao-pago': !o.done}">{{o.done | doneLabel }}</td>
                        <td>
                            <a href="#" @click.prevent="loadBill(o)">Editar</a>
                            <a href="#" @click.prevent="deleteBill(i)">Excluir</a>
                        </td>
                    </tr>
            
                    </tbody>
                </table>
    `,
    data: function () {

        return {
            bills: [
                {date_due: "10/01/2020", name: "Conta de luz", value: 174.48, done: true},
                {date_due: "08/01/2020", name: "Conta de água", value: 237.98, done: true},
                {date_due: "15/01/2020", name: "Conta de telefone", value: 35.67, done: false},
                {date_due: "05/01/2020", name: "Supermercado", value: 560.00, done: false},
                {date_due: "09/01/2020", name: "Cartão de crédito", value: 3000.00, done: false},
                {date_due: "07/01/2020", name: "Empréstimo", value: 800.00, done: false},
                {date_due: "05/01/2020", name: "Combustível", value: 300.00, done: false}
            ],
        };

    },
    methods: {

        loadBill: function (bill) {
            this.$parent.bill = bill;
            this.$parent.activedView = 2;
            this.$parent.formType = "update";
        },
        deleteBill: function (index) {
            if(confirm('Deseja remover este item?')) {
                this.bills.splice(index,1);
            }
        }

    }
});

var billCreateComponent = Vue.extend({

    template: `
                <form name="form" @submit.prevent="submit" method="post">
                    <label for="vencimento">Vencimento: </label>
                    <input type="text" name="vencimento" v-model="bill.date_due"><br><br>
                    <label for="nome">Nome: </label>
                    <select name="nome" v-model="bill.name">
                        <option v-for="o in names" :value="o">{{o}}</option>
                    </select><br><br>
                    <label for="valor">Valor</label>
                    <input type="text" name="valor" v-model="bill.value"><br><br>
                    <label for="status">Pago?</label>
                    <input type="checkbox" name="status" v-model="bill.done"><br><br>
                    <input type="submit" value="Cadastrar">
                </form>
    
    `,

    props: ['bill','formType'],

    data: function () {

        return {

            bill: {
                date_due: "",
                name: "",
                value: 0,
                done: false
            },
            names:[
                "Conta de luz",
                "Conta de água",
                "Conta de telefone",
                "Supermercado",
                "Cartão de crédito",
                "Empréstimo",
                "Combustível"
            ]

        };

    },
    methods: {
        submit: function () {
            if(this.formType == "insert"){

                this.$parent.$refs.billListComponent.bills.push(this.bill);
            }
            this.bill = {
                date_due: "",
                name: "",
                value: 0,
                done: false
            };
            this.$parent.activedView = 1;
        }
    }

});

var appComponent = Vue.extend({
    components : {

        'menu-component': menuComponet,
        'bills-list-component': billsListComponent,
        'bill-create-component': billCreateComponent
    },
    template: `
                <style>
                    .linha_pago {
                        background: green;
                    }
                    .linha_nao-pago {
                        background: red;
                    }
                    .pago {
                        color: white;
                    }
                    .nao-pago {
                        color: yellow;
                    }
                    .gray {
                        color: gray;
                    }
                    .green {
                        color: green;
                    }
                    .red {
                        color: red;
                    }
                </style>
                 <h1>{{ title }}</h1>
                <h3 :class="{'gray':status === false, 'green': status === 0, 'red': status > 0}">
                    {{ status | statusGeral}}
                </h3>
                <menu-component></menu-component>
                
                <div v-show="activedView == 1">              
                    <bills-list-component v-ref:bill-list-component ></bills-list-component>              
                </div>
                
                <div v-show="activedView == 2">
                    <bill-create-component :bill.sync="bill" :form-type="formType"></bill-create-component>     
                </div>
    `,
    data: function () {

        return {
            title: "Contas a pagar",
            activedView: 1,
            formType : "insert",
            bill: {
            date_due: "",
            name: "",
            value: 0,
            done: false
        }
        };
    },
    computed:{
        status: function() {
            var billListComponent = this.$refs.billListComponent;
            if(!billListComponent.bills.length){
                return false;
            }
            var count = 0;
            for(var i in billListComponent.bills){
                if(!billListComponent.bills[i].done){
                    count++;
                }
            }

            return count;
        }
    }

});

Vue.component('app-component', appComponent);

var app = new Vue({
    el: "#app"
});