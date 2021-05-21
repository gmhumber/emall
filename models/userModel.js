class User {
    constructor (email, password, cart, id) {
        this.email = email;
        this.password = password;
        this.cart = cart ? cart : [];
        this._id = id ? id : null;
        this.privilages = 'user';
    }
};

exports.User = User;
