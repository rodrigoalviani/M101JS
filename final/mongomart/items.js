/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var sum = function (a, b) {
    return a + b.num;
}

function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

        this.db.collection("item").aggregate([
            {
                $match: {
                    category: {$not: {$size: 0}}
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category",
                    num: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {_id: 1}
            }
        ])
        .toArray(function(err, items) {
            assert.equal(null, err);

            var category = {
                _id: "All",
                num: items.reduce(sum, 0)
            };

            items.push(category)

            callback(items);
        });
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        page = page || 0;
        if (category.toLowerCase() == 'all') category = '';
        var query = category ? {category: category} : {};

        this.db.collection("item").find(query)
            .skip(itemsPerPage * page)
            .limit(itemsPerPage)
            .toArray(function(err, items) {
                assert.equal(null, err);
                callback(items);
            });
    }


    this.getNumItems = function(category, callback) {
        "use strict";

        if (category.toLowerCase() == 'all') category = '';
        var query = category ? {category: category} : {};

        this.db.collection("item")
            .count(query, function (err, items) {
                assert.equal(null, err);
                callback(items);
            });
    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        page = page || 0;
        var q = query ? {$text: {$search: query}} : {};

        this.db.collection("item").find(q)
            .skip(itemsPerPage * page)
            .limit(itemsPerPage)
            .toArray(function(err, items) {
                assert.equal(null, err);
                callback(items);
            });
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var q = query ? {$text: {$search: query}} : {};

        this.db.collection("item").count(q, function(err, items) {
                assert.equal(null, err);
                callback(items);
            });
    }


    this.getItem = function(itemId, callback) {
        "use strict";

        this.db.collection("item").findOne({"_id": itemId}, function (err, item) {
            assert.equal(null, err);
            callback(item);
        });
    };


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };

        this.db.collection("item").updateOne({"_id": itemId}, {$addToSet: {"reviews": reviewDoc}}, {}, function (err) {
            assert.equal(null, err);
            callback(itemId);
        });
    };


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
