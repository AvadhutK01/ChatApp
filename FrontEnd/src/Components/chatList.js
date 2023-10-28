import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

const ChatList = ({ chats, onChatClick, onMenuClick }) => {
    const [latestMessages, setLatestMessages] = useState([]);

    useEffect(() => {
        const fetchLatestMessages = async () => {
            const latestMessagesArray = [];
            try {

                for (const chat of chats) {
                    try {
                        const latestMessage = await getLatestMessage(chat.memberId);
                        if (latestMessage) {
                            latestMessagesArray.push({
                                chatId: chat.id,
                                message: latestMessage.messageText,
                                time: moment(latestMessage.date, 'DD/MM/YYYY, hh:mm:ss A').format('MMMM Do YYYY, h:mm a')
                            });
                        } else {
                            latestMessagesArray.push({
                                chatId: chat.id,
                                message: 'No messages yet',
                                time: 'N/A'
                            });
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
                setLatestMessages(latestMessagesArray);
            } catch (error) {
                console.log(error)
            }
            finally {
                // setTimeout(fetchLatestMessages, 1000);
            }
        };

        fetchLatestMessages();
    }, [chats]);
    // setInterval(()=>{
    //     fetchLatestMessages()
    // })
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
            console.error(error);
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
            console.error(error);
            return [];
        }
    };
    return (
        <div className="lg:w-1/3 chat-list border-r border-gray-300" id="chat-div">
            <div className="p-4 bg-white rounded">
                <input type="search" className="form-control rounded mb-4" placeholder="Search" />
                <div className="fixed bottom-10">
                    <button className="bg-purple-500 text-white py-2 px-3 mb-3 rounded-circle shadow-lg"
                        id="add-member" onClick={onMenuClick}>
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
                <ul className="list-unstyled chat-list overflow-y-auto h-96" id="chat-list">
                    {chats.map(chat => {
                        const latestMessageInfo = latestMessages.find(item => item.chatId === chat.id);
                        const messageTime = latestMessageInfo ? moment(latestMessageInfo.time, 'MMMM Do YYYY, h:mm:ss a') : null;
                        const isToday = messageTime && messageTime.isSame(moment(), 'day');
                        const formattedTime = latestMessageInfo && messageTime.isValid() ? (isToday ? messageTime.format('h:mm a') : messageTime.format('MMMM Do YYYY')) : 'N/A';
                        return (
                            <li key={chat.id} className="p-2 border-b border-gray-200 flex justify-between items-center">
                                <button className="flex justify-between items-center w-full chat-button" onClick={() => onChatClick(chat.memberId, chat.name, chat.type)}>
                                    <div className="flex items-center">
                                        <div className="pr-4">
                                            <p className="font-semibold mb-0">{chat.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {latestMessageInfo ? latestMessageInfo.message : 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-xs text-gray-500 mb-1">
                                            {formattedTime}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>

            </div>
        </div>
    );
};

export default ChatList;
