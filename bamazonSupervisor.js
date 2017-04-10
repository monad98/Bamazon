//import modules
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');
const Rx = require('rx');
require('console.table');

// import questions 
const questions = require('./questions').questionsForSupervisor;
let connection;

const mysqlPromise = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'monad',
    password: '9A?*&?nYPs',
    database: 'Bamazon'
  })
  .then(conn => {
    connection = conn;
  });


//questions stream
const questions$ = new Rx.BehaviorSubject(questions.selectMenu);

//answer$ stream is only available after the connection to mysql server made.
const answers$ = Rx.Observable.fromPromise(mysqlPromise)
  .flatMap(() => inquirer.prompt(questions$).ui.process)
  .share();

/**
 * View Product Sales by Department
 */
const fixNumber = p => Object.assign(p, {
  total_sales: p.total_sales.toFixed(2),
  total_profit: p.total_profit.toFixed(2)
});
const productSales$ = answers$
  .filter(ans => ans.answer === 'viewProductSales')
  .flatMap(() =>
    Rx.Observable.fromPromise(connection.execute('SELECT *, (total_sales - over_head_costs) as total_profit FROM `departments`'))
    .map(results => results[0])
    .map(profits => profits.map(fixNumber))
    .do(profits => console.table(profits))
  );

/**
 * Create New Department
 */
const createAnswerSub = answers$
  .filter(ans => ans.answer === 'createNewDep')
  .subscribe(() => questions$.onNext(questions.askDepartmentName));

const createDep$ = answers$
  .filter(ans => ans.name === 'askDepartment')
  .map(ans => ans.answer)
  .map(departmentStr => departmentStr.split(',').map(d => d.trim()))
  .flatMap(([depName, overheadCosts]) => 
    Rx.Observable.fromPromise(
      connection.execute('INSERT INTO `departments` SET department_name = ?, over_head_costs = ?',
    [depName, overheadCosts])
    )
    .catch(err => Rx.Observable.throw(err))
    .do(() => console.log('\nNew Department created!\n'))
  );


/**
 * subscribe
 */
const firstQuestion = () => questions$.onNext(questions.selectMenu);
const sub = Rx.Observable.merge(productSales$, createDep$)
  .subscribe(firstQuestion);

