import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

const ChatBox = ({ memberId, displayName, profilePicture, chatContent, onMessageSubmit, onFileSubmit, onMenuClick, type, isAdmin, onChatTypeClick, onBackButtonClick }) => {
    const [messageText, setMessageText] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const chatBoxRef = useRef(null);

    const handleEmojiSelect = (emoji) => {
        setMessageText((prevMessageText) => prevMessageText + emoji.native);
    };
    useEffect(() => {
        setMenuVisible(false)
    }, [memberId])
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chatContent]);

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
        <div className="lg:w-2/3 chat-list border-r border-gray-300" id="myChatId" ref={chatBoxRef}>
            {memberId && (
                <div className="text-center bg-white rounded border-1 h-12 d-flex align-items-center justify-content-between p-2 sticky top-0">
                    <div className="d-flex align-items-center">
                        {windowWidth <= 1016 && (<button onClick={onBackButtonClick}><i className="fa fa-arrow-left" aria-hidden="true"></i></button>)}
                        <img src={profilePicture} alt="avatar 1" className="w-12 h-12 rounded-full" />
                        <div className="font-bold text-lg text-purple-500" id="DisplayName">{displayName}</div>
                        <div id="boxy"></div>
                    </div>
                    <div className="d-flex align-items-center position-relative">
                        <button onClick={handleMenuClick}><i className="fa-solid fa-ellipsis-vertical"></i></button>
                        {menuVisible && type === 'many' && (
                            <div className="menu position-absolute top-100 end-0 bg-white border rounded p-2">
                                {isAdmin && (
                                    <>
                                        <button className="btn btn-primary menu-item btn-sm mt-2" onClick={() => handleMenuItemClick('addMember')}>Add Member</button>
                                        <button className="btn btn-primary menu-item btn-sm mt-2" onClick={() => handleMenuItemClick('setAdmin')}>Set Admin</button>
                                        <button className="btn btn-primary menu-item btn-sm mt-2" onClick={() => handleMenuItemClick('removeMember')}>Remove Member</button>
                                    </>
                                )}
                                <button className="btn btn-primary menu-item btn-sm mt-2" onClick={handleChatTypeClick}>{buttonText}</button>
                                <button className="btn btn-primary menu-item btn-sm mt-2" onClick={() => handleMenuItemClick('leaveGroup')}>Leave Group</button>
                            </div>
                        )}

                        {menuVisible && (type === 'one' && (
                            <div className="menu position-absolute top-100 end-0 bg-white border rounded p-2">
                                <div className="btn btn-primary menu-item mt-2 btn-sm" onClick={() => handleMenuItemClick('saveContact')}>Save contact</div>
                                <div className="btn btn-primary  menu-item mt-2 btn-sm" onClick={handleChatTypeClick}>{buttonText}</div>
                                <div className="btn btn-primary  menu-item mt-2 btn-sm" onClick={() => handleMenuItemClick('Deletecontact')}>Delete Contact</div>
                            </div>
                        ))}
                    </div>
                </div>)}
            {memberId && (
                <div className="p-4 bg-white chat-box-content" id="chat-box-content">
                    {chatContent.map((message, index) => (
                        (type === 'one' && (
                            <div key={index} className={`flex flex-row justify-${message.recipeintId === memberId ? 'end' : 'start'} pb-2`}>
                                {message.fileUrl && message.fileName && (
                                    <div className="flex items-center bg-gray-100 text-gray-700 p-3 rounded-md shadow-md">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold ">{message.fileName}</p>
                                            <p className="text-xs text-gray-600">{formattedDate(message.date)}</p>
                                        </div>
                                        <a
                                            href={message.fileUrl}
                                            download={message.fileName}
                                        >
                                            <i className="fas fa-download mr-1"></i>
                                        </a>
                                    </div>
                                )}
                                {!message.fileUrl && !message.fileName && (
                                    <div className={`bg-gray-100 text-gray-700 p-3 rounded-md shadow-md`}>
                                        <p className="text-sm font-semibold">{message.messageText}</p>
                                        <p className="text-xs text-gray-600 float-right">{formattedDate(message.date)}</p>
                                    </div>
                                )}
                            </div>
                        )) ||
                        (type === 'many' && (
                            <div key={index} className={`d-flex flex-row justify-content-${message.senderId === userId ? 'end' : 'start'} pb-2`}>
                                {message.fileUrl && message.fileName && (
                                    <div className="flex items-center bg-gray-200 p-2 rounded-md    ">
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
                                    <div className={`bg-gray-200 p-2 rounded-md`}>
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
                    {showEmojiPicker && (
                        <div style={{ position: 'fixed', top: '115px', zIndex: '999' }}>
                            <Picker
                                data={data}
                                onEmojiSelect={handleEmojiSelect}
                            />
                        </div>

                    )}
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="bg-purple-500 text-white py-2 px-4 me-2 rounded"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <i className="far fa-smile"></i>
                        </button>
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