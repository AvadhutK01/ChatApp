import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
const ChatBox = ({ memberId, displayName, profilePicture, chatContent, onMessageSubmit, onFileSubmit, onMenuClick, type, isAdmin, onChatTypeClick }) => {
    const [messageText, setMessageText] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [chatType, setChatType] = useState('todayChat')
    const formattedDate = (date) => {
        return moment(date, 'DD/MM/YYYY, hh:mm:ss A').format('DD/MM/YYYY | hh:mm A');
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onMessageSubmit(messageText);
        setMessageText('');
    };

    const handlePaperClipClick = (e) => {
        e.preventDefault();
        document.getElementById('fileInput').click();
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            onFileSubmit(selectedFile)
        }
        document.getElementById('fileInput').value = '';
    }

    const handleMenuItemClick = (action) => {
        onMenuClick(action)
        setMenuVisible(false);
    };
    const handleMenuClick = () => {
        setMenuVisible(!menuVisible);
    };
    const handleChatTypeClick = () => {
        const newChatType = chatType === 'todayChat' ? 'archiveChat' : 'todayChat';
        setChatType(newChatType);
        onChatTypeClick(newChatType);
    };
    const buttonText = chatType === 'todayChat' ? 'Archived Chat' : 'Today Chat';
    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).userid : null
    return (
        <div className="lg:w-2/3 chat-box" id="myChatId">
            {memberId && (
                <div className="text-center bg-white rounded border-1 h-12 d-flex justify-content-between align-items-center p-2">
                    {
                        profilePicture && (<img src={profilePicture}
                            alt="avatar 1" className="w-12 h-12 rounded-full" />)
                    }
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
                                <button className="btn btn-primary btn-sm" onClick={handleChatTypeClick}>{buttonText}</button>
                                <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('leaveGroup')}>Leave Group</button>
                            </div>
                        )}

                        {
                            menuVisible && (type == 'one' && (
                                <div className="menu">
                                    <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('saveContact')}>Save contact</button>
                                    <button className="btn btn-primary btn-sm" onClick={handleChatTypeClick}>{buttonText}</button>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleMenuItemClick('Deletecontact')}>Delete Contact</button>
                                </div>
                            ))
                        }

                    </div>
                </div>)}
            {memberId && (
                <div className="p-4 bg-white chat-box-content" id="chat-box-content">
                    {chatContent.map((message, index) => (
                        (type === 'one' && (
                            <div key={index} className={`flex flex-row justify-${message.recipeintId === memberId ? 'end' : 'start'} pb-2`}>
                                {message.fileUrl && message.fileName && (
                                    <div className="flex items-center bg-gray-100 text-gray-700 p-3 rounded-md ms-5 shadow-md">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold ">{message.fileName}</p>
                                            <p className="text-xs text-gray-600">{formattedDate(message.date)}</p>
                                        </div>
                                        <a
                                            href={message.fileUrl}
                                            download={message.fileName}
                                        // className=""
                                        >
                                            <i className="fas fa-download mr-1"></i>
                                        </a>
                                    </div>
                                )}
                                {!message.fileUrl && !message.fileName && (
                                    <div className={`bg-gray-100 text-gray-700 p-3 rounded-md ms-5 shadow-md`}>
                                        <p className="text-sm font-semibold">{message.messageText}</p>
                                        <p className="text-xs text-gray-600 float-right">{formattedDate(message.date)}</p>
                                    </div>
                                )}
                            </div>


                        )) ||
                        (type === 'many' && (
                            <div key={index} className={`d-flex flex-row justify-content-${message.senderId === userId ? 'end' : 'start'} pb-2`}>
                                {message.fileUrl && message.fileName && (
                                    <div className="flex items-center bg-gray-200 p-2 rounded-md ms-3">
                                        <div className="flex-1">
                                            <p className="text-xs">{message.userName}</p>
                                            <p className="text-xs">{message.fileName}</p>
                                            <p className="text-xs text-gray-500">{formattedDate(message.date)}</p>
                                        </div>
                                        <a
                                            href={message.fileUrl}
                                            download={message.fileName}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <i className="fas fa-download mr-1"></i>
                                        </a>
                                    </div>
                                )}
                                {!message.fileUrl && !message.fileName && (
                                    <div className={`bg-gray-200 p-2 rounded-md ms-3`}>
                                        <p className="text-xs">{message.userName}</p>
                                        <p className="text-xs">{message.messageText}</p>
                                        <p className="text-xs text-gray-500 float-right">{formattedDate(message.date)}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ))}
                </div>)}
            {memberId && (<input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
            />)}
            {memberId && (
                <div className="p-4 bg-white sticky bottom-0">
                    <div className="flex items-center">
                        <input type="text" className="form-control flex-1 mr-4" placeholder="Type message"
                            value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                        <button type="button" className="bg-purple-500 text-white py-2 px-4 me-2 rounded" onClick={handlePaperClipClick}>
                            <i className="fas fa-paperclip"></i>
                        </button>
                        <button type="submit" className="bg-purple-500 text-white py-2 px-4 rounded" onClick={handleSubmit}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>)}
        </div >
    );
};

export default ChatBox;

