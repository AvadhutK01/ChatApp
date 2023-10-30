import React, { useState, useEffect } from 'react';
import ChatList from './chatList';
import ChatBox from './chatBox';
import isEqual from 'lodash/isEqual';
import ChatModal from './chatModal';
import axios from 'axios';
import MemberLisstModal from './memberLisstModal';
import io from 'socket.io-client';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
const socket = io(process.env.REACT_APP_BACKEND_HOST_NAME);
const ChatMain = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [contactName, setContactName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState([])
    const [displayName, setDisplayName] = useState('');
    const [memberId, setMemberId] = useState('');
    const [type, setType] = useState('');
    const [latestMessageFromMember, setlatestMessageFromMember] = useState([]);
    const [chatIdofMember, setchatIdofMember] = useState('');
    const [isAdmin, setAdmin] = useState(false);
    const [isListOpen, setIsLIstOpen] = useState(false);
    const [MemberList, setMembersList] = useState([]);
    const [action, setAction] = useState('');
    const userId = localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')).userid : null
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const result = await axios.get(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/getChatList`, {
                    headers: {
                        "Authorization": token
                    }
                });
                setChats(result.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {
        socket.on('receive-message', (data) => {
            if (data.type === 'one') {
                const receivedMessage = {
                    messageText: data.messageText,
                    date: data.date,
                    userDatumId: data.userDatumId,
                    recipeintId: data.recipeintId
                };
                if (selectedChat.length === 0 || !isEqual(selectedChat[selectedChat.length - 1], receivedMessage)) {
                    setSelectedChat(prevChat => [...prevChat, receivedMessage]);
                    setlatestMessageFromMember({
                        chatId: chatIdofMember,
                        message: data.messageText,
                        time: data.date
                    })
                }
            }
            else if (data.type === 'many') {
                const receivedMessage = {
                    messageText: data.messageText,
                    date: data.date,
                    senderId: data.senderId,
                    GroupNameDatumId: data.GroupNameDatumId
                };
                if (selectedChat.length === 0 || !isEqual(selectedChat[selectedChat.length - 1], receivedMessage)) {
                    setSelectedChat(prevChat => [...prevChat, receivedMessage]);
                    setlatestMessageFromMember({
                        chatId: chatIdofMember,
                        message: data.messageText,
                        time: data.date
                    })
                }
            }
        });
        return () => {
            socket.off('receive-message');
        };
    }, [type, memberId, selectedChat, chatIdofMember]);
    useEffect(() => {
        if (memberId && type) {
            fetchChat(memberId);
        }
    }, [type, memberId]);
    const handleChatClick = async (chatId, displayName, type, id) => {
        try {
            setType(type);
            await fetchChat(chatId);
            setDisplayName(displayName);
            setchatIdofMember(id);
        } catch (err) {
            console.log(err);
        }
    };
    // console.log(chatIdofMember)
    const handleAddGroup = async () => {
        try {
            const data = { Groupname: groupName };
            await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-group`, { data }, {
                headers: {
                    "Authorization": localStorage.getItem('token')
                }
            });
            setGroupName('');
        } catch (error) {
            console.log(error)
        }

    };
    const handleAddContact = async () => {
        try {
            const data = { name: contactName, phone_number: phoneNumber };
            await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-contact`, { data }, {
                headers: {
                    "Authorization": localStorage.getItem('token')
                }
            });
            setContactName('');
            setPhoneNumber('');
        } catch (error) {
            console.log(error)
        }

    };
    const handleMessageSubmit = async (messageText) => {
        const currentDateTime = moment().format('DD/MM/YYYY, hh:mm:ss A')
        const data = { memberId: memberId, messageText: messageText, currentDateTime: currentDateTime };
        if (type === 'one') {
            await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-message`, { data }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            const messageData = { recipeintId: memberId, date: currentDateTime, messageText: messageText, userDatumId: userId, type: type }
            socket.emit('send-message', messageData);
        }
        else if (type === 'many') {
            await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/add-messagetoGroup`, { data }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            const messageData = { GroupNameDatumId: memberId, date: currentDateTime, messageText: messageText, senderId: userId, type: type }
            socket.emit('send-message', messageData);
        }
    };

    const PerformActionToGroup = async (ListMemberId, action, contactName) => {
        const data = { memberId: ListMemberId, groupId: memberId, contactName: contactName, action: action };
        await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/actionOnGroup`, { data }, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
    }

    const handleGroupNameChange = (e) => {
        setGroupName(e.target.value);
    };

    const handleContactNameChange = (e) => {
        setContactName(e.target.value);
    };

    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleListClose = () => {
        setIsLIstOpen(false);
    }
    async function fetchMembers(action) {
        const token = localStorage.getItem('token');
        const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/getMembersList`, { action, memberId }, {
            headers: {
                "Authorization": token
            }
        });
        setMembersList(result.data);
    }
    async function fetchChat(chatId) {
        setMemberId(chatId);
        if (type === 'one') {
            const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/get-chat`, {
                memberId: chatId
            }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            if (result) {
                setMemberId(chatId);
                setSelectedChat(result.data);
                // console.log(result.data)
            }
            else {
                setSelectedChat([]);
            }
        }
        else if (type === 'many') {
            const result = await axios.post(`${process.env.REACT_APP_BACKEND_HOST_NAME}/chat/get-chatfromGroup`, {
                groupId: chatId
            }, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });

            if (result.data.isAdmin) {
                setAdmin(true);
            }

            if (result.data.result) {
                setMemberId(chatId);
                setSelectedChat(result.data.result);
                // console.log(result.data.result)
            } else {
                setSelectedChat([]);
            }

        }
    }
    return (
        <div className="bg-gray-100">
            <header className="bg-purple-500 text-white text-center py-2 fixed top-0 w-full">
                Chat App
            </header>
            <div className="pt-16 w-full">
                <div className="container mx-auto flex flex-col lg:flex-row">
                    <ChatList
                        chats={chats}
                        onChatClick={handleChatClick}
                        onMenuClick={() => setIsModalOpen(true)}
                        latestMessageFromMember={latestMessageFromMember}
                    />
                    {selectedChat && (
                        <ChatBox
                            displayName={displayName}
                            chatContent={selectedChat}
                            memberId={memberId}
                            type={type}
                            isAdmin={isAdmin}
                            onMessageSubmit={handleMessageSubmit}
                            onMenuClick={
                                (action) => {
                                    setAction(action)
                                    fetchMembers(action)
                                    setIsLIstOpen(true)
                                }
                            }
                        />
                    )}
                    <ChatModal
                        isModalOpen={isModalOpen}
                        onClose={handleModalClose}
                        onAddContact={handleAddContact}
                        onAddGroup={handleAddGroup}
                        onGroupNameChange={handleGroupNameChange}
                        onContactNameChange={handleContactNameChange}
                        onPhoneNumberChange={handlePhoneNumberChange}
                        groupName={groupName}
                        contactName={contactName}
                        phoneNumber={phoneNumber}
                    />
                    <MemberLisstModal
                        showModal={isListOpen}
                        closeModal={handleListClose}
                        members={MemberList}
                        action={action}
                        onAddMember={PerformActionToGroup}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatMain;
