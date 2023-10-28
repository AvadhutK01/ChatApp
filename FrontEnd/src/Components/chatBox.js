import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
const ChatBox = ({ memberId, displayName, chatContent, onMessageSubmit, onMenuClick, type, isAdmin }) => {
    const [messageText, setMessageText] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const formattedDate = (date) => {
        return moment(date, 'DD/MM/YYYY, hh:mm:ss A').format('DD/MM/YYYY | hh:mm A');
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onMessageSubmit(messageText);
        setMessageText('');
    };
    const handleMenuItemClick = (action) => {
        onMenuClick(action)
        setMenuVisible(false);
    };
    const handleMenuClick = () => {
        setMenuVisible(!menuVisible);
    };
    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).userid : null
    return (
        <div className="lg:w-2/3 chat-box" id="myChatId">
            <div className="text-center bg-white rounded border-1 h-7 d-flex justify-content-between align-items-center p-2">
                <span className="font-bold text-lg text-purple-500" id="DisplayName">{displayName}</span>
                <div id="boxy">
                </div>
                <div className="d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        className="bi bi-three-dots-vertical cursor-pointer" id="clickableIcon" viewBox="0 0 16 16" onClick={handleMenuClick}>
                        <path
                            d="M11 8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0-5a1 1 0 0 1-1 1H6a1 1 0 0 1 0-2h4a1 1 0 0 1 1 1zm0 10a1 1 0 0 1-1 1H6a1 1 0 0 1 0-2h4a1 1 0 0 1 1 1z" />
                    </svg>
                    {menuVisible && type === 'many' && (
                        <div className="menu">
                            {isAdmin && (
                                <>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('addMember')}>Add Member</button>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('setAdmin')}>Set Admin</button>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('removeMember')}>Remove Member</button>
                                </>
                            )}
                            <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('leaveGroup')}>Leave Group</button>
                        </div>
                    )}

                    {
                        menuVisible && (type == 'one' && (
                            <div className="menu">
                                <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('addMember')}>Save contact</button>
                                <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('removeMember')}>Delete Contact</button>
                            </div>
                        ))
                    }

                </div>
            </div>
            <div className="p-4 bg-white chat-box-content" id="chat-box-content">
                {chatContent.map((message, index) => (
                    (type === 'one' && (
                        <div key={index} className={`d-flex flex-row justify-content-${message.recipeintId === memberId ? 'end' : 'start'} pb-2`}>
                            {message.recipeintId !== memberId && (
                                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                    alt="avatar 1" className="w-12 h-12 rounded-full" />
                            )}
                            <div className={`bg-gray-200 p-2 rounded-md ms-3`}>
                                <p className="text-xs">{message.messageText}</p>
                                <p className="text-xs text-gray-500 float-right">{formattedDate(message.date)}</p>
                            </div>
                            {message.recipeintId === memberId && (
                                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                    alt="avatar 1" className="w-12 h-12 rounded-full" />
                            )}
                        </div>
                    )) ||
                    (type === 'many' && (
                        <div key={index} className={`d-flex flex-row justify-content-${message.senderId === userId ? 'end' : 'start'} pb-2`}>
                            {message.recipientId !== memberId && (
                                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                    alt="avatar 1" className="w-12 h-12 rounded-full" />
                            )}
                            <div className={`bg-gray-200 p-2 rounded-md ms-3`}>
                                <p className="text-xs">{message.messageText}</p>
                                <p className="text-xs text-gray-500 float-right">{formattedDate(message.date)}</p>
                            </div>
                            {message.recipientId === memberId && (
                                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                    alt="avatar 1" className="w-12 h-12 rounded-full" />
                            )}
                        </div>
                    ))
                ))}
            </div>
            <div className="p-4 bg-white sticky bottom-0">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center">
                        <input type="text" className="form-control flex-1 mr-4" placeholder="Type message"
                            value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                        <button type="submit" className="bg-purple-500 text-white py-2 px-4 rounded"><i className="fas fa-paper-plane"></i></button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatBox;

