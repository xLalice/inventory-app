const express = require('express');
const router = express.Router();
const upload = require("../config/upload")


// Require controller modules.
const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

// Category Routes
router.get("/", item_controller.index);

router.get("/categories", category_controller.category_list);

router.get("/category/:id", category_controller.category_detail);

router.get("/categories/create", category_controller.category_create_get);

router.post("/categories/create", upload.single('image'), category_controller.category_create_post);

router.get("/category/:id/delete", category_controller.category_delete_get);
router.post("/category/:id/delete", category_controller.category_delete_post);

router.get("/category/:id/update", category_controller.category_update_get);
router.post("/category/:id/update", category_controller.category_update_post);


// Item Routes
router.get("/items", item_controller.item_list);

router.get("/item/:id", item_controller.item_detail);

router.get("/items/create", item_controller.item_create_get);
router.post("/items/create", item_controller.item_create_post);

router.get("/item/:id/delete", item_controller.item_delete_get);
router.post("/item/:id/delete", item_controller.item_delete_post);

router.get("/item/:id/update", item_controller.item_update_get);
router.post("/item/:id/update", item_controller.item_update_post);

module.exports = router;

