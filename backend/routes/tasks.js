const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const { sanitizeInput } = require('../utils/sanitize');

// @route   GET api/tasks
// @desc    Get all user tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Crée une nouvelle tâche pour l'utilisateur authentifié.
 * @access  Privé (header `x-auth-token` requis)
 *
 * @body    {string} title       - Titre de la tâche (obligatoire, non vide)
 * @body    {string} [description] - Description optionnelle de la tâche
 *
 * @returns {201|200} Task       - La tâche créée (objet MongoDB)
 * @returns {400}     { msg }    - Titre manquant ou invalide
 * @returns {401}     { msg }    - Token absent ou invalide
 * @returns {500}     string     - Erreur serveur
 *
 * Sécurité : le titre et la description sont sanitizés (suppression des balises HTML)
 * avant enregistrement pour limiter les risques XSS.
 */
router.post('/', auth, async (req, res) => {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ msg: 'Le titre de la tâche est requis.' });
  }

  try {
    const newTask = new Task({
      title: sanitizeInput(title),
      description: sanitizeInput(description),
      user: req.user.id,
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task (uniquement si elle appartient à l'utilisateur connecté)
router.put('/:id', auth, async (req, res) => {
  const { title, description, isCompleted } = req.body;
  const update = {};

  if (title !== undefined) {
    if (!title || !String(title).trim()) {
      return res.status(400).json({ msg: 'Le titre de la tâche est requis.' });
    }
    update.title = sanitizeInput(title);
  }
  if (description !== undefined) update.description = sanitizeInput(description);
  if (isCompleted !== undefined) update.isCompleted = isCompleted;

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ msg: 'Aucune donnée à mettre à jour.' });
  }

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: update },
      { new: true }
    );

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task (uniquement si elle appartient à l'utilisateur connecté)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) return res.status(404).json({ msg: 'Task not found' });

    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
