import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import EditEstateModal from './EditEstateModal';
import AddUsageModal from './AddUsageModal';
import UsageCharts from './UsageCharts';
import AddEquipmentModal from './AddEquipmentModal';
import EqList from './EqList';
import Popup from './Popup';

export default function Details() {
    const [estate, setEstate] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usageHistory, setUsageHistory] = useState([]);
    const { estateId } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddUsageModalOpen, setIsAddUsageModalOpen] = useState(false);
    const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
    const [isEquipmentListOpen, setIsEquipmentListOpen] = useState(false);
    const [deletePopupOpen, setDeletePopupOpen] = useState(false);

    const fetchEstateDetails = useCallback(async () => {
        try {
            const [estateResponse, usageResponse, historyResponse] = await Promise.all([
                fetch(`http://localhost:8081/estates/${estateId}`, {
                    credentials: 'include'
                }),
                fetch(`http://localhost:8081/estate-usage/${estateId}`, {
                    credentials: 'include'
                }),
                fetch(`http://localhost:8081/estate-usage/${estateId}/history`, {
                    credentials: 'include'
                })
            ]);

            if (!estateResponse.ok) {
                if (estateResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch estate details');
            }

            const estateData = await estateResponse.json();
            setEstate(estateData);

            if (usageResponse.ok) {
                const usageData = await usageResponse.json();
                setUsage(usageData);
                console.log('Usage data:', usageData);
            }

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setUsageHistory(historyData);
                console.log('History data:', historyData);
            } else {
                console.error('History response not ok:', await historyResponse.json());
            }

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [estateId, navigate]);

    useEffect(() => {
        fetchEstateDetails();
    }, [fetchEstateDetails]);

    const handleEditEstate = () => {
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = useCallback(() => {
        fetchEstateDetails(); // Odśwież dane po udanej aktualizacji
    }, [fetchEstateDetails]);

    const handleDeleteEstate = () => {
        setDeletePopupOpen(true);
    };

    const confirmDeleteEstate = async () => {
        try {
            const response = await fetch(`http://localhost:8081/estates/${estateId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete estate');
            }

            // Po pomyślnym usunięciu, przekieruj do listy nieruchomości
            navigate('/estate');
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setDeletePopupOpen(false);
        }
    };

    if (loading) return <div className="loading-div">Loading...</div>;
    if (error) return <div className="error-div">Error: {error}</div>;
    if (!estate) return <div className="not-found-div">Estate not found</div>;

    const detailsNav = [
        { label: "Back to Estates", to: "/estate" },
        { label: "Edit Estate", to: "#", onClick: handleEditEstate },
        { label: "Add Usage", to: "#", onClick: () => setIsAddUsageModalOpen(true) },
        { label: "Add Equipment", to: "#", onClick: () => setIsAddEquipmentModalOpen(true) },
        { label: "Delete Estate", to: "#", onClick: handleDeleteEstate, className: "delete-btn" }
    ];

    return (
        <div className="details-container">
            <Header navItems={detailsNav} />
            
            <div className="estate-details-card">
                <h2>Estate Details</h2>
                <div className="details-grid">
                    <div className="info-section">
                        <div className="info-header">
                            <h3>Basic Information</h3>
                            <button 
                                onClick={() => setIsEquipmentListOpen(true)}
                                className="show-equipment-btn"
                            >
                                Show Equipment
                            </button>
                        </div>
                        <p><strong>Address:</strong> {estate.address}</p>
                        <p><strong>City:</strong> {estate.city}</p>
                        <p><strong>Postal Code:</strong> {estate.postal_code}</p>
                        <p><strong>Area:</strong> {estate.area} m²</p>
                        <p><strong>Occupancy:</strong> {estate.people}/{estate.max_person}</p>
                    </div>

                    {usage && (
                        <div className="usage-section">
                            <h3>Utility Usage</h3>
                            <div className="usage-grid">
                                <div className="usage-card">
                                    <h4>Water</h4>
                                    <p>{usage.water_usage} m³</p>
                                </div>
                                <div className="usage-card">
                                    <h4>Electricity</h4>
                                    <p>{usage.electricity_usage} kWh</p>
                                </div>
                                <div className="usage-card">
                                    <h4>Gas</h4>
                                    <p>{usage.gas_usage} m³</p>
                                </div>
                            </div>
                            <UsageCharts usageData={usageHistory} />
                        </div>
                    )}
                </div>
            </div>

            <EqList
                isOpen={isEquipmentListOpen}
                onClose={() => setIsEquipmentListOpen(false)}
                estateId={estateId}
            />

            <EditEstateModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateSuccess}
                estateId={estateId}
            />

            <AddUsageModal
                isOpen={isAddUsageModalOpen}
                onClose={() => setIsAddUsageModalOpen(false)}
                onUpdate={fetchEstateDetails}
                estateId={estateId}
            />

            <AddEquipmentModal
                isOpen={isAddEquipmentModalOpen}
                onClose={() => setIsAddEquipmentModalOpen(false)}
                onUpdate={fetchEstateDetails}
                estateId={estateId}
            />

            <Popup
                isOpen={deletePopupOpen}
                title="Delete Estate"
                message="Are you sure you want to delete this estate? This will also delete all contracts, equipment, and usage data associated with it. This action cannot be undone."
                onConfirm={confirmDeleteEstate}
                onCancel={() => setDeletePopupOpen(false)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isDanger={true}
            />
        </div>
    );
}