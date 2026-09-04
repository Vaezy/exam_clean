import React, { useState } from "react";
import api from "../api";

/**
 * Formulaire d'ajout d'une tâche.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.addTask - Callback appelé avec la tâche créée retournée par l'API.
 *                                   Permet de mettre à jour la liste sans recharger la page.
 *
 * @description
 * - Valide côté client que le titre n'est pas vide (trim).
 * - Envoie une requête POST /api/tasks avec le token JWT stocké en localStorage.
 * - Affiche un message d'erreur si la validation échoue ou si l'API renvoie une erreur.
 * - Réinitialise le champ titre après un ajout réussi.
 */
const TaskForm = ({ addTask }) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  /**
   * Soumet le formulaire : valide le titre, appelle l'API et met à jour la liste parente.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Le titre de la tâche ne peut pas être vide.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await api.post(
        "/tasks",
        { title },
        {
          headers: { "x-auth-token": token },
        }
      );
      addTask(res.data);
      setTitle("");
    } catch (err) {
      const message =
        err.response?.data?.msg || "Impossible d'ajouter la tâche.";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <input
        type="text"
        placeholder="Ajouter une tâche ..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <button type="submit" className="btn" style={{ marginTop: "10px" }}>
        Ajouter Tâche
      </button>
    </form>
  );
};

export default TaskForm;
