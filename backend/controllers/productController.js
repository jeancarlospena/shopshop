import asyncHandler from "../middleware/asyncHandler.js"
import Product from "../models/productModel.js"

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1

  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {}

  const count = await Product.countDocuments({ ...keyword })

  const products = await Product.find({ ...keyword }).limit(pageSize).skip(pageSize * (page - 1))
  res.json({ products, page, pages: Math.ceil(count / pageSize) })
})


const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    return res.json(product)
  } else {
    res.status(404)
    throw new Error('Resource not found')
  }
})

// create product
// post /api/products
// private admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Sample name",
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'sample brand',
    category: 'sample categoty',
    countInStock: 0,
    numReviews: 0,
    description: 'sample description'

  })
  const createdProduct = await product.save()
  res.status(201).json(createdProduct)
})

// update product
// put /api/products/:id
// private admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body
  const product = await Product.findById(req.params.id)
  if (product) {
    product.name = name
    product.price = price
    product.description = description
    product.image = image
    product.brand = brand
    product.category = category
    product.countInStock = countInStock

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Resource not found')
  }
})


// delete product
// delete /api/products/:id
// private admin
const deleteProduct = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id)
  if (product) {
    await Product.deleteOne({ _id: product._id })
    res.status(200).json({ massage: 'Product deleted' })
  } else {
    res.status(404)
    throw new Error('Resource not found')
  }
})

// create review
// post /api/products/:id/reviews
// private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body
  const product = await Product.findById(req.params.id)
  if (product) {
    const alreadyReviewed = product.reviews.find((review) => review.user.toString() === req.user._id.toString())

    if (alreadyReviewed) {
      res.status(400)
      throw new Error('Product already reviewed')
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id
    }

    product.reviews.push(review)

    product.numReviews = product.reviews.length

    product.rating = product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length

    await product.save()
    res.status(201).json({ message: 'Review added' })
  } else {
    res.status(404)
    throw new Error('Resource not found')
  }
})

// get top rated products
// get /api/products/top
// public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3)
  res.status(200).json(products)
})


export {
  getProductById, getProducts, createProduct, updateProduct, deleteProduct,
  createProductReview, getTopProducts
}