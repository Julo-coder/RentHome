import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';



const AddContractModal = ({ isOpen, onClose, onUpdate, userId }) => {
    const [estates, setEstates] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [formData, setFormData] = useState({
        contract_number: '',
        estate_id: '',
        tenant_id: '',
        rental_price: '',
        charges: '',
        rent: ''
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [estatesRes, tenantsRes] = await Promise.all([
                    fetch(`http://localhost:8081/estates/user/${userId}`, {
                        credentials: 'include'
                    }),
                    fetch(`http://localhost:8081/tenants`, {
                        credentials: 'include'
                    })
                ]);

                if (!estatesRes.ok || !tenantsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [estatesData, tenantsData] = await Promise.all([
                    estatesRes.json(),
                    tenantsRes.json()
                ]);

                setEstates(estatesData);
                setTenants(tenantsData);
            } catch (error) {
                setError(error.message);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, userId]);

    const handleChange = (e) => {
        if (e.target.name === 'contract_number') {
            // Allow format XXX/YYYY/XXX
            const value = e.target.value;
            // Remove any characters that aren't numbers or forward slash
            const cleaned = value.replace(/[^0-9/]/g, '');
            
            // Format the input
            let formatted = cleaned;
            const parts = cleaned.split('/');
            
            if (parts.length <= 3) {
                if (parts[0] && parts[0].length > 3) parts[0] = parts[0].slice(0, 3);
                if (parts[1] && parts[1].length > 4) parts[1] = parts[1].slice(0, 4);
                if (parts[2] && parts[2].length > 3) parts[2] = parts[2].slice(0, 3);
                
                formatted = parts.join('/');
            }
            
            setFormData({ ...formData, contract_number: formatted });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8081/contracts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create contract');
            }

            setSuccessMessage('Contract created successfully!');
            setFormData({
                contract_number: '',  // Reset contract number
                estate_id: '',
                tenant_id: '',
                rental_price: '',
                charges: '',
                rent: ''
            });

            if (onUpdate) {
                await onUpdate();
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Contract"
        >
            <h2 className="modal-title">Add New Contract</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <form onSubmit={handleSubmit} className="modal-form">
                <input
                    type="text"
                    name="contract_number"
                    value={formData.contract_number}
                    placeholder="Contract Number (e.g., 001/2023/001)"
                    onChange={handleChange}
                    className="modal-input"
                    pattern="\d{3}/\d{4}/\d{3}"
                    title="Contract number must be in format: XXX/YYYY/XXX"
                    required
                />

                <select
                    name="estate_id"
                    value={formData.estate_id}
                    onChange={handleChange}
                    className="modal-input"
                    required
                >
                    <option value="">Select Estate</option>
                    {estates.map(estate => (
                        <option key={estate.id} value={estate.id}>
                            {estate.address}
                        </option>
                    ))}
                </select>

                <select
                    name="tenant_id"
                    value={formData.tenant_id}
                    onChange={handleChange}
                    className="modal-input"
                    required
                >
                    <option value="">Select Tenant</option>
                    {tenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>
                            {tenant.name} {tenant.surname}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    name="rental_price"
                    value={formData.rental_price}
                    placeholder="Rental Price (PLN)"
                    onChange={handleChange}
                    className="modal-input"
                    min="0"
                    step="0.01"
                    required
                />

                <input
                    type="number"
                    name="charges"
                    value={formData.charges}
                    placeholder="Charges (PLN)"
                    onChange={handleChange}
                    className="modal-input"
                    min="0"
                    step="0.01"
                    required
                />

                <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    placeholder="Rent Duration (months)"
                    onChange={handleChange}
                    className="modal-input"
                    min="1"
                    required
                />

                <div className="modal-buttons">
                    <button 
                        type="submit" 
                        className="modal-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Contract'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="modal-close"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddContractModal;