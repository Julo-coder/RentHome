import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';


const ContractDetailsModal = ({ isOpen, onClose, userId, onUpdate }) => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Użyj useCallback, aby funkcja była stabilna między renderowaniami
    const fetchContracts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/contracts/user/${userId}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch contracts');
            const data = await response.json();
            setContracts(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [userId]); // userId jest zależnością, ponieważ używamy jej w fetchu

    useEffect(() => {
        if (isOpen && userId) {
            fetchContracts();
        }
    }, [isOpen, userId, fetchContracts]); // Dodaj fetchContracts do tablicy zależności

    const handleDeleteContract = async (contractNumber) => {
        setIsDeleting(true);
        try {
            const encodedContractNumber = contractNumber.replace(/\//g, '---');
            const response = await fetch(`http://localhost:8081/contracts/${encodedContractNumber}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to delete contract');
            await fetchContracts(); // <-- pobierz kontrakty na nowo
            if (onUpdate) await onUpdate(); // <-- odśwież statystyki w profilu
        } catch (error) {
            setError(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Contract Details"
            className="modal-content contract-details-modal"
        >
            <h2 className="modal-title">Contract Details</h2>
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <div className="loading-message">Loading contracts...</div>
            ) : (
                <div className="contracts-list">
                    {contracts.map(contract => (
                        <div key={contract.contract_number} className="contract-item">
                            <div className="contract-header">
                                <h3>Contract #{contract.contract_number}</h3>
                                <div className="contract-actions">
                                    <span className="contract-duration">{contract.rent} months</span>
                                    <button 
                                        onClick={() => handleDeleteContract(contract.contract_number)}
                                        className="delete-btn"
                                        disabled={isDeleting}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="contract-info">
                                <p><strong>Estate:</strong> {contract.address}</p>
                                <p><strong>Tenant:</strong> {contract.tenant_name} {contract.tenant_surname}</p>
                                <p><strong>Phone:</strong> {contract.tenant_phone}</p>
                                <p><strong>Rental Price:</strong> {contract.rental_price} zł</p>
                                <p><strong>Charges:</strong> {contract.charges} zł</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="modal-buttons">
                <button onClick={onClose} className="modal-close">Close</button>
            </div>
        </Modal>
    );
};

export default ContractDetailsModal;