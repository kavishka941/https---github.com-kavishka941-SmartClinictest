import mongoose from 'mongoose';


const ArticleSchema = new mongoose.Schema(
{
author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
title: { type: String, required: true },
content: { type: String, required: true },
tags: [{ type: String }],
isPublished: { type: Boolean, default: true },
},
{ timestamps: true }
);


export const Article = mongoose.model('Article', ArticleSchema);