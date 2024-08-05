const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const pool = require('../db/pool');

exports.category_list = asyncHandler(async (req, res) => {
    pool.query("SELECT * FROM categories", (error, results) => {
        if (error){
            console.error("Error fetching categories", error.stack);
            res.render("error", {error: error})
        }
        res.render("category_list", {categories: results.rows});
    })

});

exports.category_detail = asyncHandler(async (req, res, next) => {
    const id = parseInt(req.params.id);

    // Fetch the category
    const categoryResult = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
    if (categoryResult.rows.length === 0) {
        // Handle the case where the category is not found
        return res.status(404).render('404', { message: 'Category not found' });
    }
    const category = categoryResult.rows[0];

    // Fetch items under this category
    const itemsResult = await pool.query("SELECT * FROM items WHERE category_id = $1", [id]);
    const items_under_category = itemsResult.rows;

    // Construct the URL manually
    const categoryUrl = `/category/${category.id}`;

    // Render the view with the category and items
    res.render("category_detail", { 
        category: { ...category, url: categoryUrl },
        items_under_category 
    });
});


exports.category_create_get = asyncHandler(async (req, res) => {
    res.render("category_create", {title: "Create new category"});
});

exports.category_create_post = [
    body("name", "Category must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        const { filename } = req.file;
        const name = req.body.name;
        const imgSrc = req.file ? '/images' + req.file.filename : "/images/default.png";

        if (!errors.isEmpty()) {
            res.render("category_create", { category: { name, imgSrc }, errors: errors.array() });
            return;
        }

        const result = await pool.query('SELECT id FROM categories WHERE name = $1', [name]);

        if (result.rows.length > 0) {
            const categoryId = result.rows[0].id;
            res.redirect(`/category/${categoryId}`);
        } else {
            const insertResult = await pool.query(
                'INSERT INTO categories (name, image_src) VALUES ($1, $2) RETURNING id',
                [name, imgSrc]
            );
            const newCategoryId = insertResult.rows[0].id;
            res.redirect(`/category/${newCategoryId}`);
        }
    })
];

exports.category_delete_get = asyncHandler(async (req, res) => {
    const category_id = req.params.id;

    const [categoryResult, itemsResult] = await Promise.all([
        pool.query('SELECT * FROM categories WHERE id = $1', [category_id]),
        pool.query('SELECT name, description FROM items WHERE category_id = $1', [category_id])
    ]);

    if (categoryResult.rows.length === 0){
        res.redirect('/categories');
        return;
    }

    const category = categoryResult.rows[0];
    const allItemsUnderCategory = itemsResult.rows;

    res.render("category_delete", {
        category,
        allItemsUnderCategory
    })
});

exports.category_delete_post = asyncHandler(async (req, res) => {
    const categoryId = req.params.id;

    const itemsResult = await pool.query('SELECT name, description FROM items WHERE category_id = $1', [categoryId]);

    if (itemsResult.rows.length > 0) {
        const categoryResult = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
        const category = categoryResult.rows[0];
        const allItemsUnderCategory = itemsResult.rows;
        res.render("category_delete", {
            category,
            allItemsUnderCategory
        });
        return;
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    res.redirect("/categories");
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);

    if (result.rows.length === 0) {
        const err = new Error("Category not Found");
        err.status = 404;
        return next(err);
    }

    const category = result.rows[0];
    res.render("category_update", { category });
});


exports.category_update_post = [
    body("name", "Category must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const categoryId = req.params.id;
        const name = req.body.name;

        if (!errors.isEmpty()) {
            res.render("category_update", { category: { id: categoryId, name }, errors: errors.array() });
            return;
        }

        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id',
            [name, categoryId]
        );
        const updatedCategoryId = result.rows[0].id;
        res.redirect(`/category/${updatedCategoryId}`);
    })
];
