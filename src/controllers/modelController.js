const mongoose = require("mongoose");
const Models = require('../models/Models');

exports.addModel = async (req, res) => {
    try {
        console.log('Adding model:', req.body);
        const { name, key, description, active } = req.body;
        const model = new Models({ name, key, description, active });
        await model.save();
        res.status(201)
            .json(model);
    }
    catch (error) {
        console.error('Error adding model:', error);
        res.status(500)
            .json({ message: 'Server error'  });
    }}

exports.getModels = async (req, res) => {
    try {
        const models = await Models.find();
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500)
            .json({ message: 'Server error' });
    }
}

exports.updateModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, description } = req.body;

        const model = await Models.findByIdAndUpdate(id, { name, key, description }, { new: true });

        if (!model) {
            return res.status(404)
                      .json({ message: 'Model not found' });
        }

        res.json(model);
    } catch (error) {
        console.error('Error updating model:', error);
        res.status(500)
            .json({ message: 'Server error' });
    }
}

exports.activateModel = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  let updated;

  try {
    await session.withTransaction(async () => {
      // 1) Ensure the target exists
      const exists = await Models.findById(id).session(session);
      if (!exists) {
        // Throw to abort the transaction cleanly
        const err = new Error("NOT_FOUND");
        err.code = 404;
        throw err;
      }

      // 2) Deactivate all others
      await Models.updateMany(
        { _id: { $ne: id }, active: true },
        { $set: { active: false } },
        { session }
      );

      // 3) Activate the selected model
      updated = await Models.findByIdAndUpdate(
        id,
        { $set: { active: true } },
        { new: true, session }
      );
    });

    return res.json(updated);
  } catch (error) {
    if (error.code === 404 || error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Model not found" });
    }
    console.error("Error activating model:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
};

exports.deleteModel = async (req, res) => {     
    try {
        const { id } = req.params;

        const model = await Models.findByIdAndDelete(id);

        if (!model) {
            return res.status(404)
                      .json({ message: 'Model not found' });
        }

        res.json({ message: 'Model deleted successfully' });
    } catch (error) {
        console.error('Error deleting model:', error);
        res.status(500)
            .json({ message: 'Server error' });
    }
}