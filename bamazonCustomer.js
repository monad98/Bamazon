// import modules 
const inquirer = require('inquirer');
const Rx = require('rx');

// import questions 
const questions = require('./questions').questionsForCustomer;

//init mysql
const mysqlPromise = require('./mysql-promise');
let connection;
mysqlPromise.then(conn => connection = conn);


//questions stream
const questions$ = new Rx.BehaviorSubject(questions.askId);

//answer$ stream is only available after the connection to mysql server made.
const answers$ = Rx.Observable.fromPromise(mysqlPromise)
  .flatMap(() => inquirer.prompt(questions$).ui.process)
  .share();


/**
 * Order stream
 */
const id$ = answers$
  .filter(ans => ans.name === 'askId')
  .map(ans => ans.answer)

const quantity$ = answers$
  .filter(ans => ans.name === 'askQuantity')
  .map(ans => ans.answer);

const product$ = id$
  .flatMapLatest(id =>
    Rx.Observable.fromPromise(connection.execute('SELECT * FROM `products` WHERE item_id = ?', [id]))
    .map(results => results[0][0])
    .do(product => console.log('You selected ' + product.product_name + '. The price is $' + product.price.toFixed(2) + '.'))
    .do(() => questions$.onNext(questions.askQuantity))
    .catch(err => Rx.Observable.throw(err))
  );

const order$ = Rx.Observable.zip(product$, quantity$)
  .flatMapLatest(([product, quantity]) => {
    if (product.stock_quantity > quantity) {
      return Rx.Observable
        .fromPromise(
          connection.execute('UPDATE `products`, `departments` SET `products`.`stock_quantity` = ?,' 
          + ' `products`.`product_sales` = `products`.`product_sales` + ?, ' 
          + '`departments`.`total_sales` = `departments`.`total_sales` + ? ' 
          + 'WHERE `products`.`item_id` = ? AND `departments`.`department_id` = ?', [
          product.stock_quantity - quantity,
          product.price * quantity,
          product.price * quantity,
          product.item_id,
          product.department_id
        ]))
        .map(() => product.price * quantity) //success for update
    } else return Rx.Observable.of(0) //can't order 
  });


/**
 * Subscription
 */
order$.subscribe(cost => {
  if(cost) console.log('\nYour order is placed. Total Cost is $' + cost.toFixed(2) + '\n');
  else console.log('\nInsufficient quantity!\n');
  questions$.onNext(questions.askId);
});
