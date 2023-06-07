'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [{
      fullname: 'Zainur Rouf',
      username: 'zainur',
      email: "zainur@gmail.com",
      password: "123",
      is_verified:null,
      user_image:null,
      role:"user",
      verify_token: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullname: 'Asep Angga Ihza Sukarya',
      username: 'asep',
      email: "Asep@gmail.com",
      password: "123",
      is_verified:true,
      user_image:null,
      role:"user",
      verify_token: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullname: 'Adii',
      username: 'adi',
      email: "adi@gmail.com",
      password: "123",
      is_verified:true,
      user_image:null,
      role:"user",
      verify_token: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullname: 'Admin',
      username: 'admin',
      email: "admin@gmail.com",
      password: "123",
      is_verified:true,
      user_image:null,
      role:"admin",
      verify_token: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullname: 'Admin Warehouse 1',
      username: 'adminW1',
      email: "adminW1@gmail.com",
      password: "123",
      is_verified:true,
      user_image:null,
      role:"adminWarehouse",
      verify_token: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      fullname: 'Admin Warehouse 2',
      username: 'adminW2',
      email: "adminW2@gmail.com",
      password: "123",
      is_verified:true,
      user_image:null,
      role:"adminWarehouse",
      verify_token: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});

  }
};