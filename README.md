# eMall Store

The eMall Store is website built using Node, Express, Ejs and MongoDb. The goal was to build an e-commerce storefront that could be used to showcase and sell products. An ordering system and shopping cart has been implemented in this project. Security concerns were addressed with password hashing (Bcryptjs) and encrypted session cookies (Express-Session). MongoDB was selected for the project's database. As an added challenge, no ORM/ODM such as Mongoose was used for this project. Views are rendered with the help of the Ejs templating engine.

Run the program using Node by executing the 'server.js' application entry file. The webserver requires a MongoDB server running on localhost at startup. Sample MongoDB collections are included.

The sample MongoDB collection contains the following accounts: </br>

Usr: admin@admin.com </br> 
pass: admin </br>

Usr: user@user.com </br> 
pass: user
