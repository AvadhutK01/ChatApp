import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../AuthProviders/AuthContext';

const ChatList = ({ chats, onChatClick, onMenuClick, latestMessageFromMember }) => {
    const [latestMessages, setLatestMessages] = useState([]);
    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).userid : null
    const { logout } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [filteredChats, setFilteredChats] = useState([]);

    useEffect(() => {
        setFilteredChats(chats);
    }, [chats]);
    useEffect(() => {
        try {
            if (latestMessageFromMember) {
                const updatedMessages = latestMessages.map(messageInfo => {
                    if (latestMessageFromMember.senderId) {
                        if (messageInfo.userId === latestMessageFromMember.GroupNameDatumId) {
                            if (latestMessageFromMember.fileUrl && latestMessageFromMember.fileName) {
                                return {
                                    userId: latestMessageFromMember.GroupNameDatumId,
                                    senderId: latestMessageFromMember.senderId,
                                    chatId: messageInfo.chatId,
                                    message: "File",
                                    time: moment(latestMessageFromMember.time, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                };
                            }
                            if (!latestMessageFromMember.fileUrl && !latestMessageFromMember.fileName) {
                                return {
                                    userId: latestMessageFromMember.GroupNameDatumId,
                                    senderId: latestMessageFromMember.senderId,
                                    chatId: messageInfo.chatId,
                                    message: latestMessageFromMember.message,
                                    time: moment(latestMessageFromMember.time, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                };
                            }
                        }
                        return messageInfo;
                    }

                    if (latestMessageFromMember.recipeintId) {
                        if (messageInfo.recipeintId === latestMessageFromMember.recipeintId || latestMessageFromMember.userDatumId === messageInfo.recipeintId) {
                            if (latestMessageFromMember.fileName && latestMessageFromMember.fileUrl) {
                                return {
                                    userId: latestMessageFromMember.userDatumId,
                                    recipeintId: latestMessageFromMember.recipeintId,
                                    chatId: messageInfo.chatId,
                                    message: "File",
                                    time: moment(latestMessageFromMember.time, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                };
                            }
                            if (!latestMessageFromMember.fileName && !latestMessageFromMember.fileUrl) {
                                return {
                                    userId: latestMessageFromMember.userDatumId,
                                    recipeintId: latestMessageFromMember.recipeintId,
                                    chatId: messageInfo.chatId,
                                    message: latestMessageFromMember.message,
                                    time: moment(latestMessageFromMember.time, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                };
                            }
                        }
                    }
                    return messageInfo;
                });
                setLatestMessages([...updatedMessages]);
            }
        }
        catch (err) {
            toast.error("Internal Server Error!", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }, [latestMessageFromMember]);

    useEffect(() => {
        const fetchLatestMessages = async () => {
            const latestMessagesArray = [];
            try {
                for (const chat of chats) {
                    try {
                        const latestMessage = await getLatestMessage(chat.memberId);
                        if (latestMessage) {
                            if (latestMessage.recipeintId) {
                                if (latestMessage.fileName && latestMessage.fileUrl) {
                                    latestMessagesArray.push({
                                        chatId: chat.id,
                                        userId: latestMessage.userDatumId,
                                        recipeintId: latestMessage.recipeintId,
                                        message: "File",
                                        time: moment(latestMessage.date, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                    });
                                }
                                if (!latestMessage.fileName && !latestMessage.fileUrl) {
                                    latestMessagesArray.push({
                                        chatId: chat.id,
                                        userId: latestMessage.userDatumId,
                                        recipeintId: latestMessage.recipeintId,
                                        message: latestMessage.messageText,
                                        time: moment(latestMessage.date, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                    });

                                }
                            } else if (latestMessage.senderId) {
                                if (latestMessage.fileName && latestMessage.fileUrl) {
                                    latestMessagesArray.push({
                                        chatId: chat.id,
                                        userId: latestMessage.GroupNameDatumId,
                                        senderId: latestMessage.senderId,
                                        message: "File",
                                        time: moment(latestMessage.date, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                    });
                                }
                                if (!latestMessage.fileName && !latestMessage.fileUrl) {
                                    latestMessagesArray.push({
                                        chatId: chat.id,
                                        userId: latestMessage.GroupNameDatumId,
                                        senderId: latestMessage.senderId,
                                        message: latestMessage.messageText,
                                        time: moment(latestMessage.date, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                                    });
                                }
                            }
                        } else {
                            latestMessagesArray.push({
                                chatId: chat.id,
                                message: 'No messages yet',
                                time: 'N/A'
                            });
                        }
                    } catch (error) {
                        toast.error("Internal Server Error!", {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    }
                }
                setLatestMessages(latestMessagesArray);
            } catch (error) {
                toast.error("Internal Server Error!", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        };

        fetchLatestMessages();
    }, [chats]);
    const getLatestMessage = async (memberId) => {
        try {
            const chatMessages = await getChatMessagesForMemberId(memberId);
            chatMessages.sort((a, b) => {
                const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm:ss A');
                const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm:ss A');
                return dateB - dateA;
            });
            return chatMessages[0];
        } catch (error) {
            toast.error("Internal Server Error!", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return null;
        }
    };
    const getChatMessagesForMemberId = async (memberId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/get-latestchat`, { memberId: memberId }, {
                headers: {
                    'Authorization': token
                }
            });
            return response.data;
        } catch (error) {
            toast.error("Internal Server Error!", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return [];
        }
    };
    const handleLogout = () => {
        logout();
    };

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearchClick = () => {
        const filteredChats = chats.filter(chat =>
            chat.name.toLowerCase().includes(searchInput.toLowerCase())
        );
        setFilteredChats(filteredChats);
    }

    return (
        <div className="lg:w-1/3 chat-list border-r border-gray-300 flex flex-col justify-between">
            <div className="p-4 bg-white rounded">
                <div className="mb-3 flex">
                    <div className="navbar-nav ml-auto">
                        <div className="d-flex align-items-center pe-2">
                            <button className="btn btn-outline-danger" onClick={handleLogout}>
                                <i className="fa-solid fa-power-off"></i>
                            </button>
                        </div>
                    </div>
                    <input
                        type="text"
                        className="border border-gray-300 p-2 rounded-md focus:outline-none focus:border-purple-500"
                        placeholder="Search..."
                        value={searchInput}
                        onChange={handleSearchInputChange}
                    />
                    <button className="bg-purple-500 text-white py-2 px-3 ml-2 rounded-md shadow-lg" onClick={handleSearchClick}>
                        <i className="fa fa-search"></i>
                    </button>
                </div>
                <div className="fixed bottom-10">
                    <button
                        className="bg-purple-500 text-white py-2 px-3 mb-3 rounded-circle shadow-lg"
                        id="add-member"
                        onClick={onMenuClick}
                    >
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
                <ul className="list-unstyled chat-list overflow-y-auto h-96" id="chat-list">
                    {filteredChats.map((chat) => {
                        let latestMessageInfo;
                        if (chat.id) {
                            latestMessageInfo = latestMessages.find(
                                (item) => item.chatId === chat.id
                            );
                        }
                        const messageTime = latestMessageInfo
                            ? moment(latestMessageInfo.time, 'MMMM Do YYYY, h:mm:ss a')
                            : null;
                        const isToday =
                            messageTime && messageTime.isSame(moment(), 'day');
                        const formattedTime =
                            latestMessageInfo && messageTime.isValid()
                                ? isToday
                                    ? messageTime.format('h:mm a')
                                    : messageTime.format('MMMM Do YYYY')
                                : 'N/A';
                        let matchedIsMessage = null;
                        if (chat.type === 'many') {
                            if (chat.isMessage) {
                                const foundMessage = chat.isMessage.find(
                                    (message) => message.userDatumId === userId
                                );
                                if (foundMessage) {
                                    matchedIsMessage = foundMessage.isMessage;
                                }
                            }
                        }
                        return (
                            chat.id !== undefined && (
                                <li
                                    key={chat.id}
                                    className="p-2 border-b border-gray-200 flex justify-between items-center"
                                >
                                    <button
                                        className="flex justify-between items-center w-full chat-button"
                                        onClick={() =>
                                            onChatClick(
                                                chat.memberId,
                                                chat.name,
                                                chat.type,
                                                chat.id,
                                                chat.profiePicture
                                            )
                                        }
                                    >
                                        <div className="flex items-center">
                                            <div className="pr-4">
                                                <img
                                                    src={chat.profiePicture}
                                                    alt="avatar 1"
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="font-semibold mb-0">{chat.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {latestMessageInfo
                                                        ? latestMessageInfo.message
                                                        : 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {(matchedIsMessage ? matchedIsMessage === true : chat.isMessage === true) && (
                                                <p className="bg-danger rounded-full px-1 text-sm">N</p>
                                            )}
                                            <div className="text-xs text-gray-500 mb-1">
                                                {formattedTime}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            )
                        );
                    })}
                </ul>
            </div>
        </div>
    );

};

export default ChatList;