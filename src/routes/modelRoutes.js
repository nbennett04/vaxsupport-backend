const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addModel ,updateModel,deleteModel,getModels,activateModel} = require('../controllers/modelController');

const router = express.Router();

// router.post('/add', authMiddleware, addModel); // Route to add a new model
router.post('/add', addModel); // Route to add a new model
router.get('/all', getModels); // Route to get all models
router.put('/:id', updateModel); // Route to update a model by ID
router.delete('/:id', deleteModel); // Route to delete a model by ID
router.post('/activate/:id', activateModel); // Route to activate a model by ID
module.exports = router;