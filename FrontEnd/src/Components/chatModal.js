import React, { useState } from 'react';

const ChatModal = ({
    isModalOpen,
    onClose,
    groupName,
    onGroupNameChange,
    contactName,
    onContactNameChange,
    phoneNumber,
    onPhoneNumberChange,
    onAddContact,
    onAddGroup
}) => {
    const [activeButton, setActiveButton] = useState('contact');
    const handleClose = async () => {
        onClose();
        setActiveButton('contact');
    }
    const handleAddContact = async () => {
        try {
            await onAddContact();
            setActiveButton('contact');
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddGroup = async () => {
        try {
            await onAddGroup();
            setActiveButton('group');
            onClose();
        } catch (error) {
            console.error(error);
        }
    };
    return (
        isModalOpen && (
            <div className="modal show" id="memberModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" style={{ display: 'block' }}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Add {activeButton === 'contact' ? 'Contact' : 'Group'}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={onClose}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="btn-group mb-3" role="group">
                                <button type="button" className={`btn btn-${activeButton === 'contact' ? 'primary' : 'secondary'}`} onClick={() => setActiveButton('contact')}>Add Contact</button>
                                <button type="button" className={`btn btn-${activeButton === 'group' ? 'primary' : 'secondary'}`} onClick={() => setActiveButton('group')}>Add Group</button>
                            </div>
                            <form>
                                {activeButton === 'contact' && (
                                    <div className="form-group">
                                        <input type="text" className="form-control" id="contactName" placeholder="Enter contact name" value={contactName} onChange={onContactNameChange} />
                                    </div>
                                )}
                                {activeButton === 'contact' && (
                                    <div className="form-group">
                                        <input type="number" className="form-control" id="phoneNumber" placeholder="Enter phone number" value={phoneNumber} onChange={onPhoneNumberChange} />
                                    </div>
                                )}
                                {activeButton === 'group' && (
                                    <div className="form-group">
                                        <input type="text" className="form-control" id="groupName" placeholder="Enter group name" value={groupName} onChange={onGroupNameChange} />
                                    </div>
                                )}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleClose}>Close</button>
                                    {activeButton === 'contact' && (
                                        <button type="button" className="btn btn-primary" onClick={handleAddContact}>Save Contact</button>
                                    )}
                                    {activeButton === 'group' && (
                                        <button type="button" className="btn btn-primary" onClick={handleAddGroup}>Save Group</button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default ChatModal;
