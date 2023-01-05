const authorModel = require("../model/authorModel");
const blogModel = require("../model/blogModel");
const mongoose= require('mongoose')
const validator= require('../validator/validator')
let date = new Date();


const createblog = async function (req, res) {
  try {
    let data = req.body;
    let id = data.authorId;

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, error: "Please enter details" });
    let authId = await authorModel.findById(id);
    if (!authId) { return res.status(400).send({status: false, error: "Author does not exist"}) }
    if (data.isPublished) {
      data["publishedAt"] = date; }

      let savedData = await blogModel.create(data);
      return res.status(201).send({ status: true, data: savedData });
  } 
  catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

const getBlog = async function (req, res) {
  try {
    let data = req.query
    let { authorId, tags, subcategory, category, ...rest } = data
    let obj = { isDeleted: false, isPublished: true }
    if(validator.checkInput(rest)) return res.status(400).send({status: false, error:"Only acceptable authorId, tags, subcategory, category "})
    if (authorId) {
      if (!mongoose.isValidObjectId(authorId)) return res.status(404).send({ status: false, error: 'Invalid Author ID' })

      let checkAuthor = await authorModel.findById(authorId)
      if (!checkAuthor) return res.status(404).send({status: false, error: "no author exist" })
      obj.authorId = authorId
    }
    if (category) {
      obj.category = category
    }
    if (tags) {
      obj.tags = tags
    }
    if (subcategory) {
      obj.subcategory = subcategory
    }

    let findData = await blogModel.find(obj)
    if (!findData.length>0) {
      return res.status(404).send({status:false, error: "no data found" })
    }
    return res.status(200).send({status:true, msg: findData })
  } catch (error) {
    res.status(500).send({ status: false, error: error.message })
  }
}

const updateBlog = async function (req, res) {
  try {
    let data= req.body
    let { title,body, tags,subcategory, ...rest } = data
    let id = req.params.blogId
    if (data.tags == null) {
      return res.status(400).send({ status: false, error: "tags key is mandatory" })
    }
    else if (data.subcategory == null) {
      return res.status(400).send({ status: false, error: "subcategory is mandatory" })
    }
    else {
      if(validator.checkInput(rest)) return res.status(400).send({status: false, error:"Only acceptable title,body,tags,subcategory"})
      let { title, body, tags, subcategory } = data
      let obj = { isDeleted: false }
      if(title){
        obj.title = title
      }
      if(body){
        obj.body = body
      }
      obj["publishedAt"] = date;
      obj.isPublished = true
      let update = await blogModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: obj, $push: { subcategory: subcategory, tags: tags } },
        { new: true }
      )
      res.status(201).send({ status: true, msg: update })
    }
  }
  catch (error) {
    res.status(500).send({ status: false, error: error.message })
  }
}

let deletebyId = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let isDeleted = await blogModel.findByIdAndUpdate(
      blogId,
      { $set: { isDeleted: true, deletedAt: date } },
      { new: true }
    );
    res.status(200).send({status: true, msg: isDeleted})
} 
  catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};


const deleteBlog = async function (req, res) {
  try {
    let data = req.query
    let savedData = await blogModel.findOneAndUpdate(data, { isDeleted: true, deletedAt: date }, { new: true })
    if (!savedData) return res.status(404).send({ status: false, error: "No Blog Found" })
    res.status(200).send({ status: false, Msg: savedData })
  } 
  catch (error) {
    res.status(500).send({ status: true, error: error.message })
  }
}


module.exports.getBlog = getBlog
module.exports.createblog = createblog
module.exports.updateBlog = updateBlog
module.exports.deletebyId = deletebyId
module.exports.deleteBlog = deleteBlog