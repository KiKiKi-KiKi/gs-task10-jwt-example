const user = {
  user: 'staff',
  pwd: 'staff',
  roles: [{
    role: 'readWrite',
    db: 'MyApp'
  }]
};

db.createUser(user);
