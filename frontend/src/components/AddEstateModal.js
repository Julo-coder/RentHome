import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Ważne dla dostępności

const AddEstateModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        address: '',
        max_person: '',
        people: '',
        area: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); // Przekazanie danych do funkcji obsługującej
        onClose(); // Zamknięcie okna
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Dodaj mieszkanie">
            <h2>Dodaj mieszkanie</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="address" placeholder="Adres" onChange={handleChange} required />
                <input type="number" name="max_person" placeholder="Max osób" onChange={handleChange} required />
                <input type="number" name="people" placeholder="Liczba osób" onChange={handleChange} required />
                <input type="number" name="area" placeholder="Powierzchnia (m²)" onChange={handleChange} required />
                <button type="submit">Dodaj</button>
            </form>
            <button onClick={onClose}>Zamknij</button>
        </Modal>
    );
};

export default AddEstateModal;