const Item = require('../models/item');
const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
  const [numCategories, numItems] = await Promise.all([
    Category.countDocuments({}).exec(),
    Item.countDocuments({}).exec(),
  ]);

  res.render('index', {title: "Fresh & Convenient: Your Online Grocery Destination!", numCategories, numItems });
});

exports.item_list = asyncHandler(async (req, res) => {
  const items = await Item.find({}).populate("category").exec();
  res.render("item_list", {items});
});

exports.item_detail = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.render("item_detail", {item});
});

exports.item_create_get = asyncHandler(async (req, res) => {

  const categories = await Category.find({});
  res.render("item_create", {title: "Create item", categories});
});

exports.item_create_post = [
  (req, res, next) => {
    // Convert 'isFeatured' checkbox value
    req.body.isFeatured = req.body.isFeatured ? true : false;
    next();
  },
  // Validate and sanitize input fields using express-validator
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
      .isMongoId()
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
    .toDate(), // Convert to Date object

  body('isFeatured')
    .optional(),

  body('tags')
    .optional(),

  // Route handler function
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Fetch categories again in case of error
        const categories = await Category.find();
        // Render the form again with error messages
        res.render('item_create', {
            title: 'Create Item',
            categories,
            item: req.body, // Include submitted data to refill the form
            errors: errors.array()
        });
    } else {
        // Handling tags conversion to an array if they come as a single string or undefined
        if (typeof req.body.tags === 'string') {
            req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
        } else if (typeof req.body.tags === 'undefined') {
            req.body.tags = [];
        }

        // If no errors, proceed to save the new item
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            numberInStock: req.body.numberInStock,
            brand: req.body.brand,
            weight: req.body.weight,
            expirationDate: req.body.expirationDate,
            isFeatured: req.body.isFeatured,
            tags: req.body.tags
        });

        const savedItem = await item.save();
        res.redirect(savedItem.url); // Ensure your Item model's virtual 'url' property is correctly defined
    }
  })
];

exports.item_delete_get = (req, res, next) => {
    res.render('item_delete', {itemId: req.params.id});
}

exports.item_delete_post = asyncHandler(async (req, res) => {
    const item = await Item.findByIdAndDelete(req.params.id);
    res.redirect('/items');
});

exports.item_update_get = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (item === null){
      const err = new Error("Category not Found");
      err.status = 404;
      return next(err);
    }

    const categories = await Category.find({});
    res.render('item_create', {title: "Update item", categories})
});

exports.item_update_post = [
  (req, res, next) => {
    // Convert 'isFeatured' checkbox value
    req.body.isFeatured = req.body.isFeatured ? true : false;
    next();
  },
  // Validate and sanitize input fields using express-validator
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
      .isMongoId()
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
    .toDate(), // Convert to Date object

  body('isFeatured')
    .optional(),

  body('tags')
    .optional(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const item = {
      id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      brand: req.body.brand,
      weight: req.body.weight,
      expirationDate: req.body.expirationDate,
      isFeatured: req.body.isFeatured,
      tags: req.body.tags
    }

    if (!errors.isEmpty()){
        res.render("item_create", {title: "Update item", category, errors: errors.array()});
        return;
    } else {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {})
        res.redirect(updatedItem.url);
    }
  })  
]