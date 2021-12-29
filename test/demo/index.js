const student = require('./model/student');
const test_table = require('./model/test_table');

student.create({
  name: 'name2',
  age: 10,
  class: 'class2'
});

test_table.create({
  name: 'name1',
});