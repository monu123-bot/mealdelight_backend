const express = require('express')
const bodyParser = require('body-parser')
const {AddMenu,Login,Register,GetMenu,addPlan,getPlans, DeletePlan, EditPlan,getWeeklyMenus,editWeeklyMenu,deleteWeeklyMenu,GetWalletTransactions,UpdateClaimStatus,getUsers,getTransactionOrders,getUserActivityHistory,getSpecificDateReport} = require('../Controller/Admin')
const { adminAuth } = require('../Middleware/adminAuth')
// const { userAuth } = require('../Middleware/userAuth')

// const {} = require('../middleware/Auth')
// const passport = require('passport');

const AdminRouter = express.Router()
const jsonparser = bodyParser.json()
AdminRouter.post("/addmenu",adminAuth,AddMenu)
AdminRouter.post("/login",Login)
AdminRouter.post("/register",Register)
AdminRouter.get("/getMenu",adminAuth,GetMenu)
AdminRouter.post("/addplan",adminAuth,addPlan)
AdminRouter.get("/getPlans",adminAuth,getPlans)
AdminRouter.put('/editPlan/:id', adminAuth, EditPlan);
AdminRouter.delete('/deletePlan/:id', adminAuth, DeletePlan);
AdminRouter.get('/getWeeklyMenus', adminAuth, getWeeklyMenus);
AdminRouter.put('/editWeeklyMenu/:id', adminAuth, editWeeklyMenu);
AdminRouter.delete('/deleteWeeklyMenu/:id', adminAuth, deleteWeeklyMenu);
AdminRouter.get("/wallettransactions",adminAuth,GetWalletTransactions);
AdminRouter.post('/updateClaimStatus', adminAuth, UpdateClaimStatus);
AdminRouter.post('/getUsers', adminAuth, getUsers);
AdminRouter.post('/getTransactionOrders', adminAuth, getTransactionOrders);
AdminRouter.get('/getCustomerActivity', adminAuth, getUserActivityHistory);
AdminRouter.post('/getSpecificDateReport', adminAuth, getSpecificDateReport);
// AdminRouter.post('/getTransactionOrders', adminAuth, getTransactionOrders);

module.exports = AdminRouter