import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';

Modal.setAppElement('#root');

const EditEstateModal = ({ isOpen, onClose, estateId, onUpdate }) => {
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        postal_code: '',
        people: '',
        max_person: '',
        area: ''
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pobranie szczegółów mieszkania z API
    const fetchEstateData = useCallback(async () => {
        try {
            console.log(`Fetching estate data for ID: ${estateId}`);
            
            const response = await fetch(`http://localhost:8081/estates/edit/${estateId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch estate data: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched data:", data);
            setFormData(data);
            setError(null);
        } catch (err) {
            setError('Error loading estate data');
            console.error('Error:', err);
        }
    }, [estateId]);

    useEffect(() => {
        if (isOpen && estateId) {
            fetchEstateData();
        }
    }, [isOpen, estateId, fetchEstateData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            console.log("Submitting form data:", formData);

            const response = await fetch(`http://localhost:8081/estates/edit/${estateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    people: parseInt(formData.people) || 0,
                    max_person: parseInt(formData.max_person) || 0,
                    area: parseFloat(formData.area) || 0
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update estate');
            }

            const updatedEstate = await response.json();
            console.log("Updated data:", updatedEstate);

            setFormData(updatedEstate);
            onClose(); // Zamknięcie modalu
            onUpdate && onUpdate(); // Odświeżenie listy mieszkań
        } catch (err) {
            console.error('Error updating estate:', err);
            setError(err.message || 'Failed to update estate. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Estate"
        >
            <h2 className="modal-title">Edit Estate</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="modal-input" required />
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="modal-input" required />
                <input type="number" name="postal_code" value={formData.postal_code} onChange={handleChange} className="modal-input" required />
                <input type="number" name="people" value={formData.people} onChange={handleChange} className="modal-input" required />
                <input type="number" name="max_person" value={formData.max_person} onChange={handleChange} className="modal-input" required />
                <input type="number" name="area" value={formData.area} onChange={handleChange} className="modal-input" required />
                <div className="modal-buttons">
                    <button type="submit" className="modal-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={onClose} className="modal-close" disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditEstateModal;
