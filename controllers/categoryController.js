const Category = require('../models/category');
const Item = require('../models/item');
const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');

exports.category_list = asyncHandler(async (req, res) => {
    const categories = await Category.find().exec();
    res.render("category_list", {categories});

});

exports.category_detail = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id).exec();
    const items_under_category = await Item.find({category: category._id}).exec();
    res.render("category_detail", {category, items_under_category});
});

exports.category_create_get = asyncHandler(async (req, res) => {
    res.render("category_create", {title: "Create new category"});
});

exports.category_create_post = [
    body("name", "Category must contain at least 3 characters")
        .trim()
        .isLength({min: 3})
        .escape(),
    
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);

        const {filename} = req.file;
        const category = new Category({
            name: req.body.name,
            imgSrc: '/images' + req.filename
        });

        if (!errors.isEmpty()) {
            res.render("category_create", {category, errors: errors.array()});
            return;
        } else {
            const categoryExists = await Category.findOne({name: req.body.name}).exec();
            if (categoryExists) {
                res.redirect(categoryExists.url);
            } else {
                await category.save();
                res.redirect(category.url);
            }
        }
    })
]

exports.category_delete_get = asyncHandler(async (req, res) => {
    const [category, allItemsUnderCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({category: req.params.id}, "name description").exec()
    ])

    if (category === null){
        res.redirect('/categories');
    }

    res.render("category_delete", {
        category,
        allItemsUnderCategory
    })
});

exports.category_delete_post = asyncHandler(async (req, res) => {
    const [category, allItemsUnderCategory] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Item.find({category: req.params.id}, "name description").exec()
    ])

    if (allItemsUnderCategory.length > 0){
        res.render("category_delete", {
            category,
            allItemsUnderCategory
        });
        return;
    } else {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect("/categories");
    }
});

exports.category_update_get = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category === null){
        const err = new Error("Category not Found");
        err.status = 404;
        return next(err);
    }

    res.render("category_update", {category});
});

exports.category_update_post = [
    body("name", "Category must contain at least 3 characters")
        .trim()
        .isLength({min: 3})
        .escape(),
    

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const category = new Category({
            name: req.body.name,
            _id: req.params.id
        })

        if (!errors.isEmpty()){
            res.render("category_update", {category, errors: errors.array()});
            return;
        } else {
            const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
            res.redirect(updatedCategory.url);
        }
    })  
]