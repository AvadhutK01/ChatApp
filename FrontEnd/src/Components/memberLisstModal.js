import React from 'react';

const MemberListModal = ({ showModal, closeModal, members, onAddMember }) => {
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
                            <ul className="list-group">
                                {members.map((member, index) => (
                                    <li className="list-group-item d-flex justify-content-between" key={index}>
                                        {member.ContactName}
                                        <button className="btn btn-primary" onClick={() => onAddMember(member.memberId)}>
                                            Add
                                        </button>
                                    </li>
                                ))}
                            </ul>
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
