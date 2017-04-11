const questionsForCustomer = {
  askId: {
    name: 'askId',
    message: 'Enter ID of the product to order:',
  },
  askQuantity: {
    name: 'askQuantity',
    message: 'How many units do you want to buy?:',
  }
};


const questionsForManager = {
  selectMenu: {
    type: 'list',
    name: 'selectMenu',
    message: 'What do you want to do?',
    choices: [{
        name: 'View Products for Sale',
        value: 'productList',
      },
      {
        name: 'View Low Inventory',
        value: 'lowInventory'
      },
      {
        name: 'Add to Inventory',
        value: 'askInventoryAdd'
      },
      {
        name: 'Add New Product',
        value: 'askNewProductDepartment'
      }
    ]
  },
  askNewProductDepartment: {
    type: 'list',
    name: 'newProductDep',
    message: 'Select a department.',
    choices: [], //dynamically filled
    pageSize: 15
  },
  askInventoryAdd: {
    name: 'askInventoryAdd',
    message: 'Enter ID and quantity of the product to add separated by comma. ex) 10, 250\n  :',
  },
  askNewProduct: {
    name: 'askNewProduct',
    message: 'Enter a new product name, price and stock quantity seperated by comma.\n ex) SAMSUNG S8000 JET, 1399.00, 1000\n  :'
  }
};

const questionsForSupervisor = {
  selectMenu: {
    type: 'list',
    name: 'selectMenu',
    message: 'What do you want to do?',
    choices: [
      {
        name: 'View Product Sales by Department',
        value: 'viewProductSales'
      },
      {
        name: 'Create New Department',
        value: 'createNewDep'
      }
    ]
  },
  askDepartmentName: {
    name: 'askDepartment',
    message: 'Enter a new department name and over head costs separated by comma.\n  ex) Clothing, 10000\n  :'
  }
};

module.exports = {
  questionsForCustomer,
  questionsForManager,
  questionsForSupervisor
}