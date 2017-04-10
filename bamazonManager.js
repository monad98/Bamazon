//import modules
const mysql = require('mysql2/promise');
const inquirer = require('inquirer');
const Rx = require('rx'); // dependency of inquirer
require('console.table');

// import questions 
const questions = require('./questions').questionsForManager;

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
 * Product List and Low Inventory List
 */
const productListAnswerSub = 
  answers$
    .filter(ans => ans.answer === 'askInventoryAdd' || ans.answer === 'askNewProduct')
    .subscribe(ans => questions$.onNext(questions[ans.answer]));

const productList$ = answers$
  .filter(ans => ans.answer === 'productList')
  .flatMap(() => productList());

const lowInventory$ = answers$
  .filter(ans => ans.answer === 'lowInventory')
  .flatMap(() => productList(5));

const productList = stkQty => {
  //inner join
  const query = 'SELECT item_id, product_name, department_name, price, stock_quantity, product_sales ' 
  + 'FROM `products` p INNER JOIN `departments` d ON p.`department_id` = d.`department_id`'
  + (stkQty ? ' WHERE `stock_quantity` < 5' : '');
  return Rx.Observable
    .fromPromise(connection.execute(query))
    .catch(err => Rx.Observable.throw(err))
    .map(results => results[0])
    .do(products => console.table(products.map(p => Object.assign(p, {price: p.price.toFixed(2), product_sales: p.product_sales.toFixed(2)}))))
};


/**
 * ADD TO INVENTORY
 */
const inventoryAdd$ = answers$
  .filter(ans => ans.name === 'askInventoryAdd')
  .map(ans => ans.answer.split(',').map(x => x.trim())) // id and qty
  .flatMap(([id, qty]) => inventoryAdd(id, qty));


const inventoryAdd = (id, qty) => {
  return Rx.Observable
    .fromPromise(connection.execute('UPDATE `products` SET stock_quantity = stock_quantity + ? WHERE item_id = ?', [qty, id]))
    .catch(err => Rx.Observable.throw(err))
    .do(() => console.log('\nStock Quantity Increased by ' + qty + '.\n'))
};

/**
 * ADD NEW PRODUCT
 */

//ask product info after user enter department name(id);
const departmentIdAnswerSub = answers$
  .filter(ans => ans.name === 'newProductDep')
  .subscribe(() => questions$.onNext(questions.askNewProduct));

//helper function to convert departments array to inquirer's choices array
const convertDepToDepChoices = departments => departments.map(d => ({name: d.department_name, value: d.department_id}));

//helper function to send product list query
const newProduct = ({name, dep_id, price, qty}) => {
  return Rx.Observable
    .fromPromise(connection.execute(`INSERT INTO \`products\` SET product_name='${name}', department_id='${dep_id}', price='${price}', stock_quantity='${qty}'`))
    .catch(err => Rx.Observable.throw(err))
    .do(_ => console.log('\nNew Product Added!\n'));    
}
//push product Department select list question
answers$.filter(ans => ans.answer === 'askNewProductDepartment')
  .flatMap(() =>
    Rx.Observable.fromPromise(connection.execute('SELECT `department_id`, `department_name` FROM `departments`'))
      .catch(err => Rx.Observable.throw(err))
      .map(results => results[0])
  )
  .map(convertDepToDepChoices)
  .subscribe(choices => questions$.onNext(Object.assign({}, questions.askNewProductDepartment, {choices})));

//department id stream (when user select department name)
const newProductDepartmentId$ = answers$
  .filter(ans => ans.name === 'newProductDep')
  .map(ans => ans.answer) // department_id

//new product infomation user enter. without department id
const newProductWithoutDepId$ = answers$
  .filter(ans => ans.name === 'askNewProduct')
  .map(ans => ans.answer.split(',').map(x => x.trim())) // name, department, price, qty

//new product stream (department id + product info)
const newProduct$ = Rx.Observable.zip(newProductDepartmentId$,newProductWithoutDepId$)
  .flatMap(([dep_id, [name, price, qty]]) => newProduct({name, dep_id, price, qty}))


/**
 * Subscribe
 */
const firstQuestion = () => questions$.onNext(questions.selectMenu);
const subscribe = Rx.Observable
  .merge(productList$, lowInventory$, inventoryAdd$, newProduct$)
  .subscribe(firstQuestion);
