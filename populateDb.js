#! /usr/bin/env node

console.log(
'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Category = require("./models/category");
const Item = require("./models/item");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name, description, url) {
    const category = new Category({ name: name, description: description, url: url });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
}

async function itemCreate(index, name, description, category, price, numberInStock, url, brand, expirationDate, isFeatured, tags) {
    const item = new Item({ name: name, description: description, category: category, price: price, numberInStock: numberInStock, url: url, brand: brand, expirationDate: expirationDate, isFeatured: isFeatured, tags: tags });
    await item.save();
    items[index] = item;
    console.log(`Added item: ${name}`);
}


async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
        categoryCreate(0, "Fruits", "Fresh and delicious fruits", "fruits.jpg"),
        categoryCreate(1, "Vegetables", "Healthy and nutritious vegetables", "vegetables.jpg"),
        categoryCreate(2, "Dairy", "Dairy products and items", "dairy.jpg"),
        categoryCreate(3, "Meat", "Quality meat and cuts", "meat.jpg"),
        categoryCreate(4, "Bakery", "Freshly baked goods", "bakery.jpg"),
        categoryCreate(5, "Beverages", "Refreshing drinks and beverages", "beverages.jpg"),
        categoryCreate(6, "Condiments", "Flavorful condiments and sauces", "condiments.jpg"),
        categoryCreate(7, "Snacks", "Crunchy and tasty snacks", "snacks.jpg"),
        categoryCreate(8, "Baking", "Baking ingredients and supplies", "baking.jpg"),
        categoryCreate(9, "Cooking", "Cooking essentials and ingredients", "cooking.jpg")
    ]);
}

