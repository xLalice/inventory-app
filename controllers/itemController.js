const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const pool = require("../db/pool")

exports.index = asyncHandler(async (req, res, next) => {
  const [numCategoriesResult, numItemsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM categories'),
      pool.query('SELECT COUNT(*) FROM items')
  ]);

  const numCategories = parseInt(numCategoriesResult.rows[0].count);
  const numItems = parseInt(numItemsResult.rows[0].count);

  res.render('index', {
      title: "Fresh & Convenient: Your Online Grocery Destination!",
      numCategories,
      numItems
  });
});


exports.item_list = asyncHandler(async (req, res) => {
    const result = await pool.query(`
      SELECT 
        items.id AS id,
        items.name AS name,
        items.description,
        items.category_id,
        items.price,
        items.number_in_stock,
        items.brand,
        items.weight,
        items.expiration_date,
        items.is_featured,
        items.tags,
        categories.name AS category_name
      FROM items
      JOIN categories ON categories.id = items.category_id
    `);
  
    console.log(result.rows);
    res.render('item_list', { items: result.rows });
  });
  


exports.item_detail = asyncHandler(async (req, res) => {
    const itemId = req.params.id;
    console.log(itemId)
    const itemResult = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
    const item = itemResult.rows[0];
    res.render('item_detail', { item, itemId });
});


exports.item_create_get = asyncHandler(async (req, res) => {
  const categoriesResult = await pool.query('SELECT * FROM categories');
  res.render('item_create', { title: 'Create Item', categories: categoriesResult.rows });
});


exports.item_create_post = [
    (req, res, next) => {
        console.log('Received form data:', req.body);
        req.body.isFeatured = req.body.isFeatured ? true : false;
        next();
      },
  // Validate and sanitize input fields
  body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters long')
      .escape(),

  body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long')
      .escape(),

  body('category')
      .isNumeric()
      .withMessage('Invalid category ID'),

  body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),

  body('numberInStock')
      .isInt({ min: 0 })
      .withMessage('Number in stock must be a non-negative integer'),

  body('brand')
      .optional()
      .trim()
      .escape(),

  body('weight')
      .optional()
      .trim()
      .escape(),

  body('expirationDate')
      .optional()
      .isISO8601()
      .toDate(),

  body('isFeatured')
      .optional(),

  body('tags')
      .optional(),

  asyncHandler(async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
          const categoriesResult = await pool.query('SELECT * FROM categories');
          res.render('item_create', {
              title: 'Create Item',
              categories: categoriesResult.rows,
              item: req.body,
              errors: errors.array()
          });
      } else {
          if (typeof req.body.tags === 'string') {
              req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
          } else if (typeof req.body.tags === 'undefined') {
              req.body.tags = [];
          }

          const result = await pool.query(
              `INSERT INTO items (name, description, category_id, price, number_in_stock, brand, weight, expiration_date, is_featured, tags)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
              [req.body.name, req.body.description, req.body.category, req.body.price, req.body.numberInStock, req.body.brand, req.body.weight, req.body.expirationDate, req.body.isFeatured, req.body.tags]
          );
          const newItemId = result.rows[0].id;
          res.redirect(`/item/${newItemId}`);
      }
  })
];


exports.item_delete_get = (req, res, next) => {
  res.render('item_delete', { itemId: req.params.id });
};


exports.item_delete_post = asyncHandler(async (req, res) => {
  const itemId = req.params.id;
  await pool.query('DELETE FROM items WHERE id = $1', [itemId]);
  res.redirect('/items');
});


exports.item_update_get = asyncHandler(async (req, res) => {
  const itemId = req.params.id;
  const itemResult = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
  const item = itemResult.rows[0];
  
  if (!item) {
      const err = new Error("Item not Found");
      err.status = 404;
      return next(err);
  }

  const categoriesResult = await pool.query('SELECT * FROM categories');
  res.render('item_create', { title: 'Update Item', categories: categoriesResult.rows, item });
});


exports.item_update_post = [
  (req, res, next) => {
      req.body.isFeatured = req.body.isFeatured ? true : false;
      next();
  },
  // Validate and sanitize input fields
  body('name')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Name must be at least 3 characters long')
      .escape(),

  body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long')
      .escape(),

  body('category')
      .isNumeric()
      .withMessage('Invalid category ID'),

  body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),

  body('numberInStock')
      .isInt({ min: 0 })
      .withMessage('Number in stock must be a non-negative integer'),

  body('brand')
      .optional()
      .trim()
      .escape(),

  body('weight')
      .optional()
      .trim()
      .escape(),

  body('expirationDate')
      .optional()
      .isISO8601()
      .toDate(),

  body('isFeatured')
      .optional(),

  body('tags')
      .optional(),

  asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
          const categoriesResult = await pool.query('SELECT * FROM categories');
          res.render("item_create", {
              title: "Update Item",
              categories: categoriesResult.rows,
              item: req.body,
              errors: errors.array()
          });
          return;
      }

      if (typeof req.body.tags === 'string') {
          req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
      } else if (typeof req.body.tags === 'undefined') {
          req.body.tags = [];
      }

      await pool.query(
          `UPDATE items SET name = $1, description = $2, category_id = $3, price = $4, number_in_stock = $5, brand = $6, weight = $7, expiration_date = $8, is_featured = $9, tags = $10
          WHERE id = $11 RETURNING id`,
          [req.body.name, req.body.description, req.body.category, req.body.price, req.body.numberInStock, req.body.brand, req.body.weight, req.body.expirationDate, req.body.isFeatured, req.body.tags, req.params.id]
      );
      res.redirect(`/item/${req.params.id}`);
  })
];
