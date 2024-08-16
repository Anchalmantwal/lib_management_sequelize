const express = require("express");
const mysql = require("mysql2");
const { Sequelize, DataTypes } = require('sequelize');
const Model = Sequelize.Model;
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

app.use(bodyParser.json());

const sequelize = new Sequelize('book_data', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3307
});

sequelize.authenticate()
    .then(() => {
        console.log("The database is connected to the server");
    })
    .catch((err) => {
        console.log("There is an error connecting to the database", err);
    });

class Book extends Model {}

Book.init({
    book_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    author_name: {
        type: DataTypes.STRING,
    },
    published_year: {
        type: DataTypes.INTEGER, 
    }
}, {
    sequelize, 
    modelName: 'book',
    timestamps: false
});

Book.sync();

app.post("/books", async (req, res) => {
    const { book_name, author_name, published_year } = req.body;

    try {
        const newBook = await Book.create({
            book_name,
            author_name,
            published_year,
        });
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/books", async (req, res) => {
    try {
        const books = await Book.findAll();
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/books/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findByPk(id);
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ error: "Book not available" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch("/books/:id", async (req, res) => {
    const { id } = req.params;
    const { book_name, author_name, published_year } = req.body;

    try {
        const book = await Book.findByPk(id);
        if (book) {
            book.book_name = book_name !== undefined ? book_name : book.book_name;
            book.author_name = author_name !== undefined ? author_name : book.author_name;
            book.published_year = published_year !== undefined ? published_year : book.published_year;

            await book.save();
            res.status(200).json(book);
        } else {
            res.status(404).json({ error: "Book not available" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete("/books/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findByPk(id);
        if (book) {
            await book.destroy();
            res.status(200).json({ message: "Book deleted successfully" });
        } else {
            res.status(404).json({ error: "Book not found" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