async function createItems() {
    console.log("Adding items");
    await Promise.all([
        itemCreate(0, "Apple", "A red fruit", categories[0], 1.99, 10, "apple.jpg", "Apple", "2023-05-01", true, ["fruit", "red"]),
        itemCreate(1, "Banana", "A yellow fruit", categories[0], 1.99, 10, "banana.jpg", "Banana", "2023-05-01", true, ["fruit", "yellow"]),
        itemCreate(2, "Orange", "A orange fruit", categories[0], 1.99, 10, "orange.jpg", "Orange", "2023-05-01", true, ["fruit", "orange"]),
        itemCreate(3, "Grape", "A purple fruit", categories[0], 1.99, 10, "grape.jpg", "Grape", "2023-05-01", true, ["fruit", "purple"]),
        itemCreate(4, "Tomato", "Juicy and red tomato", categories[1], 1.99, 10, "tomato.jpg", "Local Farms Inc.", new Date('2023-05-01'), true, ["fruit", "red"]),
        itemCreate(5, "Cucumber", "Crisp and refreshing cucumber", categories[1], 0.99, 10, "cucumber.jpg", "Organic Growers Co.", new Date('2023-05-01'), true, ["vegetable", "green"]),
        itemCreate(6, "Carrot", "Sweet and crunchy carrot", categories[1], 1.49, 10, "carrot.jpg", "Fresh Farms Ltd.", new Date('2023-05-01'), true, ["vegetable", "orange"]),
        itemCreate(7, "Broccoli", "Nutritious and versatile broccoli", categories[1], 2.29, 10, "broccoli.jpg", "Harvest Goodness Inc.", new Date('2023-05-01'), true, ["vegetable", "green"]),
        itemCreate(8, "Milk", "Fresh dairy milk", categories[2], 3.49, 20, "milk.jpg", "Farm Fresh Dairies", new Date('2023-05-05'), true, ["dairy", "milk"]),
        itemCreate(9, "Cheese", "Delicious cheese", categories[2], 4.99, 15, "cheese.jpg", "Artisan Creameries", new Date('2023-06-01'), false, ["dairy", "cheese"]),
        itemCreate(10, "Yogurt", "Creamy yogurt", categories[2], 2.29, 30, "yogurt.jpg", "Natural Probiotics Inc.", new Date('2023-05-15'), true, ["dairy", "yogurt"]),
        itemCreate(11, "Butter", "Smooth butter", categories[2], 2.99, 25, "butter.jpg", "Golden Creameries", new Date('2023-05-10'), false, ["dairy", "butter"]),
        itemCreate(12, "Beef Steak", "Juicy beef steak", categories[3], 12.99, 8, "beef_steak.jpg", "Prime Cuts Butchery", new Date('2023-04-30'), true, ["meat", "steak"]),
        itemCreate(13, "Chicken Breast", "Tender chicken breast", categories[3], 9.99, 15, "chicken_breast.jpg", "Farm Fresh Poultry", new Date('2023-05-05'), true, ["meat", "chicken"]),
        itemCreate(14, "Pork Chops", "Succulent pork chops", categories[3], 10.49, 10, "pork_chops.jpg", "Smokehouse Meats", new Date('2023-05-01'), false, ["meat", "pork"]),
        itemCreate(15, "Lamb Rack", "Flavorful lamb rack", categories[3], 14.99, 6, "lamb_rack.jpg", "Gourmet Lamb Farms", new Date('2023-04-28'), true, ["meat", "lamb"]),
        itemCreate(16, "Cola", "Refreshing cola drink", categories[4], 1.99, 20, "cola.jpg", "Soda Co.", new Date('2023-05-10'), true, ["beverage", "cola"]),
        itemCreate(17, "Orange Juice", "Freshly squeezed orange juice", categories[4], 2.49, 15, "orange_juice.jpg", "Citrus Farms", new Date('2023-05-15'), true, ["beverage", "juice"]),
        itemCreate(18, "Green Tea", "Healthy green tea", categories[4], 3.29, 12, "green_tea.jpg", "Zen Tea Gardens", new Date('2023-06-01'), false, ["beverage", "tea"]),
        itemCreate(19, "Bottled Water", "Pure bottled water", categories[4], 0.99, 30, "bottled_water.jpg", "Spring Oasis Inc.", new Date('2023-04-30'), true, ["beverage", "water"]),
        itemCreate(20, "Ketchup", "Classic tomato ketchup", categories[6], 2.49, 15, "ketchup.jpg", "Saucy Delights Inc.", new Date('2023-05-15'), true, ["condiment", "ketchup"]),
        itemCreate(21, "Mustard", "Tangy mustard sauce", categories[6], 1.99, 20, "mustard.jpg", "Golden Condiments Co.", new Date('2023-05-10'), true, ["condiment", "mustard"]),
        itemCreate(22, "Mayonnaise", "Creamy mayonnaise spread", categories[6], 2.99, 12, "mayonnaise.jpg", "Farm Fresh Spreads", new Date('2023-06-01'), false, ["condiment", "mayonnaise"]),
        itemCreate(23, "Soy Sauce", "Savory soy sauce", categories[6], 3.29, 10, "soy_sauce.jpg", "Umami Creations", new Date('2023-05-05'), true, ["condiment", "soy sauce"]),
        itemCreate(24, "Salsa", "Spicy salsa dip", categories[6], 2.99, 10, "salsa.jpg", "Hot Pepper Farms", new Date('2023-05-10'), true, ["condiment", "salsa"]),
        itemCreate(25, "Barbecue Sauce", "Rich barbecue sauce", categories[6], 3.49, 12, "bbq_sauce.jpg", "Smokehouse Flavors", new Date('2023-05-15'), true, ["condiment", "barbecue"]),
        itemCreate(26, "Hot Sauce", "Fiery hot sauce", categories[6], 2.79, 15, "hot_sauce.jpg", "Fire & Spice Co.", new Date('2023-06-01'), false, ["condiment", "hot"]),
        itemCreate(27, "Tartar Sauce", "Creamy tartar sauce", categories[6], 2.49, 8, "tartar_sauce.jpg", "Seafood Delights", new Date('2023-05-05'), true, ["condiment", "tartar"]),
        itemCreate(28, "Potato Chips", "Crunchy potato chips", categories[7], 1.99, 20, "potato_chips.jpg", "Snack Time Inc.", new Date('2023-05-10'), true, ["snack", "potato"]),
        itemCreate(29, "Popcorn", "Classic buttery popcorn", categories[7], 1.49, 25, "popcorn.jpg", "Movie Night Snacks", new Date('2023-05-15'), true, ["snack", "popcorn"]),
        itemCreate(30, "Pretzels", "Salty pretzel twists", categories[7], 1.79, 18, "pretzels.jpg", "Bakery Delights", new Date('2023-06-01'), false, ["snack", "pretzel"]),
        itemCreate(31, "Trail Mix", "Healthy trail mix", categories[7], 2.29, 15, "trail_mix.jpg", "Nature's Blend", new Date('2023-05-05'), true, ["snack", "trail"]),
        itemCreate(32, "Flour", "All-purpose flour", categories[8], 3.99, 15, "flour.jpg", "Millers' Pride", new Date('2023-05-10'), true, ["baking", "flour"]),
        itemCreate(33, "Sugar", "Granulated sugar", categories[8], 2.49, 20, "sugar.jpg", "Sweet Essentials", new Date('2023-05-15'), true, ["baking", "sugar"]),
        itemCreate(34, "Chocolate Chips", "Rich chocolate chips", categories[8], 4.29, 12, "chocolate_chips.jpg", "Chocolatiers Ltd.", new Date('2023-06-01'), false, ["baking", "chocolate"]),
        itemCreate(35, "Vanilla Extract", "Pure vanilla extract", categories[8], 5.99, 10, "vanilla_extract.jpg", "Gourmet Flavors Co.", new Date('2023-05-05'), true, ["baking", "vanilla"]),
        itemCreate(36, "Olive Oil", "Extra virgin olive oil", categories[9], 7.99, 10, "olive_oil.jpg", "Mediterranean Harvest", new Date('2023-05-10'), true, ["cooking", "olive oil"]),
        itemCreate(37, "Soy Sauce", "Premium soy sauce", categories[9], 4.49, 15, "soy_sauce_cooking.jpg", "Umami Delights", new Date('2023-05-15'), true, ["cooking", "soy sauce"]),
        itemCreate(38, "Spaghetti", "Italian spaghetti pasta", categories[9], 2.99, 20, "spaghetti.jpg", "Pasta Masters", new Date('2023-06-01'), false, ["cooking", "pasta"]),
        itemCreate(39, "Rice", "Long-grain white rice", categories[9], 3.79, 18, "rice.jpg", "Rice Growers Co.", new Date('2023-05-05'), true, ["cooking", "rice"])
    ]);
}

