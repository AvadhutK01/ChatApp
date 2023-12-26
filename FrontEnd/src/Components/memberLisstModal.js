import { React, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
const MemberListModal = ({ showModal, closeModal, action, members, onGroupActionClick, onContactActionClick }) => {
    const [contactName, setContactName] = useState('');
    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).userid : null
    const handleSaveContact = () => {
        onContactActionClick(contactName);
        closeModal();
    };
    return (
        showModal && (
            <div className="modal fade show" style={{ display: 'block' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Member List</h5>
                            <button type="button" className="close" onClick={closeModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <>
                                {
                                    action === 'saveContact' && (
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="contactName"
                                                value={contactName}
                                                onChange={(e) => setContactName(e.target.value)}
                                                placeholder='Enter Contact Name'
                                            />
                                            <button className="btn btn-primary mt-2" onClick={handleSaveContact}>
                                                Save Contact
                                            </button>
                                        </div>
                                    )
                                }
                                {action === 'Deletecontact' && (
                                    <div> <p>Are you sure you want to delete this Contact?</p>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-danger" onClick={() => {
                                                onContactActionClick('');
                                                closeModal();
                                            }}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                                }

                                {action === 'leaveGroup' && (
                                    <div> <p>Are you sure you want to delete this Group?</p>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                                Cancel
                                            </button>
                                            <button type="button" className="btn btn-danger" onClick={() => {
                                                onGroupActionClick("", action, "")
                                                closeModal();
                                            }}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                                }


                            </>
                            <>
                                {
                                    (
                                        action === 'addMember' ||
                                        action === 'removeMember' ||
                                        action === 'setAdmin'
                                    ) && (

                                        <ul className="list-group">{
                                            action === 'addMember' && (
                                                <>
                                                    {members.map((member, index) => (

                                                        <li className="list-group-item d-flex justify-content-between" key={index}>
                                                            {member.ContactName}
                                                            <button className="btn btn-primary" onClick={() => onGroupActionClick(member.memberId, action, member.ContactName)}>
                                                                Add
                                                            </button>
                                                        </li>
                                                    )
                                                    )}
                                                </>
                                            )}
                                            {
                                                action === 'removeMember' && (
                                                    <>
                                                        {members.map((member, index) => (
                                                            member.userDatumId !== userId && (
                                                                <li className="list-group-item d-flex justify-content-between" key={index}>
                                                                    {member.ContactName}
                                                                    <button className="btn btn-primary" onClick={() => onGroupActionClick(member.userDatumId, action)}>
                                                                        Remove
                                                                    </button>
                                                                </li>
                                                            )))}
                                                    </>
                                                )}
                                            {
                                                action === 'setAdmin' && (
                                                    <>
                                                        {members.map((member, index) => (
                                                            <li className="list-group-item d-flex justify-content-between" key={index}>
                                                                {member.ContactName}
                                                                <button className="btn btn-primary" onClick={() => onGroupActionClick(member.userDatumId, action)}>
                                                                    Set Admin
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </>
                                                )}
                                        </ul>
                                    )
                                }
                            </>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default MemberListModal;
