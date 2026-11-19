const { slugify } = require("../utils/string");
const { validate } = require("../middleware/validate");
const { validateObjectId } = require("../middleware/validateObjectId");

function registerAdminCatalogRoutes({
  router,
  asyncHandler,
  Category,
  ProductCategory,
  Product,
  Brand,
  Coupon,
  categorySchema,
  brandSchema,
  couponSchema,
  invalid,
  validId,
}) {
  function collectionRoutes(path, Model, schema, extra = {}) {
    router.get(
      `/${path}`,
      asyncHandler(async (_req, res) => {
        const items = await Model.find()
          .sort({ createdAt: -1 })
          .limit(500)
          .lean();
        if (path === "categories") {
          const legacyParentIds = [...new Set(items.map((item) => item.parentId && String(item.parentId)).filter(Boolean))];
          if (legacyParentIds.length) {
            await Category.updateMany(
              { _id: { $in: legacyParentIds }, isParent: { $ne: true } },
              { $set: { isParent: true } },
            );
          }
          const parentIdSet = new Set(legacyParentIds);
          const namesById = new Map(items.map((item) => [String(item._id), item.name]));
          items.forEach((item) => {
            item.isParent = Boolean(item.isParent || parentIdSet.has(String(item._id)));
            item.parentName = item.parentId ? namesById.get(String(item.parentId)) || "" : "";
          });
          const [pcCounts, nameCounts] = await Promise.all([
            ProductCategory.aggregate([
              { $group: { _id: "$categoryId", count: { $sum: 1 } } },
            ]),
            Product.aggregate([
              { $group: { _id: { $toLower: "$category" }, count: { $sum: 1 } } },
            ]),
          ]);
          const pcMap = new Map(pcCounts.map((c) => [String(c._id), c.count]));
          const nameMap = new Map(
            nameCounts.map((c) => [c._id ? String(c._id).trim() : "", c.count]),
          );

          items.forEach((item) => {
            const byId = pcMap.get(String(item._id)) || 0;
            const byName = nameMap.get(item.name?.toLowerCase().trim()) || 0;
            item.productCount = Math.max(byId, byName);
            item.count = item.productCount;
          });

          const childCategories = items.filter((item) => item.parentId);
          if (childCategories.length) {
            const childIdToParentId = new Map(
              childCategories.map((category) => [String(category._id), String(category.parentId)]),
            );
            const childNameToParentIds = new Map();
            childCategories.forEach((category) => {
              const name = category.name?.toLowerCase().trim();
              if (!name) return;
              if (!childNameToParentIds.has(name)) childNameToParentIds.set(name, new Set());
              childNameToParentIds.get(name).add(String(category.parentId));
            });
            const childCategoryIds = childCategories.map((category) => category._id);
            const childCategoryNames = [...childNameToParentIds.keys()];
            const [productLinks, legacyProducts] = await Promise.all([
              ProductCategory.find({ categoryId: { $in: childCategoryIds } })
                .select("productId categoryId")
                .lean(),
              Product.aggregate([
                {
                  $project: {
                    _id: 1,
                    categoryName: {
                      $toLower: { $trim: { input: { $ifNull: ["$category", ""] } } },
                    },
                  },
                },
                { $match: { categoryName: { $in: childCategoryNames } } },
                { $project: { _id: 1, categoryName: 1 } },
              ]),
            ]);
            const parentProducts = new Map();
            const addProductToParent = (parentId, productId) => {
              if (!parentId || !productId) return;
              if (!parentProducts.has(parentId)) parentProducts.set(parentId, new Set());
              parentProducts.get(parentId).add(String(productId));
            };

            productLinks.forEach((link) => {
              addProductToParent(
                childIdToParentId.get(String(link.categoryId)),
                link.productId,
              );
            });
            legacyProducts.forEach((product) => {
              childNameToParentIds.get(product.categoryName)?.forEach((parentId) => {
                addProductToParent(parentId, product._id);
              });
            });
            items.forEach((item) => {
              if (item.isParent) {
                item.productCount = parentProducts.get(String(item._id))?.size || 0;
                item.count = item.productCount;
              }
            });
          } else {
            items.forEach((item) => {
              if (item.isParent) {
                item.productCount = 0;
                item.count = 0;
              }
            });
          }
        } else if (path === "brands") {
          const [brandIdCounts, nameCounts] = await Promise.all([
            Product.aggregate([
              { $group: { _id: "$brandId", count: { $sum: 1 } } },
            ]),
            Product.aggregate([
              { $group: { _id: { $toLower: "$brand" }, count: { $sum: 1 } } },
            ]),
          ]);
          const idMap = new Map(
            brandIdCounts.map((b) => [String(b._id), b.count]),
          );
          const nameMap = new Map(
            nameCounts.map((b) => [b._id ? String(b._id).trim() : "", b.count]),
          );

          items.forEach((item) => {
            const byId = idMap.get(String(item._id)) || 0;
            const byName = nameMap.get(item.name?.toLowerCase().trim()) || 0;
            item.productCount = Math.max(byId, byName);
            item.count = item.productCount;
          });
        }
        res.json({ items });
      }),
    );
    router.post(
      `/${path}`,
      validate(schema, { onInvalid: invalid }),
      asyncHandler(async (req, res) => {
        const data = { ...req.validatedBody };
        if (data.name && !data.slug) data.slug = slugify(data.name);
        if (data.code) data.code = data.code.toUpperCase();
        if (path === "categories") {
          if (data.isParent) {
            if (data.parentId) return res.status(400).json({ error: "A parent category cannot have another parent." });
            data.parentId = null;
          } else if (data.parentId) {
            if (!validId(data.parentId)) return res.status(400).json({ error: "Choose a valid parent category." });
            const parent = await Category.findOne({ _id: data.parentId, isParent: true }).select("_id").lean();
            if (!parent) return res.status(400).json({ error: "The selected parent category is unavailable." });
          } else {
            data.parentId = null;
          }
        }
        if (path === "brands") {
          const images =
            Array.isArray(data.images) && data.images.length > 0
              ? data.images
              : data.image
                ? [data.image]
                : data.logoUrl
                  ? [data.logoUrl]
                  : [];
          const primary = images[0] || data.image || data.logoUrl || "";
          data.image = primary;
          data.logoUrl = primary;
          data.images = images.length ? images : primary ? [primary] : [];
        }
        const item = await Model.create({ ...extra.create, ...data });
        res.status(201).json({ item });
      }),
    );
    router.put(
      `/${path}/:id`,
      validateObjectId("id", {
        message: `Invalid ${path.slice(0, -1)} ID.`,
      }),
      validate(schema, { onInvalid: invalid }),
      asyncHandler(async (req, res) => {
        const data = { ...req.validatedBody };
        if (path === "categories") {
          const hasChildren = await Category.exists({ parentId: req.params.id });
          if (data.isParent && data.parentId) return res.status(400).json({ error: "A parent category cannot have another parent." });
          if (!data.isParent && hasChildren) return res.status(409).json({ error: "This parent category has subcategories. Move or delete them before changing its type." });
          if (data.isParent) {
            data.parentId = null;
          } else if (data.parentId) {
            if (!validId(data.parentId) || data.parentId === req.params.id) return res.status(400).json({ error: "Choose a valid parent category." });
            const parent = await Category.findOne({ _id: data.parentId, isParent: true }).select("_id").lean();
            if (!parent) return res.status(400).json({ error: "The selected parent category is unavailable." });
          } else {
            data.parentId = null;
          }
        }
        if (path === "brands") {
          const images =
            Array.isArray(data.images) && data.images.length > 0
              ? data.images
              : data.image
                ? [data.image]
                : data.logoUrl
                  ? [data.logoUrl]
                  : [];
          const primary = images[0] || data.image || data.logoUrl || "";
          data.image = primary;
          data.logoUrl = primary;
          data.images = images.length ? images : primary ? [primary] : [];
        }
        const item = await Model.findByIdAndUpdate(req.params.id, data, {
          new: true,
          runValidators: true,
        });
        if (!item)
          return res
            .status(404)
            .json({ error: `${path.slice(0, -1)} not found.` });
        res.json({ item });
      }),
    );
    router.delete(
      `/${path}/:id`,
      validateObjectId("id", {
        message: `Invalid ${path.slice(0, -1)} ID.`,
      }),
      asyncHandler(async (req, res) => {
        if (path === "categories") {
          const catDoc = await Category.findById(req.params.id).lean();
          if (catDoc?.isParent && await Category.exists({ parentId: catDoc._id })) {
            return res.status(409).json({ error: `Cannot delete parent category "${catDoc.name}" while it has subcategories. Move or delete those categories first.` });
          }
          const categoryIdMatch = await ProductCategory.find({ categoryId: req.params.id })
            .populate("productId", "title")
            .limit(5)
            .lean();
          const hasProducts = categoryIdMatch.length > 0 || (catDoc && await Product.exists({ category: catDoc.name }));
          if (hasProducts) {
            const totalCount = await ProductCategory.countDocuments({ categoryId: req.params.id });
            const titles = categoryIdMatch.map((c) => c.productId?.title).filter(Boolean);
            const sample = titles.length ? ` (${titles.map((t) => `"${t}"`).join(", ")})` : "";
            return res.status(409).json({
              error: `Cannot delete "${catDoc?.name || "category"}" because it is assigned to ${totalCount || "several"} product(s)${sample}. Move or reassign those products first.`,
            });
          }
        }
        if (path === "brands") {
          const brandDoc = await Brand.findById(req.params.id).lean();
          if (brandDoc) {
            const filter = {
              $or: [
                { brandId: req.params.id },
                { brand: brandDoc.name },
              ],
            };
            const count = await Product.countDocuments(filter);
            if (count > 0) {
              const sampleProducts = await Product.find(filter)
                .select("title")
                .limit(4)
                .lean();
              const titles = sampleProducts.map((p) => `"${p.title}"`).join(", ");
              const more = count > sampleProducts.length ? ` and ${count - sampleProducts.length} more` : "";
              return res.status(409).json({
                error: `Cannot delete brand "${brandDoc.name}" because it is assigned to ${count} product${count > 1 ? "s" : ""} (${titles}${more}). Move or reassign those products first.`,
              });
            }
          } else if (await Product.exists({ brandId: req.params.id })) {
            return res.status(409).json({
              error: "This brand is assigned to products. Move those products first.",
            });
          }
        }
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item)
          return res
            .status(404)
            .json({ error: `${path.slice(0, -1)} not found.` });
        res.json({ item });
      }),
    );
  }
  collectionRoutes("categories", Category, categorySchema);
  collectionRoutes("brands", Brand, brandSchema);
  collectionRoutes("coupons", Coupon, couponSchema);

}

module.exports = registerAdminCatalogRoutes;
