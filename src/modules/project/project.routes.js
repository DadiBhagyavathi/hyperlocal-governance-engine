const router = require("express").Router();
const controller = require("./project.controller");
const { validateProjectInput } = require("./project.validator");

/**
 * Create Project
 */
router.post("/", async (req, res, next) => {
  const { isValid, errors } = validateProjectInput(req.body);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  return controller.create(req, res, next);
});

/**
 * List Projects (Paginated)
 */
router.get("/", controller.list);

module.exports = router;