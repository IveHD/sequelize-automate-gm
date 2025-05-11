const student = require('./model/student');
// const test_table = require('./model/test_table');

// student.create({
//   name: 'name3',
//   age: 10,
//   class: 'class2'
// });

student.findAll().then(res => {
  console.log(res);
});

// test_table.create({
//   name: 'name1',
// });