class Product {
    constructor (name, description, price, sku, id) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.sku = sku;
        this._id = id ? id : null;
    }
};

exports.Product = Product;