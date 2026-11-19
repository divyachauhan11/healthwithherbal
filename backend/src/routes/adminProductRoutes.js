const escapeRegex = require("../utils/escapeRegex");
const { slugify } = require("../utils/string");
const { validate } = require("../middleware/validate");
const { validateObjectId } = require("../middleware/validateObjectId");

const inventoryService = require("../services/inventoryService");

function registerAdminProductRoutes({
  router,
  asyncHandler,
  validId,
  Product,
  Category,
  ProductCategory,
  InventoryLog,
  productSchema,
  invalid,
  Brand,
}) {
  router.get(
    "/products",
    asyncHandler(async (req, res) => {
      const q = String(req.query.q || "").slice(0, 100);
      const parentCategoryId = String(req.query.parentCategoryId || "");
      if (parentCategoryId) {
        if (!validId(parentCategoryId)) return res.status(400).json({ error: "Invalid parent category ID." });
        const childCategories = await Category.find({ parentId: parentCategoryId })
          .select("_id name")
          .lean();
        const childCategoryIds = childCategories.map((category) => category._id);
        const childCategoryNames = childCategories.map((category) => category.name?.toLowerCase().trim()).filter(Boolean);
        const [linkedProductIds, legacyProducts] = await Promise.all([
          childCategoryIds.length
            ? ProductCategory.distinct("productId", { categoryId: { $in: childCategoryIds } })
            : [],
          childCategoryNames.length
            ? Product.aggregate([
                {
                  $project: {
                    _id: 1,
                    categoryName: {
                      $toLower: { $trim: { input: { $ifNull: ["$category", ""] } } },
                    },
                  },
                },
                { $match: { categoryName: { $in: childCategoryNames } } },
                { $project: { _id: 1 } },
              ])
            : [],
        ]);
        const productIds = [...new Set([
          ...linkedProductIds.map(String),
          ...legacyProducts.map((product) => String(product._id)),
        ])];
        const products = productIds.length
          ? await Product.find({ _id: { $in: productIds } }).sort({ createdAt: -1 }).limit(500).lean()
          : [];
        return res.json({ items: products, total: products.length });
      }
      const filter = q
        ? {
            $or: [
              {
                title: new RegExp(escapeRegex(q), "i"),
              },
              { sku: new RegExp(escapeRegex(q), "i") },
            ],
          }
        : {};
      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();
      res.json({ items: products, total: await Product.countDocuments(filter) });
    }),
  );

  router.get(
    "/low-stock",
    asyncHandler(async (req, res) => {
      const q = String(req.query.q || "").slice(0, 100);
      const filter = {
        active: true,
        $or: [
          { stockQty: { $lt: 10 } },
          { $expr: { $lte: ["$stockQty", "$lowStockThreshold"] } },
        ],
      };
      if (q) {
        const regex = new RegExp(escapeRegex(q), "i");
        filter.$and = [
          {
            $or: [
              { title: regex },
              { sku: regex },
              { category: regex },
              { brand: regex },
            ],
          },
        ];
      }
      const products = await Product.find(filter)
        .sort({ stockQty: 1, title: 1 })
        .limit(500)
        .lean();
      res.json({ items: products, total: products.length });
    }),
  );

  router.patch(
    "/products/:id/stock",
    validateObjectId("id", { message: "Invalid product ID." }),
    asyncHandler(async (req, res) => {
      const stockQty = Number(req.body.stockQty);
      if (isNaN(stockQty) || stockQty < 0)
        return res
          .status(400)
          .json({ error: "Stock quantity must be a non-negative number." });
      const before = await Product.findById(req.params.id)
        .select("stockQty")
        .lean();
      if (!before) return res.status(404).json({ error: "Product not found." });
      const product = await inventoryService.setAbsoluteStockAndLog({
        updateProduct: () =>
          Product.findByIdAndUpdate(
            req.params.id,
            { stockQty },
            { new: true },
          ),
        InventoryLog,
        stockQty,
        before,
        reason: req.body.reason || "Admin low stock page quick restock",
      });
      res.json({ item: product });
    }),
  );

  router.patch(
    "/products/:id/badge",
    validateObjectId("id", { message: "Invalid product ID." }),
    asyncHandler(async (req, res) => {
      const { badge } = req.body || {};
      const cleanBadge = typeof badge === "string" && badge.trim() ? badge.trim() : null;
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { badge: cleanBadge },
        { new: true },
      );
      if (!product) return res.status(404).json({ error: "Product not found." });
      res.json({ item: product });
    }),
  );
  router.post(
    "/products",
    validate(productSchema, { onInvalid: invalid }),
    asyncHandler(async (req, res) => {
      const legacyId =
        (await Product.findOne().sort({ legacyId: -1 }).select("legacyId").lean())
          ?.legacyId || 0;
      const data = req.validatedBody;
      const images =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : data.image
            ? [data.image]
            : [];
      const primaryImage =
        images[0] ||
        data.image ||
        "https://placehold.co/600x600?text=Herbal+Product";
      const [brand, category] = await Promise.all([
        Brand.findOne({ name: data.brand }).select("_id").lean(),
        Category.findOne({ name: data.category }).select("_id").lean(),
      ]);
      const product = await Product.create({
        ...data,
        badge: data.badge ? data.badge.trim() : null,
        image: primaryImage,
        images: images.length ? images : [primaryImage],
        brandId: brand?._id,
        legacyId: legacyId + 1,
        slug: `${slugify(data.title)}-${legacyId + 1}`,
        original: data.original ?? data.price,
        rating: 0,
        reviews: 0,
      });
      if (category)
        await ProductCategory.create({
          productId: product._id,
          categoryId: category._id,
        });
      res.status(201).json({ item: product });
    }),
  );
  router.put(
    "/products/:id",
    validateObjectId("id", { message: "Invalid product ID." }),
    validate(productSchema, { onInvalid: invalid }),
    asyncHandler(async (req, res) => {
      const data = req.validatedBody;
      const images =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : data.image
            ? [data.image]
            : [];
      const primaryImage = images[0] || data.image || "";
      const [brand, category, existing] = await Promise.all([
        Brand.findOne({ name: data.brand }).select("_id").lean(),
        Category.findOne({ name: data.category }).select("_id").lean(),
        Product.findById(req.params.id).select("_id").lean(),
      ]);
      if (!existing) return res.status(404).json({ error: "Product not found." });
      const before = await Product.findById(req.params.id)
        .select("stockQty")
        .lean();
      const updateData = {
        ...data,
        badge: data.badge !== undefined ? (data.badge ? data.badge.trim() : null) : undefined,
        brandId: brand?._id,
      };
      if (updateData.badge === undefined) delete updateData.badge;
      if (primaryImage) updateData.image = primaryImage;
      if (images.length) updateData.images = images;
      const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!product) return res.status(404).json({ error: "Product not found." });
      await inventoryService.logEditedProductStockChange({
        InventoryLog,
        before,
        product,
      });
      await ProductCategory.deleteMany({ productId: product._id });
      if (category)
        await ProductCategory.create({
          productId: product._id,
          categoryId: category._id,
        });
      res.json({ item: product });
    }),
  );
  router.delete(
    "/products/:id",
    validateObjectId("id", { message: "Invalid product ID." }),
    asyncHandler(async (req, res) => {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found." });
      await ProductCategory.deleteMany({ productId: req.params.id });
      res.json({ item: product, success: true, message: "Product deleted permanently." });
    }),
  );

  router.patch(
    "/products/:id/toggle-active",
    validateObjectId("id", { message: "Invalid product ID." }),
    asyncHandler(async (req, res) => {
      const current = await Product.findById(req.params.id);
      if (!current) return res.status(404).json({ error: "Product not found." });
      const nextActive =
        typeof req.body?.active === "boolean"
          ? req.body.active
          : !current.active;
      current.active = nextActive;
      await current.save();
      res.json({ item: current, success: true });
    }),
  );

  router.patch(
    "/products/:id",
    validateObjectId("id", { message: "Invalid product ID." }),
    asyncHandler(async (req, res) => {
      const update = {};
      if (typeof req.body?.active === "boolean") {
        update.active = req.body.active;
      }
      if (req.body?.stockQty !== undefined) {
        update.stockQty = Number(req.body.stockQty);
      }
      const product = await Product.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });
      if (!product) return res.status(404).json({ error: "Product not found." });
      res.json({ item: product, success: true });
    }),
  );


}

module.exports = registerAdminProductRoutes;
