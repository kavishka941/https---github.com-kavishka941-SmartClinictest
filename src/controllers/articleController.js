import { Article } from '../models/Article.js';


export const createArticle = async (req, res) => {
const { title, content, tags } = req.body;
const article = await Article.create({ author: req.user._id, title, content, tags });
res.status(201).json(article);
};


export const listArticles = async (req, res) => {
const { author, tag } = req.query;
const q = { isPublished: true };
if (author) q.author = author;
if (tag) q.tags = tag;
const items = await Article.find(q).populate('author', 'name').sort('-createdAt').lean();
res.json(items);
};